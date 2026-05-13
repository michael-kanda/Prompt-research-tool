# SEO · GEO Prompt Research Tool (v2)

GA4 & GSC Daten analysieren, Topic-Cluster identifizieren und Decision-Prompts für KI-Suche (ChatGPT, Perplexity, Gemini) generieren — server-side mit verstecktem API-Key.

> **Anwender-Anleitung:** siehe [`ANLEITUNG.md`](./ANLEITUNG.md)

---

## Was ist neu in v2

**Sicherheit:**
- Origin-Whitelist via `ALLOWED_ORIGINS` (statt offenem `*`)
- In-Memory-Rate-Limit pro IP, konfigurierbar via `RATE_LIMIT_PER_MIN`
- Timing-safe Password-Vergleich (`crypto.timingSafeEqual`)
- CSP-, X-Content-Type-Options-, Referrer-Policy- und Permissions-Policy-Header
- App-Password wird **nicht mehr im localStorage** persistiert
- Prompt-Injection-Defense: GSC-Daten werden als JSON-Block übermittelt, nicht als Freitext

**Analyse:**
- **Quick-Win-Ranking nach Hebel-Score**: erwarteter Klick-Zuwachs bei Positionsverbesserung statt nur Impressions
- **GA4↔GSC-Join**: jeder Quick-Win zeigt die zugeordnete Landingpage mit GA4-Metriken
- **Cluster-Topic-Tokens aggregiert** aus allen Member-Queries (vorher nur Seed)
- **Verbesserte Intent-Klassifikation** mit weniger False Positives (`vs.` matcht jetzt, `oder` enger gefasst)
- Token-Min-Länge von 3 auf 2 reduziert (relevant für `5g`, `ki`, `pv` etc.)

**Robustheit:**
- LLM-Antwort wird gegen JSON-Schema validiert
- Truncation-Handling für beide Provider vereinheitlicht
- Token-Usage im Response für Cost-Tracking
- Strukturiertes Logging mit Request-ID

**A11y:**
- Skip-Link, `aria-live` für Toast/Errors, `role="dialog"` Modal mit Focus-Trap
- ARIA-Tabs mit Pfeil-/Home-/End-Tastatur-Navigation
- Alle Labels via `for=…` korrekt assoziiert
- `:focus-visible` für Tastatur-Navigation
- `prefers-reduced-motion` respektiert

---

## Architektur

```
seo-geo-tool-vercel/
├── index.html          ← UI-Markup (ARIA, semantic)
├── style.css           ← Styling (WCAG-AA, focus-visible, reduced-motion)
├── app.js              ← Frontend-Logik (modular, validiert)
├── api/
│   └── generate.js     ← Serverless Function (Gemini / Anthropic Router)
├── images/
│   └── hexagon.webp    ← Favicon (selbst hinzufügen)
├── .env.example        ← Environment Variables Template
├── .gitignore
├── vercel.json         ← Cache-/Security-Header
├── package.json
└── README.md
```

**Datenfluss:**

```
Browser ──→ /api/generate (Vercel-Domain) ──→ Gemini ODER Anthropic
              ↑ Origin-Check
              ↑ Rate-Limit (per IP)
              ↑ x-app-password (timing-safe)
```

Der Browser kennt die API-Keys nie — der Server entscheidet anhand des `provider`-Parameters, welcher Key verwendet wird.

---

## Setup

### 1. API-Keys besorgen

- **Gemini**: https://aistudio.google.com/apikey (kostenlos, großzügiges Free Tier — empfohlen)
- **Anthropic** (optional): https://console.anthropic.com/settings/keys

Mindestens einer ist nötig für serverseitige KI-Generierung. Ohne beide → nur „Manuell"-Modus.

### 2. Lokal testen

```bash
npm i -g vercel               # einmalig
cd seo-geo-tool-vercel
cp .env.example .env.local    # GEMINI_API_KEY eintragen
vercel dev                    # → http://localhost:3000
```

### 3. Auf Vercel deployen

**Über Git (empfohlen):**

1. Repo nach GitHub / GitLab / Bitbucket pushen
2. https://vercel.com/new → Repo importieren
3. Environment Variables setzen (siehe Tabelle unten)
4. Deploy

**Nach dem Deploy unbedingt** `ALLOWED_ORIGINS` setzen — sonst ist der Endpoint offen für alle Origins.

---

## Environment Variables

| Variable | Pflicht | Default | Zweck |
|---|---|---|---|
| `GEMINI_API_KEY` | * | – | Google Generative Language API Key |
| `GEMINI_MODEL` | nein | `gemini-2.5-flash` | `gemini-2.5-flash` \| `gemini-2.5-pro` \| `gemini-2.5-flash-lite` |
| `GEMINI_MAX_TOKENS` | nein | `16000` | Output-Token-Limit |
| `GEMINI_THINKING_BUDGET` | nein | `0` | Thinking-Mode bei Gemini 2.5. `0` = aus (empfohlen für JSON) |
| `ANTHROPIC_API_KEY` | * | – | Anthropic API Key |
| `ANTHROPIC_MODEL` | nein | `claude-sonnet-4-6` | Anthropic Model-String |
| `ANTHROPIC_MAX_TOKENS` | nein | `8000` | Output-Token-Limit für Anthropic |
| `APP_PASSWORD` | nein | – | Endpoint-Schutz via `x-app-password` Header |
| `ALLOWED_ORIGINS` | **empfohlen** | – | Komma-separierte Liste erlaubter Origins (`https://app1.at,https://app2.at`). Leer = offen für alle. |
| `RATE_LIMIT_PER_MIN` | nein | `10` | Max. Requests pro IP pro Minute |

\* Mindestens einer der beiden API-Keys ist nötig.

### Hinweis: Rate-Limit-Persistenz

Das eingebaute Rate-Limit ist **In-Memory** — bei Vercel-Cold-Starts wird der Bucket neu initialisiert. Für hohen Traffic / strenge Garantien: Upstash Redis oder Vercel KV einbauen (drop-in im `checkRateLimit`).

---

## Optional: Endpoint-Schutz im Detail

Standardmäßig ist `/api/generate` öffentlich erreichbar. Drei Schutz-Ebenen:

**1. Origin-Whitelist (Pflicht in Production)**
- `ALLOWED_ORIGINS=https://meine-domain.at` in Vercel ENV
- Browser von anderen Origins werden via CORS geblockt

**2. App-Password**
- `APP_PASSWORD=geheim` in Vercel ENV
- Frontend zeigt Password-Feld automatisch (über GET-Status-Check)
- Vergleich timing-safe via `crypto.timingSafeEqual`

**3. Rate-Limit**
- `RATE_LIMIT_PER_MIN=10` (Standard)
- 429 Retry-After bei Überschreitung

Alle drei sind kombinierbar und decken die meisten Missbrauchsszenarien ab.

---

## API-Endpoint Spec

### `GET /api/generate` — Provider-Status

```json
{ "gemini": true, "anthropic": false, "hasAppPassword": true }
```

### `POST /api/generate` — Prompt-Ausführung

**Request:**

```http
POST /api/generate
Content-Type: application/json
x-app-password: …       (optional)
Origin: https://…       (muss in ALLOWED_ORIGINS sein)

{ "provider": "gemini", "prompt": "Du bist SEO Experte …" }
```

**Response (200):**

```json
{
  "text": "{\"anbieterVergleich\": [...], ...}",
  "provider": "gemini",
  "usage": { "input": 1240, "output": 3120, "thoughts": 0 },
  "truncated": false
}
```

**Response (4xx/5xx):**

```json
{ "error": "Beschreibung des Fehlers" }
```

Status-Codes:
- `400` — fehlender / ungültiger Prompt oder Provider
- `401` — falsches App-Password
- `405` — Method not allowed
- `429` — Rate-Limit überschritten (`Retry-After` Header)
- `500` — Provider-API-Fehler

**Limits:**
- Prompt ≤ 50 000 Zeichen
- `provider` ∈ {`gemini`, `anthropic`}

---

## Features

- **Multi-Provider AI**: Gemini 2.5 (Flash/Pro/Flash-Lite) oder Anthropic Claude — server-side
- **Manueller Fallback**: Prompt-Kontext kopieren, funktioniert ohne Server-Konfig
- **Dynamisches Provider-Dropdown**: nicht-konfigurierte Provider werden deaktiviert
- **GA4 + GSC**: API-Fetch (Bearer / API-Key / Query-Param) oder JSON-Paste
- **Auto-Parsing**: GA4 native, GSC native, flache Arrays — alles wird erkannt
- **Intent-Klassifizierung**: Transactional / Commercial / Informational / Navigational (DE)
- **Branded-Filter**: aus Domain extrahiert, manuell überschreibbar
- **Topic-Clustering**: Jaccard-Similarity, DE-Stopwords, aggregierte Topic-Tokens
- **Quick-Win-Hebel-Score**: erwarteter Klick-Zuwachs bei Positionsverbesserung
- **GA4↔GSC-Join**: Quick-Win-Query → konkrete Landingpage mit Engagement-Daten
- **AI-Prompt-Generierung**: 5 Kategorien + Top-8 Score-Ranking, JSON-Schema-validiert
- **CSV-Export**: Quick Wins (mit Hebel-Score + Landingpage) und Prompts
- **localStorage-Persistierung**: Form-State (Domain, URLs, Provider) — **nicht** App-Password
- **Demo-Daten**: Installateur-Szenario zum schnellen Testen
- **WCAG-AA Kontrast**: alle Texte ≥ 4.5:1
- **Vollständige A11y**: ARIA-Tabs, Focus-Trap, Skip-Link, `prefers-reduced-motion`
- **CSP-freundlich**: keine inline-Scripts/onclick, alles via `addEventListener`

---

## Stack

- **Frontend**: Vanilla HTML/CSS/JS — keine Build-Tools, keine Dependencies
- **Backend**: Vercel Serverless Function auf Node.js ≥ 18 (native `fetch` + `crypto`)
- **AI**: Google Gemini 2.5 (REST) oder Anthropic Claude (Messages API)
- **Hosting**: Vercel (Hobby-Tier ausreichend)

---

## Migration v1 → v2

Im Setup:
1. `ALLOWED_ORIGINS` ENV setzen (sonst öffentlicher Endpoint)
2. Optional `RATE_LIMIT_PER_MIN` anpassen
3. localStorage-Key wechselt von `seo-geo-tool-vercel-v1` auf `…-v2` → User müssen ggf. einmal Setup-Felder neu eintragen

Im Frontend gibt es API-kompatible Erweiterungen — bestehende Integrationen brechen nicht.

---

## Lizenz

Privat / proprietär.

---

Developed with ♥ by [Michael Kanda](https://designare.at)
