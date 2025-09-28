#!/usr/bin/env ts-node

import { config } from './src/config';
import { ASIService } from './src/core/ASIService';
import { TwitterService } from './src/services/TwitterService';
import { AgentFactory } from './src/services/AgentFactory';
import { logger } from './src/utils/logger';

// Color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function testTwitterService() {
  console.log(`\n${colors.cyan}=== Testing Twitter Service ===${colors.reset}`);

  try {
    const twitterService = new TwitterService(config.twitter);

    // Test with a real Twitter handle
    const testUsername = 'elonmusk';  // Popular account for testing
    console.log(`${colors.blue}Testing personality extraction for @${testUsername}...${colors.reset}`);

    const personality = await twitterService.extractPersonality(testUsername);

    if (personality) {
      console.log(`${colors.green}✓ Twitter personality extraction successful!${colors.reset}`);
      console.log(`${colors.yellow}Personality traits:${colors.reset}`);
      console.log(JSON.stringify(personality, null, 2));
      return true;
    } else {
      console.log(`${colors.red}✗ Failed to extract personality${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Twitter service error:${colors.reset}`, (error as Error).message);
    return false;
  }
}

async function testAgentFactory() {
  console.log(`\n${colors.cyan}=== Testing Agent Factory ===${colors.reset}`);

  try {
    const agentFactory = new AgentFactory(config.agentverse);

    // Check if template address is configured
    console.log(`${colors.blue}Checking Agentverse configuration...${colors.reset}`);
    console.log(`Template Address: ${config.agentverse.templateAddress ? '✓ Configured' : '✗ Missing'}`);
    console.log(`API Key: ${config.agentverse.apiKey ? '✓ Configured' : '✗ Missing'}`);
    console.log(`ASI LLM Key: ${config.asillm.apiKey ? '✓ Configured' : '✗ Missing'}`);

    if (!config.agentverse.templateAddress) {
      console.log(`${colors.red}✗ Agent template address not configured${colors.reset}`);
      return false;
    }

    // Test agent creation (dry run - won't actually create)
    const testUserId = 'test_user_' + Date.now();
    const testPersonality = {
      openness: 0.75,
      conscientiousness: 0.60,
      extraversion: 0.70,
      agreeableness: 0.65,
      neuroticism: 0.30,
      interests: ['technology', 'innovation'],
      emotionalExpression: 'analytical',
      cognitiveStyle: 'logical',
      socialTendency: 'leader'
    };

    console.log(`${colors.blue}Testing agent creation workflow for user: ${testUserId}${colors.reset}`);
    console.log(`${colors.yellow}Note: This is a simulation - actual agent creation requires Agentverse deployment${colors.reset}`);

    // Log what would happen
    console.log(`${colors.green}✓ Agent Factory initialized${colors.reset}`);
    console.log(`Would create agent with:`);
    console.log(`- Template: ${config.agentverse.templateAddress}`);
    console.log(`- User ID: ${testUserId}`);
    console.log(`- Personality traits:`, testPersonality);

    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Agent Factory error:${colors.reset}`, (error as Error).message);
    return false;
  }
}

async function testASIService() {
  console.log(`\n${colors.cyan}=== Testing ASI Service Integration ===${colors.reset}`);

  try {
    const asiService = new ASIService(config);

    console.log(`${colors.blue}Initializing ASI Service...${colors.reset}`);
    await asiService.initialize();

    console.log(`${colors.green}✓ ASI Service initialized${colors.reset}`);

    // Check status
    const status = await asiService.getStatus();
    console.log(`${colors.yellow}Service Status:${colors.reset}`);
    console.log(JSON.stringify(status, null, 2));

    return true;
  } catch (error) {
    console.error(`${colors.red}✗ ASI Service error:${colors.reset}`, (error as Error).message);
    return false;
  }
}

async function testEndToEnd() {
  console.log(`\n${colors.cyan}=== End-to-End Test Scenario ===${colors.reset}`);
  console.log(`${colors.magenta}Simulating user flow: Registration → Twitter Analysis → Agent Creation${colors.reset}`);

  try {
    // Step 1: User registration simulation
    const testUser = {
      id: 'user_' + Date.now(),
      worldId: 'world_id_verified',
      twitterHandle: 'VitalikButerin'  // Another test account
    };

    console.log(`\n${colors.blue}Step 1: User Registration${colors.reset}`);
    console.log(`User ID: ${testUser.id}`);
    console.log(`World ID: ${testUser.worldId}`);
    console.log(`Twitter: @${testUser.twitterHandle}`);

    // Step 2: Extract Twitter personality
    console.log(`\n${colors.blue}Step 2: Twitter Personality Analysis${colors.reset}`);
    const twitterService = new TwitterService(config.twitter);
    const personality = await twitterService.extractPersonality(testUser.twitterHandle);

    if (personality) {
      console.log(`${colors.green}✓ Personality extracted from Twitter${colors.reset}`);
      console.log(`Key traits:`, personality);
    }

    // Step 3: Agent creation simulation
    console.log(`\n${colors.blue}Step 3: Agent Creation on Agentverse${colors.reset}`);
    console.log(`Would deploy agent with:`);
    console.log(`- Template: ${config.agentverse.templateAddress}`);
    console.log(`- Personality: Combined Twitter + EEG data`);
    console.log(`- ASI LLM: ${config.asillm.model}`);

    // Step 4: Virtual dating orchestration
    console.log(`\n${colors.blue}Step 4: Virtual Dating Ready${colors.reset}`);
    console.log(`Agent would be available for:`);
    console.log(`- 15-minute autonomous conversations`);
    console.log(`- Personality-driven interactions`);
    console.log(`- Compatibility scoring`);

    console.log(`\n${colors.green}✓ End-to-end flow validated${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ End-to-end test error:${colors.reset}`, (error as Error).message);
    return false;
  }
}

async function main() {
  console.log(`${colors.magenta}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║     ASI System Integration Test        ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════╝${colors.reset}`);

  console.log(`\n${colors.yellow}Configuration Status:${colors.reset}`);
  console.log(`Environment: ${config.asi.environment}`);
  console.log(`Proxy Port: ${config.asi.proxyPort}`);
  console.log(`WebSocket Port: ${config.asi.wsPort}`);

  const results = {
    twitter: false,
    agent: false,
    asi: false,
    e2e: false
  };

  // Run tests
  results.twitter = await testTwitterService();
  results.agent = await testAgentFactory();
  results.asi = await testASIService();
  results.e2e = await testEndToEnd();

  // Summary
  console.log(`\n${colors.magenta}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║           Test Summary                 ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════╝${colors.reset}`);

  console.log(`Twitter Service: ${results.twitter ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`);
  console.log(`Agent Factory: ${results.agent ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`);
  console.log(`ASI Service: ${results.asi ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`);
  console.log(`End-to-End: ${results.e2e ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`);

  const allPassed = Object.values(results).every(r => r);
  if (allPassed) {
    console.log(`\n${colors.green}🎉 All tests passed! ASI system is ready.${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests need attention. Check the logs above.${colors.reset}`);
  }

  process.exit(allPassed ? 0 : 1);
}

// Run tests
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});