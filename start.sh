#!/bin/bash

echo "🚀 Starting Mezmo Syslog Monitor..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env with your Supabase credentials"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "Starting services..."
echo ""
echo "✅ Syslog receiver will start on port 514 (requires sudo)"
echo "✅ Web dashboard will start on port 3000"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start both services
sudo node syslog-receiver.js &
SYSLOG_PID=$!

node server.js &
WEB_PID=$!

# Wait for both processes
wait $SYSLOG_PID $WEB_PID
