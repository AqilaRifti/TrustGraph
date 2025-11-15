# Requirements Document

## Introduction

This document specifies the requirements for a Wikipedia vs Grokipedia Content Comparison & Trust Annotation System for the OriginTrail Global Hackathon 2025. The System shall fetch articles from Wikipedia and Grokipedia, embed content into a vector database, compare content for discrepancies using AI analysis, and publish Community Notes to the OriginTrail Decentralized Knowledge Graph (DKG). The System shall provide a web-based dashboard for viewing results.

## Glossary

- **System**: The Wikipedia vs Grokipedia Content Comparison & Trust Annotation System
- **Wikipedia**: The free online encyclopedia maintained by human editors
- **Grokipedia**: An AI-generated encyclopedia platform
- **Vector Database**: Pinecone database storing embedded content representations
- **Embedding**: Numerical vector representation of text content
- **Cerebras**: AI service provider for content analysis
- **DKG**: OriginTrail Decentralized Knowledge Graph for publishing trust annotations
- **Community Note**: A structured annotation documenting content discrepancies and trust assessment
- **UAL**: Universal Asset Locator for DKG-published content
- **Discrepancy**: A detected difference between Wikipedia and Grokipedia content
- **Similarity Score**: A numerical measure (0-1) of content similarity based on vector embeddings
- **API Key Rotator**: A load balancing mechanism that distributes requests across multiple API keys

## Requirements

### Requirement 1

**User Story:** As a fact-checker, I want to automatically scan multiple topics across Wikipedia and Grokipedia, so that I can identify content discrepancies at scale

#### Acceptance Criteria

1. THE System SHALL fetch article content from Wikipedia API for a minimum of 50 predefined topics
2. THE System SHALL scrape article content from Grokipedia using web scraping for the same 50 topics
3. WHEN a user initiates a scan, THE System SHALL process all topics in a background thread
4. WHILE scanning is in progress, THE System SHALL update progress status with current topic and completion percentage
5. THE System SHALL store fetched content for subsequent analysis and comparison

### Requirement 2

**User Story:** As a researcher, I want content to be embedded into vector representations, so that I can perform semantic similarity comparisons

#### Acceptance Criteria

1. THE System SHALL generate vector embeddings for Wikipedia content using Sentence-Transformers library
2. THE System SHALL generate vector embeddings for Grokipedia content using Sentence-Transformers library
3. THE System SHALL store vector embeddings in Pinecone vector database with topic identifiers
4. THE System SHALL use Pinecone free tier with a maximum of 100,000 vectors
5. WHEN embeddings are generated, THE System SHALL associate metadata including source platform and topic name

### Requirement 3

**User Story:** As a content moderator, I want to compare Wikipedia and Grokipedia articles, so that I can identify factual discrepancies and potential hallucinations

#### Acceptance Criteria

1. THE System SHALL calculate cosine similarity scores between Wikipedia and Grokipedia vector embeddings
2. THE System SHALL detect discrepancies by comparing semantic content between article pairs
3. THE System SHALL classify each discrepancy with a type identifier and severity level
4. WHEN similarity score is below 0.6, THE System SHALL flag the topic as high-risk
5. THE System SHALL store comparison results including similarity score and discrepancy list

### Requirement 4

**User Story:** As an analyst, I want AI-powered analysis of content discrepancies, so that I can understand the nature and severity of differences

#### Acceptance Criteria

1. THE System SHALL use Cerebras Cloud SDK with model "qwen-3-235b-a22b-thinking-2507" for AI analysis
2. THE System SHALL load-balance API requests across 8 Cerebras API keys using round-robin rotation
3. WHEN analyzing discrepancies, THE System SHALL generate a summary of key differences in 2-3 sentences
4. THE System SHALL assess AI hallucination risk as high, medium, or low
5. THE System SHALL provide a confidence score between 0 and 100 for each analysis
6. THE System SHALL remove thinking tags from Cerebras responses before displaying results
7. IF Cerebras API fails, THEN THE System SHALL return a fallback analysis with automatic discrepancy count

### Requirement 5

**User Story:** As a community contributor, I want AI-generated Community Notes, so that I can publish structured trust annotations

#### Acceptance Criteria

1. THE System SHALL generate Community Notes with a maximum length of 300 words
2. THE System SHALL include context, key findings, sources, and status in each Community Note
3. THE System SHALL use Cerebras AI to generate neutral, evidence-based Community Note text
4. WHEN generating Community Notes, THE System SHALL incorporate similarity score and discrepancy data
5. THE System SHALL maintain a neutral tone in all generated Community Notes

### Requirement 6

**User Story:** As a blockchain researcher, I want to publish Community Notes to the OriginTrail DKG, so that trust annotations are permanently recorded on a decentralized network

#### Acceptance Criteria

1. THE System SHALL publish Community Notes to OriginTrail DKG testnet endpoint
2. THE System SHALL return a UAL identifier for each published Community Note
3. WHEN publishing to DKG, THE System SHALL include topic name, discrepancies, similarity score, and AI analysis
4. THE System SHALL handle DKG publishing errors gracefully with error messages
5. THE System SHALL store UAL identifiers with corresponding topic results

### Requirement 7

**User Story:** As a user, I want a web dashboard to view scanning progress and results, so that I can monitor the analysis process

#### Acceptance Criteria

1. THE System SHALL provide a Flask web application accessible on port 5000
2. THE System SHALL display a dashboard showing topics analyzed count, discrepancies found, and average similarity
3. WHEN scanning is initiated, THE System SHALL display a progress bar with percentage completion
4. THE System SHALL display the currently scanning topic name during active scans
5. WHEN scanning completes, THE System SHALL display a results table with all analyzed topics

### Requirement 8

**User Story:** As a reviewer, I want to view detailed comparison results for individual topics, so that I can examine specific discrepancies and AI analysis

#### Acceptance Criteria

1. THE System SHALL provide a comparison page for each analyzed topic
2. THE System SHALL display similarity score as a visual progress bar with color coding
3. THE System SHALL display AI analysis text from Cerebras on the comparison page
4. THE System SHALL list all detected discrepancies with type and severity on the comparison page
5. THE System SHALL display Community Note text with an option to publish to DKG
6. THE System SHALL show side-by-side content excerpts from Wikipedia and Grokipedia

### Requirement 9

**User Story:** As a system administrator, I want the application to handle API rate limits, so that scanning continues without interruption

#### Acceptance Criteria

1. THE System SHALL implement an API Key Rotator class for load balancing
2. THE System SHALL rotate through 8 Cerebras API keys using round-robin algorithm
3. WHEN an API request is made, THE System SHALL select the next key in rotation sequence
4. THE System SHALL provide a method to retrieve a random API key as an alternative strategy
5. THE System SHALL log which API key index is used for each analysis request

### Requirement 10

**User Story:** As a developer, I want proper error handling and logging, so that I can troubleshoot issues and monitor system health

#### Acceptance Criteria

1. THE System SHALL log successful completion of each topic analysis with topic name
2. THE System SHALL log errors with topic name and error description when analysis fails
3. WHEN Cerebras API fails, THE System SHALL log the failure and continue processing remaining topics
4. THE System SHALL log API key rotation events during batch processing
5. THE System SHALL return structured error responses with HTTP status codes for API endpoints
