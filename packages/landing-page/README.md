# Mofo Landing Page

The frontend landing page for **Mofo** - a privacy-first dating app that turns EEG sessions into AI agents for meaningful connections.

## Overview

This website serves as the primary landing page for the Mofo ecosystem, showcasing the unique approach to dating through brainwave analysis and AI agents.

## Core Features

### 🧠 Brainwave Analysis
- **EEG Integration**: 60-second EEG sessions to extract emotional preference traits
- **Privacy-First**: No raw brain data ever leaves your device
- **Local Processing**: Lightweight features computed locally

### 🤖 AI Agent System
- **uAgent Deployment**: Personal AI agent with ENS handle (e.g., viman.mofo.eth)
- **Autonomous Matching**: Auto-swiping and agent-to-agent conversations
- **Privacy-Preserving**: You review summaries, no raw chat transcripts

### 🔒 Privacy & Security
- **Zero-Knowledge Commitments**: Hash-based trait commitments
- **World ID Integration**: KYC verification without compromising privacy
- **User Controls**: Spending caps, opt-out, revoke proofs

### 💰 Aligned Incentives
- **Two-Sided Staking**: Both agents stake to lock commitment
- **No-Show Prevention**: Policies deter flakes without shaming
- **Transparent Process**: Clear consent gates on all actions

## How Mofo Works

The landing page explains the complete user journey:

1. **Verify with World ID** - Complete KYC verification
2. **EEG Session** - 60-second brainwave scan with emotional prompts
3. **uAgent Deployment** - AI agent auto-swipes and negotiates
4. **Match & Staking** - Accept matches and stake commitment

## Tech Stack

- **Frontend Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI with shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Key Concepts

- **uAgent**: Your autonomous dating agent constrained by your traits and preferences
- **ENS**: Human-readable agent identity (e.g., name.mofo.eth)
- **Trait Commitment**: Hash of EEG-derived traits; verifiable without revealing raw data
- **Mofo Hub**: Laptop station for secure QR-based streaming sessions
- **Stake**: Small, configurable amount locked by both parties' agents

## Privacy & Data Collection

### What We Collect:
- EEG features → trait commitment (hash)
- User-set preferences
- Opt-in consent flags

### What We Don't:
- Raw EEG data
- Identifiable chat content
- Your contacts

### Your Controls:
- Spending/staking caps
- Opt-out anytime
- Revoke proofs
- Pause/stop agent
- Consent gates on all actions

## Development

### Prerequisites
- Node.js 18+
- pnpm 8+

### Environment Variables
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WORLD_ID_APP_ID=your_world_id_app_id
```

## Contributing

This project is part of the Mofo ecosystem. For the complete application, see the main [Mofo repository](../../README.md).