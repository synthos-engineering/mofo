# MOFO - My On-chain Flirt Operator

An AI-powered matching and interaction platform that leverages agentic AI to facilitate meaningful connections and interactions.

## Architecture

This is a monorepo containing the following packages:

- **`packages/app`** - Frontend web application (Next.js)
- **`packages/api`** - Backend API server (Node.js/Express)
- **`packages/agent`** - AI agent logic and ML models
- **`packages/contracts`** - Smart contracts (Solidity/Foundry)
- **`packages/shared`** - Shared utilities and types
- **`packages/landing-page`**- Marketing landing page (Next.js)

## 🌍 WorldCoin Integration
Mofo leverages WordCoin's World ID for privacy-first user verification
- **World ID Verification**: Users prove they're human without sharing personal data
- **Minikit SDK**: Seamless integration with World App
- **Backend Verification**: Cloud-based proof validation

### WorldCoin Bounty Compliance

✅ **Mini App with MiniKit** - Complete MiniKit integration  
✅ **SDK Commands** - Wallet auth, haptic feedback, notifications   
✅ **Backend Verification** - Cloud proof validation required

[View WorldCoin implementation details](./packages/app/src/app/api/verify/route.ts)

## 🚀 Core Features

### 🧠 **EEG-Based Personality Matching**
- 60-second EEG sessions capture emotional preferences
- Local processing ensures brain data never leaves your device
- AI agents match based on neurological compatibility

### 🤖 **Autonomous Dating Agents**
- Agent-to-agent conversations for compatability testing
- Automated swiping and date coordination

### 🔒 **Privacy-First Design**
- World ID verification without personal data sharing

### 💰 **Aligned Incentives**
- Two-sided staking reduces no-shows
- Comitment mechanisms deter flakes
- Transparent policies for all interactions

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mofo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

4. **Configure WorldCoin Integration:**
   ```bash
   # Required for WorldCoin integration
   NEXT_PUBLIC_WLD_APP_ID=app_your_worldcoin_app_id
   
   # Optional for full features
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=postgresql://user:password@localhost:5432/mofo_db   

5. Start development servers:
   ```bash
   pnpm dev
   ```

## 🛠️ Development Scripts

### **Root Level Commands**
```bash
# Install all dependencies
pnpm install

# Run all packages in development
pnpm dev

# Run only the main app
pnpm dev:app

# Run only the landing page
pnpm dev:landing

# Build all packages
pnpm build
```

### **Package-Specific Commands**
```bash
# Main app (packages/app)
cd packages/app
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Landing page (packages/landing-page)
cd packages/landing-page
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
```

## 📁 Updated Project Structure

```
mofo/
├── packages/
│   ├── app/                    # Main Mofo application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── api/        # Backend API routes
│   │   │   │   │   └── verify/ # WorldCoin verification
│   │   │   │   └── layout.tsx  # MiniKit provider setup
│   │   │   ├── components/     # React components
│   │   │   │   ├── onboarding/ # User onboarding flow
│   │   │   │   └── providers/  # MiniKit provider
│   │   │   └── lib/            # Utilities
│   │   └── package.json
│   └── landing-page/           # Mofo landing page
│       ├── app/
│       │   ├── layout.tsx      # Landing page layout
│       │   └── page.tsx        # Landing page content
│       ├── components/         # Landing page components
│       └── public/             # Static assets
├── package.json                # Root package configuration
└── README.md
```

## Available Scripts

- `pnpm dev` - Start all development servers in parallel
- `pnpm build` - Build all packages
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm clean` - Clean build artifacts

## Project Structure

```
mofo/
├── packages/
│   ├── app/          # Frontend application
│   ├── api/          # Backend API
│   ├── agent/        # AI agent logic
│   ├── contracts/    # Smart contracts
│   └── shared/       # Shared utilities
├── package.json      # Root package configuration
├── pnpm-workspace.yaml
├── tsconfig.json     # TypeScript configuration
├── .gitignore
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details
