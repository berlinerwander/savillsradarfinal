import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "1mb" }));

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/* ── naive per-IP rate limit: 20 AI calls / minute ── */
const hits = new Map();
app.use("/api/", (req, res, next) => {
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "?";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60_000);
  if (recent.length >= 20) return res.status(429).json({ error: "Rate limit: 20 requests/min. Slow down." });
  recent.push(now);
  hits.set(ip, recent);
  next();
});

/* ── Gemini helper ──
   search:true attaches Google Search grounding (Gemini 2.0+ tool name: google_search).
   Note: grounded calls can't use responseMimeType JSON — parse text instead. */
async function gemini({ prompt, system, search = false, maxTokens = 1200, temperature = 0.7 }) {
  if (!KEY) {
    const e = new Error("GEMINI_API_KEY is not set on the server");
    e.status = 500;
    throw e;
  }
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  if (search) body.tools = [{ google_search: {} }];

  const r = await fetch(`${API_BASE}/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(data?.error?.message || `Gemini error ${r.status}`);
    e.status = r.status;
    throw e;
  }
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || "").join("").trim();
}

/* ── POST /api/generate  { prompt, system?, search? } → { text } ── */
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, system, search } = req.body || {};
    if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "prompt (string) required" });
    if (prompt.length > 12000) return res.status(400).json({ error: "prompt too long" });
    const text = await gemini({ prompt, system, search: Boolean(search) });
    res.json({ text });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

/* ── POST /api/scan  { exclude: string[] } → { leads: [...] }
   Search-grounded lead discovery. Grounding forbids JSON mode, so we
   prompt for a bare JSON array and parse defensively. ── */
app.post("/api/scan", async (req, res) => {
  try {
    const exclude = Array.isArray(req.body?.exclude) ? req.body.exclude.join(", ") : "";
    const prompt =
      `Search the web for Singapore companies showing NEW commercial property demand signals from the last 60 days ` +
      `(funding rounds, expansion or market-entry announcements, major hiring, new regional HQs). ` +
      `Exclude these companies: ${exclude || "none"}. ` +
      `Return ONLY a raw JSON array — no prose, no markdown fences, no citation markers — of up to 3 leads with this exact shape: ` +
      `[{"name":"","sector":"Office|Industrial|Retail","industry":"","summary":"1 sentence with the demand angle",` +
      `"signalType":"funding|hiring|expansion|leadership|filing|lease|news","signalDetail":"","signalDate":"YYYY-MM-DD",` +
      `"sourceName":"publication name","estSqftMin":0,"estSqftMax":0,"timing":"0\u20133 months|3\u20136 months|6\u201312 months"}]`;
    const raw = await gemini({
      prompt,
      system: "You are a commercial real estate lead-research agent for Singapore. Use Google Search. Output strictly the JSON array and nothing else.",
      search: true,
      maxTokens: 1600,
      temperature: 0.4,
    });
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) {
      return res.status(422).json({ error: "Model returned no JSON array", raw: raw.slice(0, 400) });
    }
    let leads;
    try {
      leads = JSON.parse(raw.slice(start, end + 1));
    } catch {
      return res.status(422).json({ error: "JSON parse failed", raw: raw.slice(0, 400) });
    }
    if (!Array.isArray(leads)) leads = [];
    res.json({ leads: leads.slice(0, 3) });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, model: MODEL, keySet: Boolean(KEY) }));

/* ── static frontend / Vite dev middleware ── */
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const dist = path.join(__dirname, "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

const port = 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Savills Radar listening on http://0.0.0.0:${port} | model=${MODEL} | GEMINI_API_KEY ${KEY ? "set" : "MISSING"}`);
});
