#!/bin/bash

# Wikipedia vs Grokipedia Analysis - Quick Start Script

echo "🚀 Starting Wikipedia vs Grokipedia Analysis System"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚡ Please edit .env and add your API keys before running the app"
    echo ""
fi

# Run the application
echo "✅ Starting Flask application..."
echo "🌐 Dashboard will be available at: http://localhost:5000"
echo ""
python app.py
