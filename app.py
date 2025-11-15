from flask import Flask, render_template, request, jsonify
from backend.embeddings import EmbeddingManager
from backend.scraper import ContentScraper
from backend.comparison import ContentComparator
from backend.cerebras_analyzer import CerebrasAnalyzer
from backend.dkg_publisher import DKGPublisher
import threading
import logging
from datetime import datetime
import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Initialize managers
embedding_manager = EmbeddingManager()
scraper = ContentScraper()
comparator = ContentComparator()
cerebras = CerebrasAnalyzer()
dkg = DKGPublisher()

# Store scan results in memory (use Redis for production)
scan_results = {}
scan_status = {"status": "idle", "progress": 0, "current_topic": ""}


@app.route('/')
def index():
    """Render dashboard/home page"""
    return render_template('index.html')


@app.route('/comparison/<topic_name>')
def comparison(topic_name):
    """Render individual topic comparison page"""
    return render_template('comparison.html', topic=topic_name)


@app.route('/api/topics', methods=['GET'])
def get_topics():
    """Get list of all topics with their status"""
    topics = scraper.get_topics()
    results = []
    
    for topic in topics:
        if topic in scan_results:
            result = scan_results[topic]
            results.append({
                "name": topic,
                "similarity": result.get('similarity_score', 0),
                "discrepancies": len(result.get('discrepancies', [])),
                "status": "completed",
                "ai_analysis_available": 'ai_analysis' in result
            })
        else:
            results.append({
                "name": topic,
                "similarity": 0,
                "discrepancies": 0,
                "status": "pending",
                "ai_analysis_available": False
            })
    
    return jsonify(results)


@app.route('/api/scan', methods=['POST'])
def start_scan():
    """Start background scanning with Cerebras AI analysis"""
    if scan_status["status"] == "processing":
        return jsonify({"error": "Scan already in progress"}), 409
    
    def run_scan():
        scan_status["status"] = "processing"
        topics = scraper.get_topics()
        
        for i, topic in enumerate(topics):
            scan_status["current_topic"] = topic
            scan_status["progress"] = int((i / len(topics)) * 100)
            
            try:
                # Fetch content
                wiki = scraper.fetch_wikipedia(topic)
                grok = scraper.fetch_grokipedia(topic)
                
                if not wiki or not grok:
                    logger.warning(f"⚠ Skipping {topic}: content fetch failed")
                    continue
                
                # Vector comparison
                comparison = comparator.compare_topics(topic, wiki['content'], grok['content'])
                
                # Store content for AI analysis
                comparison['wiki_content'] = wiki['content']
                comparison['grok_content'] = grok['content']
                comparison['topic'] = topic
                
                # AI-powered analysis with Cerebras
                ai_analysis = cerebras.analyze_discrepancies(
                    topic, wiki['content'], grok['content'], comparison['discrepancies']
                )
                comparison['ai_analysis'] = ai_analysis['ai_analysis']
                
                # Generate Community Note
                community_note = cerebras.generate_community_note(
                    topic, comparison['similarity_score'],
                    comparison['discrepancies'], ai_analysis['ai_analysis']
                )
                comparison['community_note'] = community_note
                
                # Publish to DKG
                ual = dkg.publish_community_note(
                    topic, comparison['discrepancies'],
                    comparison['similarity_score'], comparison['ai_analysis']
                )
                comparison['ual'] = ual
                
                scan_results[topic] = comparison
                logger.info(f"✓ Completed: {topic}")
                
            except Exception as e:
                logger.error(f"✗ Error scanning {topic}: {str(e)}")
                continue
        
        scan_status["status"] = "completed"
        scan_status["progress"] = 100
    
    # Run scan in background thread
    thread = threading.Thread(target=run_scan)
    thread.daemon = True
    thread.start()
    
    return jsonify({"status": "scanning", "job_id": "scan_001"})


@app.route('/api/scan-status', methods=['GET'])
def get_scan_status():
    """Get current scan status"""
    return jsonify(scan_status)


@app.route('/api/topic/<topic_name>', methods=['GET'])
def get_topic(topic_name):
    """Get detailed information for a specific topic"""
    if topic_name in scan_results:
        return jsonify(scan_results[topic_name])
    return jsonify({"error": "Topic not found"}), 404


@app.route('/api/publish-dkg', methods=['POST'])
def publish_to_dkg():
    """Manually publish a topic to DKG"""
    data = request.json
    try:
        ual = dkg.publish_community_note(
            data['topic'],
            data['discrepancies'],
            data['similarity_score'],
            data['ai_analysis']
        )
        return jsonify({"success": True, "ual": ual})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    logger.info("🚀 Starting Wikipedia vs Grokipedia Comparison System")
    app.run(debug=config.FLASK_DEBUG, port=config.FLASK_PORT, host='0.0.0.0')
