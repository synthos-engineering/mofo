/**
 * ASI Service Layer - Main Entry Point
 *
 * This service runs independently and integrates with MOFO through:
 * 1. HTTP API proxy (intercepts and enhances existing endpoints)
 * 2. WebSocket event listening (monitors booth and app events)
 * 3. Queue-based async processing (handles heavy ASI operations)
 */

import { ASIService } from './core/ASIService';
import { config } from './config';
import { logger } from './utils/logger';

async function startASI() {
  logger.info('🚀 Starting ASI Integration Service...');

  const asi = new ASIService(config);

  try {
    // Initialize all ASI subsystems
    await asi.initialize();

    // Start the service
    await asi.start();

    logger.info('✅ ASI Service running successfully');
    logger.info(`📡 API Proxy: http://localhost:${config.asi.proxyPort}`);
    logger.info(`🔌 WebSocket Bridge: ws://localhost:${config.asi.wsPort}`);
    logger.info(`🤖 Agentverse: ${config.agentverse.endpoint}`);

  } catch (error) {
    logger.error('Failed to start ASI service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down ASI service...');
  process.exit(0);
});

startASI();