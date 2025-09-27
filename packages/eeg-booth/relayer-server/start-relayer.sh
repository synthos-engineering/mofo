#!/bin/bash

# Relayer Server Startup Script
echo "🔗 Starting WebSocket Relayer Server..."

# Check if we're in the right directory
if [ ! -f "server.py" ]; then
    echo "❌ Error: Please run this script from the relayer-server directory"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Shutting down Relayer Server..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "📦 Setting up Python environment..."

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing Python dependencies..."
pip3 install -q -r requirements.txt

echo "🚀 Starting WebSocket Relayer Server on port 8765..."
python3 server.py

echo ""
echo "✅ Relayer Server Started Successfully!"
echo ""
echo "🔗 WebSocket Server: ws://localhost:8765"
echo "📊 Ready to accept booth and scanner connections"
echo ""
echo "Press Ctrl+C to stop the server..."