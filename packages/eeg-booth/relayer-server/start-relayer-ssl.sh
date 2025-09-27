#!/bin/bash

# Relayer Server SSL Startup Script
echo "🔗 Starting WebSocket Relayer Server with SSL Support..."

# Check if we're in the right directory
if [ ! -f "server.py" ]; then
    echo "❌ Error: Please run this script from the relayer-server directory"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Shutting down SSL Relayer Server..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check for certificates
CERT_DIR="../certificates"
if [ ! -f "$CERT_DIR/relayer-certificate.pem" ] || [ ! -f "$CERT_DIR/relayer-private-key.pem" ]; then
    echo "❌ SSL certificates not found!"
    echo "📁 Expected certificates in: $CERT_DIR"
    echo "🔧 Run ../create-certificates.sh to generate certificates"
    exit 1
fi

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

echo "🔐 SSL Certificate Information:"
echo "   • Certificate: $CERT_DIR/relayer-certificate.pem"
echo "   • Private Key: $CERT_DIR/relayer-private-key.pem"
echo "   • Valid for IP: 172.24.244.146"
echo ""

echo "🚀 Starting Secure WebSocket Relayer Server (WSS) on port 8765..."

# Set environment variables for SSL
export USE_SSL=true
export PORT=8765

python3 server.py

echo ""
echo "✅ SSL Relayer Server Started Successfully!"
echo ""
echo "🔗 Secure WebSocket Server: wss://172.24.244.146:8765"
echo "📊 Ready to accept secure booth and scanner connections"
echo ""
echo "📱 Client Configuration:"
echo "   • Use wss://172.24.244.146:8765 in client applications"
echo "   • Install ca-certificate.pem on client devices for trusted connections"
echo ""
echo "Press Ctrl+C to stop the server..."