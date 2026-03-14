import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Tone = "Bullish" | "Mixed" | "Bearish";

type PlatformBucketRaw = {
  volume?: string;
  bull?: number;
  bear?: number;
  neutral?: number;
  summary?: string;
  tags?: string[];
};

type FeedItem = {
  source?: string;
  author?: string;
  meta?: string;
  tone?: Tone;
  headline?: string;
  body?: string;
  impact?: number;
  time?: string;
};

type VoiceItem = {
  source?: string;
  name?: string;
  stance?: Tone;
  reach?: string;
  quote?: string;
  time?: string;
};

type SocialScanModelResponse = {
  symbol?: string;
  pulseTitle?: string;
  pulseSummary?: string;
  updated?: string;
  chips?: string[];
  verdict?: string;
  entry?: number;
  platformBuckets?: {
    x?: PlatformBucketRaw;
    reddit?: PlatformBucketRaw;
    news?: PlatformBucketRaw;
    youtube?: PlatformBucketRaw;
    tiktok?: PlatformBucketRaw;
  };
  feed?: FeedItem[];
  voices?: VoiceItem[];
  velocity?: string;
  percentile?: string;
  signals24h?: string;
  attentionLabel?: string;
  attentionTake?: string;
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

type SocialScanResponse = {
  symbol: string;
  pulseTitle: string;
  pulseSummary: string;
  updated: string;
  chips: string[];
  verdict: string;
  entry: number;
  cards: PlatformCard[];
  feed: {
    source: string;
    author: string;
    meta: string;
    tone: Tone;
    headline: string;
    body: string;
    impact: number;
    time: string;
  }[];
  voices: {
    source: string;
    name: string;
    stance: Tone;
    reach: string;
    quote: string;
    time: string;
  }[];
  velocity: string;
  percentile: string;
  signals24h: string;
  attentionLabel: string;
  attentionTake: string;
};

function clampPercent(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeTone(value: unknown): Tone {
  if (value === "Bullish" || value === "Bearish" || value === "Mixed") return value;
  return "Mixed";
}

function normalizeBucket(bucket?: PlatformBucketRaw): Required<PlatformBucketRaw> {
  const bull = clampPercent(bucket?.bull ?? 50);
  const bear = clampPercent(bucket?.bear ?? 25);
  let neutral = clampPercent(bucket?.neutral ?? 25);

  const total = bull + bear + neutral;
  if (total !== 100) {
    neutral = Math.max(0, 100 - bull - bear);
  }

  return {
    volume: bucket?.volume?.trim() || "light coverage",
    bull,
    bear,
    neutral,
    summary: bucket?.summary?.trim() || "Coverage is currently thin.",
    tags:
      Array.isArray(bucket?.tags) && bucket!.tags!.length > 0
        ? bucket!.tags!.slice(0, 5).map(String)
        : ["thin coverage"],
  };
}

function buildCards(
  buckets?: SocialScanModelResponse["platformBuckets"]
): PlatformCard[] {
  const x = normalizeBucket(buckets?.x);
  const reddit = normalizeBucket(buckets?.reddit);
  const news = normalizeBucket(buckets?.news);
  const youtube = normalizeBucket(buckets?.youtube);
  const tiktok = normalizeBucket(buckets?.tiktok);

  return [
    {
      platform: "Twitter / X",
      icon: "𝕏",
      accent: "#1DA1F2",
      soft: "rgba(29,161,242,0.12)",
      ...x,
    },
    {
      platform: "Reddit",
      icon: "⬡",
      accent: "#FF5700",
      soft: "rgba(255,87,0,0.12)",
      ...reddit,
    },
    {
      platform: "News",
      icon: "◉",
      accent: "#5E8AFF",
      soft: "rgba(94,138,255,0.12)",
      ...news,
    },
    {
      platform: "YouTube",
      icon: "▶",
      accent: "#FF0033",
      soft: "rgba(255,0,51,0.12)",
      ...youtube,
    },
    {
      platform: "TikTok",
      icon: "♪",
      accent: "#FE2C55",
      soft: "rgba(254,44,85,0.12)",
      ...tiktok,
    },
  ];
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output");
  }
  return text.slice(start, end + 1);
}

function fallback(symbol: string, note?: string): SocialScanResponse {
  return {
    symbol,
    pulseTitle: `${symbol} — Narrative Pulse`,
    pulseSummary:
      note ||
      `Narriv scanned public-web results for ${symbol}. Coverage is directional, live, and source-backed, but not equivalent to native platform telemetry.`,
    updated: "just now",
    chips: ["Public-web scan", "OpenAI synthesis", "Beta narrative layer"],
    verdict: "Mixed / thin coverage",
    entry: 50,
    cards: buildCards({
      x: {
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning public-web X results.",
        tags: ["loading"],
      },
      reddit: {
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning indexed Reddit results.",
        tags: ["loading"],
      },
      news: {
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning news coverage.",
        tags: ["loading"],
      },
      youtube: {
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning YouTube creator coverage.",
        tags: ["loading"],
      },
      tiktok: {
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning TikTok / short-form public results.",
        tags: ["loading"],
      },
    }),
    feed: [],
    voices: [],
    velocity: "—",
    percentile: "—",
    signals24h: "—",
    attentionLabel: "Attention stable",
    attentionTake:
      "Narriv is still building the attention read for this asset.",
  };
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const symbol = (req.nextUrl.searchParams.get("asset") || "")
      .trim()
      .toUpperCase();

    if (!symbol) {
      return NextResponse.json(
        { error: "Missing asset symbol" },
        { status: 400 }
      );
    }

    const prompt = `
You are generating a live public-web narrative view for the stock/asset ticker ${symbol}.

Search the public web for recent, publicly indexed discussion about ${symbol}, including:
- Twitter / X
- Reddit
- News
- YouTube
- TikTok / short-form

Rules:
- Treat ${symbol} as the stock/asset/security, not an unrelated acronym.
- Return JSON only. No markdown. No commentary outside JSON.
- The UI has FIVE FIXED PLATFORM SLOTS ONLY:
  - x
  - reddit
  - news
  - youtube
  - tiktok
- Do NOT rename those platform keys.
- Outlet names like CNBC, Bloomberg, WSJ, Reuters belong in summaries/tags/feed/voices, not as platform names.
- Feed items should be recent, ideally within the last 24 hours. If not enough exist, return fewer items.
- Voice items should be recent takes or current summarized theses from visible thought leaders, pundits, or outlets.
- Every voice item must include a time field.
- attentionLabel must be short and plain English.
- attentionTake must explain the signal in one simple, useful sentence.
- Sentiment splits are directional estimates, not exact truth.

Return exactly this shape:

{
  "symbol": "string",
  "pulseTitle": "string",
  "pulseSummary": "string",
  "updated": "string",
  "chips": ["string"],
  "verdict": "string",
  "entry": 0,
  "platformBuckets": {
    "x": {
      "volume": "string",
      "bull": 0,
      "bear": 0,
      "neutral": 0,
      "summary": "string",
      "tags": ["string"]
    },
    "reddit": {
      "volume": "string",
      "bull": 0,
      "bear": 0,
      "neutral": 0,
      "summary": "string",
      "tags": ["string"]
    },
    "news": {
      "volume": "string",
      "bull": 0,
      "bear": 0,
      "neutral": 0,
      "summary": "string",
      "tags": ["string"]
    },
    "youtube": {
      "volume": "string",
      "bull": 0,
      "bear": 0,
      "neutral": 0,
      "summary": "string",
      "tags": ["string"]
    },
    "tiktok": {
      "volume": "string",
      "bull": 0,
      "bear": 0,
      "neutral": 0,
      "summary": "string",
      "tags": ["string"]
    }
  },
  "feed": [
    {
      "source": "string",
      "author": "string",
      "meta": "string",
      "tone": "Bullish | Mixed | Bearish",
      "headline": "string",
      "body": "string",
      "impact": 0,
      "time": "string"
    }
  ],
  "voices": [
    {
      "source": "string",
      "name": "string",
      "stance": "Bullish | Mixed | Bearish",
      "reach": "string",
      "quote": "string",
      "time": "string"
    }
  ],
  "velocity": "string",
  "percentile": "string",
  "signals24h": "string",
  "attentionLabel": "string",
  "attentionTake": "string"
}
`.trim();

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        tools: [{ type: "web_search" }],
        tool_choice: "auto",
        max_output_tokens: 2200,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `OpenAI error: ${errText}` },
        { status: 500 }
      );
    }

    const data = await res.json();

    const outputText =
      data?.output_text ||
      data?.output
        ?.flatMap((item: any) => item?.content || [])
        ?.find((c: any) => c?.type === "output_text")?.text;

    if (!outputText) {
      return NextResponse.json(fallback(symbol));
    }

    const parsed = JSON.parse(
      extractJsonObject(outputText)
    ) as SocialScanModelResponse;

    const response: SocialScanResponse = {
      symbol,
      pulseTitle:
        parsed.pulseTitle && parsed.pulseTitle.includes(symbol)
          ? parsed.pulseTitle
          : `${symbol} — Narrative Pulse`,
      pulseSummary:
        parsed.pulseSummary ||
        `Narriv scanned recent public-web discussion around ${symbol}.`,
      updated: parsed.updated || "just now",
      chips: Array.isArray(parsed.chips) ? parsed.chips.slice(0, 6).map(String) : [],
      verdict: parsed.verdict || "Mixed",
      entry: Math.max(0, Math.min(100, Math.round(parsed.entry ?? 50))),
      cards: buildCards(parsed.platformBuckets),
      feed: Array.isArray(parsed.feed)
        ? parsed.feed.slice(0, 6).map((item) => ({
            source: String(item.source || "Source"),
            author: String(item.author || "Unknown"),
            meta: String(item.meta || ""),
            tone: normalizeTone(item.tone),
            headline: String(item.headline || "Recent item"),
            body: String(item.body || ""),
            impact: clampPercent(Number(item.impact ?? 50)),
            time: String(item.time || "recently"),
          }))
        : [],
      voices: Array.isArray(parsed.voices)
        ? parsed.voices.slice(0, 6).map((voice) => ({
            source: String(voice.source || "Source"),
            name: String(voice.name || "Unknown"),
            stance: normalizeTone(voice.stance),
            reach: String(voice.reach || ""),
            quote: String(voice.quote || ""),
            time: String(voice.time || "recently"),
          }))
        : [],
      velocity: String(parsed.velocity || "—"),
      percentile: String(parsed.percentile || "—"),
      signals24h: String(parsed.signals24h || "—"),
      attentionLabel: String(parsed.attentionLabel || "Attention stable"),
      attentionTake: String(
        parsed.attentionTake ||
          "Narriv is still building the attention read for this asset."
      ),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("social-scan route error:", error);
    const symbol = (req.nextUrl.searchParams.get("asset") || "UNKNOWN")
      .trim()
      .toUpperCase();
    return NextResponse.json(fallback(symbol));
  }
}
