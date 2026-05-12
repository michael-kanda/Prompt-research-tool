# SEO · GEO Prompt Research Tool

GA4 & GSC Daten analysieren, Topic-Cluster identifizieren und Decision-Prompts für KI-Suche (ChatGPT, Perplexity, Gemini) generieren — server-side mit verstecktem API-Key.

> **Anwender-Anleitung:** siehe [`ANLEITUNG.md`](./ANLEITUNG.md)
> **Technische Doku** (dieses Dokument): Setup, Deployment, API-Spec

---

## Architektur

```
seo-geo-tool-vercel/
├── index.html          ← UI-Markup
├── style.css           ← Styling (WCAG-AA Farbkontrast)
├── app.js              ← Frontend-Logik
├── api/
│   └── generate.js     ← Serverless Function (Gemini / Anthropic Router)
├── images/
│   └── hexagon.webp    ← Favicon (selbst hinzufügen)
├── .env.example        ← Environment Variables Template
├── .gitignore
├── vercel.json         ← Cache-Header für /api/*
├── package.json
├── README.md           ← dieses Dokument
└── ANLEITUNG.md        ← Anwender-Anleitung (Endnutzer)
```

**Datenfluss:**

```
Browser ──→ /api/generate (eigene Vercel-Domain) ──→ Gemini ODER Anthropic
                  ↑
        x-app-password (optional)
```

Der Browser kennt die API-Keys nie — der Server entscheidet anhand des `provider`-Parameters, welcher Key verwendet wird.

---

## Setup

### 1. API-Keys besorgen

- **Gemini**: https://aistudio.google.com/apikey (kostenlos, großzügiges Free Tier — empfohlen)
- **Anthropic** (optional): https://console.anthropic.com/settings/keys

Mindestens einer ist nötig, wenn die KI-Generierung serverseitig laufen soll. Ohne beide funktioniert nur der „Manuell"-Modus (siehe Features).

### 2. Lokal testen

```bash
# Vercel CLI installieren (einmalig)
npm i -g vercel

# Repo klonen / Files entpacken
cd seo-geo-tool-vercel

# .env.local aus Template anlegen
cp .env.example .env.local
# → GEMINI_API_KEY eintragen

# Dev-Server starten (mit Hot-Reload + lokaler API-Route)
vercel dev
```

Öffnet auf `http://localhost:3000`. Die Function läuft unter `/api/generate`.

### 3. Auf Vercel deployen

**Option A — über Vercel CLI:**

```bash
vercel              # Preview-Deployment
vercel --prod       # Production-Deployment
```

Nach dem ersten Deploy ENV vars im Vercel Dashboard hinterlegen.

**Option B — über Git (empfohlen):**

1. Repo nach GitHub / GitLab / Bitbucket pushen
2. Auf https://vercel.com/new das Repo importieren
3. **Wichtig:** Im Import-Dialog Environment Variables eintragen:
   - `GEMINI_API_KEY` = `AIza…`
   - `ANTHROPIC_API_KEY` = `sk-ant-…` (optional)
   - `GEMINI_MAX_TOKENS` = `16000`
   - `APP_PASSWORD` = `…` (optional, siehe unten)
4. Deploy klicken

Bestehendes Projekt? Vercel Dashboard → Project → Settings → Environment Variables. Nach ENV-Änderungen Redeploy auslösen.

---

## Environment Variables

| Variable | Pflicht | Default | Zweck |
|---|---|---|---|
| `GEMINI_API_KEY` | * | – | Google Generative Language API Key |
| `GEMINI_MODEL` | nein | `gemini-2.5-flash` | `gemini-2.5-flash` \| `gemini-2.5-pro` \| `gemini-2.5-flash-lite` |
| `GEMINI_MAX_TOKENS` | nein | `16000` | Output-Token-Limit. Bei MAX_TOKENS-Fehlern erhöhen. |
| `GEMINI_THINKING_BUDGET` | nein | `0` | Thinking-Mode bei Gemini 2.5. `0` = deaktiviert (empfohlen für JSON-Output), `-1` = automatisch, `>0` = explizites Budget |
| `ANTHROPIC_API_KEY` | * | – | Anthropic API Key |
| `ANTHROPIC_MODEL` | nein | `claude-sonnet-4-6` | Anthropic Model-String |
| `ANTHROPIC_MAX_TOKENS` | nein | `8000` | Output-Token-Limit für Anthropic |
| `APP_PASSWORD` | nein | – | Wenn gesetzt: `/api/generate` nur mit korrektem `x-app-password` Header erreichbar |

\* Mindestens einer der beiden API-Keys ist nötig — je nachdem welcher Provider im UI gewählt wird.

### Hinweis zu `GEMINI_THINKING_BUDGET`

Gemini 2.5 hat einen internen Reasoning-Mode, der Tokens vor der eigentlichen Antwort verbraucht. Diese „Thinking-Tokens" zählen zum `maxOutputTokens`-Limit. Bei komplexen Prompts kann das gesamte Budget aufgefressen werden, bevor die JSON-Antwort beginnt → Truncation.

Für strukturierte JSON-Outputs (wie hier) ist `0` optimal: schneller, billiger, keine Truncation-Gefahr.

---

## Optional: Endpoint-Schutz

Standardmäßig ist `/api/generate` öffentlich erreichbar. Wer die URL kennt, kann Requests senden und damit deine API-Kosten verursachen. Drei Schutz-Optionen:

**1. App-Password (eingebaut, simpel)**
- `APP_PASSWORD=geheim` in Vercel ENV vars setzen
- Im Tool unter Tab 01 → „App-Password" eintragen (das Feld erscheint automatisch nur wenn ENV gesetzt)
- Browser sendet `x-app-password: geheim` mit jedem Request

**2. Vercel Password Protection (Pro-Plan)**
- Vercel Dashboard → Project → Settings → Deployment Protection
- Gesamtes Deployment hinter Login

**3. Vercel Authentication (Enterprise/Teams)**
- SSO via GitHub / Google / SAML

Für ein internes Tool reicht Option 1.

---

## API-Endpoint Spec

### `GET /api/generate` — Provider-Status

Liefert, welche API-Keys serverseitig konfiguriert sind. Wird vom Frontend beim Laden aufgerufen, um nicht-verfügbare Provider im Dropdown automatisch zu deaktivieren.

**Response (200):**

```json
{
  "gemini": true,
  "anthropic": false,
  "hasAppPassword": true
}
```

Keine Keys werden geleakt — nur Booleans.

### `POST /api/generate` — Prompt-Ausführung

**Request-Body:**

```json
{
  "provider": "gemini",
  "prompt": "Du bist ein SEO Experte …"
}
```

**Headers:**

- `Content-Type: application/json`
- `x-app-password: …` *(nur wenn `APP_PASSWORD` gesetzt)*

**Response (200):**

```json
{
  "text": "{\"anbieterVergleich\": [...], ...}",
  "provider": "gemini"
}
```

**Response (4xx/5xx):**

```json
{ "error": "Beschreibung des Fehlers" }
```

**Limits:**
- Prompt maximal 50 000 Zeichen
- `provider` muss `gemini` oder `anthropic` sein
- Output-Tokens via ENV vars konfigurierbar

---

## Features

- **Multi-Provider AI**: Gemini 2.5 (Flash/Pro/Flash-Lite) oder Anthropic Claude, server-side
- **Manueller Fallback-Modus**: Prompt-Kontext zum Kopieren wenn keine API verfügbar oder gewünscht — funktioniert ganz ohne Server-Konfiguration
- **Dynamisches Provider-Dropdown**: nicht-konfigurierte Provider werden automatisch als „— nicht konfiguriert" deaktiviert (über GET `/api/generate`)
- **GA4 + GSC Daten-Anbindung**: Direkter Fetch (Bearer / API-Key / Query-Param) oder JSON-Paste
- **Automatisches Daten-Parsing**: GA4 native Format, GSC native Format, flache Arrays — alles wird erkannt
- **Intent-Klassifizierung**: Transactional / Commercial / Informational / Navigational (DE-fokussierte Regex-Patterns)
- **Branded-Filter**: Brand wird aus Domain extrahiert, manuell überschreibbar; Branded-Queries werden aus Quick Wins ausgeschlossen
- **Topic-Clustering**: Greedy mit Jaccard-Similarity, DE-Stopwords entfernt — gruppiert ähnliche Queries für Content-Hub-Planung
- **Analyse-Dashboard**: Quick Wins (Pos. 5–20), Buy-Intent, 0-Conversion-Pages, Low-Engagement-Pages, Intent-Verteilung
- **AI-Prompt-Generierung**: 5 Kategorien (Anbieter-Vergleich, Validierung, Spezifikation, Preis, Action) + Top-8 Score-Ranking
- **CSV-Export**: Quick Wins und Prompts (mit BOM für Excel-Kompatibilität)
- **Copy-to-Clipboard**: pro Prompt mit Feedback-State
- **localStorage-Persistierung**: Form-State (Domain, API-URLs, App-Password, Provider) bleibt nach Reload
- **Demo-Daten**: Installateur-Szenario zum schnellen Testen ohne eigene Daten
- **WCAG-AA Kontrast**: Alle Texte mindestens 4.5:1 Kontrastverhältnis
- **Externe CSS/JS**: separat cachebar, keine inline-Styles
- **CSP-freundlich**: keine `onclick`-Attribute, alles via `data-*` und `addEventListener`

---

## Stack

- **Frontend**: Vanilla HTML / CSS / JavaScript — keine Build-Tools, keine Dependencies, keine Framework
- **Backend**: Vercel Serverless Function auf Node.js ≥ 18 (native `fetch`, keine externen Libs)
- **AI**: Google Gemini 2.5 (REST) oder Anthropic Claude (Messages API)
- **Hosting**: Vercel (Hobby-Tier ausreichend)

---

## Lizenz

Privat / proprietär. Anpassen je nach Use-Case.

---

Developed with ♥ by [Michael Kanda](https://designare.at)
