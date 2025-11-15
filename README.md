# Wikipedia vs Grokipedia Quality Control System

**OriginTrail Global Hackathon 2025**

An AI-powered content comparison and trust annotation system that analyzes articles from Wikipedia and Grokipedia, detects discrepancies, and publishes Community Notes to the OriginTrail Decentralized Knowledge Graph (DKG).

## 🚀 Features

- **Automated Content Fetching**: Scrapes 50+ topics from Wikipedia and Grokipedia
- **Vector Embeddings**: Uses Sentence-Transformers for semantic analysis
- **AI-Powered Analysis**: Leverages Cerebras AI with 8-key load balancing
- **Discrepancy Detection**: Identifies length, keyword, and structural differences
- **Community Notes**: Generates neutral, evidence-based fact-checking notes
- **DKG Publishing**: Publishes trust annotations to OriginTrail blockchain
- **Web Dashboard**: Clean, responsive UI with real-time progress tracking

## 🛠️ Tech Stack

### Backend
- **Python 3.9+** with Flask
- **Pinecone** - Vector database (free tier)
- **Sentence-Transformers** - Local embeddings (all-MiniLM-L6-v2)
- **Cerebras Cloud SDK** - AI analysis with load balancing
- **OriginTrail DKG** - Decentralized knowledge graph
- **BeautifulSoup4** - Web scraping
- **Wikipedia API** - Content fetching

### Frontend
- **HTML5/CSS3/JavaScript**
- **Bootstrap 5** - Responsive design
- **Vanilla JS** - No frameworks needed

## 📦 Installation

### Prerequisites
- Python 3.9 or higher
- pip package manager
- Pinecone API key (free tier)
- Cerebras API keys (provided)

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd hackathon-project
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```
PINECONE_API_KEY=your_pinecone_api_key_here
DKG_ENDPOINT=https://dkg-testnet.origin-trail.io
DKG_API_KEY=your_dkg_api_key_here
FLASK_DEBUG=True
FLASK_PORT=5000
```

5. **Run the application**
```bash
python app.py
```

6. **Access the dashboard**
Open your browser and navigate to:
```
http://localhost:5000
```

## 🎯 Usage

### Starting a Scan

1. Open the dashboard at `http://localhost:5000`
2. Click the **"🚀 Start Scanning"** button
3. Watch real-time progress as topics are analyzed
4. View results in the table once complete

### Viewing Comparisons

1. Click **"View"** on any completed topic
2. Review:
   - Similarity score (color-coded)
   - AI analysis from Cerebras
   - Detected discrepancies
   - Community Note
   - Side-by-side content comparison

### Publishing to DKG

1. On a comparison page, click **"Publish to DKG"**
2. Wait for confirmation
3. UAL (Universal Asset Locator) will be displayed

## 📊 API Endpoints

### GET `/`
Renders the main dashboard

### GET `/comparison/<topic_name>`
Renders detailed comparison page for a topic

### GET `/api/topics`
Returns list of all topics with status
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

### POST `/api/scan`
Starts background scanning process
```json
{
  "status": "scanning",
  "job_id": "scan_001"
}
```

### GET `/api/scan-status`
Returns current scan progress
```json
{
  "status": "processing",
  "progress": 45,
  "current_topic": "Quantum Computing"
}
```

### GET `/api/topic/<topic_name>`
Returns detailed analysis for a specific topic
```json
{
  "similarity_score": 0.82,
  "discrepancies": [...],
  "ai_analysis": "...",
  "community_note": "...",
  "ual": "did:dkg:..."
}
```

### POST `/api/publish-dkg`
Manually publishes a topic to DKG
```json
{
  "topic": "Artificial Intelligence",
  "discrepancies": [...],
  "similarity_score": 0.82,
  "ai_analysis": "..."
}
```

## 🔗 DKG Integration

The system publishes Community Notes as **JSON-LD Knowledge Assets** to the OriginTrail Decentralized Knowledge Graph:

- **Format**: ActivityStreams JSON-LD with provenance
- **Blockchain**: NeuroWeb Testnet (Chain ID: 20430)
- **Local Node**: Connects to `http://localhost:8900`
- **UAL**: Returns Universal Asset Locator for each published note
- **Mock Mode**: Works without DKG node (generates mock UALs)

See [DKG_SETUP.md](DKG_SETUP.md) for detailed setup instructions.

## 🔑 Key Features Explained

### API Key Load Balancing
The system rotates through 8 Cerebras API keys using round-robin algorithm to avoid rate limits:
```python
# Automatic rotation on each request
key_rotator.get_next_key()
```

### Vector Similarity
Uses cosine similarity on 384-dimensional embeddings:
- **0.8-1.0**: High similarity (green)
- **0.6-0.8**: Moderate similarity (yellow)
- **0.0-0.6**: Low similarity (red)

### Discrepancy Detection
Three types of discrepancies:
1. **Length**: >30% difference in content length
2. **Keyword**: <50% overlap in top keywords (TF-IDF)
3. **Structural**: Significant differences in formatting

### Graceful Error Handling
- Failed topics are skipped, not blocking the scan
- Cerebras failures fall back to automatic analysis
- DKG publishing errors are logged but don't crash

## 📁 Project Structure

```
hackathon-project/
├── app.py                      # Flask application
├── config.py                   # Configuration
├── requirements.txt            # Dependencies
├── backend/
│   ├── scraper.py             # Content fetching
│   ├── embeddings.py          # Vector embeddings
│   ├── comparison.py          # Discrepancy detection
│   ├── cerebras_analyzer.py   # AI analysis
│   └── dkg_publisher.py       # DKG publishing
├── data/
│   ├── topics.json            # 54 topics
│   └── api_keys.py            # API key rotation
├── static/
│   ├── css/style.css          # Custom styles
│   └── js/script.js           # Utilities
├── templates/
│   ├── base.html              # Base template
│   ├── index.html             # Dashboard
│   └── comparison.html        # Comparison view
└── .env                        # Environment variables
```

## 🐛 Troubleshooting

### Pinecone Connection Issues
- Verify API key in `.env`
- Check index name matches `wikipedia-grokipedia`
- Ensure free tier limits not exceeded

### Cerebras API Errors
- System automatically rotates through 8 keys
- Check logs for specific error messages
- Falls back to automatic analysis if all keys fail

### Wikipedia Fetch Failures
- Some topics may have disambiguation pages
- System automatically tries first option
- Check logs for specific failures

### Grokipedia Scraping Issues
- Update URL format in `backend/scraper.py`
- Adjust CSS selectors based on site structure
- Mock data used if site unavailable

## 📝 License

MIT License - OriginTrail Global Hackathon 2025

## 🙏 Acknowledgments

- **OriginTrail** - DKG infrastructure
- **Cerebras** - AI analysis platform
- **Pinecone** - Vector database
- **Wikipedia** - Baseline content source
