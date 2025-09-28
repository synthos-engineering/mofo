import { EventEmitter } from 'eventemitter3';
import axios from 'axios';
import { logger } from '../utils/logger';
import { MeTTaEngine } from './MeTTaEngine';

/**
 * VirtualDatingOrchestrator manages autonomous agent-to-agent dating sessions
 * Agents chat independently using ASI LLM and report back compatibility
 */
export class VirtualDatingOrchestrator extends EventEmitter {
  private activeDates: Map<string, any> = new Map();
  private mettaEngine: MeTTaEngine;
  private config: any;

  constructor(config: any) {
    super();
    this.config = config;
    this.mettaEngine = new MeTTaEngine(config);
  }

  async initializeVirtualDate(user1: any, user2: any) {
    logger.info(`Initializing virtual date between ${user1.userId} and ${user2.userId}`);

    const dateId = `date_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create virtual date session
    const dateSession = {
      id: dateId,
      participants: {
        agent1: {
          userId: user1.userId,
          agentAddress: user1.agentAddress,
          personality: user1.personality,
          status: 'ready'
        },
        agent2: {
          userId: user2.userId,
          agentAddress: user2.agentAddress,
          personality: user2.personality,
          status: 'ready'
        }
      },
      conversation: [],
      metrics: {
        messageCount: 0,
        responseTime: [],
        emotionalAlignment: [],
        topicDepth: [],
        engagementScore: 0
      },
      status: 'initializing',
      startTime: new Date().toISOString(),
      duration: 15 * 60 * 1000, // 15 minutes default
      result: null
    };

    this.activeDates.set(dateId, dateSession);

    // Generate conversation starters based on personalities
    const topics = await this.generateConversationStarters(
      user1.personality,
      user2.personality
    );

    // Initialize agents for autonomous conversation
    await this.setupAgentConversation(dateSession, topics);

    // Start the virtual date
    await this.startVirtualDate(dateId);

    return dateId;
  }

  private async generateConversationStarters(personality1: any, personality2: any) {
    // Use MeTTa to generate personalized conversation starters

    const sharedInterests = this.findSharedInterests(personality1, personality2);
    const complementaryTraits = this.findComplementaryTraits(personality1, personality2);

    const starters = [
      {
        topic: 'icebreaker',
        prompt: this.generateIcebreaker(personality1, personality2),
        expectedDuration: 2
      },
      {
        topic: 'shared_interest',
        prompt: `Let's talk about ${sharedInterests[0] || 'life'}. What draws you to it?`,
        expectedDuration: 5
      },
      {
        topic: 'values_exploration',
        prompt: 'What values are most important to you in life and relationships?',
        expectedDuration: 5
      },
      {
        topic: 'creative_scenario',
        prompt: this.generateCreativeScenario(personality1, personality2),
        expectedDuration: 3
      }
    ];

    return starters;
  }

  private async setupAgentConversation(session: any, topics: any[]) {
    // Configure agents for autonomous conversation

    const agent1Config = {
      agentAddress: session.participants.agent1.agentAddress,
      personality: session.participants.agent1.personality,
      conversationStyle: this.determineConversationStyle(session.participants.agent1.personality),
      topics: topics,
      partnerProfile: this.createPartnerProfile(session.participants.agent2.personality)
    };

    const agent2Config = {
      agentAddress: session.participants.agent2.agentAddress,
      personality: session.participants.agent2.personality,
      conversationStyle: this.determineConversationStyle(session.participants.agent2.personality),
      topics: topics,
      partnerProfile: this.createPartnerProfile(session.participants.agent1.personality)
    };

    // Send configuration to agents via Agentverse
    await this.configureAgent(agent1Config);
    await this.configureAgent(agent2Config);
  }

  private async startVirtualDate(dateId: string) {
    const session = this.activeDates.get(dateId);
    if (!session) throw new Error(`Date session ${dateId} not found`);

    session.status = 'active';
    logger.info(`Virtual date ${dateId} started`);

    // Start autonomous conversation
    this.emit('date:started', { dateId, participants: session.participants });

    // Initiate first message
    await this.sendFirstMessage(session);

    // Monitor conversation
    this.monitorConversation(dateId);

    // Set timeout for date completion
    setTimeout(() => {
      this.completeVirtualDate(dateId);
    }, session.duration);
  }

  private async sendFirstMessage(session: any) {
    // Agent 1 sends the first message
    const firstMessage = await this.generateAgentMessage(
      session.participants.agent1,
      null,
      'greeting'
    );

    session.conversation.push({
      sender: session.participants.agent1.agentAddress,
      content: firstMessage.content,
      emotion: firstMessage.emotion,
      timestamp: new Date().toISOString()
    });

    // Send to Agent 2
    await this.sendMessageToAgent(
      session.participants.agent2.agentAddress,
      firstMessage
    );

    // Agent 2 responds
    this.scheduleAgentResponse(session, session.participants.agent2, firstMessage);
  }

  private async generateAgentMessage(agent: any, previousMessage: any, intent: string) {
    // Use ASI LLM to generate personality-consistent messages

    const prompt = this.buildMessagePrompt(agent.personality, previousMessage, intent);

    const response = await axios.post(
      `${this.config.asillm.endpoint}/generate`,
      {
        prompt,
        agentId: agent.agentAddress,
        maxTokens: 150,
        temperature: this.calculateTemperature(agent.personality),
        personality: agent.personality
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.asillm.apiKey}`
        }
      }
    ).catch(error => {
      logger.warn('ASI LLM unavailable, using fallback');
      return { data: this.generateFallbackMessage(agent, intent) };
    });

    return {
      content: response.data.message || response.data,
      emotion: this.detectMessageEmotion(response.data.message || response.data),
      intent: intent,
      confidence: response.data.confidence || 0.8
    };
  }

  private buildMessagePrompt(personality: any, previousMessage: any, intent: string): string {
    const basePrompt = `You are on a virtual date. Your personality:
- Openness: ${personality.openness}
- Extraversion: ${personality.extraversion}
- Agreeableness: ${personality.agreeableness}
- Communication style: ${personality.communicationStyle}
- Current emotion: ${personality.currentEmotion || 'curious'}

Intent: ${intent}
`;

    if (previousMessage) {
      return `${basePrompt}
Your date said: "${previousMessage.content}"
Respond authentically based on your personality. Be genuine and engaging.`;
    }

    return `${basePrompt}
Start the conversation with a warm, personality-appropriate greeting.`;
  }

  private async sendMessageToAgent(agentAddress: string, message: any) {
    // Send message through Agentverse protocol
    try {
      await axios.post(
        `${this.config.agentverse.endpoint}/agents/${agentAddress}/message`,
        {
          message,
          protocol: 'virtual_dating_v1',
          apiKey: this.config.agentverse.apiKey
        }
      );
    } catch (error) {
      logger.error(`Failed to send message to ${agentAddress}:`, error);
    }
  }

  private scheduleAgentResponse(session: any, respondingAgent: any, message: any) {
    // Simulate natural conversation timing
    const responseDelay = this.calculateResponseDelay(respondingAgent.personality);

    setTimeout(async () => {
      const response = await this.generateAgentMessage(
        respondingAgent,
        message,
        'response'
      );

      // Add to conversation
      session.conversation.push({
        sender: respondingAgent.agentAddress,
        content: response.content,
        emotion: response.emotion,
        timestamp: new Date().toISOString()
      });

      // Update metrics
      this.updateConversationMetrics(session, response);

      // Continue conversation
      if (session.status === 'active' && session.conversation.length < 50) {
        const otherAgent = session.participants.agent1.agentAddress === respondingAgent.agentAddress
          ? session.participants.agent2
          : session.participants.agent1;

        this.scheduleAgentResponse(session, otherAgent, response);
      }
    }, responseDelay);
  }

  private calculateResponseDelay(personality: any): number {
    // Natural response timing based on personality
    const baseDelay = 3000; // 3 seconds

    // Extraverts respond faster
    const extraversion Factor = 1 - (personality.extraversion * 0.3);

    // High conscientiousness = more thoughtful responses
    const conscientiousnessFactor = 1 + (personality.conscientiousness * 0.2);

    return baseDelay * extraversion Factor * conscientiousnessFactor;
  }

  private monitorConversation(dateId: string) {
    const checkInterval = setInterval(() => {
      const session = this.activeDates.get(dateId);
      if (!session || session.status !== 'active') {
        clearInterval(checkInterval);
        return;
      }

      // Analyze conversation quality
      const analysis = this.analyzeConversationQuality(session);

      // Emit progress updates
      this.emit('date:progress', {
        dateId,
        messageCount: session.conversation.length,
        engagementScore: analysis.engagementScore,
        emotionalAlignment: analysis.emotionalAlignment
      });

      // Check if natural conclusion reached
      if (this.shouldConcludeDate(session, analysis)) {
        this.completeVirtualDate(dateId);
        clearInterval(checkInterval);
      }
    }, 30000); // Check every 30 seconds
  }

  private analyzeConversationQuality(session: any) {
    const messages = session.conversation;

    // Calculate engagement metrics
    const avgResponseLength = messages.reduce((sum: number, msg: any) =>
      sum + msg.content.length, 0) / messages.length;

    const emotionalVariety = new Set(messages.map((msg: any) => msg.emotion)).size;

    const questionCount = messages.filter((msg: any) =>
      msg.content.includes('?')).length;

    const engagementScore = Math.min(
      (avgResponseLength / 100) * 0.3 +
      (emotionalVariety / 5) * 0.3 +
      (questionCount / messages.length) * 0.4,
      1
    );

    // Calculate emotional alignment
    const emotionalAlignment = this.calculateEmotionalAlignment(messages);

    return {
      engagementScore,
      emotionalAlignment,
      avgResponseLength,
      questionRatio: questionCount / messages.length,
      emotionalVariety
    };
  }

  private calculateEmotionalAlignment(messages: any[]): number {
    // Check if emotions mirror and align
    let alignmentScore = 0;

    for (let i = 1; i < messages.length; i++) {
      if (messages[i].emotion === messages[i-1].emotion) {
        alignmentScore += 0.1;
      }
    }

    return Math.min(alignmentScore / messages.length, 1);
  }

  private shouldConcludeDate(session: any, analysis: any): boolean {
    // Natural conclusion conditions
    if (session.conversation.length > 40) return true;
    if (analysis.engagementScore < 0.3 && session.conversation.length > 10) return true;

    // Check for natural goodbye
    const lastMessage = session.conversation[session.conversation.length - 1];
    if (lastMessage?.content.toLowerCase().includes('goodbye') ||
        lastMessage?.content.toLowerCase().includes('nice talking')) {
      return true;
    }

    return false;
  }

  async completeVirtualDate(dateId: string) {
    const session = this.activeDates.get(dateId);
    if (!session) return;

    session.status = 'completed';
    session.endTime = new Date().toISOString();

    logger.info(`Virtual date ${dateId} completed`);

    // Calculate compatibility score
    const compatibility = await this.calculateDateCompatibility(session);

    // Generate date summary
    const summary = this.generateDateSummary(session, compatibility);

    session.result = {
      compatibility,
      summary,
      recommendation: this.generateRecommendation(compatibility),
      highlights: this.extractHighlights(session)
    };

    // Store results
    this.activeDates.set(dateId, session);

    // Emit completion event
    this.emit('date:completed', {
      dateId,
      result: session.result
    });

    return session.result;
  }

  private async calculateDateCompatibility(session: any): Promise<any> {
    const metrics = session.metrics;
    const analysis = this.analyzeConversationQuality(session);

    // Use MeTTa for deep compatibility analysis
    const mettaCompatibility = await this.mettaEngine.calculateCompatibility(
      session.participants.agent1.personality,
      session.participants.agent2.personality
    );

    // Combine behavioral and personality compatibility
    const behavioralScore = analysis.engagementScore * 0.4 +
                          analysis.emotionalAlignment * 0.3 +
                          (session.conversation.length / 30) * 0.3;

    const overallScore = (mettaCompatibility * 0.6 + behavioralScore * 0.4);

    return {
      overall: overallScore,
      personality: mettaCompatibility,
      behavioral: behavioralScore,
      factors: {
        engagement: analysis.engagementScore,
        emotionalAlignment: analysis.emotionalAlignment,
        conversationFlow: Math.min(session.conversation.length / 20, 1),
        responseQuality: analysis.avgResponseLength / 100
      }
    };
  }

  private generateDateSummary(session: any, compatibility: any): string {
    const p1 = session.participants.agent1;
    const p2 = session.participants.agent2;

    return `Virtual date between ${p1.userId} and ${p2.userId} showed ${
      compatibility.overall > 0.7 ? 'strong' :
      compatibility.overall > 0.5 ? 'moderate' : 'limited'
    } compatibility (${Math.round(compatibility.overall * 100)}%).

Key observations:
- Conversation quality: ${compatibility.factors.engagement > 0.7 ? 'Highly engaged' : 'Moderate engagement'}
- Emotional connection: ${compatibility.factors.emotionalAlignment > 0.6 ? 'Good emotional sync' : 'Different emotional styles'}
- Communication flow: ${session.conversation.length} messages exchanged
- Personality match: ${Math.round(compatibility.personality * 100)}% compatible

The conversation showed ${this.describeConversationDynamic(session)}.`;
  }

  private generateRecommendation(compatibility: any): string {
    if (compatibility.overall > 0.75) {
      return 'Strong match! Recommend proceeding to real date.';
    } else if (compatibility.overall > 0.6) {
      return 'Good potential. Suggest another virtual date to explore further.';
    } else if (compatibility.overall > 0.4) {
      return 'Some compatibility. May work as friends or with effort.';
    } else {
      return 'Limited compatibility. Consider other matches.';
    }
  }

  private extractHighlights(session: any): any[] {
    // Extract memorable moments from conversation
    return session.conversation
      .filter((msg: any) =>
        msg.emotion === 'joy' ||
        msg.content.includes('!') ||
        msg.content.length > 100
      )
      .slice(0, 3)
      .map((msg: any) => ({
        content: msg.content.substring(0, 100),
        emotion: msg.emotion,
        sender: msg.sender
      }));
  }

  private describeConversationDynamic(session: any): string {
    const messages = session.conversation;
    const avgLength = messages.reduce((sum: number, msg: any) =>
      sum + msg.content.length, 0) / messages.length;

    if (avgLength > 80 && messages.length > 20) {
      return 'deep, engaging discussions';
    } else if (messages.length > 30) {
      return 'good back-and-forth energy';
    } else if (avgLength < 30) {
      return 'brief, surface-level exchanges';
    } else {
      return 'balanced conversation';
    }
  }

  // Helper methods
  private findSharedInterests(p1: any, p2: any): string[] {
    const interests1 = new Set(p1.interests || []);
    const interests2 = new Set(p2.interests || []);

    return Array.from(interests1).filter(x => interests2.has(x));
  }

  private findComplementaryTraits(p1: any, p2: any): any {
    return {
      extraversion: Math.abs(p1.extraversion - p2.extraversion) > 0.3,
      thinking: p1.cognitiveStyle !== p2.cognitiveStyle,
      emotional: Math.abs(p1.emotionalIntelligence - p2.emotionalIntelligence) < 0.2
    };
  }

  private generateIcebreaker(p1: any, p2: any): string {
    const topics = [
      'If you could have dinner with anyone in history, who would it be?',
      'What\'s the most spontaneous thing you\'ve ever done?',
      'What\'s your idea of a perfect day?',
      'If you could master any skill instantly, what would it be?'
    ];

    return topics[Math.floor(Math.random() * topics.length)];
  }

  private generateCreativeScenario(p1: any, p2: any): string {
    const scenarios = [
      'If we were planning an adventure together, where would we go?',
      'Imagine we\'re co-creating something. What would it be?',
      'If we had to solve a mystery together, what roles would we play?'
    ];

    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  private determineConversationStyle(personality: any): string {
    if (personality.extraversion > 0.7) return 'enthusiastic';
    if (personality.agreeableness > 0.7) return 'warm';
    if (personality.openness > 0.7) return 'curious';
    return 'balanced';
  }

  private createPartnerProfile(personality: any): any {
    return {
      traits: {
        openness: personality.openness,
        extraversion: personality.extraversion
      },
      interests: personality.interests,
      communicationHints: this.generateCommunicationHints(personality)
    };
  }

  private generateCommunicationHints(personality: any): string[] {
    const hints = [];

    if (personality.extraversion < 0.4) {
      hints.push('Give them time to think before responding');
    }
    if (personality.emotionalIntelligence > 0.7) {
      hints.push('They appreciate emotional depth');
    }
    if (personality.openness > 0.7) {
      hints.push('They enjoy exploring new ideas');
    }

    return hints;
  }

  private configureAgent(config: any): Promise<any> {
    // Configure agent via Agentverse
    return axios.post(
      `${this.config.agentverse.endpoint}/agents/${config.agentAddress}/configure`,
      {
        config,
        apiKey: this.config.agentverse.apiKey
      }
    ).catch(error => {
      logger.error('Failed to configure agent:', error);
    });
  }

  private detectMessageEmotion(message: string): string {
    // Simple emotion detection
    const lower = message.toLowerCase();

    if (lower.includes('love') || lower.includes('wonderful')) return 'love';
    if (lower.includes('happy') || lower.includes('great')) return 'joy';
    if (lower.includes('interesting') || lower.includes('?')) return 'curious';
    if (lower.includes('thanks') || lower.includes('appreciate')) return 'grateful';

    return 'neutral';
  }

  private calculateTemperature(personality: any): number {
    // More creative personalities get higher temperature
    return 0.5 + (personality.creativity || 0.5) * 0.3;
  }

  private generateFallbackMessage(agent: any, intent: string): any {
    const messages = {
      greeting: 'Hello! It\'s nice to meet you. How are you doing today?',
      response: 'That\'s interesting! Tell me more about that.',
      question: 'What do you enjoy doing in your free time?'
    };

    return {
      message: messages[intent as keyof typeof messages] || messages.response,
      confidence: 0.5
    };
  }
}