# SEO · GEO Prompt Research Tool

> **🇩🇪 Deutsch** | [🇬🇧 English](#english)

---

## 🇩🇪 Deutsch

### Überblick

Das **Prompt Research Tool** ist eine schlanke Web-Anwendung, die reale GA4- und GSC-Daten einliest, analysiert und daraus **Decision-Prompts** generiert — also jene Suchanfragen, die potenzielle Kunden kurz vor einer Kaufentscheidung in KI-Systeme wie ChatGPT, Perplexity oder Google Gemini eintippen.

Das Tool ist Teil eines größeren **SEO & GEO Content-Planner-Workflows** und deckt Phase 5 ab: *Decision-Prompts & Quick Wins*.

Die Anwendung läuft als **Static Site mit Vercel Serverless Function** — API-Keys liegen serverseitig in Environment Variables und sind im Browser unsichtbar.

---

### Architektur

```
seo-geo-tool-vercel/
├── index.html          ← UI (Vanilla HTML/CSS/JS, keine Dependencies)
├── api/
│   └── generate.js     ← Serverless Function (Gemini / Anthropic Router)
├── .env.example        ← Environment Variables Template
├── vercel.json         ← Caching-Config für /api/*
├── package.json
├── .gitignore
└── README.md
```

**Datenfluss:**

```
Browser ──→ /api/generate (eigene Vercel-Domain) ──→ Gemini ODER Anthropic
                  ↑
        x-app-password (optional)
```

Der Browser kennt die API-Keys nie — der Server entscheidet anhand des `provider`-Parameters, welcher Key verwendet wird.

---

### Features

- **Multi-Provider KI-Anbindung** — Google Gemini (2.5 Flash/Pro/Flash-Lite) oder Anthropic Claude, server-side über Vercel ENV vars
- **Manueller Fallback** — Prompt-Kontext kopieren und in beliebiger KI-Oberfläche einfügen
- **GA4 + GSC Daten-Anbindung** — Direkter Fetch (Bearer / API-Key / Query-Param) oder JSON Paste
- **Automatisches Daten-Parsing** — GA4 native Format, GSC native Format und flache Arrays werden erkannt
- **Intent-Klassifizierung** — Jede Query wird automatisch in vier Buckets eingeordnet: Transactional, Commercial, Informational, Navigational
- **Branded-Query-Filter** — Brand wird aus der Domain extrahiert (manuell überschreibbar); Branded-Queries werden aus Quick Wins ausgeschlossen
- **Topic-Clustering** — Greedy-Clustering mit Jaccard-Similarity, DE-Stopwords entfernt — gruppiert ähnliche Queries für Content-Hub-Planung
- **Analyse-Dashboard** mit:
  - Quick-Win-Kandidaten (Position 5–20 mit hoher Impressionen-Basis)
  - Transactional-Queries (Kauf-, Preis-, Termin-Keywords)
  - Seiten mit 0 Conversions trotz Traffic
  - Seiten mit niedrigem Engagement
  - Intent-Verteilung über das gesamte Keyword-Set
- **5 Prompt-Kategorien** — Anbieter-Vergleich, Validierung, Spezifikation, Preis/Kosten, Action/Kontakt
- **Quick-Win-Ranking** — Top-8 Prompts mit Score (0–100) und konkreten Maßnahmenempfehlungen
- **CSV-Export** — Quick Wins und generierte Prompts mit BOM für Excel-Kompatibilität
- **Copy-to-Clipboard** — pro Prompt mit Feedback-State
- **localStorage-Persistierung** — Form-State (Domain, API-URLs, App-Password) bleibt nach Reload erhalten
- **Demo-Daten** — Installateur-Szenario zum schnellen Testen
- **Optional: Endpoint-Passwort** — Schutz vor Drive-by-Missbrauch des öffentlichen API-Endpoints

---

### Voraussetzungen

| Anforderung | Details |
|---|---|
| **Hosting** | Vercel-Account (Hobby-Tier reicht) |
| **API-Key** | Mindestens einer: Google Gemini oder Anthropic Claude |
| **Runtime** | Node.js ≥ 18 (von Vercel automatisch bereitgestellt) |
| **GA4-Daten** | Landingpages, Sessions, Conversions, Engagement-Rate |
| **GSC-Daten** | Queries, Klicks, Impressionen, CTR, Position |

API-Keys erstellen:
- **Gemini** — https://aistudio.google.com/apikey (kostenlos, großzügiges Free Tier)
- **Anthropic** — https://console.anthropic.com/settings/keys

---

### Setup & Deployment

#### Lokale Entwicklung

```bash
# Vercel CLI installieren (einmalig)
npm i -g vercel

# Repository klonen oder ZIP entpacken
cd seo-geo-tool-vercel

# Environment Variables aus Template anlegen
cp .env.example .env.local
# → mindestens GEMINI_API_KEY oder ANTHROPIC_API_KEY eintragen

# Dev-Server starten (mit Hot-Reload für Frontend, lokaler API-Route)
vercel dev
```

Öffnet auf `http://localhost:3000`. Die Function läuft unter `/api/generate`.

#### Production-Deployment

**Option A — über die Vercel CLI:**

```bash
vercel              # Erstes Deployment als Preview
vercel --prod       # Production-Deployment
```

Nach dem ersten Deploy: Environment Variables im Vercel Dashboard hinterlegen (Settings → Environment Variables).

**Option B — über Git (empfohlen):**

1. Repository auf GitHub / GitLab / Bitbucket pushen
2. Auf https://vercel.com/new das Repo importieren
3. Im Import-Dialog die Environment Variables eintragen (siehe Tabelle unten)
4. Deploy klicken

Künftige Pushes auf den Main-Branch lösen automatisch ein neues Production-Deployment aus. Pushes auf andere Branches erzeugen Preview-Deployments.

---

### Environment Variables

| Variable | Pflicht | Default | Zweck |
|---|---|---|---|
| `GEMINI_API_KEY` | * | – | Google Generative Language API Key |
| `GEMINI_MODEL` | nein | `gemini-2.5-flash` | `gemini-2.5-flash` \| `gemini-2.5-pro` \| `gemini-2.5-flash-lite` |
| `ANTHROPIC_API_KEY` | * | – | Anthropic API Key |
| `ANTHROPIC_MODEL` | nein | `claude-sonnet-4-6` | Anthropic Model-String |
| `APP_PASSWORD` | nein | – | Wenn gesetzt: Endpoint nur mit korrektem `x-app-password` Header erreichbar |

\* Mindestens einer der beiden Keys ist nötig — je nachdem, welcher Provider im UI gewählt wird.

---

### API-Endpoint Spec

**`POST /api/generate`**

Request-Body:
```json
{
  "provider": "gemini",
  "prompt": "Du bist ein SEO Experte ..."
}
```

Headers:
- `Content-Type: application/json`
- `x-app-password: ...` *(nur wenn `APP_PASSWORD` gesetzt ist)*

Response — Erfolg (200):
```json
{
  "text": "{\"anbieterVergleich\": [...], ...}",
  "provider": "gemini"
}
```

Response — Fehler (4xx / 5xx):
```json
{ "error": "Beschreibung des Fehlers" }
```

Limits:
- Prompt maximal 50 000 Zeichen
- Provider muss `gemini` oder `anthropic` sein
- Output-Tokens: 8 000 (in beiden Providern)

---

### Endpoint-Schutz (optional aber empfohlen)

Standardmäßig ist `/api/generate` öffentlich erreichbar. Wer die URL kennt, kann Requests senden und damit deine API-Kosten verursachen. Drei Schutz-Optionen:

1. **App-Password (eingebaut, simpel)**
   - `APP_PASSWORD=geheim` als Vercel Environment Variable setzen
   - Im Tool unter Tab 01 → „App-Password" eintragen
   - Browser sendet automatisch `x-app-password` mit jedem Request

2. **Vercel Password Protection (Pro-Plan)**
   - Vercel Dashboard → Project → Settings → Deployment Protection
   - Gesamtes Deployment hinter Login

3. **Vercel Authentication (Enterprise / Teams)**
   - SSO via GitHub / Google / SAML

Für ein internes Tool reicht Option 1.

---

### Verwendete GA4-Felder

| Feld | Beschreibung |
|---|---|
| `page` / `landingPage` / `pagePath` | URL der Landingpage |
| `sessions` | Anzahl Sitzungen |
| `users` / `activeUsers` | Aktive Nutzer |
| `engagementRate` | Engagement-Rate (0–1 oder 0–100, wird automatisch normalisiert) |
| `avgEngagementTime` | Durchschn. Verweildauer in Sekunden |
| `conversions` / `keyEvents` | Anzahl Conversions / Schlüsselereignisse |
| `conversionRate` / `sessionConversionRate` | Conversion-Rate |

Das Tool erkennt automatisch GA4 native Format (`dimensionValues` / `metricValues`) sowie flache JSON-Objekte.

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

Das Google Search Console native Format (`keys[]`-Array) wird ebenfalls unterstützt. Intent und Branded-Status werden für jede Query automatisch berechnet.

---

### Workflow

```
01 Setup      →  Domain, Branche, Region, Brand, KI-Provider
02 Daten      →  GA4 + GSC laden (API-Fetch oder JSON Paste)
03 Analyse    →  Intent-Verteilung, Topic-Cluster, Quick Wins, Buy-Intent,
                 0-Conv-Seiten, Low-Engagement-Seiten
04 Prompts    →  KI-generierte Decision-Prompts + Top-8 Score-Ranking
```

Jeder Tab zeigt einen Fortschritts-Haken `✓`, sobald er abgeschlossen ist.

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

### Tech-Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript — keine Build-Tools, keine Dependencies
- **Backend:** Vercel Serverless Function auf Node.js ≥ 18 (native `fetch`, keine externen Libs)
- **KI:** Google Gemini 2.5 (REST) oder Anthropic Claude (Messages API)
- **Hosting:** Vercel (Hobby-Tier ausreichend)

---

### Lizenz

MIT — freie Nutzung, Anpassung und Weiterverteilung mit Namensnennung.

---
---

## 🇬🇧 English <a name="english"></a>

### Overview

The **Prompt Research Tool** is a lightweight web application that reads real GA4 and GSC data, analyzes it, and generates **Decision Prompts** — the queries potential customers type into AI systems like ChatGPT, Perplexity, or Google Gemini right before making a purchase decision.

This tool is part of a larger **SEO & GEO Content Planner workflow** and covers Phase 5: *Decision Prompts & Quick Wins*.

The application runs as a **static site with a Vercel Serverless Function** — API keys live server-side in environment variables and are never exposed to the browser.

---

### Architecture

```
seo-geo-tool-vercel/
├── index.html          ← UI (Vanilla HTML/CSS/JS, no dependencies)
├── api/
│   └── generate.js     ← Serverless Function (Gemini / Anthropic router)
├── .env.example        ← Environment Variables template
├── vercel.json         ← Caching config for /api/*
├── package.json
├── .gitignore
└── README.md
```

**Data flow:**

```
Browser ──→ /api/generate (your Vercel domain) ──→ Gemini OR Anthropic
                  ↑
        x-app-password (optional)
```

The browser never sees the API keys — the server picks the right one based on the `provider` parameter.

---

### Features

- **Multi-provider AI integration** — Google Gemini (2.5 Flash/Pro/Flash-Lite) or Anthropic Claude, server-side via Vercel ENV vars
- **Manual fallback** — Copy the prompt context and paste into any AI interface
- **GA4 + GSC data integration** — Direct fetch (Bearer / API key / query param) or JSON paste
- **Automatic data parsing** — Detects GA4 native format, GSC native format, and flat arrays
- **Intent classification** — Each query is automatically sorted into four buckets: Transactional, Commercial, Informational, Navigational
- **Branded-query filter** — Brand is extracted from the domain (manual override available); branded queries are excluded from Quick Wins
- **Topic clustering** — Greedy clustering with Jaccard similarity, DE/EN stopwords removed — groups similar queries for content-hub planning
- **Analysis dashboard** with:
  - Quick Win candidates (positions 5–20 with high impression base)
  - Transactional queries (purchase, price, appointment keywords)
  - Pages with 0 conversions despite traffic
  - Pages with low engagement
  - Intent distribution across the full keyword set
- **5 prompt categories** — Provider Comparison, Validation, Specification, Price/Cost, Action/Contact
- **Quick Win ranking** — Top 8 prompts with score (0–100) and concrete action recommendations
- **CSV export** — Quick Wins and generated prompts with BOM for Excel compatibility
- **Copy-to-clipboard** — Per prompt with feedback state
- **localStorage persistence** — Form state (domain, API URLs, app password) survives reloads
- **Demo data** — Plumber scenario for quick testing
- **Optional endpoint password** — Protection against drive-by abuse of the public API endpoint

---

### Requirements

| Requirement | Details |
|---|---|
| **Hosting** | Vercel account (Hobby tier sufficient) |
| **API Key** | At least one: Google Gemini or Anthropic Claude |
| **Runtime** | Node.js ≥ 18 (auto-provisioned by Vercel) |
| **GA4 data** | Landing pages, sessions, conversions, engagement rate |
| **GSC data** | Queries, clicks, impressions, CTR, position |

Get API keys:
- **Gemini** — https://aistudio.google.com/apikey (free, generous free tier)
- **Anthropic** — https://console.anthropic.com/settings/keys

---

### Setup & Deployment

#### Local development

```bash
# Install Vercel CLI (one-time)
npm i -g vercel

# Clone repo or unpack ZIP
cd seo-geo-tool-vercel

# Create env file from template
cp .env.example .env.local
# → set at least GEMINI_API_KEY or ANTHROPIC_API_KEY

# Start dev server (frontend hot-reload, local API route)
vercel dev
```

Opens at `http://localhost:3000`. The function runs at `/api/generate`.

#### Production deployment

**Option A — via Vercel CLI:**

```bash
vercel              # First deployment (preview)
vercel --prod       # Production deployment
```

After the first deploy: add environment variables in the Vercel Dashboard (Settings → Environment Variables).

**Option B — via Git (recommended):**

1. Push the repository to GitHub / GitLab / Bitbucket
2. Import the repo at https://vercel.com/new
3. Add the environment variables in the import dialog (see table below)
4. Click Deploy

Future pushes to the main branch trigger automatic production deployments. Pushes to other branches create preview deployments.

---

### Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | * | – | Google Generative Language API key |
| `GEMINI_MODEL` | no | `gemini-2.5-flash` | `gemini-2.5-flash` \| `gemini-2.5-pro` \| `gemini-2.5-flash-lite` |
| `ANTHROPIC_API_KEY` | * | – | Anthropic API key |
| `ANTHROPIC_MODEL` | no | `claude-sonnet-4-6` | Anthropic model string |
| `APP_PASSWORD` | no | – | If set, endpoint only accepts requests with matching `x-app-password` header |

\* At least one of the two keys is required, depending on which provider is selected in the UI.

---

### API Endpoint Spec

**`POST /api/generate`**

Request body:
```json
{
  "provider": "gemini",
  "prompt": "You are an SEO expert ..."
}
```

Headers:
- `Content-Type: application/json`
- `x-app-password: ...` *(only if `APP_PASSWORD` is set)*

Response — success (200):
```json
{
  "text": "{\"anbieterVergleich\": [...], ...}",
  "provider": "gemini"
}
```

Response — error (4xx / 5xx):
```json
{ "error": "Description of the error" }
```

Limits:
- Prompt max 50 000 characters
- Provider must be `gemini` or `anthropic`
- Output tokens: 8 000 (both providers)

---

### Endpoint protection (optional but recommended)

By default, `/api/generate` is publicly reachable. Anyone who knows the URL can send requests and rack up your API costs. Three protection options:

1. **App password (built-in, simple)**
   - Set `APP_PASSWORD=secret` as a Vercel environment variable
   - In the tool under Tab 01 → enter the password in "App-Password"
   - Browser automatically sends `x-app-password` with each request

2. **Vercel Password Protection (Pro plan)**
   - Vercel Dashboard → Project → Settings → Deployment Protection
   - Entire deployment behind login

3. **Vercel Authentication (Enterprise / Teams)**
   - SSO via GitHub / Google / SAML

Option 1 is sufficient for an internal tool.

---

### GA4 Fields Used

| Field | Description |
|---|---|
| `page` / `landingPage` / `pagePath` | Landing page URL |
| `sessions` | Session count |
| `users` / `activeUsers` | Active users |
| `engagementRate` | Engagement rate (0–1 or 0–100, auto-normalized) |
| `avgEngagementTime` | Avg. time on page in seconds |
| `conversions` / `keyEvents` | Conversion / key event count |
| `conversionRate` / `sessionConversionRate` | Conversion rate |

The tool auto-detects GA4 native format (`dimensionValues` / `metricValues`) as well as flat JSON objects.

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

Google Search Console native format (`keys[]` array) is also supported. Intent and branded status are computed automatically for each query.

---

### Workflow

```
01 Setup      →  Domain, industry, region, brand, AI provider
02 Data       →  Load GA4 + GSC (API fetch or JSON paste)
03 Analysis   →  Intent distribution, topic clusters, Quick Wins, buy intent,
                 0-conversion pages, low-engagement pages
04 Prompts    →  AI-generated decision prompts + Top 8 score ranking
```

Each tab shows a progress checkmark `✓` once completed.

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

### Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript — no build tools, no dependencies
- **Backend:** Vercel Serverless Function on Node.js ≥ 18 (native `fetch`, no external libs)
- **AI:** Google Gemini 2.5 (REST) or Anthropic Claude (Messages API)
- **Hosting:** Vercel (Hobby tier sufficient)

---

### License

MIT — free to use, modify, and redistribute with attribution.

---

Developed with ♥ by [Michael Kanda](https://designare.at)
