<div align="center">

<img src="conformi-logo.svg" alt="conformi" width="120" />

# conformi-search — EU Legal Research MCP Server

**Verifiable EU law for AI agents — every answer carries a CELEX number and an EUR-Lex deep link.**

**Language:** [**English**](README.md) · [Deutsch](docs/de-DE/README.md) · [Français](docs/fr-FR/README.md)

[![smithery badge](https://smithery.ai/badge/conformi-eu/conformi-search)](https://smithery.ai/server/conformi-eu/conformi-search)
[![Smithery calls](https://smithery.ai/badge/conformi-eu/conformi-search/calls)](https://smithery.ai/server/conformi-eu/conformi-search)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-eu.conformi%2Fconformi--search-blue)](https://conformi.eu/api/mcp)
[![Wikidata](https://img.shields.io/badge/Wikidata-Q140166658-006699)](https://www.wikidata.org/wiki/Q140166658)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![Corpus](https://img.shields.io/badge/corpus-DE%20%C2%B7%20EN%20%C2%B7%20FR-orange)

</div>

---

MCP server for **EU legal research with verifiable CELEX citations** from the EUR-Lex corpus
(German, English, French — each a **native-language index, not machine translations**).
It exposes selected EU legal research tools to any MCP client and can optionally use a
conformi API key for extended semantic search.

> Research tool with primary-source citations — **not legal advice**, no attorney-client relationship.

## Why this exists

LLMs answer EU-law questions plausibly but unverifiably. conformi-search returns answers that are
**checkable against the primary source**: each result carries the CELEX number and a direct EUR-Lex
link, so an agent (or a human) can verify the citation instead of trusting a hallucination.
Works in Claude Code, Claude Desktop, Cursor, and any other MCP-capable harness.

## Two ways to use it

**1. Run it locally (stdio)** — installable MCP server, no key needed for the free tools:

```bash
npm install && npm run build
node dist/index.js
```

Or with Docker:

```bash
docker build -t conformi-search-mcp .
docker run -i conformi-search-mcp
```

Add to an MCP client (e.g. Claude Desktop) config:

```json
{
  "mcpServers": {
    "conformi-search": {
      "command": "node",
      "args": ["/path/to/conformi-search-mcp/dist/index.js"],
      "env": { "CONFORMI_API_KEY": "cfm_live_…  (optional, enables search_eu_law)" }
    }
  }
}
```

Without `CONFORMI_API_KEY` the two free tools are available. Setting the key adds the
metered `search_eu_law` tool.

**2. Use the hosted remote endpoint** directly (Streamable HTTP, stateless):

```
https://conformi.eu/api/mcp
```

Registered in the official MCP Registry as **`eu.conformi/conformi-search`**.
Wikidata: [Q140166658](https://www.wikidata.org/wiki/Q140166658)

## Tools

| Tool | Auth | Billing |
|---|---|---|
| `search_eu_law` — semantic search across EU secondary law, results carry CELEX numbers + EUR-Lex deep links; optional `valid_at` time-travel filter | API key | metered per query |
| `get_knowledge_article` — curated report for one legal act (GDPR, AI Act, NIS2, DORA, CRA …) incl. legal-status (Rechtsstand) metadata | none | free |
| `get_legal_timeline` — application-date timeline for major acts (e.g. AI Act high-risk deadlines) | none | free |

## Getting an API key (machine-friendly)

The full contract incl. pricing and a machine-driven purchase flow is in the OpenAPI document:

```
https://conformi.eu/api/v1/openapi.json
```

7-day free trial on the Professional plan, €0 due today, cancel anytime before trial end.

## Quick test (no key needed)

```bash
curl -X POST https://conformi.eu/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_knowledge_article","arguments":{"celex":"32024R1689"}}}'
```

## Troubleshooting

| Symptom | Cause & fix |
|---|---|
| `search_eu_law` returns `isError` with a purchase hint | No `Authorization: Bearer` key was sent. Free tools work without a key; search is metered — get a key via https://conformi.eu/api/v1/openapi.json |
| `401 UNAUTHORIZED` on search | Key invalid or revoked. Check the key in your conformi.eu account (Account → API Keys) |
| `403 PLAN_REQUIRED` / `TRIAL_LIMIT_REACHED` | Subscription inactive or the 50-query trial allowance is used up — activate the subscription |
| `404` for a CELEX in `get_knowledge_article` | No curated report exists for that act yet. Try `search_eu_law` instead — the full corpus is searchable |
| Connection fails | The server speaks Streamable HTTP only (no SSE). POST JSON-RPC to https://conformi.eu/api/mcp; GET returns 405 by design |
| Anything else | Open an issue: https://github.com/conformi-eu/conformi-search-mcp/issues or mail info@conformi.eu |

## License

This repository documents the public endpoint. The hosted service, its source code
and its data products are proprietary and governed by the conformi.eu terms — only
the contents of this repository are MIT-licensed.

## About

Built by [conformi.eu](https://conformi.eu) — EU compliance research with verifiable sources.
