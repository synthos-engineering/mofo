#!/bin/bash

# Start EEG Booth Server with integrated OpenBCI
echo "Starting EEG Booth Server with integrated OpenBCI..."
echo "This will:"
echo "  - Start booth server on port 3004"  
echo "  - Start EEG WebSocket server on port 8765"
echo "  - Connect to OpenBCI hardware when scanner connects"

cd booth-backend

# Check if Python requirements are installed
if ! python3 -c "import websockets, serial, numpy, scipy" 2>/dev/null; then
    echo "Installing Python requirements..."
    pip3 install -r requirements.txt
fi

# Start the integrated booth server
echo "Starting integrated booth server with EEG capabilities..."
python3 booth_server.py