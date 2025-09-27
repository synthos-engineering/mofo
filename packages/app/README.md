# Agentic Hookups - World Mini App

AI-powered dating platform that uses EEG brainwave analysis to create personalized AI agents for autonomous matching and dating.

## Features

- **World ID Authentication**: Secure KYC verification using World ID
- **EEG Brain Analysis**: Connect to EEG Hub for neural pattern analysis
- **AI Agent Creation**: Deploy personalized AI agents with unique ENS domains
- **Autonomous Matching**: AI agents swipe and match based on compatibility
- **Agent-to-Agent Communication**: Automated chat between matched agents
- **Date Coordination**: AI agents propose and coordinate real-world meetings
- **Staking Mechanism**: Both parties stake when accepting date proposals

## User Flow

1. **Login with World ID** - Verify identity using World ID for KYC
2. **Scan QR Code** - Connect to EEG Hub laptop via QR code
3. **Brain Wave Session** - EEG headset analyzes neural patterns
4. **Agent Deployment** - AI agent created with unique personality and ENS domain
5. **Autonomous Matching** - Agent swipes profiles automatically
6. **Agent Communication** - Matched agents chat and coordinate
7. **Date Proposal** - If successful, agents propose a date
8. **User Approval** - User reviews and accepts/declines the proposed date
9. **Staking** - Both users stake tokens to confirm the date

## Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- World App installed on mobile device
- EEG Hub setup (separate hardware/software)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:
```bash
cp env.local.example .env.local
# Edit .env.local with your configuration
```

3. Set up World ID:
   - Create an app at [World ID Developer Portal](https://developer.worldcoin.org)
   - Add your app ID to `NEXT_PUBLIC_WLD_APP_ID`
   - Configure redirect URIs for your domain

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in World App

### World ID Configuration

1. **Register your app** at the [World ID Developer Portal](https://developer.worldcoin.org)
2. **Add redirect URIs**: 
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. **Configure action**: Create a "login" action for authentication
4. **Set app metadata**:
   - Name: "Agentic Hookups"
   - Description: "AI-powered dating through neural patterns"

### EEG Hub Integration

The app expects to connect to an EEG Hub that provides:
- QR code for device pairing
- WebSocket endpoint for real-time EEG data
- Neural pattern analysis capabilities

QR code format:
```json
{
  "type": "eeg-hub",
  "hubId": "hub_12345",
  "endpoint": "ws://hub-ip:8080",
  "apiKey": "hub_api_key"
}
```

## Architecture

### Components

- **WorldIDAuth**: Handles World ID verification
- **QRScanner**: Scans EEG Hub QR codes for connection
- **BrainWaveSession**: Manages EEG data collection and analysis
- **AgentDashboard**: Shows agent creation and deployment
- **MatchingInterface**: Handles autonomous swiping and matching

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **World Integration**: @worldcoin/minikit-js
- **State Management**: React Query
- **Camera/QR**: qr-scanner
- **Animations**: Framer Motion, Canvas Confetti

## Development

### Running Tests
```bash
pnpm test
```

### Type Checking
```bash
pnpm type-check
```

### Linting
```bash
pnpm lint
```

### Building
```bash
pnpm build
```

## Deployment

### World Mini App Deployment

1. Build the application:
```bash
pnpm build
```

2. Deploy to a hosting platform (Vercel, Netlify, etc.)

3. Update World ID app configuration:
   - Add production redirect URI
   - Update app metadata if needed

4. Test in World App:
   - Open World App
   - Navigate to Mini Apps
   - Search for your app or use direct link

### Environment Variables

Required for production:
- `NEXT_PUBLIC_WLD_APP_ID`: Your World ID app identifier
- `NEXT_PUBLIC_WLD_ACTION`: World ID action name (usually "login")
- `WLD_CLIENT_SECRET`: World ID client secret (server-side only)
- `NEXT_PUBLIC_APP_URL`: Your production app URL

## Security Considerations

- **World ID Verification**: Always verify World ID proofs server-side
- **EEG Data**: Neural data is processed locally and not permanently stored
- **Agent Communication**: All agent interactions are logged for transparency
- **Staking**: Smart contract handles escrow for date commitments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions:
- Create an issue in this repository
- Check World ID documentation: https://docs.world.org
- Join our Discord community

