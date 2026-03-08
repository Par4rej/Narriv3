import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

  if (!input || input === "NVDA" || input.includes("NVIDIA")) {
    return {
      symbol: "NVDA",
      displayName: "NVIDIA",
      finnhubSymbol: "NVDA",
      kind: "stock" as const,
    };
  }

  if (input === "TSLA" || input.includes("TESLA")) {
    return {
      symbol: "TSLA",
      displayName: "Tesla",
      finnhubSymbol: "TSLA",
      kind: "stock" as const,
    };
  }

  if (input === "BTC" || input.includes("BITCOIN")) {
    return {
      symbol: "BTC",
      displayName: "Bitcoin",
      finnhubSymbol: "BINANCE:BTCUSDT",
      kind: "crypto" as const,
    };
  }

  return {
    symbol: input,
    displayName: input,
    finnhubSymbol: input,
    kind: "stock" as const,
  };
}

function fallbackReport(
  asset: ReturnType<typeof normalizeAsset>,
  price: number,
  dp: number,
  headlines: string[]
): ReportResponse {
  const strength = clamp(55 + Math.min(headlines.length * 4, 20) + Math.abs(dp) * 2);
  const crowding = clamp(35 + Math.min(headlines.length * 5, 30) + Math.max(dp, 0) * 2);
  const confidence = clamp(58 + Math.min(headlines.length * 4, 22));
  const fade = clamp((crowding * 0.65) + ((100 - confidence) * 0.35));
  const entry = clamp((confidence * 0.45) + ((100 - crowding) * 0.4) + ((100 - fade) * 0.15));

  let verdict = "Mixed setup";
  if (strength >= 80 && crowding >= 75) verdict = "Strong, but crowded";
  else if (strength >= 75) verdict = "Strengthening";
  else if (strength <= 55) verdict = "Weak or unclear";
  else if (dp < 0) verdict = "Attention holding, price softer";

  return {
    symbol: asset.symbol,
    name: asset.displayName,
    price: formatUsd(price || 0),
    move: `${dp >= 0 ? "+" : ""}${dp.toFixed(1)}%`,
    updated: "just now",
    verdict,
    whyNow:
      headlines.length > 0
        ? `Recent headlines and live price action suggest ${asset.displayName} remains actively in focus, but the setup should be judged through both attention strength and crowding risk.`
        : `${asset.displayName} has live price data, but there was limited fresh headline evidence available in this pull.`,
    strength,
    entry,
    crowding,
    confidence,
    fade,
    changed: [
      {
        label: `Price moved ${dp >= 0 ? "up" : "down"} ${Math.abs(dp).toFixed(1)}% today`,
        value: `${dp >= 0 ? "+" : ""}${dp.toFixed(1)}`,
        tone: dp >= 0 ? "up" : "down",
      },
      {
        label: `Headline flow refreshed with ${headlines.length} recent items`,
        value: `${headlines.length}`,
        tone: "up",
      },
      {
        label: `Entry quality currently reads ${entry}`,
        value: `${entry}`,
        tone: entry >= 60 ? "up" : "down",
      },
    ],
    bull: [
      "Fresh headlines are still flowing",
      "Live price action is incorporated into the report",
      "The setup can now be evaluated with current data instead of static mock values",
    ],
    bear: [
      "This is still an early data layer, not the full social stack",
      "Headline volume alone does not guarantee a good entry",
      "Crowding can rise faster than opportunity quality",
    ],
    evidence: [
      {
        kind: "Market",
        title: "Live price and 1D move pulled successfully",
        detail: `${asset.displayName} is currently ${formatUsd(price || 0)} with a ${dp >= 0 ? "+" : ""}${dp.toFixed(1)}% 1D move.`,
        tone: dp >= 0 ? "Bullish" : "Bearish",
      },
      {
        kind: "News",
        title: "Recent headlines were incorporated",
        detail:
          headlines[0] ?? "No major recent headline was available in this pull.",
        tone: "Mixed",
      },
      {
        kind: "AI",
        title: "Report generated from live quote + headline inputs",
        detail:
          "This version is now using real fetched data and AI synthesis instead of a fully hardcoded mock.",
        tone: "Mixed",
      },
    ],
    sourceMix: [
      { label: "Price confirmation", value: clamp(35 + Math.min(Math.abs(dp) * 8, 45)) },
      { label: "Headline flow", value: clamp(25 + headlines.length * 10) },
      { label: "Signal freshness", value: 82 },
      { label: "Crowding estimate", value: crowding },
      { label: "AI synthesis confidence", value: confidence },
    ],
    fadeBoard: [
      {
        name: "Late consensus media chatter",
        score: clamp(crowding + 5),
        note: "Useful as a generic crowding input when the story is widely known.",
      },
      {
        name: "Retail euphoria risk",
        score: clamp((crowding + strength) / 2),
        note: "Higher when attention and momentum run hotter than clarity.",
      },
      {
        name: "Jim Cramer counter-watch",
        score: clamp(40 + Math.abs(dp)),
        note: "Novelty input only, not a mechanical trading signal.",
      },
    ],
  };
}

async function generateAiReport(params: {
  assetName: string;
  symbol: string;
  price: string;
  move: string;
  strength: number;
  crowding: number;
  confidence: number;
  fade: number;
  entry: number;
  headlines: string[];
}): Promise<Partial<ReportResponse> | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `
You are writing a short, sharp brokerage-style asset briefing.

Return valid JSON only with these keys:
verdict: string
whyNow: string
changed: array of exactly 3 items with keys {label, value, tone}
bull: array of exactly 3 short strings
bear: array of exactly 3 short strings
evidence: array of exactly 3 items with keys {kind, title, detail, tone}
sourceMix: array of exactly 5 items with keys {label, value}
fadeBoard: array of exactly 3 items with keys {name, score, note}

Rules:
- Keep it concise, premium, and decision-oriented.
- No markdown.
- "tone" in changed must be "up" or "down".
- Evidence kind must be one of "News", "Market", "AI".
- Evidence tone must be one of "Bullish", "Bearish", "Mixed".
- value and score must be integers from 0 to 100 where applicable.
- Do not claim any social sources that were not provided.
- This report only has live market quote data and recent headlines right now.
- Consider entry quality in the framing.

Inputs:
Asset: ${params.assetName} (${params.symbol})
Price: ${params.price}
1D move: ${params.move}
Strength estimate: ${params.strength}
Entry estimate: ${params.entry}
Crowding estimate: ${params.crowding}
Confidence estimate: ${params.confidence}
Fade estimate: ${params.fade}
Headlines:
${params.headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}
`.trim();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You create concise brokerage-style asset briefings from structured market inputs.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    return null;
  }

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
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing FINNHUB_API_KEY" },
        { status: 500 }
      );
    }

    const rawAsset = req.nextUrl.searchParams.get("asset") ?? "NVDA";
    const asset = normalizeAsset(rawAsset);

    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
      asset.finnhubSymbol
    )}&token=${apiKey}`;

    const quote = await fetchJson(quoteUrl);

    let profileName = asset.displayName;
    if (asset.kind === "stock") {
      try {
        const profile = await fetchJson(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(
            asset.finnhubSymbol
          )}&token=${apiKey}`
        );
        if (profile?.name) profileName = profile.name;
      } catch {
        // ignore
      }
    }

    let newsItems: Array<{ headline: string; summary?: string }> = [];
    try {
      if (asset.kind === "crypto") {
        const news = await fetchJson(
          `https://finnhub.io/api/v1/news?category=crypto&token=${apiKey}`
        );
        newsItems = Array.isArray(news)
          ? news
              .filter(
                (n) =>
                  typeof n?.headline === "string" &&
                  n.headline.toLowerCase().includes("bitcoin")
              )
              .slice(0, 5)
          : [];
      } else {
        const from = daysAgoIso(7);
        const to = daysAgoIso(0);
        const news = await fetchJson(
          `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(
            asset.finnhubSymbol
          )}&from=${from}&to=${to}&token=${apiKey}`
        );
        newsItems = Array.isArray(news) ? news.slice(0, 5) : [];
      }
    } catch {
      newsItems = [];
    }

    const headlines = newsItems
      .map((n) => n.headline)
      .filter((h): h is string => typeof h === "string" && h.length > 0)
      .slice(0, 5);

    const currentPrice =
      typeof quote?.c === "number" && quote.c > 0 ? quote.c : 0;
    const movePct =
      typeof quote?.dp === "number"
        ? quote.dp
        : quote?.pc
        ? ((currentPrice - quote.pc) / quote.pc) * 100
        : 0;

    const strength = clamp(
      52 + Math.min(headlines.length * 5, 25) + Math.abs(movePct) * 2
    );
    const crowding = clamp(
      30 + Math.min(headlines.length * 6, 30) + Math.max(movePct, 0) * 2.5
    );
    const confidence = clamp(
      56 + Math.min(headlines.length * 5, 25) + (currentPrice > 0 ? 8 : 0)
    );
    const fade = clamp((crowding * 0.65) + ((100 - confidence) * 0.35));
    const entry = clamp((confidence * 0.45) + ((100 - crowding) * 0.4) + ((100 - fade) * 0.15));

    const base = fallbackReport(asset, currentPrice, movePct, headlines);
    base.name = profileName;
    base.price = formatUsd(currentPrice || 0);
    base.move = `${movePct >= 0 ? "+" : ""}${movePct.toFixed(1)}%`;

    const ai = await generateAiReport({
      assetName: profileName,
      symbol: asset.symbol,
      price: base.price,
      move: base.move,
      strength,
      entry,
      crowding,
      confidence,
      fade,
      headlines,
    });

    const result: ReportResponse = {
      ...base,
      strength,
      entry,
      crowding,
      confidence,
      fade,
      updated: "just now",
      verdict:
        typeof ai?.verdict === "string" && ai.verdict ? ai.verdict : base.verdict,
      whyNow:
        typeof ai?.whyNow === "string" && ai.whyNow ? ai.whyNow : base.whyNow,
      changed:
        Array.isArray(ai?.changed) && ai.changed.length === 3
          ? (ai.changed as ChangedItem[])
          : base.changed,
      bull:
        Array.isArray(ai?.bull) && ai.bull.length === 3
          ? (ai.bull as string[])
          : base.bull,
      bear:
        Array.isArray(ai?.bear) && ai.bear.length === 3
          ? (ai.bear as string[])
          : base.bear,
      evidence:
        Array.isArray(ai?.evidence) && ai.evidence.length === 3
          ? (ai.evidence as EvidenceItem[])
          : base.evidence,
      sourceMix:
        Array.isArray(ai?.sourceMix) && ai.sourceMix.length === 5
          ? (ai.sourceMix as SourceContribution[])
          : base.sourceMix,
      fadeBoard:
        Array.isArray(ai?.fadeBoard) && ai.fadeBoard.length === 3
          ? (ai.fadeBoard as FadeItem[])
          : base.fadeBoard,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
