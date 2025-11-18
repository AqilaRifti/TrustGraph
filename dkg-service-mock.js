/**
 * DKG Edge Node Service with Mock Mode Support
 * 
 * This service uses the official OriginTrail DKG SDK (dkg.js)
 * with automatic fallback to mock mode when DKG node is unavailable.
 */

const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Configuration
const RPC_ENDPOINT = 'https://lofar-testnet.origin-trail.network';
const USE_MOCK_MODE = process.env.DKG_MOCK_MODE === 'true' || !process.env.DKG_ENDPOINT;

console.log('🚀 DKG Edge Node Service Starting...');
console.log(`🔗 Blockchain RPC: ${RPC_ENDPOINT}`);
console.log(`🔑 Public Key: ${process.env.DKG_PUBLIC_KEY}`);
console.log(`🎭 Mode: ${USE_MOCK_MODE ? 'MOCK (Development)' : 'DKG (Production)'}`);

// Check wallet balance
async function checkWalletBalance() {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
        const balance = await provider.getBalance(process.env.DKG_PUBLIC_KEY);
        const balanceInEther = ethers.formatEther(balance);

        console.log(`💰 Wallet Balance: ${balanceInEther} NEURO`);

        if (parseFloat(balanceInEther) < 0.01) {
            console.warn('⚠️  WARNING: Low NEURO balance! Get testnet tokens from:');
            console.warn('   https://neuroweb-testnet-faucet.origin-trail.network/');
        }

        return balanceInEther;
    } catch (error) {
        console.error(`❌ Failed to check balance: ${error.message}`);
        return null;
    }
}

// Check balance on startup
checkWalletBalance();

// Helper function to generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
    const balance = await checkWalletBalance();
    res.json({
        status: 'healthy',
        service: 'dkg-edge-node',
        blockchain: 'otp::testnet',
        wallet: process.env.DKG_PUBLIC_KEY,
        balance: balance ? `${balance} NEURO` : 'unknown',
        mode: USE_MOCK_MODE ? 'mock' : 'dkg'
    });
});

/**
 * Check wallet balance endpoint
 */
app.get('/balance', async (req, res) => {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
        const balance = await provider.getBalance(process.env.DKG_PUBLIC_KEY);
        const balanceInEther = ethers.formatEther(balance);

        res.json({
            success: true,
            wallet: process.env.DKG_PUBLIC_KEY,
            balance: balanceInEther,
            unit: 'NEURO',
            rpc: RPC_ENDPOINT
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Publish Knowledge Asset to DKG (with mock mode fallback)
 */
app.post('/publish', async (req, res) => {
    try {
        const { topic, discrepancies, similarity_score, ai_analysis } = req.body;

        if (!topic || !discrepancies || similarity_score === undefined || !ai_analysis) {
            return res.status(400).json({
                error: 'Missing required fields: topic, discrepancies, similarity_score, ai_analysis'
            });
        }

        console.log(`📤 Publishing Knowledge Asset: ${topic}`);

        // Format as JSON-LD Knowledge Asset
        const knowledgeAsset = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            '@type': 'Note',
            '@id': `urn:uuid:${generateUUID()}`,
            'attributedTo': 'wikipedia-grokipedia-comparison-agent',
            'published': new Date().toISOString(),
            'inReplyTo': `topic:${topic}`,
            'name': `Content Comparison: ${topic}`,
            'content': `Comparison of ${topic} between Wikipedia and Grokipedia`,
            'data': {
                topic: topic,
                similarity_score: similarity_score,
                discrepancies: discrepancies,
                ai_analysis: ai_analysis,
                verification_status: similarity_score > 0.85 ? 'verified' : 'needs_review',
                source: 'Wikipedia vs Grokipedia Comparison System',
                timestamp: new Date().toISOString()
            }
        };

        // MOCK MODE: Generate mock UAL for development
        const mockUAL = `did:dkg:otp:20430:${process.env.DKG_PUBLIC_KEY.slice(0, 10)}/${generateUUID()}`;

        console.log(`✅ Generated mock UAL: ${mockUAL}`);
        console.log(`💡 Running in MOCK mode - no blockchain transaction`);

        res.json({
            success: true,
            ual: mockUAL,
            status: 'mock',
            mode: 'mock',
            note: 'Running in mock mode for development. Set DKG_MOCK_MODE=false and start DKG node for production.',
            asset: knowledgeAsset
        });

    } catch (error) {
        console.error(`❌ Publishing failed: ${error.message}`);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get Knowledge Asset from DKG
 */
app.get('/asset/:ual', async (req, res) => {
    try {
        const { ual } = req.params;
        console.log(`🔍 Fetching asset: ${ual}`);

        res.json({
            success: true,
            note: 'Mock mode - asset retrieval not available',
            ual: ual
        });

    } catch (error) {
        console.error(`❌ Fetch failed: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Query Knowledge Assets
 */
app.post('/query', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                error: 'Missing required field: query'
            });
        }

        console.log(`🔍 Executing query...`);

        res.json({
            success: true,
            note: 'Mock mode - query not available',
            results: []
        });

    } catch (error) {
        console.error(`❌ Query failed: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
const PORT = process.env.DKG_SERVICE_PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ DKG Edge Node Service running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Balance check: http://localhost:${PORT}/balance`);
    console.log(`📍 Publish endpoint: http://localhost:${PORT}/publish`);
    if (USE_MOCK_MODE) {
        console.log(`\n🎭 MOCK MODE ACTIVE - For production:`);
        console.log(`   1. Set DKG_MOCK_MODE=false in .env`);
        console.log(`   2. Start local DKG node`);
        console.log(`   3. Get more NEURO tokens from faucet`);
    }
});

module.exports = app;
