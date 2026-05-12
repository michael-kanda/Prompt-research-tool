import { useState, useCallback } from "react";

const COLORS = {
  bg: "#0c0e14",
  surface: "#13161f",
  surfaceHover: "#1a1e2a",
  border: "#232736",
  borderHover: "#2e3347",
  accent: "#00c9a7",
  accentDim: "#00c9a720",
  amber: "#f59e0b",
  amberDim: "#f59e0b20",
  red: "#ef4444",
  redDim: "#ef444420",
  blue: "#3b82f6",
  blueDim: "#3b82f620",
  text: "#e2e8f0",
  textMuted: "#6b7280",
  textDim: "#9ca3af",
};

const style = {
  app: {
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    background: COLORS.bg,
    minHeight: "100vh",
    color: COLORS.text,
    padding: "0",
  },
  header: {
    background: COLORS.surface,
    borderBottom: `1px solid ${COLORS.border}`,
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logo: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "3px",
    color: COLORS.accent,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.text,
  },
  tabs: {
    display: "flex",
    gap: "2px",
    padding: "12px 24px 0",
    background: COLORS.surface,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tab: (active) => ({
    padding: "8px 16px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1px",
    textTransform: "uppercase",
    background: active ? COLORS.bg : "transparent",
    color: active ? COLORS.accent : COLORS.textMuted,
    border: active ? `1px solid ${COLORS.border}` : "1px solid transparent",
    borderBottom: active ? `1px solid ${COLORS.bg}` : "none",
    borderRadius: "4px 4px 0 0",
    cursor: "pointer",
    position: "relative",
    bottom: "-1px",
    transition: "all 0.15s",
  }),
  content: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: COLORS.accent,
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  label: {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: COLORS.textMuted,
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "4px",
    padding: "8px 12px",
    color: COLORS.text,
    fontSize: "12px",
    fontFamily: "'IBM Plex Mono', monospace",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s",
  },
  textarea: {
    width: "100%",
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "4px",
    padding: "10px 12px",
    color: COLORS.text,
    fontSize: "11px",
    fontFamily: "'IBM Plex Mono', monospace",
    resize: "vertical",
    minHeight: "100px",
    boxSizing: "border-box",
    outline: "none",
  },
  select: {
    width: "100%",
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "4px",
    padding: "8px 12px",
    color: COLORS.text,
    fontSize: "12px",
    fontFamily: "'IBM Plex Mono', monospace",
    outline: "none",
  },
  btn: (variant = "primary") => ({
    padding: "8px 16px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.15s",
    background:
      variant === "primary" ? COLORS.accent
      : variant === "amber" ? COLORS.amber
      : variant === "ghost" ? "transparent"
      : COLORS.surface,
    color:
      variant === "primary" ? "#0c0e14"
      : variant === "amber" ? "#0c0e14"
      : COLORS.text,
    border: variant === "ghost" ? `1px solid ${COLORS.border}` : "none",
  }),
  tag: (color = "accent") => ({
    display: "inline-block",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
    borderRadius: "3px",
    background: color === "accent" ? COLORS.accentDim : color === "amber" ? COLORS.amberDim : color === "red" ? COLORS.redDim : COLORS.blueDim,
    color: color === "accent" ? COLORS.accent : color === "amber" ? COLORS.amber : color === "red" ? COLORS.red : COLORS.blue,
  }),
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px",
  },
  th: {
    padding: "8px 10px",
    textAlign: "left",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: COLORS.textMuted,
    borderBottom: `1px solid ${COLORS.border}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "7px 10px",
    borderBottom: `1px solid ${COLORS.border}20`,
    verticalAlign: "middle",
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  stat: {
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    padding: "14px 16px",
    textAlign: "center",
  },
  statNum: {
    fontSize: "22px",
    fontWeight: "700",
    color: COLORS.accent,
    lineHeight: "1.2",
  },
  statLabel: {
    fontSize: "10px",
    color: COLORS.textMuted,
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginTop: "4px",
  },
  error: {
    background: COLORS.redDim,
    border: `1px solid ${COLORS.red}40`,
    borderRadius: "6px",
    padding: "12px 16px",
    color: COLORS.red,
    fontSize: "12px",
    marginBottom: "16px",
  },
  badge: (pos) => ({
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: "3px",
    fontSize: "11px",
    fontWeight: "700",
    background: pos <= 3 ? "#22c55e20" : pos <= 10 ? COLORS.accentDim : pos <= 20 ? COLORS.amberDim : COLORS.redDim,
    color: pos <= 3 ? "#22c55e" : pos <= 10 ? COLORS.accent : pos <= 20 ? COLORS.amber : COLORS.red,
  }),
  promptCard: (cat) => ({
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderLeft: `3px solid ${cat === 0 ? COLORS.accent : cat === 1 ? "#3b82f6" : cat === 2 ? "#8b5cf6" : cat === 3 ? COLORS.amber : "#ec4899"}`,
    borderRadius: "4px",
    padding: "10px 14px",
    marginBottom: "8px",
    fontSize: "12px",
    color: COLORS.textDim,
  }),
  hint: {
    background: COLORS.accentDim,
    border: `1px solid ${COLORS.accent}30`,
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "11px",
    color: COLORS.accent,
    marginBottom: "16px",
  },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function parseGA4(data) {
  let rows = [];
  if (Array.isArray(data)) rows = data;
  else if (data.rows) rows = data.rows;
  else if (data.data) rows = data.data;
  else if (data.landingPages) rows = data.landingPages;
  else if (data.result) rows = data.result;

  return rows.map((row) => {
    // handle GA4 native "dimensionValues/metricValues" format
    if (row.dimensionValues && row.metricValues) {
      const dims = row.dimensionValues.map((d) => d.value);
      const mets = row.metricValues.map((m) => parseFloat(m.value) || 0);
      return {
        page: dims[0] || "",
        sessions: mets[0] || 0,
        users: mets[1] || 0,
        engagementRate: mets[2] || 0,
        avgEngTime: mets[3] || 0,
        conversions: mets[4] || 0,
        convRate: mets[5] || 0,
      };
    }
    return {
      page: row.page || row.landingPage || row.pagePath || row.url || row.landing_page || String(Object.values(row)[0] || ""),
      sessions: parseInt(row.sessions || row.ga_sessions || 0),
      users: parseInt(row.users || row.activeUsers || row.active_users || 0),
      engagementRate: parseFloat(row.engagementRate || row.engagement_rate || 0),
      avgEngTime: parseFloat(row.avgEngagementTime || row.avg_engagement_time || row.averageEngagementTime || 0),
      conversions: parseInt(row.conversions || row.keyEvents || row.key_events || row.goals || 0),
      convRate: parseFloat(row.conversionRate || row.sessionConversionRate || row.conversion_rate || 0),
    };
  }).filter((r) => r.page && r.page !== "(not set)");
}

function parseGSC(data) {
  let rows = [];
  if (Array.isArray(data)) rows = data;
  else if (data.rows) rows = data.rows;
  else if (data.data) rows = data.data;
  else if (data.queries) rows = data.queries;
  else if (data.result) rows = data.result;

  return rows.map((row) => {
    if (row.keys) {
      return {
        query: row.keys[0] || "",
        page: row.keys[1] || "",
        clicks: parseInt(row.clicks || 0),
        impressions: parseInt(row.impressions || 0),
        ctr: parseFloat(row.ctr || 0) * (parseFloat(row.ctr) < 1 ? 100 : 1),
        position: parseFloat(row.position || 0),
      };
    }
    return {
      query: row.query || row.keyword || String(Object.values(row)[0] || ""),
      page: row.page || row.url || row.landing_page || "",
      clicks: parseInt(row.clicks || 0),
      impressions: parseInt(row.impressions || 0),
      ctr: parseFloat(row.ctr || row.click_through_rate || 0),
      position: parseFloat(row.position || row.avg_position || row.avgPosition || 0),
    };
  }).filter((r) => r.query && r.query !== "(not set)");
}

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return "–";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(Math.round(n));
}

function fmtPct(n) {
  if (n === undefined || isNaN(n)) return "–";
  const v = parseFloat(n);
  return (v > 1 ? v : v * 100).toFixed(1) + "%";
}

function truncate(str, n = 45) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatRow({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: "12px", marginBottom: "20px" }}>
      {items.map((s) => (
        <div key={s.label} style={style.stat}>
          <div style={style.statNum}>{s.value}</div>
          <div style={style.statLabel}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function PromptResearchTool() {
  const [tab, setTab] = useState("setup");
  const [authMethod, setAuthMethod] = useState("none");
  const [authValue, setAuthValue] = useState("");
  const [ga4Url, setGa4Url] = useState("");
  const [gscUrl, setGscUrl] = useState("");
  const [ga4Json, setGa4Json] = useState("");
  const [gscJson, setGscJson] = useState("");
  const [ga4Data, setGa4Data] = useState(null);
  const [gscData, setGscData] = useState(null);
  const [loading, setLoading] = useState({ ga4: false, gsc: false });
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [prompts, setPrompts] = useState(null);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [branche, setBranche] = useState("");
  const [region, setRegion] = useState("Wien");
  const [inputMode, setInputMode] = useState("api"); // api | json

  const buildHeaders = useCallback(() => {
    const h = { "Content-Type": "application/json" };
    if (authMethod === "bearer") h["Authorization"] = `Bearer ${authValue}`;
    if (authMethod === "apikey") h["X-API-Key"] = authValue;
    return h;
  }, [authMethod, authValue]);

  const fetchData = async (type) => {
    const url = type === "ga4" ? ga4Url : gscUrl;
    if (!url) { setError("Bitte API-URL eingeben."); return; }
    setLoading((p) => ({ ...p, [type]: true }));
    setError("");
    try {
      let fetchUrl = url;
      if (authMethod === "queryparam") fetchUrl += (url.includes("?") ? "&" : "?") + `api_key=${authValue}`;
      const res = await fetch(fetchUrl, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
      const raw = await res.json();
      if (type === "ga4") setGa4Data(parseGA4(raw));
      else setGscData(parseGSC(raw));
    } catch (e) {
      setError(`${type.toUpperCase()} Fehler: ${e.message}. Tipp: CORS-Fehler? → JSON-Paste nutzen.`);
    }
    setLoading((p) => ({ ...p, [type]: false }));
  };

  const loadJson = (type) => {
    setError("");
    try {
      const raw = JSON.parse(type === "ga4" ? ga4Json : gscJson);
      if (type === "ga4") setGa4Data(parseGA4(raw));
      else setGscData(parseGSC(raw));
    } catch (e) {
      setError(`JSON-Fehler (${type.toUpperCase()}): ${e.message}`);
    }
  };

  const runAnalysis = () => {
    if (!ga4Data || !gscData) { setError("Beide Datensätze (GA4 + GSC) müssen geladen sein."); return; }
    const quickWins = gscData
      .filter((r) => r.position >= 5 && r.position <= 20 && r.impressions >= 30)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 25);

    const topPages = [...ga4Data].sort((a, b) => b.sessions - a.sessions).slice(0, 15);
    const lowEng = ga4Data.filter((r) => r.sessions > 20 && r.engagementRate > 0 && r.engagementRate < 0.45).sort((a, b) => b.sessions - a.sessions).slice(0, 10);
    const noConv = ga4Data.filter((r) => r.sessions > 30 && r.conversions === 0).sort((a, b) => b.sessions - a.sessions).slice(0, 10);
    const buyIntent = gscData.filter((r) =>
      /kauf|preis|kosten|anfrag|termin|kontakt|beste|empfehl|vergleich|buchen|bestell|günstig|angebot/i.test(r.query)
    ).sort((a, b) => b.clicks - a.clicks).slice(0, 15);

    setAnalysis({ quickWins, topPages, lowEng, noConv, buyIntent });
    setTab("analyse");
  };

  const generatePrompts = async () => {
    if (!analysis) return;
    setPromptsLoading(true);
    setError("");

    const topQ = (gscData || []).slice(0, 40).map((r) => `${r.query} (${r.clicks} Klicks, Pos.${Math.round(r.position * 10) / 10})`).join("\n");
    const qwList = analysis.quickWins.slice(0, 12).map((r) => `${r.query} (Pos.${Math.round(r.position * 10) / 10}, ${r.impressions} Imp.)`).join("\n");
    const buyList = analysis.buyIntent.map((r) => r.query).join(", ");

    const systemPrompt = `Du bist ein SEO & GEO Experte für den DACH-Raum. Analysiere reale GSC-Daten und generiere Decision-Prompts – also Suchanfragen die Endkunden kurz vor einer Kaufentscheidung in KI-Systeme wie ChatGPT oder Perplexity eintippen. Antworte NUR als valides JSON, kein Markdown, keine Erklärungen.`;

    const userPrompt = `**Domain/Unternehmen:** ${domain || "unbekannt"}
**Branche:** ${branche || "unbekannt"}
**Region:** ${region || "Österreich"}

**Reale GSC-Suchanfragen (Top 40):**
${topQ}

**Quick-Win-Kandidaten Pos. 5–20:**
${qwList}

**Kaufintent-Queries erkannt:**
${buyList}

Generiere Decision-Prompts basierend auf den REALEN GSC-Queries. Passe Sprache und Formulierung der jeweiligen Branche an.

JSON-Format:
{
  "anbieterVergleich": [{"prompt": "...", "basis": "..."}],
  "validierung": [{"prompt": "...", "basis": "..."}],
  "spezifikation": [{"prompt": "...", "basis": "..."}],
  "preis": [{"prompt": "...", "basis": "..."}],
  "action": [{"prompt": "...", "basis": "..."}],
  "quickWinPrompts": [
    {"prompt": "...", "kategorie": "...", "gscQuery": "...", "massnahme": "...", "score": 0}
  ]
}

Jeweils 3–4 Einträge pro Kategorie. quickWinPrompts: die Top 8 Prompts mit höchstem Quick-Win-Potenzial, score 0–100.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((c) => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setPrompts(JSON.parse(clean));
      setTab("prompts");
    } catch (e) {
      setError(`Prompt-Generierung fehlgeschlagen: ${e.message}`);
    }
    setPromptsLoading(false);
  };

  const TABS = [
    { id: "setup", label: "01 Setup" },
    { id: "daten", label: "02 Daten" },
    { id: "analyse", label: "03 Analyse" },
    { id: "prompts", label: "04 Prompts" },
  ];

  const catMeta = [
    { key: "anbieterVergleich", label: "Anbieter-Vergleich", color: 0, icon: "⚖" },
    { key: "validierung", label: "Validierung", color: 1, icon: "✓" },
    { key: "spezifikation", label: "Spezifikation", color: 2, icon: "◈" },
    { key: "preis", label: "Preis / Kosten", color: 3, icon: "€" },
    { key: "action", label: "Action / Kontakt", color: 4, icon: "→" },
  ];

  const catColors = [COLORS.accent, "#3b82f6", "#8b5cf6", COLORS.amber, "#ec4899"];

  return (
    <div style={style.app}>
      {/* Header */}
      <div style={style.header}>
        <span style={style.logo}>SEO ∙ GEO</span>
        <span style={{ color: COLORS.border, fontSize: "16px" }}>|</span>
        <span style={style.headerTitle}>Prompt Research Tool</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          {ga4Data && <span style={style.tag("accent")}>GA4 ✓ {ga4Data.length} Zeilen</span>}
          {gscData && <span style={style.tag("blue")}>GSC ✓ {gscData.length} Zeilen</span>}
        </span>
      </div>

      {/* Tabs */}
      <div style={style.tabs}>
        {TABS.map((t) => (
          <button key={t.id} style={style.tab(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={style.content}>
        {error && <div style={style.error}>⚠ {error}</div>}

        {/* ── TAB: SETUP ── */}
        {tab === "setup" && (
          <>
            <div style={style.card}>
              <div style={style.cardTitle}>◈ Projekt-Info</div>
              <div style={style.grid2}>
                <div>
                  <label style={style.label}>Domain / Unternehmen</label>
                  <input style={style.input} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="z.B. meinefirma.at" />
                </div>
                <div>
                  <label style={style.label}>Branche</label>
                  <input style={style.input} value={branche} onChange={(e) => setBranche(e.target.value)} placeholder="z.B. Rechtsanwalt, Installateur, Agentur" />
                </div>
                <div>
                  <label style={style.label}>Region</label>
                  <input style={style.input} value={region} onChange={(e) => setRegion(e.target.value)} placeholder="z.B. Wien, Niederösterreich, DACH" />
                </div>
              </div>
            </div>

            <div style={style.card}>
              <div style={style.cardTitle}>⚙ Authentifizierung</div>
              <div style={{ ...style.grid2, marginBottom: "16px" }}>
                <div>
                  <label style={style.label}>Methode</label>
                  <select style={style.select} value={authMethod} onChange={(e) => setAuthMethod(e.target.value)}>
                    <option value="none">Kein Auth</option>
                    <option value="bearer">Bearer Token (Authorization Header)</option>
                    <option value="apikey">API Key (X-API-Key Header)</option>
                    <option value="queryparam">API Key (Query Parameter)</option>
                  </select>
                </div>
                {authMethod !== "none" && (
                  <div>
                    <label style={style.label}>Token / Key</label>
                    <input style={style.input} type="password" value={authValue} onChange={(e) => setAuthValue(e.target.value)} placeholder="Token oder API Key" />
                  </div>
                )}
              </div>
              <div style={style.hint}>
                ⓘ Wenn die Auth-Methode unklar ist: einfach alle Varianten testen. Bei CORS-Fehlern → Tab "02 Daten" → JSON Paste nutzen.
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button style={style.btn("primary")} onClick={() => setTab("daten")}>
                  Weiter → Daten laden
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── TAB: DATEN ── */}
        {tab === "daten" && (
          <>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button style={style.btn(inputMode === "api" ? "primary" : "ghost")} onClick={() => setInputMode("api")}>API-Fetch</button>
              <button style={style.btn(inputMode === "json" ? "primary" : "ghost")} onClick={() => setInputMode("json")}>JSON Paste</button>
            </div>

            {/* GA4 */}
            <div style={style.card}>
              <div style={style.cardTitle}>
                <span style={{ color: "#4ade80" }}>▲</span> GA4 — Landingpages
                {ga4Data && <span style={{ ...style.tag("accent"), marginLeft: "auto" }}>✓ {ga4Data.length} Rows</span>}
              </div>

              {inputMode === "api" ? (
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={style.label}>API Endpoint URL</label>
                    <input style={style.input} value={ga4Url} onChange={(e) => setGa4Url(e.target.value)} placeholder="https://dein-dashboard.at/api/ga4/landingpages" />
                  </div>
                  <button style={style.btn("primary")} onClick={() => fetchData("ga4")} disabled={loading.ga4}>
                    {loading.ga4 ? "Lädt…" : "Fetch GA4"}
                  </button>
                </div>
              ) : (
                <>
                  <label style={style.label}>GA4 JSON einfügen</label>
                  <textarea style={style.textarea} value={ga4Json} onChange={(e) => setGa4Json(e.target.value)}
                    placeholder={'[\n  {"page": "/leistungen", "sessions": 1200, "conversions": 45, "engagementRate": 0.68},\n  ...\n]'} rows={6} />
                  <button style={{ ...style.btn("primary"), marginTop: "10px" }} onClick={() => loadJson("ga4")}>
                    GA4 laden
                  </button>
                </>
              )}

              {/* Preview */}
              {ga4Data && ga4Data.length > 0 && (
                <div style={{ marginTop: "16px", overflowX: "auto" }}>
                  <table style={style.table}>
                    <thead>
                      <tr>
                        <th style={style.th}>Seite</th>
                        <th style={style.th}>Sessions</th>
                        <th style={style.th}>Engagement</th>
                        <th style={style.th}>Conversions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ga4Data.slice(0, 8).map((r, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                          <td style={{ ...style.td, color: COLORS.textDim }}>{truncate(r.page, 50)}</td>
                          <td style={style.td}>{fmt(r.sessions)}</td>
                          <td style={style.td}>{fmtPct(r.engagementRate > 1 ? r.engagementRate / 100 : r.engagementRate)}</td>
                          <td style={style.td}>{r.conversions > 0 ? <span style={style.tag("accent")}>{r.conversions}</span> : <span style={{ color: COLORS.textMuted }}>0</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ga4Data.length > 8 && <div style={{ fontSize: "10px", color: COLORS.textMuted, marginTop: "8px" }}>… und {ga4Data.length - 8} weitere Zeilen</div>}
                </div>
              )}
            </div>

            {/* GSC */}
            <div style={style.card}>
              <div style={style.cardTitle}>
                <span style={{ color: "#3b82f6" }}>◈</span> GSC — Suchanfragen
                {gscData && <span style={{ ...style.tag("blue"), marginLeft: "auto" }}>✓ {gscData.length} Rows</span>}
              </div>

              {inputMode === "api" ? (
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={style.label}>API Endpoint URL</label>
                    <input style={style.input} value={gscUrl} onChange={(e) => setGscUrl(e.target.value)} placeholder="https://dein-dashboard.at/api/gsc/queries" />
                  </div>
                  <button style={style.btn("primary")} onClick={() => fetchData("gsc")} disabled={loading.gsc}>
                    {loading.gsc ? "Lädt…" : "Fetch GSC"}
                  </button>
                </div>
              ) : (
                <>
                  <label style={style.label}>GSC JSON einfügen</label>
                  <textarea style={style.textarea} value={gscJson} onChange={(e) => setGscJson(e.target.value)}
                    placeholder={'[\n  {"query": "installateur wien", "clicks": 320, "impressions": 4200, "ctr": 7.6, "position": 3.2},\n  ...\n]'} rows={6} />
                  <button style={{ ...style.btn("primary"), marginTop: "10px" }} onClick={() => loadJson("gsc")}>
                    GSC laden
                  </button>
                </>
              )}

              {/* Preview */}
              {gscData && gscData.length > 0 && (
                <div style={{ marginTop: "16px", overflowX: "auto" }}>
                  <table style={style.table}>
                    <thead>
                      <tr>
                        <th style={style.th}>Query</th>
                        <th style={style.th}>Klicks</th>
                        <th style={style.th}>Impressionen</th>
                        <th style={style.th}>CTR</th>
                        <th style={style.th}>Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gscData.slice(0, 8).map((r, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                          <td style={{ ...style.td, color: COLORS.textDim }}>{truncate(r.query, 45)}</td>
                          <td style={style.td}>{fmt(r.clicks)}</td>
                          <td style={style.td}>{fmt(r.impressions)}</td>
                          <td style={style.td}>{fmtPct(r.ctr > 1 ? r.ctr / 100 : r.ctr)}</td>
                          <td style={style.td}><span style={style.badge(r.position)}>{Math.round(r.position * 10) / 10}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {gscData.length > 8 && <div style={{ fontSize: "10px", color: COLORS.textMuted, marginTop: "8px" }}>… und {gscData.length - 8} weitere Zeilen</div>}
                </div>
              )}
            </div>

            {ga4Data && gscData && (
              <button style={{ ...style.btn("primary"), padding: "12px 28px", fontSize: "12px" }} onClick={runAnalysis}>
                ▶ Analyse starten →
              </button>
            )}
          </>
        )}

        {/* ── TAB: ANALYSE ── */}
        {tab === "analyse" && analysis && (
          <>
            <StatRow items={[
              { label: "GA4 Seiten", value: ga4Data?.length || 0 },
              { label: "GSC Queries", value: gscData?.length || 0 },
              { label: "Quick Wins (5–20)", value: analysis.quickWins.length },
              { label: "Buy-Intent Queries", value: analysis.buyIntent.length },
              { label: "Niedr. Engagement", value: analysis.lowEng.length },
              { label: "0-Conversion Seiten", value: analysis.noConv.length },
            ]} />

            {/* Quick Wins */}
            <div style={style.card}>
              <div style={style.cardTitle}>
                <span style={style.tag("amber")}>Quick Win</span>
                GSC — Position 5–20 (Sofortpotenzial)
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={style.table}>
                  <thead>
                    <tr>
                      <th style={style.th}>#</th>
                      <th style={style.th}>Query</th>
                      <th style={style.th}>Position</th>
                      <th style={style.th}>Impressionen</th>
                      <th style={style.th}>Klicks</th>
                      <th style={style.th}>CTR</th>
                      <th style={style.th}>Potenzial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.quickWins.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                        <td style={{ ...style.td, color: COLORS.textMuted }}>{i + 1}</td>
                        <td style={{ ...style.td, color: COLORS.text, maxWidth: "280px" }}>{truncate(r.query, 50)}</td>
                        <td style={style.td}><span style={style.badge(r.position)}>{Math.round(r.position * 10) / 10}</span></td>
                        <td style={style.td}>{fmt(r.impressions)}</td>
                        <td style={style.td}>{fmt(r.clicks)}</td>
                        <td style={style.td}>{fmtPct(r.ctr > 1 ? r.ctr / 100 : r.ctr)}</td>
                        <td style={style.td}>
                          <div style={{ background: COLORS.amberDim, borderRadius: "3px", height: "6px", width: "80px", overflow: "hidden" }}>
                            <div style={{ background: COLORS.amber, height: "100%", width: `${Math.min(100, (r.impressions / (analysis.quickWins[0]?.impressions || 1)) * 100)}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Buy Intent */}
            {analysis.buyIntent.length > 0 && (
              <div style={style.card}>
                <div style={style.cardTitle}>
                  <span style={style.tag("accent")}>Kaufintent</span>
                  Queries mit Kaufabsicht
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={style.table}>
                    <thead>
                      <tr>
                        <th style={style.th}>Query</th>
                        <th style={style.th}>Klicks</th>
                        <th style={style.th}>Pos.</th>
                        <th style={style.th}>CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.buyIntent.map((r, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                          <td style={{ ...style.td, color: COLORS.text }}>{truncate(r.query, 55)}</td>
                          <td style={style.td}>{fmt(r.clicks)}</td>
                          <td style={style.td}><span style={style.badge(r.position)}>{Math.round(r.position * 10) / 10}</span></td>
                          <td style={style.td}>{fmtPct(r.ctr > 1 ? r.ctr / 100 : r.ctr)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Optimization candidates */}
            <div style={style.grid2}>
              {analysis.noConv.length > 0 && (
                <div style={style.card}>
                  <div style={style.cardTitle}>
                    <span style={style.tag("red")}>0 Conversions</span>
                    Traffic ohne Abschluss
                  </div>
                  {analysis.noConv.map((r, i) => (
                    <div key={i} style={{ padding: "6px 0", borderBottom: `1px solid ${COLORS.border}20`, fontSize: "11px" }}>
                      <div style={{ color: COLORS.textDim, marginBottom: "2px" }}>{truncate(r.page, 48)}</div>
                      <div style={{ color: COLORS.textMuted }}>{fmt(r.sessions)} Sessions · CTA fehlt?</div>
                    </div>
                  ))}
                </div>
              )}
              {analysis.lowEng.length > 0 && (
                <div style={style.card}>
                  <div style={style.cardTitle}>
                    <span style={style.tag("amber")}>Niedr. Engagement</span>
                    Absprungkandidaten
                  </div>
                  {analysis.lowEng.map((r, i) => (
                    <div key={i} style={{ padding: "6px 0", borderBottom: `1px solid ${COLORS.border}20`, fontSize: "11px" }}>
                      <div style={{ color: COLORS.textDim, marginBottom: "2px" }}>{truncate(r.page, 48)}</div>
                      <div style={{ color: COLORS.textMuted }}>{fmtPct(r.engagementRate > 1 ? r.engagementRate / 100 : r.engagementRate)} Eng. · {fmt(r.sessions)} Sessions</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              style={{ ...style.btn("amber"), padding: "12px 28px", fontSize: "12px", marginTop: "8px" }}
              onClick={generatePrompts}
              disabled={promptsLoading}
            >
              {promptsLoading ? "⏳ Prompts werden generiert…" : "⚡ Decision-Prompts generieren →"}
            </button>
          </>
        )}

        {/* ── TAB: PROMPTS ── */}
        {tab === "prompts" && prompts && (
          <>
            {/* Quick Win Prompts */}
            {prompts.quickWinPrompts && (
              <div style={style.card}>
                <div style={style.cardTitle}>
                  <span style={style.tag("amber")}>Quick Win</span>
                  Top Prompts — Sofortpotenzial (Score-Ranking)
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={style.table}>
                    <thead>
                      <tr>
                        <th style={style.th}>Score</th>
                        <th style={style.th}>KI-Prompt</th>
                        <th style={style.th}>Kategorie</th>
                        <th style={style.th}>GSC Basis</th>
                        <th style={style.th}>Maßnahme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...prompts.quickWinPrompts].sort((a, b) => b.score - a.score).map((r, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff05" }}>
                          <td style={style.td}>
                            <span style={{ ...style.badge(r.score > 70 ? 3 : r.score > 40 ? 8 : 15), fontSize: "12px", fontWeight: "700" }}>
                              {r.score}
                            </span>
                          </td>
                          <td style={{ ...style.td, color: COLORS.text, fontStyle: "italic" }}>„{truncate(r.prompt, 55)}"</td>
                          <td style={style.td}><span style={style.tag("accent")}>{r.kategorie}</span></td>
                          <td style={{ ...style.td, color: COLORS.textMuted }}>{truncate(r.gscQuery, 35)}</td>
                          <td style={{ ...style.td, color: COLORS.textDim }}>{truncate(r.massnahme, 45)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5 Kategorien */}
            <div style={style.grid2}>
              {catMeta.map((cat, ci) => (
                prompts[cat.key] && (
                  <div key={cat.key} style={{ ...style.card, borderTop: `2px solid ${catColors[ci]}` }}>
                    <div style={{ ...style.cardTitle, color: catColors[ci] }}>
                      {cat.icon} {cat.label}
                    </div>
                    {prompts[cat.key].map((item, i) => (
                      <div key={i} style={{ ...style.promptCard(ci), borderLeftColor: catColors[ci] }}>
                        <div style={{ fontStyle: "italic", marginBottom: "4px", color: COLORS.text }}>
                          „{item.prompt || item}"
                        </div>
                        {item.basis && (
                          <div style={{ fontSize: "10px", color: COLORS.textMuted }}>↳ Basis: {item.basis}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>

            <div style={{ ...style.hint, marginTop: "16px" }}>
              ⓘ Diese Prompts basieren auf echten GSC-Daten. Nächster Schritt: Prompts in ChatGPT / Perplexity / Gemini testen und Baseline dokumentieren.
            </div>
          </>
        )}

        {tab === "analyse" && !analysis && (
          <div style={{ ...style.card, textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>◈</div>
            <div style={{ color: COLORS.textMuted, marginBottom: "16px" }}>Noch keine Analyse — zuerst GA4 + GSC laden</div>
            <button style={style.btn("ghost")} onClick={() => setTab("daten")}>→ Zu Daten</button>
          </div>
        )}

        {tab === "prompts" && !prompts && (
          <div style={{ ...style.card, textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚡</div>
            <div style={{ color: COLORS.textMuted, marginBottom: "16px" }}>Noch keine Prompts — erst Analyse ausführen</div>
            <button style={style.btn("ghost")} onClick={() => setTab("analyse")}>→ Zu Analyse</button>
          </div>
        )}
      </div>
    </div>
  );
}
