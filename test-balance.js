/**
 * Test wallet balance and blockchain connectivity
 */

const { ethers } = require('ethers');
require('dotenv').config();

const RPC_ENDPOINT = 'https://lofar-testnet.origin-trail.network';
const PUBLIC_KEY = process.env.DKG_PUBLIC_KEY;

async function testConnection() {
    console.log('🧪 Testing NeuroWeb Testnet Connection...\n');

    try {
        // Test 1: RPC Connection
        console.log('1️⃣ Testing RPC connection...');
        const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
        const network = await provider.getNetwork();
        console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

        // Test 2: Wallet Balance
        console.log('\n2️⃣ Checking wallet balance...');
        console.log(`   Wallet: ${PUBLIC_KEY}`);
        const balance = await provider.getBalance(PUBLIC_KEY);
        const balanceInEther = ethers.formatEther(balance);
        console.log(`✅ Balance: ${balanceInEther} NEURO`);

        if (parseFloat(balanceInEther) < 0.01) {
            console.log('⚠️  WARNING: Low balance! Get testnet tokens from:');
            console.log('   https://neuroweb-testnet-faucet.origin-trail.network/');
        }

        // Test 3: Latest Block
        console.log('\n3️⃣ Checking latest block...');
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ Latest block: ${blockNumber}`);

        console.log('\n✅ All connectivity tests passed!');
        console.log('\n📝 Summary:');
        console.log(`   Network: NeuroWeb Testnet`);
        console.log(`   RPC: ${RPC_ENDPOINT}`);
        console.log(`   Wallet: ${PUBLIC_KEY}`);
        console.log(`   Balance: ${balanceInEther} NEURO`);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nPossible issues:');
        console.error('1. RPC endpoint is down or unreachable');
        console.error('2. Invalid wallet address');
        console.error('3. Network connectivity issues');
    }
}

testConnection();
