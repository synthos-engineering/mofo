import { TwitterApi } from 'twitter-api-v2';
import { Config, TwitterError, Tweet, TwitterUser, PostedTweet } from './types';

export class TwitterClient {
  private client: TwitterApi;
  private rateLimitMap = new Map<string, number>();

  constructor(config: Config) {
    this.client = new TwitterApi({
      appKey: config.apiKey,
      appSecret: config.apiSecretKey,
      accessToken: config.accessToken,
      accessSecret: config.accessTokenSecret,
    });

    console.error('Twitter API client initialized');
  }

  /**
   * Extract personality from Twitter user - for ASI integration
   */
  async extractPersonality(username: string) {
    try {
      // Get user details
      const user = await this.getUserByUsername(username);

      // Fetch user's tweets for analysis
      const tweets = await this.getUserTweets(user.id, 100);

      // Analyze for personality
      const personality = this.analyzePersonality({
        user,
        tweets,
        metrics: this.analyzeEngagement(tweets)
      });

      return personality;
    } catch (error) {
      console.error('Failed to extract Twitter personality:', error);
      return this.getDefaultPersonality();
    }
  }

  private async getUserByUsername(username: string) {
    const response = await this.client.v2.userByUsername(username, {
      'user.fields': ['created_at', 'description', 'public_metrics', 'verified']
    });

    if (!response.data) {
      throw new TwitterError(`User @${username} not found`, 'user_not_found', 404);
    }

    return {
      id: response.data.id,
      username: response.data.username,
      name: response.data.name,
      description: response.data.description,
      metrics: response.data.public_metrics,
      verified: response.data.verified || false
    };
  }

  private async getUserTweets(userId: string, count: number) {
    const response = await this.client.v2.userTimeline(userId, {
      max_results: count,
      'tweet.fields': ['created_at', 'public_metrics', 'entities', 'context_annotations'],
      exclude: ['retweets']
    });

    const tweets = [];
    for await (const tweet of response) {
      tweets.push({
        id: tweet.id,
        text: tweet.text,
        metrics: tweet.public_metrics,
        createdAt: tweet.created_at,
        entities: tweet.entities,
        context: tweet.context_annotations
      });
    }
    return tweets;
  }

  private analyzePersonality(data: any) {
    const { user, tweets } = data;

    // Content analysis
    const content = this.analyzeContent(tweets);

    // Social patterns
    const social = this.analyzeSocialPatterns(user, tweets);

    // Map to Big Five personality traits
    return {
      openness: this.calculateOpenness(content, tweets),
      conscientiousness: this.calculateConscientiousness(content),
      extraversion: this.calculateExtraversion(social, user),
      agreeableness: this.calculateAgreeableness(content),
      neuroticism: this.calculateNeuroticism(content),

      // Additional traits for dating
      interests: this.extractInterests(tweets),
      humor: this.detectHumorLevel(tweets),
      emotionalIntelligence: this.calculateEQ(content),
      communicationStyle: this.analyzeCommunicationStyle(tweets),

      // Metadata
      source: 'twitter',
      confidence: Math.min(0.3 + (tweets.length / 100) * 0.7, 0.95),
      timestamp: new Date().toISOString()
    };
  }

  private analyzeContent(tweets: any[]) {
    const emotions = new Map<string, number>();
    const topics = new Map<string, number>();
    let positivity = 0;

    tweets.forEach(tweet => {
      // Extract emotions
      const emotion = this.detectEmotion(tweet.text);
      emotions.set(emotion, (emotions.get(emotion) || 0) + 1);

      // Extract topics from context annotations
      if (tweet.context) {
        tweet.context.forEach((ann: any) => {
          const topic = ann.domain?.name || 'general';
          topics.set(topic, (topics.get(topic) || 0) + 1);
        });
      }

      // Sentiment
      positivity += this.calculateSentiment(tweet.text);
    });

    return {
      emotions: Object.fromEntries(emotions),
      topics: Object.fromEntries(topics),
      avgPositivity: positivity / tweets.length,
      topicalDiversity: topics.size
    };
  }

  private analyzeSocialPatterns(user: any, tweets: any[]) {
    const totalEngagement = tweets.reduce((sum, t) =>
      sum + (t.metrics?.like_count || 0) + (t.metrics?.retweet_count || 0), 0);

    return {
      followRatio: user.metrics?.followers_count / (user.metrics?.following_count + 1),
      engagementRate: totalEngagement / tweets.length,
      networkSize: user.metrics?.followers_count > 10000 ? 'large' :
                   user.metrics?.followers_count > 1000 ? 'medium' : 'small'
    };
  }

  private analyzeEngagement(tweets: any[]) {
    const total = tweets.reduce((sum, t) =>
      sum + (t.metrics?.like_count || 0) +
      (t.metrics?.retweet_count || 0) +
      (t.metrics?.reply_count || 0), 0);

    return {
      totalEngagement: total,
      avgEngagement: total / tweets.length
    };
  }

  // Personality calculation helpers
  private calculateOpenness(content: any, tweets: any[]): number {
    const diversity = Math.min(content.topicalDiversity / 10, 1);
    const questions = tweets.filter(t => t.text.includes('?')).length / tweets.length;
    return Math.min(0.3 + diversity * 0.4 + questions * 0.3, 1);
  }

  private calculateConscientiousness(content: any): number {
    return Math.min(0.5 + content.avgPositivity * 0.3, 1);
  }

  private calculateExtraversion(social: any, user: any): number {
    const size = social.networkSize === 'large' ? 0.8 : 0.5;
    const engagement = Math.min(social.engagementRate / 100, 1);
    return Math.min(0.3 + size * 0.3 + engagement * 0.4, 1);
  }

  private calculateAgreeableness(content: any): number {
    return Math.min(0.3 + content.avgPositivity * 0.7, 1);
  }

  private calculateNeuroticism(content: any): number {
    const volatility = Object.keys(content.emotions).length > 5 ? 0.5 : 0.2;
    return Math.min(0.2 + volatility * 0.5, 0.7);
  }

  private extractInterests(tweets: any[]): string[] {
    const interests = new Map<string, number>();

    tweets.forEach(tweet => {
      if (tweet.context) {
        tweet.context.forEach((ann: any) => {
          const entity = ann.entity?.name;
          if (entity) {
            interests.set(entity, (interests.get(entity) || 0) + 1);
          }
        });
      }
    });

    return Array.from(interests.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([interest]) => interest);
  }

  private detectHumorLevel(tweets: any[]): number {
    const indicators = ['lol', 'haha', '😂', 'funny'];
    const count = tweets.filter(t =>
      indicators.some(ind => t.text.toLowerCase().includes(ind))
    ).length;
    return Math.min(count / tweets.length * 2, 1);
  }

  private calculateEQ(content: any): number {
    const emotionalDiversity = Object.keys(content.emotions).length / 5;
    return Math.min(0.3 + emotionalDiversity * 0.4 + content.avgPositivity * 0.3, 1);
  }

  private analyzeCommunicationStyle(tweets: any[]): string {
    const avgLength = tweets.reduce((sum, t) => sum + t.text.length, 0) / tweets.length;
    if (avgLength > 200) return 'detailed';
    if (avgLength < 50) return 'concise';
    return 'balanced';
  }

  private detectEmotion(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('love') || lower.includes('amazing')) return 'love';
    if (lower.includes('happy') || lower.includes('excited')) return 'joy';
    if (lower.includes('sad')) return 'sadness';
    if (lower.includes('angry')) return 'anger';
    return 'neutral';
  }

  private calculateSentiment(text: string): number {
    const positive = ['good', 'great', 'love', 'happy', 'amazing'];
    const negative = ['bad', 'hate', 'terrible', 'sad', 'angry'];

    let score = 0.5;
    positive.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 0.1;
    });
    negative.forEach(word => {
      if (text.toLowerCase().includes(word)) score -= 0.1;
    });

    return Math.max(0, Math.min(1, score));
  }

  private getDefaultPersonality() {
    return {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.3,
      interests: [],
      source: 'default',
      confidence: 0.1
    };
  }

  async postTweet(text: string, replyToTweetId?: string): Promise<PostedTweet> {
    try {
      const endpoint = 'tweets/create';
      await this.checkRateLimit(endpoint);

      const tweetOptions: any = { text };
      if (replyToTweetId) {
        tweetOptions.reply = { in_reply_to_tweet_id: replyToTweetId };
      }

      const response = await this.client.v2.tweet(tweetOptions);
      
      console.error(`Tweet posted successfully with ID: ${response.data.id}${replyToTweetId ? ` (reply to ${replyToTweetId})` : ''}`);
      
      return {
        id: response.data.id,
        text: response.data.text
      };
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async searchTweets(query: string, count: number): Promise<{ tweets: Tweet[], users: TwitterUser[] }> {
    try {
      const endpoint = 'tweets/search';
      await this.checkRateLimit(endpoint);

      const response = await this.client.v2.search(query, {
        max_results: count,
        expansions: ['author_id'],
        'tweet.fields': ['public_metrics', 'created_at'],
        'user.fields': ['username', 'name', 'verified']
      });

      console.error(`Fetched ${response.tweets.length} tweets for query: "${query}"`);

      const tweets = response.tweets.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id ?? '',
        metrics: {
          likes: tweet.public_metrics?.like_count ?? 0,
          retweets: tweet.public_metrics?.retweet_count ?? 0,
          replies: tweet.public_metrics?.reply_count ?? 0,
          quotes: tweet.public_metrics?.quote_count ?? 0
        },
        createdAt: tweet.created_at ?? ''
      }));

      const users = response.includes.users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        verified: user.verified ?? false
      }));

      return { tweets, users };
    } catch (error) {
      this.handleApiError(error);
    }
  }

  private async checkRateLimit(endpoint: string): Promise<void> {
    const lastRequest = this.rateLimitMap.get(endpoint);
    if (lastRequest) {
      const timeSinceLastRequest = Date.now() - lastRequest;
      if (timeSinceLastRequest < 1000) { // Basic rate limiting
        throw new TwitterError(
          'Rate limit exceeded',
          'rate_limit_exceeded',
          429
        );
      }
    }
    this.rateLimitMap.set(endpoint, Date.now());
  }

  private handleApiError(error: unknown): never {
    if (error instanceof TwitterError) {
      throw error;
    }

    // Handle twitter-api-v2 errors
    const apiError = error as any;
    if (apiError.code) {
      throw new TwitterError(
        apiError.message || 'Twitter API error',
        apiError.code,
        apiError.status
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in Twitter client:', error);
    throw new TwitterError(
      'An unexpected error occurred',
      'internal_error',
      500
    );
  }
}