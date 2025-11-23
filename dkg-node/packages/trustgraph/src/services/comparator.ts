/**
 * Content Comparator for analyzing differences between Wikipedia and Grokipedia
 */

import type { ComparisonResult, Discrepancy } from '../types';

export class ContentComparator {
    /**
     * Compare Wikipedia and Grokipedia content
     */
    async compareTopics(
        topic: string,
        wikiContent: string,
        grokContent: string
    ): Promise<ComparisonResult> {
        try {
            // Calculate cosine similarity (simplified version using word overlap)
            const similarityScore = this.calculateSimilarity(wikiContent, grokContent);

            // Detect discrepancies
            const discrepancies = this.detectDiscrepancies(wikiContent, grokContent);

            const result: ComparisonResult = {
                topic,
                similarity_score: similarityScore,
                discrepancies,
                comparison_metadata: {
                    wiki_length: wikiContent.length,
                    grok_length: grokContent.length,
                    discrepancy_count: discrepancies.length,
                },
            };

            console.log(
                `✓ Compared ${topic}: similarity=${similarityScore.toFixed(2)}, discrepancies=${discrepancies.length}`
            );
            return result;
        } catch (error) {
            console.error(`✗ Comparison failed for ${topic}: ${error}`);
            return {
                topic,
                similarity_score: 0.0,
                discrepancies: [],
                comparison_metadata: {
                    wiki_length: wikiContent.length,
                    grok_length: grokContent.length,
                    discrepancy_count: 0,
                    error: String(error),
                },
            };
        }
    }

    /**
     * Calculate similarity between two texts using Jaccard similarity
     * (simplified alternative to cosine similarity with embeddings)
     */
    private calculateSimilarity(text1: string, text2: string): number {
        try {
            // Tokenize and normalize
            const words1 = new Set(
                text1
                    .toLowerCase()
                    .split(/\W+/)
                    .filter(w => w.length > 3)
            );
            const words2 = new Set(
                text2
                    .toLowerCase()
                    .split(/\W+/)
                    .filter(w => w.length > 3)
            );

            // Calculate Jaccard similarity
            const intersection = new Set([...words1].filter(x => words2.has(x)));
            const union = new Set([...words1, ...words2]);

            if (union.size === 0) return 0;

            return intersection.size / union.size;
        } catch (error) {
            console.error(`✗ Similarity calculation failed: ${error}`);
            return 0.0;
        }
    }

    /**
     * Detect discrepancies between two texts
     */
    private detectDiscrepancies(wikiText: string, grokText: string): Discrepancy[] {
        const discrepancies: Discrepancy[] = [];

        try {
            // 1. Length Discrepancy
            const wikiLen = wikiText.length;
            const grokLen = grokText.length;
            const maxLen = Math.max(wikiLen, grokLen);

            if (maxLen > 0) {
                const lengthDiffRatio = Math.abs(wikiLen - grokLen) / maxLen;

                if (lengthDiffRatio > 0.3) {
                    discrepancies.push({
                        type: 'length',
                        severity: 'medium',
                        description: `Significant length difference: Wikipedia has ${wikiLen} chars, Grokipedia has ${grokLen} chars (${(lengthDiffRatio * 100).toFixed(1)}% difference)`,
                    });
                }
            }

            // 2. Keyword Mismatch using simple TF-IDF approximation
            try {
                const wikiKeywords = this.extractKeywords(wikiText, 10);
                const grokKeywords = this.extractKeywords(grokText, 10);

                if (wikiKeywords.size > 0 && grokKeywords.size > 0) {
                    const overlap = new Set([...wikiKeywords].filter(x => grokKeywords.has(x)));
                    const total = new Set([...wikiKeywords, ...grokKeywords]);
                    const overlapRatio = overlap.size / total.size;

                    if (overlapRatio < 0.5) {
                        discrepancies.push({
                            type: 'keyword',
                            severity: 'high',
                            description: `Low keyword overlap: only ${(overlapRatio * 100).toFixed(1)}% of key terms match between sources`,
                        });
                    }
                }
            } catch (error) {
                console.warn(`⚠ Keyword analysis failed: ${error}`);
            }

            // 3. Structural Differences
            const wikiLines = (wikiText.match(/\n/g) || []).length;
            const grokLines = (grokText.match(/\n/g) || []).length;

            if (Math.abs(wikiLines - grokLines) > Math.max(wikiLines, grokLines) * 0.5) {
                discrepancies.push({
                    type: 'structural',
                    severity: 'low',
                    description: `Different content structure: Wikipedia has ${wikiLines} line breaks, Grokipedia has ${grokLines}`,
                });
            }
        } catch (error) {
            console.error(`✗ Discrepancy detection failed: ${error}`);
        }

        return discrepancies;
    }

    /**
     * Extract top keywords from text (simplified TF-IDF)
     */
    private extractKeywords(text: string, topN: number = 10): Set<string> {
        const words = text
            .toLowerCase()
            .split(/\W+/)
            .filter(w => w.length > 4); // Filter short words

        // Count word frequencies
        const wordFreq = new Map<string, number>();
        for (const word of words) {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }

        // Sort by frequency and take top N
        const sortedWords = Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN)
            .map(([word]) => word);

        return new Set(sortedWords);
    }
}
