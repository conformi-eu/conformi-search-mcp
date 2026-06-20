/**
 * Thin client for the hosted conformi MCP endpoint.
 *
 * The actual EU-law research logic runs server-side at conformi.eu; this client
 * speaks JSON-RPC over Streamable HTTP and forwards tools/list and tools/call.
 * An optional CONFORMI_API_KEY is passed through as a Bearer token to unlock the
 * metered `search_eu_law` tool. Without a key, only the free tools are exposed.
 */

const CONFORMI_MCP_URL = process.env.CONFORMI_MCP_URL || "https://conformi.eu/api/mcp";
const CONFORMI_API_KEY = process.env.CONFORMI_API_KEY || "";

/** Tools that require a paid API key (metered server-side). */
const KEYED_TOOLS = new Set(["search_eu_law"]);

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

let rpcId = 0;

async function rpc(method: string, params?: unknown): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (CONFORMI_API_KEY) headers["Authorization"] = `Bearer ${CONFORMI_API_KEY}`;

  const res = await fetch(CONFORMI_MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
  });

  if (!res.ok) {
    throw new Error(`conformi endpoint returned HTTP ${res.status} ${res.statusText}`);
  }

  // The endpoint may answer as application/json or as an SSE stream; handle both.
  const text = await res.text();
  const payload = extractJson(text);
  const parsed = JSON.parse(payload) as JsonRpcResponse;
  if (parsed.error) {
    throw new Error(`conformi error ${parsed.error.code}: ${parsed.error.message}`);
  }
  return parsed.result;
}

/** Pull the JSON-RPC object out of a plain or SSE ("data: {...}") response. */
function extractJson(body: string): string {
  const trimmed = body.trim();
  if (trimmed.startsWith("{")) return trimmed;
  for (const line of trimmed.split("\n")) {
    const l = line.trim();
    if (l.startsWith("data:")) {
      const data = l.slice(5).trim();
      if (data.startsWith("{")) return data;
    }
  }
  throw new Error("Could not parse response from conformi endpoint");
}

export interface ToolDef {
  name: string;
  description?: string;
  inputSchema?: unknown;
  annotations?: unknown;
}

/** List upstream tools, filtering out keyed tools when no API key is configured. */
export async function listTools(): Promise<ToolDef[]> {
  const result = (await rpc("tools/list")) as { tools?: ToolDef[] };
  const tools = result.tools ?? [];
  if (CONFORMI_API_KEY) return tools;
  return tools.filter((t) => !KEYED_TOOLS.has(t.name));
}

/** Forward a tool call to the hosted endpoint. */
export async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  if (!CONFORMI_API_KEY && KEYED_TOOLS.has(name)) {
    throw new Error(
      `Tool "${name}" requires a conformi API key. Set CONFORMI_API_KEY to enable it. ` +
        `Get one at https://conformi.eu`
    );
  }
  return rpc("tools/call", { name, arguments: args });
}

export const hasApiKey = Boolean(CONFORMI_API_KEY);
