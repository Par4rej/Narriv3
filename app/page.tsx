"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  Radar,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Activity,
  ChevronRight,
  Bell,
  RefreshCw,
  Flame,
  Eye,
  BarChart3,
} from "lucide-react";

type AssetKey = "NVDA" | "BTC" | "TSLA";
type TabKey = "overview" | "evidence" | "fade";

type ChangedItem = {
  label: string;
  value: string;
  tone: "up" | "down";
};

type EvidenceItem = {
  kind: "News" | "Market" | "AI";
  title: string;
  detail: string;
  tone: "Bullish" | "Bearish" | "Mixed";
};

type SourceContribution = {
  label: string;
  value: number;
};

type FadeItem = {
  name: string;
  score: number;
  note: string;
};

type ReportResponse = {
  symbol: string;
  name: string;
  price: string;
  move: string;
  updated: string;
  verdict: string;
  whyNow: string;
  strength: number;
  entry: number;
  crowding: number;
  confidence: number;
  fade: number;
  changed: ChangedItem[];
  bull: string[];
  bear: string[];
  evidence: EvidenceItem[];
  sourceMix: SourceContribution[];
  fadeBoard: FadeItem[];
};

const tabItems: Array<{
  key: TabKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "overview", label: "Overview", Icon: Eye },
  { key: "evidence", label: "Evidence", Icon: BarChart3 },
  { key: "fade", label: "Fade Board", Icon: ShieldAlert },
];

const watchlist = [
  { symbol: "NVDA", score: 78, move: "+1.2%" },
  { symbol: "BTC", score: 84, move: "+3.8%" },
  { symbol: "TSLA", score: 65, move: "-1.7%" },
  { symbol: "ETH", score: 74, move: "+2.4%" },
  { symbol: "MSTR", score: 80, move: "+4.1%" },
];

const fallbackReport: ReportResponse = {
  symbol: "NVDA",
  name: "NVIDIA",
  price: "$154.20",
  move: "+1.2%",
  updated: "loading...",
  verdict: "Loading live report",
  whyNow:
    "Narriv is pulling live market data and recent headlines to generate a fresh report.",
  strength: 78,
  entry: 58,
  crowding: 72,
  confidence: 81,
  fade: 41,
  changed: [
    { label: "Fetching live quote", value: "+1", tone: "up" },
    { label: "Refreshing headline flow", value: "+1", tone: "up" },
    { label: "Calculating entry quality", value: "+1", tone: "up" },
  ],
  bull: [
    "Live report generation is in progress",
    "Price and headline data will refresh on search",
    "This page is now wired for real backend data",
  ],
  bear: [
    "Social platforms are not live yet in this version",
    "Crowding and fade are currently derived from the first real data layer",
    "This is a shipping MVP, not the full ingestion stack",
  ],
  evidence: [
    {
      kind: "Market",
      title: "Loading live market pulse",
      detail: "Current price and move will appear after the first fetch completes.",
      tone: "Mixed",
    },
    {
      kind: "News",
      title: "Loading recent headlines",
      detail: "Recent news flow is being fetched from the backend.",
      tone: "Mixed",
    },
    {
      kind: "AI",
      title: "Generating decision brief",
      detail: "OpenAI is shaping the verdict and supporting sections.",
      tone: "Mixed",
    },
  ],
  sourceMix: [
    { label: "Price confirmation", value: 75 },
    { label: "Headline flow", value: 60 },
    { label: "Signal freshness", value: 80 },
    { label: "Crowding estimate", value: 62 },
    { label: "AI synthesis confidence", value: 78 },
  ],
  fadeBoard: [
    {
      name: "Late consensus media chatter",
      score: 67,
      note: "Useful as a crowding input when the story is widely known.",
    },
    {
      name: "Retail euphoria risk",
      score: 73,
      note: "Higher when attention and momentum run hotter than clarity.",
    },
    {
      name: "Jim Cramer counter-watch",
      score: 52,
      note: "Novelty input only, not a mechanical trading signal.",
    },
  ],
};

function tonePill(score: number) {
  if (score >= 80) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }
  if (score >= 65) {
    return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
  }
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
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 sm:rounded-[26px] sm:p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/42 sm:text-[11px]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white sm:mt-3 sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-sm text-white/52">{sub}</div>
    </div>
  );
}

export default function NarrivPage() {
  const [query, setQuery] = useState("NVDA");
  const [tab, setTab] = useState<TabKey>("overview");
  const [report, setReport] = useState<ReportResponse>(fallbackReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalized = useMemo(() => query.trim().toUpperCase(), [query]);

  async function loadReport(asset: string) {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/report?asset=${encodeURIComponent(asset)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to load report");
      }
      const data: ReportResponse = await res.json();
      setReport(data);
      setQuery(data.symbol);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load live report";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function runSearch() {
    if (!normalized) return;
    loadReport(normalized);
  }

  useEffect(() => {
    loadReport("NVDA");
  }, []);

  return (
    <main className="min-h-screen bg-[#02060b] text-white">
      <div className="mx-auto max-w-[1560px] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-6">
          <aside className="rounded-[24px] border border-white/8 bg-[#080c13]/92 p-4 shadow-[0_0_80px_rgba(0,0,0,0.35)] backdrop-blur sm:rounded-[30px] sm:p-5">
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

            <div className="mt-5 rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,18,28,0.95),rgba(6,10,16,0.95))] p-4 sm:mt-6 sm:rounded-[24px]">
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

            <div className="mt-5 rounded-[20px] border border-white/8 bg-white/[0.03] p-4 sm:mt-6 sm:rounded-[24px]">
              <div className="flex items-center gap-2 text-sm text-white/55">
                <Bell className="h-4 w-4 text-cyan-300" />
                Suggested Alerts
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <div className="rounded-2xl border border-white/6 bg-black/20 p-3">
                  Alert when strength rises above 80
                </div>
                <div className="rounded-2xl border border-white/6 bg-black/20 p-3">
                  Alert on price / attention divergence
                </div>
                <div className="rounded-2xl border border-white/6 bg-black/20 p-3">
                  Alert when fade pressure spikes
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-4 sm:space-y-6">
            <div className="rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(0,220,255,0.14),transparent_30%),linear-gradient(180deg,rgba(5,9,16,0.95),rgba(2,5,10,0.98))] p-4 shadow-[0_0_100px_rgba(0,0,0,0.45)] sm:rounded-[36px] sm:p-6 lg:p-7">
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-white/65 sm:px-4 sm:text-[11px]">
                    Robinhood feature demo
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:mt-5 sm:text-5xl lg:text-6xl">
                    Narrative signals,{" "}
                    <span className="text-cyan-300">ranked and usable.</span>
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/60 sm:mt-5 sm:text-lg sm:leading-8">
                    The fastest way to know whether the story around an asset is
                    getting stronger, weaker, or too crowded to trust.
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-3 backdrop-blur sm:rounded-[28px]">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex flex-1 items-center gap-3 rounded-[18px] bg-black/30 px-4 sm:rounded-[20px]">
                      <Search className="h-5 w-5 text-white/40" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") runSearch();
                        }}
                        className="h-14 w-full bg-transparent text-base outline-none placeholder:text-white/30 sm:text-lg"
                        placeholder="Try NVDA, BTC, or TSLA"
                      />
                    </div>
                    <button
                      onClick={runSearch}
                      className="h-14 rounded-[18px] bg-[#20d7ff] px-5 text-base font-medium text-black transition hover:brightness-105 sm:rounded-[20px] sm:px-6 sm:text-lg"
                    >
                      {loading ? "Loading..." : "Generate Report"}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["NVDA", "BTC", "TSLA"] as AssetKey[]).map((ticker) => (
                      <button
                        key={ticker}
                        onClick={() => loadReport(ticker)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          report.symbol === ticker
                            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                            : "border-white/8 bg-white/[0.03] text-white/60 hover:bg-white/[0.05]"
                        }`}
                      >
                        {ticker}
                      </button>
                    ))}
                    <button
                      onClick={() => loadReport(report.symbol)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-white/45"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh live
                    </button>
                  </div>

                  {error ? (
                    <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                      {error}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-4 2xl:grid-cols-[1.25fr_0.75fr] 2xl:gap-6">
              <section className="space-y-4 sm:space-y-6">
                <div className="rounded-[24px] border border-white/8 bg-[#070b11]/92 p-4 shadow-[0_0_80px_rgba(0,0,0,0.35)] sm:rounded-[34px] sm:p-7">
                  <div className="flex flex-col gap-5 border-b border-white/8 pb-5 sm:gap-6 sm:pb-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
                        <Radar className="h-3.5 w-3.5" />
                        {report.symbol} decision brief
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
                          <Clock3 className="h-4 w-4" />
                          Updated {report.updated}
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
                    </div>

                    <div className="w-full min-w-0 xl:w-auto xl:min-w-[240px]">
                      <div
                        className={`rounded-[24px] border p-5 text-center backdrop-blur sm:rounded-[30px] sm:p-6 ${tonePill(
                          report.strength
                        )}`}
                      >
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                          Verdict
                        </div>
                        <div className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                          {report.verdict}
                        </div>
                        <div className="mt-4 text-sm text-white/70">
                          Strength {report.strength}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:mt-6 md:grid-cols-2 xl:grid-cols-4">
                    <MiniMetric
                      label="Strength"
                      value={report.strength}
                      sub="story power"
                    />
                    <MiniMetric
                      label="Entry"
                      value={report.entry}
                      sub="from here"
                    />
                    <MiniMetric
                      label="Crowding"
                      value={report.crowding}
                      sub="consensus pressure"
                    />
                    <MiniMetric
                      label="Confidence"
                      value={report.confidence}
                      sub="signal quality"
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-[#070b11]/92 p-4 shadow-[0_0_80px_rgba(0,0,0,0.35)] sm:rounded-[34px] sm:p-7">
                  <div className="flex flex-wrap gap-2">
                    {tabItems.map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                          tab === key
                            ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                            : "border-white/8 bg-white/[0.03] text-white/55 hover:bg-white/[0.05]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {tab === "overview" && (
                    <div className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-2 lg:gap-5">
                      <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 sm:rounded-[28px] sm:p-5">
                        <div className="mb-4 flex items-center gap-2 text-lg font-medium">
                          <TrendingUp className="h-5 w-5 text-emerald-300" />
                          Bull Case
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
                      </div>

                      <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 sm:rounded-[28px] sm:p-5">
                        <div className="mb-4 flex items-center gap-2 text-lg font-medium">
                          <TrendingDown className="h-5 w-5 text-rose-300" />
                          Bear Case
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
                    </div>
                  )}

                  {tab === "evidence" && (
                    <div className="mt-5 space-y-4 sm:mt-6">
                      {report.evidence.map((item) => {
                        const Icon =
                          item.kind === "News"
                            ? Newspaper
                            : item.kind === "Market"
                            ? Activity
                            : Sparkles;

                        return (
                          <div
                            key={item.title}
                            className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 sm:rounded-[26px] sm:p-5"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex gap-4">
                                <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                                  <Icon className="h-5 w-5 text-cyan-300" />
                                </div>
                                <div>
                                  <div className="text-sm uppercase tracking-[0.18em] text-white/35">
                                    {item.kind}
                                  </div>
                                  <div className="mt-1 text-lg font-medium">
                                    {item.title}
                                  </div>
                                  <div className="mt-2 max-w-3xl text-white/62">
                                    {item.detail}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`w-fit rounded-full border px-3 py-1 text-sm ${
                                  item.tone === "Bullish"
                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                    : item.tone === "Bearish"
                                    ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                                    : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                                }`}
                              >
                                {item.tone}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {tab === "fade" && (
                    <div className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-3">
                      {report.fadeBoard.map((item) => (
                        <div
                          key={item.name}
                          className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 sm:rounded-[28px] sm:p-5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 text-sm text-white/55">
                              <ShieldAlert className="h-4 w-4 text-amber-300" />
                              Counter indicator
                            </div>
                            <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm text-amber-300">
                              {item.score}
                            </div>
                          </div>
                          <div className="mt-4 text-lg font-medium">
                            {item.name}
                          </div>
                          <div className="mt-2 text-white/62">{item.note}</div>
                          <div className="mt-4 h-2 rounded-full bg-white/8">
                            <div
                              className="h-2 rounded-full bg-amber-300"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-4 sm:space-y-6">
                <div className="rounded-[24px] border border-white/8 bg-[#070b11]/92 p-4 shadow-[0_0_80px_rgba(0,0,0,0.35)] sm:rounded-[34px] sm:p-6">
                  <div className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
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

                <div className="rounded-[24px] border border-white/8 bg-[#070b11]/92 p-4 shadow-[0_0_80px_rgba(0,0,0,0.35)] sm:rounded-[34px] sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xl font-semibold sm:text-2xl">
                        Source Contribution
                      </div>
                      <div className="mt-1 text-sm text-white/45">
                        How the story is being shaped
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-1 text-sm text-cyan-300">
                      Explore <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-5 space-y-4">
                    {report.sourceMix.map((item) => {
                      const displayValue = Math.max(0, Math.min(100, item.value));

                      return (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between text-sm text-white/65">
                            <span>{item.label}</span>
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

                <div className="rounded-[24px] border border-cyan-400/12 bg-cyan-400/[0.05] p-4 shadow-[0_0_80px_rgba(0,0,0,0.25)] sm:rounded-[34px] sm:p-6">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">
                    Narriv
                  </div>
                  <div className="mt-2 text-xl font-semibold sm:text-2xl">
                    Decision Layer
                  </div>
                  <p className="mt-3 text-white/62">
                    A decision-first layer that turns fragmented attention into
                    a ranked, evidence-backed signal a brokerage user can act on
                    in seconds.
                  </p>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
