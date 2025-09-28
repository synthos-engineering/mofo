#!/bin/bash

# ASI Service Startup Script

echo "🚀 Starting ASI Integration Service..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found. Creating from .env.example..."
    cp .env.example .env.local
    echo "📝 Please update .env.local with your actual API keys and agent template address"
fi

# Check Redis
echo "🔍 Checking Redis connection..."
redis-cli ping > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Redis is not running. Please start Redis first:"
    echo "   macOS: brew services start redis"
    echo "   Docker: docker run -d -p 6379:6379 redis:7-alpine"
    exit 1
fi
echo "✅ Redis is running"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Build TypeScript if needed
if [ ! -d "dist" ]; then
    echo "🔨 Building TypeScript..."
    pnpm build
fi

# Start the ASI service
echo ""
echo "🎯 Starting ASI Service with:"
echo "   • Proxy Port: 4000"
echo "   • WebSocket Port: 4001"
echo "   • Redis: localhost:6379"
echo ""

# Check if running in development or production
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Running in production mode..."
    node dist/index.js
else
    echo "🔧 Running in development mode..."
    pnpm dev
fi