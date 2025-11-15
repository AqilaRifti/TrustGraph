import logging
import numpy as np
from sentence_transformers import SentenceTransformer
from datetime import datetime
import config

logger = logging.getLogger(__name__)


class EmbeddingManager:
    """Manages vector embeddings using Sentence-Transformers and Pinecone"""
    
    def __init__(self):
        """Initialize Sentence-Transformers model and Pinecone connection"""
        try:
            # Initialize local embedding model
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("✓ Sentence-Transformers model loaded")
            
            # Initialize Pinecone
            if config.PINECONE_API_KEY:
                try:
                    from pinecone import Pinecone, ServerlessSpec
                    
                    self.pc = Pinecone(api_key=config.PINECONE_API_KEY)
                    
                    # Create index if it doesn't exist
                    existing_indexes = [idx.name for idx in self.pc.list_indexes()]
                    
                    if config.PINECONE_INDEX_NAME not in existing_indexes:
                        self.pc.create_index(
                            name=config.PINECONE_INDEX_NAME,
                            dimension=384,  # all-MiniLM-L6-v2 produces 384-dim vectors
                            metric='cosine',
                            spec=ServerlessSpec(
                                cloud='aws',
                                region='us-east-1'
                            )
                        )
                        logger.info(f"✓ Created Pinecone index: {config.PINECONE_INDEX_NAME}")
                    
                    self.index = self.pc.Index(config.PINECONE_INDEX_NAME)
                    logger.info(f"✓ Connected to Pinecone index: {config.PINECONE_INDEX_NAME}")
                except ImportError:
                    logger.warning("⚠ Pinecone library not installed, using in-memory storage only")
                    self.index = None
                except Exception as e:
                    logger.warning(f"⚠ Pinecone connection failed: {str(e)}, using in-memory storage")
                    self.index = None
            else:
                self.index = None
                logger.warning("⚠ Pinecone API key not set, using in-memory storage only")
                
        except Exception as e:
            logger.error(f"✗ Failed to initialize EmbeddingManager: {str(e)}")
            self.index = None
    
    def generate_embedding(self, text):
        """
        Generate vector embedding for text
        
        Args:
            text: Text content to embed
            
        Returns:
            numpy array of 384 dimensions
        """
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding
        except Exception as e:
            logger.error(f"✗ Failed to generate embedding: {str(e)}")
            return None
    
    def store_embedding(self, topic, source, vector, metadata=None):
        """
        Store embedding in Pinecone
        
        Args:
            topic: Topic name
            source: 'wikipedia' or 'grokipedia'
            vector: Embedding vector
            metadata: Additional metadata dict
        """
        if self.index is None:
            logger.warning("⚠ Pinecone not available, skipping storage")
            return
        
        try:
            vector_id = f"{topic}_{source}"
            
            # Prepare metadata
            meta = {
                'topic': topic,
                'source': source,
                'timestamp': datetime.utcnow().isoformat()
            }
            if metadata:
                meta.update(metadata)
            
            # Store in Pinecone
            self.index.upsert(
                vectors=[(vector_id, vector.tolist(), meta)]
            )
            
            logger.info(f"✓ Stored embedding: {vector_id}")
            
        except Exception as e:
            logger.error(f"✗ Failed to store embedding for {topic}_{source}: {str(e)}")
    
    def get_embedding(self, topic, source):
        """
        Retrieve embedding from Pinecone
        
        Args:
            topic: Topic name
            source: 'wikipedia' or 'grokipedia'
            
        Returns:
            numpy array or None if not found
        """
        if self.index is None:
            logger.warning("⚠ Pinecone not available")
            return None
        
        try:
            vector_id = f"{topic}_{source}"
            result = self.index.fetch(ids=[vector_id])
            
            if vector_id in result['vectors']:
                vector = np.array(result['vectors'][vector_id]['values'])
                logger.info(f"✓ Retrieved embedding: {vector_id}")
                return vector
            else:
                logger.warning(f"⚠ Embedding not found: {vector_id}")
                return None
                
        except Exception as e:
            logger.error(f"✗ Failed to retrieve embedding for {topic}_{source}: {str(e)}")
            return None
