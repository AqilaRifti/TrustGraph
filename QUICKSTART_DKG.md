# Quick Start Guide - DKG Integration

## 🚀 Get Running in 5 Minutes

This guide gets you up and running with the **official OriginTrail DKG SDK**.

### Step 1: Install Dependencies

```bash
# Python dependencies
pip install -r requirements.txt

# Node.js dependencies (DKG SDK)
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# Your Pinecone API key
PINECONE_API_KEY=your_key_here

# Your wallet credentials
DKG_PUBLIC_KEY=0xYourAddress
DKG_PRIVATE_KEY=0xYourPrivateKey

# DKG endpoints (default values work for local node)
DKG_SERVICE_URL=http://localhost:3000
DKG_ENDPOINT=http://localhost:8900
```

### Step 3: Start Services

**Terminal 1** - Start DKG Edge Node:
```bash
npm start
```

Wait for:
```
✅ DKG Edge Node Service running on port 3000
```

**Terminal 2** - Star