import json
import logging
import wikipedia
import requests
from bs4 import BeautifulSoup
from datetime import datetime

logger = logging.getLogger(__name__)


class ContentScraper:
    """Fetches content from Wikipedia and Grokipedia"""
    
    def __init__(self):
        self.timeout = 10
        wikipedia.set_lang("en")
    
    def get_topics(self):
        """Load topics from data/topics.json"""
        try:
            with open('data/topics.json', 'r') as f:
                topics = json.load(f)
            logger.info(f"✓ Loaded {len(topics)} topics")
            return topics
        except Exception as e:
            logger.error(f"✗ Failed to load topics: {str(e)}")
            return []
    
    def fetch_wikipedia(self, topic):
        """
        Fetch article from Wikipedia API
        
        Args:
            topic: Topic name to search
            
        Returns:
            dict with {title, content, url, timestamp} or None if failed
        """
        try:
            # First, try exact match without auto-suggest
            try:
                page = wikipedia.page(topic, auto_suggest=False)
                
                result = {
                    'title': page.title,
                    'content': page.content,
                    'url': page.url,
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                logger.info(f"✓ Fetched Wikipedia: {topic}")
                return result
                
            except wikipedia.exceptions.PageError:
                # If exact match fails, try with auto-suggest
                logger.info(f"⚠ Exact match failed for {topic}, trying search...")
                search_results = wikipedia.search(topic, results=3)
                
                if not search_results:
                    logger.error(f"✗ Wikipedia page not found: {topic}")
                    return None
                
                # Try the first search result
                page = wikipedia.page(search_results[0], auto_suggest=False)
                
                result = {
                    'title': page.title,
                    'content': page.content,
                    'url': page.url,
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                logger.info(f"✓ Fetched Wikipedia (searched): {topic} -> {page.title}")
                return result
            
        except wikipedia.exceptions.DisambiguationError as e:
            # Try first option from disambiguation
            try:
                logger.info(f"⚠ Disambiguation for {topic}, trying: {e.options[0]}")
                page = wikipedia.page(e.options[0], auto_suggest=False)
                result = {
                    'title': page.title,
                    'content': page.content,
                    'url': page.url,
                    'timestamp': datetime.utcnow().isoformat()
                }
                logger.info(f"✓ Fetched Wikipedia (disambiguated): {topic} -> {page.title}")
                return result
            except Exception as inner_e:
                logger.error(f"✗ Wikipedia disambiguation failed for {topic}: {str(inner_e)}")
                return None
                
        except wikipedia.exceptions.PageError:
            logger.error(f"✗ Wikipedia page not found: {topic}")
            return None
            
        except Exception as e:
            logger.error(f"✗ Wikipedia fetch failed for {topic}: {str(e)}")
            return None
    
    def fetch_grokipedia(self, topic):
        """
        Scrape article from Grokipedia (https://grokipedia.com)
        
        URL format: https://grokipedia.com/page/Topic_name
        - First letter capitalized
        - Spaces replaced with underscores
        
        Args:
            topic: Topic name to search
            
        Returns:
            dict with {title, content, url, timestamp} or None if failed
        """
        try:
            # Format topic for Grokipedia URL
            # Rules:
            # - If entire word is uppercase (acronym like NLP, AI), keep it uppercase
            # - Otherwise: capitalize first letter, rest lowercase
            # - Spaces become underscores
            # Examples: "NLP" -> "NLP", "Machine Learning" -> "Machine_learning"
            
            words = topic.split(' ')
            formatted_words = []
            
            for word in words:
                # Check if entire word is uppercase (acronym)
                if word.isupper() and len(word) > 1:
                    # Keep acronyms uppercase
                    formatted_words.append(word)
                elif word:
                    # Regular word: capitalize first letter, rest lowercase
                    formatted_words.append(word[0].upper() + word[1:].lower())
            
            formatted_topic = '_'.join(formatted_words)
            
            url = f"https://grokipedia.com/page/{formatted_topic}"
            
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title - try multiple selectors
            title_elem = (soup.find('h1', class_='page-title') or 
                         soup.find('h1', class_='title') or 
                         soup.find('h1') or
                         soup.find('title'))
            title = title_elem.get_text(strip=True) if title_elem else topic
            
            # Extract content - try multiple selectors for article content
            content_elem = (soup.find('div', class_='content') or 
                           soup.find('article') or
                           soup.find('div', class_='article-content') or
                           soup.find('div', class_='page-content') or
                           soup.find('main'))
            
            if content_elem:
                # Remove script, style, and navigation elements
                for element in content_elem(['script', 'style', 'nav', 'header', 'footer']):
                    element.decompose()
                
                # Get text content
                content = content_elem.get_text(separator='\n', strip=True)
            else:
                # Fallback: get all text from body
                body = soup.find('body')
                if body:
                    for element in body(['script', 'style', 'nav', 'header', 'footer']):
                        element.decompose()
                    content = body.get_text(separator='\n', strip=True)
                else:
                    content = ""
            
            # Clean up excessive whitespace
            import re
            content = re.sub(r'\n\s*\n', '\n\n', content)
            content = content.strip()
            
            result = {
                'title': title,
                'content': content,
                'url': url,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            logger.info(f"✓ Fetched Grokipedia: {topic} ({len(content)} chars)")
            return result
            
        except requests.exceptions.Timeout:
            logger.error(f"✗ Grokipedia timeout for {topic}")
            return None
            
        except requests.exceptions.HTTPError as e:
            logger.error(f"✗ Grokipedia HTTP error for {topic}: {e.response.status_code}")
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ Grokipedia request failed for {topic}: {str(e)}")
            return None
            
        except Exception as e:
            logger.error(f"✗ Grokipedia scraping failed for {topic}: {str(e)}")
            return None
