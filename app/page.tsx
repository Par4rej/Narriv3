"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Activity,
  ChevronRight,
  CheckCircle2,
  LineChart,
  Database,
  BrainCircuit,
  Globe2,
  Gauge,
  Flame,
  X,
} from "lucide-react";

type Suggestion = {
  symbol: string;
  name: string;
  type: string;
};

type ChangedItem = {
  label: string;
  value: string;
  tone: "up" | "down";
};

type ExplainItem = {
  label: string;
  detail: string;
};

type FadeSignal = {
  label: string;
  value: number;
  note: string;
};

type ReportResponse = {
  symbol: string;
  name: string;
  price: string;
  move: string;
  verdict: string;
  whyNow: string;
  dominantTheme: string;
  themeShift: string;
  earlyLate: number;
  earlyLateLabel: string;
  earlyLateDrivers: string[];
  strength: number;
  entry: number;
  crowding: number;
  confidence: number;
  attentionAcceleration: number;
  priceConfirmation: number;
  institutionalQuality: number;
  retailHeat: number;
  rsiStretch: number;
  updated: string;
  trust: string;
  changed: ChangedItem[];
  bull: string[];
  bear: string[];
  explainers: ExplainItem[];
  chart: number[];
  drivers: Array<[string, number]>;
  fadeSignals: FadeSignal[];
  fadeTake: string;
};

const fallbackReport: ReportResponse = {
  symbol: "NVDA",
  name: "NVIDIA",
  price: "$154.20",
  move: "+1.2%",
  verdict: "Loading live report",
  whyNow:
    "Narriv is fetching live quote, recent headlines, and building a timing read from the latest data.",
  dominantTheme: "Loading dominant theme",
  themeShift: "Waiting for live inputs to determine what changed.",
  earlyLate: 55,
  earlyLateLabel: "Balanced",
  earlyLateDrivers: ["Fetching quote", "Fetching headlines", "Scoring timing"],
  strength: 78,
  entry: 58,
  crowding: 72,
  confidence: 81,
  attentionAcceleration: 71,
  priceConfirmation: 83,
  institutionalQuality: 76,
  retailHeat: 62,
  rsiStretch: 69,
  updated: "just now",
  trust:
    "Powered by live quote, recent headlines, rolling baselines, and synthesized signal scoring",
  changed: [
    { label: "Fetching quote", value: "+1", tone: "up" },
    { label: "Refreshing headlines", value: "+1", tone: "up" },
    { label: "Calculating timing", value: "+1", tone: "up" },
  ],
  bull: [
    "Live report generation is in progress",
    "Price and headline context will refresh after search",
    "This page is wired to a real lookup + report flow",
  ],
  bear: [
    "This is still an MVP, not the full social ingestion stack",
    "Some assets will have thinner recent headline coverage",
    "The report is only as strong as the latest available data",
  ],
  explainers: [
    {
      label: "Strength",
      detail: "Built from price confirmation, headline flow, and signal quality.",
    },
    {
      label: "Entry",
      detail: "Penalized when crowding or technical stretch gets too elevated.",
    },
    {
      label: "Confidence",
      detail: "Higher when the dominant theme is coherent and price confirms it.",
    },
  ],
  chart: [92, 95, 97, 99, 102, 106, 111, 118, 124, 132, 139, 145, 148, 151, 154],
  drivers: [
    ["Price confirmation", 75],
    ["Headline flow", 66],
    ["Institutional attention", 62],
    ["Retail/social heat", 54],
    ["Overcrowding risk", 58],
  ],
  fadeSignals: [
    {
      label: "Consensus overcrowding",
      value: 58,
      note: "The setup is being evaluated against crowding and attention concentration.",
    },
    {
      label: "RSI stretch",
      value: 61,
      note: "Technical heat is estimated from recent price behavior.",
    },
    {
      label: "Late media pickup",
      value: 49,
      note: "Coverage breadth and novelty are part of the fade read.",
    },
    {
      label: "Retail heat",
      value: 52,
      note: "This layer will improve as broader social inputs are added.",
    },
    {
      label: "Price divergence",
      value: 35,
      note: "Price vs narrative quality is part of the timing framework.",
    },
  ],
  fadeTake:
    "Fade signals are being assembled from live price and headline context.",
};

function tonePill(score: number) {
  if (score >= 80) return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (score >= 65) return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
  return "border-amber-400/20 bg-amber-400/10 text-amber-300";
}

function barTone(score: number) {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 65) return "bg-cyan-400";
  return "bg-amber-400";
}

function MiniMetric({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 sm:p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/42 sm:text-[11px]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-sm text-white/52">{sub}</div>
    </div>
  );
}

function MiniChart({
  data,
  positive = true,
}: {
  data: number[];
  positive?: boolean;
}) {
  const width = 420;
  const height = 150;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 18) - 9;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const lineColor = positive ? "#22d3ee" : "#fb7185";
  const areaColor = positive
    ? "rgba(34,211,238,0.14)"
    : "rgba(251,113,133,0.14)";

  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 sm:text-[11px]">
            Price context
          </div>
          <div className="mt-1 text-sm text-white/60">1M trend</div>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
            positive
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-rose-400/20 bg-rose-400/10 text-rose-300"
          }`}
        >
          <LineChart className="h-4 w-4" />
          {positive ? "Uptrend intact" : "Trend under pressure"}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full sm:h-40">
        <polygon points={areaPoints} fill={areaColor} />
        <polyline
          fill="none"
          stroke={lineColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      <div className="mt-3 flex items-center justify-between text-xs text-white/35">
        <span>1M ago</span>
        <span>today</span>
      </div>
    </div>
  );
}

function EarlyLateGauge({
  value,
  label,
  drivers,
}: {
  value: number;
  label: string;
  drivers: string[];
}) {
  const display = Math.max(0, Math.min(100, value));

  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/42 sm:text-[11px]">
            Early or late
          </div>
          <div className="mt-1 text-sm text-white/55">
            Composite timing indicator
          </div>
        </div>
        <div className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-sm text-white/65">
          {label}
        </div>
      </div>

      <div className="mt-5">
        <div className="relative h-3 overflow-hidden rounded-full bg-[linear-gradient(90deg,#22c55e_0%,#22d3ee_35%,#f59e0b_70%,#f43f5e_100%)]">
          <div
            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-[#02060b] shadow-[0_0_0_4px_rgba(255,255,255,0.06)]"
            style={{ left: `calc(${display}% - 10px)` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-white/40">
          <span>Early</span>
          <span>Balanced</span>
          <span>Late</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {drivers.map((driver) => (
          <span
            key={driver}
            className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-xs text-white/65"
          >
            {driver}
          </span>
        ))}
      </div>

      <div className="mt-4 text-sm text-white/68">
        Aggregates price action, headline intensity, attention concentration,
        crowding, and entry quality into a single timing read.
      </div>
    </div>
  );
}

export default function NarrivLandingV2() {
  const [query, setQuery] = useState("NVDA");
  const [selectedSymbol, setSelectedSymbol] = useState("NVDA");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [report, setReport] = useState<ReportResponse>(fallbackReport);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const normalized = useMemo(() => query.trim().toUpperCase(), [query]);

  async function loadReport(symbol: string) {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/report?asset=${encodeURIComponent(symbol)}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load report");
      }

      setReport(data);
      setSelectedSymbol(data.symbol);
      setQuery(data.symbol);
      setShowSuggestions(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load live report";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSuggestions(q: string) {
    try {
      setSearchLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Search failed");
      setSuggestions(Array.isArray(data?.results) ? data.results : []);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }

  useEffect(() => {
    loadReport("NVDA");
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query.trim());
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, showSuggestions]);

  function selectSuggestion(item: Suggestion) {
    setSelectedSymbol(item.symbol);
    setQuery(item.symbol);
    setShowSuggestions(false);
    loadReport(item.symbol);
  }

  function runSearch() {
    if (!normalized) return;
    if (suggestions.length > 0) {
      selectSuggestion(suggestions[0]);
      return;
    }
    loadReport(normalized);
  }

  const watchlist = [
    { symbol: "NVDA", score: 78, move: "+1.2%" },
    { symbol: "BTC", score: 84, move: "+3.8%" },
    { symbol: "TSLA", score: 65, move: "-1.7%" },
    { symbol: "AAPL", score: 74, move: "-0.8%" },
    { symbol: "MSFT", score: 76, move: "+0.9%" },
  ];

  return (
    <main className="min-h-screen bg-[#02060b] text-white">
      <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/8 bg-[#080c13]/92 p-4 shadow-[0_0_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                  Narriv
                </div>
                <div className="mt-1 text-xl font-semibold sm:text-2xl">
                  Watchlist
                </div>
                <div className="mt-1 text-sm text-white/45">
                  Signals and alerts
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <Sparkles className="h-5 w-5 text-cyan-300" />
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,18,28,0.95),rgba(6,10,16,0.95))] p-4">
              <div className="flex items-center gap-2 text-sm text-white/55">
                <Activity className="h-4 w-4 text-emerald-300" />
                Tracked Assets
              </div>
              <div className="mt-4 space-y-2">
                {watchlist.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => loadReport(item.symbol)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.05]"
                  >
                    <div>
                      <div className="font-medium">{item.symbol}</div>
                      <div className="text-xs text-white/45">
                        Strength {item.score}
                      </div>
                    </div>
                    <div
                      className={`text-sm ${
                        item.move.startsWith("+")
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }`}
                    >
                      {item.move}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-sm text-white/55">
                <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                Why people trust it
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/72">
                <div className="rounded-2xl border border-white/6 bg-black/20 p-3">
                  Live market quote context
                </div>
                <div className="rounded-2xl border border-white/6 bg-black/20 p-3">
                  Recent headline ingestion
                </div>
                <div className="rounded-2xl border border-white/6 bg-black/20 p-3">
                  Signal synthesis and timing read
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(0,220,255,0.14),transparent_30%),linear-gradient(180deg,rgba(5,9,16,0.95),rgba(2,5,10,0.98))] p-5 shadow-[0_0_100px_rgba(0,0,0,0.45)] sm:p-7">
              <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200/75">
                    Turn market noise into a decision
                  </div>
                  <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
                    Know if the story behind an asset is{" "}
                    <span className="text-cyan-300">worth betting on.</span>
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                    Narriv blends price action, headlines, attention, and
                    crowding into a simple read: strong, weak, early, or late.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/48">
                    <span className="inline-flex items-center gap-2">
                      <Database className="h-4 w-4 text-cyan-300" /> Live
                      market data
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-cyan-300" /> Headline
                      ingestion
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-cyan-300" /> Signal
                      synthesis
                    </span>
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/8 bg-white/[0.04] p-3 backdrop-blur">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <div className="flex items-center gap-3 rounded-[18px] bg-black/30 px-4 sm:rounded-[20px]">
                        <Search className="h-5 w-5 text-white/40" />
                        <input
                          value={query}
                          onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onKeyDown={(e) => e.key === "Enter" && runSearch()}
                          className="h-14 w-full bg-transparent text-base outline-none placeholder:text-white/30 sm:text-lg"
                          placeholder="Search ticker or asset name"
                        />
                        {query ? (
                          <button
                            onClick={() => {
                              setQuery("");
                              setShowSuggestions(true);
                              setSuggestions([]);
                            }}
                            className="text-white/35 transition hover:text-white/60"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>

                      {showSuggestions ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[22px] border border-white/8 bg-[#0a0f17]/98 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
                          {searchLoading ? (
                            <div className="px-4 py-3 text-sm text-white/45">
                              Searching assets...
                            </div>
                          ) : suggestions.length > 0 ? (
                            suggestions.slice(0, 8).map((item) => (
                              <button
                                key={`${item.symbol}-${item.name}`}
                                onClick={() => selectSuggestion(item)}
                                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/[0.05] ${
                                  selectedSymbol === item.symbol
                                    ? "bg-white/[0.04]"
                                    : ""
                                }`}
                              >
                                <div>
                                  <div className="font-medium text-white">
                                    {item.symbol}
                                  </div>
                                  <div className="text-sm text-white/45">
                                    {item.name}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="rounded-full border border-white/8 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/45">
                                    {item.type}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-white/25" />
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-white/45">
                              No matches yet. Press enter to try the ticker directly.
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>

                    <button
                      onClick={runSearch}
                      className="h-14 rounded-[18px] bg-[#20d7ff] px-6 text-base font-medium text-black transition hover:brightness-105 sm:rounded-[20px] sm:text-lg"
                    >
                      {loading ? "Loading..." : "Generate Report"}
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-white/45">
                    Search stocks, ETFs, or major crypto and get a live timing read.
                  </p>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-rose-200">
                {error}
              </div>
            ) : null}

            <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-6">
                <div className="rounded-[32px] border border-white/8 bg-[#070b11]/92 p-5 shadow-[0_0_80px_rgba(0,0,0,0.35)] sm:p-7">
                  <div className="flex flex-col gap-6 border-b border-white/8 pb-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
                        <Gauge className="h-3.5 w-3.5" />
                        {report.symbol} live signal read
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                          {report.name}
                        </h2>
                        <div
                          className={`rounded-full border px-3 py-1 text-sm ${tonePill(
                            report.strength
                          )}`}
                        >
                          {report.verdict}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/45">
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4" /> {report.updated}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 ${
                            report.move.startsWith("+")
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }`}
                        >
                          {report.move.startsWith("+") ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                          {report.price} {report.move}
                        </span>
                      </div>
                      <p className="mt-5 text-lg leading-8 text-white/72 sm:text-xl sm:leading-9">
                        {report.whyNow}
                      </p>
                      <p className="mt-4 text-sm text-white/45">{report.trust}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MiniMetric label="Strength" value={report.strength} sub="how powerful the story is" />
                    <MiniMetric label="Entry" value={report.entry} sub="how attractive it looks now" />
                    <MiniMetric label="Crowding" value={report.crowding} sub="how consensus it feels" />
                    <MiniMetric label="Confidence" value={report.confidence} sub="how trustworthy the signal is" />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MiniMetric label="Attention" value={report.attentionAcceleration} sub="vs 7d baseline" />
                    <MiniMetric label="Price confirm" value={report.priceConfirmation} sub="narrative validation" />
                    <MiniMetric label="Institutional" value={report.institutionalQuality} sub="source quality" />
                    <MiniMetric label="RSI stretch" value={report.rsiStretch} sub="technical heat" />
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <MiniChart data={report.chart} positive={report.move.startsWith("+")} />
                    <EarlyLateGauge
                      value={report.earlyLate}
                      label={report.earlyLateLabel}
                      drivers={report.earlyLateDrivers}
                    />
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/42 sm:text-[11px]">
                        Dominant theme
                      </div>
                      <div className="mt-2 text-xl font-semibold text-white">
                        {report.dominantTheme}
                      </div>
                      <div className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/42 sm:text-[11px]">
                        Theme shift
                      </div>
                      <div className="mt-2 text-white/68">{report.themeShift}</div>
                    </div>

                    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/42 sm:text-[11px]">
                        Why this read
                      </div>
                      <div className="mt-4 space-y-3">
                        {report.explainers.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-white/6 bg-black/20 p-4"
                          >
                            <div className="text-sm font-medium text-white">
                              {item.label}
                            </div>
                            <div className="mt-1 text-sm text-white/62">
                              {item.detail}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="rounded-[32px] border border-white/8 bg-[#070b11]/92 p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-2 text-2xl font-semibold">
                    <Flame className="h-6 w-6 text-cyan-300" />
                    What changed
                  </div>
                  <div className="mt-5 space-y-3">
                    {report.changed.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-4"
                      >
                        <div className="max-w-[75%] text-white/75">
                          {item.label}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-sm ${
                            item.tone === "down"
                              ? "bg-rose-400/10 text-rose-300"
                              : "bg-emerald-400/10 text-emerald-300"
                          }`}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/8 bg-[#070b11]/92 p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-2xl font-semibold">Signal Blend</div>
                      <div className="mt-1 text-sm text-white/45">
                        What is driving this setup
                      </div>
                    </div>
                    <div className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-xs text-white/45">
                      breakdown view
                    </div>
                  </div>
                  <div className="mt-5 space-y-4">
                    {report.drivers.map(([label, value]) => {
                      const displayValue = Math.max(0, Math.min(100, Number(value)));
                      return (
                        <div key={String(label)}>
                          <div className="mb-2 flex items-center justify-between text-sm text-white/65">
                            <span>{label}</span>
                            <span>{displayValue}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/8">
                            <div
                              className={`h-2 rounded-full ${barTone(displayValue)}`}
                              style={{ width: `${displayValue}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/8 bg-[#070b11]/92 p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-2 text-2xl font-semibold">
                    <ShieldAlert className="h-6 w-6 text-amber-300" />
                    Fade Signals
                  </div>
                  <div className="mt-2 text-sm text-white/45">
                    Signals that suggest the story may be too obvious, too stretched, or too crowded.
                  </div>
                  <div className="mt-5 space-y-4">
                    {report.fadeSignals.map((item) => {
                      const displayValue = Math.max(0, Math.min(100, Number(item.value)));
                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/6 bg-white/[0.03] p-4"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="text-sm font-medium text-white">
                              {item.label}
                            </div>
                            <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm text-amber-300">
                              {displayValue}
                            </div>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/8">
                            <div
                              className="h-2 rounded-full bg-amber-300"
                              style={{ width: `${displayValue}%` }}
                            />
                          </div>
                          <div className="mt-3 text-sm text-white/62">{item.note}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70 sm:text-[11px]">
                      Narriv take
                    </div>
                    <div className="mt-2 text-sm text-white/75">{report.fadeTake}</div>
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/8 bg-[#070b11]/92 p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
                  <div className="mb-4 flex items-center gap-2 text-lg font-medium">
                    <TrendingUp className="h-5 w-5 text-emerald-300" /> Bull case
                  </div>
                  <div className="space-y-3">
                    {report.bull.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/6 bg-black/20 p-4 text-white/75"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 mt-6 flex items-center gap-2 text-lg font-medium">
                    <TrendingDown className="h-5 w-5 text-rose-300" /> Bear case
                  </div>
                  <div className="space-y-3">
                    {report.bear.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/6 bg-black/20 p-4 text-white/75"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
