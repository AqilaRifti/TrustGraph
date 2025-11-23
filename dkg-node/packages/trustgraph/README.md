# TrustGraph Plugin

**Wikipedia vs Grokipedia Quality Control System** - An AI-powered content comparison plugin for the OriginTrail DKG Node.

## Overview

TrustGraph automatically compares articles from Wikipedia and Grokipedia, detects discrepancies using AI analysis, and publishes Community Notes to the OriginTrail Decentralized Knowledge Graph (DKG).

## Features

- 🔍 **Automated Content Fetching**: Scrapes 60+ topics from Wikipedia and Grokipedia
- 🤖 **AI-Powered Analysis**: Leverages Cerebras AI with multi-key load balancing
- 📊 **Discrepancy Detection**: Identifies length, keyword, and structural differences
- 📝 **Community Notes**: Generates neutral, evidence-based fact-checking annotations
- ⛓️ **DKG Publishing**: Publishes trust annotations to OriginTrail blockchain
- 🔧 **MCP Tools**: Exposes tools for AI agent integration
- 🌐 **REST API**: Provides endpoints for web dashboard integration

## Installation

### 1. Install the plugin

```bash
cd dkg-node/apps/agent
npm install --save @dkg/trustgraph
```

### 2. Configure environment variables

Add to your `.env` file:

```bash
# Cerebras AI Configuration
CEREBRAS_API_KEYS=key1,key2,key3,key4,key5,key6,key7,key8
CEREBRAS_MODEL=llama3.1-70b
CEREBRAS_MAX_TOKENS=2048
CEREBRAS_TEMPERATURE=0.6
CEREBRAS_TOP_P=0.95

# Topics Configuration
TRUSTGRAPH_TOPICS_FILE=../../packages/trustgraph/data/topics.json
```

### 3. Register the plugin

Edit `apps/agent/src/server/index.ts`:

```typescript
import trustgraphPlugin from "@dkg/trustgraph";

// In createPluginServer function
plugins: [
  // ... other plugins
  trustgraphPlugin,
];
```

### 4. Build and run

```bash
cd dkg-node
npm run build
npm run dev
```

## Usage

### MCP Tools (AI Agent)

The plugin exposes the following MCP tools for AI agent integration:

#### 1. `trustgraph_scan`
Start scanning all topics to compare content and publish to DKG.

```
Use the trustgraph_scan tool to start analyzing Wikipedia vs Grokipedia content
```

#### 2. `trustgraph_status`
Get current scan progress and status.

```
Check the scan status using trustgraph_status
```

#### 3. `trustgraph_get_topic`
Get detailed comparison results for a specific topic.

```
Get the comparison results for "Artificial Intelligence" using trustgraph_get_topic
```

#### 4. `trustgraph_publish`
Manually publish a topic's Community Note to the DKG.

```
Publish the "Blockchain" comparison to DKG using trustgraph_publish
```

### REST API Endpoints

#### GET `/api/trustgraph/topics`
List all topics with their comparison status.

**Response:**
```json
[
  {
    "name": "Artificial Intelligence",
    "similarity": 0.85,
    "discrepancies": 2,
    "status": "completed",
    "ai_analysis_available": true
  }
]
```

#### POST `/api/trustgraph/scan`
Start background scanning process.

**Response:**
```json
{
  "status": "scanning",
  "job_id": "scan_001",
  "total_topics": 60
}
```

#### GET `/api/trustgraph/scan-status`
Get current scan progress.

**Response:**
```json
{
  "status": "processing",
  "progress": 45,
  "current_topic": "Quantum Computing",
  "total_topics": 60,
  "completed_topics": 27
}
```

#### GET `/api/trustgraph/topic/:name`
Get detailed analysis for a specific topic.

**Response:**
```json
{
  "topic": "Artificial Intelligence",
  "similarity_score": 0.82,
  "discrepancies": [
    {
      "type": "keyword",
      "severity": "high",
      "description": "Low keyword overlap: only 45.2% of key terms match"
    }
  ],
  "ai_analysis": "...",
  "community_note": "...",
  "ual": "did:dkg:..."
}
```

#### POST `/api/trustgraph/publish-dkg`
Manually publish a topic to DKG.

**Request:**
```json
{
  "topic": "Blockchain"
}
```

**Response:**
```json
{
  "success": true,
  "ual": "did:dkg:otp:20430/0x.../12345"
}
```

## Architecture

### Components

1. **ContentScraper** - Fetches articles from Wikipedia API and Grokipedia
2. **ContentComparator** - Calculates similarity and detects discrepancies
3. **CerebrasAnalyzer** - AI-powered analysis with load-balanced API keys
4. **DKGPublisher** - Publishes Community Notes to OriginTrail DKG
5. **ScanManager** - Orchestrates the complete workflow

### Data Flow

```
Topics → Scraper → Comparator → Cerebras AI → DKG Publisher
                      ↓
                  Discrepancies
                      ↓
                Community Notes
                      ↓
                  Knowledge Assets
```

## Configuration

### Topics File

Edit `data/topics.json` to customize the list of topics to compare:

```json
[
  "Artificial Intelligence",
  "Machine Learning",
  "Blockchain",
  ...
]
```

### Cerebras API Keys

The plugin supports multiple API keys for load balancing. Add them as a comma-separated list:

```bash
CEREBRAS_API_KEYS=key1,key2,key3,key4,key5,key6,key7,key8
```

The system automatically rotates through keys using round-robin algorithm.

## Discrepancy Detection

The system detects three types of discrepancies:

### 1. Length Discrepancy
- **Trigger**: >30% difference in content length
- **Severity**: Medium
- **Example**: "Wikipedia has 5000 chars, Grokipedia has 2000 chars (60% difference)"

### 2. Keyword Mismatch
- **Trigger**: <50% overlap in top keywords
- **Severity**: High
- **Example**: "Only 45% of key terms match between sources"

### 3. Structural Differences
- **Trigger**: Significant differences in formatting
- **Severity**: Low
- **Example**: "Wikipedia has 50 line breaks, Grokipedia has 15"

## Knowledge Asset Format

Community Notes are published as JSON-LD Knowledge Assets:

```json
{
  "@context": "https://schema.org",
  "@type": "FactCheck",
  "@id": "urn:trustgraph:comparison:artificial-intelligence",
  "topic": "Artificial Intelligence",
  "claimReviewed": "Grokipedia content accuracy",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 0.82,
    "bestRating": 1.0
  },
  "discrepancies": [...],
  "aiAnalysis": "...",
  "timestamp": "2025-01-15T10:30:00Z",
  "source": "TrustGraph: Wikipedia vs Grokipedia Comparison System"
}
```

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run check-types
```

## Troubleshooting

### Cerebras API Errors
- System automatically rotates through multiple keys
- Check logs for specific error messages
- Falls back to automatic analysis if all keys fail

### Wikipedia Fetch Failures
- Some topics may have disambiguation pages
- System automatically tries first search result
- Check logs for specific failures

### Grokipedia Scraping Issues
- Update URL format in `services/scraper.ts` if needed
- Adjust CSS selectors based on site structure
- Check logs for HTTP errors

## License

MIT License - OriginTrail Global Hackathon 2025

## Acknowledgments

- **OriginTrail** - DKG infrastructure
- **Cerebras** - AI analysis platform
- **Wikipedia** - Baseline content source
