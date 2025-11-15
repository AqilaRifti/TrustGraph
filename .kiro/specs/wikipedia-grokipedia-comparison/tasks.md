# Implementation Plan

- [x] 1. Set up project structure and configuration
  - Create directory structure: backend/, static/css/, static/js/, templates/, data/
  - Create requirements.txt with all dependencies
  - Create config.py with environment variable loading for Pinecone, DKG, and Cerebras settings
  - Create .env.example file with placeholder values
  - Create data/api_keys.py with APIKeyRotator class implementing round-robin load balancing
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2. Implement content scraping module
  - [x] 2.1 Create backend/scraper.py with ContentScraper class
    - Implement get_topics() method to load topics from data/topics.json
    - Implement fetch_wikipedia() method using wikipedia library with error handling
    - Implement fetch_grokipedia() method using BeautifulSoup4 for web scraping
    - Add timeout handling (10 seconds) and return None for failed fetches
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 2.2 Create data/topics.json with 50+ topics
    - Include diverse topics: AI, Climate Change, Quantum Computing, Blockchain, etc.
    - Format as JSON array of strings
    - _Requirements: 1.1_

- [x] 3. Implement vector embedding and storage
  - [x] 3.1 Create backend/embeddings.py with EmbeddingManager class
    - Initialize Sentence-Transformers model 'all-MiniLM-L6-v2' in constructor
    - Connect to Pinecone index in constructor with error handling
    - Implement generate_embedding() method returning 384-dimensional vectors
    - Implement store_embedding() method with ID format "{topic}_{source}"
    - Implement get_embedding() method for retrieval from Pinecone
    - Add metadata storage: source, topic, timestamp, content_length
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Implement content comparison logic
  - [x] 4.1 Create backend/comparison.py with ContentComparator class
    - Implement compare_topics() method as main entry point
    - Implement _calculate_cosine_similarity() using sklearn.metrics.pairwise
    - Implement _detect_discrepancies() with three detection types:
      - Length discrepancy (>30% difference)
      - Keyword mismatch using TF-IDF (<50% overlap)
      - Structural differences (section/list counts)
    - Return structured dict with similarity_score, discrepancies list, and metadata
    - Classify each discrepancy with type, severity (low/medium/high), and description
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Implement Cerebras AI analyzer with load balancing
  - [x] 5.1 Create backend/cerebras_analyzer.py with CerebrasAnalyzer class
    - Initialize with model, max_tokens, temperature, and top_p from config
    - Implement _get_client() method using key_rotator.get_next_key()
    - Implement _extract_thinking() method with regex to remove <think> tags
    - _Requirements: 4.1, 4.2, 4.6, 9.1, 9.2, 9.3_
  
  - [x] 5.2 Implement AI analysis methods
    - Implement analyze_discrepancies() method with prompt engineering
    - Truncate content to 1500 chars for efficiency
    - Parse AI response for: summary, hallucination risk, bias indicators, recommendation, confidence score
    - Implement fallback behavior returning automatic analysis if API fails
    - Log API key index used for each request
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 9.4_
  
  - [x] 5.3 Implement Community Note generation
    - Implement generate_community_note() method with 300-word limit
    - Use prompt with format: Context, Key findings, Sources, Status
    - Maintain neutral, evidence-based tone
    - Include similarity score and discrepancy count in prompt
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 5.4 Implement batch analysis with API key rotation
    - Implement batch_analyze() method processing list of results
    - Log current API key index for each topic
    - Enhance results with ai_analysis and community_note fields
    - _Requirements: 4.2, 9.4_

- [x] 6. Implement DKG publishing
  - [x] 6.1 Create backend/dkg_publisher.py with DKGPublisher class
    - Initialize with DKG endpoint and API key from config
    - Implement _format_knowledge_asset() using Schema.org FactCheck format
    - Implement publish_community_note() method with POST request to DKG
    - Return UAL (Universal Asset Locator) from response
    - Add error handling with graceful failure messages
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Implement Flask application and API routes
  - [x] 7.1 Create app.py with Flask initialization
    - Initialize Flask app with template and static folders
    - Initialize all manager instances: embedding_manager, scraper, comparator, cerebras, dkg
    - Create in-memory storage: scan_results dict and scan_status dict
    - Configure logging with info and error levels
    - _Requirements: 7.1, 10.1, 10.2_
  
  - [x] 7.2 Implement view routes
    - Implement GET / route rendering index.html
    - Implement GET /comparison/<topic_name> route rendering comparison.html
    - _Requirements: 7.1, 8.1_
  
  - [x] 7.3 Implement API routes for topic management
    - Implement GET /api/topics route returning list with status, similarity, discrepancies
    - Implement GET /api/topic/<topic_name> route returning full topic details
    - Return 404 with error message if topic not found
    - _Requirements: 7.2, 8.1, 10.5_
  
  - [x] 7.4 Implement background scanning functionality
    - Implement POST /api/scan route starting background thread
    - Return 409 Conflict if scan already in progress
    - Implement run_scan() function with progress tracking
    - Update scan_status with current_topic and progress percentage
    - Integrate all modules: scraper, comparator, cerebras, dkg
    - Store complete results in scan_results dict
    - Handle errors gracefully, log failures, and continue with remaining topics
    - _Requirements: 1.3, 1.4, 7.3, 7.4, 10.2, 10.3, 10.4_
  
  - [x] 7.5 Implement scan status and DKG publishing routes
    - Implement GET /api/scan-status route returning current scan_status
    - Implement POST /api/publish-dkg route for manual DKG publishing
    - Return success/failure with UAL or error message
    - _Requirements: 7.4, 6.1, 6.2, 10.5_

- [x] 8. Implement frontend templates
  - [x] 8.1 Create templates/base.html
    - Include Bootstrap 5 CDN links
    - Create navigation bar with project title
    - Define content block for child templates
    - Add common JavaScript utilities
    - _Requirements: 7.1_
  
  - [x] 8.2 Create templates/index.html (Dashboard)
    - Extend base.html template
    - Create stats cards: topics analyzed, discrepancies found, average similarity
    - Add scan button with onclick handler
    - Create progress bar container (hidden by default)
    - Create results table with columns: Topic, Similarity, Discrepancies, Status, Action
    - Implement startScan() JavaScript function calling POST /api/scan
    - Implement checkProgress() function polling /api/scan-status every 1 second
    - Implement loadResults() function fetching /api/topics and populating table
    - Add color coding: green (≥80%), yellow (60-80%), red (<60%)
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  
  - [x] 8.3 Create templates/comparison.html (Detailed View)
    - Extend base.html template
    - Create similarity score progress bar with color coding
    - Create AI analysis card displaying Cerebras output
    - Create discrepancies list with type and severity badges
    - Create Community Note card with publish button
    - Create side-by-side content comparison (Wikipedia vs Grokipedia)
    - Implement JavaScript to fetch /api/topic/<topic> on page load
    - Parse URL parameter for topic name
    - Populate all sections with fetched data
    - Implement publishToDKG() function calling POST /api/publish-dkg
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 9. Implement frontend styling and interactions
  - [x] 9.1 Create static/css/style.css
    - Add custom styles for cards, progress bars, and badges
    - Style similarity score colors: green, yellow, red
    - Add responsive layout adjustments
    - Style discrepancy severity badges
    - _Requirements: 7.1, 8.2_
  
  - [x] 9.2 Create static/js/script.js
    - Implement utility functions for API calls
    - Add error handling for failed requests
    - Implement toast notifications for user feedback
    - Add loading spinners for async operations
    - _Requirements: 7.1_

- [x] 10. Add error handling and logging
  - [x] 10.1 Enhance all backend modules with comprehensive logging
    - Add success logs with ✓ prefix for completed operations
    - Add error logs with ✗ prefix for failures
    - Add warning logs with ⚠ prefix for fallback usage
    - Include topic names and error descriptions in all logs
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 10.2 Implement graceful error handling across all components
    - Add try-catch blocks in scraper with None returns
    - Add fallback analysis in Cerebras analyzer
    - Add error responses with appropriate HTTP status codes in Flask routes
    - Ensure scan continues even if individual topics fail
    - _Requirements: 10.3, 10.4, 10.5_

- [x] 11. Create documentation and setup files
  - [x] 11.1 Create README.md
    - Document project overview and features
    - Add installation instructions
    - Document environment variable setup
    - Add usage instructions with screenshots
    - Include API endpoint documentation
    - _Requirements: All_
  
  - [x] 11.2 Create .gitignore
    - Ignore .env file
    - Ignore __pycache__ and .pyc files
    - Ignore virtual environment folders
    - Ignore IDE-specific files
    - _Requirements: All_

- [x] 12. Integration and end-to-end testing
  - [x] 12.1 Test complete scan workflow
    - Start Flask application
    - Initiate scan from dashboard
    - Verify progress updates
    - Check results table population
    - Verify all 50+ topics processed
    - _Requirements: All_
  
  - [x] 12.2 Test individual topic comparison
    - Navigate to comparison page for multiple topics
    - Verify similarity score display
    - Verify AI analysis rendering
    - Verify discrepancies list
    - Verify Community Note display
    - Test DKG publish button
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 12.3 Test error scenarios
    - Test with invalid topic names
    - Test with network failures
    - Test with API rate limits
    - Verify graceful degradation
    - Verify error messages displayed to user
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
