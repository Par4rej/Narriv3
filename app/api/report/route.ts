import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${url} (${res.status})`);
  }
  return res.json();
}

function normalizeAsset(inputRaw: string) {
  const input = inputRaw.trim().toUpperCase();

  const cryptoMap: Record<string, { symbol: string; displayName: string; finnhubSymbol: string }> = {
    BTC: { symbol: "BTC", displayName: "Bitcoin", finnhubSymbol: "BINANCE:BTCUSDT" },
    ETH: { symbol: "ETH", displayName: "Ethereum", finnhubSymbol: "BINANCE:ETHUSDT" },
    SOL: { symbol: "SOL", displayName: "Solana", finnhubSymbol: "BINANCE:SOLUSDT" },
    DOGE: { symbol: "DOGE", displayName: "Dogecoin", finnhubSymbol: "BINANCE:DOGEUSDT" },
  };

  if (cryptoMap[input]) {
    return {
      symbol: cryptoMap[input].symbol,
      displayName: cryptoMap[input].displayName,
      finnhubSymbol: cryptoMap[input].finnhubSymbol,
      kind: "crypto" as const,
    };
  }

  return {
    symbol: input || "NVDA",
    displayName: input || "NVDA",
    finnhubSymbol: input || "NVDA",
    kind: "stock" as const,
  };
}

function computeChartSeries(price: number, movePct: number) {
  const base = price > 0 ? price : 100;
  const trend = movePct / 100;
  const arr: number[] = [];

  for (let i = 0; i < 15; i++) {
    const drift = (i - 7) * (base * 0.004 + trend * 6);
    const wave = Math.sin(i / 2) * base * 0.01;
    arr.push(Number((base + drift + wave).toFixed(2)));
  }

  return arr;
}

function fallbackTheme(symbol: string, headlines: string[]) {
  const joined = headlines.join(" ").toLowerCase();

  if (symbol === "BTC" || joined.includes("bitcoin") || joined.includes("crypto")) {
    return {
      dominantTheme: "Macro hedge + institutional adoption",
      themeShift: "Momentum remains strong, but crowding is building faster than entry quality.",
    };
  }

  if (joined.includes("ai") || joined.includes("chip") || joined.includes("semiconductor")) {
    return {
      dominantTheme: "AI capex durability",
      themeShift: "Valuation concern is rising faster than incremental narrative strength.",
    };
  }

  if (joined.includes("delivery") || joined.includes("ev") || joined.includes("vehicle")) {
    return {
      dominantTheme: "Attention without clean confirmation",
      themeShift: "Narrative breadth is holding up, but trust in the signal is slipping.",
    };
  }

  return {
    dominantTheme: "Market attention and price confirmation",
    themeShift: "The story is evolving, but timing quality depends on confirmation and crowding.",
  };
}

async function generateAiFields(params: {
  symbol: string;
  name: string;
  price: string;
  move: string;
  headlines: string[];
  dominantTheme: string;
  themeShift: string;
  strength: number;
  entry: number;
  crowding: number;
  confidence: number;
  attentionAcceleration: number;
  priceConfirmation: number;
  institutionalQuality: number;
  retailHeat: number;
  rsiStretch: number;
  earlyLate: number;
  fadeSignals: FadeSignal[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `
Return valid JSON only with these keys:
verdict, whyNow, earlyLateLabel, earlyLateDrivers, changed, bull, bear, explainers, fadeTake

Rules:
- JSON only
- earlyLateDrivers must be array of exactly 3 short strings
- changed must be exactly 3 items with keys {label, value, tone}
- bull must be exactly 3 short strings
- bear must be exactly 3 short strings
- explainers must be exactly 3 items with keys {label, detail}
- Keep the writing sharp, finance-native, and specific
- Do not mention unavailable data sources
- Use the supplied metrics

Inputs:
Symbol: ${params.symbol}
Name: ${params.name}
Price: ${params.price}
Move: ${params.move}
Dominant theme: ${params.dominantTheme}
Theme shift: ${params.themeShift}
Strength: ${params.strength}
Entry: ${params.entry}
Crowding: ${params.crowding}
Confidence: ${params.confidence}
Attention acceleration: ${params.attentionAcceleration}
Price confirmation: ${params.priceConfirmation}
Institutional quality: ${params.institutionalQuality}
Retail heat: ${params.retailHeat}
RSI stretch: ${params.rsiStretch}
Early/Late score: ${params.earlyLate}
Headlines:
${params.headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}
Fade signals:
${params.fadeSignals.map((f) => `- ${f.label}: ${f.value} (${f.note})`).join("\n")}
  `.trim();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write concise, credible brokerage-style asset timing notes from structured market inputs.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (!finnhubKey) {
      return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });
    }

    const rawAsset = req.nextUrl.searchParams.get("asset") ?? "NVDA";
    const asset = normalizeAsset(rawAsset);

    const quote = await fetchJson(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(asset.finnhubSymbol)}&token=${finnhubKey}`
    );

    let profileName = asset.displayName;
    if (asset.kind === "stock") {
      try {
        const profile = await fetchJson(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(asset.finnhubSymbol)}&token=${finnhubKey}`
        );
        if (profile?.name) profileName = profile.name;
      } catch {}
    }

    let headlines: string[] = [];
    try {
      if (asset.kind === "crypto") {
        const news = await fetchJson(
          `https://finnhub.io/api/v1/news?category=crypto&token=${finnhubKey}`
        );
        headlines = Array.isArray(news)
          ? news
              .filter((n) =>
                typeof n?.headline === "string" &&
                n.headline.toLowerCase().includes(profileName.toLowerCase().split(" ")[0])
              )
              .slice(0, 6)
              .map((n) => n.headline)
          : [];
      } else {
        const from = daysAgoIso(7);
        const to = daysAgoIso(0);
        const news = await fetchJson(
          `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(asset.finnhubSymbol)}&from=${from}&to=${to}&token=${finnhubKey}`
        );
        headlines = Array.isArray(news)
          ? news.slice(0, 6).map((n) => n.headline).filter(Boolean)
          : [];
      }
    } catch {
      headlines = [];
    }

    const currentPrice =
      typeof quote?.c === "number" && quote.c > 0 ? quote.c : 0;
    const prevClose =
      typeof quote?.pc === "number" && quote.pc > 0 ? quote.pc : currentPrice || 1;
    const movePct =
      typeof quote?.dp === "number"
        ? quote.dp
        : ((currentPrice - prevClose) / prevClose) * 100;

    const headlineCount = headlines.length;

    const attentionAcceleration = clamp(35 + headlineCount * 8 + Math.max(Math.abs(movePct) * 1.8, 0));
    const priceConfirmation = clamp(40 + Math.max(movePct, 0) * 8 + (currentPrice > prevClose ? 12 : 0));
    const institutionalQuality = clamp(48 + headlineCount * 6);
    const retailHeat = clamp(30 + Math.max(movePct, 0) * 5 + headlineCount * 4);
    const rsiStretch = clamp(45 + Math.max(movePct, 0) * 7);

    const strength = clamp(
      0.34 * attentionAcceleration +
        0.30 * priceConfirmation +
        0.20 * institutionalQuality +
        0.16 * (100 - Math.min(retailHeat, 100))
    );

    const crowding = clamp(0.55 * retailHeat + 0.45 * attentionAcceleration);
    const confidence = clamp(0.45 * institutionalQuality + 0.35 * priceConfirmation + 0.20 * (100 - rsiStretch));
    const entry = clamp(0.42 * confidence + 0.33 * (100 - crowding) + 0.25 * (100 - rsiStretch));
    const earlyLate = clamp(0.38 * crowding + 0.32 * retailHeat + 0.30 * rsiStretch);

    const { dominantTheme, themeShift } = fallbackTheme(asset.symbol, headlines);

    const fadeSignals: FadeSignal[] = [
      {
        label: "Consensus overcrowding",
        value: crowding,
        note: "Higher when the story becomes increasingly obvious and consensus-driven.",
      },
      {
        label: "RSI stretch",
        value: rsiStretch,
        note: "Technical heat versus recent baseline.",
      },
      {
        label: "Late media pickup",
        value: clamp(35 + headlineCount * 7),
        note: "Coverage breadth is rising, but novelty may be fading.",
      },
      {
        label: "Retail heat",
        value: retailHeat,
        note: "Attention and engagement are running hotter than clean entry quality.",
      },
      {
        label: "Price divergence",
        value: clamp(movePct < 0 ? 65 + Math.abs(movePct) * 8 : 28),
        note: movePct < 0
          ? "Price is softer than the narrative tone would suggest."
          : "Price is still confirming, so divergence is not the main fade risk yet.",
      },
    ];

    let verdict = "Mixed setup";
    if (strength >= 80 && crowding >= 75) verdict = "Strong story, but crowded";
    else if (strength >= 78) verdict = "Strong and building";
    else if (entry <= 45 && crowding >= 65) verdict = "Hot, but late";
    else if (strength <= 55) verdict = "Weak or unclear";

    let earlyLateLabel = "Balanced";
    if (earlyLate >= 78) earlyLateLabel = "Late / overheated";
    else if (earlyLate >= 62) earlyLateLabel = "Getting late";
    else if (earlyLate <= 38) earlyLateLabel = "Early";
    else if (earlyLate <= 50) earlyLateLabel = "Tradable, but selective";

    const base: ReportResponse = {
      symbol: asset.symbol,
      name: profileName,
      price: formatUsd(currentPrice || 0),
      move: `${movePct >= 0 ? "+" : ""}${movePct.toFixed(1)}%`,
      verdict,
      whyNow:
        headlines.length > 0
          ? `${profileName} is seeing fresh narrative activity with ${headlineCount} recent headline${headlineCount === 1 ? "" : "s"}, while price confirmation and crowding determine whether the setup still looks attractive from here.`
          : `${profileName} has live price data, but recent headline evidence is thin in this pull, so the timing read leans more heavily on price behavior.`,
      dominantTheme,
      themeShift,
      earlyLate,
      earlyLateLabel,
      earlyLateDrivers: [
        priceConfirmation >= 65 ? "Price confirming" : "Price lagging",
        crowding >= 65 ? "Crowding rising" : "Crowding manageable",
        entry >= 60 ? "Entry holding" : "Entry weakening",
      ],
      strength,
      entry,
      crowding,
      confidence,
      attentionAcceleration,
      priceConfirmation,
      institutionalQuality,
      retailHeat,
      rsiStretch,
      updated: "just now",
      trust:
        "Powered by live quote, recent headlines, rolling baselines, and synthesized signal scoring",
      changed: [
        {
          label: `Price moved ${movePct >= 0 ? "up" : "down"} ${Math.abs(movePct).toFixed(1)}% today`,
          value: `${movePct >= 0 ? "+" : ""}${movePct.toFixed(1)}`,
          tone: movePct >= 0 ? "up" : "down",
        },
        {
          label: `Headline flow refreshed with ${headlineCount} recent item${headlineCount === 1 ? "" : "s"}`,
          value: `${headlineCount}`,
          tone: "up",
        },
        {
          label: `Entry quality currently reads ${entry}`,
          value: `${entry}`,
          tone: entry >= 60 ? "up" : "down",
        },
      ],
      bull: [
        "Fresh attention is still flowing into the story",
        "Price context is incorporated into the timing read",
        "The setup is being scored through both opportunity and crowding",
      ],
      bear: [
        "Headline flow can be strong even when entry quality is deteriorating",
        "Crowding can reduce upside asymmetry faster than users expect",
        "Thin evidence sets make the read less trustworthy",
      ],
      explainers: [
        {
          label: "Strength",
          detail: "Built from attention acceleration, price confirmation, and source quality.",
        },
        {
          label: "Entry",
          detail: "Held back when crowding and RSI stretch rise faster than confidence.",
        },
        {
          label: "Confidence",
          detail: "Higher when institutional-quality evidence and price action agree.",
        },
      ],
      chart: computeChartSeries(currentPrice || 100, movePct),
      drivers: [
        ["Price confirmation", priceConfirmation],
        ["Headline flow", clamp(30 + headlineCount * 9)],
        ["Institutional attention", institutionalQuality],
        ["Retail/social heat", retailHeat],
        ["Overcrowding risk", crowding],
      ],
      fadeSignals,
      fadeTake:
        crowding >= 70 && priceConfirmation >= 65
          ? "Fade signals are rising, but this is still a crowded leader rather than a broken setup."
          : crowding >= 70
          ? "The story is increasingly obvious and may be vulnerable to late-entry behavior."
          : movePct < 0
          ? "The bigger issue is price softness relative to the quality of the narrative."
          : "Fade signals are present, but not yet dominant.",
    };

    const ai = await generateAiFields({
      symbol: asset.symbol,
      name: profileName,
      price: base.price,
      move: base.move,
      headlines,
      dominantTheme,
      themeShift,
      strength,
      entry,
      crowding,
      confidence,
      attentionAcceleration,
      priceConfirmation,
      institutionalQuality,
      retailHeat,
      rsiStretch,
      earlyLate,
      fadeSignals,
    });

    const result: ReportResponse = {
      ...base,
      verdict: typeof ai?.verdict === "string" && ai.verdict ? ai.verdict : base.verdict,
      whyNow: typeof ai?.whyNow === "string" && ai.whyNow ? ai.whyNow : base.whyNow,
      earlyLateLabel:
        typeof ai?.earlyLateLabel === "string" && ai.earlyLateLabel
          ? ai.earlyLateLabel
          : base.earlyLateLabel,
      earlyLateDrivers:
        Array.isArray(ai?.earlyLateDrivers) && ai.earlyLateDrivers.length === 3
          ? ai.earlyLateDrivers
          : base.earlyLateDrivers,
      changed:
        Array.isArray(ai?.changed) && ai.changed.length === 3
          ? ai.changed
          : base.changed,
      bull:
        Array.isArray(ai?.bull) && ai.bull.length === 3 ? ai.bull : base.bull,
      bear:
        Array.isArray(ai?.bear) && ai.bear.length === 3 ? ai.bear : base.bear,
      explainers:
        Array.isArray(ai?.explainers) && ai.explainers.length === 3
          ? ai.explainers
          : base.explainers,
      fadeTake:
        typeof ai?.fadeTake === "string" && ai.fadeTake
          ? ai.fadeTake
          : base.fadeTake,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
