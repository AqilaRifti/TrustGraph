/**
 * TrustGraph Plugin - Wikipedia vs Grokipedia Content Comparison System
 * 
 * This plugin provides AI-powered content comparison between Wikipedia and Grokipedia,
 * detecting discrepancies and publishing Community Notes to the OriginTrail DKG.
 */

import { defineDkgPlugin } from "@dkg/plugins";
import { openAPIRoute, z } from "@dkg/plugin-swagger";
import { withSourceKnowledgeAssets } from "@dkg/plugin-dkg-essentials/utils";
import { CerebrasAnalyzer } from "./services/cerebras-analyzer";
import { ScanManager } from "./services/scan-manager";
import type { CerebrasConfig, TopicStatus } from "./types";
import fs from 'fs';
import path from 'path';

// Load topics from configuration file
function loadTopics(topicsFile: string): string[] {
  try {
    const topicsPath = path.resolve(topicsFile);
    const data = fs.readFileSync(topicsPath, 'utf-8');
    const topics = JSON.parse(data);

    if (!Array.isArray(topics)) {
      console.error('✗ Topics file must contain an array');
      return [];
    }

    const validTopics = topics.filter(t => typeof t === 'string' && t.trim().length > 0);
    console.log(`✓ Loaded ${validTopics.length} topics`);
    return validTopics;
  } catch (error) {
    console.error(`✗ Failed to load topics: ${error}`);
    return [];
  }
}

export default defineDkgPlugin((ctx, mcp, api) => {
  // Load configuration from environment
  const cerebrasConfig: CerebrasConfig = {
    apiKeys: (process.env.CEREBRAS_API_KEYS || '').split(',').filter(k => k.trim()),
    model: process.env.CEREBRAS_MODEL || 'llama3.1-70b',
    maxTokens: parseInt(process.env.CEREBRAS_MAX_TOKENS || '2048'),
    temperature: parseFloat(process.env.CEREBRAS_TEMPERATURE || '0.6'),
    topP: parseFloat(process.env.CEREBRAS_TOP_P || '0.95'),
  };

  const topicsFile = process.env.TRUSTGRAPH_TOPICS_FILE || path.join(__dirname, '../data/topics.json');
  const topics = loadTopics(topicsFile);

  // Initialize services
  const cerebras = new CerebrasAnalyzer(cerebrasConfig);
  const scanManager = new ScanManager(cerebras, ctx.dkg, topics);

  // ============================================================================
  // MCP TOOLS - For AI Agent Integration
  // ============================================================================

  /**
   * MCP Tool: Start scanning all topics
   */
  mcp.registerTool(
    "trustgraph_scan",
    {
      title: "TrustGraph: Start Content Scan",
      description: "Start scanning all topics to compare Wikipedia and Grokipedia content, detect discrepancies, and publish Community Notes to DKG",
      inputSchema: {},
    },
    async () => {
      try {
        // Start scan in background (non-blocking)
        scanManager.startScan().catch(error => {
          console.error(`Scan error: ${error}`);
        });

        return withSourceKnowledgeAssets(
          {
            content: [
              {
                type: "text",
                text: `Started scanning ${topics.length} topics. Use trustgraph_status to check progress.`,
              },
            ],
          },
          []
        );
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error starting scan: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * MCP Tool: Get scan status
   */
  mcp.registerTool(
    "trustgraph_status",
    {
      title: "TrustGraph: Get Scan Status",
      description: "Get current scan progress and status",
      inputSchema: {},
    },
    async () => {
      const status = scanManager.getScanStatus();

      return withSourceKnowledgeAssets(
        {
          content: [
            {
              type: "text",
              text: JSON.stringify(status, null, 2),
            },
          ],
        },
        []
      );
    }
  );

  /**
   * MCP Tool: Get comparison results for a topic
   */
  mcp.registerTool(
    "trustgraph_get_topic",
    {
      title: "TrustGraph: Get Topic Comparison",
      description: "Get detailed comparison results for a specific topic",
      inputSchema: {
        topic: z.string().describe("Topic name to retrieve"),
      },
    },
    async ({ topic }) => {
      const result = scanManager.getResult(topic);

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `Topic not found: ${topic}`,
            },
          ],
          isError: true,
        };
      }

      // If UAL exists, include it as source
      const sources = result.ual
        ? [
          {
            title: `TrustGraph Community Note: ${topic}`,
            issuer: "TrustGraph",
            ual: result.ual,
          },
        ]
        : [];

      return withSourceKnowledgeAssets(
        {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
        sources
      );
    }
  );

  /**
   * MCP Tool: Publish topic to DKG
   */
  mcp.registerTool(
    "trustgraph_publish",
    {
      title: "TrustGraph: Publish to DKG",
      description: "Manually publish a topic's Community Note to the DKG",
      inputSchema: {
        topic: z.string().describe("Topic name to publish"),
      },
    },
    async ({ topic }) => {
      try {
        const ual = await scanManager.publishToDKG(topic);

        if (!ual) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to publish ${topic} to DKG`,
              },
            ],
            isError: true,
          };
        }

        return withSourceKnowledgeAssets(
          {
            content: [
              {
                type: "text",
                text: `Successfully published ${topic} to DKG. UAL: ${ual}`,
              },
            ],
          },
          [
            {
              title: `TrustGraph Community Note: ${topic}`,
              issuer: "TrustGraph",
              ual,
            },
          ]
        );
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error publishing ${topic}: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ============================================================================
  // REST API ENDPOINTS - For Web Dashboard Integration
  // ============================================================================

  /**
   * GET /api/trustgraph/topics - List all topics with status
   */
  api.get(
    "/api/trustgraph/topics",
    openAPIRoute(
      {
        tag: "TrustGraph",
        summary: "List all topics",
        description: "Get list of all topics with their comparison status",
        response: {
          description: "List of topics with status",
          schema: z.array(
            z.object({
              name: z.string(),
              similarity: z.number(),
              discrepancies: z.number(),
              status: z.enum(['pending', 'completed', 'failed']),
              ai_analysis_available: z.boolean(),
            })
          ),
        },
      },
      (req, res) => {
        const results = scanManager.getAllResults();
        const topicStatuses: TopicStatus[] = topics.map(topic => {
          const result = scanManager.getResult(topic);

          if (result) {
            return {
              name: topic,
              similarity: result.similarity_score,
              discrepancies: result.discrepancies.length,
              status: 'completed',
              ai_analysis_available: !!result.ai_analysis,
            };
          }

          return {
            name: topic,
            similarity: 0,
            discrepancies: 0,
            status: 'pending',
            ai_analysis_available: false,
          };
        });

        res.json(topicStatuses);
      }
    )
  );

  /**
   * POST /api/trustgraph/scan - Start background scan
   */
  api.post(
    "/api/trustgraph/scan",
    openAPIRoute(
      {
        tag: "TrustGraph",
        summary: "Start content scan",
        description: "Start scanning all topics in the background",
        response: {
          description: "Scan started confirmation",
          schema: z.object({
            status: z.string(),
            job_id: z.string(),
            total_topics: z.number(),
          }),
        },
      },
      (req, res) => {
        const status = scanManager.getScanStatus();

        if (status.status === 'processing') {
          res.status(409).json({ error: 'Scan already in progress' });
          return;
        }

        // Start scan in background
        scanManager.startScan().catch(error => {
          console.error(`Scan error: ${error}`);
        });

        res.json({
          status: 'scanning',
          job_id: 'scan_001',
          total_topics: topics.length,
        });
      }
    )
  );

  /**
   * GET /api/trustgraph/scan-status - Get scan progress
   */
  api.get(
    "/api/trustgraph/scan-status",
    openAPIRoute(
      {
        tag: "TrustGraph",
        summary: "Get scan status",
        description: "Get current scan progress and status",
        response: {
          description: "Current scan status",
          schema: z.object({
            status: z.enum(['idle', 'processing', 'completed', 'error']),
            progress: z.number(),
            current_topic: z.string(),
            total_topics: z.number().optional(),
            completed_topics: z.number().optional(),
          }),
        },
      },
      (req, res) => {
        const status = scanManager.getScanStatus();
        res.json(status);
      }
    )
  );

  /**
   * GET /api/trustgraph/topic/:name - Get topic details
   */
  api.get(
    "/api/trustgraph/topic/:name",
    openAPIRoute(
      {
        tag: "TrustGraph",
        summary: "Get topic comparison",
        description: "Get detailed comparison results for a specific topic",
        params: z.object({
          name: z.string().describe("Topic name"),
        }),
        response: {
          description: "Topic comparison details",
          schema: z.object({
            topic: z.string(),
            similarity_score: z.number(),
            discrepancies: z.array(z.any()),
            ai_analysis: z.string().optional(),
            community_note: z.string().optional(),
            ual: z.string().optional(),
          }),
        },
      },
      (req, res) => {
        const { name } = req.params;
        const result = scanManager.getResult(name);

        if (!result) {
          res.status(404).json({ error: 'Topic not found' });
          return;
        }

        res.json(result);
      }
    )
  );

  /**
   * POST /api/trustgraph/publish-dkg - Manually publish to DKG
   */
  api.post(
    "/api/trustgraph/publish-dkg",
    openAPIRoute(
      {
        tag: "TrustGraph",
        summary: "Publish to DKG",
        description: "Manually publish a topic's Community Note to the DKG",
        body: z.object({
          topic: z.string().describe("Topic name to publish"),
        }),
        response: {
          description: "Publish result",
          schema: z.object({
            success: z.boolean(),
            ual: z.string().optional(),
            error: z.string().optional(),
          }),
        },
      },
      async (req, res) => {
        try {
          const { topic } = req.body;
          const ual = await scanManager.publishToDKG(topic);

          if (!ual) {
            res.status(500).json({ success: false, error: 'Publishing failed' });
            return;
          }

          res.json({ success: true, ual });
        } catch (error) {
          res.status(500).json({ success: false, error: String(error) });
        }
      }
    )
  );

  console.log('✅ TrustGraph plugin loaded successfully');
  console.log(`   Topics: ${topics.length}`);
  console.log(`   Cerebras API keys: ${cerebrasConfig.apiKeys.length}`);
});
