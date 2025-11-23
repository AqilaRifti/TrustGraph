# TrustGraph Quick Start Guide

## 🚀 5-Minute Setup

### 1. Install (2 minutes)

```bash
cd dkg-node
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

### 2. Configure (1 minute)

Edit `apps/agent/.env`:

```bash
CEREBRAS_API_KEYS=key1,key2,key3,key4,key5,key6,key7,key8
CEREBRAS_MODEL=llama3.1-70b
TRUSTGRAPH_TOPICS_FILE=../../packages/trustgraph/data/topics.json
```

### 3. Register Plugin (1 minute)

Edit `apps/agent/src/server/index.ts`:

```typescript
import trustgraphPlugin from "@dkg/trustgraph";

// Add to plugins array:
plugins: [
  authPlugin,
  oauthPlugin,
  dkgEssentialsPlugin,
  swaggerPlugin,
  trustgraphPlugin,  // ← Add this
],
```

### 4. Run (1 minute)

```bash
npm run dev
```

Look for:
```
✅ TrustGraph plugin loaded successfully
   Topics: 60
   Cerebras API keys: 8
```

## 🎮 Usage

### Via Chat

```
Start a TrustGraph scan
```

```
Check the scan status
```

```
Show me the comparison for "Artificial Intelligence"
```

### Via API

```bash
curl -X POST http://localhost:9200/api/trustgraph/scan
curl http://localhost:9200/api/trustgraph/scan-status
curl http://localhost:9200/api/trustgraph/topics
```

## 📁 File Structure

```
dkg-node/
├── packages/trustgraph/          ← Your plugin
│   ├── src/
│   │   ├── index.ts             ← Main plugin file
│   │   ├── services/            ← Core logic
│   │   └── utils/               ← Helpers
│   ├── data/topics.json         ← Topics to compare
│   └── README.md                ← Full docs
├── apps/agent/
│   ├── .env                     ← Config (add API keys)
│   └── src/server/index.ts      ← Register plugin here
└── TRUSTGRAPH_SETUP.md          ← Detailed guide
```

## 🔧 Troubleshooting

### npm install fails
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Plugin not loading
```bash
npm run build
npm run check-types
```

### API errors
- Check API keys in `.env`
- Ensure comma-separated, no spaces

## 📊 What It Does

1. **Fetches** articles from Wikipedia & Grokipedia
2. **Compares** content using similarity algorithms
3. **Detects** discrepancies (length, keywords, structure)
4. **Analyzes** with Cerebras AI
5. **Generates** Community Notes
6. **Publishes** to OriginTrail DKG

## 🎯 Key Features

- ✅ 60 topics configured
- ✅ AI-powered analysis
- ✅ Load-balanced API keys
- ✅ DKG publishing
- ✅ MCP tools + REST API
- ✅ Progress tracking
- ✅ Error handling

## 📖 Full Documentation

- `packages/trustgraph/README.md` - Complete plugin docs
- `TRUSTGRAPH_SETUP.md` - Detailed setup guide
- `TRUSTGRAPH_MIGRATION_COMPLETE.md` - Migration notes
- `MIGRATION_SUMMARY.md` - High-level overview

## 🏆 Hackathon Ready

This implementation:
- ✅ Uses official OriginTrail DKG SDK
- ✅ TypeScript in dkg-node format
- ✅ Complete documentation
- ✅ Production-ready code

## 🎬 Demo Commands

```
# Start scan
"Start a TrustGraph scan to compare Wikipedia and Grokipedia"

# Check progress
"What's the scan status?"

# View results
"Show me the comparison for Artificial Intelligence"

# Publish to DKG
"Publish the Blockchain comparison to DKG"
```

## 💡 Tips

1. **Start small**: Test with 5-10 topics first
2. **Monitor logs**: Watch console for progress
3. **Check UALs**: Verify DKG publishing works
4. **Use multiple keys**: 8 keys = 8x faster

## 🆘 Need Help?

1. Check console logs
2. Review `TRUSTGRAPH_SETUP.md`
3. Verify environment variables
4. Test API endpoints manually

## ⚡ Quick Commands

```bash
# Install
npm install && npm run build

# Run
npm run dev

# Test API
curl http://localhost:9200/api/trustgraph/topics

# Start scan
curl -X POST http://localhost:9200/api/trustgraph/scan

# Check status
curl http://localhost:9200/api/trustgraph/scan-status
```

---

**That's it! You're ready to go! 🚀**

For detailed instructions, see `TRUSTGRAPH_SETUP.md`
