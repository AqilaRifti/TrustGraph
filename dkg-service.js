/**
 * DKG Edge Node Service
 * 
 * This service uses the official OriginTrail DKG SDK (dkg.js)
 * to publish Knowledge Assets to the Decentralized Knowledge Graph.
 * 
 * IMPORTANT: This is the ONLY approved way to interact with DKG
 * for hackathon eligibility.
 */

const DKG = require('dkg.js');
const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// RPC endpoint for NeuroWeb Testnet
const RPC_ENDPOINT = 'https://lofar-testnet.origin-trail.network';

// Initialize DKG Edge Node with proper configuration
const dkgConfig = {
    endpoint: process.env.DKG_ENDPOINT || 'http://localhost:8900',
    port: parseInt(process.env.DKG_PORT || '8900'),
    blockchain: {
        name: 'otp::testnet',
        publicKey: process.env.DKG_PUBLIC_KEY,
        privateKey: process.env.DKG_PRIVATE_KEY,
        rpc: RPC_ENDPOINT
    },
    maxNumberOfRetries: 3,
    frequency: 2,
    contentType: 'all'
};

console.log('🚀 DKG Edge Node Service Starting...');
console.log(`📡 DKG Endpoint: ${dkgConfig.endpoint}`);
console.log(`🔗 Blockchain RPC: ${RPC_ENDPOINT}`);
console.log(`🔑 Public Key: ${process.env.DKG_PUBLIC_KEY}`);

// Check wallet balances on startup
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

// Initialize DKG
let dkg;
try {
    dkg = new DKG(dkgConfig);
    console.log('✅ DKG SDK initialized');
} catch (error) {
    console.error(`❌ Failed to initialize DKG SDK: ${error.message}`);
    console.error('   Check your configuration and try again');
}

// Check balance on startup
checkWalletBalance();

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
        balance: balance ? `${balance} NEURO` : 'unknown'
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
 * Publish Knowledge Asset to DKG
 * 
 * POST /publish
 * Body: {
 *   topic: string,
 *   discrepancies: array,
 *   similarity_score: number,
 *   ai_analysis: string
 * }
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

        // Publish using official DKG SDK
        const result = await dkg.asset.create(
            knowledgeAsset,
            {
                epochsNum: 2,  // Number of epochs to store
                visibility: 'public'
            }
        );

        console.log(`✅ Published successfully: ${result.UAL}`);

        res.json({
            success: true,
            ual: result.UAL,
            status: 'published',
            transaction_hash: result.publicAssertionId || null
        });

    } catch (error) {
        console.error(`❌ Publishing failed: ${error.message}`);
        console.error(`   Full error:`, error);

        // Provide helpful error messages
        let helpMessage = '';
        if (error.message.includes('blockchain hub contract')) {
            helpMessage = 'Blockchain configuration issue. Possible causes:\n' +
                '   1. DKG node not running or not accessible\n' +
                '   2. Incorrect blockchain configuration\n' +
                '   3. Network connectivity issues\n' +
                '   Try: Check if DKG node is running on ' + dkgConfig.endpoint;
        } else if (error.message.includes('insufficient funds')) {
            helpMessage = 'Insufficient NEURO tokens for gas fees\n' +
                '   Get testnet tokens: https://neuroweb-testnet-faucet.origin-trail.network/';
        } else if (error.message.includes('allowance')) {
            helpMessage = 'Insufficient TRAC token allowance\n' +
                '   Request TRAC: OriginTrail Discord #testnet-faucet';
        }

        if (helpMessage) {
            console.error(`💡 ${helpMessage}`);
        }

        res.status(500).json({
            success: false,
            error: error.message,
            help: helpMessage
        });
    }
});

/**
 * Get Knowledge Asset from DKG
 * 
 * GET /asset/:ual
 */
app.get('/asset/:ual', async (req, res) => {
    try {
        const { ual } = req.params;
        console.log(`🔍 Fetching asset: ${ual}`);

        const result = await dkg.asset.get(ual);

        res.json({
            success: true,
            asset: result
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
 * 
 * POST /query
 * Body: {
 *   query: string (SPARQL query)
 * }
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

        const result = await dkg.graph.query(query, 'SELECT');

        res.json({
            success: true,
            results: result
        });

    } catch (error) {
        console.error(`❌ Query failed: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper function to generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Start server
const PORT = process.env.DKG_SERVICE_PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ DKG Edge Node Service running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Publish endpoint: http://localhost:${PORT}/publish`);
});

module.exports = app;
