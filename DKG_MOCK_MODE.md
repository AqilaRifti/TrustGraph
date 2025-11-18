# DKG Mock Mode Guide

## Overview

Your DKG service now supports **Mock Mode** for development without requiring a local DKG node or blockchain transactions.

## Current Status

✅ **Mock Mode is ACTIVE**
- Generates mock UALs (Universal Asset Locators)
- No blockchain transactions required
- Perfect for development and testing
- Your wallet balance: **0.0000099 NEURO** (very low)

## How It Works

### Mock Mode (Current)
```bash
npm start  # Runs dkg-service-mock.js
```

**Features:**
- ✅ Instant publishing (no blockchain wait)
- ✅ No gas fees required
- ✅ Generates valid-looking UALs
- ✅ Perfect for demos and development
- ❌ Not stored on blockchain
- ❌ UALs are not retrievable

**Example Mock UAL:**
```
did:dkg:otp:20430:0xec2c84d2/d463a06f-e688-4c23-82d0-807b6f5fbd33
```

### Production Mode (Requires Setup)
```bash
npm run start:prod  # Runs dkg-service.js with real DKG
```

**Requirements:**
1. Local DKG node running on `http://localhost:8900`
2. Sufficient NEURO tokens for gas (you need more!)
3. TRAC tokens for publishing
4. Set `DKG_MOCK_MODE=false` in `.env`

## Testing Your Setup

### 1. Check Service Health
```bash
curl http://localhost:3000/health
```

### 2. Check Wallet Balance
```bash
curl http://localhost:3000/balance
# or
npm run balance
```

### 3. Test Publishing
```bash
curl -X POST http://localhost:3000/publish \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test Topic",
    "discrepancies": ["Test"],
    "similarity_score": 0.9,
    "ai_analysis": "Test"
  }'
```

## Getting Testnet Tokens

### NEURO Tokens (Gas)
Your current balance: **0.0000099 NEURO** ⚠️ TOO LOW!

Get more from:
```
https://neuroweb-testnet-faucet.origin-trail.network/
```

Enter your wallet address:
```
0xec2c84d2ae3c7e385beabcc77a96cfae89301e4b
```

### TRAC Tokens (Publishing)
Join OriginTrail Discord and request in `#testnet-faucet`:
```
https://discord.gg/origintrail
```

## Switching to Production Mode

When you're ready to use real DKG:

### Step 1: Get More Tokens
- Get at least **0.1 NEURO** from faucet
- Get **100+ TRAC** from Discord

### Step 2: Install DKG Node
```bash
# Option A: Using Docker (recommended)
docker pull origintrail/ot-node:latest
docker run -p 8900:8900 origintrail/ot-node

# Option B: From source
git clone https://github.com/OriginTrail/ot-node.git
cd ot-node
npm install
npm start
```

### Step 3: Update Configuration
Edit `.env`:
```bash
DKG_MOCK_MODE=false  # Disable mock mode
DKG_ENDPOINT=http://localhost:8900  # Your DKG node
```

### Step 4: Start Production Service
```bash
npm run start:prod
```

## Troubleshooting

### "blockchain hub contract is missing"
**Cause:** DKG node not running or not accessible

**Solutions:**
1. Use mock mode (current setup) ✅
2. Start local DKG node
3. Check `DKG_ENDPOINT` in `.env`

### "insufficient funds"
**Cause:** Not enough NEURO for gas

**Solution:** Get more NEURO from faucet (you need this!)

### "allowance" error
**Cause:** Not enough TRAC tokens

**Solution:** Request TRAC from Discord

## Current Configuration

```bash
# Your Wallet
Public Key:  0xec2c84d2ae3c7e385beabcc77a96cfae89301e4b
Balance:     0.0000099 NEURO ⚠️

# Service
Mode:        MOCK (Development)
Port:        3000
Blockchain:  NeuroWeb Testnet (Chain ID: 20430)
RPC:         https://lofar-testnet.origin-trail.network
```

## Recommendations

For your hackathon project:

1. **Keep using Mock Mode** ✅
   - Works perfectly for demos
   - No blockchain delays
   - No token requirements

2. **Get more NEURO tokens**
   - Visit the faucet
   - Request at least 0.1 NEURO
   - This will allow production mode later

3. **Document Mock Mode**
   - Mention in your presentation
   - Explain it's for development
   - Show the Knowledge Asset structure

## API Endpoints

### Health Check
```bash
GET http://localhost:3000/health
```

### Balance Check
```bash
GET http://localhost:3000/balance
```

### Publish Knowledge Asset
```bash
POST http://localhost:3000/publish
Content-Type: application/json

{
  "topic": "string",
  "discrepancies": ["array"],
  "similarity_score": 0.0-1.0,
  "ai_analysis": "string"
}
```

## Resources

- **Faucet:** https://neuroweb-testnet-faucet.origin-trail.network/
- **Discord:** https://discord.gg/origintrail
- **Docs:** https://docs.origintrail.io/
- **Explorer:** https://neuroweb-testnet.subscan.io/

---

**Your setup is working perfectly in Mock Mode!** 🎉

For the hackathon, this is completely acceptable. The Knowledge Assets are properly formatted and the system demonstrates the concept beautifully.
