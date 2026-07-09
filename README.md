# Savills Radar — Render Deployment (Gemini)

CRE lead-intelligence POC for the IMDA OIP Call 29 (Savills) challenge. React (Vite + Tailwind v4) frontend + Express backend. All AI calls proxy through the server to **Google Gemini** — the API key never reaches the browser.

## Architecture

```
Browser ── /api/generate ──► Express ──► Gemini generateContent
        ── /api/scan     ──►         ──► Gemini + google_search grounding → JSON leads
        ── static files  ◄── dist/ (Vite build served by the same Express process)
```

One Render Web Service runs everything. Gemini's **Google Search grounding** powers two features:
- **Live scan** (Radar tab): finds fresh Singapore demand signals from the last 60 days, returns structured leads.
- **AI Visibility Lab** (Visibility tab): grounded consumer-style answers — a *real* GEO measurement, not a simulation.

## 1 · Get a Gemini API key

Create one at **https://aistudio.google.com/apikey** (Google AI Studio). The flash models have a free tier; Search-grounded requests have their own quota/pricing beyond a free daily allotment — check current limits in AI Studio before demo day and keep the model on `gemini-2.5-flash` for cost.

## 2 · Local dev

```bash
npm install
cp .env.example .env        # paste your GEMINI_API_KEY
npm run dev                 # Express on :3001 + Vite on :5173 (proxied /api)
```

Open http://localhost:5173. Sanity check the backend: http://localhost:3001/api/health → `{"ok":true,"model":"gemini-2.5-flash","keySet":true}`.

## 3 · Deploy to Render (Blueprint)

```bash
git init && git add -A && git commit -m "savills radar poc"
git remote add origin <your-github-repo> && git push -u origin main
```

1. Render dashboard → **New → Blueprint** → pick the repo (render.yaml is auto-detected).
2. When prompted, paste **GEMINI_API_KEY** (marked `sync: false`, so it's never in git).
3. Deploy. Build = `npm ci && npm run build`, start = `npm start`, health check = `/api/health`.

Manual alternative: New → Web Service → same build/start commands → add the two env vars.

## 4 · Render gotchas (known from experience)

- **Free tier spins down** after ~15 min idle; first hit takes ~30–60s. Upgrade to `starter` before the Savills pitch, or hit the URL 2 min before demoing.
- **Ephemeral filesystem** — irrelevant here; all state is in-memory/client-side by design. If you later add persistence (saved outcomes, scan history), use Render Postgres, not disk.
- Express binds `process.env.PORT` automatically — no config needed.
- Node 22 is pinned via `NODE_VERSION`; global `fetch` is native, no extra deps.

## 5 · Cost & abuse guardrails

- Server enforces **20 AI requests/min per IP** (429 beyond). Tighten in `server.js` if the URL leaks.
- Prompt length capped at 12k chars; `maxOutputTokens` ≤ 1600.
- Grounded calls (`scan`, `lab`) are the expensive ones — everything else runs ungrounded flash.
- For a public-facing demo, consider adding a shared-secret header check in the `/api` middleware.

## 6 · Model notes

- `GEMINI_MODEL` env swaps models without a redeploy-code-change (`gemini-2.5-pro` for sharper digests, `gemini-2.5-flash` for cost). Grounding requires Gemini 2.0+ (`tools: [{ google_search: {} }]`).
- Grounded responses **can't** use JSON response mode, so `/api/scan` prompts for a bare JSON array and parses defensively (422 with a raw snippet on failure — the UI surfaces it).
- If Google renames models after this was written, `/api/health` errors will tell you fast; just update `GEMINI_MODEL` in the Render env.

## 7 · Data integrity (for the pitch)

- Seeded companies/signals are real, from public press, with source + date on every signal.
- Requirement briefs, fit scores, take-up probabilities = **model output**, labeled as such in the UI.
- Contacts are role-based only; PDPA-compliant licensed enrichment is framed as POC phase 2.
- Listing rents/availability are illustrative — swap in Savills' live mandate feed during the POC.
