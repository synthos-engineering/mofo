# WebSocket Relayer Server

A Python WebSocket server that relays messages between Scanner and Booth sides.

## Features

- **Booth Registration**: Booths can register themselves with a unique booth ID
- **Persistent Connections**: Maintains persistent WebSocket connections with registered booths
- **Scanner Connection**: Scanners can connect to specific booths using booth ID from QR codes
- **Message Relaying**: Bidirectional message relay between scanners and booths
- **Connection Management**: Handles disconnections and notifies connected parties

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Starting the Server

```bash
python server.py
```

The server will start on `ws://localhost:8765`

### Booth Side Connection

Booths should connect and register with their booth ID:

```javascript
const ws = new WebSocket('ws://localhost:8765');

ws.onopen = () => {
    // Register booth with ID
    ws.send(JSON.stringify({
        type: 'register_booth',
        booth_id: 'booth_001'
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Booth received:', data);
    
    // Handle different message types
    switch(data.type) {
        case 'registration_success':
            console.log('Booth registered successfully');
            break;
        case 'scanner_connected':
            console.log('Scanner connected to booth');
            break;
        case 'message_from_scanner':
            console.log('Message from scanner:', data.data);
            break;
    }
};
```

### Scanner Side Connection

Scanners connect using booth ID obtained from QR code:

```javascript
const ws = new WebSocket('ws://localhost:8765');

ws.onopen = () => {
    // Connect to specific booth
    ws.send(JSON.stringify({
        type: 'connect_scanner',
        booth_id: 'booth_001'  // From QR code
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Scanner received:', data);
    
    switch(data.type) {
        case 'connection_success':
            console.log('Connected to booth successfully');
            break;
        case 'message_from_booth':
            console.log('Message from booth:', data.data);
            break;
    }
};
```

### Sending Messages

To relay messages between scanner and booth:

```javascript
// From booth to scanner
ws.send(JSON.stringify({
    type: 'relay_message',
    data: {
        message: 'Hello from booth!',
        status: 'ready'
    }
}));

// From scanner to booth  
ws.send(JSON.stringify({
    type: 'relay_message',
    data: {
        message: 'Hello from scanner!',
        action: 'start_scan'
    }
}));
```

## Message Types

### Registration Messages

- `register_booth`: Register a booth with booth_id
- `connect_scanner`: Connect scanner to specific booth_id

### Relay Messages

- `relay_message`: Send data to be relayed to the other party

### System Messages

- `registration_success`: Booth registration confirmed
- `connection_success`: Scanner connection confirmed
- `scanner_connected`: Notification to booth about scanner connection
- `scanner_disconnected`: Notification to booth about scanner disconnection  
- `booth_disconnected`: Notification to scanner about booth disconnection
- `message_from_booth`: Relayed message from booth to scanner
- `message_from_scanner`: Relayed message from scanner to booth
- `error`: Error message
- `ping`/`pong`: Keep-alive messages

## Testing

Use the provided client examples:

```bash
# Terminal 1: Start booth
python client_examples.py booth booth_001

# Terminal 2: Start scanner
python client_examples.py scanner booth_001
```

## Architecture

```
Scanner (QR Code) → WebSocket → Relayer Server → WebSocket → Booth
                                     ↕
                              [Booth Registry]
                              booth_001 → ws_conn_1
                              booth_002 → ws_conn_2
```

The relayer server maintains:
- `booth_connections`: Maps booth IDs to WebSocket connections
- `scanner_connections`: Maps scanner WebSocket connections to booth IDs
- Bidirectional message relay between connected parties