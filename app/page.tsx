"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Newspaper,
  MessageSquare,
  PlayCircle,
  BarChart3,
  AlertTriangle,
  Gauge,
  Zap,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const sampleAssets = {
  BTC: {
    name: "Bitcoin",
    type: "Crypto",
    price: "$96,412",
    change1d: "+3.8%",
    narrativeScore: 84,
    verdict: "Constructive momentum",
    summary:
      "Bitcoin is being carried by a strong institutional and macro narrative, but shorter-term crowd sentiment is running hot. The signal stack suggests the story is powerful, though more crowded than clean.",
    pillars: [
      {
        label: "Price Confirmation",
        score: 88,
        detail: "Strong recent price action confirms the narrative instead of contradicting it.",
      },
      {
        label: "Media Tailwind",
        score: 79,
        detail: "Headline flow is supportive and has accelerated in the past 48 hours.",
      },
      {
        label: "Social Velocity",
        score: 91,
        detail: "Mentions and high-follower discussion are expanding quickly across major channels.",
      },
      {
        label: "Narrative Durability",
        score: 76,
        detail: "This is not purely a meme spike; the story has persisted over multiple cycles.",
      },
      {
        label: "Crowding Risk",
        score: 63,
        detail: "Sentiment is bullish, but positioning looks increasingly consensus-driven.",
      },
    ],
    catalysts: [
      "Institutional adoption and ETF-related capital flows",
      "Macro hedge framing in inflation and liquidity debates",
      "High share of financial media coverage versus altcoins",
    ],
    risks: [
      "Overheated social sentiment and crowded positioning",
      "Policy headlines can flip the tone very quickly",
      "Narrative strength may be outrunning short-term fundamentals",
    ],
    evidence: [
      {
        source: "News pulse",
        icon: Newspaper,
        headline: "Coverage volume is 2.4x the 30-day average with positive tone skew.",
      },
      {
        source: "Social pulse",
        icon: MessageSquare,
        headline: "High-engagement posts accelerated sharply over the last 24 hours.",
      },
      {
        source: "Video pulse",
        icon: PlayCircle,
        headline: "Creator discussion expanded with bullish thumbnail and title framing.",
      },
      {
        source: "Market pulse",
        icon: BarChart3,
        headline: "Price action is confirming narrative rather than diverging from it.",
      },
    ],
  },
  NVDA: {
    name: "NVIDIA",
    type: "Stock",
    price: "$154.20",
    change1d: "+1.2%",
    narrativeScore: 78,
    verdict: "Elite story, richer expectations",
    summary:
      "NVIDIA still owns one of the strongest narratives in public markets, but expectation risk is high. The engine sees durable attention with less asymmetric upside than earlier phases of the cycle.",
    pillars: [
      {
        label: "Price Confirmation",
        score: 82,
        detail: "Trend remains healthy and supports the dominant AI narrative.",
      },
      {
        label: "Media Tailwind",
        score: 86,
        detail: "Mainstream and finance media remain highly focused on AI capex beneficiaries.",
      },
      {
        label: "Social Velocity",
        score: 73,
        detail: "Conversation remains elevated, but incremental acceleration is moderate.",
      },
      {
        label: "Narrative Durability",
        score: 92,
        detail: "This is a highly persistent multi-quarter story, not a flash event.",
      },
      {
        label: "Crowding Risk",
        score: 54,
        detail: "Positioning and consensus optimism create a higher bar for surprise.",
      },
    ],
    catalysts: [
      "AI infrastructure spending",
      "Large-cap quality leadership",
      "Enterprise and hyperscaler demand framing",
    ],
    risks: [
      "Perfection risk into earnings",
      "Valuation sensitivity to any capex slowdown",
      "Narrative may remain strong even if returns compress",
    ],
    evidence: [
      {
        source: "News pulse",
        icon: Newspaper,
        headline: "Persistent AI capex framing supports premium attention share.",
      },
      {
        source: "Social pulse",
        icon: MessageSquare,
        headline: "High-quality discussion remains elevated across investor communities.",
      },
      {
        source: "Video pulse",
        icon: PlayCircle,
        headline: "YouTube creators still treat it as a flagship AI beneficiary.",
      },
      {
        source: "Market pulse",
        icon: BarChart3,
        headline: "Trend remains constructive, though less explosive than prior phases.",
      },
    ],
  },
  PSA10ZARD: {
    name: "1999 Charizard PSA 10",
    type: "Collectible",
    price: "$24,500",
    change1d: "+0.4%",
    narrativeScore: 67,
    verdict: "Strong icon, slower velocity",
    summary:
      "The card has elite cultural status and persistent collector demand, but the short-term narrative engine is slower and less catalytic than liquid markets. Great brand power, lower immediacy.",
    pillars: [
      {
        label: "Price Confirmation",
        score: 64,
        detail: "Price trend is stable, but momentum is not explosive.",
      },
      {
        label: "Media Tailwind",
        score: 51,
        detail: "Traditional media coverage is light unless tied to broader collectibles cycles.",
      },
      {
        label: "Social Velocity",
        score: 62,
        detail: "Collector discussion exists, but velocity is episodic.",
      },
      {
        label: "Narrative Durability",
        score: 95,
        detail: "One of the most durable collectibles stories on earth.",
      },
      {
        label: "Crowding Risk",
        score: 63,
        detail: "Widely recognized blue-chip status reduces true under-the-radar upside.",
      },
    ],
    catalysts: [
      "Nostalgia and brand permanence",
      "Visibility in high-end collector circles",
      "Long-term scarcity framing",
    ],
    risks: [
      "Lower liquidity than stocks or crypto",
      "Narrative bursts tend to be event-driven",
      "High entry price limits fresh participant flow",
    ],
    evidence: [
      {
        source: "News pulse",
        icon: Newspaper,
        headline: "Coverage is sparse but overwhelmingly prestige-oriented.",
      },
      {
        source: "Social pulse",
        icon: MessageSquare,
        headline: "Collector mentions are consistent, not viral.",
      },
      {
        source: "Video pulse",
        icon: PlayCircle,
        headline: "YouTube interest spikes around auctions and nostalgia cycles.",
      },
      {
        source: "Market pulse",
        icon: BarChart3,
        headline: "Sales appear resilient, though cadence is slower than liquid assets.",
      },
    ],
  },
};

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 65) return "bg-amber-500";
  return "bg-rose-500";
}

function PillarBar({
  label,
  score,
  detail,
}: {
  label: string;
  score: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          <div className="text-xs text-zinc-400">{detail}</div>
        </div>
        <div className="text-lg font-semibold text-white">{score}</div>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full ${scoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function ReportCard({
  asset,
}: {
  asset: (typeof sampleAssets)[keyof typeof sampleAssets];
}) {
  const changePositive = asset.change1d.startsWith("+");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
              {asset.type} Narrative Report
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {asset.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              {asset.summary}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-right">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Narrative Score
            </div>
            <div className="mt-1 text-5xl font-bold text-white">
              {asset.narrativeScore}
            </div>
            <div className="mt-2 text-sm font-medium text-cyan-300">
              {asset.verdict}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-400">
              Live Price
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {asset.price}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-400">
              1D Move
            </div>
            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
              {changePositive ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-rose-400" />
              )}
              {asset.change1d}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-400">
              Engine Verdict
            </div>
            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
              <Gauge className="h-5 w-5 text-cyan-300" />
              {asset.verdict}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {asset.pillars.map((pillar) => (
            <PillarBar key={pillar.label} {...pillar} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-cyan-300" />
            <h3 className="text-lg font-semibold">Signal Evidence</h3>
          </div>
          <div className="space-y-3">
            {asset.evidence.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.source}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-white">
                    <Icon className="h-4 w-4 text-cyan-300" />
                    {item.source}
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">
                    {item.headline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold">Catalysts</h3>
          </div>
          <ul className="space-y-3 text-sm text-zinc-300">
            {asset.catalysts.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-rose-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-4 flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-rose-300" />
            <h3 className="text-lg font-semibold">Narrative Risks</h3>
          </div>
          <ul className="space-y-3 text-sm text-zinc-300">
            {asset.risks.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default function NarrivDemoPage() {
  const [query, setQuery] = useState("BTC");
  const [selected, setSelected] = useState<keyof typeof sampleAssets>("BTC");

  const normalized = useMemo(() => query.trim().toUpperCase(), [query]);

  function runDemoSearch() {
    if (normalized in sampleAssets) {
      setSelected(normalized as keyof typeof sampleAssets);
      return;
    }
    if (normalized.includes("NVIDIA") || normalized === "NVDA") {
      setSelected("NVDA");
      return;
    }
    if (normalized.includes("CHARIZARD") || normalized.includes("POKEMON")) {
      setSelected("PSA10ZARD");
      return;
    }
    setSelected("BTC");
  }

  const asset = sampleAssets[selected];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(180deg,_#0a0a0a_0%,_#111827_100%)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header className="mb-8">
          <div className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-2xl shadow-black/30 backdrop-blur lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300">
                narriv.ai
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                The narrative decision layer.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
                Search a stock, crypto, collectible, or cultural asset and
                generate a narrative report card built from market action, media
                momentum, creator attention, and crowd velocity.
              </p>
            </div>

            <div className="flex w-full max-w-xl flex-col gap-3">
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-2">
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-black/30 px-3">
                  <Search className="h-4 w-4 text-zinc-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") runDemoSearch();
                    }}
                    placeholder="Try BTC, NVDA, or Charizard PSA 10"
                    className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                  />
                </div>
                <button
                  onClick={runDemoSearch}
                  className="rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-black transition hover:bg-cyan-300"
                >
                  Generate Report
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
                {["BTC", "NVDA", "PSA10ZARD"].map((ticker) => (
                  <button
                    key={ticker}
                    onClick={() => {
                      setQuery(ticker);
                      setSelected(ticker as keyof typeof sampleAssets);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                  >
                    {ticker}
                  </button>
                ))}
                <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-zinc-400 hover:bg-white/10">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Cached demo mode
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Headline Tone", value: "+18%", sub: "vs 7-day baseline" },
            { label: "Influencer Velocity", value: "High", sub: "weighted by reach" },
            { label: "Narrative Crowding", value: "Medium", sub: "consensus risk" },
            { label: "Price Confirmation", value: "On", sub: "market agrees" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur"
            >
              <div className="text-xs uppercase tracking-wide text-zinc-400">
                {item.label}
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {item.value}
              </div>
              <div className="mt-1 text-sm text-zinc-400">{item.sub}</div>
            </div>
          ))}
        </section>

        <ReportCard asset={asset} />
      </div>
    </main>
  );
}
