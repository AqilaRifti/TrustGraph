/**
 * Scan Manager for orchestrating the comparison workflow
 */

import type { ComparisonResult, ScanStatus } from '../types';
import { ContentScraper } from './scraper';
import { ContentComparator } from './comparator';
import { CerebrasAnalyzer } from './cerebras-analyzer';
import { DKGPublisher } from './dkg-publisher';

export class ScanManager {
    private scraper: ContentScraper;
    private comparator: ContentComparator;
    private cerebras: CerebrasAnalyzer;
    private dkg: DKGPublisher;
    private scanResults: Map<string, ComparisonResult>;
    private scanStatus: ScanStatus;
    private topics: string[];

    constructor(
        cerebras: CerebrasAnalyzer,
        dkgClient: any,
        topics: string[]
    ) {
        this.scraper = new ContentScraper();
        this.comparator = new ContentComparator();
        this.cerebras = cerebras;
        this.dkg = new DKGPublisher(dkgClient);
        this.scanResults = new Map();
        this.topics = topics;
        this.scanStatus = {
            status: 'idle',
            progress: 0,
            current_topic: '',
            total_topics: topics.length,
            completed_topics: 0,
        };
    }

    /**
     * Get current scan status
     */
    getScanStatus(): ScanStatus {
        return { ...this.scanStatus };
    }

    /**
     * Get all scan results
     */
    getAllResults(): ComparisonResult[] {
        return Array.from(this.scanResults.values());
    }

    /**
     * Get result for specific topic
     */
    getResult(topic: string): ComparisonResult | null {
        return this.scanResults.get(topic) || null;
    }

    /**
     * Get list of topics
     */
    getTopics(): string[] {
        return [...this.topics];
    }

    /**
     * Start scanning all topics
     */
    async startScan(): Promise<void> {
        if (this.scanStatus.status === 'processing') {
            throw new Error('Scan already in progress');
        }

        this.scanStatus.status = 'processing';
        this.scanStatus.progress = 0;
        this.scanStatus.completed_topics = 0;

        console.log(`🚀 Starting scan of ${this.topics.length} topics`);

        for (let i = 0; i < this.topics.length; i++) {
            const topic = this.topics[i];
            this.scanStatus.current_topic = topic;
            this.scanStatus.progress = Math.floor((i / this.topics.length) * 100);

            try {
                await this.scanTopic(topic);
                this.scanStatus.completed_topics++;
            } catch (error) {
                console.error(`✗ Error scanning ${topic}: ${error}`);
                // Continue with next topic
            }
        }

        this.scanStatus.status = 'completed';
        this.scanStatus.progress = 100;
        console.log(`✅ Scan completed: ${this.scanStatus.completed_topics}/${this.topics.length} topics`);
    }

    /**
     * Scan a single topic
     */
    async scanTopic(topic: string): Promise<ComparisonResult> {
        console.log(`📊 Scanning: ${topic}`);

        // Fetch content
        const wiki = await this.scraper.fetchWikipedia(topic);
        const grok = await this.scraper.fetchGrokipedia(topic);

        if (!wiki || !grok) {
            console.warn(`⚠ Skipping ${topic}: content fetch failed`);
            throw new Error('Content fetch failed');
        }

        // Compare content
        const comparison = await this.comparator.compareTopics(
            topic,
            wiki.content,
            grok.content
        );

        // Store content for AI analysis
        comparison.wiki_content = wiki.content;
        comparison.grok_content = grok.content;

        // AI-powered analysis
        const aiAnalysis = await this.cerebras.analyzeDiscrepancies(
            topic,
            wiki.content,
            grok.content,
            comparison.discrepancies
        );
        comparison.ai_analysis = aiAnalysis.ai_analysis;
        comparison.analysis_success = aiAnalysis.success;

        // Generate Community Note
        const communityNote = await this.cerebras.generateCommunityNote(
            topic,
            comparison.similarity_score,
            comparison.discrepancies,
            aiAnalysis.ai_analysis
        );
        comparison.community_note = communityNote;

        // Publish to DKG
        const ual = await this.dkg.publishCommunityNote(
            topic,
            comparison.discrepancies,
            comparison.similarity_score,
            comparison.ai_analysis,
            wiki.url,
            grok.url
        );
        comparison.ual = ual || undefined;
        comparison.timestamp = new Date().toISOString();

        // Store result
        this.scanResults.set(topic, comparison);
        console.log(`✓ Completed: ${topic}`);

        return comparison;
    }

    /**
     * Publish a specific topic to DKG (manual trigger)
     */
    async publishToDKG(topic: string): Promise<string | null> {
        const result = this.scanResults.get(topic);
        if (!result) {
            throw new Error(`Topic not found: ${topic}`);
        }

        return await this.dkg.publishCommunityNote(
            topic,
            result.discrepancies,
            result.similarity_score,
            result.ai_analysis || '',
            undefined,
            undefined
        );
    }
}
