# Design Document

## Overview

The Wikipedia vs Grokipedia Content Comparison System is a full-stack web application that performs automated content analysis across 50+ topics. The architecture follows a Flask-based backend with RESTful APIs, integrated with external services (Pinecone, Cerebras, OriginTrail DKG), and a lightweight HTML/CSS/JavaScript frontend.

The system operates in three phases:
1. **Content Acquisition**: Fetch articles from Wikipedia API and scrape Grokipedia
2. **Analysis Pipeline**: Generate embeddings, compare vectors, run AI analysis
3. **Publishing & Presentation**: Generate Community Notes, publish to DKG, display results

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  (HTML/CSS/JS + Bootstrap 5)                                │
│  - Dashboard (index.html)                                    │
│  - Comparison View (comparison.html)                         │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────────────────────┐
│                     Flask Application                        │
│  (app.py - Routes, Controllers, Background Jobs)            │
└─────┬──────┬──────┬──────┬──────┬──────────────────────────┘
      │      │      │      │      │
      ▼      ▼      ▼      ▼      ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐
│Scraper  │ │Embeddings│ │Comparator│ │Cerebras  │ │DKG      │
│Module   │ │Manager   │ │          │ │Analyzer  │ │Publisher│
└────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘
     │           │            │            │            │
     ▼           ▼            ▼            ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐
│Wikipedia│ │Pinecone  │ │scikit-   │ │Cerebras  │ │Origin   │
│API +    │ │Vector DB │ │learn     │ │Cloud API │ │Trail DKG│
│Grokipedia│ │         │ │          │ │(8 keys)  │ │         │
└─────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘
```

### Technology Stack

**Backend:**
- Python 3.9+ with Flask 2.3.0
- Sentence-Transformers for local embeddings
- Pinecone client for vector storage
- Cerebras Cloud SDK for AI analysis
- BeautifulSoup4 for web scraping
- Wikipedia API library
- spaCy for NLP utilities

**Frontend:**
- HTML5 with Jinja2 templating
- Bootstrap 5 for responsive UI
- Vanilla JavaScript for API interactions

**External Services:**
- Pinecone (free tier: 100K vectors)
- Cerebras Cloud (free tier with 8 API keys)
- OriginTrail DKG testnet

## Components and Interfaces

### 1. Configuration Module (`config.py`)

**Purpose:** Centralized configuration management with environment variable loading

**Key Components:**
- `PINECONE_API_KEY`: API key for Pinecone vector database
- `PINECONE_INDEX_NAME`: Index name "wikipedia-grokipedia"
- `DKG_ENDPOINT`: OriginTrail DKG testnet URL
- `CEREBRAS_MODEL`: Model identifier "qwen-3-235b-a22b-thinking-2507"
- `CEREBRAS_MAX_TOKENS`: Token limit 2048
- `CEREBRAS_TEMPERATURE`: 0.6 for balanced creativity
- `CEREBRAS_TOP_P`: 0.95 for nucleus sampling

**Design Decision:** Use environment variables for sensitive keys to avoid hardcoding credentials

### 2. API Key Rotator (`data/api_keys.py`)

**Purpose:** Load balance Cerebras API requests across 8 keys to avoid rate limits

**Class: APIKeyRotator**

```python
class APIKeyRotator:
    - keys: list[str]  # 8 Cerebras API keys
    - current_index: int  # Round-robin pointer
    
    + get_next_key() -> str  # Returns next key in rotation
    + get_random_key() -> str  # Returns random key
```

**Algorithm:** Round-robin rotation with modulo arithmetic
- Start at index 0
- Increment after each request
- Wrap to 0 when reaching end of list

**Design Decision:** Round-robin ensures even distribution; random key method provides fallback strategy

### 3. Content Scraper (`backend/scraper.py`)

**Purpose:** Fetch content from Wikipedia and Grokipedia

**Class: ContentScraper**

```python
class ContentScraper:
    + get_topics() -> list[str]
        # Returns list of 50+ topics from topics.json
    
    + fetch_wikipedia(topic: str) -> dict
        # Returns: {title, content, url, timestamp}
        # Uses wikipedia library
    
    + fetch_grokipedia(topic: str) -> dict
        # Returns: {title, content, url, timestamp}
        # Uses BeautifulSoup4 for scraping
```

**Data Flow:**
1. Load topics from `data/topics.json`
2. For Wikipedia: Use `wikipedia.page()` API
3. For Grokipedia: HTTP GET + BeautifulSoup parsing
4. Return structured dictionaries with content and metadata

**Error Handling:**
- Catch `wikipedia.exceptions.DisambiguationError`
- Handle HTTP timeouts with 10-second limit
- Return None for failed fetches

**Design Decision:** Separate methods for each platform allow independent error handling and future extensibility

### 4. Embedding Manager (`backend/embeddings.py`)

**Purpose:** Generate and manage vector embeddings using Sentence-Transformers

**Class: EmbeddingManager**

```python
class EmbeddingManager:
    - model: SentenceTransformer  # 'all-MiniLM-L6-v2'
    - pinecone_index: Index
    
    + __init__()
        # Initialize Sentence-Transformers model
        # Connect to Pinecone index
    
    + generate_embedding(text: str) -> np.ndarray
        # Returns 384-dimensional vector
    
    + store_embedding(topic: str, source: str, vector: np.ndarray, metadata: dict)
        # Stores in Pinecone with ID format: "{topic}_{source}"
    
    + get_embedding(topic: str, source: str) -> np.ndarray
        # Retrieves from Pinecone
```

**Model Selection:** `all-MiniLM-L6-v2`
- Fast inference (local, no API calls)
- 384 dimensions (efficient storage)
- Good semantic understanding

**Pinecone Schema:**
- **ID**: `{topic}_wikipedia` or `{topic}_grokipedia`
- **Vector**: 384-dimensional float array
- **Metadata**: `{source, topic, timestamp, content_length}`

**Design Decision:** Local embeddings avoid API costs and latency; Pinecone provides fast similarity search

### 5. Content Comparator (`backend/comparison.py`)

**Purpose:** Compare Wikipedia and Grokipedia content using vector similarity and NLP

**Class: ContentComparator**

```python
class ContentComparator:
    + compare_topics(topic: str, wiki_content: str, grok_content: str) -> dict
        # Returns: {
        #   similarity_score: float,
        #   discrepancies: list[dict],
        #   comparison_metadata: dict
        # }
    
    - _calculate_cosine_similarity(vec1, vec2) -> float
        # Uses sklearn.metrics.pairwise.cosine_similarity
    
    - _detect_discrepancies(wiki_text, grok_text) -> list[dict]
        # Returns list of {type, severity, description}
```

**Discrepancy Detection Logic:**

1. **Length Discrepancy**
   - If `|len(wiki) - len(grok)| / max(len(wiki), len(grok)) > 0.3`
   - Severity: medium

2. **Keyword Mismatch**
   - Extract top 10 keywords using TF-IDF
   - If overlap < 50%, flag as discrepancy
   - Severity: high

3. **Structural Differences**
   - Compare section counts, list counts
   - Severity: low

**Similarity Score Interpretation:**
- 0.8-1.0: High similarity (green)
- 0.6-0.8: Moderate similarity (yellow)
- 0.0-0.6: Low similarity (red)

**Design Decision:** Combine vector similarity (semantic) with rule-based checks (structural) for comprehensive analysis

### 6. Cerebras Analyzer (`backend/cerebras_analyzer.py`)

**Purpose:** AI-powered analysis using Cerebras with load-balanced API keys

**Class: CerebrasAnalyzer**

```python
class CerebrasAnalyzer:
    - model: str  # "qwen-3-235b-a22b-thinking-2507"
    - max_tokens: int
    - temperature: float
    - top_p: float
    
    + analyze_discrepancies(topic, wiki_content, grok_content, discrepancies) -> dict
        # Returns: {
        #   success: bool,
        #   ai_analysis: str,
        #   model: str,
        #   tokens_used: int
        # }
    
    + generate_community_note(topic, similarity_score, discrepancies, ai_analysis) -> str
        # Returns formatted Community Note text
    
    + batch_analyze(results: list) -> list
        # Analyzes multiple topics with key rotation
    
    - _get_client() -> Cerebras
        # Gets client with rotated API key
    
    - _extract_thinking(content: str) -> str
        # Removes <think>...</think> tags
```

**Prompt Engineering:**

**Analysis Prompt Structure:**
```
You are a fact-checking expert analyzing content for accuracy and bias.

Topic: {topic}
Wikipedia excerpt: {wiki_snippet}
Grokipedia excerpt: {grok_snippet}
Detected discrepancies: {discrepancies}

Provide:
1. Summary of key differences (2-3 sentences)
2. Assessment of AI hallucination risk (high/medium/low)
3. Potential bias indicators
4. Recommendation (trusted/needs_review/unreliable)
5. Confidence score (0-100)

Be concise and factual.
```

**Community Note Prompt Structure:**
```
Write a concise, neutral Community Note (max 300 words) for fact-checkers.

Topic: {topic}
Similarity to Wikipedia: {similarity_score*100:.1f}%
Discrepancies Found: {len(discrepancies)}
AI Analysis: {ai_analysis}

Format as:
- Context: Why this matters
- Key findings: What we found
- Sources: Wikipedia as baseline
- Status: Recommended action

Keep tone neutral and evidence-based.
```

**API Key Load Balancing:**
- Use `key_rotator.get_next_key()` before each request
- Log current key index for debugging
- Automatic rotation prevents rate limit errors

**Thinking Tag Removal:**
- Regex pattern: `r'<think>[\s\S]*?</think>'`
- Ensures clean output for display

**Fallback Strategy:**
- If Cerebras API fails, return structured fallback
- Include automatic discrepancy count
- Set `success: false` flag

**Design Decision:** Load balancing across 8 keys provides 8x rate limit capacity; thinking tag removal ensures clean UI presentation

### 7. DKG Publisher (`backend/dkg_publisher.py`)

**Purpose:** Publish Community Notes to OriginTrail Decentralized Knowledge Graph

**Class: DKGPublisher**

```python
class DKGPublisher:
    - endpoint: str  # DKG testnet URL
    - api_key: str
    
    + publish_community_note(topic, discrepancies, similarity_score, ai_analysis) -> str
        # Returns UAL (Universal Asset Locator)
    
    - _format_knowledge_asset(data: dict) -> dict
        # Formats data for DKG schema
```

**Knowledge Asset Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "FactCheck",
  "topic": "string",
  "claimReviewed": "Grokipedia content accuracy",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "similarity_score",
    "bestRating": 1.0
  },
  "discrepancies": [...],
  "aiAnalysis": "string",
  "timestamp": "ISO8601",
  "source": "Wikipedia vs Grokipedia Comparison System"
}
```

**Publishing Flow:**
1. Format data into Knowledge Asset schema
2. POST to DKG endpoint with API key
3. Receive UAL in response
4. Return UAL for storage

**Design Decision:** Use Schema.org FactCheck type for semantic interoperability; UAL provides permanent reference

### 8. Flask Application (`app.py`)

**Purpose:** Web server with RESTful API and background job management

**Routes:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Render dashboard |
| GET | `/comparison/<topic>` | Render comparison page |
| GET | `/api/topics` | List all topics with status |
| POST | `/api/scan` | Start background scan |
| GET | `/api/scan-status` | Get scan progress |
| GET | `/api/topic/<topic>` | Get topic details |
| POST | `/api/publish-dkg` | Publish to DKG |

**Background Scanning:**
```python
def run_scan():
    scan_status["status"] = "processing"
    topics = scraper.get_topics()
    
    for i, topic in enumerate(topics):
        # Update progress
        scan_status["current_topic"] = topic
        scan_status["progress"] = int((i / len(topics)) * 100)
        
        # Fetch content
        wiki = scraper.fetch_wikipedia(topic)
        grok = scraper.fetch_grokipedia(topic)
        
        # Compare
        comparison = comparator.compare_topics(topic, wiki['content'], grok['content'])
        
        # AI analysis
        ai_analysis = cerebras.analyze_discrepancies(...)
        community_note = cerebras.generate_community_note(...)
        
        # Publish to DKG
        ual = dkg.publish_community_note(...)
        
        # Store results
        scan_results[topic] = {
            ...comparison,
            'ai_analysis': ai_analysis,
            'community_note': community_note,
            'ual': ual
        }
    
    scan_status["status"] = "completed"
```

**State Management:**
- `scan_results`: In-memory dict storing all results
- `scan_status`: Dict with `{status, progress, current_topic}`

**Design Decision:** Background threading prevents blocking; in-memory storage sufficient for hackathon (use Redis for production)

### 9. Frontend Components

**Dashboard (`templates/index.html`)**

Features:
- Stats cards: Topics analyzed, discrepancies found, avg similarity
- Scan button with progress bar
- Results table with color-coded rows
- Real-time progress updates via polling

**JavaScript Logic:**
```javascript
function startScan() {
    fetch('/api/scan', {method: 'POST'})
    checkProgress()  // Poll every 1 second
}

function checkProgress() {
    fetch('/api/scan-status')
        .then(data => {
            updateProgressBar(data.progress)
            if (data.status !== 'completed') {
                setTimeout(checkProgress, 1000)
            } else {
                loadResults()
            }
        })
}
```

**Comparison Page (`templates/comparison.html`)**

Features:
- Similarity score progress bar with color coding
- AI analysis card (Cerebras output)
- Discrepancies list with severity badges
- Community Note display with publish button
- Side-by-side content comparison

**Color Coding:**
- Green (≥80%): High trust
- Yellow (60-80%): Moderate trust
- Red (<60%): Low trust

**Design Decision:** Polling-based updates avoid WebSocket complexity; color coding provides instant visual feedback

## Data Models

### Topic Result Model

```python
{
    "topic": str,
    "similarity_score": float,  # 0.0-1.0
    "discrepancies": [
        {
            "type": str,  # "length", "keyword", "structural"
            "severity": str,  # "low", "medium", "high"
            "description": str
        }
    ],
    "wiki_content": str,
    "grok_content": str,
    "ai_analysis": str,
    "community_note": str,
    "ual": str,  # DKG Universal Asset Locator
    "timestamp": str,  # ISO8601
    "analysis_success": bool
}
```

### Scan Status Model

```python
{
    "status": str,  # "idle", "processing", "completed"
    "progress": int,  # 0-100
    "current_topic": str
}
```

### Topics Configuration (`data/topics.json`)

```json
[
    "Artificial Intelligence",
    "Climate Change",
    "Quantum Computing",
    "Blockchain Technology",
    ...
]
```

## Error Handling

### Strategy: Graceful Degradation

**Level 1: Component-Level Errors**
- Wikipedia fetch fails → Skip topic, log error, continue
- Grokipedia scrape fails → Skip topic, log error, continue
- Embedding generation fails → Skip topic, log error, continue

**Level 2: Service-Level Errors**
- Cerebras API fails → Return fallback analysis, set `success: false`
- DKG publish fails → Return error message, continue with local storage
- Pinecone connection fails → Use in-memory embeddings as fallback

**Level 3: Application-Level Errors**
- Scan already running → Return 409 Conflict
- Topic not found → Return 404 Not Found
- Invalid request → Return 400 Bad Request

**Logging Strategy:**
```python
logger.info(f"✓ Completed: {topic}")
logger.error(f"✗ Error scanning {topic}: {str(e)}")
logger.warning(f"⚠ Cerebras fallback used for {topic}")
```

**Design Decision:** Never crash the entire scan due to single topic failure; provide meaningful fallbacks

## Testing Strategy

### Unit Tests

**Test Coverage:**
1. `test_api_key_rotator.py`
   - Test round-robin rotation
   - Test random key selection
   - Test index wrapping

2. `test_scraper.py`
   - Mock Wikipedia API responses
   - Mock Grokipedia HTML responses
   - Test error handling for missing pages

3. `test_embeddings.py`
   - Test embedding generation
   - Test Pinecone storage/retrieval
   - Test vector dimensions

4. `test_comparator.py`
   - Test cosine similarity calculation
   - Test discrepancy detection logic
   - Test edge cases (empty content, identical content)

5. `test_cerebras_analyzer.py`
   - Mock Cerebras API responses
   - Test thinking tag removal
   - Test fallback behavior

### Integration Tests

1. **End-to-End Scan Test**
   - Start scan with 3 test topics
   - Verify all components execute
   - Check result structure

2. **API Endpoint Tests**
   - Test all Flask routes
   - Verify response formats
   - Test error responses

### Manual Testing

1. **UI Testing**
   - Test dashboard interactions
   - Test progress bar updates
   - Test comparison page rendering

2. **Load Testing**
   - Test with 50+ topics
   - Verify API key rotation
   - Monitor memory usage

**Design Decision:** Focus on unit tests for core logic; integration tests for critical paths; manual testing for UI/UX

## Performance Considerations

### Optimization Strategies

1. **Embedding Generation**
   - Use local Sentence-Transformers (no API latency)
   - Batch process embeddings where possible
   - Cache embeddings in Pinecone

2. **API Rate Limiting**
   - 8 Cerebras API keys provide 8x capacity
   - Round-robin ensures even distribution
   - Add delays if rate limits still hit

3. **Background Processing**
   - Scan runs in separate thread
   - Non-blocking Flask responses
   - Progress updates via polling

4. **Content Truncation**
   - Limit Wikipedia/Grokipedia content to 1500 chars for AI analysis
   - Reduces token usage and latency
   - Full content stored for reference

**Expected Performance:**
- Single topic analysis: 3-5 seconds
- 50 topics scan: 3-5 minutes
- Dashboard load time: <1 second

**Design Decision:** Balance between accuracy and speed; truncation acceptable for AI analysis while preserving full content

## Security Considerations

1. **API Key Management**
   - Store keys in `.env` file (not committed)
   - Use environment variables in production
   - Rotate keys if exposed

2. **Input Validation**
   - Sanitize topic names in URLs
   - Validate JSON payloads
   - Escape HTML in scraped content

3. **Rate Limiting**
   - Prevent scan spam with status check
   - Limit concurrent scans to 1

4. **CORS**
   - Configure Flask-CORS for production
   - Whitelist frontend domain

**Design Decision:** Environment variables for secrets; input validation prevents injection attacks

## Deployment

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export PINECONE_API_KEY="your_key"
export FLASK_PORT=5000
export FLASK_DEBUG=True

# Run application
python app.py
```

### Production Considerations

1. **Use production WSGI server** (Gunicorn, uWSGI)
2. **Enable Redis** for scan_results persistence
3. **Configure logging** to file/service
4. **Set FLASK_DEBUG=False**
5. **Use reverse proxy** (Nginx) for static files

**Design Decision:** Simple local setup for hackathon; production-ready architecture for scaling
