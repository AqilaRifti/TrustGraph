# DKG Edge Node Integration Guide

## ✅ Official OriginTrail DKG SDK Implementation

This project now uses the **official OriginTrail DKG SDK (dkg.js)** via a Node.js service, which is the **ONLY approved method** for hackathon eligibility.

## Architecture

```
Python Flask App (app.py)
    ↓
Python DKG Publisher (backend/dkg_publisher.py)
    ↓ HTTP
Node.js DKG Service (dkg-service.js)
    ↓ Official SDK
OriginTrail DKG (dkg.js)
    ↓
NeuroWeb Testnet Blockchain
```

## Prerequisites

1. **Node.js 16+** installed
2. **npm** package manager
3. **OriginTrail DKG Node** running locally or remote endpoint
4. **Wallet with testnet tokens** (NEURO + TRAC)

## Installation Steps

### 1. Install Node.js Dependencies

```bash
npm install
```

This installs:
- `dkg.js` - Official OriginTrail DKG SDK
- `express` - HTTP server
- `dotenv` - Environment configuration
- `body-parser` - JSON parsing

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
# DKG Edge Node Service (Node.js)
DKG_SERVICE_URL=http://localhost:3000

# DKG Node Endpoint
DKG_ENDPOINT=http://localhost:8900
DKG_PORT=8900

# Your Wallet Credentials
DKG_PUBLIC_KEY=0xYourPublicAddress
DKG_PRIVATE_KEY=0xYourPrivateKey

# Pinecone
PINECONE_API_KEY=your_pinecone_key

# Flask
FLASK_DEBUG=True
FLASK_PORT=5000
```

### 3. Start DKG Edge Node Service

In a **separate terminal**:

```bash
npm start
```

You should see:
```
🚀 DKG Edge Node Service Starting...
📡 Endpoint: http://localhost:8900
🔑 Public Key: 0x...
✅ DKG Edge Node Service running on port 3000
📍 Health check: http://localhost:3000/health
📍 Publish endpoint: http://localhost:3000/publish
```

### 4. Start Python Flask App

In another terminal:

```bash
python app.py
```

## How It Works

### Publishing Flow

1. **Python app** detects discrepancies and generates Community Note
2. **DKG Publisher** sends data to Node.js service via HTTP POST
3. **DKG Service** formats as JSON-LD Knowledge Asset
4. **Official SDK** publishes to OriginTrail DKG
5. **Blockchain** confirms transaction
6. **UAL** (Universal Asset Locator) returned to Python app

### Knowledge Asset Format

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "@type": "Note",
  "@id": "urn:uuid:...",
  "attributedTo": "wikipedia-grokipedia-comparison-agent",
  "published": "2025-11-17T12:00:00Z",
  "name": "Content Comparison: Artificial Intelligence",
  "content": "Comparison of Artificial Intelligence between Wikipedia and Grokipedia",
  "data": {
    "topic": "Artificial Intelligence",
    "similarity_score": 0.85,
    "discrepancies": [...],
    "ai_analysis": "...",
    "verification_status": "verified",
    "source": "Wikipedia vs Grokipedia Comparison System",
    "timestamp": "2025-11-17T12:00:00Z"
  }
}
```

## API Endpoints

### DKG Service (Node.js)

#### Health Check
```bash
GET http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "dkg-edge-node",
  "blockchain": "otp:20430"
}
```

#### Publish Knowledge Asset
```bash
POST http://localhost:3000/publish
Content-Type: application/json

{
  "topic": "Artificial Intelligence",
  "discrepancies": [...],
  "similarity_score": 0.85,
  "ai_analysis": "..."
}
```

Response:
```json
{
  "success": true,
  "ual": "did:dkg:otp:20430/0x.../...",
  "status": "published",
  "transaction_hash": "0x..."
}
```

#### Get Knowledge Asset
```bash
GET http://localhost:3000/asset/:ual
```

#### Query Knowledge Graph
```bash
POST http://localhost:3000/query
Content-Type: application/json

{
  "query": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"
}
```

## Testing

### Test DKG Service

```bash
curl http://localhost:3000/health
```

### Test Publishing

```bash
curl -X POST http://localhost:3000/publish \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test Topic",
    "discrepancies": ["Test discrepancy"],
    "similarity_score": 0.9,
    "ai_analysis": "Test analysis"
  }'
```

### Test from Python

```python
from backend.dkg_publisher import DKGPublisher

dkg = DKGPublisher()
ual = dkg.publish_community_note(
    topic="Test",
    discrepancies=["Test"],
    similarity_score=0.9,
    ai_analysis="Test"
)
print(f"Published: {ual}")
```

## Troubleshooting

### "Cannot connect to DKG Edge Node service"

**Problem**: Python app can't reach Node.js service

**Solution**:
```bash
# Check if service is running
curl http://localhost:3000/health

# If not, start it
npm start
```

### "DKG publish timeout"

**Problem**: DKG operations taking too long

**Solution**:
- DKG publishing can take 30-60 seconds
- Check your DKG node is synced
- Verify wallet has enough TRAC and NEURO tokens

### "Module 'dkg.js' not found"

**Problem**: npm dependencies not installed

**Solution**:
```bash
npm install
```

### "Invalid private key"

**Problem**: Wallet credentials incorrect

**Solution**:
- Verify `DKG_PUBLIC_KEY` starts with `0x`
- Verify `DKG_PRIVATE_KEY` starts with `0x`
- Check keys match your MetaMask wallet

## Production Deployment

### Security Best Practices

1. **Never commit private keys** to git
2. **Use environment variables** for all secrets
3. **Rotate keys regularly**
4. **Use hardware wallets** for mainnet
5. **Monitor wallet balance** for gas

### Scaling

1. **Use PM2** for Node.js process management:
```bash
npm install -g pm2
pm2 start dkg-service.js --name dkg-service
pm2 startup
pm2 save
```

2. **Use Gunicorn** for Python Flask:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

3. **Use Nginx** as reverse proxy

## Resources

- **OriginTrail Docs**: https://docs.origintrail.io/
- **DKG SDK (dkg.js)**: https://github.com/OriginTrail/dkg.js
- **NeuroWeb Testnet**: https://neuroweb.ai/
- **Testnet Faucet**: https://neuroweb-testnet-faucet.origin-trail.network/
- **Discord Support**: https://discord.gg/origintrail

## Hackathon Compliance

✅ **Uses official OriginTrail DKG SDK (dkg.js)**
✅ **Publishes via DKG Edge Node**
✅ **No direct HTTP calls to DKG**
✅ **Proper JSON-LD formatting**
✅ **NeuroWeb Testnet integration**

This implementation is **fully compliant** with hackathon requirements.

---

**Questions?** Check the OriginTrail Discord #developer-support channel.
