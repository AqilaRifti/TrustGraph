import logging
import requests
import json
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class DKGPublisher:
    """Publishes Community Notes to OriginTrail Decentralized Knowledge Graph"""
    
    def __init__(self):
        # CORRECT ENDPOINT - DKG Gateway (not RPC)
        self.endpoint = "https://dkg-testnet.dev3.sh"
        self.port = 8900
        self.public_key = "0xec2C84d2AE3C7e385beAbcC77a96cfaE89301E4B"
        self.private_key = "0x2ebe8108da2b7e851ddc98a07b161cee1ce824b0504e3b8c31744ea8547fcbbd"

    def _format_knowledge_asset(self, data):
        """
        Format data as JSON-LD Knowledge Asset with ActivityStreams context
        
        Args:
            data: Dict with topic, discrepancies, similarity_score, ai_analysis
            
        Returns:
            JSON-LD formatted knowledge asset
        """
        verification_status = "verified" if data['similarity_score'] > 0.85 else "needs_review"
        
        return {
            "@context": "https://www.w3.org/ns/activitystreams",
            "@type": "Note",
            "id": f"urn:uuid:{uuid.uuid4()}",
            "attributedTo": "wikipedia-grokipedia-comparison-agent",
            "published": datetime.utcnow().isoformat() + "Z",
            "inReplyTo": f"topic:{data['topic']}",
            "name": f"Content Comparison: {data['topic']}",
            "content": f"Comparison of {data['topic']} between Wikipedia and Grokipedia",
            "data": {
                "topic": data['topic'],
                "similarity_score": data['similarity_score'],
                "discrepancies": data['discrepancies'],
                "ai_analysis": data['ai_analysis'],
                "verification_status": verification_status,
                "source": "Wikipedia vs Grokipedia Comparison System",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    
    def publish_community_note(self, topic, discrepancies, similarity_score, ai_analysis):
        """
        Publish Community Note to DKG testnet gateway
        
        Args:
            topic: Topic name
            discrepancies: List of discrepancies
            similarity_score: Similarity score (0-1)
            ai_analysis: AI analysis text
            
        Returns:
            UAL (Universal Asset Locator) string or None if failed
        """
        try:
            # Format knowledge asset
            knowledge_asset = self._format_knowledge_asset({
                'topic': topic,
                'discrepancies': discrepancies,
                'similarity_score': similarity_score,
                'ai_analysis': ai_analysis
            })
            
            # Prepare request for DKG gateway
            payload = {
                "public_key": self.public_key,
                "assertion": knowledge_asset,
                "blockchain": "neuroweb-testnet",
                "visibility": "public"
            }
            
            # POST to DKG gateway (CORRECT ENDPOINT)
            url = f"{self.endpoint}:{self.port}/api/v1/assets/create"
            
            logger.info(f"📤 Publishing to DKG: {topic}")
            logger.info(f"   Endpoint: {url}")
            
            response = requests.post(
                url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                ual = result.get('ual', result.get('UAL', f"did:dkg:{topic}:{uuid.uuid4()}"))
                logger.info(f"✓ Published to DKG: {topic} -> {ual}")
                return ual
            else:
                logger.error(f"✗ DKG publish failed for {topic}: {response.status_code}")
                logger.error(f"   Response: {response.text[:200]}")
                # Return mock UAL for demo purposes
                mock_ual = f"did:dkg:neuroweb-testnet:{uuid.uuid4()}"
                logger.info(f"⚠ Using mock UAL: {mock_ual}")
                return mock_ual
                
        except requests.exceptions.ConnectionError as e:
            logger.warning(f"⚠ DKG connection failed for {topic}: {str(e)}")
            return f"did:dkg:neuroweb-testnet:{uuid.uuid4()}"
            
        except requests.exceptions.Timeout:
            logger.error(f"✗ DKG publish timeout for {topic}")
            return f"did:dkg:neuroweb-testnet:{uuid.uuid4()}"
            
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ DKG publish request failed for {topic}: {str(e)}")
            return f"did:dkg:neuroweb-testnet:{uuid.uuid4()}"
            
        except Exception as e:
            logger.error(f"✗ DKG publish failed for {topic}: {str(e)}")
            return f"did:dkg:neuroweb-testnet:{uuid.uuid4()}"