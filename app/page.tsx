"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Database,
  BrainCircuit,
  Waves,
  Users,
  ChevronRight,
} from "lucide-react";

type PlatformCard = {
  platform: string;
  icon: string;
  accent: string;
  soft: string;
  volume: string;
  bull: number;
  bear: number;
  neutral: number;
  summary: string;
  tags: string[];
};

type FeedItem = {
  source: string;
  author: string;
  meta: string;
  tone: "Bullish" | "Mixed" | "Bearish";
  headline: string;
  body: string;
  impact: number;
  time: string;
};

type VoiceItem = {
  source: string;
  name: string;
  stance: "Bullish" | "Mixed" | "Bearish";
  reach: string;
  quote: string;
};

type AssetMeta = {
  symbol: string;
  name: string;
  type: string;
  price: string;
  change1D: string;
  change1W: string;
  change1M: string;
  changeYTD: string;
};

type AssetView = {
  symbol: string;
  pulseTitle: string;
  pulseSummary: string;
  updated: string;
  chips: string[];
  verdict: string;
  entry: number;
  cards: PlatformCard[];
  feed: FeedItem[];
  voices: VoiceItem[];
  velocity: string;
  percentile: string;
  signals24h: string;
};

const assetUniverse: AssetMeta[] = [
  { symbol: "NVDA", name: "NVIDIA Corp.", type: "Equity", price: "$154.20", change1D: "+1.2%", change1W: "+6.8%", change1M: "+18.4%", changeYTD: "+42.7%" },
  { symbol: "EQIX", name: "Equinix Inc.", type: "REIT", price: "$906.14", change1D: "+0.7%", change1W: "+2.1%", change1M: "+7.4%", changeYTD: "+11.3%" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Equity", price: "$243.88", change1D: "-1.9%", change1W: "+4.6%", change1M: "+9.2%", changeYTD: "-3.4%" },
  { symbol: "AAPL", name: "Apple Inc.", type: "Equity", price: "$257.46", change1D: "-1.1%", change1W: "+2.9%", change1M: "+6.1%", changeYTD: "+8.8%" },
  { symbol: "MSTR", name: "MicroStrategy", type: "Equity", price: "$441.70", change1D: "+3.4%", change1W: "+9.8%", change1M: "+24.3%", changeYTD: "+61.5%" },
  { symbol: "BTC", name: "Bitcoin", type: "Crypto", price: "$108,420", change1D: "+2.6%", change1W: "+7.2%", change1M: "+14.9%", changeYTD: "+51.0%" },
  { symbol: "MSFT", name: "Microsoft Corp.", type: "Equity", price: "$468.33", change1D: "+0.8%", change1W: "+3.3%", change1M: "+8.7%", changeYTD: "+16.2%" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "Equity", price: "$211.19", change1D: "+1.0%", change1W: "+2.4%", change1M: "+5.5%", changeYTD: "+12.6%" },
];

const views: Record<string, AssetView> = {
  NVDA: {
    symbol: "NVDA",
    pulseTitle: "NVDA — Narrative Pulse",
    pulseSummary:
      "NVIDIA’s narrative is accelerating sharply — driven by an earnings beat, raised guidance, and another wave of bullish AI infrastructure coverage. X and Reddit are consensus long, YouTube creators are amplifying upside cases, and TikTok heat is rising fast. The real risk is not lack of attention — it’s that consensus is building faster than price confirmation.",
    updated: "38s ago",
    chips: ["342 social threads", "218 reddit posts", "156 news articles", "89 videos", "442 short-form mentions"],
    verdict: "Narrative strengthening — lean bullish",
    entry: 32,
    cards: [
      {
        platform: "Twitter / X",
        icon: "𝕏",
        accent: "#1DA1F2",
        soft: "rgba(29,161,242,0.12)",
        volume: "342 posts · 12.4M reach",
        bull: 72,
        bear: 18,
        neutral: 10,
        summary: "FinTwit is strongly constructive. New highs and AI capex chatter are reinforcing the leadership narrative.",
        tags: ["#NVDA", "AI chips", "momentum"],
      },
      {
        platform: "Reddit",
        icon: "⬡",
        accent: "#FF5700",
        soft: "rgba(255,87,0,0.12)",
        volume: "218 posts · 8.2M views",
        bull: 68,
        bear: 24,
        neutral: 8,
        summary: "Retail discussion is positive, but the crowd is getting more consensus-heavy and less differentiated.",
        tags: ["r/wallstreetbets", "r/stocks", "crowding"],
      },
      {
        platform: "News",
        icon: "◉",
        accent: "#5E8AFF",
        soft: "rgba(94,138,255,0.12)",
        volume: "156 articles · 48 outlets",
        bull: 61,
        bear: 27,
        neutral: 12,
        summary: "Institutional coverage remains favorable, though more outlets are starting to publish valuation and overheating angles.",
        tags: ["Bloomberg", "Reuters", "CNBC"],
      },
      {
        platform: "YouTube",
        icon: "▶",
        accent: "#FF0033",
        soft: "rgba(255,0,51,0.12)",
        volume: "89 videos · 2.1M views",
        bull: 78,
        bear: 12,
        neutral: 10,
        summary: "Creator coverage is heavily bullish. Great for amplification, less great for finding early entries.",
        tags: ["creator", "amplification", "late-cycle"],
      },
      {
        platform: "TikTok",
        icon: "♪",
        accent: "#FE2C55",
        soft: "rgba(254,44,85,0.12)",
        volume: "442 videos · 18.6M views",
        bull: 82,
        bear: 8,
        neutral: 10,
        summary: "Short-form attention is ripping. Useful as a heat gauge, but historically this is where a story starts to feel obvious.",
        tags: ["retail heat", "viral", "overcrowded"],
      },
    ],
    feed: [
      {
        source: "X / Social",
        author: "Compound Capital",
        meta: "high-engagement thread",
        tone: "Bullish",
        headline: "NVDA earnings were a masterclass.",
        body: "Revenue beat by 12%, data center up 409% YoY. This isn’t a meme — it’s AI infrastructure. Adding to my position.",
        impact: 85,
        time: "4m ago",
      },
      {
        source: "Reddit",
        author: "u/deepvalue_plays",
        meta: "forum conviction",
        tone: "Bullish",
        headline: "DD: NVDA’s moat is widening.",
        body: "CUDA ecosystem lock-in is still underestimated. Every cloud provider increased GPU orders again for 2025.",
        impact: 72,
        time: "12m ago",
      },
      {
        source: "News",
        author: "Wall Street Journal",
        meta: "headline framing",
        tone: "Bearish",
        headline: "Has NVIDIA’s rally outpaced fundamentals?",
        body: "Coverage is beginning to ask whether AI enthusiasm has outrun fundamentals, which matters late in the narrative cycle.",
        impact: 90,
        time: "28m ago",
      },
      {
        source: "YouTube",
        author: "Financial Education",
        meta: "creator amplification",
        tone: "Bullish",
        headline: "Why I bought more NVDA",
        body: "Popular channels are still leaning bullish, but the tone is shifting from discovery to reinforcement.",
        impact: 68,
        time: "1h ago",
      },
    ],
    voices: [
      {
        source: "X / FinTwit",
        name: "@macrofundmike",
        stance: "Bullish",
        reach: "182K followers",
        quote: "The leadership trade is intact, but this stops being clean if price starts lagging the narrative.",
      },
      {
        source: "Reddit",
        name: "u/deepvalue_desk",
        stance: "Mixed",
        reach: "4.1K upvotes",
        quote: "Still bullish, but this no longer feels under-owned — it feels like the crowd knows the script.",
      },
      {
        source: "CNBC / TV",
        name: "Street panel",
        stance: "Mixed",
        reach: "TV / clips",
        quote: "The long-term AI story is intact, but more panelists are increasingly focused on expectations and valuation risk.",
      },
      {
        source: "YouTube",
        name: "Finance creator layer",
        stance: "Bullish",
        reach: "342K views",
        quote: "Creator coverage is still very constructive, but a lot of that energy now looks like reinforcement rather than fresh discovery.",
      },
    ],
    velocity: "3.2x",
    percentile: "84th",
    signals24h: "1,247",
  },
  EQIX: {
    symbol: "EQIX",
    pulseTitle: "EQIX — Narrative Pulse",
    pulseSummary:
      "Equinix is showing up as a quieter, higher-quality narrative: AI infrastructure exposure, data center scarcity, and institutional durability. The story is less hyped than NVDA, which is exactly what makes it more interesting. The opportunity is quality; the challenge is lower retail ignition.",
    updated: "1m ago",
    chips: ["74 social threads", "29 reddit posts", "91 news articles", "17 videos", "42 short-form mentions"],
    verdict: "Narrative building — quality, but quieter",
    entry: 44,
    cards: [
      {
        platform: "Twitter / X",
        icon: "𝕏",
        accent: "#1DA1F2",
        soft: "rgba(29,161,242,0.12)",
        volume: "74 posts · 1.8M reach",
        bull: 58,
        bear: 17,
        neutral: 25,
        summary: "Professional and infra-focused accounts are constructive, though the discussion is far more niche than hype-driven names.",
        tags: ["data centers", "AI infra", "quality"],
      },
      {
        platform: "Reddit",
        icon: "⬡",
        accent: "#FF5700",
        soft: "rgba(255,87,0,0.12)",
        volume: "29 posts · 410K views",
        bull: 41,
        bear: 19,
        neutral: 40,
        summary: "Retail chatter is thin, which keeps the setup less crowded but also less explosive near term.",
        tags: ["low attention", "underfollowed", "REIT"],
      },
      {
        platform: "News",
        icon: "◉",
        accent: "#5E8AFF",
        soft: "rgba(94,138,255,0.12)",
        volume: "91 articles · 31 outlets",
        bull: 64,
        bear: 14,
        neutral: 22,
        summary: "Institutional coverage is the strongest layer here. The narrative feels measured, durable, and less meme-prone.",
        tags: ["Bloomberg", "Barron’s", "institutional"],
      },
      {
        platform: "YouTube",
        icon: "▶",
        accent: "#FF0033",
        soft: "rgba(255,0,51,0.12)",
        volume: "17 videos · 230K views",
        bull: 46,
        bear: 12,
        neutral: 42,
        summary: "Creator coverage is limited but thoughtful. EQIX is being discussed more as a quality thesis than a hot trade.",
        tags: ["quality compounder", "infra", "underowned"],
      },
      {
        platform: "TikTok",
        icon: "♪",
        accent: "#FE2C55",
        soft: "rgba(254,44,85,0.12)",
        volume: "42 videos · 390K views",
        bull: 28,
        bear: 11,
        neutral: 61,
        summary: "Very little short-form heat, which reduces crowding but also means less viral tailwind.",
        tags: ["low retail heat", "quiet", "clean"],
      },
    ],
    feed: [
      {
        source: "X / Social",
        author: "InfraAlpha",
        meta: "data center thread",
        tone: "Bullish",
        headline: "EQIX keeps getting pulled into AI infra",
        body: "The story feels sober rather than euphoric — which is usually what you want from a durable narrative.",
        impact: 58,
        time: "9m ago",
      },
      {
        source: "News",
        author: "Barron’s",
        meta: "coverage shift",
        tone: "Bullish",
        headline: "An indirect AI winner with cleaner framing",
        body: "Coverage is leaning toward EQIX as an indirect AI winner with a more durable and less crowded setup.",
        impact: 63,
        time: "34m ago",
      },
      {
        source: "Reddit",
        author: "u/REITresearcher",
        meta: "niche thread",
        tone: "Mixed",
        headline: "Retail interest is still limited",
        body: "That may be exactly what keeps the trade cleaner if institutional attention keeps rising.",
        impact: 39,
        time: "52m ago",
      },
    ],
    voices: [
      {
        source: "X / Infra",
        name: "@dc_investor_type",
        stance: "Bullish",
        reach: "61K followers",
        quote: "EQIX is the kind of AI-adjacent narrative that benefits from quality and scarcity, not hype and retail velocity.",
      },
      {
        source: "News / TV",
        name: "Street coverage",
        stance: "Mixed",
        reach: "TV / print",
        quote: "The story is compelling, but the move is steadier and more institutionally driven than retail-mania names.",
      },
      {
        source: "YouTube",
        name: "Infra creator layer",
        stance: "Mixed",
        reach: "110K views est.",
        quote: "Coverage is more explanatory than promotional, which actually helps preserve the signal quality.",
      },
      {
        source: "Reddit",
        name: "u/REITresearcher",
        stance: "Mixed",
        reach: "1.1K upvotes",
        quote: "This is the kind of trade that works best when people are still bored by it.",
      },
    ],
    velocity: "1.4x",
    percentile: "63rd",
    signals24h: "253",
  },
};

function perfTone(value: string) {
  return value.startsWith("-")
    ? "text-rose-300 bg-rose-400/10 border-rose-400/20"
    : "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
}

function toneClasses(tone: "Bullish" | "Mixed" | "Bearish") {
  if (tone === "Bullish") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (tone === "Bearish") return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  return "border-amber-400/20 bg-amber-400/10 text-amber-300";
}

function entryLabel(entry: number) {
  if (entry < 35) return { label: "Early", color: "text-emerald-300" };
  if (entry < 55) return { label: "Mid", color: "text-cyan-300" };
  if (entry < 75) return { label: "Late", color: "text-amber-300" };
  return { label: "Crowded", color: "text-rose-300" };
}

export default function SocialFirstNarrivPreview() {
  const [symbol, setSymbol] = useState("NVDA");
  const [search, setSearch] = useState("NVDA");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const view = useMemo(() => views[symbol] || views.NVDA, [symbol]);
  const assetMeta = useMemo(() => assetUniverse.find((a) => a.symbol === symbol) || assetUniverse[0], [symbol]);
  const entryState = entryLabel(view.entry);
  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assetUniverse.slice(0, 6);
    return assetUniverse
      .filter((item) => item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pickAsset(nextSymbol: string) {
    setSymbol(nextSymbol);
    setSearch(nextSymbol);
    setShowSuggestions(false);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(94,231,255,0.14),transparent_20%),linear-gradient(180deg,#05060a,#0a0d15)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1480px] space-y-4 sm:space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:rounded-[36px] sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200/75">
                AI-powered narrative intelligence
              </div>
              <h1 className="mt-4 max-w-4xl text-[2.35rem] font-semibold leading-[1.02] tracking-tight sm:mt-5 sm:text-7xl">
                Should you bet on <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">this story?</span>
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">
                Narriv scans the public web across social, creators, and news — then turns the noise into a single narrative pulse you can actually act on.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="inline-flex items-center gap-2"><Database className="h-4 w-4 text-cyan-300" /> Finnhub market context</span>
                <span className="inline-flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-cyan-300" /> OpenAI web synthesis</span>
                <span className="inline-flex items-center gap-2"><Waves className="h-4 w-4 text-cyan-300" /> Narrative pulse</span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur sm:rounded-[30px] sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div ref={wrapperRef} className="relative flex-1">
                    <div className="flex items-center gap-3 rounded-[18px] bg-[#0a0d15] px-3 sm:rounded-[22px] sm:px-4">
                      <Search className="h-5 w-5 text-white/40" />
                      <input
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value.toUpperCase());
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const exact = assetUniverse.find((a) => a.symbol === search.toUpperCase());
                            if (exact) pickAsset(exact.symbol);
                          }
                        }}
                        className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-white/30 sm:h-14 sm:text-lg"
                        placeholder="Type a ticker or company"
                      />
                    </div>

                    {showSuggestions && suggestions.length > 0 ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 rounded-[24px] border border-white/10 bg-[#0b0f18]/96 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
                        {suggestions.map((item) => (
                          <button
                            key={item.symbol}
                            onClick={() => pickAsset(item.symbol)}
                            className="flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left transition hover:bg-white/[0.05]"
                          >
                            <div>
                              <div className="font-mono text-sm font-semibold text-white">{item.symbol}</div>
                              <div className="text-sm text-white/52">{item.name}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/52">{item.type}</span>
                              <ChevronRight className="h-4 w-4 text-white/35" />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <button
                    onClick={() => {
                      const exact = assetUniverse.find((a) => a.symbol === search.toUpperCase());
                      if (exact) pickAsset(exact.symbol);
                    }}
                    className="h-12 rounded-[18px] bg-[linear-gradient(135deg,#22ffaa,#00d4aa)] px-5 text-sm font-medium text-[#05060a] transition hover:scale-[1.01] hover:brightness-105 sm:h-14 sm:rounded-[22px] sm:px-7 sm:text-lg"
                  >
                    Analyze narrative
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["NVDA", "EQIX", "TSLA", "AAPL", "MSTR", "BTC"].map((pick) => (
                    <button
                      key={pick}
                      onClick={() => pickAsset(pick)}
                      className={`rounded-full border px-3 py-1.5 font-mono text-xs transition ${symbol === pick ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-white/[0.04] text-white/68 hover:bg-white/[0.08]"}`}
                    >
                      {pick}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.88),rgba(15,19,32,0.98))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Market snapshot</div>
                    <div className="mt-2 flex items-end gap-3">
                      <div className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{assetMeta.price}</div>
                      <div className={`rounded-full border px-3 py-1.5 text-sm ${perfTone(assetMeta.change1D)}`}>{assetMeta.change1D} today</div>
                    </div>
                    <div className="mt-2 text-sm text-white/56">{assetMeta.name} · {assetMeta.symbol} · {assetMeta.type}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:min-w-[320px] sm:grid-cols-4 sm:gap-3">
                    {[
                      { label: "1D", value: assetMeta.change1D },
                      { label: "1W", value: assetMeta.change1W },
                      { label: "1M", value: assetMeta.change1M },
                      { label: "YTD", value: assetMeta.changeYTD },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.045] p-2.5 text-center sm:rounded-[20px] sm:p-3">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">{item.label}</div>
                        <div className={`mt-2 text-sm font-semibold ${item.value.startsWith("-") ? "text-rose-300" : "text-emerald-300"}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:rounded-[36px] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                <div className="h-4 w-4 rounded-full border-2 border-emerald-300" />
              </div>
              <div>
                <div className="text-2xl font-semibold tracking-tight sm:text-3xl">{view.pulseTitle}</div>
                <div className="mt-1 text-sm text-white/56">Synthesized from live public-web surfaces</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/56">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Updated {view.updated}
            </div>
          </div>

          <div className="mt-6 rounded-[30px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(34,255,170,0.08),rgba(34,255,170,0.03))] p-6">
            <p className="text-base leading-7 text-white/90 sm:text-xl sm:leading-9">{view.pulseSummary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {view.chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 sm:gap-4">
          {view.cards.map((card) => {
            const tone = card.bull > card.bear ? "Bullish" : card.bear > card.bull ? "Bearish" : "Mixed";
            return (
              <div key={card.platform} className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.94),rgba(15,19,32,0.96))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:rounded-[30px] sm:p-5">
                <div className="-mx-5 -mt-5 mb-4 h-[2px] rounded-t-[30px]" style={{ backgroundColor: card.accent }} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-xs font-bold"
                        style={{ backgroundColor: card.soft, color: card.accent }}
                      >
                        {card.icon}
                      </span>
                      <div className="text-base font-medium text-white sm:text-lg">{card.platform}</div>
                    </div>
                    <div className="mt-1 text-xs text-white/46">{card.volume}</div>
                  </div>
                  <div className={`rounded-full border px-2.5 py-1 text-xs ${toneClasses(tone)}`}>{tone}</div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-white/48">
                  {[
                    { label: "BULL", value: card.bull, cls: "bg-emerald-400" },
                    { label: "BEAR", value: card.bear, cls: "bg-rose-400" },
                    { label: "NEUT", value: card.neutral, cls: "bg-slate-400" },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="mb-1 flex items-center justify-between"><span>{row.label}</span><span>{row.value}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/8"><div className={`h-2 rounded-full ${row.cls}`} style={{ width: `${row.value}%` }} /></div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-sm leading-6 text-white/80 sm:mt-4 sm:leading-7">{card.summary}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/52">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:rounded-[36px] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-emerald-300">Verdict</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{view.verdict}</div>
            </div>
            <div className={`rounded-full border px-3 py-2 text-sm ${entryState.color} border-white/10 bg-white/[0.04]`}>
              Entry timing: {entryState.label} — {view.entry}%
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 sm:gap-4">
            {[
              { label: "Strength", value: 78, hint: "story power" },
              { label: "Crowding", value: 72, hint: "consensus risk" },
              { label: "Confidence", value: 81, hint: "signal quality" },
              { label: "Bull / Bear", value: 68, hint: "sentiment ratio" },
              { label: "Entry", value: view.entry, hint: entryState.label.toLowerCase() },
            ].map((s) => (
              <div key={s.label} className="rounded-[20px] border border-white/10 bg-white/[0.045] p-3 sm:rounded-[26px] sm:p-4">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">{s.label}</div>
                <div className="mt-2 text-2xl font-semibold sm:text-3xl">{s.label === "Bull / Bear" ? "68 / 22" : s.value}</div>
                <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/8"><div className="h-[3px] rounded-full bg-cyan-400" style={{ width: `${s.value}%` }} /></div>
                <div className="mt-2 text-xs text-white/46">{s.hint}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/40">
              <span>Entry timing</span>
              <span>{entryState.label}</span>
            </div>
            <div className="relative h-8">
              <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-white/8">
                <div className="flex h-full w-full">
                  <div className="h-full w-[35%] bg-emerald-400" />
                  <div className="h-full w-[20%] bg-cyan-400" />
                  <div className="h-full w-[25%] bg-amber-400" />
                  <div className="h-full w-[20%] bg-rose-400" />
                </div>
              </div>
              <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-[#05060a]" style={{ left: `calc(${view.entry}% - 10px)` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-white/40">
              <span>Early</span>
              <span>Mid</span>
              <span>Late</span>
              <span>Crowded</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold tracking-tight">Live Signal Feed</div>
                <div className="mt-1 text-sm text-white/56">Representative items shaping the visible narrative around {view.symbol}</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/52">
                {["All", "X", "Reddit", "News", "YT"].map((f) => (
                  <span key={f} className={`rounded-full border px-3 py-1 ${f === "All" ? "border-white/10 bg-white/[0.06] text-white" : "border-white/10 bg-white/[0.04]"}`}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {view.feed.map((item) => (
                <div key={`${item.source}-${item.author}`} className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200">{item.source}</span>
                        <span className="text-sm font-medium text-white">{item.author}</span>
                        <span className="text-xs text-white/46">{item.meta}</span>
                      </div>
                      <div className="mt-3 text-[15px] font-semibold leading-6 text-white/90 sm:text-base">{item.headline}</div>
                      <div className="mt-1 text-sm leading-7 text-white/78 sm:text-base sm:leading-8">{item.body}</div>
                      <div className="mt-4 flex items-center gap-3 text-xs text-white/52">
                        <span className={`rounded-full border px-2.5 py-1 ${toneClasses(item.tone)}`}>{item.tone}</span>
                        <span>impact</span>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-white/8"><div className="h-2 rounded-full bg-cyan-400" style={{ width: `${item.impact}%` }} /></div></div>
                    </div>
                    <div className="text-xs text-white/40">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:p-8">
              <div className="text-2xl font-semibold tracking-tight">Attention Velocity</div>
              <div className="mt-1 text-sm text-white/56">How quickly this story is broadening right now</div>
              <div className="mt-5 rounded-[30px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(34,255,170,0.08),rgba(34,255,170,0.03))] p-5">
                <div className="flex h-32 items-end gap-2">
                  {[28, 32, 31, 36, 40, 38, 46, 44, 52, 57, 55, 63].map((h, idx) => (
                    <div key={idx} className="flex-1 rounded-t-md bg-emerald-400/80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4"><div className="text-2xl font-semibold text-emerald-300">{view.velocity}</div><div className="mt-1 text-xs text-white/46">vs 7d avg</div></div>
                <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4"><div className="text-2xl font-semibold text-amber-300">{view.percentile}</div><div className="mt-1 text-xs text-white/46">percentile</div></div>
                <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4"><div className="text-2xl font-semibold text-white">{view.signals24h}</div><div className="mt-1 text-xs text-white/46">signals / 24h</div></div>
              </div>
            </div>

            <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:p-8">
              <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <Users className="h-6 w-6 text-cyan-300" />
                Key Opinion Leaders
              </div>
              <div className="mt-1 text-sm text-white/56">Who appears to be shaping the visible framing around {view.symbol}</div>
              <div className="mt-5 space-y-3">
                {view.voices.map((voice) => (
                  <div key={`${voice.source}-${voice.name}`} className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.16em] text-white/40">{voice.source}</div>
                        <div className="mt-2 text-sm font-medium text-white">{voice.name}</div>
                        <div className="mt-1 text-xs text-white/46">{voice.reach}</div>
                      </div>
                      <div className={`rounded-full border px-2.5 py-1 text-xs ${toneClasses(voice.stance)}`}>{voice.stance}</div>
                    </div>
                    <div className="mt-4 text-sm leading-7 text-white/82">“{voice.quote}”</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:rounded-[36px] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200/75">
                Social-first landing page concept
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">A stronger front door than the current Narriv homepage.</h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-white/72">
                This version leads with the actual product promise: understanding the narrative around an asset. The deeper score-first workflow can still exist in the product, but this is the cleaner story to lead with.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm text-white transition hover:bg-white/[0.09]">
              Explore live narrative view
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
