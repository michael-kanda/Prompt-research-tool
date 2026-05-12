// api/generate.js — Vercel Serverless Function
// Routes AI-Prompts zu Gemini oder Anthropic.
// API-Keys liegen serverseitig in den Environment Variables.

const SYSTEM_PROMPT =
  'Du bist SEO & GEO Experte. Antworte ausschließlich als valides JSON, ' +
  'kein Text davor oder danach, keine Markdown-Backticks.';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-password');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Optionaler Password-Schutz
  if (process.env.APP_PASSWORD) {
    const provided = req.headers['x-app-password'];
    if (provided !== process.env.APP_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const { provider, prompt } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "prompt"' });
  }
  if (prompt.length > 50000) {
    return res.status(400).json({ error: 'Prompt too long (max 50000 chars)' });
  }
  if (!['gemini', 'anthropic'].includes(provider)) {
    return res.status(400).json({ error: 'Invalid "provider" — must be "gemini" or "anthropic"' });
  }

  try {
    const text = provider === 'gemini'
      ? await callGemini(prompt)
      : await callAnthropic(prompt);

    return res.status(200).json({ text, provider });
  } catch (e) {
    console.error('[api/generate]', e);
    return res.status(500).json({ error: e.message || 'Unknown error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured on server');

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // Token-Konfiguration als ENV vars überschreibbar
  const maxOutputTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '16000', 10);

  // thinkingBudget: 0 = kein Thinking (mehr Tokens für die Antwort, schneller, billiger)
  // -1 = automatisch (Modell entscheidet, kann viel verbrauchen)
  // > 0 = explizites Budget. Für reines JSON-Output: 0 ist optimal.
  const thinkingBudget = parseInt(process.env.GEMINI_THINKING_BUDGET || '0', 10);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens,
      temperature: 0.7,
      // Thinking-Budget setzen — verhindert, dass Gemini 2.5 das Token-Limit
      // mit internen "Gedanken" aufbraucht, bevor die Antwort kommt.
      // Wird von älteren Modellen ignoriert.
      thinkingConfig: { thinkingBudget },
    },
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const err = await r.text().catch(() => '');
    let msg = `Gemini API ${r.status}`;
    try {
      const j = JSON.parse(err);
      if (j.error?.message) msg += `: ${j.error.message}`;
    } catch { if (err) msg += `: ${err.slice(0, 200)}`; }
    throw new Error(msg);
  }

  const data = await r.json();
  const candidate = data.candidates?.[0];
  if (!candidate) {
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the prompt: ${data.promptFeedback.blockReason}`);
    }
    throw new Error('Empty Gemini response');
  }

  const text = candidate.content?.parts?.map(p => p.text || '').join('') || '';

  if (candidate.finishReason === 'MAX_TOKENS') {
    const usage = data.usageMetadata || {};
    const detail = ` (input: ${usage.promptTokenCount ?? '?'}, thoughts: ${usage.thoughtsTokenCount ?? 0}, output: ${usage.candidatesTokenCount ?? '?'} / max: ${maxOutputTokens})`;

    if (!text || text.length < 50) {
      throw new Error(
        'Gemini-Antwort durch maxOutputTokens abgeschnitten' + detail +
        '. Fix: GEMINI_THINKING_BUDGET=0 setzen oder GEMINI_MAX_TOKENS erhöhen.'
      );
    }
    // Partial text vorhanden — Frontend versucht zu parsen
    console.warn('[gemini] MAX_TOKENS hit, returning partial text' + detail);
  }

  if (!text) throw new Error('Gemini response contains no text');
  return text;
}

// ─────────────────────────────────────────────────────────────────────────
async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured on server');

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
  const maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '8000', 10);

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!r.ok) {
    const err = await r.text().catch(() => '');
    let msg = `Anthropic API ${r.status}`;
    try {
      const j = JSON.parse(err);
      if (j.error?.message) msg += `: ${j.error.message}`;
    } catch { if (err) msg += `: ${err.slice(0, 200)}`; }
    throw new Error(msg);
  }

  const data = await r.json();
  const text = (data.content || []).map(c => c.text || '').join('');
  if (!text) throw new Error('Anthropic response contains no text');
  if (data.stop_reason === 'max_tokens') {
    throw new Error('Anthropic output truncated by max_tokens — ANTHROPIC_MAX_TOKENS erhöhen');
  }
  return text;
}
