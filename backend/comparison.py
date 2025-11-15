import logging
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from backend.embeddings import EmbeddingManager

logger = logging.getLogger(__name__)


class ContentComparator:
    """Compares Wikipedia and Grokipedia content using vector similarity and NLP"""
    
    def __init__(self):
        self.embedding_manager = EmbeddingManager()
    
    def compare_topics(self, topic, wiki_content, grok_content):
        """
        Compare Wikipedia and Grokipedia content
        
        Args:
            topic: Topic name
            wiki_content: Wikipedia article text
            grok_content: Grokipedia article text
            
        Returns:
            dict with similarity_score, discrepancies, and metadata
        """
        try:
            # Generate embeddings
            wiki_embedding = self.embedding_manager.generate_embedding(wiki_content)
            grok_embedding = self.embedding_manager.generate_embedding(grok_content)
            
            if wiki_embedding is None or grok_embedding is None:
                logger.error(f"✗ Failed to generate embeddings for {topic}")
                return {
                    'similarity_score': 0.0,
                    'discrepancies': [],
                    'comparison_metadata': {'error': 'Embedding generation failed'}
                }
            
            # Store embeddings
            self.embedding_manager.store_embedding(
                topic, 'wikipedia', wiki_embedding,
                {'content_length': len(wiki_content)}
            )
            self.embedding_manager.store_embedding(
                topic, 'grokipedia', grok_embedding,
                {'content_length': len(grok_content)}
            )
            
            # Calculate cosine similarity
            similarity_score = self._calculate_cosine_similarity(wiki_embedding, grok_embedding)
            
            # Detect discrepancies
            discrepancies = self._detect_discrepancies(wiki_content, grok_content)
            
            result = {
                'similarity_score': float(similarity_score),
                'discrepancies': discrepancies,
                'comparison_metadata': {
                    'wiki_length': len(wiki_content),
                    'grok_length': len(grok_content),
                    'discrepancy_count': len(discrepancies)
                }
            }
            
            logger.info(f"✓ Compared {topic}: similarity={similarity_score:.2f}, discrepancies={len(discrepancies)}")
            return result
            
        except Exception as e:
            logger.error(f"✗ Comparison failed for {topic}: {str(e)}")
            return {
                'similarity_score': 0.0,
                'discrepancies': [],
                'comparison_metadata': {'error': str(e)}
            }
    
    def _calculate_cosine_similarity(self, vec1, vec2):
        """
        Calculate cosine similarity between two vectors
        
        Args:
            vec1: First embedding vector
            vec2: Second embedding vector
            
        Returns:
            float between 0 and 1
        """
        try:
            # Reshape for sklearn
            vec1 = vec1.reshape(1, -1)
            vec2 = vec2.reshape(1, -1)
            
            similarity = cosine_similarity(vec1, vec2)[0][0]
            return similarity
            
        except Exception as e:
            logger.error(f"✗ Cosine similarity calculation failed: {str(e)}")
            return 0.0
    
    def _detect_discrepancies(self, wiki_text, grok_text):
        """
        Detect discrepancies between Wikipedia and Grokipedia content
        
        Args:
            wiki_text: Wikipedia article text
            grok_text: Grokipedia article text
            
        Returns:
            list of dicts with {type, severity, description}
        """
        discrepancies = []
        
        try:
            # 1. Length Discrepancy
            wiki_len = len(wiki_text)
            grok_len = len(grok_text)
            max_len = max(wiki_len, grok_len)
            
            if max_len > 0:
                length_diff_ratio = abs(wiki_len - grok_len) / max_len
                
                if length_diff_ratio > 0.3:
                    discrepancies.append({
                        'type': 'length',
                        'severity': 'medium',
                        'description': f'Significant length difference: Wikipedia has {wiki_len} chars, Grokipedia has {grok_len} chars ({length_diff_ratio*100:.1f}% difference)'
                    })
            
            # 2. Keyword Mismatch using TF-IDF
            try:
                vectorizer = TfidfVectorizer(max_features=10, stop_words='english')
                
                # Need at least 2 documents for TF-IDF
                if wiki_text and grok_text:
                    tfidf_matrix = vectorizer.fit_transform([wiki_text, grok_text])
                    
                    # Get feature names (keywords)
                    feature_names = vectorizer.get_feature_names_out()
                    
                    # Get top keywords for each document
                    wiki_scores = tfidf_matrix[0].toarray()[0]
                    grok_scores = tfidf_matrix[1].toarray()[0]
                    
                    wiki_keywords = set([feature_names[i] for i in wiki_scores.argsort()[-10:][::-1] if wiki_scores[i] > 0])
                    grok_keywords = set([feature_names[i] for i in grok_scores.argsort()[-10:][::-1] if grok_scores[i] > 0])
                    
                    # Calculate overlap
                    if wiki_keywords and grok_keywords:
                        overlap = len(wiki_keywords.intersection(grok_keywords))
                        total = len(wiki_keywords.union(grok_keywords))
                        overlap_ratio = overlap / total if total > 0 else 0
                        
                        if overlap_ratio < 0.5:
                            discrepancies.append({
                                'type': 'keyword',
                                'severity': 'high',
                                'description': f'Low keyword overlap: only {overlap_ratio*100:.1f}% of key terms match between sources'
                            })
            except Exception as e:
                logger.warning(f"⚠ Keyword analysis failed: {str(e)}")
            
            # 3. Structural Differences
            wiki_lines = wiki_text.count('\n')
            grok_lines = grok_text.count('\n')
            
            if abs(wiki_lines - grok_lines) > max(wiki_lines, grok_lines) * 0.5:
                discrepancies.append({
                    'type': 'structural',
                    'severity': 'low',
                    'description': f'Different content structure: Wikipedia has {wiki_lines} line breaks, Grokipedia has {grok_lines}'
                })
            
        except Exception as e:
            logger.error(f"✗ Discrepancy detection failed: {str(e)}")
        
        return discrepancies
