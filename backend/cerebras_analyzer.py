from cerebras.cloud.sdk import Cerebras
from data.api_keys import key_rotator
import config
import re
import logging

logger = logging.getLogger(__name__)


class CerebrasAnalyzer:
    """AI-powered analysis using Cerebras with load-balanced API keys"""
    
    def __init__(self):
        self.model = config.CEREBRAS_MODEL
        self.max_tokens = config.CEREBRAS_MAX_TOKENS
        self.temperature = config.CEREBRAS_TEMPERATURE
        self.top_p = config.CEREBRAS_TOP_P
    
    def _get_client(self):
        """Get Cerebras client with load-balanced API key"""
        api_key = key_rotator.get_next_key()
        return Cerebras(api_key=api_key)
    
    def _extract_thinking(self, content):
        """Remove <think> tags from response, keep only final answer"""
        # Remove everything between <think> and </think>
        cleaned = re.sub(r'<think>[\s\S]*?</think>', '', content)
        return cleaned.strip()

    def analyze_discrepancies(self, topic, wiki_content, grok_content, discrepancies):
        """
        Use Cerebras to generate detailed analysis of discrepancies
        
        Args:
            topic: Topic name
            wiki_content: Wikipedia article text
            grok_content: Grokipedia article text
            discrepancies: List of detected discrepancies from comparison.py
            
        Returns:
            dict with AI analysis, explanations, severity assessment
        """
        try:
            client = self._get_client()
            
            # Truncate long texts for efficiency
            wiki_snippet = wiki_content[:1500] if len(wiki_content) > 1500 else wiki_content
            grok_snippet = grok_content[:1500] if len(grok_content) > 1500 else grok_content
            
            prompt = f"""You are a fact-checking expert analyzing content for accuracy and bias.

Topic: {topic}

Wikipedia excerpt: {wiki_snippet}

Grokipedia excerpt: {grok_snippet}

Detected discrepancies: {str(discrepancies)}

Provide:
1. Summary of key differences (2-3 sentences)
2. Assessment of AI hallucination risk (high/medium/low)
3. Potential bias indicators
4. Recommendation (trusted/needs_review/unreliable)
5. Confidence score (0-100)

Be concise and factual."""

            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert fact-checker specializing in comparing AI-generated vs human-curated content. Provide clear, evidence-based assessments."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                stream=False,
                max_completion_tokens=self.max_tokens,
                temperature=self.temperature,
                top_p=self.top_p
            )
            
            # Extract content and remove thinking tags
            ai_response = response.choices[0].message.content
            clean_response = self._extract_thinking(ai_response)
            
            logger.info(f"✓ Cerebras analysis completed for {topic} (API key #{key_rotator.current_index})")
            
            return {
                "success": True,
                "ai_analysis": clean_response,
                "model": self.model,
                "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else 0
            }
            
        except Exception as e:
            logger.error(f"✗ Cerebras analysis failed for {topic}: {str(e)}")
            # Fallback: return structured analysis without AI
            return {
                "success": False,
                "ai_analysis": f"AI analysis unavailable. {len(discrepancies)} discrepancies detected automatically.",
                "error": str(e)
            }

    def generate_community_note(self, topic, similarity_score, discrepancies, ai_analysis):
        """
        Use Cerebras to write a well-formatted Community Note
        
        Args:
            topic: Topic name
            similarity_score: Vector similarity score (0-1)
            discrepancies: List of discrepancies
            ai_analysis: AI analysis from analyze_discrepancies()
            
        Returns:
            Formatted Community Note text
        """
        try:
            client = self._get_client()
            
            prompt = f"""Write a concise, neutral Community Note (max 300 words) for fact-checkers.

Topic: {topic}
Similarity to Wikipedia: {similarity_score*100:.1f}%
Discrepancies Found: {len(discrepancies)}

AI Analysis: {ai_analysis}

Format as:
- Context: Why this matters
- Key findings: What we found
- Sources: Wikipedia as baseline
- Status: Recommended action

Keep tone neutral and evidence-based."""

            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You write clear, neutral fact-checking notes for community review. Be concise and factual."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                stream=False,
                max_completion_tokens=1024,
                temperature=self.temperature,
                top_p=self.top_p
            )
            
            note_content = response.choices[0].message.content
            clean_note = self._extract_thinking(note_content)
            
            logger.info(f"✓ Community Note generated for {topic}")
            return clean_note
            
        except Exception as e:
            logger.error(f"✗ Community Note generation failed: {str(e)}")
            return f"Comparison complete for {topic}. Similarity: {similarity_score*100:.1f}%. Discrepancies: {len(discrepancies)}."

    def batch_analyze(self, results):
        """
        Analyze multiple topics with API key rotation
        
        Args:
            results: List of comparison results from comparison.py
            
        Returns:
            Enhanced results with AI analysis
        """
        enhanced = []
        for i, result in enumerate(results):
            logger.info(f"Analyzing {i+1}/{len(results)}: {result['topic']} (using API key #{key_rotator.current_index})")
            
            analysis = self.analyze_discrepancies(
                topic=result['topic'],
                wiki_content=result.get('wiki_content', ''),
                grok_content=result.get('grok_content', ''),
                discrepancies=result['discrepancies']
            )
            
            community_note = self.generate_community_note(
                topic=result['topic'],
                similarity_score=result['similarity_score'],
                discrepancies=result['discrepancies'],
                ai_analysis=analysis['ai_analysis']
            )
            
            result['ai_analysis'] = analysis['ai_analysis']
            result['community_note'] = community_note
            result['analysis_success'] = analysis['success']
            
            enhanced.append(result)
        
        return enhanced
