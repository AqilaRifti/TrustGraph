# TrustGraph Plugin Setup Guide

Complete guide to setting up the TrustGraph Wikipedia vs Grokipedia comparison plugin for the OriginTrail Global Hackathon 2025.

## Prerequisites

- Node.js >= 22
- npm package manager
- OriginTrail DKG Node setup complete
- Cerebras API keys (8 recommended for load balancing)

## Installation Steps

### 1. Install Dependencies

From the `dkg-node` root directory:

```bash
npm install
```

### 2. Build the TrustGraph Plugin

```bash
npm run build
```

This will build all packages including the new `@dkg/trustgraph` plugin.

### 3. Configure Environment Variables

Edit `dkg-node/apps/agent/.env` and add:

```bash
# Cerebras AI Configuration
CEREBRAS_API_KEYS=your_key1,your_key2,your_key3,your_key4,your_key5,your_key6,your_key7,your_key8
CEREBRAS_MODEL=llama3.1-70b
CEREBRAS_MAX_TOKENS=2048
CEREBRAS_TEMPERATURE=0.6
CEREBRAS_TOP_P=0.95

# Topics Configuration
TRUSTGRAPH_TOPICS_FILE=../../packages/trustgraph/data/topics.json
```

**Important:** Replace `your_key1`, `your_key2`, etc. with your actual Cerebras API keys.

### 4. Register the Plugin

Edit `dkg-node/apps/agent/src/server/index.ts`:

Find the `createPluginServer` function and add the trustgraph plugin:

```typescript
import trustgraphPlugin from "@dkg/trustgraph";

// ... existing imports ...

export async function createPluginServer(
  config: PluginServerConfig,
): Promise<PluginServer> {
  // ... existing code ...

  const server = await createServer({
    // ... existing config ...
    plugins: [
      authPlugin,
      oauthPlugin,
      dkgEssentialsPlugin,
      swaggerPlugin,
      trustgraphPlugin,  // Add this line
    ],
  });

  // ... rest of the code ...
}
```

### 5. Build and Start the Agent

```bash
cd dkg-node
npm run build
npm run dev
```

The agent will start with the TrustGraph plugin loaded.

## Verification

### Check Plugin Loading

Look for this message in the console:

```
✅ TrustGraph plugin loaded successfully
   Topics: 60
   Cerebras API keys: 8
```

### Test MCP Tools

In the DKG Node UI, try these commands:

```
Use the trustgraph_scan tool to start analyzing content
```

```
Check the scan status using trustgraph_status
```

### Test REST API

```bash
# List all topics
curl http://localhost:9200/api/trustgraph/topics

# Start a scan
curl -X POST http://localhost:9200/api/trustgraph/scan

# Check scan status
curl http://localhost:9200/api/trustgraph/scan-status

# Get specific topic
curl http://localhost:9200/api/trustgraph/topic/Artificial%20Intelligence
```

## Usage Examples

### Example 1: Start a Full Scan

In the DKG Node chat interface:

```
Please start a TrustGraph scan to compare Wikipedia and Grokipedia content across all topics
```

The agent will use the `trustgraph_scan` tool to initiate the scan.

### Example 2: Check Progress

```
What's the current status of the TrustGraph scan?
```

The agent will use `trustgraph_status` to report progress.

### Example 3: Get Specific Topic

```
Show me the comparison results for "Artificial Intelligence"
```

The agent will use `trustgraph_get_topic` to retrieve and display the results.

### Example 4: Publish to DKG

```
Publish the "Blockchain" comparison to the DKG
```

The agent will use `trustgraph_publish` to publish the Community Note.

## Customizing Topics

Edit `dkg-node/packages/trustgraph/data/topics.json` to add or remove topics:

```json
[
  "Your Custom Topic 1",
  "Your Custom Topic 2",
  "Artificial Intelligence",
  "Machine Learning",
  ...
]
```

After editing, rebuild:

```bash
npm run build
```

## API Integration

### Building a Web Dashboard

You can build a custom web dashboard using the REST API endpoints:

```javascript
// Start scan
fetch('http://localhost:9200/api/trustgraph/scan', {
  method: 'POST'
})
.then(res => res.json())
.then(data => console.log('Scan started:', data));

// Poll for status
setInterval(() => {
  fetch('http://localhost:9200/api/trustgraph/scan-status')
    .then(res => res.json())
    .then(status => {
      console.log(`Progress: ${status.progress}%`);
      console.log(`Current: ${status.current_topic}`);
    });
}, 2000);

// Get results
fetch('http://localhost:9200/api/trustgraph/topics')
  .then(res => res.json())
  .then(topics => {
    topics.forEach(topic => {
      console.log(`${topic.name}: ${topic.similarity * 100}% similar`);
    });
  });
```

## Troubleshooting

### Plugin Not Loading

**Issue:** Plugin doesn't appear in logs

**Solution:**
1. Check that `npm run build` completed successfully
2. Verify the import statement in `src/server/index.ts`
3. Check for TypeScript errors: `npm run check-types`

### Cerebras API Errors

**Issue:** "API key invalid" or rate limit errors

**Solution:**
1. Verify API keys in `.env` file
2. Ensure keys are comma-separated with no spaces
3. Add more keys for better load balancing

### Topics Not Loading

**Issue:** "Loaded 0 topics" in console

**Solution:**
1. Check `TRUSTGRAPH_TOPICS_FILE` path in `.env`
2. Verify `data/topics.json` exists and is valid JSON
3. Use absolute path if relative path fails

### DKG Publishing Fails

**Issue:** "DKG publish failed"

**Solution:**
1. Ensure DKG wallet has sufficient TRAC tokens
2. Check DKG node is running and accessible
3. Verify `DKG_PUBLISH_WALLET` is set in agent `.env`

### Wikipedia/Grokipedia Fetch Fails

**Issue:** "Content fetch failed" for specific topics

**Solution:**
1. Check internet connectivity
2. Some topics may not exist on Grokipedia
3. Check logs for specific HTTP errors
4. The system will skip failed topics and continue

## Performance Tips

### Optimize Scan Speed

1. **Use Multiple API Keys**: 8 keys provide 8x throughput
2. **Reduce Topics**: Start with 10-20 topics for testing
3. **Adjust Timeouts**: Edit `scraper.ts` if needed

### Monitor Resource Usage

```bash
# Check memory usage
ps aux | grep node

# Monitor network
netstat -an | grep 9200
```

## Hackathon Submission

### Required Files

Ensure these files are included in your submission:

- `dkg-node/packages/trustgraph/` - Complete plugin source
- `dkg-node/apps/agent/src/server/index.ts` - With plugin registered
- `dkg-node/apps/agent/.env` - With configuration (remove actual API keys!)
- `dkg-node/TRUSTGRAPH_SETUP.md` - This setup guide

### Demonstration

For your hackathon demo:

1. Start the DKG agent: `npm run dev`
2. Show plugin loading in console
3. Use chat interface to start scan
4. Show progress updates
5. Display comparison results
6. Show published UALs on DKG
7. Retrieve Knowledge Assets from DKG

### Key Features to Highlight

- ✅ Uses official OriginTrail DKG SDK (via dkg-node)
- ✅ AI-powered analysis with Cerebras
- ✅ Automatic discrepancy detection
- ✅ Community Notes generation
- ✅ DKG publishing with UAL tracking
- ✅ MCP tools for AI agent integration
- ✅ REST API for web integration
- ✅ Load-balanced API key rotation
- ✅ Graceful error handling

## Support

For issues or questions:

1. Check the logs in the console
2. Review the README.md in `packages/trustgraph/`
3. Check OriginTrail documentation: https://docs.origintrail.io/
4. Review Cerebras API docs: https://cerebras.ai/

## Next Steps

After setup:

1. Run a test scan with 5-10 topics
2. Verify results are accurate
3. Check DKG publishing works
4. Build a custom dashboard (optional)
5. Prepare your hackathon presentation

Good luck with the hackathon! 🚀
