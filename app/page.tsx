"use client";

import React, { useMemo, useState } from "react";
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
  MessageSquareText,
  PlaySquare,
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

const tabItems: Array<{
  key: TabKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "overview", label: "Overview", Icon: Eye },
  { key: "evidence", label: "Evidence", Icon: BarChart3 },
  { key: "fade", label: "Fade Board", Icon: ShieldAlert },
];

const assets = {
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA",
    price: "$154.20",
    move: "+1.2%",
    strength: 78,
    confidence: 81,
    crowding: 72,
    fade: 41,
    updated: "8 min ago",
    verdict: "Strong, but crowded",
    whyNow:
      "AI infrastructure remains the dominant market story, but upside is less clean than earlier phases because crowding is rising faster than signal quality.",
    changed: [
      { label: "Price confirmed the dominant thesis", value: "+6", tone: "up" },
      { label: "Influencer velocity cooled slightly", value: "-1", tone: "down" },
      { label: "Consensus pressure moved higher", value: "+8", tone: "up" },
    ],
    bull: [
      "AI capex still owns premium financial mindshare",
      "Price is confirming instead of rejecting the story",
      "High-quality discussion remains concentrated among serious market participants",
    ],
    bear: [
      "The setup is increasingly consensus and harder to surprise positively",
      "Story strength may be outrunning near-term upside asymmetry",
      "Late-cycle commentary is rising into event-heavy windows",
    ],
    evidence: [
      {
        kind: "News",
        icon: Newspaper,
        title: "AI capex framing remains dominant in market coverage",
        detail:
          "Coverage quality remains high and consistently points back to NVIDIA as a core beneficiary.",
        tone: "Bullish",
      },
      {
        kind: "Social",
        icon: MessageSquareText,
        title: "High-engagement discussion is still elevated",
        detail:
          "Conversation quality remains strong, but incremental acceleration is slower than earlier surges.",
        tone: "Bullish",
      },
      {
        kind: "Video",
        icon: PlaySquare,
        title: "Creator ecosystem remains constructive but more expectation-sensitive",
        detail:
          "Video narratives still support the thesis, though commentary is more crowded and valuation-aware.",
        tone: "Mixed",
      },
    ],
    sourceMix: [
      ["Price confirmation", 83],
      ["News and opinion", 77],
      ["YouTube creator layer", 68],
      ["X / social pulse", 62],
      ["Reddit communities", 54],
    ] as Array<[string, number]>,
    fadeBoard: [
      {
        name: "Late TV momentum chatter",
        score: 67,
        note: "Useful as a crowding input when the story is already saturated.",
      },
      {
        name: "Retail euphoric spike accounts",
        score: 73,
        note: "Historically noisy when expectations get stretched too quickly.",
      },
      {
        name: "Jim Cramer counter-watch",
        score: 52,
        note: "Novelty sentiment input only, not a mechanical signal.",
      },
    ],
  },
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$96,412",
    move: "+3.8%",
    strength: 84,
    confidence: 77,
    crowding: 79,
    fade: 36,
    updated: "4 min ago",
    verdict: "Very strong, but overheated",
    whyNow:
      "Bitcoin is being carried by a powerful institutional and macro narrative, but sentiment is running hot and the story is increasingly crowded.",
    changed: [
      { label: "Headline tone stayed positive", value: "+5", tone: "up" },
      { label: "Social velocity accelerated", value: "+7", tone: "up" },
      { label: "Crowding risk rose materially", value: "+10", tone: "up" },
    ],
    bull: [
      "Institutional and macro framing keeps expanding the audience",
      "Price confirmation remains strong",
      "Media share remains dominant relative to most crypto assets",
    ],
    bear: [
      "Crowding and sentiment heat are rising fast",
      "Policy and macro headlines can abruptly reverse tone",
      "Part of the social velocity is reflexive rather than fundamental",
    ],
    evidence: [
      {
        kind: "News",
        icon: Newspaper,
        title: "Coverage volume remains materially above baseline",
        detail:
          "Headline flow is broad, positive, and persistent across major outlets.",
        tone: "Bullish",
      },
      {
        kind: "Social",
        icon: MessageSquareText,
        title: "High-engagement posts continue to accelerate",
        detail:
          "Reach is expanding quickly, though quality varies more than institutional coverage.",
        tone: "Bullish",
      },
      {
        kind: "Video",
        icon: PlaySquare,
        title: "Creator attention remains elevated",
        detail:
          "Macro hedge framing is still being amplified aggressively in video ecosystems.",
        tone: "Bullish",
      },
    ],
    sourceMix: [
      ["Price confirmation", 88],
      ["News and opinion", 79],
      ["X / social pulse", 75],
      ["YouTube creator layer", 71],
      ["Reddit communities", 58],
    ] as Array<[string, number]>,
    fadeBoard: [
      {
        name: "Tourist crypto hype",
        score: 76,
        note: "Useful as a late-cycle heat input.",
      },
      {
        name: "Macro doom-whipsaw accounts",
        score: 43,
        note: "Can create false urgency spikes.",
      },
      {
        name: "Jim Cramer counter-watch",
        score: 58,
        note: "Novelty sentiment input only.",
      },
    ],
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla",
    price: "$242.87",
    move: "-1.7%",
    strength: 65,
    confidence: 62,
    crowding: 54,
    fade: 69,
    updated: "11 min ago",
    verdict: "Loud, conflicted, and noisy",
    whyNow:
      "Tesla remains one of the internet's loudest stories, but the signal stack is more chaotic than clean. Attention is huge, conviction is fragmented, and counter-signals are meaningful.",
    changed: [
      { label: "Counter-signal voices rose", value: "+4", tone: "up" },
      { label: "Confidence slipped", value: "-3", tone: "down" },
      { label: "Story stayed noisy", value: "+1", tone: "up" },
    ],
    bull: [
      "Few public equities command this much sustained mindshare",
      "Attention spikes can reignite quickly with catalyst flow",
      "Polarization can create opportunity if the story resolves cleanly",
    ],
    bear: [
      "Signal quality is noisier than top-tier setups",
      "Counter-indicator inputs are elevated",
      "Price and attention often diverge in uncomfortable ways",
    ],
    evidence: [
      {
        kind: "News",
        icon: Newspaper,
        title: "Coverage remains constant but split in tone",
        detail:
          "The asset receives nonstop attention, but the framing swings rapidly.",
        tone: "Mixed",
      },
      {
        kind: "Social",
        icon: MessageSquareText,
        title: "High velocity, low consensus",
        detail:
          "Engagement is massive, but agreement across camps is weak.",
        tone: "Mixed",
      },
      {
        kind: "Video",
        icon: PlaySquare,
        title: "Creator ecosystem is hyperactive but uneven",
        detail: "Narrative breadth is strong, but reliability varies widely.",
        tone: "Mixed",
      },
    ],
    sourceMix: [
      ["Social pulse", 80],
      ["News and opinion", 74],
      ["YouTube creator layer", 73],
      ["Price confirmation", 49],
      ["Reddit communities", 61],
    ] as Array<[string, number]>,
    fadeBoard: [
      {
        name: "Headline-chasing TV panels",
        score: 71,
        note: "Often react after sentiment has already swung.",
      },
      {
        name: "Retail fight-club accounts",
        score: 79,
        note: "High reach, low clarity.",
      },
      {
        name: "Jim Cramer counter-watch",
        score: 61,
        note: "Novelty sentiment input only.",
      },
    ],
  },
};

const watchlist = [
  { symbol: "NVDA", score: 78, move: "+1.2%" },
  { symbol: "BTC", score: 84, move: "+3.8%" },
  { symbol: "TSLA", score: 65, move: "-1.7%" },
  { symbol: "ETH", score: 74, move: "+2.4%" },
  { symbol: "MSTR", score: 80, move: "+4.1%" },
];

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
    <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/52">{sub}</div>
    </div>
  );
}

export default function NarrivPage() {
  const [query, setQuery] = useState("NVDA");
  const [selected, setSelected] = useState<AssetKey>("NVDA");
  const [tab, setTab] = useState<TabKey>("overview");

  const normalized = useMemo(() => query.trim().toUpperCase(), [query]);
  const asset = assets[selected];

  function runSearch() {
    if (normalized in assets) {
      setSelected(normalized as AssetKey);
      return;
    }
    if (normalized.includes("NVIDIA")) {
      setSelected("NVDA");
      return;
    }
    if (normalized.includes("BITCOIN")) {
      setSelected("BTC");
      return;
    }
    if (normalized.includes("TESLA")) {
      setSelected("TSLA");
      return;
    }
    setSelected("NVDA");
  }

  return (
    <main className="min-h-screen bg-[#02060b] text-white">
      <div className="mx-auto max-w-[1560px] px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[30px] border border-white/8 bg-[#080c13]/92 p-5 shadow-[0_0_80px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                  Narriv
                </div>
                <div className="mt-1 text-2xl font-semibold">Watchlist</div>
                <div className="mt-1 text-sm text-white/45">
                  Signals and alerts
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <Sparkles className="h-5 w-5 text-cyan-300" />
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,18,28,0.95),rgba(6,10,16,0.95))] p-4">
              <div className="flex items-center gap-2 text-sm text-white/55">
                <Activity className="h-4 w-4 text-emerald-300" />
                Tracked Assets
              </div>
              <div className="mt-4 space-y-2">
                {watchlist.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => {
                      if (item.symbol in assets) {
                        setSelected(item.symbol as AssetKey);
                        setQuery(item.symbol);
                      }
                    }}
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

            <div className="mt-6 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
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

          <section className="space-y-6">
            <div className="rounded-[36px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(0,220,255,0.14),transparent_30%),linear-gradient(180deg,rgba(5,9,16,0.95),rgba(2,5,10,0.98))] p-7 shadow-[0_0_100px_rgba(0,0,0,0.45)]">
              <div className="grid gap-7 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/65">
                    Robinhood feature demo
                  </div>
                  <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
                    Narrative signals,{" "}
                    <span className="text-cyan-300">ranked and usable.</span>
                  </h1>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
                    The fastest way to know whether the story around an asset is
                    getting stronger, weaker, or too crowded to trust.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-3 backdrop-blur">
                  <div className="flex gap-3">
                    <div className="flex flex-1 items-center gap-3 rounded-[20px] bg-black/30 px-4">
                      <Search className="h-5 w-5 text-white/40" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") runSearch();
                        }}
                        className="h-14 w-full bg-transparent text-lg outline-none placeholder:text-white/30"
                        placeholder="Try NVDA, BTC, or TSLA"
                      />
                    </div>
                    <button
                      onClick={runSearch}
                      className="rounded-[20px] bg-[#20d7ff] px-6 text-lg font-medium text-black transition hover:brightness-105"
                    >
                      Generate Report
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.keys(assets).map((ticker) => (
                      <button
                        key={ticker}
                        onClick={() => {
                          setSelected(ticker as AssetKey);
                          setQuery(ticker);
                        }}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selected === ticker
                            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                            : "border-white/8 bg-white/[0.03] text-white/60 hover:bg-white/[0.05]"
                        }`}
                      >
                        {ticker}
                      </button>
                    ))}
                    <button className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-white/45">
                      <RefreshCw className="h-4 w-4" />
                      Cached live mode
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
              <section className="space-y-6">
                <div className="rounded-[34px] border border-white/8 bg-[#070b11]/92 p-7 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
                  <div className="flex flex-col gap-6 border-b border-white/8 pb-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
                        <Radar className="h-3.5 w-3.5" />
                        {asset.symbol} decision brief
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <h2 className="text-4xl font-semibold tracking-tight">
                          {asset.name}
                        </h2>
                        <div
                          className={`rounded-full border px-3 py-1 text-sm ${tonePill(
                            asset.strength
                          )}`}
                        >
                          {asset.verdict}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/45">
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          Updated {asset.updated}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 ${
                            asset.move.startsWith("+")
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }`}
                        >
                          {asset.move.startsWith("+") ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                          {asset.price} {asset.move}
                        </span>
                      </div>
                      <p className="mt-5 text-xl leading-9 text-white/72">
                        {asset.whyNow}
                      </p>
                    </div>

                    <div className="min-w-[240px]">
                      <div
                        className={`rounded-[30px] border p-6 text-center backdrop-blur ${tonePill(
                          asset.strength
                        )}`}
                      >
                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                          Verdict
                        </div>
                        <div className="mt-3 text-2xl font-semibold text-white">
                          {asset.verdict}
                        </div>
                        <div className="mt-4 text-sm text-white/70">
                          Strength {asset.strength}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <MiniMetric
                      label="Strength"
                      value={asset.strength}
                      sub="story power"
                    />
                    <MiniMetric
                      label="Crowding"
                      value={asset.crowding}
                      sub="consensus pressure"
                    />
                    <MiniMetric
                      label="Confidence"
                      value={asset.confidence}
                      sub="signal quality"
                    />
                  </div>
                </div>

                <div className="rounded-[34px] border border-white/8 bg-[#070b11]/92 p-7 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
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
                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                        <div className="mb-4 flex items-center gap-2 text-lg font-medium">
                          <TrendingUp className="h-5 w-5 text-emerald-300" />
                          Bull Case
                        </div>
                        <div className="space-y-3">
                          {asset.bull.map((item) => (
                            <div
                              key={item}
                              className="rounded-2xl border border-white/6 bg-black/20 p-4 text-white/75"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                        <div className="mb-4 flex items-center gap-2 text-lg font-medium">
                          <TrendingDown className="h-5 w-5 text-rose-300" />
                          Bear Case
                        </div>
                        <div className="space-y-3">
                          {asset.bear.map((item) => (
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
                    <div className="mt-6 space-y-4">
                      {asset.evidence.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.title}
                            className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
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
                                className={`rounded-full border px-3 py-1 text-sm ${
                                  item.tone === "Bullish"
                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
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
                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                      {asset.fadeBoard.map((item) => (
                        <div
                          key={item.name}
                          className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5"
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

              <aside className="space-y-6">
                <div className="rounded-[34px] border border-white/8 bg-[#070b11]/92 p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-2 text-2xl font-semibold">
                    <Flame className="h-6 w-6 text-cyan-300" />
                    What changed
                  </div>
                  <div className="mt-5 space-y-3">
                    {asset.changed.map((item) => (
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

                <div className="rounded-[34px] border border-white/8 bg-[#070b11]/92 p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-semibold">
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
                    {asset.sourceMix.map(([label, value]) => (
                      <div key={label}>
                        <div className="mb-2 flex items-center justify-between text-sm text-white/65">
                          <span>{label}</span>
                          <span>{value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/8">
                          <div
                            className={`h-2 rounded-full ${barTone(value)}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[34px] border border-cyan-400/12 bg-cyan-400/[0.05] p-6 shadow-[0_0_80px_rgba(0,0,0,0.25)]">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">
                    Narriv
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
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

