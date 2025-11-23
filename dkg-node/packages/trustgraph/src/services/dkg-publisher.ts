/**
 * DKG Publisher for publishing Community Notes to OriginTrail DKG
 */

import type { Discrepancy, KnowledgeAsset } from '../types';

export class DKGPublisher {
    private dkgClient: any;

    constructor(dkgClient: any) {
        this.dkgClient = dkgClient;
    }

    /**
     * Format data as Knowledge Asset (JSON-LD)
     */
    private formatKnowledgeAsset(
        topic: string,
        discrepancies: Discrepancy[],
        similarityScore: number,
        aiAnalysis: string,
        wikipediaUrl?: string,
        grokipediaUrl?: string
    ): KnowledgeAsset {
        return {
            '@context': 'https://schema.org',
            '@type': 'FactCheck',
            '@id': `urn:trustgraph:comparison:${topic.toLowerCase().replace(/\s+/g, '-')}`,
            topic,
            claimReviewed: 'Grokipedia content accuracy',
            reviewRating: {
                '@type': 'Rating',
                ratingValue: similarityScore,
                bestRating: 1.0,
            },
            discrepancies,
            aiAnalysis,
            timestamp: new Date().toISOString(),
            source: 'TrustGraph: Wikipedia vs Grokipedia Comparison System',
            wikipediaUrl,
            grokipediaUrl,
        };
    }

    /**
     * Publish Community Note to DKG
     */
    async publishCommunityNote(
        topic: string,
        discrepancies: Discrepancy[],
        similarityScore: number,
        aiAnalysis: string,
        wikipediaUrl?: string,
        grokipediaUrl?: string
    ): Promise<string | null> {
        try {
            console.log(`📤 Publishing to DKG: ${topic}`);

            const knowledgeAsset = this.formatKnowledgeAsset(
                topic,
                discrepancies,
                similarityScore,
                aiAnalysis,
                wikipediaUrl,
                grokipediaUrl
            );

            // Publish using DKG client
            const result = await this.dkgClient.asset.create(knowledgeAsset, {
                epochsNum: 2,
            });

            const ual = result.UAL;
            console.log(`✅ Published to DKG: ${topic}`);
            console.log(`   UAL: ${ual}`);

            return ual;
        } catch (error) {
            console.error(`❌ DKG publish failed for ${topic}: ${error}`);
            return null;
        }
    }

    /**
     * Retrieve Knowledge Asset from DKG by UAL
     */
    async getAsset(ual: string): Promise<any | null> {
        try {
            const result = await this.dkgClient.asset.get(ual);
            return result;
        } catch (error) {
            console.error(`❌ Failed to retrieve asset ${ual}: ${error}`);
            return null;
        }
    }
}
