#!/bin/bash

# Setup script for AI Travel Voice Agent

echo "🚀 Setting up AI Travel Voice Agent..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt
pip install -r app/api/requirements.txt
pip install -r app/frontend/requirements.txt
pip install -r agent/requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs db/data

# Copy environment template
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env with your API keys"
fi

# Install MCP server dependencies
echo "📦 Installing MCP server dependencies..."
cd agent && npm install && cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your API keys"
echo "2. Run: python run.py --with-agent"

