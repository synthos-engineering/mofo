import { Server as SocketIOServer } from 'socket.io';
import { io as SocketIOClient, Socket } from 'socket.io-client';
import { EventEmitter } from 'eventemitter3';
import { createServer } from 'http';
import { logger } from '../utils/logger';

/**
 * WebSocketBridge connects to existing MOFO WebSocket services
 * and creates a new ASI WebSocket server for enhanced features
 */
export class WebSocketBridge extends EventEmitter {
  private asiServer!: SocketIOServer;
  private boothConnection: Socket | null = null;
  private relayerConnection: Socket | null = null;
  private connectedClients: Map<string, any> = new Map();
  private config: any;

  constructor(config: any) {
    super();
    this.config = config;
    this.setupASIServer();
  }

  private setupASIServer() {
    const httpServer = createServer();
    this.asiServer = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.asiServer.on('connection', (socket) => {
      logger.info(`ASI client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      socket.on('disconnect', () => {
        logger.info(`ASI client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      // Forward events to ASI network
      socket.on('asi:request', (data) => {
        this.emit('asi:request', { ...data, socketId: socket.id });
      });
    });

    httpServer.listen(this.config.asi.wsPort, () => {
      logger.info(`ASI WebSocket server running on port ${this.config.asi.wsPort}`);
    });
  }

  async connect() {
    // Connect to booth backend WebSocket
    await this.connectToBooth();

    // Connect to relayer server
    await this.connectToRelayer();
  }

  private async connectToBooth() {
    try {
      // Connect to EEG WebSocket server
      const eegWsUrl = 'ws://localhost:8765';

      this.boothConnection = SocketIOClient(eegWsUrl, {
        transports: ['websocket'],
        reconnection: true
      });

      this.boothConnection.on('connect', () => {
        logger.info('Connected to Booth EEG WebSocket');
      });

      this.boothConnection.on('eeg_data', (data) => {
        logger.info('Received EEG data from booth');
        this.emit('eeg:data', data);

        // Broadcast enhanced EEG to ASI clients
        this.processAndBroadcastEEG(data);
      });

      this.boothConnection.on('scanner_connected', (data) => {
        logger.info('Scanner connected to booth');
        this.emit('scanner:connected', data);
      });

    } catch (error) {
      logger.error('Failed to connect to booth:', error);
    }
  }

  private async connectToRelayer() {
    try {
      const relayerUrl = this.config.mofo.relayerWsUrl;

      this.relayerConnection = SocketIOClient(relayerUrl, {
        transports: ['websocket'],
        reconnection: true
      });

      this.relayerConnection.on('connect', () => {
        logger.info('Connected to Relayer WebSocket');

        // Register as ASI service
        this.relayerConnection?.emit('register', {
          type: 'asi_service',
          id: 'asi_main',
          capabilities: ['matching', 'eeg_analysis', 'agent_management']
        });
      });

      this.relayerConnection.on('message', (data) => {
        this.handleRelayerMessage(data);
      });

    } catch (error) {
      logger.error('Failed to connect to relayer:', error);
    }
  }

  private async processAndBroadcastEEG(data: any) {
    // Add ASI enhancements to EEG data
    const enhanced = {
      ...data,
      asi: {
        timestamp: Date.now(),
        emotionalState: this.analyzeEmotionalState(data),
        compatibilityFactors: this.extractCompatibilityFactors(data),
        neuralSignature: this.generateNeuralSignature(data)
      }
    };

    this.broadcast('asi:eeg:enhanced', enhanced);
  }

  private analyzeEmotionalState(eegData: any) {
    // Simplified emotional state analysis
    return {
      valence: Math.random() * 2 - 1, // -1 to 1
      arousal: Math.random(),
      dominance: Math.random(),
      confidence: 0.75
    };
  }

  private extractCompatibilityFactors(eegData: any) {
    return {
      openness: Math.random(),
      conscientiousness: Math.random(),
      extraversion: Math.random(),
      agreeableness: Math.random(),
      neuroticism: Math.random()
    };
  }

  private generateNeuralSignature(eegData: any) {
    // Generate unique neural signature for matching
    return {
      signature: `neural_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      features: {
        alphaAsymmetry: Math.random() * 2 - 1,
        betaPower: Math.random(),
        gammaCoherence: Math.random()
      }
    };
  }

  private handleRelayerMessage(data: any) {
    logger.info('Relayer message received:', data.type);

    switch (data.type) {
      case 'booth_registered':
        this.emit('booth:registered', data);
        break;
      case 'scanner_connected':
        this.emit('scanner:connected', data);
        break;
      case 'match_request':
        this.emit('match:requested', data);
        break;
    }
  }

  broadcast(event: string, data: any) {
    this.connectedClients.forEach((socket) => {
      socket.emit(event, data);
    });
  }

  sendToBooth(event: string, data: any) {
    if (this.boothConnection) {
      this.boothConnection.emit(event, data);
    }
  }

  sendToRelayer(event: string, data: any) {
    if (this.relayerConnection) {
      this.relayerConnection.emit(event, data);
    }
  }
}