# OriginTrail Global Hackathon 2025 Submission

## Project: Wikipedia vs Grokipedia Quality Control System

### 🎯 Project Overview

An AI-powered content comparison and trust annotation system that automatically analyzes 54 topics across Wikipedia and Grokipedia, detects discrepancies using vector embeddings and NLP, generates AI-powered Community Notes, and publishes trust annotations to the OriginTrail Decentralized Knowledge Graph.

### 🏆 Key Achievements

✅ **Full-Stack Implementation** - Complete Python Flask backend + responsive HTML/CSS/JS frontend  
✅ **AI Integration** - Cerebras AI with 8-key load balancing for scalable analysis  
✅ **Vector Database** - Pinecone integration with 384-dimensional embeddings  
✅ **Blockchain Publishing** - OriginTrail DKG integration for decentralized trust  
✅ **54 Topics Analyzed** - Diverse coverage: AI, Blockchain, Climate, Space, History, Physics  
✅ **Real-Time Dashboard** - Live progress tracking and color-coded results  
✅ **Production-Ready** - Comprehensive error handling, logging, and graceful degradation  

### 🛠️ Technical Implementation

#### Backend Architecture
- **Flask** - RESTful API with background job processing
- **Sentence-Transformers** - Local embeddings (all-MiniLM-L6-v2, 384 dims)
- **Pinecone** - Vector storage and similarity search
- **Cerebras Cloud SDK** - AI analysis with automatic key rotation
- **BeautifulSoup4** - Web scraping for Grokipedia
- **Wikipedia API** - Official content fetching
- **scikit-learn** - Cosine similarity and TF-IDF analysis

#### Frontend Design
- **Bootstrap 5** - Responsive, mobile-friendly UI
- **Vanilla JavaScript** - No framework dependencies
- **Real-time Updates** - Polling-based progress tracking
- **Color-Coded Results** - Instant visual feedback (green/yellow/red)

#### Key Algorithms

**1. Vector Similarity**
```python
# Cosine similarity on 384-dimensional embeddings
similarity = cosine_similarity(wiki_vec, grok_vec)
# 0.8-1.0: High trust (green)
# 0.6-0.8: Moderate (yellow)
# 0.0-0.6: Low trust (red)
```

**2. Discrepancy Detection**
- **Length**: >30% difference in content length
- **Keyword**: <50% overlap in top 10 TF-IDF keywords
- **Structural**: Significant formatting differences

**3. API Key Load Balancing**
```python
# Round-robin rotation across 8 Cerebras keys
key = keys[current_index]
current_index = (current_index + 1) % 8
```

### 📊 Results & Metrics

- **54 Topics** - Comprehensive coverage across multiple domains
- **3 Discrepancy Types** - Length, keyword, structural analysis
- **8 API Keys** - Load balanced for rate limit avoidance
- **384 Dimensions** - Efficient vector embeddings
- **Real-time Progress** - 1-second polling updates
- **Graceful Degradation** - Continues on individual failures

### 🎨 User Experience

#### Dashboard Features
- Topics analyzed counter
- Total discrepancies found
- Average similarity score
- Real-time progress bar
- Color-coded results table
- One-click topic viewing

#### Comparison Page Features
- Similarity score visualization
- AI analysis from Cerebras
- Detailed discrepancy list
- Community Note display
- Side-by-side content comparison
- DKG publish button

### 🔐 Security & Reliability

- **Environment Variables** - Secure API key management
- **Error Handling** - Try-catch blocks throughout
- **Fallback Mechanisms** - Automatic analysis if AI fails
- **Logging** - Comprehensive info/error/warning logs
- **Input Validation** - URL encoding and sanitization
- **Rate Limiting** - 8-key rotation prevents throttling

### 🚀 Innovation Highlights

1. **Load Balancing** - Novel 8-key rotation for Cerebras API
2. **Hybrid Analysis** - Combines vector similarity + rule-based detection
3. **Real-time UX** - Background processing with live updates
4. **Graceful Degradation** - Never crashes, always provides results
5. **Schema.org Integration** - FactCheck format for DKG publishing
6. **Thinking Tag Removal** - Clean AI output extraction

### 📈 Scalability

- **Pinecone Free Tier** - Supports 100K vectors (185+ topics)
- **Background Threading** - Non-blocking scan execution
- **In-Memory Storage** - Fast access (Redis-ready for production)
- **Modular Architecture** - Easy to extend with new sources
- **API Key Pool** - 8x rate limit capacity

### 🎓 Educational Value

This project demonstrates:
- Full-stack web development
- AI/ML integration (embeddings, NLP)
- Vector database usage
- Blockchain integration
- Web scraping techniques
- Load balancing strategies
- Error handling patterns
- Real-time UI updates

### 📦 Deliverables

✅ Complete source code  
✅ Comprehensive documentation (README, QUICKSTART)  
✅ Setup scripts (run.sh, run.bat)  
✅ Verification script (verify_setup.py)  
✅ 54 curated topics (data/topics.json)  
✅ 8 Cerebras API keys configured  
✅ Production-ready error handling  
✅ Responsive web interface  

### 🔮 Future Enhancements

- **Redis Integration** - Persistent storage for production
- **User Authentication** - Multi-user support
- **Custom Topics** - User-defined topic analysis
- **Historical Tracking** - Track changes over time
- **Export Features** - CSV/JSON result downloads
- **Advanced NLP** - Named entity recognition, sentiment analysis
- **More Sources** - Add additional encyclopedia platforms
- **API Rate Monitoring** - Real-time key usage dashboard

### 🙏 Acknowledgments

- **OriginTrail** - DKG infrastructure and hackathon organization
- **Cerebras** - AI analysis platform and API access
- **Pinecone** - Vector database free tier
- **Wikipedia** - Baseline content source
- **Open Source Community** - Libraries and tools

### 📞 Contact & Demo

**Live Demo**: Run `./run.sh` or `run.bat` and visit `http://localhost:5000`

**Setup Time**: < 5 minutes with provided scripts

**Dependencies**: Python 3.9+, pip, Pinecone API key

---

**Built for OriginTrail Global Hackathon 2025** 🏆

*Empowering trust through AI-powered content verification and decentralized knowledge graphs*
