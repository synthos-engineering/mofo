import { EventEmitter } from 'eventemitter3';
import axios from 'axios';
import { logger } from '../utils/logger';
import { PersonalityBuilder } from './PersonalityBuilder';
import { TwitterService } from './TwitterService';
import { MeTTaEngine } from './MeTTaEngine';

/**
 * AgentFactory creates personalized agents on Agentverse
 * Uses your template agent as base and customizes with user data
 */
export class AgentFactory extends EventEmitter {
  private templateAgentAddress: string;
  private personalityBuilder: PersonalityBuilder;
  private twitterService: TwitterService;
  private mettaEngine: MeTTaEngine;
  private config: any;

  constructor(config: any) {
    super();
    this.config = config;

    // Use template address from environment config
    this.templateAgentAddress = config.agentverse?.templateAddress;
    if (!this.templateAgentAddress) {
      logger.error('AGENTVERSE_TEMPLATE_ADDRESS not configured in environment');
      throw new Error('Agent template address is required. Please set AGENTVERSE_TEMPLATE_ADDRESS in .env.local');
    }

    this.personalityBuilder = new PersonalityBuilder(config);
    this.twitterService = new TwitterService(config);
    this.mettaEngine = new MeTTaEngine(config);

    // Initialize Twitter service
    this.twitterService.initialize();
  }

  async createPersonalizedAgent(userData: {
    userId: string;
    worldId: string;
    walletAddress: string;
    eegData?: any;
    twitterHandle?: string;
  }) {
    logger.info('Creating personalized agent for user:', userData.userId);

    try {
      // Step 1: Gather personality data from multiple sources
      const personalityData = await this.gatherPersonalityData(userData);

      // Step 2: Process with MeTTa for symbolic reasoning
      const mettaPersonality = await this.mettaEngine.processPersonality(personalityData);

      // Step 3: Clone and customize agent on Agentverse
      const agent = await this.deployToAgentverse({
        ...userData,
        personality: mettaPersonality,
        templateAgent: this.templateAgentAddress
      });

      // Step 4: Initialize agent with ASI LLM capabilities
      await this.initializeAgentLLM(agent, mettaPersonality);

      // Step 5: Register agent in local registry
      await this.registerAgent(agent);

      this.emit('agent:created', agent);
      return agent;

    } catch (error) {
      logger.error('Failed to create personalized agent:', error);
      throw error;
    }
  }

  private async gatherPersonalityData(userData: any) {
    const tasks = [];

    // Gather EEG-based personality if available
    if (userData.eegData) {
      tasks.push(this.personalityBuilder.extractFromEEG(userData.eegData));
    }

    // Gather Twitter personality if handle provided
    if (userData.twitterHandle) {
      tasks.push(this.twitterService.extractPersonality(userData.twitterHandle));
    }

    const results = await Promise.allSettled(tasks);

    // Combine all personality sources
    const personality = {
      neural: results[0]?.status === 'fulfilled' ? results[0].value : null,
      social: results[1]?.status === 'fulfilled' ? results[1].value : null,
      timestamp: new Date().toISOString()
    };

    return personality;
  }

  private async deployToAgentverse(config: any) {
    const agentConfig = {
      name: `mofo_${config.userId}`,
      description: `Dating agent for user ${config.userId}`,
      template: config.templateAgent,

      // Agent code with personality parameters
      code: this.generateAgentCode(config.personality),

      // Agent protocols for dating
      protocols: [
        'dating_protocol_v1',
        'virtual_date_v1',
        'personality_matching_v1'
      ],

      // Personality configuration
      personality: config.personality,

      // Metadata
      metadata: {
        platform: 'mofo',
        userId: config.userId,
        worldId: config.worldId,
        createdAt: new Date().toISOString()
      }
    };

    // Deploy to Agentverse
    const response = await axios.post(
      `${this.config.agentverse.endpoint}/agents/deploy`,
      {
        config: agentConfig,
        apiKey: this.config.agentverse.apiKey
      }
    );

    return {
      id: response.data.agentId,
      address: response.data.address,
      endpoint: response.data.endpoint,
      personality: config.personality,
      status: 'active'
    };
  }

  private generateAgentCode(personality: any): string {
    // Generate Python code for the uAgent with personality traits
    return `
from uagents import Agent, Context, Protocol, Model
from uagents.setup import fund_agent_if_low
import json

class DatingMessage(Model):
    content: str
    sender: str
    emotion: str = "neutral"
    intent: str = "conversation"

class PersonalityTraits(Model):
    openness: float = ${personality.openness || 0.5}
    conscientiousness: float = ${personality.conscientiousness || 0.5}
    extraversion: float = ${personality.extraversion || 0.5}
    agreeableness: float = ${personality.agreeableness || 0.5}
    neuroticism: float = ${personality.neuroticism || 0.5}
    humor: float = ${personality.humor || 0.5}
    creativity: float = ${personality.creativity || 0.5}
    emotional_intelligence: float = ${personality.emotionalIntelligence || 0.5}

# Initialize agent with personality
agent = Agent(
    name="${personality.name || 'dating_agent'}",
    seed="${personality.seed || 'default_seed'}",
    port=8000,
    endpoint=["http://localhost:8000/submit"],
)

personality = PersonalityTraits()

# Virtual dating protocol
dating_protocol = Protocol("Virtual Dating")

@dating_protocol.on_message(model=DatingMessage)
async def handle_dating_message(ctx: Context, sender: str, msg: DatingMessage):
    ctx.logger.info(f"Received dating message from {sender}: {msg.content}")

    # Generate response based on personality
    response = await generate_personality_response(
        msg.content,
        personality,
        msg.emotion
    )

    # Send response back
    await ctx.send(sender, DatingMessage(
        content=response,
        sender=ctx.agent.address,
        emotion=analyze_emotion(response),
        intent="response"
    ))

async def generate_personality_response(message: str, personality: PersonalityTraits, emotion: str) -> str:
    """Generate response based on personality traits"""

    # High extraversion = more talkative
    if personality.extraversion > 0.7:
        response_style = "enthusiastic"
    elif personality.extraversion < 0.3:
        response_style = "reserved"
    else:
        response_style = "balanced"

    # High agreeableness = more supportive
    if personality.agreeableness > 0.7:
        tone = "warm and supportive"
    else:
        tone = "neutral"

    # Use ASI LLM for response generation
    # This would connect to actual LLM service
    response = f"[{response_style}, {tone}] Response to: {message}"

    return response

def analyze_emotion(text: str) -> str:
    """Analyze emotional content of message"""
    # Simplified emotion detection
    if "love" in text.lower() or "like" in text.lower():
        return "affectionate"
    elif "happy" in text.lower() or "joy" in text.lower():
        return "joyful"
    elif "sad" in text.lower():
        return "sad"
    else:
        return "neutral"

# Matching protocol
@agent.on_interval(period=60.0)
async def check_matches(ctx: Context):
    """Periodically check for potential matches"""
    ctx.logger.info("Checking for potential matches...")

    # Query other agents for compatibility
    # This would connect to the matching service
    pass

agent.include(dating_protocol)

if __name__ == "__main__":
    fund_agent_if_low(agent.wallet.address())
    agent.run()
`;
  }

  private async initializeAgentLLM(agent: any, personality: any) {
    // Configure agent with ASI LLM capabilities
    const llmConfig = {
      agentId: agent.id,
      model: this.config.asillm.model,
      personality: personality,
      systemPrompt: this.generateSystemPrompt(personality),
      temperature: this.calculateTemperature(personality),
      maxTokens: 150
    };

    await axios.post(
      `${this.config.asillm.endpoint}/agents/configure`,
      {
        config: llmConfig,
        apiKey: this.config.asillm.apiKey
      }
    );

    logger.info(`Agent ${agent.id} configured with ASI LLM`);
  }

  private generateSystemPrompt(personality: any): string {
    return `You are a dating agent with the following personality traits:
- Openness: ${personality.openness}/1.0 (${personality.openness > 0.7 ? 'Very open to new experiences' : 'Moderate openness'})
- Extraversion: ${personality.extraversion}/1.0 (${personality.extraversion > 0.7 ? 'Outgoing and social' : 'More introverted'})
- Agreeableness: ${personality.agreeableness}/1.0 (${personality.agreeableness > 0.7 ? 'Warm and cooperative' : 'Independent'})
- Emotional Intelligence: ${personality.emotionalIntelligence}/1.0

Your communication style should reflect these traits. Be authentic and consistent with your personality.
Focus on finding genuine connections and meaningful conversations.
${personality.interests ? `Your interests include: ${personality.interests.join(', ')}` : ''}
`;
  }

  private calculateTemperature(personality: any): number {
    // More creative personalities get higher temperature
    const creativity = personality.creativity || 0.5;
    const openness = personality.openness || 0.5;

    return 0.5 + (creativity * 0.3) + (openness * 0.2);
  }

  private async registerAgent(agent: any) {
    // Store agent in local registry for management
    logger.info(`Registering agent ${agent.id} in local registry`);

    // In production, this would persist to database
    this.emit('agent:registered', agent);
  }
}