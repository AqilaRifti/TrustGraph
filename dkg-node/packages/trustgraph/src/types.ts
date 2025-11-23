/**
 * Type definitions for TrustGraph Wikipedia vs Grokipedia comparison system
 */

export interface ArticleContent {
    title: string;
    content: string;
    url: string;
    timestamp: string;
}

export interface Discrepancy {
    type: 'length' | 'keyword' | 'structural';
    severity: 'low' | 'medium' | 'high';
    description: string;
}

export interface ComparisonResult {
    topic: string;
    similarity_score: number;
    discrepancies: Discrepancy[];
    wiki_content?: string;
    grok_content?: string;
    ai_analysis?: string;
    community_note?: string;
    ual?: string;
    timestamp?: string;
    analysis_success?: boolean;
    comparison_metadata: {
        wiki_length: number;
        grok_length: number;
        discrepancy_count: number;
        error?: string;
    };
}

export interface ScanStatus {
    status: 'idle' | 'processing' | 'completed' | 'error';
    progress: number;
    current_topic: string;
    total_topics?: number;
    completed_topics?: number;
}

export interface AIAnalysisResult {
    success: boolean;
    ai_analysis: string;
    model?: string;
    tokens_used?: number;
    error?: string;
}

export interface KnowledgeAsset {
    '@context': string;
    '@type': string;
    '@id': string;
    topic: string;
    claimReviewed: string;
    reviewRating: {
        '@type': string;
        ratingValue: number;
        bestRating: number;
    };
    discrepancies: Discrepancy[];
    aiAnalysis: string;
    timestamp: string;
    source: string;
    wikipediaUrl?: string;
    grokipediaUrl?: string;
}

export interface TopicStatus {
    name: string;
    similarity: number;
    discrepancies: number;
    status: 'pending' | 'completed' | 'failed';
    ai_analysis_available: boolean;
}

export interface CerebrasConfig {
    apiKeys: string[];
    model: string;
    maxTokens: number;
    temperature: number;
    topP: number;
}

export interface TrustGraphConfig {
    cerebras: CerebrasConfig;
    dkgEndpoint: string;
    topicsFile: string;
}
