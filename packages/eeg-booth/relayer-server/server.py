import asyncio
import websockets
import json
import logging
import ssl
import os
from typing import Dict, Set
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RelayerServer:
    def __init__(self):
        # Store booth connections: booth_id -> websocket
        self.booth_connections: Dict[str, websockets.WebSocketServerProtocol] = {}
        
        # Store scanner connections: websocket -> booth_id (for tracking which booth they're connected to)
        self.scanner_connections: Dict[websockets.WebSocketServerProtocol, str] = {}
        
        # Store all active connections for cleanup
        self.all_connections: Set[websockets.WebSocketServerProtocol] = set()
    
    async def handle_booth_registration(self, websocket, data):
        """Handle booth registration with booth_id"""
        booth_id = data.get('booth_id')
        
        if not booth_id:
            await self.send_error(websocket, "Missing booth_id in registration")
            return False
        
        # Store the booth connection
        self.booth_connections[booth_id] = websocket
        self.all_connections.add(websocket)
        
        logger.info(f"Booth {booth_id} registered successfully")
        
        # Send confirmation
        await self.send_message(websocket, {
            'type': 'registration_success',
            'booth_id': booth_id,
            'timestamp': datetime.now().isoformat()
        })
        
        return True
    
    async def handle_scanner_connection(self, websocket, data):
        """Handle scanner connection to a specific booth"""
        booth_id = data.get('booth_id')
        
        if not booth_id:
            await self.send_error(websocket, "Missing booth_id for scanner connection")
            return False
        
        if booth_id not in self.booth_connections:
            await self.send_error(websocket, f"Booth {booth_id} is not available")
            return False
        
        # Store scanner connection
        self.scanner_connections[websocket] = booth_id
        self.all_connections.add(websocket)
        
        logger.info(f"Scanner connected to booth {booth_id}")
        
        # Notify booth about scanner connection
        booth_websocket = self.booth_connections[booth_id]
        await self.send_message(booth_websocket, {
            'type': 'scanner_connected',
            'booth_id': booth_id,
            'timestamp': datetime.now().isoformat()
        })
        
        # Confirm to scanner
        await self.send_message(websocket, {
            'type': 'connection_success',
            'booth_id': booth_id,
            'timestamp': datetime.now().isoformat()
        })
        
        return True
    
    async def relay_message(self, sender_websocket, data):
        """Relay messages between scanner and booth"""
        message_type = data.get('type')
        target = data.get('target')  # 'booth' or 'scanner'
        
        if sender_websocket in self.scanner_connections:
            # Message from scanner to booth
            booth_id = self.scanner_connections[sender_websocket]
            if booth_id in self.booth_connections:
                booth_websocket = self.booth_connections[booth_id]
                await self.send_message(booth_websocket, {
                    'type': 'message_from_scanner',
                    'data': data.get('data'),
                    'original_type': message_type,
                    'timestamp': datetime.now().isoformat()
                })
                logger.info(f"Relayed message from scanner to booth {booth_id}")
            else:
                await self.send_error(sender_websocket, "Booth is no longer available")
        
        elif sender_websocket in self.booth_connections.values():
            # Message from booth to scanner
            booth_id = None
            for bid, ws in self.booth_connections.items():
                if ws == sender_websocket:
                    booth_id = bid
                    break
            
            if booth_id:
                # Find scanner connected to this booth
                scanner_websocket = None
                for scanner_ws, connected_booth_id in self.scanner_connections.items():
                    if connected_booth_id == booth_id:
                        scanner_websocket = scanner_ws
                        break
                
                if scanner_websocket:
                    await self.send_message(scanner_websocket, {
                        'type': 'message_from_booth',
                        'data': data.get('data'),
                        'original_type': message_type,
                        'booth_id': booth_id,
                        'timestamp': datetime.now().isoformat()
                    })
                    logger.info(f"Relayed message from booth {booth_id} to scanner")
                else:
                    await self.send_error(sender_websocket, "No scanner connected")
    
    async def send_message(self, websocket, message):
        """Send JSON message to websocket"""
        try:
            await websocket.send(json.dumps(message))
        except websockets.exceptions.ConnectionClosed:
            logger.warning("Attempted to send message to closed connection")
    
    async def send_error(self, websocket, error_message):
        """Send error message to websocket"""
        await self.send_message(websocket, {
            'type': 'error',
            'message': error_message,
            'timestamp': datetime.now().isoformat()
        })
    
    async def handle_disconnect(self, websocket):
        """Clean up when a connection is closed"""
        # Remove from all connections
        self.all_connections.discard(websocket)
        
        # Check if it was a booth connection
        booth_to_remove = None
        for booth_id, ws in self.booth_connections.items():
            if ws == websocket:
                booth_to_remove = booth_id
                break
        
        if booth_to_remove:
            del self.booth_connections[booth_to_remove]
            logger.info(f"Booth {booth_to_remove} disconnected")
            
            # Notify any connected scanners
            for scanner_ws, connected_booth_id in list(self.scanner_connections.items()):
                if connected_booth_id == booth_to_remove:
                    await self.send_message(scanner_ws, {
                        'type': 'booth_disconnected',
                        'booth_id': booth_to_remove,
                        'timestamp': datetime.now().isoformat()
                    })
        
        # Check if it was a scanner connection
        if websocket in self.scanner_connections:
            booth_id = self.scanner_connections[websocket]
            del self.scanner_connections[websocket]
            logger.info(f"Scanner disconnected from booth {booth_id}")
            
            # Notify booth
            if booth_id in self.booth_connections:
                booth_websocket = self.booth_connections[booth_id]
                await self.send_message(booth_websocket, {
                    'type': 'scanner_disconnected',
                    'booth_id': booth_id,
                    'timestamp': datetime.now().isoformat()
                })
    
    async def handle_client(self, websocket):
        """Handle new client connection"""
        logger.info(f"New client connected from {websocket.remote_address}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    message_type = data.get('type')
                    
                    if message_type == 'register_booth':
                        await self.handle_booth_registration(websocket, data)
                    
                    elif message_type == 'connect_scanner':
                        await self.handle_scanner_connection(websocket, data)
                    
                    elif message_type == 'relay_message':
                        await self.relay_message(websocket, data)
                    
                    elif message_type == 'ping':
                        await self.send_message(websocket, {
                            'type': 'pong',
                            'timestamp': datetime.now().isoformat()
                        })
                    
                    else:
                        await self.send_error(websocket, f"Unknown message type: {message_type}")
                
                except json.JSONDecodeError:
                    await self.send_error(websocket, "Invalid JSON message")
                except Exception as e:
                    logger.error(f"Error handling message: {e}")
                    await self.send_error(websocket, "Internal server error")
        
        except websockets.exceptions.ConnectionClosed:
            logger.info("Client disconnected")
        
        finally:
            await self.handle_disconnect(websocket)
    
    async def get_status(self):
        """Get server status"""
        return {
            'active_booths': len(self.booth_connections),
            'active_scanners': len(self.scanner_connections),
            'total_connections': len(self.all_connections),
            'booth_ids': list(self.booth_connections.keys())
        }

async def main():
    relayer = RelayerServer()
    
    # Configuration
    use_ssl = os.getenv('USE_SSL', 'false').lower() == 'true'
    port = int(os.getenv('PORT', '8765'))
    cert_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'certificates')
    
    # Start the server with proper handler signature for websockets 11+
    async def connection_handler(websocket):
        await relayer.handle_client(websocket)
    
    if use_ssl:
        # SSL Configuration
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        cert_file = os.path.join(cert_dir, 'relayer-certificate.pem')
        key_file = os.path.join(cert_dir, 'relayer-private-key.pem')
        
        if not os.path.exists(cert_file) or not os.path.exists(key_file):
            logger.error(f"SSL certificates not found in {cert_dir}")
            logger.error("Run ./create-certificates.sh to generate certificates")
            return
        
        ssl_context.load_cert_chain(cert_file, key_file)
        
        logger.info(f"Starting WebSocket Relayer Server with SSL on port {port}")
        logger.info(f"Using certificates from: {cert_dir}")
        
        async with websockets.serve(connection_handler, "0.0.0.0", port, ssl=ssl_context):
            logger.info("Secure WebSocket Relayer Server (WSS) is running...")
            # Keep the server running
            await asyncio.Future()  # Run forever
    else:
        logger.info(f"Starting WebSocket Relayer Server on port {port}")
        logger.info("Note: Using unsecured WebSocket (WS). Set USE_SSL=true for secure connections.")
        
        async with websockets.serve(connection_handler, "0.0.0.0", port):
            logger.info("WebSocket Relayer Server is running...")
            # Keep the server running
            await asyncio.Future()  # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")