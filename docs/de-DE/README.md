<div align="center">

<img src="../../conformi-logo.svg" alt="conformi" width="120" />

# conformi-search — MCP-Server für EU-Rechtsrecherche

**Prüfbares EU-Recht für KI-Agenten — jede Antwort trägt eine CELEX-Nummer und einen direkten EUR-Lex-Link.**

**Sprache:** [English](../../README.md) · [**Deutsch**](README.md) · [Français](../fr-FR/README.md)

[![smithery badge](https://smithery.ai/badge/conformi-eu/conformi-search)](https://smithery.ai/server/conformi-eu/conformi-search)
[![Smithery calls](https://smithery.ai/badge/conformi-eu/conformi-search/calls)](https://smithery.ai/server/conformi-eu/conformi-search)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-eu.conformi%2Fconformi--search-blue)](https://conformi.eu/api/mcp)
[![Wikidata](https://img.shields.io/badge/Wikidata-Q140166658-006699)](https://www.wikidata.org/wiki/Q140166658)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)
![Korpus](https://img.shields.io/badge/Korpus-DE%20%C2%B7%20EN%20%C2%B7%20FR-orange)

</div>

---

MCP-Server für **EU-Rechtsrecherche mit prüfbaren CELEX-Belegen** aus dem EUR-Lex-Korpus
(Deutsch, Englisch, Französisch — jeweils ein **muttersprachlicher Index, keine maschinellen
Übersetzungen**). Er stellt ausgewählte EU-Rechtsrecherche-Werkzeuge für jeden MCP-Client bereit
und kann optional einen conformi-API-Schlüssel für die erweiterte semantische Suche nutzen.

> Recherche-Werkzeug mit Primärquellen-Belegen — **keine Rechtsberatung**, kein Mandatsverhältnis.

## Warum es das gibt

LLMs beantworten EU-Rechtsfragen plausibel, aber unüberprüfbar. conformi-search liefert Antworten,
die **gegen die Primärquelle prüfbar** sind: jedes Ergebnis trägt die CELEX-Nummer und einen
direkten EUR-Lex-Link, sodass ein Agent (oder ein Mensch) den Beleg verifizieren kann, statt einer
Halluzination zu vertrauen. Läuft in Claude Code, Claude Desktop, Cursor und jedem anderen
MCP-fähigen Harness.

## Zwei Wege der Nutzung

**1. Lokal ausführen (stdio)** — installierbarer MCP-Server, für die freien Tools ohne Schlüssel:

```bash
npm install && npm run build
node dist/index.js
```

Oder mit Docker:

```bash
docker build -t conformi-search-mcp .
docker run -i conformi-search-mcp
```

In einen MCP-Client (z. B. Claude Desktop) eintragen:

```json
{
  "mcpServers": {
    "conformi-search": {
      "command": "node",
      "args": ["/pfad/zu/conformi-search-mcp/dist/index.js"],
      "env": { "CONFORMI_API_KEY": "cfm_live_…  (optional, aktiviert search_eu_law)" }
    }
  }
}
```

Ohne `CONFORMI_API_KEY` stehen die zwei freien Tools bereit. Mit Schlüssel kommt das nach
Abruf abgerechnete `search_eu_law` hinzu.

**2. Den gehosteten Remote-Endpunkt** direkt nutzen (Streamable HTTP, zustandslos):

```
https://conformi.eu/api/mcp
```

In der offiziellen MCP-Registry registriert als **`eu.conformi/conformi-search`**.
Wikidata: [Q140166658](https://www.wikidata.org/wiki/Q140166658)

## Werkzeuge

| Tool | Auth | Abrechnung |
|---|---|---|
| `search_eu_law` — semantische Suche im EU-Sekundärrecht, Ergebnisse mit CELEX-Nummern + EUR-Lex-Deeplinks; optionaler `valid_at`-Zeitfilter | API-Schlüssel | pro Abfrage abgerechnet |
| `get_knowledge_article` — kuratierter Report zu einem Rechtsakt (DSGVO, AI Act, NIS2, DORA, CRA …) inkl. Rechtsstand-Metadaten | keine | kostenlos |
| `get_legal_timeline` — Geltungs-Zeitleiste für zentrale Rechtsakte (z. B. AI-Act-Hochrisiko-Fristen) | keine | kostenlos |

## API-Schlüssel erhalten (maschinenlesbar)

Der vollständige Vertrag inkl. Preisen und maschinengesteuertem Kaufprozess steht im OpenAPI-Dokument:

```
https://conformi.eu/api/v1/openapi.json
```

7 Tage kostenlos testen (Professional-Plan), heute 0 €, jederzeit vor Ablauf kündbar.

## Schnelltest (kein Schlüssel nötig)

```bash
curl -X POST https://conformi.eu/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_knowledge_article","arguments":{"celex":"32024R1689"}}}'
```

## Fehlerbehebung

| Symptom | Ursache & Lösung |
|---|---|
| `search_eu_law` liefert `isError` mit Kauf-Hinweis | Kein `Authorization: Bearer`-Schlüssel gesendet. Freie Tools laufen ohne Schlüssel; die Suche wird abgerechnet — Schlüssel über https://conformi.eu/api/v1/openapi.json |
| `401 UNAUTHORIZED` bei der Suche | Schlüssel ungültig/widerrufen. Im conformi.eu-Konto prüfen (Konto → API-Schlüssel) |
| `403 PLAN_REQUIRED` / `TRIAL_LIMIT_REACHED` | Abo inaktiv oder das 50-Abfragen-Testkontingent aufgebraucht — Abo aktivieren |
| `404` für eine CELEX in `get_knowledge_article` | Für diesen Akt existiert noch kein kuratierter Report. Stattdessen `search_eu_law` nutzen — der gesamte Korpus ist durchsuchbar |
| Verbindung schlägt fehl | Der Server spricht nur Streamable HTTP (kein SSE). JSON-RPC per POST an https://conformi.eu/api/mcp; GET liefert bewusst 405 |
| Sonstiges | Issue eröffnen: https://github.com/conformi-eu/conformi-search-mcp/issues oder Mail an info@conformi.eu |

## Lizenz

Dieses Repository dokumentiert den öffentlichen Endpunkt. Der gehostete Dienst, sein Quellcode und
seine Datenprodukte sind proprietär und unterliegen den conformi.eu-Bedingungen — nur die Inhalte
dieses Repositories stehen unter der MIT-Lizenz.

## Über

Erstellt von [conformi.eu](https://conformi.eu) — EU-Compliance-Recherche mit prüfbaren Quellen.
