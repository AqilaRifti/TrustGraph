/**
 * Test script for DKG Edge Node service
 * 
 * Run with: node test-dkg.js
 */

const http = require('http');

const DKG_SERVICE_URL = 'http://localhost:3000';

// Test data
const testPayload = {
    topic: 'Test Topic - Artificial Intelligence',
    discrepancies: [
        'Wikipedia has 5000 words, Grokipedia has 3000 words',
        'Different emphasis on machine learning vs deep learning'
    ],
    similarity_score: 0.87,
    ai_analysis: 'Both sources provide accurate information about AI, but Wikipedia offers more comprehensive coverage of historical development while Grokipedia focuses more on recent advances in deep learning.'
};

console.log('🧪 Testing DKG Edge Node Service\n');

// Test 1: Health Check
function testHealth() {
    return new Promise((resolve, reject) => {
        console.log('1️⃣  Testing health endpoint...');

        http.get(`${DKG_SERVICE_URL}/health`, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(data);
                    console.log('   ✅ Health check passed');
                    console.log(`   Status: ${result.status}`);
                    console.log(`   Service: ${result.service}`);
                    console.log(`   Blockchain: ${result.blockchain}\n`);
                    resolve();
                } else {
                    console.log(`   ❌ Health check failed: ${res.statusCode}\n`);
                    reject(new Error('Health check failed'));
                }
            });
        }).on('error', (err) => {
            console.log(`   ❌ Cannot connect to service: ${err.message}`);
            console.log('   Make sure to run: npm start\n');
            reject(err);
        });
    });
}

// Test 2: Publish Knowledge Asset
function testPublish() {
    return new Promise((resolve, reject) => {
        console.log('2️⃣  Testing publish endpoint...');
        console.log(`   Topic: ${testPayload.topic}`);
        console.log(`   Similarity: ${testPayload.similarity_score}`);
        console.log(`   Discrepancies: ${testPayload.discrepancies.length}`);

        const postData = JSON.stringify(testPayload);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/publish',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(data);
                    if (result.success) {
                        console.log('   ✅ Publishing successful!');
                        console.log(`   UAL: ${result.ual}`);
                        if (result.transaction_hash) {
                            console.log(`   Transaction: ${result.transaction_hash}`);
                        }
                        console.log(`   Status: ${result.status}\n`);
                        resolve(result.ual);
                    } else {
                        console.log(`   ❌ Publishing failed: ${result.error}\n`);
                        reject(new Error(result.error));
                    }
                } else {
                    console.log(`   ❌ HTTP error: ${res.statusCode}`);
                    console.log(`   Response: ${data}\n`);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.log(`   ❌ Request failed: ${err.message}\n`);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
}

// Run tests
async function runTests() {
    try {
        await testHealth();
        const ual = await testPublish();

        console.log('✅ All tests passed!\n');
        console.log('📋 Summary:');
        console.log('   - Health check: OK');
        console.log('   - Publishing: OK');
        console.log(`   - UAL: ${ual}`);
        console.log('\n🎉 DKG Edge Node service is working correctly!');

    } catch (error) {
        console.log('\n❌ Tests failed');
        console.log(`   Error: ${error.message}`);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure DKG service is running: npm start');
        console.log('   2. Check .env file has correct DKG credentials');
        console.log('   3. Verify DKG node is accessible at DKG_ENDPOINT');
        console.log('   4. Ensure wallet has TRAC and NEURO tokens');
        process.exit(1);
    }
}

runTests();
