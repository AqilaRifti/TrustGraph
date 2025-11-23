# TrustGraph Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         DKG Agent                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  TrustGraph Plugin                         │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  MCP Tools   │  │  REST API    │  │ Scan Manager │   │  │
│  │  │              │  │              │  │              │   │  │
│  │  │ • scan       │  │ • /topics    │  │ • Progress   │   │  │
│  │  │ • status     │  │ • /scan      │  │ • Results    │   │  │
│  │  │ • get_topic  │  │ • /status    │  │ • Storage    │   │  │
│  │  │ • publish    │  │ • /publish   │  │              │   │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │  │
│  │         │                  │                  │           │  │
│  │         └──────────────────┴──────────────────┘           │  │
│  │                            │                               │  │
│  │                    ┌───────▼────────┐                     │  │
│  │                    │  Scan Manager  │                     │  │
│  │                    └───────┬────────┘                     │  │
│  │                            │                               │  │
│  │         ┌──────────────────┼──────────────────┐           │  │
│  │         │                  │                  │           │  │
│  │    ┌────▼─────┐    ┌──────▼──────┐    ┌─────▼──────┐    │  │
│  │    │ Scraper  │    │ Comparator  │    │  Cerebras  │    │  │
│  │    │          │    │             │    │  Analyzer  │    │  │
│  │    │ • Wiki   │    │ • Similarity│    │            │    │  │
│  │    │ • Grok   │    │ • Discrep.  │    │ • Analysis │    │  │
│  │    └────┬─────┘    └──────┬──────┘    │ • Notes    │    │  │
│  │         │                  │           └─────┬──────┘    │  │
│  │         │                  │                 │           │  │
│  │         └──────────────────┴─────────────────┘           │  │
│  │                            │                               │  │
│  │                    ┌───────▼────────┐                     │  │
│  │                    │ DKG Publisher  │                     │  │
│  │                    └───────┬────────┘                     │  │
│  └────────────────────────────┼──────────────────────────────┘  │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  OriginTrail DKG        │
                    │  (Blockchain)           │
                    └─────────────────────────┘
```

## Data Flow

### 1. Scan Initiation

```
User/Agent → MCP Tool/API → Scan Manager
                                  │
                                  ▼
                            Load Topics
                                  │
                                  ▼
                          For Each Topic...
```

### 2. Topic Processing

```
Topic → Scraper ──┬─→ Wikipedia API
                  │
                  └─→ Grokipedia (Web Scraping)
                          │
                          ▼
                    Content Retrieved
                          │
                          ▼
                    Comparator
                          │
                    ┌─────┴─────┐
                    │           │
              Similarity    Discrepancies
                    │           │
                    └─────┬─────┘
                          │
                          ▼
                   Cerebras Analyzer
                          │
                    ┌─────┴─────┐
                    │           │
              AI Analysis   Community Note
                    │           │
                    └─────┬─────┘
                          │
                          ▼
                    DKG Publisher
                          │
                          ▼
                    Knowledge Asset
                          │
                          ▼
                        UAL
```

### 3. Result Storage

```
Comparison Result → Scan Manager → In-Memory Storage
                                         │
                                         ▼
                                   Available via:
                                   • MCP Tools
                                   • REST API
```

## Component Details

### Scraper

**Purpose**: Fetch content from Wikipedia and Grokipedia

**Methods**:
- `fetchWikipedia(topic)` → ArticleContent
- `fetchGrokipedia(topic)` → ArticleContent

**External Dependencies**:
- Wikipedia REST API
- Axios for HTTP requests
- Cheerio for HTML parsing

### Comparator

**Purpose**: Analyze differences between articles

**Methods**:
- `compareTopics(topic, wiki, grok)` → ComparisonResult
- `calculateSimilarity(text1, text2)` → number
- `detectDiscrepancies(wiki, grok)` → Discrepancy[]

**Algorithms**:
- Jaccard similarity for content comparison
- TF-IDF for keyword extraction
- Statistical analysis for discrepancies

### Cerebras Analyzer

**Purpose**: AI-powered analysis and note generation

**Methods**:
- `analyzeDiscrepancies(...)` → AIAnalysisResult
- `generateCommunityNote(...)` → string
- `batchAnalyze(results)` → enhanced results

**Features**:
- Multi-key load balancing
- Automatic fallback
- Thinking tag removal

### DKG Publisher

**Purpose**: Publish to OriginTrail blockchain

**Methods**:
- `publishCommunityNote(...)` → UAL
- `getAsset(ual)` → Knowledge Asset

**Format**: JSON-LD with Schema.org FactCheck type

### Scan Manager

**Purpose**: Orchestrate complete workflow

**Methods**:
- `startScan()` → void (async)
- `scanTopic(topic)` → ComparisonResult
- `getScanStatus()` → ScanStatus
- `getResult(topic)` → ComparisonResult
- `publishToDKG(topic)` → UAL

**State Management**:
- Progress tracking
- Result storage
- Error recovery

## API Interfaces

### MCP Tools

```typescript
// Start scan
trustgraph_scan() → { status: "scanning" }

// Get status
trustgraph_status() → ScanStatus

// Get topic
trustgraph_get_topic(topic: string) → ComparisonResult

// Publish
trustgraph_publish(topic: string) → { ual: string }
```

### REST API

```typescript
// List topics
GET /api/trustgraph/topics → TopicStatus[]

// Start scan
POST /api/trustgraph/scan → { status, job_id }

// Get status
GET /api/trustgraph/scan-status → ScanStatus

// Get topic
GET /api/trustgraph/topic/:name → ComparisonResult

// Publish
POST /api/trustgraph/publish-dkg → { success, ual }
```

## Data Models

### ArticleContent

```typescript
{
  title: string;
  content: string;
  url: string;
  timestamp: string;
}
```

### ComparisonResult

```typescript
{
  topic: string;
  similarity_score: number;
  discrepancies: Discrepancy[];
  wiki_content?: string;
  grok_content?: string;
  ai_analysis?: string;
  community_note?: string;
  ual?: string;
  timestamp?: string;
  comparison_metadata: {
    wiki_length: number;
    grok_length: number;
    discrepancy_count: number;
  };
}
```

### Discrepancy

```typescript
{
  type: 'length' | 'keyword' | 'structural';
  severity: 'low' | 'medium' | 'high';
  description: string;
}
```

### KnowledgeAsset (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "FactCheck",
  "@id": "urn:trustgraph:comparison:...",
  "topic": "...",
  "claimReviewed": "Grokipedia content accuracy",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 0.85,
    "bestRating": 1.0
  },
  "discrepancies": [...],
  "aiAnalysis": "...",
  "timestamp": "2025-01-15T10:30:00Z",
  "source": "TrustGraph"
}
```

## Error Handling

### Strategy: Graceful Degradation

```
Error Level 1: Component Failure
├─ Wikipedia fetch fails → Skip topic, continue
├─ Grokipedia fetch fails → Skip topic, continue
└─ Embedding fails → Skip topic, continue

Error Level 2: Service Failure
├─ Cerebras API fails → Use fallback analysis
├─ DKG publish fails → Log error, continue
└─ All API keys exhausted → Use fallback

Error Level 3: System Failure
├─ Scan already running → Return 409 Conflict
├─ Topic not found → Return 404 Not Found
└─ Invalid request → Return 400 Bad Request
```

## Performance Characteristics

### Timing

- Single topic: 3-5 seconds
- 60 topics: 3-5 minutes
- API call: ~1-2 seconds
- DKG publish: ~10-30 seconds

### Scalability

- API keys: 8 keys = 8x throughput
- Concurrent topics: Limited by API keys
- Memory: ~200MB for 60 topics
- Storage: In-memory (production: use Redis)

### Bottlenecks

1. **Cerebras API**: Rate limited per key
2. **DKG Publishing**: Blockchain confirmation time
3. **Web Scraping**: Network latency
4. **Memory**: Large content storage

## Security Considerations

### API Keys

- Stored in environment variables
- Never committed to git
- Rotated automatically
- Fallback on failure

### Input Validation

- Topic names sanitized
- URL encoding applied
- JSON schema validation
- Error boundaries

### Rate Limiting

- Automatic key rotation
- Timeout handling
- Retry logic
- Graceful degradation

## Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Environment Variables

```bash
CEREBRAS_API_KEYS=key1,key2,...
CEREBRAS_MODEL=llama3.1-70b
CEREBRAS_MAX_TOKENS=2048
CEREBRAS_TEMPERATURE=0.6
CEREBRAS_TOP_P=0.95
TRUSTGRAPH_TOPICS_FILE=path/to/topics.json
```

## Monitoring

### Logs

```
✓ Success: Green checkmark
✗ Error: Red X
⚠ Warning: Yellow warning
📤 Publishing: Upload icon
✅ Complete: Green checkmark box
```

### Metrics

- Topics processed
- Success rate
- Average similarity
- Discrepancies found
- API key usage
- DKG publish rate

## Testing Strategy

### Unit Tests

- Scraper: Mock HTTP responses
- Comparator: Test algorithms
- Analyzer: Mock Cerebras API
- Publisher: Mock DKG client

### Integration Tests

- End-to-end scan
- API endpoint tests
- Error handling tests

### Manual Tests

- UI interactions
- Progress tracking
- Result display
- DKG verification
