/**
 * Cerebras AI Analyzer for generating AI-powered content analysis
 */

import { Cerebras } from '@cerebras/cerebras_cloud_sdk';
import type { AIAnalysisResult, Discrepancy, CerebrasConfig } from '../types';
import { APIKeyRotator } from '../utils/api-key-rotator';

export class CerebrasAnalyzer {
    private keyRotator: APIKeyRotator;
    private config: CerebrasConfig;

    constructor(config: CerebrasConfig) {
        this.config = config;
        this.keyRotator = new APIKeyRotator(config.apiKeys);
    }

    /**
     * Get Cerebras client with load-balanced API key
     */
    private getClient(): Cerebras {
        const apiKey = this.keyRotator.getNextKey();
        return new Cerebras({ apiKey });
    }

    /**
     * Remove <think> tags from response
     */
    private extractThinking(content: string): string {
        return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }

    /**
     * Analyze discrepancies using Cerebras AI
     */
    async analyzeDiscrepancies(
        topic: string,
        wikiContent: string,
        grokContent: string,
        discrepancies: Discrepancy[]
    ): Promise<AIAnalysisResult> {
        try {
            const client = this.getClient();

            // Truncate long texts for efficiency
            const wikiSnippet = wikiContent.substring(0, 1500);
            const grokSnippet = grokContent.substring(0, 1500);

            const prompt = `You are a fact-checking expert analyzing content for accuracy and bias.

Topic: ${topic}

Wikipedia excerpt: ${wikiSnippet}

Grokipedia excerpt: ${grokSnippet}

Detected discrepancies: ${JSON.stringify(discrepancies)}

Provide:
1. Summary of key differences (2-3 sentences)
2. Assessment of AI hallucination risk (high/medium/low)
3. Potential bias indicators
4. Recommendation (trusted/needs_review/unreliable)
5. Confidence score (0-100)

Be concise and factual.`;

            const response = await client.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are an expert fact-checker specializing in comparing AI-generated vs human-curated content. Provide clear, evidence-based assessments.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: this.config.model,
                stream: false,
                max_completion_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
                top_p: this.config.topP,
            });

            const aiResponse = response.choices[0]?.message?.content || '';
            const cleanResponse = this.extractThinking(aiResponse);

            console.log(
                `✓ Cerebras analysis completed for ${topic} (API key #${this.keyRotator.getCurrentIndex()})`
            );

            return {
                success: true,
                ai_analysis: cleanResponse,
                model: this.config.model,
                tokens_used: response.usage?.total_tokens || 0,
            };
        } catch (error) {
            console.error(`✗ Cerebras analysis failed for ${topic}: ${error}`);
            return {
                success: false,
                ai_analysis: `AI analysis unavailable. ${discrepancies.length} discrepancies detected automatically.`,
                error: String(error),
            };
        }
    }

    /**
     * Generate Community Note using Cerebras AI
     */
    async generateCommunityNote(
        topic: string,
        similarityScore: number,
        discrepancies: Discrepancy[],
        aiAnalysis: string
    ): Promise<string> {
        try {
            const client = this.getClient();

            const prompt = `Write a concise, neutral Community Note (max 300 words) for fact-checkers.

Topic: ${topic}
Similarity to Wikipedia: ${(similarityScore * 100).toFixed(1)}%
Discrepancies Found: ${discrepancies.length}

AI Analysis: ${aiAnalysis}

Format as:
- Context: Why this matters
- Key findings: What we found
- Sources: Wikipedia as baseline
- Status: Recommended action

Keep tone neutral and evidence-based.`;

            const response = await client.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content:
                            'You write clear, neutral fact-checking notes for community review. Be concise and factual.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: this.config.model,
                stream: false,
                max_completion_tokens: 1024,
                temperature: this.config.temperature,
                top_p: this.config.topP,
            });

            const noteContent = response.choices[0]?.message?.content || '';
            const cleanNote = this.extractThinking(noteContent);

            console.log(`✓ Community Note generated for ${topic}`);
            return cleanNote;
        } catch (error) {
            console.error(`✗ Community Note generation failed: ${error}`);
            return `Comparison complete for ${topic}. Similarity: ${(similarityScore * 100).toFixed(1)}%. Discrepancies: ${discrepancies.length}.`;
        }
    }

    /**
     * Batch analyze multiple topics with API key rotation
     */
    async batchAnalyze(results: any[]): Promise<any[]> {
        const enhanced = [];

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            console.log(
                `Analyzing ${i + 1}/${results.length}: ${result.topic} (using API key #${this.keyRotator.getCurrentIndex()})`
            );

            const analysis = await this.analyzeDiscrepancies(
                result.topic,
                result.wiki_content || '',
                result.grok_content || '',
                result.discrepancies
            );

            const communityNote = await this.generateCommunityNote(
                result.topic,
                result.similarity_score,
                result.discrepancies,
                analysis.ai_analysis
            );

            result.ai_analysis = analysis.ai_analysis;
            result.community_note = communityNote;
            result.analysis_success = analysis.success;

            enhanced.push(result);
        }

        return enhanced;
    }
}
