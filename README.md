# conformi-search — EU Legal Research MCP Server

**Remote MCP server** for EU legal research with verifiable CELEX citations from the
EUR-Lex corpus (German, English, French — each a native-language index, not translations).

> Research tool with primary-source citations — **not legal advice**, no attorney-client relationship.

## Endpoint

```
https://conformi.eu/api/mcp        (Streamable HTTP, stateless)
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

## License

This repository documents the public endpoint. The hosted service, its source code
and its data products are proprietary and governed by the conformi.eu terms — only
the contents of this repository are MIT-licensed.

## About

Built by [conformi.eu](https://conformi.eu) — EU compliance research with verifiable sources.
