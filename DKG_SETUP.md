# OriginTrail DKG Node Setup Guide

## Overview

This guide helps you set up a local OriginTrail DKG node to publish Community Notes as Knowledge Assets on the NeuroWeb Testnet.

## Prerequisites

- Node.js 16+ installed
- MetaMask wallet with NeuroWeb Testnet configured
- Some testnet TRAC and NEURO tokens

## Step 1: Get MetaMask Keys

1. Open MetaMask
2. Click on your account → Account Details
3. Export Private Key (keep this secure!)
4. Copy your Public Address

Add to `.env`:
```bash
DKG_PUBLIC_KEY=0x1234...  # Your public address
DKG_PRIVATE_KEY=abc123...  # Your private key (without 0x)
```

## Step 2: Install DKG Node

```bash
# Install OriginTrail DKG SDK
npm install -g dkg-client

# Or clone the node repository
git clone https://github.com/OriginTrail/ot-node.git
cd ot-node
npm install
```

## Step 3: Configure Node

Create `config.json`:
```json
{
  "blockchain": {
    "name": "neuroweb-testnet",
    "rpc": "https://testnet-rpc.neuroweb.ai",
    "chainId": 20430
  },
  "network": {
    "port": 8900,
    "hostname": "localhost"
  },
  "wallet": {
    "publicKey": "YOUR_PUBLIC_KEY",
    "privateKey": "YOUR_PRIVATE_KEY"
  }
}
```

## Step 4: Start Node

```bash
# Start the DKG node
npm start

# Or if using dkg-client
dkg-client start --config config.json
```

Your node should be running on `http://localhost:8900`

## Step 5: Verify Connection

Test the connection:
```bash
curl http://localhost:8900/api/v1/health
```

Should return:
```json
{
  "status": "healthy",
  "blockchain": "neuroweb-testnet"
}
```

## Step 6: Get Testnet Tokens

1. **NEURO tokens** (for gas):
   - Visit: https://neuroweb-testnet-faucet.origin-trail.network/
   - Enter your address
   - Request tokens

2. **TRAC tokens** (for publishing):
   - Join OriginTrail Discord
   - Request testnet TRAC in #testnet-faucet channel

## Knowledge Asset Structure

The system publishes Community Notes as JSON-LD:

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "@type": "Note",
  "id": "urn:uuid:...",
  "attributedTo": "wikipedia-grokipedia-comparison-agent",
  "published": "2025-11-06T12:00:00Z",
  "name": "Content Comparison: Artificial Intelligence",
  "data": {
    "topic": "Artificial Intelligence",
    "similarity_score": 0.85,
    "discrepancies": [...],
    "ai_analysis": "...",
    "verification_status": "verified"
  }
}
```

## API Endpoints

### Create Knowledge Asset
```bash
POST http://localhost:8900/api/v1/assets/create
Content-Type: application/json

{
  "public_key": "0x...",
  "assertion": { ... },
  "blockchain": "neuroweb-testnet",
  "visibility": "public"
}
```

### Response
```json
{
  "ual": "did:dkg:neuroweb-testnet:...",
  "status": "published",
  "transaction_hash": "0x..."
}
```

## Troubleshooting

### Node Not Starting
- Check Node.js version: `node --version` (should be 16+)
- Check port 8900 is available: `lsof -i :8900`
- Check logs: `tail -f logs/node.log`

### Connection Refused
- Ensure node is running: `curl http://localhost:8900/api/v1/health`
- Check firewall settings
- Verify DKG_ENDPOINT in `.env` is `http://localhost:8900`

### Publishing Fails
- Check wallet has NEURO for gas
- Check wallet has TRAC for publishing
- Verify private key is correct (without 0x prefix)
- Check blockchain RPC is accessible

### Mock Mode (No DKG Node)
If you don't have a DKG node running, the system will automatically:
- Generate mock UALs: `did:dkg:neuroweb-testnet:uuid`
- Log warnings instead of errors
- Continue functioning normally

This is perfect for development and demos!

## Production Deployment

For production:
1. Use mainnet instead of testnet
2. Secure private keys with environment variables
3. Use proper key management (AWS KMS, HashiCorp Vault)
4. Monitor node health and uptime
5. Set up automatic restarts
6. Configure proper logging

## Resources

- **OriginTrail Docs**: https://docs.origintrail.io/
- **DKG SDK**: https://github.com/OriginTrail/dkg.js
- **NeuroWeb Testnet**: https://neuroweb.ai/
- **Discord**: https://discord.gg/origintrail
- **Testnet Explorer**: https://neuroweb-testnet.subscan.io/

## Support

Need help? 
- Discord: #developer-support
- GitHub Issues: https://github.com/OriginTrail/ot-node/issues
- Documentation: https://docs.origintrail.io/

---

**Note**: This hackathon project works with or without a DKG node. Mock UALs are generated automatically if the node is unavailable.
