# Quick Start Guide

## 🎯 Get Running in 3 Steps

### Step 1: Setup Environment
```bash
# Linux/Mac
./run.sh

# Windows
run.bat
```

### Step 2: Configure API Keys
Edit `.env` file and add your Pinecone API key:
```
PINECONE_API_KEY=your_actual_key_here
```

**Note**: Cerebras API keys are already configured in `data/api_keys.py`

### Step 3: Access Dashboard
Open your browser to:
```
http://localhost:5000
```

## 🚀 Using the System

1. **Click "Start Scanning"** on the dashboard
2. **Watch progress** as 54 topics are analyzed
3. **View results** in the table (color-coded by similarity)
4. **Click "View"** on any topic for detailed analysis
5. **Publish to DKG** from the comparison page

## 📊 What You'll See

### Dashboard
- Topics analyzed count
- Total discrepancies found
- Average similarity score
- Real-time progress bar
- Results table with all topics

### Comparison Page
- Similarity score (color-coded)
- AI analysis from Cerebras
- Detected discrepancies
- Community Note
- Side-by-side content comparison
- DKG publish button

## 🔑 Key Features

✅ **54 Topics** - AI, Blockchain, Climate, Space, History, Religion, Physics  
✅ **Vector Embeddings** - Semantic similarity using Sentence-Transformers  
✅ **AI Analysis** - Cerebras with 8-key load balancing  
✅ **Discrepancy Detection** - Length, keyword, and structural differences  
✅ **Community Notes** - Neutral, evidence-based fact-checking  
✅ **DKG Publishing** - OriginTrail blockchain integration  

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Change port in .env
FLASK_PORT=8080
```

**Pinecone errors?**
- Get free API key at: https://www.pinecone.io/
- Add to `.env` file

**Dependencies issues?**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## 📝 Project Structure

```
├── app.py                 # Flask server
├── config.py              # Configuration
├── backend/               # Core logic
│   ├── scraper.py        # Wikipedia/Grokipedia fetching
│   ├── embeddings.py     # Vector embeddings
│   ├── comparison.py     # Discrepancy detection
│   ├── cerebras_analyzer.py  # AI analysis
│   └── dkg_publisher.py  # DKG publishing
├── templates/             # HTML pages
├── static/                # CSS/JS
└── data/                  # Topics & API keys
```

## 🎓 For Hackathon Judges

This project demonstrates:
- **Full-stack development** (Python Flask + HTML/CSS/JS)
- **AI integration** (Cerebras for analysis)
- **Vector databases** (Pinecone for embeddings)
- **Blockchain** (OriginTrail DKG)
- **Web scraping** (Wikipedia API + BeautifulSoup)
- **Load balancing** (8-key rotation)
- **Real-time updates** (Progress tracking)
- **Error handling** (Graceful degradation)

Built for the **OriginTrail Global Hackathon 2025** 🏆
