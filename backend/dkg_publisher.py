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
    """
    Publishes Community Notes to OriginTrail Decentralized Knowledge Graph
    
    IMPORTANT: This uses the official DKG Edge Node service (dkg-service.js)
    which implements the official OriginTrail DKG SDK (dkg.js).
    
    This is the ONLY approved method for hackathon eligibility.
    """
    
    def __init__(self):
        # Connect to local DKG Edge Node service
        self.dkg_service_url = os.getenv('DKG_SERVICE_URL', 'http://localhost:3000')
        logger.info(f"🔗 Connecting to DKG Edge Node: {self.dkg_service_url}")

    def check_health(self):
        """
        Check if DKG Edge Node service is running
        
        Returns:
            bool: True if service is healthy
        """
        try:
            response = requests.get(f"{self.dkg_service_url}/health", timeout=5)
            if response.status_code == 200:
                logger.info("✅ DKG Edge Node service is healthy")
                return True
            return False
        except Exception as e:
            logger.warning(f"⚠️ DKG Edge Node service not available: {str(e)}")
            return False
    
    def publish_community_note(self, topic, discrepancies, similarity_score, ai_analysis):
        """
        Publish Community Note to DKG using official DKG Edge Node
        
        This method communicates with the DKG Edge Node service (dkg-service.js)
        which uses the official OriginTrail DKG SDK (dkg.js).
        
        Args:
            topic: Topic name
            discrepancies: List of discrepancies
            similarity_score: Similarity score (0-1)
            ai_analysis: AI analysis text
            
        Returns:
            UAL (Universal Asset Locator) string
        """
        try:
            # Prepare payload for DKG Edge Node service
            payload = {
                "topic": topic,
                "discrepancies": discrepancies,
                "similarity_score": similarity_score,
                "ai_analysis": ai_analysis
            }
            
            logger.info(f"📤 Publishing to DKG via Edge Node: {topic}")
            
            # POST to DKG Edge Node service
            response = requests.post(
                f"{self.dkg_service_url}/publish",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=60  # DKG operations can take time
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    ual = result.get('ual')
                    logger.info(f"✅ Published to DKG: {topic}")
                    logger.info(f"   UAL: {ual}")
                    if result.get('transaction_hash'):
                        logger.info(f"   TX: {result.get('transaction_hash')}")
                    return ual
                else:
                    logger.error(f"❌ DKG publish failed: {result.get('error')}")
                    return None
            else:
                logger.error(f"❌ DKG service error: {response.status_code}")
                logger.error(f"   Response: {response.text[:200]}")
                return None
                
        except requests.exceptions.ConnectionError as e:
            logger.error(f"❌ Cannot connect to DKG Edge Node service")
            logger.error(f"   Make sure 'npm start' is running on port 3000")
            logger.error(f"   Error: {str(e)}")
            return None
            
        except requests.exceptions.Timeout:
            logger.error(f"❌ DKG publish timeout for {topic}")
            logger.error(f"   DKG operations can take 30-60 seconds")
            return None
            
        except Exception as e:
            logger.error(f"❌ DKG publish failed for {topic}: {str(e)}")
            return None
    
    def get_asset(self, ual):
        """
        Retrieve a Knowledge Asset from DKG by UAL
        
        Args:
            ual: Universal Asset Locator
            
        Returns:
            dict: Asset data or None if failed
        """
        try:
            response = requests.get(
                f"{self.dkg_service_url}/asset/{ual}",
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    return result.get('asset')
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve asset {ual}: {str(e)}")
            return None