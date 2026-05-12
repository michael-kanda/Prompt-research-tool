# SEO · GEO Prompt Research Tool

GA4 & GSC Daten analysieren, Topic-Cluster identifizieren und Decision-Prompts für KI-Suche (ChatGPT, Perplexity, Gemini) generieren — server-side mit verstecktem API-Key.

## Architektur

```
seo-geo-tool-vercel/
├── index.html          ← UI (statisch von Vercel ausgeliefert)
├── api/
│   └── generate.js     ← Serverless Function, routet zu Gemini/Anthropic
├── .env.example        ← Environment Variables Template
├── .gitignore
├── vercel.json
├── package.json
└── README.md
```

Der Browser ruft nur `/api/generate` auf — die API-Keys verlassen den Server nie.

## Setup

### 1. API-Keys besorgen

- **Gemini**: https://aistudio.google.com/apikey (kostenlos, generöses Free Tier)
- **Anthropic** (optional): https://console.anthropic.com/settings/keys

### 2. Lokal testen

```bash
# Vercel CLI installieren (einmalig)
npm i -g vercel

# Repo klonen / Files entpacken
cd seo-geo-tool-vercel

# .env.local aus Template anlegen
cp .env.example .env.local
# → GEMINI_API_KEY eintragen

# Dev-Server starten
vercel dev
```

Öffnet auf `http://localhost:3000`. Die API läuft unter `/api/generate`.

### 3. Auf Vercel deployen

**Option A — über Vercel CLI:**
```bash
vercel              # Erstes Deployment (preview)
vercel --prod       # Production-Deployment
```

**Option B — über Git (empfohlen):**
1. Repo nach GitHub/GitLab pushen
2. Auf https://vercel.com/new das Repo importieren
3. **Wichtig**: Im Import-Dialog Environment Variables eintragen:
   - `GEMINI_API_KEY` = `AIza...`
   - `ANTHROPIC_API_KEY` = `sk-ant-...` (optional)
   - `APP_PASSWORD` = `...` (optional, siehe unten)
4. Deploy klicken — fertig

Bestehendes Projekt? Vercel Dashboard → Project → Settings → Environment Variables.

## Environment Variables

| Variable | Pflicht | Default | Zweck |
|---|---|---|---|
| `GEMINI_API_KEY` | ja* | – | Google Generative Language API Key |
| `GEMINI_MODEL` | nein | `gemini-2.5-flash` | `gemini-2.5-flash` \| `gemini-2.5-pro` \| `gemini-2.5-flash-lite` |
| `ANTHROPIC_API_KEY` | ja* | – | Anthropic API Key |
| `ANTHROPIC_MODEL` | nein | `claude-sonnet-4-6` | Anthropic Model String |
| `APP_PASSWORD` | nein | – | Wenn gesetzt: Endpoint nur mit `x-app-password` Header erreichbar |

\* Mindestens einer der beiden Keys ist nötig — je nachdem welcher Provider im UI gewählt wird.

## Optional: Endpoint-Schutz

Standardmäßig ist `/api/generate` öffentlich erreichbar. Wer die URL kennt, kann Requests senden und damit deine API-Kosten verursachen. Drei Schutz-Optionen:

**1. App-Password (eingebaut, simpel)**
- `APP_PASSWORD=geheim` in Vercel Env Vars setzen
- Im Tool unter Tab 01 → „App-Password" eintragen
- Der Browser sendet automatisch `x-app-password: geheim` mit jedem Request

**2. Vercel Password Protection (Pro-Plan)**
- Vercel Dashboard → Project → Settings → Deployment Protection
- Gesamtes Deployment hinter Login

**3. Vercel Authentication (Enterprise/Teams)**
- SSO via GitHub/Google/SAML

Für ein internes Tool reicht Option 1.

## API-Endpoint Spec

`POST /api/generate`

```json
{
  "provider": "gemini" | "anthropic",
  "prompt": "..."
}
```

Headers:
- `Content-Type: application/json`
- `x-app-password: ...` (nur wenn `APP_PASSWORD` gesetzt)

Response (200):
```json
{ "text": "...", "provider": "gemini" }
```

Response (4xx/5xx):
```json
{ "error": "..." }
```

## Features

- **GA4 + GSC Daten**: API-Fetch oder JSON-Paste
- **Intent-Klassifizierung**: Transactional / Commercial / Informational / Navigational
- **Branded-Filter**: Automatisch aus Domain extrahiert, manuell überschreibbar
- **Topic-Clustering**: Greedy mit Jaccard-Similarity, DE-Stopwords entfernt
- **Quick-Win-Analyse**: Position 5–20, mit Branded automatisch ausgeschlossen
- **AI-Prompt-Generierung**: 5 Kategorien + Top-8 Score-Ranking
- **CSV-Export**: Quick Wins und Prompts
- **localStorage**: Form-State bleibt nach Reload
- **Manueller Fallback**: Prompt-Kontext zum Kopieren wenn API nicht verfügbar

## Stack

- **Frontend**: Vanilla HTML/CSS/JS, keine Dependencies
- **Backend**: Vercel Serverless Function (Node 18+, nur fetch)
- **AI**: Google Gemini 2.5 oder Anthropic Claude

## Lizenz

Privat / proprietär. Anpassen je nach Use-Case.

---

Developed with ♥ by [Michael Kanda](https://designare.at)
