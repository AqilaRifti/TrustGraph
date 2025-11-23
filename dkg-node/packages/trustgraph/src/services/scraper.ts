/**
 * Content Scraper for fetching articles from Wikipedia and Grokipedia
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import type { ArticleContent } from '../types';

export class ContentScraper {
    private timeout: number = 10000; // 10 seconds

    /**
     * Fetch article from Wikipedia API
     */
    async fetchWikipedia(topic: string): Promise<ArticleContent | null> {
        try {
            // Use Wikipedia REST API
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&origin=*`;

            const searchResponse = await axios.get(searchUrl, { timeout: this.timeout });
            const searchResults = searchResponse.data.query.search;

            if (!searchResults || searchResults.length === 0) {
                console.error(`✗ Wikipedia page not found: ${topic}`);
                return null;
            }

            // Get the first result's page ID
            const pageId = searchResults[0].pageid;
            const pageTitle = searchResults[0].title;

            // Fetch full page content
            const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts&explaintext=true&format=json&origin=*`;

            const contentResponse = await axios.get(contentUrl, { timeout: this.timeout });
            const pages = contentResponse.data.query.pages;
            const page = pages[pageId];

            if (!page || !page.extract) {
                console.error(`✗ Wikipedia content not found: ${topic}`);
                return null;
            }

            const result: ArticleContent = {
                title: pageTitle,
                content: page.extract,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`,
                timestamp: new Date().toISOString(),
            };

            console.log(`✓ Fetched Wikipedia: ${topic}`);
            return result;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    console.error(`✗ Wikipedia timeout for ${topic}`);
                } else {
                    console.error(`✗ Wikipedia fetch failed for ${topic}: ${error.message}`);
                }
            } else {
                console.error(`✗ Wikipedia fetch failed for ${topic}: ${error}`);
            }
            return null;
        }
    }

    /**
     * Scrape article from Grokipedia
     * URL format: https://grokipedia.com/page/Topic_name
     */
    async fetchGrokipedia(topic: string): Promise<ArticleContent | null> {
        try {
            // Format topic for Grokipedia URL
            const words = topic.split(' ');
            const formattedWords = words.map(word => {
                // Keep acronyms uppercase (e.g., "NLP", "AI")
                if (word === word.toUpperCase() && word.length > 1) {
                    return word;
                }
                // Regular words: capitalize first letter, rest lowercase
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            });

            const formattedTopic = formattedWords.join('_');
            const url = `https://grokipedia.com/page/${formattedTopic}`;

            const response = await axios.get(url, {
                timeout: this.timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Extract title - try multiple selectors
            const titleElem = $('h1.page-title, h1.title, h1, title').first();
            const title = titleElem.text().trim() || topic;

            // Extract content - try multiple selectors
            const contentElem = $('.content, article, .article-content, .page-content, main').first();

            let content = '';
            if (contentElem.length > 0) {
                // Remove script, style, and navigation elements
                contentElem.find('script, style, nav, header, footer').remove();
                content = contentElem.text();
            } else {
                // Fallback: get all text from body
                $('script, style, nav, header, footer').remove();
                content = $('body').text();
            }

            // Clean up excessive whitespace
            content = content
                .replace(/\n\s*\n/g, '\n\n')
                .trim();

            const result: ArticleContent = {
                title,
                content,
                url,
                timestamp: new Date().toISOString(),
            };

            console.log(`✓ Fetched Grokipedia: ${topic} (${content.length} chars)`);
            return result;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    console.error(`✗ Grokipedia timeout for ${topic}`);
                } else if (error.response) {
                    console.error(`✗ Grokipedia HTTP error for ${topic}: ${error.response.status}`);
                } else {
                    console.error(`✗ Grokipedia request failed for ${topic}: ${error.message}`);
                }
            } else {
                console.error(`✗ Grokipedia scraping failed for ${topic}: ${error}`);
            }
            return null;
        }
    }
}
