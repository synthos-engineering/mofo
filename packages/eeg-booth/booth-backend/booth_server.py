import asyncio
import websockets
import json
import logging
import uuid
import threading
import ssl
import os
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BoothBackend:
    def __init__(self, booth_id=None, relayer_url="wss://172.24.244.146:8765", frontend_port=3004):
        self.booth_id = booth_id or f"booth_{uuid.uuid4().hex[:8]}"
        self.relayer_url = relayer_url
        self.frontend_port = frontend_port
        self.websocket = None
        self.is_connected = False
        self.scanner_connected = False
        self.connection_status = "disconnected"
        
        # Flask app for serving frontend data
        self.app = Flask(__name__)
        CORS(self.app)
        self.setup_routes()
    
    def setup_routes(self):
        """Setup Flask routes for frontend communication"""
        
        @self.app.route('/status', methods=['GET'])
        def get_status():
            return jsonify({
                'booth_id': self.booth_id,
                'is_connected': self.is_connected,
                'scanner_connected': self.scanner_connected,
                'connection_status': self.connection_status,
                'timestamp': datetime.now().isoformat()
            })
        
        @self.app.route('/booth-info', methods=['GET'])
        def get_booth_info():
            return jsonify({
                'booth_id': self.booth_id,
                'qr_data': {
                    'booth_id': self.booth_id,
                    'relayer_url': self.relayer_url.replace('ws://', 'wss://').replace('localhost', '127.0.0.1')
                },
                'status': self.connection_status
            })
        
        @self.app.route('/send-message', methods=['POST'])
        def send_message():
            # Future endpoint for sending messages to scanner
            return jsonify({'status': 'message_sent'})
    
    async def connect_to_relayer(self):
        """Connect to the relayer server and register booth"""
        max_retries = 5
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                logger.info(f"Attempting to connect to relayer at {self.relayer_url}")
                
                # SSL configuration for WSS connections
                if self.relayer_url.startswith('wss://'):
                    ssl_context = ssl.create_default_context()
                    # For self-signed certificates, disable verification
                    ssl_context.check_hostname = False
                    ssl_context.verify_mode = ssl.CERT_NONE
                    self.websocket = await websockets.connect(self.relayer_url, ssl=ssl_context)
                else:
                    self.websocket = await websockets.connect(self.relayer_url)
                
                # Register booth
                registration_message = {
                    "type": "register_booth",
                    "booth_id": self.booth_id,
                    "timestamp": datetime.now().isoformat()
                }
                
                await self.websocket.send(json.dumps(registration_message))
                logger.info(f"Booth {self.booth_id} registration sent")
                
                self.is_connected = True
                self.connection_status = "connected"
                
                # Listen for messages
                await self.listen_for_messages()
                
            except Exception as e:
                retry_count += 1
                logger.error(f"Connection failed (attempt {retry_count}): {e}")
                self.is_connected = False
                self.connection_status = "connection_failed"
                
                if retry_count < max_retries:
                    await asyncio.sleep(5)  # Wait before retry
                else:
                    logger.error("Max retries reached. Could not connect to relayer.")
                    break
    
    async def listen_for_messages(self):
        """Listen for messages from the relayer server"""
        try:
            async for message in self.websocket:
                try:
                    data = json.loads(message)
                    await self.handle_message(data)
                except json.JSONDecodeError:
                    logger.error("Received invalid JSON message")
                except Exception as e:
                    logger.error(f"Error handling message: {e}")
        
        except websockets.exceptions.ConnectionClosed:
            logger.info("Connection to relayer closed")
            self.is_connected = False
            self.scanner_connected = False
            self.connection_status = "disconnected"
        
        except Exception as e:
            logger.error(f"Error in message listener: {e}")
            self.is_connected = False
            self.connection_status = "error"
    
    async def handle_message(self, data):
        """Handle different types of messages from relayer"""
        message_type = data.get('type')
        
        logger.info(f"Booth received message: {data}")
        
        if message_type == 'registration_success':
            logger.info(f"Booth {self.booth_id} registered successfully")
            self.connection_status = "registered"
        
        elif message_type == 'scanner_connected':
            logger.info("Scanner connected to booth")
            self.scanner_connected = True
            self.connection_status = "user_connected"
            
            # Send welcome message to scanner
            welcome_message = {
                "type": "relay_message",
                "data": {
                    "message": f"Welcome to Booth {self.booth_id}!",
                    "status": "ready",
                    "booth_info": {
                        "name": f"EEG Booth {self.booth_id}",
                        "capabilities": ["eeg_recording", "brain_analysis"]
                    }
                }
            }
            await self.send_to_relayer(welcome_message)
        
        elif message_type == 'scanner_disconnected':
            logger.info("Scanner disconnected from booth")
            self.scanner_connected = False
            self.connection_status = "registered"
        
        elif message_type == 'message_from_scanner':
            scanner_data = data.get('data', {})
            logger.info(f"Message from scanner: {scanner_data}")
            
            # Handle different scanner messages
            if scanner_data.get('action') == 'connection_established':
                logger.info("Scanner established connection")
                self.connection_status = "user_connected"
                
                # Respond to scanner
                response = {
                    "type": "relay_message",
                    "data": {
                        "message": "Connection confirmed",
                        "status": "booth_ready",
                        "next_steps": "Please wait for EEG setup instructions"
                    }
                }
                await self.send_to_relayer(response)
            
            elif scanner_data.get('action') == 'start_session':
                logger.info("Starting EEG session")
                # Simulate EEG session start
                response = {
                    "type": "relay_message",
                    "data": {
                        "message": "EEG session started",
                        "status": "recording",
                        "session_id": f"session_{uuid.uuid4().hex[:8]}"
                    }
                }
                await self.send_to_relayer(response)
        
        elif message_type == 'error':
            logger.error(f"Error from relayer: {data.get('message')}")
            self.connection_status = "error"
    
    async def send_to_relayer(self, message):
        """Send message to relayer server"""
        if self.websocket and self.is_connected:
            try:
                await self.websocket.send(json.dumps(message))
                logger.info(f"Sent to relayer: {message}")
            except Exception as e:
                logger.error(f"Failed to send message to relayer: {e}")
        else:
            logger.warning("Cannot send message: not connected to relayer")
    
    def start_flask_server(self):
        """Start Flask server in a separate thread"""
        def run_flask():
            self.app.run(host='0.0.0.0', port=self.frontend_port, debug=False)
        
        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()
        logger.info(f"Flask server started on port {self.frontend_port}")
    
    async def run(self):
        """Main run method"""
        logger.info(f"Starting Booth Backend with ID: {self.booth_id}")
        
        # Start Flask server for frontend communication
        self.start_flask_server()
        
        # Connect to relayer server
        await self.connect_to_relayer()

async def main():
    # You can specify booth_id as command line argument or let it auto-generate
    import sys
    
    booth_id = None
    if len(sys.argv) > 1:
        booth_id = sys.argv[1]
    
    booth = BoothBackend(booth_id=booth_id)
    
    try:
        await booth.run()
    except KeyboardInterrupt:
        logger.info("Booth backend stopped by user")
    except Exception as e:
        logger.error(f"Booth backend error: {e}")

if __name__ == "__main__":
    asyncio.run(main())