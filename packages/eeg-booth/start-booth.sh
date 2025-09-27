#!/bin/bash

# Booth System Startup Script
echo "🧠 Starting EEG Booth System..."

# Check if we're in the right directory
if [ ! -d "booth-backend" ] || [ ! -d "booth-frontend" ]; then
    echo "❌ Error: Please run this script from the eeg-booth directory"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Shutting down Booth System..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "📦 Installing booth backend dependencies..."
cd booth-backend
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing Python dependencies..."
pip install -q -r requirements.txt

echo "🚀 Starting booth backend server..."
python booth_server.py &
BACKEND_PID=$!

cd ../booth-frontend

echo "📦 Installing booth frontend dependencies..."
npm install --silent

echo "🚀 Starting booth frontend (port 3003)..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Booth System Started Successfully!"
echo ""
echo "📊 System Status:"
echo "   • Backend API: http://localhost:3004/status"
echo "   • Frontend UI: http://localhost:3003"
echo "   • Booth Backend: Running (PID: $BACKEND_PID)"
echo "   • Frontend: Running (PID: $FRONTEND_PID)"
echo ""
echo "📱 The QR code for this booth will be displayed in the frontend"
echo "🔗 Make sure the relayer server is running on ws://localhost:8765"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for both processes
wait