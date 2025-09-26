# MOFO - Agentic Hookups

An AI-powered matching and interaction platform that leverages agentic AI to facilitate meaningful connections and interactions.

## Architecture

This is a monorepo containing the following packages:

- **`packages/app`** - Frontend web application (Next.js)
- **`packages/api`** - Backend API server (Node.js/Express)
- **`packages/agent`** - AI agent logic and ML models
- **`packages/contracts`** - Smart contracts (Solidity/Foundry)
- **`packages/shared`** - Shared utilities and types

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

4. Start development servers:
   ```bash
   pnpm dev
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
