import Bull from 'bull';
import { EventEmitter } from 'eventemitter3';
import { logger } from '../utils/logger';

export class QueueManager extends EventEmitter {
  private queues: Map<string, Bull.Queue> = new Map();
  private config: any;

  constructor(config: any) {
    super();
    this.config = config;
  }

  async initialize() {
    // Create queues for different job types
    this.createQueue('agent-creation');
    this.createQueue('eeg-analysis');
    this.createQueue('matching');
    this.createQueue('conversation');

    logger.info('Queue manager initialized');
  }

  private createQueue(name: string) {
    const queue = new Bull(name, {
      redis: {
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password
      }
    });

    // Setup queue processors
    queue.process(async (job) => {
      logger.info(`Processing job ${job.id} in queue ${name}`);
      return this.processJob(name, job);
    });

    // Setup event handlers
    queue.on('completed', (job, result) => {
      logger.info(`Job ${job.id} completed in queue ${name}`);
      this.emit('job:complete', { name, job, result });
    });

    queue.on('failed', (job, err) => {
      logger.error(`Job ${job.id} failed in queue ${name}:`, err);
      this.emit('job:failed', { name, job, error: err });
    });

    this.queues.set(name, queue);
  }

  async addJob(type: string, data: any, options?: Bull.JobOptions) {
    const queueName = this.getQueueName(type);
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.add(data, options);
    logger.info(`Job ${job.id} added to queue ${queueName}`);
    return job;
  }

  private getQueueName(type: string): string {
    const mapping: Record<string, string> = {
      'createAgent': 'agent-creation',
      'enhanceEEG': 'eeg-analysis',
      'findMatches': 'matching',
      'generateConversation': 'conversation'
    };

    return mapping[type] || 'default';
  }

  private async processJob(queueName: string, job: Bull.Job) {
    switch (queueName) {
      case 'agent-creation':
        return this.processAgentCreation(job.data);
      case 'eeg-analysis':
        return this.processEEGAnalysis(job.data);
      case 'matching':
        return this.processMatching(job.data);
      case 'conversation':
        return this.processConversation(job.data);
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }

  private async processAgentCreation(data: any) {
    // Simulate agent creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      agentId: `agent_${Date.now()}`,
      status: 'created',
      data
    };
  }

  private async processEEGAnalysis(data: any) {
    // Simulate EEG enhancement
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      enhanced: true,
      emotionalState: 'positive',
      compatibility: 0.85,
      data
    };
  }

  private async processMatching(data: any) {
    // Simulate matching
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      matches: [
        { id: 'match1', score: 0.92 },
        { id: 'match2', score: 0.87 }
      ],
      data
    };
  }

  private async processConversation(data: any) {
    // Simulate conversation generation
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      message: 'Generated conversation response',
      data
    };
  }

  async getQueueStatus() {
    const status: Record<string, any> = {};

    for (const [name, queue] of this.queues.entries()) {
      const counts = await queue.getJobCounts();
      status[name] = counts;
    }

    return status;
  }
}