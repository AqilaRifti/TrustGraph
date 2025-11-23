# Requirements Document

## Introduction

This document specifies the requirements for migrating the Wikipedia vs Grokipedia Quality Control System from a Python Flask application to a TypeScript plugin within the dkg-node architecture. The system analyzes content from Wikipedia and Grokipedia, detects discrepancies using AI, and publishes Community Notes to the OriginTrail Decentralized Knowledge Graph (DKG). This migration is required for hackathon submission eligibility.

## Glossary

- **DKG**: Decentralized Knowledge Graph - OriginTrail's blockchain-based knowledge infrastructure
- **UAL**: Universal Asset Locator - Unique identifier for knowledge assets on the DKG
- **Knowledge Asset**: JSON-LD formatted data published to the DKG
- **Community Note**: Fact-checking annotation comparing Wikipedia and Grokipedia content
- **MCP**: Model Context Protocol - Interface for AI agent tool registration
- **Plugin**: Modular TypeScript package that extends dkg-node functionality
- **Cerebras**: AI analysis service for content comparison
- **Vector Embedding**: Numerical representation of text for semantic similarity
- **Cosine Similarity**: Metric measuring similarity between vector embeddings (0-1 scale)
- **Discrepancy**: Detected difference between Wikipedia and Grokipedia content
- **Topic**: Subject matter being compared (e.g., "Artificial Intelligence")

## Requirements

### Requirement 1

**User Story:** As a hackathon participant, I want to migrate the Python application to a TypeScript dkg-node plugin, so that my submission meets the hackathon eligibility requirements.

#### Acceptance Criteria

1. WHEN the plugin is created THEN the system SHALL follow the dkg-node plugin architecture pattern
2. WHEN the plugin is registered THEN the system SHALL expose MCP tools and API endpoints
3. WHEN the plugin is built THEN the system SHALL compile without TypeScript errors
4. WHEN the plugin is installed THEN the system SHALL integrate with the dkg-node agent application
5. WHERE the plugin uses external services THEN the system SHALL configure them via environment variables

### Requirement 2

**User Story:** As a user, I want to fetch content from Wikipedia and Grokipedia, so that I can compare articles on the same topic.

#### Acceptance Criteria

1. WHEN a topic is provided THEN the system SHALL fetch the corresponding Wikipedia article using the Wikipedia API
2. WHEN a topic is provided THEN the system SHALL scrape the corresponding Grokipedia article via HTTP
3. WHEN Wikipedia returns a disambiguation page THEN the system SHALL attempt to fetch the first option
4. WHEN content fetching fails THEN the system SHALL log the error and return null
5. WHEN content is fetched THEN the system SHALL return title, content, URL,mestamp

3



 Criteria

el
2. WHEN embeddings are generated THEN the system SHALL store them in a vector database
3. WHEN two embeddings are compared THEN the system SHALL calculate cosine similarity
4. WHEN similarity is calculated THEN the system SHALL return a score between 0 and 1
5. WHERE embedding generation fails THEN the system SHALL log the error and return null



ation.

iteria

e
2. WHEN two articles are compared THEN the system SHALL detect keyword mismatches using TF-IDF analysis
3. WHEN keyword overlap is below 50% THEN the system SHALL flag a high-severity keyword discrepancy
4. WHEN two articles are compared THEN the system SHALL detect structural differences in formatting
5. WHEN discrepancies are detected THEN the system SHALL return a list wcription

### Requirement 5

ts.

eria

s
2. WHEN Cerebras analyzeences

4. WHEN Cerebras analyzes content THEN the system SHALL receive a recommendatio
5. WHEN Cerebras API fails THEN the system SHALL fall back to automatic analysis without AI
6. WHERE multiple API keys are configured THEN the system SHALL rotate through them using rin

### Requirement 6

**User Story:** A

#### Acceptance Criteria

1. WHEN analysis is comps AI
ers
3. WHEN a Community Note is generated THEN the system SHALL include key finding
4. WHEN a Community Note is generated THEN the system SHALL maintain a neutra
5. WHEN a Community Note is generated THEN the system SHALL limit content to 300 words maximum

### Requirement 7

**User Story:** A

#### Acceptance Criteria

1. WHEN a Community Note
stem
3. WHEN publishing succeeds THEN the system SHALL return a UAL (Universal Aor)
4. WHEN publishing fails THEN the system SHALL log the error and return null
5. WHEN a UAL is provided THEN the system SHALL retrieve the Knowledge Asset from the DKG

### Requirement 8

**User Story:** Aently.

#### Acceptance Criteria

1. WHEN a scan is initia

3. WHEN a topic fails THEN the system SHALL skip it and continue withopics
4. WHEN a scan completes THEN the system SHALL store results for later retrieval
5. WHEN scan status is requested THEN the system SHALL return current progress inmation

### Requirement 9

s.



atus
2. WHEN the API endpoint scan
ress
4. WHEN the API endpoint GET /api/topic/:name is called THEN the system S
5. WHEN the API endpoint POST /api/publish-dkg is called THEN the system SHALL pub

### Requirement 10

erfaces.




2. WHEN the plugin regis
G
4. WHEN an MCP tool is called THEN the system SHALL validate input parameters
5. WHEN an MCP tool completes THEN the system SHALL return structured results with sourcdge Assets

### Requirement 11


omplete listreturn the cSHALL  system N thested THE requeics are5. WHEN topty string
s a non-empch topic ihat eate t validastem SHALL sytheloaded THEN topics are HEN ray
4. Wempty arrn an or and retu errLL log anSHAem HEN the systormed Ts malfle i fi topicsN they
3. WHEy arraturn an emptror and reern  aHALL loge system Sng THEN the is missiopics fil the tHEN
2. WileN f from a JSOoad topicsstem SHALL l sy THEN thelizesystem initia sHEN the. W
1a
nce Criteriepta# Accare.

### comp to of subjectsge the listanaily meas that I can sofile, tion figurafrom a conpics to load to, I want eveloper* As a der Story:* 12

**Us Requirementnull

###rn  retundthe error ag SHALL lohe system N tils THEishing faEN DKG publ5. WHnalysis
omatic aut back to aL fallALm SHEN the systeails THrebras API f. WHEN Ceeptions
4throwing excout withll urn nuem SHALL rethe systfails THEN ting crapGrokipedia sHEN ptions
3. Wowing exceout thrwithl rn nultum SHALL ree systethls THEN fetch faidia peEN Wiki2. WHt
texor with cong the errm SHALL lo the systeHENfails TAPI call nal tery exHEN ana

1. Writeriance Ccceptm.

#### A systetire ent crash theon'ilures dso that fadling,  error hanprehensivecomr, I want lope* As a deveer Story:*Us**