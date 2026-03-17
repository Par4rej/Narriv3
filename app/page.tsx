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

type SearchResult = {
  symbol: string;
  name: string;
  type: string;
};

type MarketSnapshot = {
  symbol: string;
  name: string;
  type: string;
  price: string;
  change1D: string;
  change1W: string;
  change1M: string;
  changeYTD: string;
};

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
  time?: string;
};

type SocialScanResponse = {
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
  attentionLabel: string;
  attentionTake: string;
};

const emptyMarket: MarketSnapshot = {
  symbol: "",
  name: "No asset selected",
  type: "",
  price: "—",
  change1D: "—",
  change1W: "—",
  change1M: "—",
  changeYTD: "—",
};

const loadingSocial: SocialScanResponse = {
  symbol: "",
  pulseTitle: "Scanning narrative",
  pulseSummary:
    "Narriv is scanning live public-web results and building the narrative view.",
  updated: "just now",
  chips: ["Scanning public web", "Building pulse", "Fetching signals"],
  verdict: "Loading",
  entry: 50,
  cards: [
    {
      platform: "Twitter / X",
      icon: "X",
      accent: "#1DA1F2",
      soft: "rgba(29,161,242,0.12)",
      volume: "loading",
      bull: 50,
      bear: 25,
      neutral: 25,
      summary: "Loading public-web social scan.",
      tags: ["loading"],
    },
    {
      platform: "Reddit",
      icon: "R",
      accent: "#FF5700",
      soft: "rgba(255,87,0,0.12)",
      volume: "loading",
      bull: 50,
      bear: 25,
      neutral: 25,
      summary: "Loading indexed forum scan.",
      tags: ["loading"],
    },
    {
      platform: "News",
      icon: "N",
      accent: "#5E8AFF",
      soft: "rgba(94,138,255,0.12)",
      volume: "loading",
      bull: 50,
      bear: 25,
      neutral: 25,
      summary: "Loading news scan.",
      tags: ["loading"],
    },
    {
      platform: "YouTube",
      icon: "Y",
      accent: "#FF0033",
      soft: "rgba(255,0,51,0.12)",
      volume: "loading",
      bull: 50,
      bear: 25,
      neutral: 25,
      summary: "Loading creator scan.",
      tags: ["loading"],
    },
    {
      platform: "TikTok",
      icon: "T",
      accent: "#FE2C55",
      soft: "rgba(254,44,85,0.12)",
      volume: "loading",
      bull: 50,
      bear: 25,
      neutral: 25,
      summary: "Loading short-form scan.",
      tags: ["loading"],
    },
  ],
  feed: [],
  voices: [],
  velocity: "—",
  percentile: "—",
  signals24h: "—",
  attentionLabel: "Attention stable",
  attentionTake: "Narriv is still building the attention read for this asset.",
};

function perfTone(value: string) {
  if (!value || value === "—") {
    return "text-white/70 bg-white/5 border-white/10";
  }
  return value.startsWith("-")
    ? "text-rose-300 bg-rose-400/10 border-rose-400/20"
    : "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
}

function toneClasses(tone: "Bullish" | "Mixed" | "Bearish") {
  if (tone === "Bullish") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }
  if (tone === "Bearish") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  }
  return "border-amber-400/20 bg-amber-400/10 text-amber-300";
}

function entryLabel(entry: number) {
  if (entry < 35) return { label: "Early", color: "text-emerald-300" };
  if (entry < 55) return { label: "Mid", color: "text-cyan-300" };
  if (entry < 75) return { label: "Late", color: "text-amber-300" };
  return { label: "Crowded", color: "text-rose-300" };
}

function hasUsableValue(value: string) {
  return value && value !== "—";
}

const headlineAnimation = `
@keyframes narrivGradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

export default function Page() {
  const [symbol, setSymbol] = useState("");
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [market, setMarket] = useState<MarketSnapshot>(emptyMarket);
  const [social, setSocial] = useState<SocialScanResponse | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [marketError, setMarketError] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const entryState = useMemo(
    () => entryLabel(social?.entry ?? 50),
    [social?.entry]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchSuggestions(q: string) {
    try {
      setSearchLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Search failed");
      setSuggestions(Array.isArray(data?.results) ? data.results : []);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }

  useEffect(() => {
    if (!showSuggestions) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(search.trim());
    }, 180);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, showSuggestions]);

  async function loadMarket(nextSymbol: string) {
    setMarketLoading(true);
    setMarketError("");

    try {
      const res = await fetch(
        `/api/market?asset=${encodeURIComponent(nextSymbol)}`,
        {
          cache: "no-store",
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to load market data");
      setMarket(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load market data";

      setMarketError(message);
      setMarket({
        symbol: nextSymbol,
        name: "Market snapshot unavailable",
        type: "",
        price: "—",
        change1D: "—",
        change1W: "—",
        change1M: "—",
        changeYTD: "—",
      });
    } finally {
      setMarketLoading(false);
    }
  }

  async function loadSocial(nextSymbol: string) {
    setSocialLoading(true);
    setSocial({
      ...loadingSocial,
      symbol: nextSymbol,
      pulseTitle: `${nextSymbol} — Narrative Pulse`,
    });

    try {
      const res = await fetch(
        `/api/social-scan?asset=${encodeURIComponent(nextSymbol)}`,
        {
          cache: "no-store",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load narrative data");
      }

      setSocial(data);
    } catch {
      setSocial({
        ...loadingSocial,
        symbol: nextSymbol,
        pulseTitle: `${nextSymbol} — Narrative Pulse`,
        pulseSummary:
          "Narriv could not complete the live narrative scan right now, so this section is in safe fallback mode.",
        verdict: "Narrative scan unavailable",
        chips: ["Fallback mode", "Retry soon", "Live scan unavailable"],
      });
    } finally {
      setSocialLoading(false);
    }
  }

  async function loadAsset(nextSymbol: string) {
    const normalized = nextSymbol.trim().toUpperCase();
    if (!normalized) return;

    setSymbol(normalized);
    setSearch(normalized);
    setShowSuggestions(false);

    await loadMarket(normalized);
    void loadSocial(normalized);
  }

  function pickAsset(nextSymbol: string) {
    void loadAsset(nextSymbol);
  }

  const hasSelectedAsset = Boolean(symbol);
  const socialData = social || loadingSocial;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(94,231,255,0.14),transparent_20%),linear-gradient(180deg,#05060a,#0a0d15)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <style jsx global>{headlineAnimation}</style>

      <div className="mx-auto max-w-[1480px] space-y-4 sm:space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:rounded-[36px] sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200/75">
                AI-powered narrative intelligence
              </div>
              <h1 className="mt-4 max-w-4xl text-[2.35rem] font-semibold leading-[1.02] tracking-tight sm:mt-5 sm:text-7xl">
                Should you bet on{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #86efac, #67e8f9, #60a5fa, #67e8f9, #86efac)",
                    backgroundSize: "220% 220%",
                    animation: "narrivGradientShift 8s ease-in-out infinite",
                  }}
                >
                  this story?
                </span>
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">
                Narriv scans the public web across social, creators, and news —
                then turns the noise into a single narrative pulse you can
                actually act on.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="inline-flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-300" />
                  Finnhub market context
                </span>
                <span className="inline-flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-cyan-300" />
                  OpenAI web synthesis
                </span>
                <span className="inline-flex items-center gap-2">
                  <Waves className="h-4 w-4 text-cyan-300" />
                  Narrative pulse
                </span>
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
                          if (e.key === "Enter" && search.trim()) {
                            void loadAsset(search);
                          }
                        }}
                        className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-white/30 sm:h-14 sm:text-lg"
                        placeholder="Type a ticker or company"
                      />
                    </div>

                    {showSuggestions ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 rounded-[24px] border border-white/10 bg-[#0b0f18]/96 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
                        {searchLoading ? (
                          <div className="px-4 py-3 text-sm text-white/52">
                            Searching assets...
                          </div>
                        ) : suggestions.length > 0 ? (
                          suggestions.map((item) => (
                            <button
                              key={item.symbol}
                              onClick={() => pickAsset(item.symbol)}
                              className="flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left transition hover:bg-white/[0.05]"
                            >
                              <div>
                                <div className="font-mono text-sm font-semibold text-white">
                                  {item.symbol}
                                </div>
                                <div className="text-sm text-white/52">
                                  {item.name}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/52">
                                  {item.type}
                                </span>
                                <ChevronRight className="h-4 w-4 text-white/35" />
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-white/52">
                            No suggestions yet. Press enter to try the symbol
                            directly.
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <button
                    onClick={() => {
                      if (search.trim()) {
                        void loadAsset(search);
                      }
                    }}
                    className="h-12 rounded-[18px] bg-[linear-gradient(135deg,#22ffaa,#00d4aa)] px-5 text-sm font-medium text-[#05060a] transition hover:scale-[1.01] hover:brightness-105 sm:h-14 sm:rounded-[22px] sm:px-7 sm:text-lg"
                  >
                    {marketLoading || socialLoading
                      ? "Loading..."
                      : "Analyze narrative"}
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["NVDA", "EQIX", "TSLA", "AAPL", "MSTR", "BTC"].map(
                    (pick) => (
                      <button
                        key={pick}
                        onClick={() => pickAsset(pick)}
                        className={`rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                          symbol === pick
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                            : "border-white/10 bg-white/[0.04] text-white/68 hover:bg-white/[0.08]"
                        }`}
                      >
                        {pick}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.88),rgba(15,19,32,0.98))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                      Market snapshot
                    </div>
                    <div className="mt-2 flex items-end gap-3">
                      <div className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        {marketLoading && hasSelectedAsset
                          ? "Loading..."
                          : market.price}
                      </div>
                      <div
                        className={`rounded-full border px-3 py-1.5 text-sm ${perfTone(
                          market.change1D
                        )}`}
                      >
                        {hasUsableValue(market.change1D)
                          ? `${market.change1D} today`
                          : "—"}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-white/56">
                      {market.name}
                      {market.symbol ? ` · ${market.symbol}` : ""}
                      {market.type ? ` · ${market.type}` : ""}
                    </div>
                    {marketError ? (
                      <div className="mt-2 text-xs text-amber-300/80">
                        Market snapshot is temporarily unavailable.
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:min-w-[320px] sm:grid-cols-4 sm:gap-3">
                    {[
                      { label: "1D", value: market.change1D },
                      { label: "1W", value: market.change1W },
                      { label: "1M", value: market.change1M },
                      { label: "YTD", value: market.changeYTD },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[18px] border border-white/10 bg-white/[0.045] p-2.5 text-center sm:rounded-[20px] sm:p-3"
                      >
                        <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                          {item.label}
                        </div>
                        <div
                          className={`mt-2 text-sm font-semibold ${
                            !hasUsableValue(item.value)
                              ? "text-white/70"
                              : item.value.startsWith("-")
                              ? "text-rose-300"
                              : "text-emerald-300"
                          }`}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {!hasSelectedAsset ? (
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:rounded-[36px]">
            <div className="mx-auto max-w-3xl">
              <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Start with any asset
              </div>
              <p className="mt-4 text-base leading-8 text-white/72">
                Search any stock, ETF, or supported crypto to generate a live
                narrative pulse from Finnhub market data and OpenAI public-web
                synthesis.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:rounded-[36px] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                    <div className="h-4 w-4 rounded-full border-2 border-emerald-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {socialData.pulseTitle || `${symbol} — Narrative Pulse`}
                    </div>
                    <div className="mt-1 text-sm text-white/56">
                      Synthesized from live public-web surfaces
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/56">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Updated {socialData.updated || "just now"}
                </div>
              </div>

              <div className="mt-6 rounded-[30px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(34,255,170,0.08),rgba(34,255,170,0.03))] p-6">
                <p className="text-base leading-7 text-white/90 sm:text-xl sm:leading-9">
                  {socialData.pulseSummary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {socialData.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 sm:gap-4">
              {socialData.cards.map((card) => {
                const tone =
                  card.bull > card.bear
                    ? "Bullish"
                    : card.bear > card.bull
                    ? "Bearish"
                    : "Mixed";

                return (
                  <div
                    key={`${symbol}-${card.platform}`}
                    className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.94),rgba(15,19,32,0.96))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:rounded-[30px] sm:p-5"
                  >
                    <div
                      className="-mx-5 -mt-5 mb-4 h-[2px] rounded-t-[30px]"
                      style={{ backgroundColor: card.accent }}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-xs font-bold"
                            style={{
                              backgroundColor: card.soft,
                              color: card.accent,
                            }}
                          >
                            {card.icon}
                          </span>
                          <div className="text-base font-medium text-white sm:text-lg">
                            {card.platform}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-white/46">
                          {card.volume}
                        </div>
                      </div>
                      <div
                        className={`rounded-full border px-2.5 py-1 text-xs ${toneClasses(
                          tone as "Bullish" | "Mixed" | "Bearish"
                        )}`}
                      >
                        {tone}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-white/48">
                      {[
                        {
                          label: "BULL",
                          value: card.bull,
                          cls: "bg-emerald-400",
                        },
                        {
                          label: "BEAR",
                          value: card.bear,
                          cls: "bg-rose-400",
                        },
                        {
                          label: "NEUT",
                          value: card.neutral,
                          cls: "bg-slate-400",
                        },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="mb-1 flex items-center justify-between">
                            <span>{row.label}</span>
                            <span>{row.value}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/8">
                            <div
                              className={`h-2 rounded-full ${row.cls}`}
                              style={{ width: `${row.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 text-sm leading-6 text-white/80 sm:mt-4 sm:leading-7">
                      {card.summary}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/52"
                        >
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
                  <div className="text-[10px] uppercase tracking-[0.16em] text-emerald-300">
                    Verdict
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {socialData.verdict}
                  </div>
                </div>
                <div
                  className={`rounded-full border px-3 py-2 text-sm ${entryState.color} border-white/10 bg-white/[0.04]`}
                >
                  Entry timing: {entryState.label} — {socialData.entry}%
                </div>
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
                  <div
                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-[#05060a]"
                    style={{ left: `calc(${socialData.entry}% - 10px)` }}
                  />
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
                    <div className="text-2xl font-semibold tracking-tight">
                      Live Signal Feed
                    </div>
                    <div className="mt-1 text-sm text-white/56">
                      Representative items shaping the visible narrative around{" "}
                      {socialData.symbol || symbol}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {socialData.feed.map((item) => (
                    <div
                      key={`${symbol}-${item.source}-${item.author}-${item.headline}`}
                      className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200">
                              {item.source}
                            </span>
                            <span className="text-sm font-medium text-white">
                              {item.author}
                            </span>
                            <span className="text-xs text-white/46">
                              {item.meta}
                            </span>
                          </div>
                          <div className="mt-3 text-[15px] font-semibold leading-6 text-white/90 sm:text-base">
                            {item.headline}
                          </div>
                          <div className="mt-1 text-sm leading-7 text-white/78 sm:text-base sm:leading-8">
                            {item.body}
                          </div>
                          <div className="mt-4 flex items-center gap-3 text-xs text-white/52">
                            <span
                              className={`rounded-full border px-2.5 py-1 ${toneClasses(
                                item.tone
                              )}`}
                            >
                              {item.tone}
                            </span>
                            <span>impact</span>
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/8">
                              <div
                                className="h-2 rounded-full bg-cyan-400"
                                style={{ width: `${item.impact}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-white/40">{item.time}</div>
                      </div>
                    </div>
                  ))}

                  {!socialLoading && socialData.feed.length === 0 ? (
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5 text-sm text-white/60">
                      No strong recent signal feed items surfaced in the last 24
                      hours.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:p-8">
                  <div className="text-2xl font-semibold tracking-tight">
                    Attention Velocity
                  </div>
                  <div className="mt-1 text-sm text-white/56">
                    How quickly this story is broadening right now
                  </div>
                  <div className="mt-5 rounded-[30px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(34,255,170,0.08),rgba(34,255,170,0.03))] p-5">
                    <div className="flex h-32 items-end gap-2">
                      {[28, 32, 31, 36, 40, 38, 46, 44, 52, 57, 55, 63].map(
                        (h, idx) => (
                          <div
                            key={idx}
                            className="flex-1 rounded-t-md bg-emerald-400/80"
                            style={{ height: `${h}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4">
                      <div className="text-2xl font-semibold text-emerald-300">
                        {socialData.velocity}
                      </div>
                      <div className="mt-1 text-xs text-white/46">
                        vs 7d avg
                      </div>
                    </div>
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4">
                      <div className="text-2xl font-semibold text-amber-300">
                        {socialData.percentile}
                      </div>
                      <div className="mt-1 text-xs text-white/46">
                        percentile
                      </div>
                    </div>
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4">
                      <div className="text-2xl font-semibold text-white">
                        {socialData.signals24h}
                      </div>
                      <div className="mt-1 text-xs text-white/46">
                        signals / 24h
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,21,0.96),rgba(15,19,32,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:p-8">
                  <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                    <Users className="h-6 w-6 text-cyan-300" />
                    Key Opinion Leaders
                  </div>
                  <div className="mt-1 text-sm text-white/56">
                    Who appears to be shaping the visible framing around{" "}
                    {socialData.symbol || symbol}
                  </div>
                  <div className="mt-5 space-y-3">
                    {socialData.voices.map((voice) => (
                      <div
                        key={`${voice.source}-${voice.name}`}
                        className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.16em] text-white/40">
                              {voice.source}
                            </div>
                            <div className="mt-2 text-sm font-medium text-white">
                              {voice.name}
                            </div>
                            <div className="mt-1 text-xs text-white/46">
                              {voice.reach}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`rounded-full border px-2.5 py-1 text-xs ${toneClasses(
                                voice.stance
                              )}`}
                            >
                              {voice.stance}
                            </div>
                            <div className="mt-2 text-[11px] text-white/45">
                              {voice.time || "recently"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm leading-7 text-white/82">
                          “{voice.quote}”
                        </div>
                      </div>
                    ))}

                    {!socialLoading && socialData.voices.length === 0 ? (
                      <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5 text-sm text-white/60">
                        No strong recent KOL references surfaced in the current
                        public-web scan.
                      </div>
                    ) : null}
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
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    A stronger front door than the current Narriv homepage.
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-white/72">
                    This version leads with the actual product promise:
                    understanding the narrative around an asset. The deeper
                    score-first workflow can still exist in the product, but
                    this is the cleaner story to lead with.
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm text-white transition hover:bg-white/[0.09]">
                  Explore live narrative view
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
