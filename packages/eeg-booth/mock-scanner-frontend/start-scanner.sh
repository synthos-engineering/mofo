#!/bin/bash

# Mock Scanner Frontend Startup Script
echo "📱 Starting Mock Scanner Frontend..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the mock-scanner-frontend directory"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Shutting down Mock Scanner..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "📦 Installing scanner dependencies..."
npm install --silent

echo "🚀 Starting Mock Scanner Frontend on port 3001..."
PORT=3001 HOST=0.0.0.0 npm start &
SCANNER_PID=$!

echo ""
echo "✅ Mock Scanner Started Successfully!"
echo ""
echo "📱 Scanner URLs:"
echo "   • Local: http://localhost:3001"
echo "   • Network: http://0.0.0.0:3001"
echo ""
echo "� Relayer Configuration:"
echo "   • Relayer Server: ws://172.24.244.146:8765"
echo ""
echo "�📊 Features:"
echo "   • QR Code scanning with camera"
echo "   • Manual booth ID entry"  
echo "   • WebSocket connection to relayer"
echo "   • Real-time messaging with booths"
echo ""
echo "📱 Usage:"
echo "   1. Open http://localhost:3001 in your browser"
echo "   2. Click 'Scan QR Code' to use camera"
echo "   3. Or enter booth ID manually"
echo "   4. Connect to booth via relayer server"
echo ""
echo "Press Ctrl+C to stop the scanner..."

# Wait for the process
wait