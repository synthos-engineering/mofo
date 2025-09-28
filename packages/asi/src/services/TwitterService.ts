import { EventEmitter } from 'eventemitter3';
import { TwitterClient } from '../twitter/twitter-api';
import { Config } from '../twitter/types';
import { logger } from '../utils/logger';

/**
 * TwitterService - Clean wrapper for Twitter MCP integration
 * Uses the existing TwitterClient for personality extraction
 */
export class TwitterService extends EventEmitter {
  private client: TwitterClient | null = null;
  private config: any;

  constructor(config: any) {
    super();
    this.config = config;
  }

  async initialize() {
    // Only initialize if Twitter credentials are configured
    if (!this.config.twitter?.apiKey) {
      logger.warn('Twitter API not configured, using mock personality data');
      return;
    }

    try {
      const twitterConfig: Config = {
        apiKey: this.config.twitter.apiKey,
        apiSecretKey: this.config.twitter.apiSecret,
        accessToken: this.config.twitter.accessToken,
        accessTokenSecret: this.config.twitter.accessSecret
      };

      this.client = new TwitterClient(twitterConfig);
      logger.info('Twitter Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Twitter Service:', error);
    }
  }

  async extractPersonality(username: string) {
    // Remove @ if present
    const cleanUsername = username.replace('@', '');

    if (!this.client) {
      logger.warn('Twitter client not initialized, returning default personality');
      return this.getDefaultPersonality();
    }

    try {
      logger.info(`Extracting personality for @${cleanUsername}`);

      // Use the enhanced TwitterClient method
      const personality = await this.client.extractPersonality(cleanUsername);

      // Emit event for tracking
      this.emit('personality:extracted', {
        username: cleanUsername,
        personality,
        timestamp: new Date().toISOString()
      });

      return personality;

    } catch (error) {
      logger.error(`Failed to extract personality for @${cleanUsername}:`, error);
      return this.getDefaultPersonality();
    }
  }

  private getDefaultPersonality() {
    return {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.3,
      interests: [],
      humor: 0.5,
      emotionalIntelligence: 0.5,
      communicationStyle: 'balanced',
      source: 'default',
      confidence: 0.1,
      timestamp: new Date().toISOString()
    };
  }

  async searchTweets(query: string, count: number = 50) {
    if (!this.client) {
      logger.warn('Twitter client not initialized');
      return { tweets: [], users: [] };
    }

    try {
      return await this.client.searchTweets(query, count);
    } catch (error) {
      logger.error('Failed to search tweets:', error);
      return { tweets: [], users: [] };
    }
  }

  // Check if service is available
  isAvailable(): boolean {
    return this.client !== null;
  }

  // Get service status
  getStatus() {
    return {
      available: this.isAvailable(),
      configured: !!this.config.twitter?.apiKey,
      mode: this.client ? 'api' : 'mock'
    };
  }
}