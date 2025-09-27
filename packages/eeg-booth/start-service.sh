#!/bin/bash

# EEG Booth Complete System Startup Script
echo "🧠 Starting Complete EEG Booth System..."

# Check if we're in the right directory
if [ ! -d "relayer-server" ] || [ ! -d "booth-backend" ] || [ ! -d "booth-frontend" ]; then
    echo "❌ Error: Please run this script from the eeg-booth directory"
    echo "   Required directories: relayer-server, booth-backend, booth-frontend"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Shutting down Complete EEG Booth System..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🔗 Step 1: Starting Relayer Server..."
cd relayer-server

# Setup relayer server environment
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment for relayer..."
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

echo "🚀 Starting WebSocket Relayer Server (port 8765)..."
python server.py &
RELAYER_PID=$!

echo "⏳ Waiting for relayer server to start..."
sleep 3

cd ../booth-backend

echo "🏢 Step 2: Starting Booth Backend..."

# Setup booth backend environment  
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment for booth backend..."
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

echo "🚀 Starting Booth Backend Server..."
python booth_server.py &
BOOTH_BACKEND_PID=$!

echo "⏳ Waiting for booth backend to start..."
sleep 2

cd ../booth-frontend

echo "📱 Step 3: Starting Booth Frontend..."
echo "📦 Installing frontend dependencies..."
npm install --silent

echo "🚀 Starting Booth Frontend (port 3003)..."
PORT=3003 npm start &
BOOTH_FRONTEND_PID=$!

echo "⏳ Waiting for frontend to start..."
sleep 5

echo ""
echo "✅ Complete EEG Booth System Started Successfully!"
echo ""
echo "🌐 System URLs:"
echo "   • Relayer Server: ws://localhost:8765"  
echo "   • Booth Backend API: http://localhost:3004/status"
echo "   • Booth Frontend UI: http://localhost:3003"
echo ""
echo "📊 Process Status:"
echo "   • Relayer Server: Running (PID: $RELAYER_PID)"
echo "   • Booth Backend: Running (PID: $BOOTH_BACKEND_PID)"
echo "   • Booth Frontend: Running (PID: $BOOTH_FRONTEND_PID)"
echo ""
echo "🔄 System Flow:"
echo "   1. Booth registers with relayer server"
echo "   2. Frontend displays QR code with booth ID"
echo "   3. Scanner scans QR code to connect"
echo "   4. Messages relay between scanner ↔ relayer ↔ booth"
echo ""
echo "📱 Next Steps:"
echo "   • Open http://localhost:3003 to see the booth interface"
echo "   • Use scanner app to scan the displayed QR code"
echo "   • Monitor logs for connection events"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for all processes
wait