#!/usr/bin/env node
/**
 * conformi-search-mcp — MCP server for EU legal research with verifiable CELEX citations.
 *
 * Public, installable MCP server. The research logic runs server-side at conformi.eu;
 * this process exposes the tools over stdio and forwards calls to the hosted endpoint.
 *
 * - Without CONFORMI_API_KEY: free tools only (get_knowledge_article, get_legal_timeline).
 * - With CONFORMI_API_KEY:    adds search_eu_law (metered semantic search).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { listTools, callTool, hasApiKey, type ToolDef } from "./conformiClient.js";

const server = new Server(
  { name: "conformi-search", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = await listTools();
  return {
    tools: tools.map((t: ToolDef) => ({
      name: t.name,
      description: t.description,
      inputSchema: (t.inputSchema as object) ?? { type: "object" },
      ...(t.annotations ? { annotations: t.annotations } : {}),
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    const result = await callTool(name, (args ?? {}) as Record<string, unknown>);
    // The hosted endpoint already returns a CallToolResult-shaped object.
    return result as { content: unknown[]; isError?: boolean };
  } catch (err) {
    return {
      content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `conformi-search MCP server running (api key: ${hasApiKey ? "configured" : "not set — free tools only"})`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
