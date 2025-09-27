# EEG Booth System

A complete booth system that connects scanners and booth stations through a WebSocket relayer server.

## System Architecture

```
Scanner App → QR Code → WebSocket Relayer → Booth Backend → Booth Frontend
                             ↕
                    [Persistent Connections]
```

## Components

### 1. Booth Backend (`booth-backend/`)
- Python WebSocket client that connects to the relayer server
- Registers the booth with a unique booth ID
- Maintains persistent connection to relayer
- Provides REST API for frontend communication
- Handles scanner connection events and messages

### 2. Booth Frontend (`booth-frontend/`)
- React application running on port 3003
- Displays QR code containing booth connection information
- Shows real-time connection status
- Updates UI when scanner connects ("User Connected" state)

### 3. Relayer Server (`relayer-server/`)
- WebSocket server that routes messages between scanners and booths
- Maintains booth registry and scanner connections
- Handles connection management and message relay

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Start the Relayer Server
```bash
cd relayer-server
pip install -r requirements.txt
python server.py
```
The relayer will run on `ws://localhost:8765`

### 2. Start the Booth System
```bash
# From the eeg-booth directory
./start-booth.sh
```

This will:
- Install Python dependencies in a virtual environment
- Start the booth backend server
- Install npm dependencies
- Start the booth frontend on http://localhost:3003

### Manual Startup (Alternative)

#### Backend:
```bash
cd booth-backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python booth_server.py
```

#### Frontend:
```bash
cd booth-frontend
npm install
PORT=3003 npm start
```

## Usage Flow

1. **Booth Registration**: 
   - Backend connects to relayer and registers with unique booth ID
   - Frontend displays QR code with booth connection info

2. **Scanner Connection**:
   - User scans QR code with scanner app
   - Scanner connects to relayer using booth ID from QR code
   - Scanner sends connection message to booth

3. **Connected State**:
   - Booth receives scanner connection event
   - Frontend UI changes to "User Connected" state
   - Bidirectional communication established

## API Endpoints

### Booth Backend REST API (Port varies by booth)

- `GET /status` - Get booth connection status
- `GET /booth-info` - Get booth information and QR code data
- `POST /send-message` - Send message to connected scanner

## Configuration

### Environment Variables
- `BOOTH_ID` - Custom booth identifier (optional, auto-generates if not set)
- `RELAYER_URL` - WebSocket relayer URL (default: ws://localhost:8765)
- `FRONTEND_PORT` - Frontend port (default: 3002)

### Custom Booth ID
```bash
# Start with custom booth ID
cd booth-backend
python booth_server.py my_custom_booth_id
```

## QR Code Content

The QR code contains JSON data:
```json
{
  "booth_id": "booth_abc12345",
  "relayer_url": "ws://localhost:8765"
}
```

## Connection States

- **Disconnected**: Not connected to relayer
- **Connecting**: Attempting to connect
- **Registered**: Connected and registered with relayer
- **User Connected**: Scanner connected and session active

## Scanner Integration

For scanner apps to connect:

1. Scan booth QR code to get booth_id and relayer_url
2. Connect to relayer WebSocket
3. Send connection message:
```javascript
{
  "type": "connect_scanner",
  "booth_id": "booth_abc12345"
}
```
4. Send connection confirmation:
```javascript
{
  "type": "relay_message",
  "data": {
    "action": "connection_established",
    "message": "Scanner connected"
  }
}
```

## Development

### Project Structure
```
eeg-booth/
├── booth-backend/          # Python WebSocket client + REST API
│   ├── booth_server.py
│   └── requirements.txt
├── booth-frontend/         # React UI displaying QR code
│   ├── src/
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
├── relayer-server/         # WebSocket message relay
└── start-booth.sh         # Startup script
```

### Adding Features

1. **Custom Messages**: Extend `handle_message()` in booth_server.py
2. **UI Updates**: Modify React components in booth-frontend/src/
3. **New Endpoints**: Add routes to Flask app in booth_server.py

## Troubleshooting

### Common Issues

1. **Port 3002 in use**: Change `FRONTEND_PORT` or kill existing process
2. **Relayer connection failed**: Ensure relayer server is running on port 8765
3. **QR code not generating**: Check browser console for QRCode library errors
4. **WebSocket connection issues**: Verify relayer server accessibility

### Logs

- Backend logs: Terminal running booth_server.py
- Frontend logs: Browser console (F12)
- Relayer logs: Terminal running relayer server

## Production Deployment

1. **Environment**: Use production WebSocket URLs in QR codes
2. **Security**: Add authentication and encryption for production use
3. **Scaling**: Consider using Redis for multi-instance booth management
4. **Monitoring**: Add health checks and monitoring endpoints