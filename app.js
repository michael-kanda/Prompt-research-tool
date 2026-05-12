/* ════════════════════════════════════════════════════════════════════════
 * SEO · GEO Prompt Research Tool — Application Logic
 * Developed by Michael Kanda · https://designare.at
 * ════════════════════════════════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  API_ENDPOINT: '/api/generate',
  QW_POS_MIN: 5,
  QW_POS_MAX: 20,
  QW_MIN_IMPRESSIONS: 30,
  QW_MAX_RESULTS: 25,
  NOCONV_MIN_SESSIONS: 30,
  NOCONV_MAX_RESULTS: 8,
  LOWENG_MIN_SESSIONS: 20,
  LOWENG_MAX_RATE: 0.45,
  LOWENG_MAX_RESULTS: 8,
  BUY_INTENT_MAX_RESULTS: 15,
  GSC_TOP_FOR_PROMPT: 40,
  QW_FOR_PROMPT: 12,
  CLUSTER_MIN_SIM: 0.30,
  CLUSTER_MIN_SHARED_TOKENS: 2,
  CLUSTER_MIN_MEMBERS: 2,
  CLUSTER_MAX_RESULTS: 8,
  STORAGE_KEY: 'seo-geo-tool-vercel-v1',
};

const INTENT_PATTERNS = {
  transactional: /kauf|preis|kosten|anfrag|termin|kontakt|buchen|bestell|günstig|gunstig|angebot|miete|tarif|abo|reserv|liefer|versand/i,
  commercial:    /vergleich|test\b|beste|besten|empfehl|alternative|review|bewertung|erfahrung|\bvs\b|oder\s+\w+|top\s*\d/i,
  informational: /\bwas\s+ist\b|\bwie\b|\bwarum\b|\bwann\b|\bwer\b|\bwo\b|anleitung|tipp|tutorial|erklär|bedeut|definition|guide|ratgeber|unterschied/i,
};

const STOP_WORDS = new Set([
  'die','der','das','und','oder','zu','in','an','auf','mit','für','fur','von','bei','aus','im','am','ein','eine','einen','einem','einer','eines','dem','den','des',
  'ist','sind','war','waren','wird','werden','wurde','hat','haben','kann','können','konnen','muss','müssen','mussen','soll','sollen',
  'wie','was','wann','wer','wo','warum','welche','welcher','welches','dass','wenn','aber',
  'auch','noch','schon','nur','sehr','mehr','viel','gut','nicht','kein','keine','keinen',
  'wien','österreich','osterreich','deutschland','schweiz','dach','europa',
  'gmbh','ag','kg','co','com','at','de','net','org','www','http','https'
]);

let GA4 = null, GSC = null, ANALYSIS = null, PROMPTS = null;
let APP_PASSWORD_REQUIRED = false;  // wird von loadProviderStatus gesetzt

// ══════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function fmt(n) { if (n===undefined||n===null||isNaN(n)) return '–'; return n>=1000 ? (n/1000).toFixed(1)+'k' : String(Math.round(n)); }
function fmtPct(d) { if (d===null||d===undefined||isNaN(d)) return '–'; return (d*100).toFixed(1)+'%'; }
function trunc(s,n=50) { return s && s.length>n ? s.slice(0,n)+'…' : (s||''); }

function toast(msg, type='accent') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderLeftColor = type==='error'?'var(--red)':type==='warn'?'var(--amber)':'var(--accent)';
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'),2200);
}
function showErr(id, msg) { const el = document.getElementById(id); if (!el) return; el.textContent = '⚠ '+msg; el.style.display = 'block'; }
function hideErr(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
function posBadge(p) { const c = p<=3?'pos-top':p<=10?'pos-good':p<=20?'pos-qw':'pos-low'; return `<span class="pos ${c}">${Math.round(p*10)/10}</span>`; }
function scoreBadge(s) {
  const bg = s>70?'#22c55e18':s>40?'#f0a50018':'#4f9cf915';
  const col = s>70?'var(--green)':s>40?'var(--amber)':'var(--blue)';
  return `<span class="qw-score" style="background:${bg};color:${col}">${escapeHtml(s)}</span>`;
}
function intentBadge(i) {
  const l = {transactional:'Transactional',commercial:'Commercial',informational:'Informational',navigational:'Navigational',other:'Other'};
  return `<span class="intent-tag intent-${i}">${l[i]||i}</span>`;
}

async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); document.body.removeChild(ta); return true; }
    catch { document.body.removeChild(ta); return false; }
  }
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    document.querySelectorAll('[data-persist]').forEach(el => {
      if (data[el.id] !== undefined) el.value = data[el.id];
    });
  } catch (e) { console.warn('Persist-Load fehlgeschlagen:', e); }
}
function savePersistedState() {
  try {
    const data = {};
    document.querySelectorAll('[data-persist]').forEach(el => { data[el.id] = el.value; });
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
  } catch (e) { console.warn('Persist-Save fehlgeschlagen:', e); }
}
function clearPersistedState() { try { localStorage.removeItem(CONFIG.STORAGE_KEY); } catch {} }

// ══════════════════════════════════════════════════════════════════════════
// BRAND + INTENT
// ══════════════════════════════════════════════════════════════════════════
function extractBrandFromDomain(domain) {
  if (!domain) return '';
  return domain.replace(/^https?:\/\//,'').replace(/^www\./,'').split('.')[0].toLowerCase().trim();
}
function getBrand() {
  const manual = document.getElementById('inp-brand').value.trim().toLowerCase();
  if (manual) return manual;
  return extractBrandFromDomain(document.getElementById('inp-domain').value);
}
function classifyIntent(query, brand) {
  const q = String(query||'').toLowerCase();
  if (brand && q.includes(brand)) return 'navigational';
  if (INTENT_PATTERNS.transactional.test(q)) return 'transactional';
  if (INTENT_PATTERNS.commercial.test(q))    return 'commercial';
  if (INTENT_PATTERNS.informational.test(q)) return 'informational';
  return 'other';
}
function isBranded(query, brand) {
  if (!brand) return false;
  return String(query||'').toLowerCase().includes(brand);
}

// ══════════════════════════════════════════════════════════════════════════
// CLUSTERING
// ══════════════════════════════════════════════════════════════════════════
function tokenize(text) {
  return String(text||'').toLowerCase().replace(/[^\w\säöüß]/g,' ').split(/\s+/).filter(w => w.length>=3 && !STOP_WORDS.has(w));
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach(t => { if (b.has(t)) inter++; });
  const union = a.size + b.size - inter;
  return union ? inter/union : 0;
}
function clusterQueries(queries) {
  const sorted = [...queries].sort((a,b)=>b.impressions-a.impressions);
  const tokenSets = sorted.map(q => new Set(tokenize(q.query)));
  const used = new Array(sorted.length).fill(false);
  const clusters = [];
  for (let i = 0; i < sorted.length; i++) {
    if (used[i] || tokenSets[i].size === 0) continue;
    const cluster = { seed: sorted[i].query, tokens: [...tokenSets[i]], members: [sorted[i]], totalImpressions: sorted[i].impressions, totalClicks: sorted[i].clicks };
    used[i] = true;
    for (let j = i+1; j < sorted.length; j++) {
      if (used[j] || tokenSets[j].size === 0) continue;
      let shared = 0;
      tokenSets[i].forEach(t => { if (tokenSets[j].has(t)) shared++; });
      const sim = jaccard(tokenSets[i], tokenSets[j]);
      if (sim >= CONFIG.CLUSTER_MIN_SIM || shared >= CONFIG.CLUSTER_MIN_SHARED_TOKENS) {
        cluster.members.push(sorted[j]);
        cluster.totalImpressions += sorted[j].impressions;
        cluster.totalClicks += sorted[j].clicks;
        used[j] = true;
      }
    }
    if (cluster.members.length >= CONFIG.CLUSTER_MIN_MEMBERS) clusters.push(cluster);
  }
  return clusters.sort((a,b)=>b.totalImpressions-a.totalImpressions).slice(0, CONFIG.CLUSTER_MAX_RESULTS);
}

// ══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════════════════
function showTab(id) {
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  document.querySelector(`.tab[data-tab="${id}"]`).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
function updateProgress() {
  const setupDone = !!(document.getElementById('inp-domain').value || document.getElementById('inp-branche').value);
  document.getElementById('check-setup').style.display = setupDone?'':'none';
  document.getElementById('check-daten').style.display = (GA4&&GSC)?'':'none';
  document.getElementById('check-analyse').style.display = ANALYSIS?'':'none';
  document.getElementById('check-prompts').style.display = PROMPTS?'':'none';
}
function toggleAuthValue() {
  const m = document.getElementById('inp-auth').value;
  document.getElementById('auth-value-wrap').style.display = m==='none' ? 'none':'block';
}
function toggleProviderUI() {
  const p = document.getElementById('inp-provider').value;
  document.getElementById('api-status').style.display = p === 'manual' ? 'none' : '';
  document.getElementById('password-wrap').style.display =
    (APP_PASSWORD_REQUIRED && p !== 'manual') ? '' : 'none';
}
function setMode(mode) {
  document.getElementById('mode-api').classList.toggle('active', mode==='api');
  document.getElementById('mode-json').classList.toggle('active', mode==='json');
  ['ga4','gsc'].forEach(t => {
    document.getElementById(t+'-api-wrap').style.display  = mode==='api'?'':'none';
    document.getElementById(t+'-json-wrap').style.display = mode==='json'?'':'none';
  });
}

// ══════════════════════════════════════════════════════════════════════════
// GA4/GSC AUTH
// ══════════════════════════════════════════════════════════════════════════
function buildHeaders() {
  const method = document.getElementById('inp-auth').value;
  const val = document.getElementById('inp-auth-value')?.value || '';
  const h = { 'Content-Type':'application/json' };
  if (method==='bearer') h['Authorization'] = 'Bearer '+val;
  if (method==='apikey') h['X-API-Key'] = val;
  return h;
}
function buildUrl(base) {
  const method = document.getElementById('inp-auth').value;
  const val = document.getElementById('inp-auth-value')?.value || '';
  if (method==='queryparam' && val) return base + (base.includes('?')?'&':'?') + 'api_key=' + encodeURIComponent(val);
  return base;
}

// ══════════════════════════════════════════════════════════════════════════
// DATA PARSING
// ══════════════════════════════════════════════════════════════════════════
function normalizeRate(raw) {
  if (raw===null||raw===undefined||raw==='') return 0;
  const v = parseFloat(raw);
  if (isNaN(v)) return 0;
  return v > 1 ? v/100 : v;
}
function parseGA4(raw) {
  let rows = Array.isArray(raw) ? raw : raw.rows || raw.data || raw.landingPages || raw.result || [];
  return rows.map(r => {
    if (r.dimensionValues && r.metricValues) {
      const d = r.dimensionValues.map(x=>x.value);
      const m = r.metricValues.map(x=>parseFloat(x.value)||0);
      return { page:d[0]||'', sessions:m[0]||0, users:m[1]||0, engagementRate:normalizeRate(m[2]), avgEngTime:m[3]||0, conversions:m[4]||0, convRate:normalizeRate(m[5]) };
    }
    return {
      page: r.page||r.landingPage||r.pagePath||r.url||r.landing_page||'',
      sessions: +(r.sessions||0),
      users: +(r.users||r.activeUsers||0),
      engagementRate: normalizeRate(r.engagementRate||r.engagement_rate||0),
      avgEngTime: +(r.avgEngagementTime||r.averageEngagementTime||r.avg_engagement_time||0),
      conversions: +(r.conversions||r.keyEvents||r.key_events||r.goals||0),
      convRate: normalizeRate(r.conversionRate||r.sessionConversionRate||r.conversion_rate||0),
    };
  }).filter(r => r.page && r.page !== '(not set)');
}
function parseGSC(raw) {
  let rows = Array.isArray(raw) ? raw : raw.rows || raw.data || raw.queries || raw.result || [];
  const brand = getBrand();
  return rows.map(r => {
    let row;
    if (r.keys) {
      row = { query:r.keys[0]||'', page:r.keys[1]||'', clicks:+r.clicks||0, impressions:+r.impressions||0, ctr:normalizeRate(r.ctr), position:+r.position||0 };
    } else {
      row = {
        query: r.query||r.keyword||'',
        page: r.page||r.url||'',
        clicks: +(r.clicks||0),
        impressions: +(r.impressions||0),
        ctr: normalizeRate(r.ctr||r.click_through_rate||0),
        position: +(r.position||r.avgPosition||r.avg_position||0),
      };
    }
    row.intent = classifyIntent(row.query, brand);
    row.branded = isBranded(row.query, brand);
    return row;
  }).filter(r => r.query && r.query !== '(not set)');
}

// ══════════════════════════════════════════════════════════════════════════
// FETCH/LOAD
// ══════════════════════════════════════════════════════════════════════════
async function fetchData(type) {
  const urlEl = document.getElementById('inp-'+type+'-url');
  if (!urlEl.value) { showErr('error-daten','Bitte API-URL eingeben.'); return; }
  hideErr('error-daten');
  document.getElementById(type+'-spinner').style.display = 'inline-block';
  try {
    const res = await fetch(buildUrl(urlEl.value), { headers: buildHeaders() });
    if (!res.ok) throw new Error('HTTP '+res.status+': '+res.statusText);
    const data = await res.json();
    const parsed = type==='ga4' ? parseGA4(data) : parseGSC(data);
    if (parsed.length === 0) { showErr('error-daten', type.toUpperCase()+': Keine verwertbaren Zeilen.'); return; }
    storeData(type, parsed);
    toast(type.toUpperCase()+' geladen: '+parsed.length+' Zeilen');
  } catch (e) {
    showErr('error-daten', type.toUpperCase()+': '+e.message+' — CORS? → JSON Paste nutzen.');
  } finally {
    document.getElementById(type+'-spinner').style.display = 'none';
  }
}
function loadJson(type) {
  hideErr('error-daten');
  try {
    const raw = JSON.parse(document.getElementById('inp-'+type+'-json').value);
    const parsed = type==='ga4' ? parseGA4(raw) : parseGSC(raw);
    if (parsed.length === 0) { showErr('error-daten', type.toUpperCase()+': Keine verwertbaren Zeilen.'); return; }
    storeData(type, parsed);
    toast(type.toUpperCase()+' geladen: '+parsed.length+' Zeilen');
  } catch (e) {
    showErr('error-daten', 'JSON-Fehler ('+type.toUpperCase()+'): '+e.message);
  }
}
function storeData(type, rows) {
  if (type==='ga4') {
    GA4 = rows;
    const b = document.getElementById('badge-ga4');
    b.textContent = 'GA4 ✓ '+rows.length; b.className = 'badge badge-accent';
    const lb = document.getElementById('ga4-loaded-badge');
    lb.textContent = '✓ '+rows.length+' Rows'; lb.style.display = '';
  } else {
    GSC = rows;
    const b = document.getElementById('badge-gsc');
    b.textContent = 'GSC ✓ '+rows.length; b.className = 'badge badge-blue';
    const lb = document.getElementById('gsc-loaded-badge');
    lb.textContent = '✓ '+rows.length+' Rows'; lb.style.display = '';
  }
  renderPreview(type, rows);
  if (GA4 && GSC) document.getElementById('analyse-btn-wrap').style.display = '';
  updateProgress();
}
function renderPreview(type, rows) {
  const wrap = document.getElementById(type+'-preview');
  const info = document.getElementById(type+'-preview-info');
  const body = document.getElementById(type+'-preview-body');
  wrap.style.display = '';
  info.textContent = rows.length+' Zeilen geladen — Vorschau: erste 6';
  body.innerHTML = '';
  rows.slice(0,6).forEach(r => {
    const tr = document.createElement('tr');
    if (type==='ga4') {
      tr.innerHTML =
        `<td title="${escapeHtml(r.page)}">${escapeHtml(trunc(r.page,55))}</td>`+
        `<td>${fmt(r.sessions)}</td>`+
        `<td>${fmtPct(r.engagementRate)}</td>`+
        `<td>${r.conversions>0 ? '<span class="badge badge-accent">'+escapeHtml(r.conversions)+'</span>' : '<span style="color:var(--dim)">0</span>'}</td>`;
    } else {
      tr.innerHTML =
        `<td title="${escapeHtml(r.query)}">${escapeHtml(trunc(r.query,45))}${r.branded ? ' <span class="badge badge-purple" style="font-size:9px">B</span>' : ''}</td>`+
        `<td>${fmt(r.clicks)}</td>`+
        `<td>${fmt(r.impressions)}</td>`+
        `<td>${fmtPct(r.ctr)}</td>`+
        `<td>${posBadge(r.position)}</td>`+
        `<td>${intentBadge(r.intent)}</td>`;
    }
    body.appendChild(tr);
  });
}

// ══════════════════════════════════════════════════════════════════════════
// ANALYSE
// ══════════════════════════════════════════════════════════════════════════
function runAnalysis() {
  if (!GA4 || !GSC) return;
  const brand = getBrand();
  GSC.forEach(r => { r.intent = classifyIntent(r.query, brand); r.branded = isBranded(r.query, brand); });
  const nonBranded = GSC.filter(r => !r.branded);
  const branded    = GSC.filter(r => r.branded);
  const intentCounts = { transactional:0, commercial:0, informational:0, navigational:0, other:0 };
  GSC.forEach(r => { intentCounts[r.intent] = (intentCounts[r.intent]||0) + 1; });
  const quickWins = nonBranded.filter(r => r.position>=CONFIG.QW_POS_MIN && r.position<=CONFIG.QW_POS_MAX && r.impressions>=CONFIG.QW_MIN_IMPRESSIONS).sort((a,b)=>b.impressions-a.impressions).slice(0, CONFIG.QW_MAX_RESULTS);
  const topPages = [...GA4].sort((a,b)=>b.sessions-a.sessions).slice(0,15);
  const noConv = GA4.filter(r => r.sessions>CONFIG.NOCONV_MIN_SESSIONS && r.conversions===0).sort((a,b)=>b.sessions-a.sessions).slice(0, CONFIG.NOCONV_MAX_RESULTS);
  const lowEng = GA4.filter(r => r.sessions>CONFIG.LOWENG_MIN_SESSIONS && r.engagementRate>0 && r.engagementRate<CONFIG.LOWENG_MAX_RATE).sort((a,b)=>b.sessions-a.sessions).slice(0, CONFIG.LOWENG_MAX_RESULTS);
  const buyIntent = nonBranded.filter(r => r.intent==='transactional').sort((a,b)=>b.clicks-a.clicks).slice(0, CONFIG.BUY_INTENT_MAX_RESULTS);
  const clusters = clusterQueries(nonBranded);
  ANALYSIS = { quickWins, topPages, noConv, lowEng, buyIntent, clusters, intentCounts, brandedCount: branded.length, nonBrandedCount: nonBranded.length };
  renderAnalysis();
  showTab('analyse');
  updateProgress();
}

function renderAnalysis() {
  const { quickWins, noConv, lowEng, buyIntent, clusters, intentCounts, brandedCount } = ANALYSIS;
  document.getElementById('analyse-stats').innerHTML = [
    {n:GA4.length,l:'GA4 Seiten'},{n:GSC.length,l:'GSC Queries'},{n:brandedCount,l:'Branded'},
    {n:clusters.length,l:'Cluster'},{n:quickWins.length,l:'Quick Wins'},{n:buyIntent.length,l:'Transactional'},
  ].map(s => `<div class="stat"><div class="stat-n">${escapeHtml(s.n)}</div><div class="stat-l">${escapeHtml(s.l)}</div></div>`).join('');
  const intentMeta = [
    {key:'transactional',label:'Transactional',cls:'badge-red'},
    {key:'commercial',label:'Commercial',cls:'badge-amber'},
    {key:'informational',label:'Informational',cls:'badge-blue'},
    {key:'navigational',label:'Navigational',cls:'badge-purple'},
  ];
  document.getElementById('intent-grid').innerHTML = intentMeta.map(m => `
    <div class="stat">
      <div class="stat-n">${escapeHtml(intentCounts[m.key]||0)}</div>
      <div class="stat-l"><span class="badge ${m.cls}">${m.label}</span></div>
    </div>`).join('');
  const clusterColors = ['var(--accent)','var(--blue)','var(--purple)','var(--amber)','var(--pink)','var(--green)','#06b6d4','#f97316'];
  document.getElementById('cluster-list').innerHTML = clusters.length ? clusters.map((c,i) => `
    <div class="cluster-card" style="border-left-color:${clusterColors[i % clusterColors.length]}">
      <div class="cluster-head">
        <div class="cluster-title">${escapeHtml(c.seed)}</div>
        <div class="cluster-meta">${c.members.length} Queries · ${fmt(c.totalImpressions)} Imp · ${fmt(c.totalClicks)} Klicks</div>
      </div>
      <div class="cluster-tokens">↳ Topic-Tokens: ${escapeHtml(c.tokens.slice(0,6).join(', '))}</div>
      <div class="cluster-members">
        ${c.members.slice(0,8).map(m => `<span class="m" title="${escapeHtml(m.query)} · Pos.${Math.round(m.position*10)/10}">${escapeHtml(trunc(m.query,40))}</span>`).join('')}
        ${c.members.length>8 ? `<span style="color:var(--dim)">+${c.members.length-8} weitere</span>` : ''}
      </div>
    </div>`).join('') : '<span style="color:var(--dim);font-size:12px">Zu wenig Daten für Clustering.</span>';
  const maxImp = quickWins[0]?.impressions || 1;
  document.getElementById('qw-body').innerHTML = quickWins.map((r,i) => `
    <tr>
      <td style="color:var(--dim)">${i+1}</td>
      <td title="${escapeHtml(r.query)}">${escapeHtml(trunc(r.query,45))}</td>
      <td>${intentBadge(r.intent)}</td>
      <td>${posBadge(r.position)}</td>
      <td>${fmt(r.impressions)}</td>
      <td>${fmt(r.clicks)}</td>
      <td>${fmtPct(r.ctr)}</td>
      <td><div class="bar-wrap"><div class="bar-fill" style="width:${Math.round((r.impressions/maxImp)*100)}%"></div></div></td>
    </tr>`).join('');
  document.getElementById('buy-body').innerHTML = buyIntent.map(r => `
    <tr>
      <td title="${escapeHtml(r.query)}">${escapeHtml(trunc(r.query,55))}</td>
      <td>${fmt(r.clicks)}</td>
      <td>${posBadge(r.position)}</td>
      <td>${fmtPct(r.ctr)}</td>
    </tr>`).join('');
  document.getElementById('buy-card').style.display = buyIntent.length ? '' : 'none';
  document.getElementById('noconv-list').innerHTML = noConv.map(r => `
    <div style="padding:6px 0;border-bottom:1px solid #1e22310d;font-size:11px">
      <div style="color:var(--text);margin-bottom:2px">${escapeHtml(trunc(r.page,48))}</div>
      <div style="color:var(--dim)">${fmt(r.sessions)} Sessions · CTA fehlt?</div>
    </div>`).join('') || '<span style="color:var(--dim);font-size:12px">Keine gefunden</span>';
  document.getElementById('loweng-list').innerHTML = lowEng.map(r => `
    <div style="padding:6px 0;border-bottom:1px solid #1e22310d;font-size:11px">
      <div style="color:var(--text);margin-bottom:2px">${escapeHtml(trunc(r.page,48))}</div>
      <div style="color:var(--dim)">${fmtPct(r.engagementRate)} Eng. · ${fmt(r.sessions)} Sessions</div>
    </div>`).join('') || '<span style="color:var(--dim);font-size:12px">Keine gefunden</span>';
  document.getElementById('analyse-empty').style.display = 'none';
  document.getElementById('analyse-content').style.display = '';
}

// ══════════════════════════════════════════════════════════════════════════
// PROMPT-GENERIERUNG
// ══════════════════════════════════════════════════════════════════════════
function buildPromptText() {
  const domain  = document.getElementById('inp-domain').value  || 'unbekannt';
  const branche = document.getElementById('inp-branche').value || 'unbekannt';
  const region  = document.getElementById('inp-region').value  || 'Österreich';
  const nonBranded = (GSC||[]).filter(r => !r.branded);
  const topQ = nonBranded.slice(0, CONFIG.GSC_TOP_FOR_PROMPT).map(r => `${r.query} (${r.clicks} Klicks, Pos.${Math.round(r.position*10)/10}, Intent: ${r.intent})`).join('\n');
  const qwList = ANALYSIS.quickWins.slice(0, CONFIG.QW_FOR_PROMPT).map(r => `${r.query} (Pos.${Math.round(r.position*10)/10}, ${r.impressions} Imp., Intent: ${r.intent})`).join('\n');
  const buyList = ANALYSIS.buyIntent.map(r => r.query).join(', ') || 'keine erkannt';
  const clusterList = ANALYSIS.clusters.slice(0,5).map(c => `• ${c.seed} (Topic-Tokens: ${c.tokens.slice(0,5).join(', ')}, ${c.members.length} Queries)`).join('\n') || 'keine erkannt';
  return `Du bist ein SEO & GEO Experte für den DACH-Raum.

**Domain:** ${domain}
**Branche:** ${branche}
**Region:** ${region}

**Reale GSC-Suchanfragen (Top ${CONFIG.GSC_TOP_FOR_PROMPT}, ohne Branded):**
${topQ}

**Quick-Win-Kandidaten Pos. ${CONFIG.QW_POS_MIN}–${CONFIG.QW_POS_MAX}:**
${qwList}

**Identifizierte Topic-Cluster:**
${clusterList}

**Transactional-Queries:**
${buyList}

Generiere Decision-Prompts basierend auf ECHTEN GSC-Daten. Formuliere wie echte Nutzer in KI-Systemen (ChatGPT, Perplexity, Gemini) schreiben — vollständige Fragesätze, nicht nur Keywords.

Antworte ausschließlich als valides JSON ohne Markdown-Backticks, mit dieser exakten Struktur:
{
  "anbieterVergleich": [{"prompt":"...","basis":"..."}],
  "validierung": [{"prompt":"...","basis":"..."}],
  "spezifikation": [{"prompt":"...","basis":"..."}],
  "preis": [{"prompt":"...","basis":"..."}],
  "action": [{"prompt":"...","basis":"..."}],
  "quickWinPrompts": [{"prompt":"...","kategorie":"...","gscQuery":"...","massnahme":"...","score":0}]
}
Jeweils 3–4 Prompts pro Kategorie. quickWinPrompts: Top 8 sortiert nach score (0–100, höher = besser).`;
}

async function callServerEndpoint(provider, prompt) {
  const headers = { 'Content-Type':'application/json' };
  const password = document.getElementById('inp-app-password').value.trim();
  if (password) headers['x-app-password'] = password;

  const res = await fetch(CONFIG.API_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ provider, prompt }),
  });

  if (!res.ok) {
    let errMsg = `Server ${res.status}: ${res.statusText}`;
    try { const j = await res.json(); if (j.error) errMsg = j.error; } catch {}
    throw new Error(errMsg);
  }

  const data = await res.json();
  if (!data.text) throw new Error('Server-Antwort enthält keinen Text');
  return data.text;
}

async function generatePrompts() {
  if (!ANALYSIS) return;
  const provider = document.getElementById('inp-provider').value;
  if (provider === 'manual') { openContextModal(); return; }

  const btn = document.getElementById('gen-btn');
  const spinner = document.getElementById('gen-spinner');
  btn.disabled = true;
  spinner.style.display = 'inline-block';
  hideErr('error-prompts');

  try {
    const text = await callServerEndpoint(provider, buildPromptText());
    const clean = text.replace(/```json|```/g,'').trim();
    let parsed;
    try { parsed = JSON.parse(clean); }
    catch (e) { throw new Error('Ungültiges JSON in API-Antwort: '+e.message+' (evtl. abgeschnitten)'); }
    PROMPTS = parsed;
    renderPrompts(parsed);
    showTab('prompts');
    updateProgress();
    toast('Prompts generiert ✓');
  } catch (e) {
    showErr('error-prompts', 'Generierung fehlgeschlagen: '+e.message+' — Tipp: "Prompt-Kontext kopieren" und manuell verwenden.');
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
  }
}

function renderPrompts(data) {
  const catColors = ['var(--accent)','var(--blue)','var(--purple)','var(--amber)','var(--pink)'];
  const catMeta = [
    {key:'anbieterVergleich',label:'Anbieter-Vergleich',icon:'⚖'},
    {key:'validierung',label:'Validierung',icon:'✓'},
    {key:'spezifikation',label:'Spezifikation',icon:'◈'},
    {key:'preis',label:'Preis / Kosten',icon:'€'},
    {key:'action',label:'Action / Kontakt',icon:'→'},
  ];
  const qwSorted = [...(data.quickWinPrompts||[])].sort((a,b)=>(b.score||0)-(a.score||0));
  document.getElementById('qw-prompts-body').innerHTML = qwSorted.map((r,i) => `
    <tr>
      <td>${scoreBadge(r.score||0)}</td>
      <td style="font-style:italic;color:var(--text)" title="${escapeHtml(r.prompt)}">„${escapeHtml(trunc(r.prompt,55))}"</td>
      <td><span class="badge badge-accent" style="font-size:10px">${escapeHtml(r.kategorie||'–')}</span></td>
      <td style="color:var(--dim)" title="${escapeHtml(r.gscQuery)}">${escapeHtml(trunc(r.gscQuery,35))}</td>
      <td style="color:var(--dim)" title="${escapeHtml(r.massnahme)}">${escapeHtml(trunc(r.massnahme,45))}</td>
      <td><button class="copy-btn" data-copy-row="${i}">COPY</button></td>
    </tr>`).join('');
  document.querySelectorAll('#qw-prompts-body [data-copy-row]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = +btn.dataset.copyRow;
      const ok = await copyToClipboard(qwSorted[idx].prompt);
      if (ok) { btn.textContent='COPIED'; btn.classList.add('copied'); setTimeout(()=>{btn.textContent='COPY'; btn.classList.remove('copied');}, 1500); }
    });
  });
  document.getElementById('cats-grid').innerHTML = catMeta.map((cat,ci) => {
    const items = data[cat.key] || [];
    const cards = items.map((item,idx) => {
      const promptText = item.prompt || item;
      const basis = item.basis || '';
      return `<div class="prompt-item" style="border-left-color:${catColors[ci]}">
        <button class="copy-btn" data-copy-cat="${cat.key}" data-copy-idx="${idx}">COPY</button>
        <div class="prompt-text">„${escapeHtml(promptText)}"</div>
        ${basis ? `<div class="prompt-basis">↳ Basis: ${escapeHtml(basis)}</div>` : ''}
      </div>`;
    }).join('');
    return `<div class="card" style="border-top:2px solid ${catColors[ci]}">
      <div class="prompt-cat-title" style="color:${catColors[ci]}">${cat.icon} ${escapeHtml(cat.label)}</div>
      ${cards || '<span style="color:var(--dim);font-size:12px">Keine Prompts</span>'}
    </div>`;
  }).join('');
  document.querySelectorAll('[data-copy-cat]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cat = btn.dataset.copyCat;
      const idx = +btn.dataset.copyIdx;
      const item = (data[cat]||[])[idx];
      const text = (item && (item.prompt || item)) || '';
      const ok = await copyToClipboard(text);
      if (ok) { btn.textContent='COPIED'; btn.classList.add('copied'); setTimeout(()=>{btn.textContent='COPY'; btn.classList.remove('copied');}, 1500); }
    });
  });
  document.getElementById('prompts-empty').style.display = 'none';
  document.getElementById('prompts-content').style.display = '';
}

// ══════════════════════════════════════════════════════════════════════════
// CSV
// ══════════════════════════════════════════════════════════════════════════
function csvEscape(v) {
  if (v===null||v===undefined) return '';
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}
function downloadCsv(filename, rows) {
  const csv = rows.map(r => r.map(csvEscape).join(';')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(a.href), 500);
}
function exportQuickWinsCsv() {
  if (!ANALYSIS) return;
  const rows = [['#','Query','Intent','Position','Impressionen','Klicks','CTR']];
  ANALYSIS.quickWins.forEach((r,i) => {
    rows.push([i+1, r.query, r.intent, (Math.round(r.position*10)/10), r.impressions, r.clicks, (r.ctr*100).toFixed(2)+'%']);
  });
  downloadCsv('quick-wins.csv', rows);
  toast('Quick-Wins als CSV exportiert');
}
function exportPromptsCsv() {
  if (!PROMPTS) return;
  const rows = [['Score','Prompt','Kategorie','GSC-Query','Maßnahme']];
  (PROMPTS.quickWinPrompts||[]).forEach(p => {
    rows.push([p.score||0, p.prompt||'', p.kategorie||'', p.gscQuery||'', p.massnahme||'']);
  });
  ['anbieterVergleich','validierung','spezifikation','preis','action'].forEach(cat => {
    (PROMPTS[cat]||[]).forEach(p => { rows.push(['', p.prompt||'', cat, '', p.basis||'']); });
  });
  downloadCsv('decision-prompts.csv', rows);
  toast('Prompts als CSV exportiert');
}

// ══════════════════════════════════════════════════════════════════════════
// DEMO
// ══════════════════════════════════════════════════════════════════════════
const DEMO_GA4 = [
  {page:'/leistungen/heizung-tausch',sessions:1240,users:1100,engagementRate:0.72,conversions:48},
  {page:'/notdienst-installateur-wien',sessions:980,users:920,engagementRate:0.81,conversions:35},
  {page:'/preise',sessions:720,users:680,engagementRate:0.55,conversions:12},
  {page:'/leistungen/wasserrohrbruch',sessions:580,users:540,engagementRate:0.68,conversions:22},
  {page:'/ueber-uns',sessions:410,users:380,engagementRate:0.42,conversions:0},
  {page:'/blog/heizung-warten',sessions:380,users:360,engagementRate:0.61,conversions:0},
  {page:'/kontakt',sessions:320,users:300,engagementRate:0.85,conversions:28},
  {page:'/leistungen/badsanierung',sessions:290,users:270,engagementRate:0.58,conversions:8},
  {page:'/standorte/wien-1010',sessions:210,users:200,engagementRate:0.38,conversions:0},
  {page:'/foerderungen-heizung',sessions:180,users:170,engagementRate:0.32,conversions:0},
];
const DEMO_GSC = [
  {query:'installateur wien',clicks:320,impressions:4200,ctr:0.076,position:3.2},
  {query:'notdienst installateur wien',clicks:280,impressions:1800,ctr:0.155,position:2.1},
  {query:'heizung tausch kosten',clicks:95,impressions:2400,ctr:0.039,position:7.8},
  {query:'wasserrohrbruch was tun',clicks:88,impressions:3100,ctr:0.028,position:9.2},
  {query:'installateur 1010 wien preis',clicks:62,impressions:1200,ctr:0.051,position:5.5},
  {query:'beste installateur firma wien',clicks:45,impressions:980,ctr:0.045,position:8.3},
  {query:'gasleitung verlegen kosten österreich',clicks:38,impressions:1500,ctr:0.025,position:11.2},
  {query:'heizung förderung 2026 wien',clicks:32,impressions:2200,ctr:0.014,position:14.5},
  {query:'badsanierung wien angebot',clicks:28,impressions:850,ctr:0.033,position:6.8},
  {query:'installateur empfehlung wien',clicks:22,impressions:720,ctr:0.030,position:7.2},
  {query:'wärmepumpe vs gasheizung vergleich',clicks:18,impressions:1900,ctr:0.009,position:17.3},
  {query:'rohrreinigung wien preis',clicks:15,impressions:480,ctr:0.031,position:6.5},
  {query:'installateur termin vereinbaren wien',clicks:12,impressions:380,ctr:0.031,position:5.8},
  {query:'günstiger installateur wien empfehlung',clicks:10,impressions:420,ctr:0.024,position:9.1},
  {query:'durchlauferhitzer wechseln kosten',clicks:8,impressions:650,ctr:0.012,position:13.4},
  {query:'wie oft heizung warten lassen',clicks:6,impressions:1100,ctr:0.005,position:18.2},
  {query:'wärmepumpe förderung wien',clicks:5,impressions:890,ctr:0.006,position:16.4},
  {query:'was kostet badsanierung 5qm',clicks:4,impressions:340,ctr:0.012,position:12.1},
];

function loadDemoData() {
  document.getElementById('inp-domain').value = 'installateur-musterfirma.at';
  document.getElementById('inp-branche').value = 'Installateur / Heizungs- und Sanitärtechnik';
  document.getElementById('inp-region').value = 'Wien';
  document.getElementById('inp-brand').value = 'musterfirma';
  savePersistedState();
  storeData('ga4', parseGA4(DEMO_GA4));
  storeData('gsc', parseGSC(DEMO_GSC));
  toast('Demo-Daten geladen ✓');
  showTab('daten');
}

function resetAll() {
  if (!confirm('Alle Daten und Eingaben löschen?')) return;
  clearPersistedState();
  GA4 = GSC = ANALYSIS = PROMPTS = null;
  document.querySelectorAll('[data-persist]').forEach(el => {
    if (el.id==='inp-region') el.value='Wien';
    else if (el.id==='inp-auth') el.value='none';
    else if (el.id==='inp-provider') el.value='manual';
    else el.value='';
  });
  document.getElementById('inp-auth-value').value = '';
  ['inp-ga4-json','inp-gsc-json'].forEach(id => document.getElementById(id).value='');
  ['ga4-preview','gsc-preview','ga4-loaded-badge','gsc-loaded-badge','analyse-btn-wrap'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('badge-ga4').textContent='GA4 –'; document.getElementById('badge-ga4').className='badge badge-muted';
  document.getElementById('badge-gsc').textContent='GSC –'; document.getElementById('badge-gsc').className='badge badge-muted';
  document.getElementById('analyse-content').style.display='none'; document.getElementById('analyse-empty').style.display='';
  document.getElementById('prompts-content').style.display='none'; document.getElementById('prompts-empty').style.display='';
  toggleAuthValue(); toggleProviderUI(); updateProgress();
  showTab('setup');
  toast('Alles zurückgesetzt');
}

function openContextModal() {
  if (!ANALYSIS) return;
  document.getElementById('modal-textarea').value = buildPromptText();
  document.getElementById('modal-bg').classList.add('show');
}
function closeModal() { document.getElementById('modal-bg').classList.remove('show'); }

// ══════════════════════════════════════════════════════════════════════════
// PROVIDER STATUS — lädt vom Server welche API-Keys konfiguriert sind
// ══════════════════════════════════════════════════════════════════════════
async function loadProviderStatus() {
  try {
    const res = await fetch(CONFIG.API_ENDPOINT, { method: 'GET' });
    if (!res.ok) throw new Error('Status-Endpoint nicht erreichbar');
    const status = await res.json();
    APP_PASSWORD_REQUIRED = !!status.hasAppPassword;

    const select = document.getElementById('inp-provider');
    [...select.options].forEach(opt => {
      if (opt.value === 'gemini') {
        if (!status.gemini) {
          opt.disabled = true;
          opt.textContent = 'Google Gemini — nicht konfiguriert';
        } else {
          opt.disabled = false;
          opt.textContent = 'Google Gemini';
        }
      } else if (opt.value === 'anthropic') {
        if (!status.anthropic) {
          opt.disabled = true;
          opt.textContent = 'Anthropic Claude — nicht konfiguriert';
        } else {
          opt.disabled = false;
          opt.textContent = 'Anthropic Claude';
        }
      }
    });

    // Wenn aktuell ausgewählter Provider nicht (mehr) verfügbar → auf manual zurück
    if ((select.value === 'gemini'    && !status.gemini) ||
        (select.value === 'anthropic' && !status.anthropic)) {
      select.value = 'manual';
      toggleProviderUI();
      savePersistedState();
    }

    // Status-Hinweis aktualisieren
    const hint = document.getElementById('api-status');
    if (hint) {
      const active = [
        status.gemini    ? 'Gemini'    : null,
        status.anthropic ? 'Anthropic' : null,
      ].filter(Boolean).join(' · ');
      const pwNote = status.hasAppPassword ? ' · Endpoint passwortgeschützt' : '';
      hint.innerHTML = active
        ? `ⓘ Aktive Provider: <strong style="color:var(--text)">${active}</strong>${pwNote}`
        : 'ⓘ Keine KI-Provider konfiguriert. Im Vercel Dashboard <span style="font-family:var(--mono)">GEMINI_API_KEY</span> oder <span style="font-family:var(--mono)">ANTHROPIC_API_KEY</span> setzen, oder Modus „Manuell" nutzen.';
    }

    // Sichtbarkeit des Password-Felds zentral über toggleProviderUI
    toggleProviderUI();

  } catch (e) {
    console.warn('Provider-Status konnte nicht geladen werden:', e.message);
    // Endpoint nicht erreichbar (z.B. statisches Hosting ohne Function)
    // → manuell-only Hinweis
    const hint = document.getElementById('api-status');
    if (hint) {
      hint.innerHTML = '⚠ Status-Endpoint nicht erreichbar — nur Modus „Manuell" verfügbar.';
      hint.style.background = '#f0a50012';
      hint.style.borderColor = '#f0a50030';
      hint.style.color = 'var(--amber)';
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadPersistedState();
  toggleAuthValue();
  toggleProviderUI();
  updateProgress();
  loadProviderStatus();
  document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));
  document.querySelectorAll('[data-goto]').forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.goto)));
  document.getElementById('inp-auth').addEventListener('change', toggleAuthValue);
  document.getElementById('inp-provider').addEventListener('change', toggleProviderUI);
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
  document.querySelectorAll('[data-fetch]').forEach(btn => btn.addEventListener('click', () => fetchData(btn.dataset.fetch)));
  document.querySelectorAll('[data-loadjson]').forEach(btn => btn.addEventListener('click', () => loadJson(btn.dataset.loadjson)));
  document.getElementById('btn-run-analysis').addEventListener('click', runAnalysis);
  document.getElementById('gen-btn').addEventListener('click', generatePrompts);
  document.getElementById('btn-copy-context').addEventListener('click', openContextModal);
  document.getElementById('btn-export-qw').addEventListener('click', exportQuickWinsCsv);
  document.getElementById('btn-export-prompts').addEventListener('click', exportPromptsCsv);
  document.getElementById('btn-demo').addEventListener('click', loadDemoData);
  document.getElementById('btn-reset').addEventListener('click', resetAll);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-modal-close-2').addEventListener('click', closeModal);
  document.getElementById('modal-bg').addEventListener('click', e => { if (e.target.id==='modal-bg') closeModal(); });
  document.getElementById('btn-modal-copy').addEventListener('click', async () => {
    const ok = await copyToClipboard(document.getElementById('modal-textarea').value);
    toast(ok ? 'Kopiert ✓' : 'Kopieren fehlgeschlagen', ok ? 'accent' : 'error');
  });
  document.getElementById('inp-domain').addEventListener('blur', () => {
    const brandEl = document.getElementById('inp-brand');
    if (!brandEl.value.trim()) {
      const auto = extractBrandFromDomain(document.getElementById('inp-domain').value);
      if (auto) { brandEl.value = auto; savePersistedState(); }
    }
  });
  document.querySelectorAll('[data-persist]').forEach(el => {
    el.addEventListener('input', () => { savePersistedState(); updateProgress(); });
    el.addEventListener('change', () => { savePersistedState(); updateProgress(); });
  });
  document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });
});
