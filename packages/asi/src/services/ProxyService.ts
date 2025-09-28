import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { EventEmitter } from 'eventemitter3';
import { logger } from '../utils/logger';

/**
 * ProxyService acts as a transparent proxy between MOFO frontend and backend
 * Intercepts requests to enhance with ASI capabilities without modifying MOFO code
 */
export class ProxyService extends EventEmitter {
  private app: express.Application;
  private config: any;
  private interceptors: Map<string, Function[]> = new Map();

  constructor(config: any) {
    super();
    this.config = config;
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS for MOFO frontend
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
  }

  async start() {
    const port = this.config.asi.proxyPort;

    // Setup proxy to MOFO backend
    this.app.use('/api', createProxyMiddleware({
      target: this.config.mofo.appUrl,
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        // Intercept and modify requests
        this.handleInterception(req, res);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Enhance responses with ASI data
        this.enhanceResponse(proxyRes, req, res);
      }
    }));

    // ASI-specific endpoints (new functionality)
    this.setupASIEndpoints();

    this.app.listen(port, () => {
      logger.info(`ASI Proxy Service running on port ${port}`);
    });
  }

  intercept(path: string, handler: Function) {
    if (!this.interceptors.has(path)) {
      this.interceptors.set(path, []);
    }
    this.interceptors.get(path)!.push(handler);
  }

  private async handleInterception(req: any, res: any) {
    const handlers = this.interceptors.get(req.path);
    if (handlers) {
      for (const handler of handlers) {
        await handler(req, res, () => {});
      }
    }

    // Emit events for specific endpoints
    if (req.path === '/api/verify' && req.method === 'POST') {
      this.emit('user:verified', req.body);
    }

    if (req.path === '/api/agent/create' && req.method === 'POST') {
      this.emit('agent:create:requested', req.body);
    }
  }

  private enhanceResponse(proxyRes: any, req: any, res: any) {
    // Add ASI metadata to responses
    proxyRes.headers['x-asi-enhanced'] = 'true';
    proxyRes.headers['x-asi-timestamp'] = Date.now().toString();
  }

  private setupASIEndpoints() {
    // ASI Status endpoint
    this.app.get('/asi/status', (req, res) => {
      res.json({
        status: 'operational',
        services: {
          agentverse: 'connected',
          matchmaking: 'active',
          eegAnalysis: 'ready',
          llm: 'online'
        },
        timestamp: new Date().toISOString()
      });
    });

    // ASI Agent Registry
    this.app.get('/asi/agents/:userId', async (req, res) => {
      const { userId } = req.params;
      // Fetch agent from ASI network
      const agent = await this.fetchASIAgent(userId);
      res.json(agent);
    });

    // ASI Matching endpoint
    this.app.post('/asi/match', async (req, res) => {
      this.emit('match:requested', req.body);
      res.json({ status: 'processing', jobId: Date.now() });
    });
  }

  private async fetchASIAgent(userId: string) {
    // Placeholder for ASI agent fetching logic
    return {
      userId,
      asiId: `asi_${userId}`,
      status: 'active',
      capabilities: ['matching', 'conversation', 'scheduling']
    };
  }
}