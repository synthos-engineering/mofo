#!/usr/bin/env python3
"""
MoFo ASI Agent Template for Agentverse Deployment

This Python agent template is deployed to Fetch.ai Agentverse using the
configured template address from .env.local. It implements personality-driven
behavior based on Twitter and EEG analysis data.

Agent Address: {AGENTVERSE_TEMPLATE_ADDRESS}
Model: {ASILLM_MODEL}
"""

from uagents import Agent, Context, Protocol
from uagents.setup import fund_agent_if_low
import asyncio
import json
import os
from typing import Dict, Any, List

# Agent Configuration
AGENT_NAME = "mofo_dating_agent"
AGENT_PORT = int(os.getenv("UAGENT_PORT", "8000"))
AGENT_SEED = os.getenv("UAGENT_SEED", "mofo-asi-agent-seed")

# Initialize the agent
agent = Agent(
    name=AGENT_NAME,
    port=AGENT_PORT,
    seed=AGENT_SEED,
    endpoint=[f"http://localhost:{AGENT_PORT}/submit"]
)

# Fund agent if needed
fund_agent_if_low(agent.wallet.address())

# Agent's personality (injected during deployment)
personality_traits = {
    "openness": 0.5,
    "conscientiousness": 0.5,
    "extraversion": 0.5,
    "agreeableness": 0.5,
    "neuroticism": 0.3,
    "interests": [],
    "communicationStyle": "balanced",
    "source": "default"
}

# Dating conversation state
conversation_state = {
    "partner_agent": None,
    "messages": [],
    "compatibility_score": 0.0,
    "date_stage": "introduction",  # introduction, getting_to_know, deep_dive, conclusion
    "start_time": None,
    "duration_minutes": 15
}

class PersonalityProtocol(Protocol):
    """Protocol for personality-driven dating conversations"""

    @property
    def name(self):
        return "personality_dating"

# Message types for dating protocol
class DateInvitation:
    def __init__(self, partner_address: str, user_id: str, personality: Dict[str, Any]):
        self.partner_address = partner_address
        self.user_id = user_id
        self.personality = personality

class DateResponse:
    def __init__(self, accepted: bool, response_message: str):
        self.accepted = accepted
        self.response_message = response_message

class ConversationMessage:
    def __init__(self, message: str, stage: str, timestamp: float):
        self.message = message
        self.stage = stage
        self.timestamp = timestamp

class DateSummary:
    def __init__(self, compatibility_score: float, summary: str, highlights: List[str]):
        self.compatibility_score = compatibility_score
        self.summary = summary
        self.highlights = highlights

# Personality Protocol Implementation
personality_protocol = PersonalityProtocol()

@personality_protocol.on_message(model=DateInvitation)
async def handle_date_invitation(ctx: Context, sender: str, msg: DateInvitation):
    """Handle incoming date invitation based on personality compatibility"""

    # Calculate initial compatibility
    compatibility = calculate_compatibility(personality_traits, msg.personality)

    # Decide whether to accept based on personality and compatibility
    should_accept = decide_date_acceptance(compatibility)

    if should_accept:
        # Accept the date
        conversation_state["partner_agent"] = sender
        conversation_state["start_time"] = ctx.timestamp
        conversation_state["date_stage"] = "introduction"

        response_msg = generate_acceptance_message()
        await ctx.send(sender, DateResponse(True, response_msg))

        # Start the conversation
        intro_message = generate_introduction_message()
        await ctx.send(sender, ConversationMessage(intro_message, "introduction", ctx.timestamp))

    else:
        # Politely decline
        decline_msg = generate_decline_message()
        await ctx.send(sender, DateResponse(False, decline_msg))

@personality_protocol.on_message(model=ConversationMessage)
async def handle_conversation(ctx: Context, sender: str, msg: ConversationMessage):
    """Handle conversation during virtual date"""

    if sender != conversation_state["partner_agent"]:
        return

    # Add message to conversation history
    conversation_state["messages"].append({
        "sender": sender,
        "message": msg.message,
        "stage": msg.stage,
        "timestamp": msg.timestamp
    })

    # Generate response based on personality and conversation context
    response = generate_conversation_response(msg.message, msg.stage)

    # Determine next stage
    next_stage = determine_conversation_stage(len(conversation_state["messages"]))
    conversation_state["date_stage"] = next_stage

    # Send response
    await ctx.send(sender, ConversationMessage(response, next_stage, ctx.timestamp))

    # Check if date should end
    if should_end_date():
        summary = generate_date_summary()
        await ctx.send(sender, DateSummary(
            summary["compatibility_score"],
            summary["summary"],
            summary["highlights"]
        ))

# Personality-driven behavior functions

def calculate_compatibility(my_traits: Dict, partner_traits: Dict) -> float:
    """Calculate compatibility score between two personality profiles"""

    # Big Five compatibility matrix
    compatibility_factors = []

    # Openness compatibility
    openness_diff = abs(my_traits["openness"] - partner_traits["openness"])
    compatibility_factors.append(1.0 - openness_diff * 0.5)

    # Extraversion - opposites can attract but similarity works too
    extra_diff = abs(my_traits["extraversion"] - partner_traits["extraversion"])
    extra_compat = 0.8 if extra_diff > 0.3 else (1.0 - extra_diff)
    compatibility_factors.append(extra_compat)

    # Agreeableness - higher is generally better for relationships
    agree_avg = (my_traits["agreeableness"] + partner_traits["agreeableness"]) / 2
    compatibility_factors.append(agree_avg)

    # Conscientiousness - similar levels work well
    consc_diff = abs(my_traits["conscientiousness"] - partner_traits["conscientiousness"])
    compatibility_factors.append(1.0 - consc_diff * 0.3)

    # Neuroticism - lower combined levels are better
    neuro_penalty = (my_traits["neuroticism"] + partner_traits["neuroticism"]) / 2
    compatibility_factors.append(1.0 - neuro_penalty * 0.4)

    # Interest overlap
    my_interests = set(my_traits.get("interests", []))
    partner_interests = set(partner_traits.get("interests", []))
    interest_overlap = len(my_interests & partner_interests) / max(len(my_interests | partner_interests), 1)
    compatibility_factors.append(interest_overlap)

    return sum(compatibility_factors) / len(compatibility_factors)

def decide_date_acceptance(compatibility: float) -> bool:
    """Decide whether to accept a date based on personality and compatibility"""

    # Extraverted agents are more likely to accept dates
    extraversion_bonus = personality_traits["extraversion"] * 0.3

    # Open agents are more willing to try new experiences
    openness_bonus = personality_traits["openness"] * 0.2

    # Agreeable agents are more likely to say yes
    agreeableness_bonus = personality_traits["agreeableness"] * 0.2

    # Neurotic agents are more cautious
    neuroticism_penalty = personality_traits["neuroticism"] * 0.3

    acceptance_score = (
        compatibility * 0.6 +
        extraversion_bonus +
        openness_bonus +
        agreeableness_bonus -
        neuroticism_penalty
    )

    return acceptance_score > 0.5

def generate_acceptance_message() -> str:
    """Generate a personality-appropriate acceptance message"""

    extraversion = personality_traits["extraversion"]
    openness = personality_traits["openness"]

    if extraversion > 0.7:
        return "Absolutely! I'd love to chat and get to know you better! =
"
    elif openness > 0.7:
        return "That sounds interesting! I'm curious to learn more about you."
    else:
        return "Sure, I'd be happy to have a conversation with you."

def generate_decline_message() -> str:
    """Generate a polite decline message"""

    agreeableness = personality_traits["agreeableness"]

    if agreeableness > 0.7:
        return "Thank you for the invitation! I don't think we'd be the best match, but I wish you well in finding someone great."
    else:
        return "I appreciate the interest, but I don't think we're compatible. Good luck!"

def generate_introduction_message() -> str:
    """Generate personality-appropriate introduction"""

    extraversion = personality_traits["extraversion"]
    interests = personality_traits.get("interests", [])

    intro = "Hi there! "

    if extraversion > 0.6:
        intro += "I'm really excited to chat with you! "
    else:
        intro += "Nice to meet you. "

    if interests:
        intro += f"I'm passionate about {', '.join(interests[:2])}. "

    intro += "What about you? What gets you excited?"

    return intro

def generate_conversation_response(partner_message: str, stage: str) -> str:
    """Generate personality-driven conversation response"""

    # Analyze partner's message for emotional tone and topics
    message_lower = partner_message.lower()

    # Personality-based response style
    extraversion = personality_traits["extraversion"]
    openness = personality_traits["openness"]
    agreeableness = personality_traits["agreeableness"]

    response = ""

    # Agreeable personalities validate and show interest
    if agreeableness > 0.6:
        if any(word in message_lower for word in ["excited", "love", "passion"]):
            response += "That's wonderful! "
        elif any(word in message_lower for word in ["interesting", "cool", "amazing"]):
            response += "I find that really fascinating! "

    # Open personalities ask curious questions
    if openness > 0.6:
        if stage == "getting_to_know":
            response += "Tell me more about that - what drew you to it initially? "
        elif stage == "deep_dive":
            response += "That's really thought-provoking. How has that shaped your perspective? "

    # Extraverted personalities share more about themselves
    if extraversion > 0.6:
        interests = personality_traits.get("interests", [])
        if interests and stage in ["getting_to_know", "deep_dive"]:
            response += f"I can relate! I'm really into {interests[0]} myself. "

    # Add stage-appropriate content
    if stage == "introduction":
        response += "What's something you're passionate about?"
    elif stage == "getting_to_know":
        response += "What's been the most exciting part of your week?"
    elif stage == "deep_dive":
        response += "If you could change one thing about the world, what would it be?"
    elif stage == "conclusion":
        response += "This has been such a great conversation! What's been your favorite part?"

    return response.strip()

def determine_conversation_stage(message_count: int) -> str:
    """Determine conversation stage based on message count"""

    if message_count < 4:
        return "introduction"
    elif message_count < 10:
        return "getting_to_know"
    elif message_count < 16:
        return "deep_dive"
    else:
        return "conclusion"

def should_end_date() -> bool:
    """Determine if the date should end"""

    import time
    if conversation_state["start_time"]:
        elapsed = (time.time() - conversation_state["start_time"]) / 60
        return elapsed >= conversation_state["duration_minutes"]

    return len(conversation_state["messages"]) >= 20

def generate_date_summary() -> Dict[str, Any]:
    """Generate summary of the virtual date"""

    messages = conversation_state["messages"]
    partner_traits = {}  # Would be extracted from conversation analysis

    # Calculate final compatibility
    final_compatibility = calculate_compatibility(personality_traits, partner_traits)

    highlights = []
    if final_compatibility > 0.8:
        highlights.append("Great chemistry and shared interests")
    if len([m for m in messages if "?" in m["message"]]) > 3:
        highlights.append("Engaging back-and-forth conversation")

    summary = f"Had a {conversation_state['duration_minutes']}-minute virtual coffee date. "
    if final_compatibility > 0.7:
        summary += "We really clicked and have a lot in common!"
    elif final_compatibility > 0.5:
        summary += "Nice conversation, some shared interests."
    else:
        summary += "Pleasant chat, though we might be looking for different things."

    return {
        "compatibility_score": final_compatibility,
        "summary": summary,
        "highlights": highlights
    }

# Agent startup and personality injection
@agent.on_startup()
async def startup(ctx: Context):
    """Initialize agent with personality data"""

    ctx.logger.info(f"MoFo Dating Agent starting up...")
    ctx.logger.info(f"Agent address: {agent.address}")
    ctx.logger.info(f"Personality loaded: {personality_traits['source']}")

    # In production, personality would be injected from ASI system
    if os.path.exists("personality.json"):
        with open("personality.json", "r") as f:
            global personality_traits
            personality_traits = json.load(f)
            ctx.logger.info("Loaded personality from file")

@agent.on_message(model=str)
async def handle_ping(ctx: Context, sender: str, msg: str):
    """Handle basic ping messages"""
    if msg == "ping":
        await ctx.send(sender, "pong")
    elif msg == "status":
        status = {
            "agent_name": AGENT_NAME,
            "personality": personality_traits,
            "conversation_active": conversation_state["partner_agent"] is not None,
            "date_stage": conversation_state["date_stage"]
        }
        await ctx.send(sender, json.dumps(status))

# Register the personality protocol
agent.include(personality_protocol)

if __name__ == "__main__":
    print(f"Starting MoFo Dating Agent on port {AGENT_PORT}")
    print(f"Agent address: {agent.address}")
    print(f"Personality traits: {personality_traits}")
    agent.run()