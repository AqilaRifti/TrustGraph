#!/bin/bash

# TrustGraph Plugin Installation Script
# This script installs and configures the TrustGraph plugin for the DKG Node

set -e

echo "🚀 TrustGraph Plugin Installation"
echo "=================================="
echo ""

# Step 1: Clean and install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install

# Step 2: Build the plugin
echo "🔨 Step 2: Building TrustGraph plugin..."
npm run build

# Step 3: Check if .env exists
echo "⚙️  Step 3: Checking configuration..."
if [ ! -f "apps/agent/.env" ]; then
    echo "⚠️  Warning: apps/agent/.env not found"
    echo "   Please create it and add your Cerebras API keys"
else
    echo "✅ .env file found"
fi

# Step 4: Verify plugin files
echo "🔍 Step 4: Verifying plugin files..."
if [ -d "packages/trustgraph/dist" ]; then
    echo "✅ Plugin built successfully"
else
    echo "❌ Plugin build failed - dist folder not found"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your Cerebras API keys to apps/agent/.env:"
echo "   CEREBRAS_API_KEYS=key1,key2,key3,..."
echo ""
echo "2. Register the plugin in apps/agent/src/server/index.ts:"
echo "   import trustgraphPlugin from '@dkg/trustgraph';"
echo "   plugins: [..., trustgraphPlugin]"
echo ""
echo "3. Start the agent:"
echo "   npm run dev"
echo ""
echo "📖 See TRUSTGRAPH_SETUP.md for detailed instructions"
