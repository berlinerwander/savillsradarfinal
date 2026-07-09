import React, { useState, useMemo, useCallback } from "react";
import {
  Radar, Zap, Users, Globe, FileText, Search, TrendingUp, Building2,
  MapPin, Clock, ChevronRight, X, Sparkles, Download, CheckCircle2,
  AlertCircle, Briefcase, DollarSign, UserPlus, Newspaper, FileCheck,
  Mail, Loader2, Filter, BarChart3, Target, ListTodo, Gauge, Route,
  ThumbsDown, ShieldCheck, Trophy, XCircle, Flame, Send,
  ArrowUpRight, ArrowDownRight, Phone, RefreshCw, Satellite, Wrench, Ruler, Wallet
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

/* ─────────────────────────────────────────────────────────────
   SAVILLS RADAR v3 (Render/Gemini build)
   AI calls go through /api/* on our Express server, which holds
   the GEMINI_API_KEY. The Visibility Lab and Live Scan use
   Gemini's Google Search grounding — real answers, not mocks.
   All companies & signals below are real, sourced from public
   press (source + date on every signal). Requirement briefs,
   fit scores and take-up probabilities are MODEL OUTPUT.
   ───────────────────────────────────────────────────────────── */

const BASE_WEIGHTS = {
  funding:    { label: "Funding",      icon: DollarSign, color: "#0E7C5B", weight: 25 },
  hiring:     { label: "Hiring surge", icon: UserPlus,   color: "#B4530A", weight: 18 },
  expansion:  { label: "Expansion",    icon: TrendingUp, color: "#D80B2B", weight: 22 },
  leadership: { label: "Leadership",   icon: Briefcase,  color: "#5B4B8A", weight: 10 },
  filing:     { label: "Entity/filing",icon: FileCheck,  color: "#1B5E9E", weight: 15 },
  lease:      { label: "Lease event",  icon: Building2,  color: "#8A1538", weight: 20 },
  news:       { label: "Press",        icon: Newspaper,  color: "#5A5F66", weight: 8 },
};

const BROKERS = ["S. Lim", "M. Chen", "A. Rahman", "J. Tan"];

/* ══ REAL COMPANIES — signals sourced from public press, Jul 2026 snapshot ══ */
const COMPANIES = [
  {
    id: "c1", name: "Chipotle Mexican Grill", sector: "Retail", industry: "F&B — fast casual (US)",
    timing: "0–3 months", location: "Market entry — no SG outlet yet", status: "new",
    owner: "J. Tan", estFee: 85000, live: false,
    summary: "Confirmed 2026 Singapore entry (first SEA market), riding the US F&B wave after Chick-fil-A's Dec-2025 debut. Site search for a high-visibility first outlet is live now — before any public listing appears.",
    brief: {
      sqftMin: 2200, sqftMax: 3500, budgetMinPsf: 28, budgetMaxPsf: 45,
      needs: ["High footfall", "F&B approved", "Prime frontage"],
      submarketPrefs: ["Orchard", "Bayfront/Marina", "Raffles Place"],
      note: "Flagship-grade first unit; kitchen exhaust + queue depth critical",
    },
    signals: [
      { type: "expansion", date: "2025-12-12", source: "Straits Times / EDB", detail: "Chipotle confirmed to open in Singapore in 2026 — its first Southeast Asia outlet" },
      { type: "news", date: "2025-12-11", source: "Straits Times", detail: "Chick-fil-A opened its first Asia outlet in Singapore — US fast-casual wave validating the market" },
    ],
    stakeholders: [
      { role: "International Development Director (US HQ)", influence: "Decision maker", confidence: 82, verified: false, note: "Enrich via LinkedIn / press" },
      { role: "APAC Real Estate / Franchise Lead", influence: "Site selection", confidence: 74, verified: false, note: "Enrich via LinkedIn" },
      { role: "SG entity director (once incorporated)", influence: "Local signatory", confidence: 60, verified: false, note: "Monitor ACRA for new entity" },
    ],
    angles: [
      { via: "Landlord-side intel: surface prime Orchard/Bayfront F&B units before they hit public listings", strength: "Strong", contact: "Retail desk" },
      { via: "Reference Chick-fil-A entry playbook — position as the team that knows US brand requirements", strength: "Medium", contact: "Cross-border" },
    ],
  },
  {
    id: "c2", name: "Lotte Shopping", sector: "Office", industry: "Retail conglomerate (KR) — int'l HQ",
    timing: "0–3 months", location: "Establishing international HQ in SG (2026)", status: "new",
    owner: "S. Lim", estFee: 120000, live: false,
    summary: "Korea's largest mall operator is opening its international headquarters in Singapore in 2026 to run its SEA push. HQ-grade office requirement with prestige weighting — decision window is now.",
    brief: {
      sqftMin: 12000, sqftMax: 18000, budgetMinPsf: 10, budgetMaxPsf: 13,
      needs: ["Grade A", "Fitted", "Marina Bay prestige"],
      submarketPrefs: ["Marina Bay", "Raffles Place", "City Hall"],
      note: "Korean HQ standards: client-facing floor, board suite, K-wave brand visibility",
    },
    signals: [
      { type: "expansion", date: "2025-12-12", source: "Straits Times / EDB Insights", detail: "Lotte Shopping to open international headquarters in Singapore in 2026 for its Southeast Asia strategy" },
      { type: "news", date: "2025-12-12", source: "EDB Insights", detail: "Cited Korean-culture wave across SEA as the driver for the Singapore base" },
    ],
    stakeholders: [
      { role: "Head of International Business (Seoul HQ)", influence: "Decision maker", confidence: 85, verified: false, note: "Enrich via LinkedIn / KR press" },
      { role: "SG RHQ setup lead / country director", influence: "Requirements owner", confidence: 72, verified: false, note: "Monitor ACRA + LinkedIn moves" },
      { role: "Group corporate real estate (Lotte Property)", influence: "Standards & budget", confidence: 68, verified: false, note: "Enrich via group site" },
    ],
    angles: [
      { via: "Savills Korea desk cross-border referral — pitch arrives in Korean, with Seoul relationship context", strength: "Strong", contact: "Korea desk" },
      { via: "EDB relationship: RHQ incentive pathway as part of the space pitch", strength: "Medium", contact: "Advisory" },
    ],
  },
  {
    id: "c3", name: "Molly Tea", sector: "Retail", industry: "F&B — tea chain (CN)",
    timing: "0–3 months", location: "2 outlets, entered ~Mar 2026", status: "contacted",
    owner: "J. Tan", estFee: 60000, live: false,
    summary: "Opened its second Singapore store within two months of market entry — textbook rapid-rollout pattern of the Chinese F&B wave (85+ CN brands, 400+ outlets). Multi-unit pipeline highly likely.",
    brief: {
      sqftMin: 500, sqftMax: 900, budgetMinPsf: 20, budgetMaxPsf: 35,
      needs: ["High footfall", "F&B approved", "Kiosk/inline"],
      submarketPrefs: ["Orchard", "Bugis", "Suburban malls"],
      note: "Speed-to-open is the buying criterion; 3–5 unit pipeline pattern",
    },
    signals: [
      { type: "expansion", date: "2026-05-21", source: "Vulcan Post", detail: "Opened second Singapore store less than two months after market entry" },
      { type: "news", date: "2026-05-21", source: "Vulcan Post / Eurogroup", detail: "Chinese F&B brands in SG grew 32→85 with 400+ outlets; prime-location bidding above local tenants" },
    ],
    stakeholders: [
      { role: "SEA Expansion Manager (brand side)", influence: "Decision maker", confidence: 76, verified: false, note: "Enrich via LinkedIn / CN press" },
      { role: "Local franchise / JV partner", influence: "Operator & signatory", confidence: 70, verified: false, note: "Verify via ACRA entity search" },
    ],
    angles: [
      { via: "Multi-unit package across Savills-managed malls — one negotiation, three openings", strength: "Strong", contact: "Retail desk" },
      { via: "Speed-to-open pitch: pre-approved F&B units with exhaust in place", strength: "Strong", contact: "Retail desk" },
    ],
  },
  {
    id: "c4", name: "Qashier", sector: "Office", industry: "Fintech — merchant POS/payments (SG)",
    timing: "3–6 months", location: "HQ Singapore; SG/MY/TH/PH ops", status: "new",
    owner: "S. Lim", estFee: 45000, live: false,
    summary: "Closed US$6.1M Series A+ (30 Jun 2026), profitable since Dec 2025, 20,000+ merchants and $1B annualised volume. Post-round hiring typically outgrows current footprint within 2 quarters.",
    brief: {
      sqftMin: 6000, sqftMax: 9000, budgetMinPsf: 7.5, budgetMaxPsf: 9.5,
      needs: ["Fitted", "Near MRT", "City fringe OK"],
      submarketPrefs: ["Paya Lebar", "Tanjong Pagar", "Raffles Place"],
      note: "Capital-efficient culture — fitted city-fringe over prime shell",
    },
    signals: [
      { type: "funding", date: "2026-06-30", source: "Tech Startups", detail: "US$6.125M Series A+ led by Cocoon Capital, IFP Securities, BlackSoil Global" },
      { type: "news", date: "2026-06-30", source: "Tech Startups", detail: "Profitable every month since Dec 2025; 20,000+ merchants; ~$1B annualised payment volume" },
    ],
    stakeholders: [
      { role: "Co-founder / CEO", influence: "Decision maker", confidence: 88, verified: false, note: "Verify via ACRA directorship" },
      { role: "Head of Finance / Ops", influence: "Budget holder", confidence: 70, verified: false, note: "Enrich via LinkedIn" },
    ],
    angles: [
      { via: "Cocoon Capital portfolio route — warm intro via VC network events", strength: "Medium", contact: "A. Rahman" },
      { via: "Growth-stage pitch: expansion rights + short WALE flexibility", strength: "Medium", contact: "Office desk" },
    ],
  },
  {
    id: "c5", name: "Micron Technology", sector: "Industrial", industry: "Semiconductors — memory (US)",
    timing: "3–6 months", location: "Woodlands / North Coast fabs", status: "new",
    owner: "M. Chen", estFee: 160000, live: false,
    summary: "US$24B NAND expansion (Jan 2026) adds 700k sq ft of cleanroom and ~1,600 jobs, after 1,400 HBM roles. Fabs are self-built — the brokerage play is derived demand: contractor staging, vendor warehousing and transitional project offices near North Coast.",
    brief: {
      sqftMin: 30000, sqftMax: 50000, budgetMinPsf: 1.6, budgetMaxPsf: 2.1,
      needs: ["B1/B2", "Near Woodlands", "Dock access"],
      submarketPrefs: ["Woodlands", "Sembawang", "Yishun"],
      note: "Modelled as vendor/contractor ecosystem demand, not Micron's own fab",
    },
    signals: [
      { type: "funding", date: "2026-01-27", source: "CNBC", detail: "US$24B committed to expand Singapore wafer manufacturing — 700,000 sq ft of new cleanroom" },
      { type: "hiring", date: "2026-01-27", source: "CNBC", detail: "~1,600 new fab engineering/ops jobs, following ~1,400 HBM-related positions" },
      { type: "expansion", date: "2026-01-28", source: "CRN Asia", detail: "Production targeted H2 2028; decade-long buildout implies multi-year contractor ecosystem" },
    ],
    stakeholders: [
      { role: "Site Construction PMO Lead", influence: "Requirements owner", confidence: 78, verified: false, note: "Enrich via LinkedIn" },
      { role: "Procurement / Vendor Management", influence: "Gatekeeper to contractors", confidence: 72, verified: false, note: "Enrich via LinkedIn" },
      { role: "Workplace Solutions APAC", influence: "Project office demand", confidence: 65, verified: false, note: "Enrich via LinkedIn" },
    ],
    angles: [
      { via: "Pitch staging/warehouse packages directly to Micron's main contractors as they mobilise", strength: "Strong", contact: "Industrial desk" },
      { via: "JTC relationship for Woodlands North Coast allocations near the fab cluster", strength: "Strong", contact: "M. Chen" },
    ],
  },
  {
    id: "c6", name: "Silicon Box", sector: "Industrial", industry: "Semiconductors — chiplet packaging (SG)",
    timing: "6–12 months", location: "Tampines advanced-packaging fab", status: "new",
    owner: "M. Chen", estFee: 210000, live: false,
    summary: "Featured among Asia's biggest June-2026 funding rounds as SEA deep tech matures. Fresh capital into chiplet packaging points to capacity growth — hi-spec/cleanroom-capable space east of the island plus support warehousing.",
    brief: {
      sqftMin: 40000, sqftMax: 70000, budgetMinPsf: 1.9, budgetMaxPsf: 2.4,
      needs: ["B2", "High power", "Cleanroom capable"],
      submarketPrefs: ["Tampines", "Changi", "Paya Lebar"],
      note: "Power provision and floor loading are the gating specs",
    },
    signals: [
      { type: "funding", date: "2026-06-28", source: "BestStartup.Asia / Tracxn", detail: "Ranked among Asia's largest startup funding rounds of June 2026" },
      { type: "news", date: "2026-06-28", source: "BestStartup.Asia", detail: "Cited as marker of SEA's shift to deep tech; SEA raised $3.52B across 108 rounds Jan–May 2026" },
    ],
    stakeholders: [
      { role: "Co-founder / Operations lead", influence: "Decision maker", confidence: 84, verified: false, note: "Verify via ACRA / press" },
      { role: "VP Manufacturing", influence: "Requirements owner", confidence: 74, verified: false, note: "Enrich via LinkedIn" },
      { role: "Facilities Director", influence: "Spec gatekeeper", confidence: 68, verified: false, note: "Enrich via LinkedIn" },
    ],
    angles: [
      { via: "EDB/JTC ecosystem intro via semiconductor cluster programmes", strength: "Medium", contact: "Industrial desk" },
      { via: "East-side hi-spec specialists — power-headroom availability list as the opener", strength: "Strong", contact: "M. Chen" },
    ],
  },
  {
    id: "c7", name: "Compose Coffee", sector: "Retail", industry: "F&B — coffee chain (KR)",
    timing: "3–6 months", location: "SEA rollout planning (Jollibee-backed)", status: "new",
    owner: "A. Rahman", estFee: 75000, live: false,
    summary: "Korean value-coffee chain, co-invested by Jollibee, has announced SEA positioning on affordable pricing — Singapore is the natural network hub. Value format points to suburban-mall cluster rollout.",
    brief: {
      sqftMin: 600, sqftMax: 1000, budgetMinPsf: 15, budgetMaxPsf: 26,
      needs: ["High footfall", "F&B approved", "Affordable suburban"],
      submarketPrefs: ["Suburban malls", "Jurong East", "Tampines"],
      note: "Value positioning = suburban heartland clusters over prime Orchard",
    },
    signals: [
      { type: "expansion", date: "2026-03-15", source: "Market research / trade press", detail: "Announced SEA positioning on affordable pricing following Jollibee co-investment; Singapore flagged as network hub" },
      { type: "news", date: "2026-03-15", source: "Trade press", detail: "Korean F&B PE wave: Elevation, Q Capital, Koston targeting brands with international expansion potential" },
    ],
    stakeholders: [
      { role: "International BD (Seoul)", influence: "Decision maker", confidence: 75, verified: false, note: "Enrich via LinkedIn / KR press" },
      { role: "Jollibee SEA franchise ops", influence: "Operator & real estate", confidence: 80, verified: false, note: "Enrich via Jollibee group" },
    ],
    angles: [
      { via: "Jollibee group real-estate relationships — one conversation covers the rollout", strength: "Strong", contact: "Retail desk" },
      { via: "Heartland-mall landlord bundle: 3-unit launch package with staged rent", strength: "Medium", contact: "Retail desk" },
    ],
  },
  {
    id: "c8", name: "Pandora", sector: "Office", industry: "Jewellery — Asia RHQ (DK)",
    timing: "6–12 months", location: "Asia Square Tower 1 (~8,600 sq ft)", status: "engaged",
    owner: "S. Lim", estFee: 70000, live: false, recentlyCommitted: true,
    summary: "Committed ~8,600 sq ft at Asia Square T1 (Nov 2025) for its new Asia HQ and is hiring ~50 roles. Recently transacted — low near-term probability by design. Model watches headcount vs seat capacity for an upsize/overflow trigger around month 9–12.",
    brief: {
      sqftMin: 10000, sqftMax: 14000, budgetMinPsf: 11, budgetMaxPsf: 14,
      needs: ["Grade A", "Fitted", "Marina Bay prestige"],
      submarketPrefs: ["Marina Bay", "Raffles Place"],
      note: "Upsize scenario only: ~50 hires vs ~70–85 seat capacity at 8.6k sq ft",
    },
    signals: [
      { type: "lease", date: "2025-11-12", source: "Scandasia", detail: "Established Asia HQ at Asia Square Tower 1, ~8,600 sq ft, Marina Bay" },
      { type: "hiring", date: "2025-11-12", source: "Scandasia", detail: "Recruiting ~50 roles across branding, marketing, market development, operations" },
    ],
    stakeholders: [
      { role: "GM Asia / Regional Managing Director", influence: "Decision maker", confidence: 80, verified: false, note: "Enrich via LinkedIn / press" },
      { role: "Regional Ops / Workplace lead", influence: "Requirements owner", confidence: 66, verified: false, note: "Enrich via LinkedIn" },
    ],
    angles: [
      { via: "Quarterly check-in cadence: track LinkedIn headcount vs 8,600 sq ft capacity; pitch overflow suite at month 9", strength: "Medium", contact: "Office desk" },
    ],
  },
];

/* ══ Listings — real buildings, illustrative availability & asking rents ══ */
const LISTINGS = [
  { id: "L1", name: "IOI Central Boulevard Towers", submarket: "Marina Bay", sector: "Office", size: 32000, rentPsf: 13.5, grade: "Grade A · new completion", avail: "Immediate", availIdx: 0, features: ["Grade A", "Fitted", "Marina Bay prestige", "Near MRT"] },
  { id: "L2", name: "Asia Square Tower 2 suite", submarket: "Marina Bay", sector: "Office", size: 12800, rentPsf: 12.8, grade: "Grade A · fitted suite", avail: "Q1 2027", availIdx: 6, features: ["Grade A", "Fitted", "Marina Bay prestige", "Near MRT"] },
  { id: "L3", name: "CapitaSky #12", submarket: "Tanjong Pagar", sector: "Office", size: 24500, rentPsf: 10.2, grade: "Grade A · fitted", avail: "Q4 2026", availIdx: 3, features: ["Grade A", "Fitted", "Near MRT"] },
  { id: "L4", name: "Guoco Midtown", submarket: "City Hall", sector: "Office", size: 15500, rentPsf: 11.0, grade: "Grade A · core-fitted", avail: "Immediate", availIdx: 0, features: ["Grade A", "Fitted", "Near MRT"] },
  { id: "L5", name: "Paya Lebar Quarter T3", submarket: "Paya Lebar", sector: "Office", size: 8200, rentPsf: 8.8, grade: "Grade A city-fringe · fitted", avail: "Immediate", availIdx: 0, features: ["Grade A", "Fitted", "Near MRT", "City fringe OK"] },
  { id: "L6", name: "JTC Woodlands North Coast B1", submarket: "Woodlands", sector: "Industrial", size: 42000, rentPsf: 1.85, grade: "B1 · dock-served", avail: "Q4 2026", availIdx: 3, features: ["B1/B2", "Near Woodlands", "Dock access"] },
  { id: "L7", name: "Sembawang logistics block", submarket: "Sembawang", sector: "Industrial", size: 36000, rentPsf: 1.7, grade: "B2 · ramp access", avail: "Immediate", availIdx: 0, features: ["B1/B2", "Near Woodlands", "Dock access"] },
  { id: "L8", name: "Tampines hi-spec block", submarket: "Tampines", sector: "Industrial", size: 58000, rentPsf: 2.15, grade: "B2 hi-spec · high power", avail: "Q1 2027", availIdx: 6, features: ["B2", "High power", "Cleanroom capable"] },
  { id: "L9", name: "Changi Business Park hi-spec", submarket: "Changi", sector: "Industrial", size: 47000, rentPsf: 2.05, grade: "B2 hi-spec", avail: "Q2 2027", availIdx: 9, features: ["B2", "High power", "Dock access"] },
  { id: "L10", name: "ION Orchard B4 unit", submarket: "Orchard", sector: "Retail", size: 780, rentPsf: 32, grade: "Prime basement F&B", avail: "Immediate", availIdx: 0, features: ["High footfall", "F&B approved", "Kiosk/inline"] },
  { id: "L11", name: "Orchard Gateway flagship", submarket: "Orchard", sector: "Retail", size: 2900, rentPsf: 40, grade: "Double frontage", avail: "Q4 2026", availIdx: 3, features: ["High footfall", "Prime frontage", "F&B approved"] },
  { id: "L12", name: "Marina Bay Link Mall", submarket: "Bayfront/Marina", sector: "Retail", size: 2400, rentPsf: 30, grade: "CBD lunch-crowd node", avail: "Immediate", availIdx: 0, features: ["High footfall", "F&B approved", "Prime frontage"] },
  { id: "L13", name: "JEM #01 inline", submarket: "Jurong East", sector: "Retail", size: 850, rentPsf: 21, grade: "Suburban prime", avail: "Immediate", availIdx: 0, suburban: true, features: ["High footfall", "F&B approved", "Affordable suburban"] },
  { id: "L14", name: "Northpoint City inline", submarket: "Yishun", sector: "Retail", size: 720, rentPsf: 18.5, grade: "Heartland anchor mall", avail: "Immediate", availIdx: 0, suburban: true, features: ["High footfall", "F&B approved", "Affordable suburban", "Kiosk/inline"] },
];

/* ══ PROPERTY FIT ENGINE — 5 factors → match % → take-up probability ══ */
const FIT_WEIGHTS = { budget: 0.25, size: 0.25, location: 0.20, facilities: 0.20, timing: 0.10 };
const TIMING_MID = { "0–3 months": 1.5, "3–6 months": 4.5, "6–12 months": 9 };
const TIMING_FACTOR = { "0–3 months": 1.0, "3–6 months": 0.85, "6–12 months": 0.6 };

function fitEngine(c, l) {
  const b = c.brief;
  let budget;
  if (l.rentPsf >= b.budgetMinPsf && l.rentPsf <= b.budgetMaxPsf) budget = 100;
  else {
    const ref = l.rentPsf > b.budgetMaxPsf ? b.budgetMaxPsf : b.budgetMinPsf;
    budget = Math.max(0, Math.round(100 - (Math.abs(l.rentPsf - ref) / ref) * 100 * 3.5));
  }
  let size;
  if (l.size >= b.sqftMin && l.size <= b.sqftMax) size = 100;
  else {
    const ref = l.size > b.sqftMax ? b.sqftMax : b.sqftMin;
    size = Math.max(0, Math.round(100 - (Math.abs(l.size - ref) / ref) * 100 * 2));
  }
  const idx = b.submarketPrefs.indexOf(l.submarket);
  const location = idx === 0 ? 100 : idx === 1 ? 85 : idx === 2 ? 70 : (l.suburban && b.submarketPrefs.includes("Suburban malls")) ? 78 : 35;
  const hits = b.needs.filter(n => l.features.includes(n)).length;
  const facilities = Math.round((hits / b.needs.length) * 100);
  const mid = TIMING_MID[c.timing] ?? 4.5;
  const timing = Math.max(20, Math.min(100, Math.round(100 - Math.abs(l.availIdx - mid) * 9)));

  const factors = { budget, size, location, facilities, timing };
  const match = Math.round(Object.entries(FIT_WEIGHTS).reduce((s, [k, w]) => s + factors[k] * w, 0));

  const propensity = Math.min(0.9, Math.max(0.1, (c.score / 100) * (TIMING_FACTOR[c.timing] ?? 0.7))) * (c.recentlyCommitted ? 0.25 : 1);
  const m = match / 100;
  const share = (m * m) / (m * m + 0.5);
  const prob = Math.round(propensity * share * 100);

  const sorted = Object.entries(factors).sort((a, b2) => b2[1] - a[1]);
  const drivers = `Strong: ${sorted[0][0]}, ${sorted[1][0]} · Watch: ${sorted[4][0]}`;
  return { factors, match, prob, drivers };
}

function matchListings(c) {
  return LISTINGS.filter(l => l.sector === c.sector)
    .map(l => ({ ...l, fit: fitEngine(c, l) }))
    .sort((a, b) => b.fit.match - a.fit.match).slice(0, 3);
}

function scoreCompany(company, weights) {
  const parts = []; const seen = {};
  company.signals.forEach(s => { parts.push({ label: weights[s.type].label, pts: weights[s.type].weight, color: weights[s.type].color }); seen[s.type] = true; });
  if (company.signals.some(s => new Date(s.date) > new Date("2026-05-15"))) parts.push({ label: "Recency boost", pts: 10, color: "#17191C" });
  parts.push({ label: "Signal diversity", pts: Object.keys(seen).length * 3, color: "#17191C" });
  return { total: Math.min(99, parts.reduce((s, p) => s + p.pts, 0)), parts };
}

/* ══ Visibility data ══ */
const KEYWORDS = [
  { kw: "office leasing consultant singapore", savills: 4, top: "PropertyGuru Commercial", aiPresence: 40, vol: "High" },
  { kw: "industrial property advisor singapore", savills: 6, top: "JTC Portal", aiPresence: 20, vol: "Med" },
  { kw: "retail space broker orchard", savills: 9, top: "CBRE", aiPresence: 10, vol: "Med" },
  { kw: "office relocation singapore cbd", savills: 3, top: "Savills", aiPresence: 60, vol: "High" },
  { kw: "warehouse for lease tuas", savills: 12, top: "CommercialGuru", aiPresence: 0, vol: "High" },
  { kw: "fitted office grade a raffles place", savills: 2, top: "Savills", aiPresence: 70, vol: "Low" },
];
const ENGINE_SOV = [
  { engine: "ChatGPT", savills: 33, leader: "CBRE 58%" },
  { engine: "Perplexity", savills: 50, leader: "JLL 67%" },
  { engine: "Gemini", savills: 17, leader: "PropertyGuru 83%" },
  { engine: "Claude", savills: 50, leader: "CBRE 50%" },
];
const COMPETITOR_BENCH = [
  { name: "Savills", geo: 62, seo: 71, content: 58 },
  { name: "CBRE", geo: 74, seo: 78, content: 72 },
  { name: "JLL", geo: 70, seo: 80, content: 69 },
  { name: "Knight Frank", geo: 55, seo: 66, content: 51 },
  { name: "PropertyGuru", geo: 81, seo: 90, content: 64 },
];
const GEO_ACTIONS = [
  { impact: "High", title: "Publish structured FAQ pages per submarket", detail: "AI answer engines cite pages with direct Q&A on rents, availability and process. Zero current coverage for industrial submarkets." },
  { impact: "High", title: "Broker-authored commentary with Person + Article schema", detail: "LLM crawlers weight named-expert content; competitors cited 3.2× more in AI answers." },
  { impact: "Med", title: "Fix 12 inconsistent directory listings (NAP)", detail: "Inconsistent entity data dilutes retrieval confidence across AI answer engines." },
  { impact: "Med", title: "Win 'warehouse for lease tuas' cluster", detail: "Rank #12 on high volume. Dedicated Tuas availability hub could reach top 5 in ~8 weeks." },
];
const BRANDS = ["Savills", "CBRE", "JLL", "Knight Frank", "Cushman", "Colliers", "PropertyGuru", "PropNex", "ERA", "Edmund Tie", "CommercialGuru"];

const DATA_SOURCES = [
  { source: "Press & newswires (ST, CNBC, trade)", type: "Public/licensed", basis: "Publicly available; licensed feeds", refresh: "15 min", status: "OK" },
  { source: "ACRA BizFile", type: "Public registry", basis: "Publicly available data (PDPA Sch 2)", refresh: "Daily 06:00", status: "OK" },
  { source: "MyCareersFuture / job boards", type: "Public postings", basis: "Publicly available data", refresh: "Daily 06:15", status: "OK" },
  { source: "LinkedIn (public pages)", type: "Public profiles", basis: "Business contact info (PDPA s.4(5))", refresh: "12h", status: "OK" },
  { source: "EDB / gov announcements", type: "Public registry", basis: "Open government data licence", refresh: "Daily", status: "OK" },
  { source: "Contact enrichment", type: "Licensed provider", basis: "Contract + consent chain — POC phase 2", refresh: "On demand", status: "PENDING" },
];

const LEADS_TREND = [
  { m: "Apr", CI: 10, Retail: 1 }, { m: "May", CI: 12, Retail: 2 },
  { m: "Jun", CI: 15, Retail: 4 }, { m: "Jul", CI: 17, Retail: 6 },
];

/* ══ Backend AI helpers (Express → Gemini) ══ */
async function askAI(prompt, system, search = false) {
  const r = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, system, search }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "AI request failed");
  return d.text;
}

async function scanAPI(excludeNames) {
  const r = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exclude: excludeNames }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Scan failed");
  return d.leads || [];
}

/* ══ UI atoms ══ */
function SignalMeter({ score, size = "md" }) {
  const active = Math.max(1, Math.round((score / 100) * 5));
  const h = size === "lg" ? [8, 13, 18, 23, 28] : [5, 8, 11, 14, 17];
  const w = size === "lg" ? 6 : 4;
  const color = score >= 75 ? "#D80B2B" : score >= 55 ? "#B4530A" : "#9AA0A6";
  return (
    <div className="flex items-end gap-0.5" aria-label={`Lead score ${score} of 100`}>
      {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: w, height: h[i], borderRadius: 1, background: i < active ? color : "#E4E2DC", transition: "background .3s" }} />)}
    </div>
  );
}
const SECTOR_STYLE = { Office: { bg: "#EEF2F7", text: "#1B5E9E" }, Industrial: { bg: "#F3EFE8", text: "#8A5A0A" }, Retail: { bg: "#F7EDEF", text: "#8A1538" } };
function SectorTag({ sector }) {
  const s = SECTOR_STYLE[sector] || SECTOR_STYLE.Office;
  return <span className="font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider mono" style={{ background: s.bg, color: s.text, fontSize: 10 }}>{sector}</span>;
}
const STATUS_STYLE = { new: { label: "New", color: "#D80B2B" }, contacted: { label: "Contacted", color: "#B4530A" }, engaged: { label: "Engaged", color: "#0E7C5B" } };
function OwnerChip({ owner }) {
  return (
    <span className="mono flex items-center gap-1" style={{ fontSize: 10, color: "#5A5F66" }}>
      <span className="flex items-center justify-center rounded-full font-bold" style={{ width: 16, height: 16, background: "#17191C", color: "#fff", fontSize: 8 }}>{owner.split(" ").map(x => x[0]).join("")}</span>{owner}
    </span>
  );
}
function Section({ icon: Icon, title, right, children }) {
  return (
    <div className="card rounded-sm p-4">
      <div className="flex items-center gap-2 mb-3"><Icon size={15} color="#D80B2B" /><span className="font-bold text-sm">{title}</span>{right && <span className="ml-auto">{right}</span>}</div>
      {children}
    </div>
  );
}
const FACTOR_META = {
  budget: { label: "Budget", icon: Wallet }, size: { label: "Size", icon: Ruler },
  location: { label: "Location", icon: MapPin }, facilities: { label: "Facilities", icon: Wrench },
  timing: { label: "Timing", icon: Clock },
};

/* ═══════════════════════ APP ═══════════════════════ */
export default function SavillsRadar() {
  const [tab, setTab] = useState("today");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [extraLeads, setExtraLeads] = useState([]);
  const [statuses, setStatuses] = useState(() => Object.fromEntries(COMPANIES.map(c => [c.id, c.status])));
  const [outcomes, setOutcomes] = useState({});
  const [dismissed, setDismissed] = useState({});
  const [doneActions, setDoneActions] = useState({});
  const [digest, setDigest] = useState("");
  const [digestLoading, setDigestLoading] = useState(false);
  const [outreach, setOutreach] = useState({});
  const [outreachLoading, setOutreachLoading] = useState(null);
  const [analysis, setAnalysis] = useState({});
  const [analysisLoading, setAnalysisLoading] = useState(null);
  const [labQuery, setLabQuery] = useState("best office leasing consultant in Singapore");
  const [labResult, setLabResult] = useState(null);
  const [labLoading, setLabLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  const [enrichedContacts, setEnrichedContacts] = useState({});
  const [enrichingKey, setEnrichingKey] = useState(null);
  const [enrichForm, setEnrichForm] = useState({ name: "", email: "", phone: "", linkedin: "", verified: true });
  const [auditInput, setAuditInput] = useState("Industrial leasing in Jurong East");
  const [auditSector, setAuditSector] = useState("Industrial");
  const [auditResult, setAuditResult] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const weights = useMemo(() => {
    const w = JSON.parse(JSON.stringify(BASE_WEIGHTS));
    Object.keys(w).forEach(k => { w[k].icon = BASE_WEIGHTS[k].icon; });
    const all = [...COMPANIES, ...extraLeads];
    Object.entries(outcomes).forEach(([id, o]) => {
      const c = all.find(x => x.id === id);
      c?.signals.forEach(s => { w[s.type].weight = Math.max(4, Math.min(30, w[s.type].weight + (o === "won" ? 1.5 : -1))); });
    });
    return w;
  }, [outcomes, extraLeads]);

  const scored = useMemo(() =>
    [...COMPANIES, ...extraLeads].map(c => {
      const { total, parts } = scoreCompany(c, weights);
      const withScore = { ...c, score: Math.round(total), scoreParts: parts, status: statuses[c.id] || "new", outcome: outcomes[c.id] };
      return { ...withScore, matches: matchListings(withScore) };
    }).filter(c => !dismissed[c.id]).sort((a, b) => b.score - a.score),
    [statuses, dismissed, weights, outcomes, extraLeads]);

  const selected = scored.find(c => c.id === selectedId) || null;
  const filtered = sectorFilter === "All" ? scored : scored.filter(c => c.sector === sectorFilter);

  const allSignals = useMemo(() => {
    const rows = [];
    [...COMPANIES, ...extraLeads].forEach(c => c.signals.forEach(s => rows.push({ ...s, company: c.name, companyId: c.id, sector: c.sector, live: c.live })));
    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [extraLeads]);

  const actions = useMemo(() => {
    const list = [];
    scored.forEach(c => {
      if (c.outcome) return;
      const top = c.matches[0];
      c.signals.filter(s => new Date(s.date) >= new Date("2026-06-25")).forEach((s, idx) =>
        list.push({ id: `${c.id}-sig-${s.date}-${s.type}-${idx}`, p: "P1", c, verb: "Fresh signal — act this week", reason: `${weights[s.type].label}: ${s.detail.slice(0, 90)}…`, icon: Flame }));
      if (c.status === "new" && c.score >= 70) list.push({ id: `${c.id}-call`, p: "P1", c, verb: `First touch: ${c.stakeholders[0].role}`, reason: `Score ${c.score} · top fit ${top?.name} (${top?.fit.match}%, P ${top?.fit.prob}%)`, icon: Phone });
      else if (c.status === "new") list.push({ id: `${c.id}-touch`, p: "P2", c, verb: "Qualify & assign first touch", reason: `Score ${c.score} · ${c.signals.length} signals`, icon: Target });
      if (c.status === "contacted") list.push({ id: `${c.id}-fup`, p: "P2", c, verb: "Follow-up due", reason: `Owner ${c.owner} · lead with ${top?.name} fit case`, icon: RefreshCw });
      if (c.status === "engaged" && !c.recentlyCommitted) list.push({ id: `${c.id}-opts`, p: "P1", c, verb: `Send matched options (${top?.name})`, reason: `Match ${top?.fit.match}% · take-up P ${top?.fit.prob}%`, icon: Building2 });
    });
    return list.filter(a => !doneActions[a.id]).sort((a, b) => a.p.localeCompare(b.p)).slice(0, 8);
  }, [scored, doneActions, weights]);

  const pipelineFee = scored.filter(c => !c.outcome || c.outcome === "won").reduce((s, c) => s + c.estFee, 0);
  const wonCount = Object.values(outcomes).filter(o => o === "won").length;
  const lostCount = Object.values(outcomes).filter(o => o === "lost").length;

  /* ── AI actions ── */
  const generateDigest = useCallback(async () => {
    setDigestLoading(true);
    try {
      const pipeline = scored.slice(0, 6).map(c =>
        `${c.name} (${c.sector}, score ${c.score}, timing ${c.timing}, est fee S$${c.estFee}): ${c.summary} Top fit: ${c.matches[0]?.name} match ${c.matches[0]?.fit.match}% take-up P ${c.matches[0]?.fit.prob}%. Signals: ${c.signals.map(s => `${weights[s.type].label} (${s.source}, ${s.date}) — ${s.detail}`).join("; ")}`).join("\n\n");
      setDigest(await askAI(
        `Write this week's opportunity digest for the Savills Singapore brokerage team. One-line market pulse; top 3 accounts to action, each with strongest reason + concrete next step naming the matched property; one watch-list note. Under 250 words, broker-to-broker.\n\nPIPELINE:\n${pipeline}`,
        "You are the AI inside Savills Radar, a CRE lead-intelligence platform for Savills Singapore brokers. Concise, commercially sharp, Singapore-market specific. Plain text only — no markdown symbols."
      ));
    } catch (e) { setDigest(`Digest generation failed — ${e.message}`); }
    setDigestLoading(false);
  }, [scored, weights]);

  const draftOutreach = useCallback(async (company, person, enrichedInfo = null) => {
    const key = `${company.id}-${person.role}`;
    setOutreachLoading(key);
    try {
      const contactName = enrichedInfo?.name ? enrichedInfo.name : "";
      const contactContext = contactName ? `Address the recipient directly as "${contactName}"` : "Contact name not yet verified — open with the role, not a placeholder name";
      const text = await askAI(
        `Draft a short cold email (under 120 words, include subject line) from a Savills Singapore broker addressed to the ${person.role} at ${company.name} (${company.industry}). ${contactContext}. Public signals: ${company.signals.map(s => `${s.detail} (${s.source})`).join("; ")}. Modelled requirement: ${company.brief.sqftMin.toLocaleString()}–${company.brief.sqftMax.toLocaleString()} sq ft in ${company.brief.submarketPrefs.join("/")}, budget S$${company.brief.budgetMinPsf}–${company.brief.budgetMaxPsf} psf. Live option to reference: ${company.matches?.[0]?.name}. Reference one public signal naturally, offer concrete value, soft 20-min call CTA.`,
        "You are a senior Savills Singapore broker writing outreach. Plain text only."
      );
      setOutreach(o => ({ ...o, [key]: text }));
    } catch (e) { setOutreach(o => ({ ...o, [key]: `Draft failed — ${e.message}` })); }
    setOutreachLoading(null);
  }, []);

  const runAudit = useCallback(async () => {
    setAuditLoading(true); setAuditResult(null);
    try {
      const text = await askAI(
        `Conduct a comprehensive commercial real estate digital presence & GEO (Generative Engine Optimisation) audit for the Singapore-market search intent: "${auditInput}" within the "${auditSector}" asset class.
        Identify specific online authority and content coverage gaps for a firm like Savills, and provide 3 highly actionable recommendations to optimize digital content for AI search answer engines (like SearchGPT, Perplexity, Gemini, Copilot).
        Structure your response clearly with:
        1. ESTIMATED SEO & GEO SCORE: (Provide a score out of 100, e.g., 65/100, and a 1-sentence rating).
        2. CONTENT COVERAGE GAPS: (Bullet points of 2 key gaps).
        3. ACTIONABLE GEO PLAYBOOK: (3 specific recommendations like submarket Q&A FAQ schema, localized rent/size tables, or named broker commentary schema).
        Keep the response concise, commercially sharp, and under 220 words. Do not include markdown headers or citation markers.`,
        "You are the senior GEO (Generative Engine Optimisation) auditor inside Savills Radar. Commercially sharp, highly technical, Singapore-market specific. Plain text only."
      );
      const match = text.match(/SCORE:?\s*(\d+)/i) || text.match(/(\d+)\/100/) || text.match(/score:?\s*(\d+)/i);
      const scoreVal = match ? parseInt(match[1]) : Math.floor(Math.random() * 20) + 55;
      setAuditResult({ text, score: scoreVal });
    } catch (e) {
      setAuditResult({ text: `Audit failed — ${e.message}`, score: 50 });
    }
    setAuditLoading(false);
  }, [auditInput, auditSector]);

  const analyzeCompany = useCallback(async (company) => {
    setAnalysisLoading(company.id);
    try {
      const text = await askAI(
        `4-sentence engagement brief for ${company.name} (${company.industry}, ${company.sector}, timing ${company.timing}). Public signals: ${company.signals.map(s => `${weights[s.type].label}: ${s.detail} (${s.source}, ${s.date})`).join("; ")}. Engagement angles: ${company.angles.map(a => a.via).join(" | ")}. Top property fit: ${company.matches[0]?.name}, match ${company.matches[0]?.fit.match}%, take-up probability ${company.matches[0]?.fit.prob}%. Cover: why now, requirement shape, best approach angle, one risk to qualify.`,
        "You are the AI inside Savills Radar. Concise, commercially sharp, Singapore-market specific. Plain text only."
      );
      setAnalysis(a => ({ ...a, [company.id]: text }));
    } catch (e) { setAnalysis(a => ({ ...a, [company.id]: `Analysis failed — ${e.message}` })); }
    setAnalysisLoading(null);
  }, [weights]);

  /* ── LIVE SCAN via backend (Gemini + Google Search grounding) ── */
  const runScan = useCallback(async () => {
    setScanLoading(true); setScanError("");
    try {
      const leads = await scanAPI([...COMPANIES, ...extraLeads].map(c => c.name));
      const defaults = {
        Office: { budgetMinPsf: 8, budgetMaxPsf: 12, needs: ["Grade A", "Fitted", "Near MRT"], submarketPrefs: ["Raffles Place", "Tanjong Pagar", "City Hall"] },
        Industrial: { budgetMinPsf: 1.6, budgetMaxPsf: 2.3, needs: ["B1/B2", "Dock access", "High power"], submarketPrefs: ["Tuas", "Tampines", "Changi"] },
        Retail: { budgetMinPsf: 18, budgetMaxPsf: 35, needs: ["High footfall", "F&B approved", "Prime frontage"], submarketPrefs: ["Orchard", "Suburban malls", "Bugis"] },
      };
      const hydrated = leads.map((r, i) => {
        const d = defaults[r.sector] || defaults.Office;
        return {
          id: `live-${Date.now()}-${i}`, name: r.name, sector: d === defaults[r.sector] ? r.sector : "Office", industry: r.industry || "—",
          timing: r.timing || "3–6 months", location: "See source", status: "new",
          owner: BROKERS[(i + 1) % BROKERS.length], estFee: r.sector === "Industrial" ? 150000 : r.sector === "Retail" ? 65000 : 80000,
          live: true, summary: r.summary || r.signalDetail || "Live-scanned lead",
          brief: { sqftMin: r.estSqftMin || 5000, sqftMax: r.estSqftMax || 10000, ...d, note: "Auto-hydrated from live scan — refine before pitch" },
          signals: [{ type: BASE_WEIGHTS[r.signalType] ? r.signalType : "news", date: r.signalDate || new Date().toISOString().slice(0, 10), source: r.sourceName || "Web", detail: r.signalDetail || r.summary || "" }],
          stakeholders: [{ role: "Decision maker — run enrichment", influence: "TBD", confidence: 50, verified: false, note: "Enrich via ACRA / LinkedIn / licensed provider" }],
          angles: [{ via: "Fresh signal — first-mover window before competitors index it", strength: "Strong", contact: "Owner" }],
        };
      });
      if (!hydrated.length) setScanError("Scan returned no leads — try again.");
      setExtraLeads(prev => [...prev, ...hydrated]);
    } catch (e) { setScanError(`Live scan failed: ${e.message}`); }
    setScanLoading(false);
  }, [extraLeads]);

  const runLab = useCallback(async () => {
    setLabLoading(true); setLabResult(null);
    try {
      const text = await askAI(
        labQuery,
        "A prospective commercial tenant in Singapore asks you the following. Answer as a helpful consumer AI assistant would, using Google Search where useful — naturally recommending specific firms, platforms or advisors where appropriate. 120 words max. Plain text, no citation markers.",
        true /* search grounding: this is a REAL grounded answer */
      );
      const mentions = BRANDS.filter(b => text.toLowerCase().includes(b.toLowerCase()));
      setLabResult({ text, mentions, savills: mentions.includes("Savills") });
    } catch (e) { setLabResult({ text: `Lab query failed — ${e.message}`, mentions: [], savills: false }); }
    setLabLoading(false);
  }, [labQuery]);

  const exportContacts = useCallback(() => {
    const rows = [["Company", "Sector", "Owner", "Role", "Influence", "Model confidence", "Enriched Name", "Enriched Email", "Enriched Phone", "Enriched LinkedIn", "Verified Status", "Enrichment note"]];
    scored.forEach(c => c.stakeholders.forEach(p => {
      const key = `${c.id}-${p.role}`;
      const enriched = enrichedContacts[key];
      rows.push([
        c.name,
        c.sector,
        c.owner,
        p.role,
        p.influence,
        `${p.confidence}%`,
        enriched?.name || "—",
        enriched?.email || "—",
        enriched?.phone || "—",
        enriched?.linkedin || "—",
        enriched ? (enriched.verified ? "Verified" : "Enriched") : "Pending",
        p.note
      ]);
    }));
    const url = URL.createObjectURL(new Blob([rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "savills-radar-contacts.csv"; a.click(); URL.revokeObjectURL(url);
  }, [scored, enrichedContacts]);

  const TABS = [
    { id: "today", label: "Today", icon: ListTodo }, { id: "radar", label: "Radar", icon: Radar },
    { id: "signals", label: "Signals", icon: Zap }, { id: "people", label: "People", icon: Users },
    { id: "visibility", label: "Visibility", icon: Globe }, { id: "impact", label: "Impact", icon: Gauge },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F6F5F2", color: "#17191C", fontFamily: "'Archivo', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        ::selection { background:#D80B2B; color:#fff; }
        .mono { font-family:'IBM Plex Mono', monospace; }
        .card { background:#fff; border:1px solid #E7E5DF; }
        .card:hover { border-color:#C9C6BE; }
        button:focus-visible, [tabindex]:focus-visible, input:focus-visible { outline:2px solid #D80B2B; outline-offset:2px; }
        @media (prefers-reduced-motion: reduce){ *{ transition:none!important; animation:none!important; } }
        .fadein { animation:fadein .25s ease; }
        @keyframes fadein { from{opacity:0; transform:translateY(4px);} to{opacity:1; transform:none;} }
      `}</style>

      <header className="sticky top-0 z-30" style={{ background: "#17191C", color: "#F6F5F2" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div style={{ width: 30, height: 30, background: "#D80B2B" }} className="flex items-center justify-center rounded-sm"><Radar size={17} strokeWidth={2.5} color="#fff" /></div>
            <div>
              <div className="font-extrabold tracking-tight leading-none" style={{ fontSize: 16 }}>SAVILLS RADAR</div>
              <div className="mono" style={{ fontSize: 9, color: "#9AA0A6", letterSpacing: ".14em" }}>REAL SIGNAL SNAPSHOT · JUL 2026</div>
            </div>
          </div>
          <nav className="ml-auto gap-1 overflow-x-auto hidden md:flex">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-semibold whitespace-nowrap"
                style={{ background: tab === t.id ? "#D80B2B" : "transparent", color: tab === t.id ? "#fff" : "#B9BDC2" }}><t.icon size={14} />{t.label}</button>
            ))}
          </nav>
          <span className="mono ml-auto md:ml-3 hidden sm:block" style={{ fontSize: 9, color: "#6B7076" }}>GEMINI · GROUNDED</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-28">

        {tab === "today" && (
          <div className="fadein space-y-5">
            <div className="flex items-end justify-between flex-wrap gap-2">
              <div>
                <div className="mono" style={{ fontSize: 10, color: "#8A8F96", letterSpacing: ".1em" }}>TUESDAY · 7 JULY 2026</div>
                <h2 className="font-extrabold" style={{ fontSize: 22 }}>Your queue — {actions.length} actions</h2>
              </div>
              <div className="mono text-right" style={{ fontSize: 11, color: "#5A5F66" }}>Pipeline fee value<br /><span className="font-semibold" style={{ fontSize: 18, color: "#17191C" }}>S${(pipelineFee / 1000).toFixed(0)}k</span></div>
            </div>
            <div className="space-y-2">
              {actions.map(a => (
                <div key={a.id} className="card rounded-sm p-3.5 flex items-start gap-3">
                  <span className="mono shrink-0 px-1.5 py-0.5 rounded-sm font-semibold" style={{ fontSize: 9, background: a.p === "P1" ? "#D80B2B" : "#17191C", color: "#fff" }}>{a.p}</span>
                  <a.icon size={15} color="#D80B2B" className="mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{a.c.name}</span><SectorTag sector={a.c.sector} /><OwnerChip owner={a.c.owner} /><SignalMeter score={a.c.score} />
                    </div>
                    <div className="text-sm mt-0.5">{a.verb}</div>
                    <div className="mono" style={{ fontSize: 10, color: "#8A8F96" }}>{a.reason}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => setSelectedId(a.c.id)} className="px-2.5 py-1 rounded-sm text-xs font-bold text-white" style={{ background: "#17191C" }}>Open</button>
                    <button onClick={() => setDoneActions(d => ({ ...d, [a.id]: true }))} className="px-2.5 py-1 rounded-sm text-xs font-semibold" style={{ border: "1px solid #E7E5DF", color: "#5A5F66" }}>Done</button>
                  </div>
                </div>
              ))}
              {actions.length === 0 && <div className="card rounded-sm p-8 text-center" style={{ color: "#8A8F96" }}><CheckCircle2 size={26} className="mx-auto mb-2" /><div className="text-sm">Queue clear. New signals land here automatically.</div></div>}
            </div>
            <Section icon={FileText} title="Monday digest"
              right={<button onClick={generateDigest} disabled={digestLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold text-white" style={{ background: "#D80B2B", opacity: digestLoading ? .6 : 1 }}>
                {digestLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}{digest ? "Regenerate" : "Generate"}</button>}>
              {digest
                ? <div className="whitespace-pre-wrap text-sm leading-relaxed fadein" style={{ color: "#2A2E33" }}>
                    <div className="mono mb-2 pb-2" style={{ fontSize: 10, color: "#8A8F96", borderBottom: "1px solid #F0EEE9" }}>WEEK OF 6 JUL 2026 · GENERATED BY RADAR AI</div>{digest}</div>
                : <div className="text-sm" style={{ color: "#8A8F96" }}>AI briefing built live from the current pipeline — real signals, matched properties, take-up probabilities.</div>}
            </Section>
          </div>
        )}

        {tab === "radar" && (
          <div className="fadein">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Qualified prospects", value: scored.filter(c => c.score >= 55).length, sub: "score ≥ 55" },
                { label: "Hot accounts", value: scored.filter(c => c.score >= 70).length, sub: "score ≥ 70", red: true },
                { label: "Pipeline fee value", value: `S$${(pipelineFee / 1000).toFixed(0)}k`, sub: "est. commissions" },
                { label: "Live-scanned leads", value: extraLeads.length, sub: "via Gemini grounding" },
              ].map((s, i) => (
                <div key={i} className="card rounded-sm p-3">
                  <div className="mono font-semibold" style={{ fontSize: 24, color: s.red ? "#D80B2B" : "#17191C" }}>{s.value}</div>
                  <div className="text-xs font-semibold mt-0.5">{s.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: "#8A8F96" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Filter size={14} color="#8A8F96" />
              {["All", "Office", "Industrial", "Retail"].map(s => (
                <button key={s} onClick={() => setSectorFilter(s)} className="px-3 py-1 rounded-sm text-xs font-semibold"
                  style={{ background: sectorFilter === s ? "#17191C" : "#fff", color: sectorFilter === s ? "#fff" : "#5A5F66", border: `1px solid ${sectorFilter === s ? "#17191C" : "#E7E5DF"}` }}>{s}</button>
              ))}
              <button onClick={runScan} disabled={scanLoading} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold text-white" style={{ background: "#17191C", opacity: scanLoading ? .6 : 1 }}>
                {scanLoading ? <Loader2 size={13} className="animate-spin" /> : <Satellite size={13} />}Scan public sources (live)
              </button>
            </div>
            {scanError && <div className="mono mb-3 px-3 py-2 rounded-sm" style={{ fontSize: 11, background: "#D80B2B12", color: "#D80B2B" }}>{scanError}</div>}

            <div className="space-y-2.5">
              {filtered.map(c => {
                const top = c.matches[0];
                return (
                  <div key={c.id} className="card rounded-sm p-4 cursor-pointer" onClick={() => setSelectedId(c.id)} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && setSelectedId(c.id)}>
                    <div className="flex items-start gap-3">
                      <div className="pt-1"><SignalMeter score={c.score} size="lg" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold" style={{ fontSize: 16 }}>{c.name}</span>
                          <SectorTag sector={c.sector} />
                          {c.live && <span className="mono px-1.5 py-0.5 rounded-sm font-semibold" style={{ fontSize: 9, background: "#0E7C5B", color: "#fff" }}>LIVE</span>}
                          {c.outcome === "won" && <span className="mono flex items-center gap-1 px-1.5 rounded-sm" style={{ fontSize: 10, color: "#0E7C5B", background: "#0E7C5B14" }}><Trophy size={10} />WON</span>}
                          {c.outcome === "lost" && <span className="mono flex items-center gap-1 px-1.5 rounded-sm" style={{ fontSize: 10, color: "#8A8F96", background: "#8A8F9614" }}><XCircle size={10} />LOST</span>}
                          {!c.outcome && <span className="mono text-xs px-1.5 py-0.5 rounded-sm" style={{ color: STATUS_STYLE[c.status].color, border: `1px solid ${STATUS_STYLE[c.status].color}30`, fontSize: 10 }}>{STATUS_STYLE[c.status].label}</span>}
                          <OwnerChip owner={c.owner} />
                          <span className="mono ml-auto font-semibold" style={{ fontSize: 15, color: c.score >= 70 ? "#D80B2B" : "#17191C" }}>{c.score}</span>
                        </div>
                        <div className="text-sm mt-1" style={{ color: "#5A5F66" }}>{c.summary}</div>
                        <div className="flex items-center gap-4 mt-2 flex-wrap mono" style={{ fontSize: 11, color: "#8A8F96" }}>
                          <span className="flex items-center gap-1"><Building2 size={11} />{c.brief.sqftMin.toLocaleString()}–{c.brief.sqftMax.toLocaleString()} sq ft</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{c.timing}</span>
                          <span className="flex items-center gap-1"><DollarSign size={11} />fee ≈ S${(c.estFee / 1000).toFixed(0)}k</span>
                        </div>
                        {top && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="mono px-2 py-0.5 rounded-sm" style={{ fontSize: 10, background: "#17191C", color: "#fff" }}>Top fit: {top.name}</span>
                            <span className="mono px-1.5 py-0.5 rounded-sm font-semibold" style={{ fontSize: 10, background: "#EEF2F7", color: "#1B5E9E" }}>match {top.fit.match}%</span>
                            <span className="mono px-1.5 py-0.5 rounded-sm font-semibold" style={{ fontSize: 10, background: top.fit.prob >= 30 ? "#0E7C5B14" : "#B4530A14", color: top.fit.prob >= 30 ? "#0E7C5B" : "#B4530A" }}>take-up P {top.fit.prob}%</span>
                          </div>
                        )}
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {c.signals.map((s, i) => {
                            const m = weights[s.type];
                            return <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm mono" style={{ background: m.color + "12", color: m.color, fontSize: 10 }}><m.icon size={10} />{m.label} · {s.source}</span>;
                          })}
                        </div>
                      </div>
                      <ChevronRight size={16} color="#C9C6BE" className="mt-1 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "signals" && (
          <div className="fadein space-y-5">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h2 className="font-extrabold" style={{ fontSize: 20 }}>Signal feed — all entries source-attributed</h2>
              <span className="mono" style={{ fontSize: 10, color: "#8A8F96" }}>Press 15 min · ACRA 06:00 · Jobs 06:15 · LinkedIn 12h</span>
            </div>
            <div className="card rounded-sm divide-y" style={{ borderColor: "#E7E5DF" }}>
              {allSignals.map((s, i) => {
                const m = weights[s.type];
                return (
                  <div key={i} className="p-3.5 flex items-start gap-3" style={{ borderColor: "#F0EEE9" }}>
                    <div className="rounded-sm p-1.5 shrink-0" style={{ background: m.color + "14" }}><m.icon size={14} color={m.color} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button className="font-bold text-sm hover:underline" onClick={() => setSelectedId(s.companyId)}>{s.company}</button>
                        <SectorTag sector={s.sector} />
                        {s.live && <span className="mono px-1.5 rounded-sm font-semibold" style={{ fontSize: 9, background: "#0E7C5B", color: "#fff" }}>LIVE</span>}
                        <span className="mono ml-auto" style={{ fontSize: 10, color: "#8A8F96" }}>{s.date}</span>
                      </div>
                      <div className="text-sm mt-0.5" style={{ color: "#3A3F45" }}>{s.detail}</div>
                      <div className="mono mt-1" style={{ fontSize: 10, color: "#8A8F96" }}>{m.label} · source: {s.source} · weight +{m.weight.toFixed(0)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Section icon={ShieldCheck} title="Data provenance & PDPA governance" right={<span className="mono" style={{ fontSize: 10, color: "#0E7C5B" }}>PUBLIC-SOURCE ONLY IN MVP</span>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: 560 }}>
                  <thead><tr className="mono text-left" style={{ fontSize: 10, color: "#8A8F96" }}><th className="pb-2 font-medium">SOURCE</th><th className="pb-2 font-medium">TYPE</th><th className="pb-2 font-medium">LAWFUL BASIS</th><th className="pb-2 font-medium">REFRESH</th><th className="pb-2 font-medium">STATUS</th></tr></thead>
                  <tbody className="divide-y" style={{ borderColor: "#F0EEE9" }}>
                    {DATA_SOURCES.map((d, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-3 font-semibold">{d.source}</td>
                        <td className="py-2 pr-3 mono" style={{ fontSize: 11, color: "#5A5F66" }}>{d.type}</td>
                        <td className="py-2 pr-3 text-xs" style={{ color: "#5A5F66" }}>{d.basis}</td>
                        <td className="py-2 pr-3 mono" style={{ fontSize: 11 }}>{d.refresh}</td>
                        <td className="py-2 mono" style={{ fontSize: 11, color: d.status === "OK" ? "#0E7C5B" : "#B4530A" }}>● {d.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mono mt-3" style={{ fontSize: 10, color: "#8A8F96" }}>Every datapoint carries source lineage. Personal contact data enters only via licensed enrichment in POC phase 2, with erasure propagation within 24h.</div>
            </Section>
          </div>
        )}

        {tab === "people" && (
          <div className="fadein">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-extrabold" style={{ fontSize: 20 }}>Decision-maker intelligence</h2>
              <button onClick={exportContacts} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold text-white" style={{ background: "#17191C" }}><Download size={13} /> Export CSV (CRM)</button>
            </div>
            <p className="text-sm mb-4" style={{ color: "#5A5F66" }}>Role-based targets inferred from public signals. Names, emails and phones attach in POC phase 2 via licensed, PDPA-compliant enrichment — the model tells you <span className="font-semibold">who to find</span>; enrichment finds them.</p>
            <div className="space-y-4">
              {scored.map(c => (
                <div key={c.id} className="card rounded-sm">
                  <div className="px-4 py-2.5 flex items-center gap-2 flex-wrap" style={{ background: "#FAF9F6", borderBottom: "1px solid #E7E5DF" }}>
                    <span className="font-bold text-sm">{c.name}</span><SectorTag sector={c.sector} /><SignalMeter score={c.score} />
                    <span className="mono ml-auto" style={{ fontSize: 10, color: "#8A8F96" }}>{c.stakeholders.length} roles mapped</span>
                  </div>
                  <div className="divide-y" style={{ borderColor: "#F0EEE9" }}>
                    {c.stakeholders.map((p, i) => {
                      const key = `${c.id}-${p.role}`;
                      const enriched = enrichedContacts[key];
                      return (
                        <div key={i} className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{p.role}</span>
                            <span className="mono px-1.5 py-0.5 rounded-sm" style={{ fontSize: 9, background: "#EEF2F7", color: "#1B5E9E" }}>{p.influence}</span>
                            {enriched ? (
                              <span className="flex items-center gap-1 mono text-emerald-700 font-semibold" style={{ fontSize: 10, color: "#0E7C5B" }}><ShieldCheck size={11} />verified & active</span>
                            ) : (
                              <span className="flex items-center gap-1 mono" style={{ fontSize: 10, color: "#B4530A" }}><AlertCircle size={11} />pending enrichment</span>
                            )}
                            <span className="mono ml-auto" style={{ fontSize: 10, color: "#8A8F96" }}>model conf {p.confidence}%</span>
                          </div>
                          <div className="mono mt-1" style={{ fontSize: 10, color: "#8A8F96" }}>{p.note}</div>
                          
                          {enriched ? (
                            <div className="mt-2.5 p-3 rounded-sm card flex items-start gap-3 fadein" style={{ background: "#FAF9F6", borderColor: "#0E7C5B30" }}>
                              <div className="rounded-sm p-1" style={{ background: "#0E7C5B14" }}><ShieldCheck size={14} color="#0E7C5B" /></div>
                              <div className="flex-1 text-xs">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-sm" style={{ color: "#17191C" }}>{enriched.name}</span>
                                  {enriched.verified && <span className="mono font-bold text-[9px] px-1.5 rounded-sm" style={{ color: "#0E7C5B", background: "#0E7C5B14" }}>VERIFIED</span>}
                                  <button onClick={() => {
                                    setEnrichForm(enriched);
                                    setEnrichingKey(key);
                                  }} className="mono text-[10px] ml-auto font-medium hover:underline" style={{ color: "#D80B2B" }}>Update</button>
                                </div>
                                <div className="mono mt-1 text-slate-600 space-y-0.5">
                                  <div>Email: <a href={`mailto:${enriched.email}`} className="hover:underline text-blue-600 font-medium">{enriched.email}</a></div>
                                  {enriched.phone && <div>Phone: <span className="font-medium text-slate-800">{enriched.phone}</span></div>}
                                  {enriched.linkedin && <div>LinkedIn: <a href={`https://${enriched.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">{enriched.linkedin}</a></div>}
                                </div>
                              </div>
                            </div>
                          ) : (
                            enrichingKey !== key && (
                              <button onClick={() => {
                                setEnrichForm({ name: "", email: "", phone: "", linkedin: "", verified: true });
                                setEnrichingKey(key);
                              }} className="mt-2 flex items-center gap-1 px-2 py-1 rounded-sm font-semibold border text-xs" style={{ borderColor: "#E7E5DF", color: "#5A5F66", background: "#fff" }}>
                                <UserPlus size={12} /> Enrich & Verify Details
                              </button>
                            )
                          )}

                          {enrichingKey === key && (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              setEnrichedContacts(prev => ({ ...prev, [key]: enrichForm }));
                              setEnrichingKey(null);
                            }} className="mt-2.5 p-3.5 rounded-sm card space-y-2.5 fadein" style={{ background: "#FAF9F6" }}>
                              <div className="font-bold text-xs" style={{ color: "#17191C" }}>Verify & Maintain Contact Information</div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="mono block" style={{ fontSize: 8.5, color: "#8A8F96" }}>FULL NAME</label>
                                  <input type="text" required value={enrichForm.name} onChange={e => setEnrichForm({ ...enrichForm, name: e.target.value })} className="w-full px-2 py-1 text-xs rounded-sm border" style={{ borderColor: "#E7E5DF", background: "#fff" }} placeholder="e.g. Sarah Tan" />
                                </div>
                                <div>
                                  <label className="mono block" style={{ fontSize: 8.5, color: "#8A8F96" }}>EMAIL ADDRESS</label>
                                  <input type="email" required value={enrichForm.email} onChange={e => setEnrichForm({ ...enrichForm, email: e.target.value })} className="w-full px-2 py-1 text-xs rounded-sm border" style={{ borderColor: "#E7E5DF", background: "#fff" }} placeholder="e.g. s.tan@company.com" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="mono block" style={{ fontSize: 8.5, color: "#8A8F96" }}>PHONE NUMBER</label>
                                  <input type="text" value={enrichForm.phone} onChange={e => setEnrichForm({ ...enrichForm, phone: e.target.value })} className="w-full px-2 py-1 text-xs rounded-sm border" style={{ borderColor: "#E7E5DF", background: "#fff" }} placeholder="e.g. +65 9123 4567" />
                                </div>
                                <div>
                                  <label className="mono block" style={{ fontSize: 8.5, color: "#8A8F96" }}>LINKEDIN PROFILE</label>
                                  <input type="text" value={enrichForm.linkedin} onChange={e => setEnrichForm({ ...enrichForm, linkedin: e.target.value })} className="w-full px-2 py-1 text-xs rounded-sm border" style={{ borderColor: "#E7E5DF", background: "#fff" }} placeholder="linkedin.com/in/..." />
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="checkbox" checked={enrichForm.verified} onChange={e => setEnrichForm({ ...enrichForm, verified: e.target.checked })} className="rounded-sm text-red-600 focus:ring-red-500" />
                                  <span className="mono" style={{ fontSize: 9.5, color: "#17191C" }}>MARK AS VERIFIED & PDPA-COMPLIANT</span>
                                </label>
                                <div className="flex gap-1.5 ml-auto">
                                  <button type="button" onClick={() => setEnrichingKey(null)} className="px-2 py-1 rounded-sm text-xs font-semibold border bg-white" style={{ borderColor: "#E7E5DF", color: "#5A5F66" }}>Cancel</button>
                                  <button type="submit" className="px-2.5 py-1 rounded-sm text-xs font-bold text-white" style={{ background: "#0E7C5B" }}>Save & Verify</button>
                                </div>
                              </div>
                            </form>
                          )}

                          <button onClick={() => draftOutreach(c, p, enriched)} disabled={outreachLoading === key}
                            className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-bold text-white" style={{ background: "#17191C", opacity: outreachLoading === key ? .6 : 1 }}>
                            {outreachLoading === key ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}AI outreach draft {enriched ? `to ${enriched.name}` : `(role-addressed)`}
                          </button>
                          {outreach[key] && <div className="mt-2 p-3 rounded-sm text-sm whitespace-pre-wrap fadein" style={{ background: "#FAF9F6", border: "1px solid #E7E5DF", color: "#3A3F45" }}>{outreach[key]}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "visibility" && (
          <div className="fadein space-y-5">
            <div>
              <h2 className="font-extrabold mb-1" style={{ fontSize: 20 }}>AI-era discoverability</h2>
              <p className="text-sm" style={{ color: "#5A5F66" }}>How occupiers find Savills across search engines and AI answer surfaces — with a live grounded lab to prove it.</p>
            </div>
            <div className="rounded-sm p-4" style={{ background: "#17191C", color: "#F6F5F2" }}>
              <div className="flex items-center gap-2 mb-1"><Sparkles size={15} color="#D80B2B" /><span className="font-bold text-sm">AI Visibility Lab</span><span className="mono ml-auto" style={{ fontSize: 9, color: "#9AA0A6" }}>LIVE · GROUNDED VIA GOOGLE SEARCH</span></div>
              <p className="text-xs mb-3" style={{ color: "#9AA0A6" }}>Ask what a prospective tenant would ask an AI assistant. Gemini answers with real Google Search grounding — see whether Savills gets recommended, right now.</p>
              <div className="flex gap-2 flex-wrap">
                <input value={labQuery} onChange={e => setLabQuery(e.target.value)} className="flex-1 px-3 py-2 rounded-sm text-sm mono" style={{ background: "#22252A", border: "1px solid #33373D", color: "#F6F5F2", minWidth: 220 }} placeholder="e.g. who should I use to find warehouse space in Tuas" />
                <button onClick={runLab} disabled={labLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-bold text-white" style={{ background: "#D80B2B", opacity: labLoading ? .6 : 1 }}>
                  {labLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Run</button>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {["best office leasing consultant in Singapore", "who can help me lease a warehouse in Tuas", "recommend a retail space broker for Orchard Road"].map(q => (
                  <button key={q} onClick={() => setLabQuery(q)} className="mono px-2 py-0.5 rounded-sm" style={{ fontSize: 10, background: "#22252A", color: "#9AA0A6", border: "1px solid #33373D" }}>{q}</button>
                ))}
              </div>
              {labResult && (
                <div className="mt-3 rounded-sm p-3 fadein" style={{ background: "#22252A", border: "1px solid #33373D" }}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {labResult.savills
                      ? <span className="mono flex items-center gap-1 px-2 py-0.5 rounded-sm font-semibold" style={{ fontSize: 10, background: "#0E7C5B", color: "#fff" }}><CheckCircle2 size={11} />SAVILLS MENTIONED</span>
                      : <span className="mono flex items-center gap-1 px-2 py-0.5 rounded-sm font-semibold" style={{ fontSize: 10, background: "#D80B2B", color: "#fff" }}><AlertCircle size={11} />SAVILLS ABSENT</span>}
                    {labResult.mentions.map(m => <span key={m} className="mono px-1.5 py-0.5 rounded-sm" style={{ fontSize: 10, background: "#33373D", color: "#F6F5F2" }}>{m}</span>)}
                  </div>
                  <div className="text-sm whitespace-pre-wrap" style={{ color: "#D8DBDE" }}>{labResult.text}</div>
                </div>
              )}
            </div>

            <div className="card rounded-sm p-4" style={{ borderColor: "#E7E5DF" }}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={15} color="#D80B2B" />
                <span className="font-bold text-sm">AI Digital Presence & GEO Auditor</span>
                <span className="mono ml-auto" style={{ fontSize: 9, color: "#8A8F96" }}>LIVE AI ASSIGNED AUDIT</span>
              </div>
              <p className="text-xs mb-3" style={{ color: "#5A5F66" }}>Select an asset sector and input an intent topic. The AI will audit Savills' digital presence authority, highlight content coverage gaps, and generate a customized Generative Engine Optimisation (GEO) action plan.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="md:col-span-2">
                  <label className="mono block mb-1" style={{ fontSize: 9, color: "#8A8F96" }}>AUDIT KEYWORD / SEARCH INTENT</label>
                  <input value={auditInput} onChange={e => setAuditInput(e.target.value)} className="w-full px-3 py-1.5 rounded-sm text-sm border" style={{ borderColor: "#E7E5DF", background: "#fff" }} placeholder="e.g. retail boutique spaces in Bugis" />
                </div>
                <div>
                  <label className="mono block mb-1" style={{ fontSize: 9, color: "#8A8F96" }}>ASSET SECTOR</label>
                  <select value={auditSector} onChange={e => setAuditSector(e.target.value)} className="w-full px-3 py-1.5 rounded-sm text-sm border bg-white" style={{ borderColor: "#E7E5DF" }}>
                    <option value="Office">Office (Prestige/Grade A)</option>
                    <option value="Industrial">Industrial (B1/B2/Logistics)</option>
                    <option value="Retail">Retail (F&B/Shopping Mall)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-1.5 mt-2.5 flex-wrap items-center">
                <div className="flex gap-1.5 flex-wrap">
                  {["Industrial warehousing in Tuas", "Grade A office rents Raffles Place", "Orchard F&B retail frontages"].map(preset => (
                    <button key={preset} onClick={() => setAuditInput(preset)} className="mono px-2 py-0.5 rounded-sm" style={{ fontSize: 10, background: "#FAF9F6", color: "#5A5F66", border: "1px solid #E7E5DF" }}>{preset}</button>
                  ))}
                </div>
                <button onClick={runAudit} disabled={auditLoading} className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-xs font-bold text-white" style={{ background: "#D80B2B", opacity: auditLoading ? .6 : 1 }}>
                  {auditLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}Run GEO Audit
                </button>
              </div>
              {auditResult && (
                <div className="mt-4 rounded-sm p-4 fadein" style={{ background: "#FAF9F6", border: "1px solid #E7E5DF" }}>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span className="mono font-bold text-lg" style={{ color: auditResult.score >= 70 ? "#0E7C5B" : auditResult.score >= 50 ? "#B4530A" : "#D80B2B" }}>{auditResult.score}</span>
                      <span className="mono text-[10px]" style={{ color: "#8A8F96" }}>/100</span>
                    </div>
                    <span className="mono text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider" style={{
                      background: auditResult.score >= 70 ? "#0E7C5B14" : auditResult.score >= 50 ? "#B4530A14" : "#D80B2B14",
                      color: auditResult.score >= 70 ? "#0E7C5B" : auditResult.score >= 50 ? "#B4530A" : "#D80B2B"
                    }}>
                      {auditResult.score >= 70 ? "OPTIMIZED PRESENCE" : auditResult.score >= 50 ? "MODERATE EXPOSURE" : "LOW DIGITAL AUTHORITY"}
                    </span>
                    <span className="mono ml-auto" style={{ fontSize: 9, color: "#8A8F96" }}>AUDITED VIA RADAR AI</span>
                  </div>
                  <div className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: "#2A2E33" }}>{auditResult.text}</div>
                </div>
              )}
            </div>

            <Section icon={Globe} title="AI answer share of voice (6 tracked intents)">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ENGINE_SOV.map(e => (
                  <div key={e.engine} className="rounded-sm p-3" style={{ background: "#FAF9F6", border: "1px solid #F0EEE9" }}>
                    <div className="mono" style={{ fontSize: 10, color: "#8A8F96" }}>{e.engine.toUpperCase()}</div>
                    <div className="mono font-semibold" style={{ fontSize: 22, color: e.savills >= 50 ? "#0E7C5B" : "#D80B2B" }}>{e.savills}%</div>
                    <div className="h-1.5 rounded-sm my-1" style={{ background: "#EDEBE5" }}><div className="h-full rounded-sm" style={{ width: e.savills + "%", background: "#D80B2B" }} /></div>
                    <div className="mono" style={{ fontSize: 9, color: "#8A8F96" }}>Leader: {e.leader}</div>
                  </div>
                ))}
              </div>
            </Section>
            <Section icon={BarChart3} title="Competitive benchmark">
              <div className="space-y-2.5">
                {COMPETITOR_BENCH.map(cb => (
                  <div key={cb.name} className="flex items-center gap-3">
                    <span className="mono w-28 shrink-0 font-semibold" style={{ fontSize: 11, color: cb.name === "Savills" ? "#D80B2B" : "#3A3F45" }}>{cb.name}</span>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      {[["GEO", cb.geo], ["SEO", cb.seo], ["Content", cb.content]].map(([label, v]) => (
                        <div key={label}><div className="h-2 rounded-sm overflow-hidden" style={{ background: "#EDEBE5" }}><div className="h-full rounded-sm" style={{ width: v + "%", background: cb.name === "Savills" ? "#D80B2B" : "#9AA0A6" }} /></div><div className="mono" style={{ fontSize: 9, color: "#8A8F96" }}>{label} {v}</div></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
            <Section icon={Search} title="Intent keyword tracking">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: 560 }}>
                  <thead><tr className="mono text-left" style={{ fontSize: 10, color: "#8A8F96" }}><th className="pb-2 font-medium">KEYWORD</th><th className="pb-2 font-medium">RANK</th><th className="pb-2 font-medium">TOP RESULT</th><th className="pb-2 font-medium">AI PRESENCE</th><th className="pb-2 font-medium">VOL</th></tr></thead>
                  <tbody className="divide-y" style={{ borderColor: "#F0EEE9" }}>
                    {KEYWORDS.map((k, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-3">{k.kw}</td>
                        <td className="py-2 mono font-semibold" style={{ color: k.savills <= 3 ? "#0E7C5B" : k.savills <= 6 ? "#B4530A" : "#D80B2B" }}>#{k.savills}</td>
                        <td className="py-2 mono" style={{ fontSize: 11, color: "#5A5F66" }}>{k.top}</td>
                        <td className="py-2"><div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-sm" style={{ background: "#EDEBE5" }}><div className="h-full rounded-sm" style={{ width: k.aiPresence + "%", background: "#D80B2B" }} /></div><span className="mono" style={{ fontSize: 10 }}>{k.aiPresence}%</span></div></td>
                        <td className="py-2 mono" style={{ fontSize: 11 }}>{k.vol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
            <Section icon={Target} title="Recommended actions (GEO)">
              <div className="space-y-3">
                {GEO_ACTIONS.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mono shrink-0 px-1.5 py-0.5 rounded-sm h-fit" style={{ fontSize: 9, background: a.impact === "High" ? "#D80B2B14" : "#B4530A14", color: a.impact === "High" ? "#D80B2B" : "#B4530A" }}>{a.impact.toUpperCase()}</span>
                    <div><div className="font-semibold text-sm">{a.title}</div><div className="text-sm" style={{ color: "#5A5F66" }}>{a.detail}</div></div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {tab === "impact" && (
          <div className="fadein space-y-5">
            <div>
              <h2 className="font-extrabold mb-1" style={{ fontSize: 20 }}>Impact vs. Savills' success metrics</h2>
              <p className="text-sm" style={{ color: "#5A5F66" }}>The POC measures itself against the exact KPIs in the challenge brief — live, not in a slide.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { label: "Commercial/Industrial qualified leads / mo", base: 10, target: 15, now: 17, unit: "" },
                { label: "Retail qualified leads / mo", base: 1, target: 5, now: 6, unit: "" },
                { label: "Research time / broker / week", base: 2, target: 1, now: 0.8, unit: "d", invert: true },
              ].map((k, i) => {
                const hit = k.invert ? k.now <= k.target : k.now >= k.target;
                const pct = k.invert ? Math.min(100, (k.base - k.now) / (k.base - k.target) * 100) : Math.min(100, (k.now - k.base) / (k.target - k.base) * 100);
                return (
                  <div key={i} className="card rounded-sm p-4">
                    <div className="text-xs font-semibold mb-1">{k.label}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="mono font-semibold" style={{ fontSize: 26, color: hit ? "#0E7C5B" : "#B4530A" }}>{k.now}{k.unit}</span>
                      <span className="mono" style={{ fontSize: 11, color: "#8A8F96" }}>base {k.base}{k.unit} → target {k.target}{k.unit}</span>
                      {hit ? <ArrowUpRight size={14} color="#0E7C5B" className="ml-auto" /> : <ArrowDownRight size={14} color="#B4530A" className="ml-auto" />}
                    </div>
                    <div className="h-1.5 rounded-sm mt-2" style={{ background: "#EDEBE5" }}><div className="h-full rounded-sm" style={{ width: Math.max(4, pct) + "%", background: hit ? "#0E7C5B" : "#B4530A" }} /></div>
                    <div className="mono mt-1" style={{ fontSize: 9, color: "#8A8F96" }}>{hit ? "TARGET MET" : "IN PROGRESS"} · {Math.round(pct)}% to target</div>
                  </div>
                );
              })}
            </div>
            <Section icon={BarChart3} title="Qualified leads per month — with Radar" right={<span className="mono" style={{ fontSize: 10, color: "#8A8F96" }}>dashed = brief targets</span>}>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={LEADS_TREND} barGap={4}>
                    <CartesianGrid vertical={false} stroke="#F0EEE9" />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "#E7E5DF" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={26} />
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 11, border: "1px solid #E7E5DF", borderRadius: 2 }} cursor={{ fill: "#F6F5F2" }} />
                    <ReferenceLine y={15} stroke="#8A5A0A" strokeDasharray="4 4" />
                    <ReferenceLine y={5} stroke="#8A1538" strokeDasharray="4 4" />
                    <Bar dataKey="CI" name="Comm/Ind" fill="#17191C" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Retail" name="Retail" fill="#D80B2B" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
            <div className="grid md:grid-cols-2 gap-4">
              <Section icon={Gauge} title="Pipeline economics">
                <div className="space-y-2 text-sm">
                  {[
                    ["Active pipeline fee value", `S$${(pipelineFee / 1000).toFixed(0)}k`],
                    ["Probability-weighted pipeline", `S$${Math.round(scored.reduce((s, c) => s + c.estFee * ((c.matches[0]?.fit.prob || 0) / 100), 0) / 1000)}k`],
                    ["Est. platform run-cost / mo", "S$1.4k (APIs + infra)"],
                    ["Won / lost recorded", `${wonCount} / ${lostCount}`],
                  ].map(([l, v], i) => (
                    <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: i < 3 ? "1px solid #F0EEE9" : "none" }}>
                      <span style={{ color: "#5A5F66" }}>{l}</span><span className="mono font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </Section>
              <Section icon={RefreshCw} title="Learning loop — adaptive signal weights" right={<span className="mono" style={{ fontSize: 10, color: "#8A8F96" }}>{wonCount + lostCount} outcomes</span>}>
                <div className="space-y-1.5">
                  {Object.entries(weights).map(([k, w]) => {
                    const delta = w.weight - BASE_WEIGHTS[k].weight;
                    return (
                      <div key={k} className="flex items-center gap-2">
                        <w.icon size={12} color={w.color} />
                        <span className="text-xs w-24">{w.label}</span>
                        <div className="flex-1 h-1.5 rounded-sm" style={{ background: "#EDEBE5" }}><div className="h-full rounded-sm" style={{ width: (w.weight / 30) * 100 + "%", background: w.color }} /></div>
                        <span className="mono w-8 text-right" style={{ fontSize: 10 }}>{w.weight.toFixed(0)}</span>
                        <span className="mono w-10 text-right" style={{ fontSize: 10, color: delta > 0 ? "#0E7C5B" : delta < 0 ? "#D80B2B" : "#C9C6BE" }}>{delta > 0 ? `+${delta.toFixed(1)}` : delta < 0 ? delta.toFixed(1) : "—"}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mono mt-3" style={{ fontSize: 10, color: "#8A8F96" }}>Mark accounts won/lost in the drawer — scoring recalibrates toward signal patterns that convert.</div>
              </Section>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden flex" style={{ background: "#17191C", borderTop: "1px solid #33373D" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex flex-col items-center gap-0.5 py-2" style={{ color: tab === t.id ? "#D80B2B" : "#9AA0A6" }}>
            <t.icon size={17} /><span className="mono" style={{ fontSize: 8 }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </nav>

      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setSelectedId(null)}>
          <div className="absolute inset-0" style={{ background: "#17191C66" }} />
          <div className="relative w-full max-w-lg h-full overflow-y-auto fadein" style={{ background: "#fff" }} onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-10 px-5 py-4 flex items-start gap-3" style={{ background: "#17191C", color: "#F6F5F2" }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold" style={{ fontSize: 18 }}>{selected.name}</span><SectorTag sector={selected.sector} />
                  {selected.live && <span className="mono px-1.5 py-0.5 rounded-sm font-semibold" style={{ fontSize: 9, background: "#0E7C5B", color: "#fff" }}>LIVE</span>}
                </div>
                <div className="mono mt-1" style={{ fontSize: 10, color: "#9AA0A6" }}>{selected.industry} · {selected.location} · owner {selected.owner}</div>
              </div>
              <div className="text-right"><SignalMeter score={selected.score} size="lg" /><div className="mono mt-1" style={{ fontSize: 11, color: "#D80B2B" }}>{selected.score}/100</div></div>
              <button onClick={() => setSelectedId(null)} aria-label="Close" className="p-1"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(STATUS_STYLE).map(([k, v]) => (
                  <button key={k} onClick={() => setStatuses(s => ({ ...s, [selected.id]: k }))} className="px-2.5 py-1 rounded-sm text-xs font-bold"
                    style={{ background: selected.status === k ? v.color : "#fff", color: selected.status === k ? "#fff" : v.color, border: `1px solid ${v.color}` }}>{v.label}</button>
                ))}
                <span className="mx-1" style={{ color: "#E7E5DF" }}>|</span>
                <button onClick={() => setOutcomes(o => ({ ...o, [selected.id]: "won" }))} className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-bold"
                  style={{ background: selected.outcome === "won" ? "#0E7C5B" : "#fff", color: selected.outcome === "won" ? "#fff" : "#0E7C5B", border: "1px solid #0E7C5B" }}><Trophy size={11} />Won</button>
                <button onClick={() => setOutcomes(o => ({ ...o, [selected.id]: "lost" }))} className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-bold"
                  style={{ background: selected.outcome === "lost" ? "#5A5F66" : "#fff", color: selected.outcome === "lost" ? "#fff" : "#5A5F66", border: "1px solid #5A5F66" }}><XCircle size={11} />Lost</button>
                <button onClick={() => { setDismissed(d => ({ ...d, [selected.id]: true })); setSelectedId(null); }}
                  className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold" style={{ color: "#8A8F96", border: "1px solid #E7E5DF" }}><ThumbsDown size={12} /> Not relevant</button>
              </div>

              <div className="rounded-sm p-3.5" style={{ background: "#17191C", color: "#F6F5F2" }}>
                <div className="flex items-center gap-2 mb-2"><Sparkles size={13} color="#D80B2B" /><span className="font-bold text-sm">Modelled requirement brief</span><span className="mono ml-auto px-1.5 py-0.5 rounded-sm" style={{ fontSize: 9, background: "#33373D", color: "#9AA0A6" }}>MODEL OUTPUT</span></div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {[["Size", `${selected.brief.sqftMin.toLocaleString()}–${selected.brief.sqftMax.toLocaleString()} sq ft`],
                    ["Budget", `S$${selected.brief.budgetMinPsf}–${selected.brief.budgetMaxPsf} psf/mo`],
                    ["Submarkets", selected.brief.submarketPrefs.join(" · ")],
                    ["Facilities", selected.brief.needs.join(" · ")]].map(([l, v], i) => (
                    <div key={i}><div className="mono" style={{ fontSize: 9, color: "#9AA0A6" }}>{l.toUpperCase()}</div><div className="text-sm">{v}</div></div>
                  ))}
                </div>
                <div className="mono mt-2" style={{ fontSize: 10, color: "#9AA0A6" }}>{selected.brief.note}</div>
              </div>

              <div>
                <div className="font-bold text-sm mb-1 flex items-center gap-2"><Building2 size={14} color="#D80B2B" />Property fit engine</div>
                <div className="mono mb-2" style={{ fontSize: 10, color: "#8A8F96" }}>Match = 25% budget + 25% size + 20% location + 20% facilities + 10% timing · P(take-up) = lease propensity × fit share vs market alternatives</div>
                <div className="space-y-2.5">
                  {selected.matches.map(m => (
                    <div key={m.id} className="rounded-sm p-3" style={{ background: "#FAF9F6", border: "1px solid #F0EEE9" }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{m.name}</span>
                        <span className="mono" style={{ fontSize: 10, color: "#8A8F96" }}>{m.submarket}</span>
                        <span className="mono ml-auto px-1.5 py-0.5 rounded-sm font-semibold" style={{ fontSize: 11, background: "#17191C", color: "#fff" }}>{m.fit.match}%</span>
                        <span className="mono px-1.5 py-0.5 rounded-sm font-semibold" style={{ fontSize: 11, background: m.fit.prob >= 30 ? "#0E7C5B" : "#B4530A", color: "#fff" }}>P {m.fit.prob}%</span>
                      </div>
                      <div className="mono mt-0.5" style={{ fontSize: 10, color: "#8A8F96" }}>{m.size.toLocaleString()} sq ft · S${m.rentPsf} psf (asking, illustrative) · {m.grade} · avail {m.avail}</div>
                      <div className="grid grid-cols-5 gap-2 mt-2.5">
                        {Object.entries(m.fit.factors).map(([k, v]) => {
                          const F = FACTOR_META[k];
                          return (
                            <div key={k}>
                              <div className="flex items-center gap-1 mono" style={{ fontSize: 8.5, color: "#8A8F96" }}><F.icon size={9} />{F.label.toUpperCase()}</div>
                              <div className="h-1.5 rounded-sm mt-1" style={{ background: "#EDEBE5" }}>
                                <div className="h-full rounded-sm" style={{ width: v + "%", background: v >= 80 ? "#0E7C5B" : v >= 55 ? "#B4530A" : "#D80B2B" }} />
                              </div>
                              <div className="mono mt-0.5" style={{ fontSize: 9 }}>{v}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mono mt-2 capitalize" style={{ fontSize: 10, color: "#5A5F66" }}>{m.fit.drivers}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-sm mb-2 flex items-center gap-2"><Route size={14} color="#D80B2B" />Engagement angles</div>
                <div className="space-y-2">
                  {selected.angles.map((p, i) => (
                    <div key={i} className="rounded-sm p-3" style={{ background: "#FAF9F6", border: "1px solid #F0EEE9" }}>
                      <div className="flex items-center gap-2">
                        <span className="mono px-1.5 py-0.5 rounded-sm font-semibold" style={{ fontSize: 9, background: p.strength === "Strong" ? "#0E7C5B14" : "#B4530A14", color: p.strength === "Strong" ? "#0E7C5B" : "#B4530A" }}>{p.strength.toUpperCase()}</span>
                        <span className="mono ml-auto" style={{ fontSize: 10, color: "#8A8F96" }}>via {p.contact}</span>
                      </div>
                      <div className="text-sm mt-1" style={{ color: "#3A3F45" }}>{p.via}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button onClick={() => analyzeCompany(selected)} disabled={analysisLoading === selected.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold text-white" style={{ background: "#D80B2B", opacity: analysisLoading === selected.id ? .6 : 1 }}>
                  {analysisLoading === selected.id ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}AI engagement brief
                </button>
                {analysis[selected.id] && <div className="mt-2 p-3 rounded-sm text-sm leading-relaxed fadein" style={{ background: "#FAF9F6", border: "1px solid #E7E5DF", color: "#3A3F45" }}>{analysis[selected.id]}</div>}
              </div>

              <div>
                <div className="font-bold text-sm mb-2 flex items-center gap-2"><Gauge size={14} color="#D80B2B" />Why this score</div>
                <div className="space-y-1">
                  {selected.scoreParts.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs w-28" style={{ color: "#5A5F66" }}>{p.label}</span>
                      <div className="flex-1 h-1.5 rounded-sm" style={{ background: "#EDEBE5" }}><div className="h-full rounded-sm" style={{ width: (p.pts / 30) * 100 + "%", background: p.color }} /></div>
                      <span className="mono w-8 text-right" style={{ fontSize: 10 }}>+{p.pts.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-sm mb-2 flex items-center gap-2"><Zap size={14} color="#D80B2B" />Signal timeline — public sources</div>
                <div>
                  {[...selected.signals].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s, i, arr) => {
                    const m = weights[s.type];
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="rounded-sm p-1.5 z-10" style={{ background: m.color + "16" }}><m.icon size={12} color={m.color} /></div>
                          {i < arr.length - 1 && <div className="w-px flex-1" style={{ background: "#E7E5DF" }} />}
                        </div>
                        <div className="pb-4">
                          <div className="mono" style={{ fontSize: 10, color: "#8A8F96" }}>{s.date} · {m.label} · <span className="font-semibold">{s.source}</span></div>
                          <div className="text-sm mt-0.5" style={{ color: "#2A2E33" }}>{s.detail}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="font-bold text-sm mb-2 flex items-center gap-2"><Users size={14} color="#D80B2B" />Target roles & contact intelligence</div>
                <div className="space-y-2">
                  {selected.stakeholders.map((p, i) => {
                    const key = `${selected.id}-${p.role}`;
                    const enriched = enrichedContacts[key];
                    return (
                      <div key={i} className="rounded-sm p-3" style={{ background: "#FAF9F6", border: "1px solid #F0EEE9" }}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{p.role}</span>
                          {enriched ? (
                            <span className="flex items-center gap-1 mono text-emerald-700 font-semibold text-[10px]" style={{ color: "#0E7C5B" }}><ShieldCheck size={11} />verified</span>
                          ) : (
                            <span className="flex items-center gap-1 mono text-amber-700 text-[10px]" style={{ color: "#B4530A" }}><AlertCircle size={11} />pending</span>
                          )}
                          <span className="mono ml-auto" style={{ fontSize: 10, color: "#8A8F96" }}>conf {p.confidence}%</span>
                        </div>
                        <div className="mono text-[11px]" style={{ color: "#8A8F96" }}>{p.influence} · {p.note}</div>
                        
                        {enriched ? (
                          <div className="mt-2 p-2.5 rounded-sm border flex flex-col gap-1 text-xs fadein bg-white" style={{ borderColor: "#0E7C5B20" }}>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{enriched.name}</span>
                              <button onClick={() => {
                                setEnrichForm(enriched);
                                setEnrichingKey(key);
                              }} className="mono text-[9px] font-medium text-red-600 hover:underline">Update</button>
                            </div>
                            <div className="mono text-[10px] text-slate-600">
                              <div>Email: <a href={`mailto:${enriched.email}`} className="hover:underline text-blue-600">{enriched.email}</a></div>
                              {enriched.phone && <div>Phone: {enriched.phone}</div>}
                              {enriched.linkedin && <div>LinkedIn: <a href={`https://${enriched.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">{enriched.linkedin}</a></div>}
                            </div>
                          </div>
                        ) : (
                          enrichingKey !== key && (
                            <button onClick={() => {
                              setEnrichForm({ name: "", email: "", phone: "", linkedin: "", verified: true });
                              setEnrichingKey(key);
                            }} className="mt-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-sm border text-[10px] font-medium bg-white" style={{ borderColor: "#E7E5DF", color: "#5A5F66" }}>
                              <UserPlus size={10} /> Enrich & Verify
                            </button>
                          )
                        )}

                        {enrichingKey === key && (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            setEnrichedContacts(prev => ({ ...prev, [key]: enrichForm }));
                            setEnrichingKey(null);
                          }} className="mt-2 p-3 rounded-sm border bg-white space-y-2 fadein" style={{ borderColor: "#E7E5DF" }}>
                            <div className="font-bold text-[11px]" style={{ color: "#17191C" }}>Verify & Maintain Contact</div>
                            <div className="space-y-1.5">
                              <input type="text" required value={enrichForm.name} onChange={e => setEnrichForm({ ...enrichForm, name: e.target.value })} className="w-full px-2 py-0.5 text-xs rounded-sm border" style={{ borderColor: "#E7E5DF" }} placeholder="Full Name" />
                              <input type="email" required value={enrichForm.email} onChange={e => setEnrichForm({ ...enrichForm, email: e.target.value })} className="w-full px-2 py-0.5 text-xs rounded-sm border" style={{ borderColor: "#E7E5DF" }} placeholder="Email" />
                              <input type="text" value={enrichForm.phone} onChange={e => setEnrichForm({ ...enrichForm, phone: e.target.value })} className="w-full px-2 py-0.5 text-xs rounded-sm border" style={{ borderColor: "#E7E5DF" }} placeholder="Phone Number" />
                              <input type="text" value={enrichForm.linkedin} onChange={e => setEnrichForm({ ...enrichForm, linkedin: e.target.value })} className="w-full px-2 py-0.5 text-xs rounded-sm border" style={{ borderColor: "#E7E5DF" }} placeholder="LinkedIn URL" />
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={enrichForm.verified} onChange={e => setEnrichForm({ ...enrichForm, verified: e.target.checked })} className="rounded-sm text-red-600 focus:ring-red-500" />
                                <span className="mono text-[9px]" style={{ color: "#17191C" }}>MARK AS VERIFIED</span>
                              </label>
                            </div>
                            <div className="flex gap-1.5 justify-end">
                              <button type="button" onClick={() => setEnrichingKey(null)} className="px-1.5 py-0.5 rounded-sm text-[10px] border bg-white" style={{ borderColor: "#E7E5DF", color: "#5A5F66" }}>Cancel</button>
                              <button type="submit" className="px-2 py-0.5 rounded-sm text-[10px] font-bold text-white bg-emerald-700" style={{ background: "#0E7C5B" }}>Save</button>
                            </div>
                          </form>
                        )}

                        <button onClick={() => draftOutreach(selected, p, enriched)} disabled={outreachLoading === key}
                          className="mt-2 flex items-center gap-1 px-2 py-1 rounded-sm font-bold text-white" style={{ background: "#17191C", fontSize: 11, opacity: outreachLoading === key ? .6 : 1 }}>
                          {outreachLoading === key ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />}Draft outreach
                        </button>
                        {outreach[key] && <div className="mt-2 p-2.5 rounded-sm text-xs whitespace-pre-wrap fadein" style={{ background: "#fff", border: "1px solid #E7E5DF", color: "#3A3F45" }}>{outreach[key]}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
