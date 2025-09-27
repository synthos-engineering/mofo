"""
Example client scripts for testing the WebSocket Relayer Server
"""

import asyncio
import websockets
import json
import sys

async def booth_client(booth_id):
    """Example booth client"""
    uri = "ws://localhost:8765"
    
    async with websockets.connect(uri) as websocket:
        # Register as booth
        registration_message = {
            "type": "register_booth",
            "booth_id": booth_id
        }
        
        await websocket.send(json.dumps(registration_message))
        print(f"Booth {booth_id} registration sent")
        
        # Listen for messages
        async for message in websocket:
            data = json.loads(message)
            print(f"Booth {booth_id} received: {data}")
            
            # If scanner connected, send a welcome message
            if data.get('type') == 'scanner_connected':
                welcome_message = {
                    "type": "relay_message",
                    "data": {
                        "message": f"Welcome to Booth {booth_id}!",
                        "status": "ready"
                    }
                }
                await websocket.send(json.dumps(welcome_message))
                print(f"Booth {booth_id} sent welcome message")

async def scanner_client(booth_id):
    """Example scanner client"""
    uri = "ws://localhost:8765"
    
    async with websockets.connect(uri) as websocket:
        # Connect to specific booth
        connect_message = {
            "type": "connect_scanner",
            "booth_id": booth_id
        }
        
        await websocket.send(json.dumps(connect_message))
        print(f"Scanner connecting to booth {booth_id}")
        
        # Send a test message after connection
        await asyncio.sleep(1)
        test_message = {
            "type": "relay_message",
            "data": {
                "message": "Hello from scanner!",
                "action": "start_scan"
            }
        }
        await websocket.send(json.dumps(test_message))
        print("Scanner sent test message")
        
        # Listen for messages
        async for message in websocket:
            data = json.loads(message)
            print(f"Scanner received: {data}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python client_examples.py [booth|scanner] [booth_id]")
        sys.exit(1)
    
    client_type = sys.argv[1]
    booth_id = sys.argv[2]
    
    if client_type == "booth":
        asyncio.run(booth_client(booth_id))
    elif client_type == "scanner":
        asyncio.run(scanner_client(booth_id))
    else:
        print("Client type must be 'booth' or 'scanner'")