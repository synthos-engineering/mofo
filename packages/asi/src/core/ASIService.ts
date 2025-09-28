import { EventEmitter } from 'eventemitter3';
import { Request, Response, NextFunction } from 'express';
import { ProxyService } from '../services/ProxyService';
import { WebSocketBridge } from '../services/WebSocketBridge';
import { AgentManager } from '../services/AgentManager';
import { EEGEnhancer } from '../services/EEGEnhancer';
import { MatchmakingService } from '../services/MatchmakingService';
import { QueueManager } from '../services/QueueManager';
import { AgentFactory } from '../services/AgentFactory';
import { VirtualDatingOrchestrator } from '../services/VirtualDatingOrchestrator';
import { TwitterService } from '../services/TwitterService';
import { MeTTaEngine } from '../services/MeTTaEngine';
import { PersonalityBuilder } from '../services/PersonalityBuilder';
import { logger } from '../utils/logger';

export class ASIService extends EventEmitter {
  private proxyService: ProxyService;
  private wsBridge: WebSocketBridge;
  private agentManager: AgentManager;
  private agentFactory: AgentFactory;
  private eegEnhancer: EEGEnhancer;
  private matchmaking: MatchmakingService;
  private queueManager: QueueManager;
  private virtualDating: VirtualDatingOrchestrator;
  private twitterService: TwitterService;
  private mettaEngine: MeTTaEngine;
  private personalityBuilder: PersonalityBuilder;
  private config: any;

  constructor(config: any) {
    super();
    this.config = config;

    // Initialize services
    this.proxyService = new ProxyService(config);
    this.wsBridge = new WebSocketBridge(config);
    this.agentManager = new AgentManager(config);
    this.agentFactory = new AgentFactory(config);
    this.eegEnhancer = new EEGEnhancer(config);
    this.matchmaking = new MatchmakingService(config);
    this.queueManager = new QueueManager(config);
    this.virtualDating = new VirtualDatingOrchestrator(config);
    this.twitterService = new TwitterService(config);
    this.mettaEngine = new MeTTaEngine(config);
    this.personalityBuilder = new PersonalityBuilder(config);
  }

  async initialize() {
    logger.info('Initializing ASI subsystems...');

    // Setup inter-service communication
    this.setupEventRouting();

    // Initialize each service
    await this.queueManager.initialize();
    await this.agentManager.initialize();
    await this.matchmaking.initialize();

    logger.info('ASI subsystems initialized');
  }

  async start() {
    // Start proxy service to intercept MOFO API calls
    await this.proxyService.start();

    // Connect to existing WebSocket services
    await this.wsBridge.connect();

    // Start agent management service
    await this.agentManager.start();

    // Setup event listeners for MOFO events
    this.setupMOFOIntegration();
  }

  private setupEventRouting() {
    // Route events between services
    this.proxyService.on('user:verified', async (data) => {
      logger.info('User verified, creating personalized ASI agent:', data);

      // Create personalized agent using Agentverse template
      const agentData = {
        userId: data.userId,
        worldId: data.worldId,
        walletAddress: data.walletAddress,
        twitterHandle: data.twitterHandle // Optional from user profile
      };

      const agent = await this.agentFactory.createPersonalizedAgent(agentData);
      this.emit('asi:agent:created', agent);
    });

    this.wsBridge.on('eeg:data', async (data) => {
      logger.info('EEG data received, processing with advanced ASI analysis...');

      // Extract personality from EEG
      const eegPersonality = await this.personalityBuilder.extractFromEEG(data);

      // Process with MeTTa for symbolic reasoning
      const mettaEnhanced = await this.mettaEngine.processPersonality({
        neural: eegPersonality,
        social: null
      });

      // Store for agent enhancement
      this.queueManager.addJob('enhanceAgent', {
        userId: data.userId,
        personality: mettaEnhanced
      });
    });

    this.wsBridge.on('scanner:connected', async (data) => {
      logger.info('Scanner connected, initiating EEG personality capture...');
      this.agentManager.notifyConnection(data);
    });

    // Virtual dating events
    this.matchmaking.on('matches:found', async (matches) => {
      logger.info('Matches found, initiating virtual dates...');

      for (const match of matches.slice(0, 3)) { // Top 3 matches
        const dateId = await this.virtualDating.initializeVirtualDate(
          match.user1,
          match.user2
        );

        this.emit('asi:virtualdate:started', { dateId, match });
      }
    });

    this.virtualDating.on('date:completed', (result) => {
      logger.info('Virtual date completed:', result);
      this.emit('asi:virtualdate:completed', result);
    });

    this.queueManager.on('job:complete', (job) => {
      this.handleJobComplete(job);
    });
  }

  private setupMOFOIntegration() {
    // Listen to MOFO app events without modifying their code

    // Intercept agent configuration requests
    this.proxyService.intercept('/api/agent/configure', async (req: Request, res: Response, next: NextFunction) => {
      const enhancedConfig = await this.agentManager.enhanceConfiguration(req.body);
      req.body = { ...req.body, ...enhancedConfig };
      next();
    });

    // Intercept matching requests
    this.proxyService.intercept('/api/matches', async (req: Request, res: Response, next: NextFunction) => {
      const matches = await this.matchmaking.findMatches(req.query);
      res.json({ matches, source: 'asi' });
    });

    // Listen to EEG WebSocket events
    this.wsBridge.on('eeg:session:complete', async (data) => {
      const analysis = await this.eegEnhancer.analyze(data);
      this.emit('asi:eeg:analysis', analysis);
    });
  }

  private async handleJobComplete(job: any) {
    switch (job.name) {
      case 'createAgent':
        logger.info('Agent created on ASI network:', job.result);
        this.wsBridge.broadcast('asi:agent:created', job.result);
        break;

      case 'enhanceEEG':
        logger.info('EEG analysis complete:', job.result);
        this.wsBridge.broadcast('asi:eeg:enhanced', job.result);
        break;

      case 'matchFound':
        logger.info('Match found via ASI:', job.result);
        this.wsBridge.broadcast('asi:match:found', job.result);
        break;
    }
  }

  async getStatus() {
    return {
      status: 'operational',
      services: {
        agentverse: this.config.agentverse.apiKey ? 'connected' : 'not_configured',
        matchmaking: 'active',
        eegAnalysis: 'ready',
        llm: this.config.asillm.apiKey ? 'online' : 'not_configured',
        twitter: this.config.twitter.apiKey ? 'available' : 'not_configured'
      },
      config: {
        proxyPort: this.config.asi.proxyPort,
        wsPort: this.config.asi.wsPort,
        environment: this.config.asi.environment
      }
    };
  }
}