import dotenv from 'dotenv';
import path from 'path';

// Load environment variables - .env.local takes precedence
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // ASI Service Configuration
  asi: {
    proxyPort: process.env.ASI_PROXY_PORT || 4000,
    wsPort: process.env.ASI_WS_PORT || 4001,
    environment: process.env.NODE_ENV || 'development',
  },

  // Integration Points with MOFO
  mofo: {
    appUrl: process.env.MOFO_APP_URL || 'http://localhost:3002',
    boothBackendUrl: process.env.BOOTH_BACKEND_URL || 'http://localhost:3004',
    boothFrontendUrl: process.env.BOOTH_FRONTEND_URL || 'http://localhost:3003',
    relayerWsUrl: process.env.RELAYER_WS_URL || 'ws://localhost:8765',
  },

  // Agentverse Configuration
  agentverse: {
    endpoint: process.env.AGENTVERSE_ENDPOINT || 'https://agentverse.ai',
    apiKey: process.env.AGENTVERSE_API_KEY || '',
    network: process.env.AGENTVERSE_NETWORK || 'fetchai-testnet',
    templateAddress: process.env.AGENTVERSE_TEMPLATE_ADDRESS || '',
  },

  // uAgent Configuration
  uagent: {
    seed: process.env.UAGENT_SEED || 'mofo-asi-agent-seed',
    port: process.env.UAGENT_PORT || 8000,
    endpoint: process.env.UAGENT_ENDPOINT || 'http://localhost:8000',
  },

  // ASI LLM Configuration
  asillm: {
    endpoint: process.env.ASILLM_ENDPOINT || 'https://api.asi1.ai/v1/chat/completions',
    model: process.env.ASILLM_MODEL || 'asi1-mini',
    apiKey: process.env.ASILLM_API_KEY || '',
  },

  // Redis for Queue Management
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
  },

  // Twitter Configuration
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || '',
    apiSecret: process.env.TWITTER_API_SECRET || '',
    bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
  },

  // MCP Configuration (optional)
  mcp: {
    endpoint: process.env.MCP_ENDPOINT || '',
    apiKey: process.env.MCP_API_KEY || '',
  },

  // Feature Flags
  features: {
    enhancedEEG: process.env.FEATURE_ENHANCED_EEG === 'true',
    autonomousAgents: process.env.FEATURE_AUTONOMOUS_AGENTS === 'true',
    decentralizedMatching: process.env.FEATURE_DECENTRALIZED_MATCHING === 'true',
    llmConversations: process.env.FEATURE_LLM_CONVERSATIONS === 'true',
    twitterPersonality: process.env.FEATURE_TWITTER_PERSONALITY === 'true',
  }
};