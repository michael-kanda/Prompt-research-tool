# SEO · GEO Prompt Research Tool

> **🇩🇪 Deutsch** | [🇬🇧 English](#english)

---

## 🇩🇪 Deutsch

### Überblick

Das **Prompt Research Tool** ist ein interaktives React-Artifact, das reale GA4- und GSC-Daten aus einem SEO-Dashboard einliest, analysiert und daraus **Decision-Prompts** generiert — also jene Suchanfragen, die potenzielle Kunden kurz vor einer Kaufentscheidung in KI-Systeme wie ChatGPT, Perplexity oder Google Gemini eintippen.

Das Tool ist Teil eines größeren **SEO & GEO Content-Planner-Workflows** und deckt Phase 5 ab: *Decision-Prompts & Quick Wins*.

---

### Features

- **API-Anbindung** — Direkter Fetch von GA4- und GSC-Daten über eigene Dashboard-API (Bearer Token, API Key Header, Query Parameter oder kein Auth)
- **JSON Paste Fallback** — Rohdaten einfach per Copy & Paste einfügen (kein CORS-Problem)
- **Automatisches Daten-Parsing** — Erkennt GA4 native Format, flache Arrays und benutzerdefinierte Strukturen
- **Analyse-Dashboard** mit:
  - Quick-Win-Kandidaten (Positionen 5–20 mit hohem Impressionenpotenzial)
  - Buy-Intent Queries (Kauf-, Preis-, Termin-Keywords)
  - Seiten mit 0 Conversions trotz Traffic
  - Seiten mit niedrigem Engagement
- **KI-gestützte Prompt-Generierung** via Anthropic Claude API auf Basis echter GSC-Daten
- **5 Prompt-Kategorien**: Anbieter-Vergleich, Validierung, Spezifikation, Preis/Kosten, Action/Kontakt
- **Quick-Win-Ranking** mit Score (0–100) und konkreten Maßnahmenempfehlungen

---

### Voraussetzungen

| Anforderung | Details |
|---|---|
| **Runtime** | Claude.ai Artifact oder React-Umgebung |
| **GA4-Daten** | Landingpages, Sessions, Conversions, Engagement-Rate |
| **GSC-Daten** | Queries, Klicks, Impressionen, CTR, Position |
| **Anthropic API** | Wird automatisch im Claude.ai Artifact-Kontext bereitgestellt |

---

### Verwendete GA4-Felder

| Feld | Beschreibung |
|---|---|
| `page` / `landingPage` / `pagePath` | URL der Landingpage |
| `sessions` | Anzahl Sitzungen |
| `users` / `activeUsers` | Aktive Nutzer |
| `engagementRate` | Engagement-Rate (0–1 oder 0–100) |
| `avgEngagementTime` | Durchschn. Verweildauer in Sekunden |
| `conversions` / `keyEvents` | Anzahl Conversions / Schlüsselereignisse |
| `conversionRate` / `sessionConversionRate` | Conversion-Rate |

> Das Tool erkennt automatisch GA4 native Format (`dimensionValues` / `metricValues`) sowie flache JSON-Objekte.

---

### Verwendete GSC-Felder

| Feld | Beschreibung |
|---|---|
| `query` / `keyword` | Suchanfrage |
| `page` / `url` | Zugehörige Seite (optional) |
| `clicks` | Klicks |
| `impressions` | Impressionen |
| `ctr` | Click-Through-Rate (0–1 oder 0–100, wird automatisch normalisiert) |
| `position` / `avgPosition` | Durchschn. Ranking-Position |

> Das Google Search Console native Format (`keys[]`-Array) wird ebenfalls unterstützt.

---

### Workflow

```
01 Setup     →  Domain, Branche, Region + Auth-Konfiguration
02 Daten     →  GA4 + GSC laden (API oder JSON Paste)
03 Analyse   →  Quick Wins, Buy-Intent, Optimierungskandidaten
04 Prompts   →  KI-generierte Decision-Prompts + Quick-Win-Ranking
```

---

### JSON-Beispielformate

**GA4 — flaches Array:**
```json
[
  {
    "page": "/leistungen/heizung",
    "sessions": 1240,
    "users": 980,
    "engagementRate": 0.67,
    "avgEngagementTime": 82,
    "conversions": 34,
    "conversionRate": 0.027
  }
]
```

**GA4 — Google native Format:**
```json
{
  "rows": [
    {
      "dimensionValues": [{ "value": "/leistungen/heizung" }],
      "metricValues": [
        { "value": "1240" },
        { "value": "980" },
        { "value": "0.67" },
        { "value": "82" },
        { "value": "34" },
        { "value": "0.027" }
      ]
    }
  ]
}
```

**GSC — flaches Array:**
```json
[
  {
    "query": "installateur wien notdienst",
    "clicks": 320,
    "impressions": 4200,
    "ctr": 7.6,
    "position": 3.2
  }
]
```

**GSC — Google native Format:**
```json
{
  "rows": [
    {
      "keys": ["installateur wien notdienst"],
      "clicks": 320,
      "impressions": 4200,
      "ctr": 0.076,
      "position": 3.2
    }
  ]
}
```

---

### Einbettung in eigene Projekte

Das Tool ist als **selbstständiges React-Artifact** konzipiert. Es kann direkt in Claude.ai verwendet oder in eine bestehende React-Anwendung integriert werden:

```bash
# Abhängigkeiten (falls außerhalb Claude.ai)
npm install react anthropic
```

Die Anthropic-API-Aufrufe laufen clientseitig über `/v1/messages`. Für den Produktionseinsatz außerhalb von Claude.ai empfiehlt sich ein serverseitiger Proxy, um den API-Key zu schützen.

---

### Lizenz

MIT — freie Nutzung, Anpassung und Weiterverteilung mit Namensnennung.

---
---

## 🇬🇧 English <a name="english"></a>

### Overview

The **Prompt Research Tool** is an interactive React artifact that reads real GA4 and GSC data from an SEO dashboard, analyzes it, and generates **Decision Prompts** — the queries potential customers type into AI systems like ChatGPT, Perplexity, or Google Gemini right before making a purchase decision.

This tool is part of a larger **SEO & GEO Content Planner workflow** and covers Phase 5: *Decision Prompts & Quick Wins*.

---

### Features

- **API Integration** — Direct fetch of GA4 and GSC data from your dashboard API (Bearer Token, API Key Header, Query Parameter, or no auth)
- **JSON Paste Fallback** — Paste raw data directly (no CORS issues)
- **Automatic Data Parsing** — Detects GA4 native format, flat arrays, and custom structures
- **Analysis Dashboard** with:
  - Quick Win candidates (positions 5–20 with high impression potential)
  - Buy-intent queries (purchase, price, appointment keywords)
  - Pages with 0 conversions despite traffic
  - Pages with low engagement
- **AI-powered Prompt Generation** via Anthropic Claude API based on real GSC data
- **5 Prompt Categories**: Provider Comparison, Validation, Specification, Price/Cost, Action/Contact
- **Quick Win Ranking** with score (0–100) and concrete action recommendations

---

### Requirements

| Requirement | Details |
|---|---|
| **Runtime** | Claude.ai Artifact or React environment |
| **GA4 Data** | Landing pages, sessions, conversions, engagement rate |
| **GSC Data** | Queries, clicks, impressions, CTR, position |
| **Anthropic API** | Automatically provided in the Claude.ai Artifact context |

---

### GA4 Fields Used

| Field | Description |
|---|---|
| `page` / `landingPage` / `pagePath` | Landing page URL |
| `sessions` | Session count |
| `users` / `activeUsers` | Active users |
| `engagementRate` | Engagement rate (0–1 or 0–100) |
| `avgEngagementTime` | Avg. time on page in seconds |
| `conversions` / `keyEvents` | Conversion / key event count |
| `conversionRate` / `sessionConversionRate` | Conversion rate |

> The tool auto-detects GA4 native format (`dimensionValues` / `metricValues`) as well as flat JSON objects.

---

### GSC Fields Used

| Field | Description |
|---|---|
| `query` / `keyword` | Search query |
| `page` / `url` | Associated page URL (optional) |
| `clicks` | Click count |
| `impressions` | Impression count |
| `ctr` | Click-through rate (0–1 or 0–100, auto-normalized) |
| `position` / `avgPosition` | Average ranking position |

> Google Search Console native format (`keys[]` array) is also supported.

---

### Workflow

```
01 Setup     →  Domain, industry, region + auth configuration
02 Data      →  Load GA4 + GSC (API or JSON paste)
03 Analysis  →  Quick wins, buy intent, optimization candidates
04 Prompts   →  AI-generated decision prompts + quick win ranking
```

---

### Example JSON Formats

**GA4 — flat array:**
```json
[
  {
    "page": "/services/heating",
    "sessions": 1240,
    "users": 980,
    "engagementRate": 0.67,
    "avgEngagementTime": 82,
    "conversions": 34,
    "conversionRate": 0.027
  }
]
```

**GSC — flat array:**
```json
[
  {
    "query": "plumber emergency london",
    "clicks": 320,
    "impressions": 4200,
    "ctr": 7.6,
    "position": 3.2
  }
]
```

**GSC — Google native format:**
```json
{
  "rows": [
    {
      "keys": ["plumber emergency london"],
      "clicks": 320,
      "impressions": 4200,
      "ctr": 0.076,
      "position": 3.2
    }
  ]
}
```

---

### Embedding in Your Own Projects

The tool is designed as a **standalone React artifact**. It can be used directly in Claude.ai or integrated into an existing React application:

```bash
# Dependencies (outside Claude.ai)
npm install react anthropic
```

Anthropic API calls run client-side via `/v1/messages`. For production use outside Claude.ai, a server-side proxy is recommended to protect the API key.

---

### License

MIT — free to use, modify, and redistribute with attribution.
