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
  debug?: {
    phase: string;
    parseError?: string;
    outputPreview?: string;
  };
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
  if (total !== 100) neutral = Math.max(0, 100 - bull - bear);

  return {
    volume: bucket?.volume?.trim() || "light coverage",
    bull,
    bear,
    neutral,
    summary: bucket?.summary?.trim() || "Coverage is currently thin.",
    tags:
      Array.isArray(bucket?.tags) && bucket.tags.length > 0
        ? bucket.tags.slice(0, 5).map(String)
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

function cleanOutputText(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJsonObject(text: string) {
  const cleaned = cleanOutputText(text);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output");
  }
  return cleaned.slice(start, end + 1);
}

function fallback(
  symbol: string,
  phase: string,
  parseError?: string,
  outputPreview?: string
): SocialScanResponse {
  return {
    symbol,
    pulseTitle: `${symbol} — Narrative Pulse`,
    pulseSummary:
      "Narriv could not complete the full live narrative synthesis for this request, so this section is running in safe fallback mode while we debug it.",
    updated: "just now",
    chips: ["Fallback mode", "Route debug", phase],
    verdict: "Narrative scan fallback",
    entry: 50,
    cards: buildCards({
      x: {
        volume: "fallback",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "X scan fallback is active.",
        tags: ["fallback"],
      },
      reddit: {
        volume: "fallback",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Reddit scan fallback is active.",
        tags: ["fallback"],
      },
      news: {
        volume: "fallback",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "News scan fallback is active.",
        tags: ["fallback"],
      },
      youtube: {
        volume: "fallback",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "YouTube scan fallback is active.",
        tags: ["fallback"],
      },
      tiktok: {
        volume: "fallback",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "TikTok scan fallback is active.",
        tags: ["fallback"],
      },
    }),
    feed: [],
    voices: [],
    velocity: "—",
    percentile: "—",
    signals24h: "—",
    attentionLabel: "Attention read unavailable",
    attentionTake: "The route hit a processing issue after the OpenAI call and returned safe fallback data instead of breaking.",
    debug: {
      phase,
      parseError,
      outputPreview,
    },
  };
}

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("asset") || "UNKNOWN")
    .trim()
    .toUpperCase();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        fallback(symbol, "missing_api_key", "Missing OPENAI_API_KEY"),
        { status: 200 }
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
- Use EXACT platform bucket keys:
  - x
  - reddit
  - news
  - youtube
  - tiktok
- Feed items should be recent, ideally within the last 24 hours. If not enough exist, return fewer.
- Voices should be recent and include a time field.
- attentionLabel should be short and plain English.
- attentionTake should be one simple sentence.

Return this shape exactly:
{
  "symbol": "string",
  "pulseTitle": "string",
  "pulseSummary": "string",
  "updated": "string",
  "chips": ["string"],
  "verdict": "string",
  "entry": 0,
  "platformBuckets": {
    "x": { "volume": "string", "bull": 0, "bear": 0, "neutral": 0, "summary": "string", "tags": ["string"] },
    "reddit": { "volume": "string", "bull": 0, "bear": 0, "neutral": 0, "summary": "string", "tags": ["string"] },
    "news": { "volume": "string", "bull": 0, "bear": 0, "neutral": 0, "summary": "string", "tags": ["string"] },
    "youtube": { "volume": "string", "bull": 0, "bear": 0, "neutral": 0, "summary": "string", "tags": ["string"] },
    "tiktok": { "volume": "string", "bull": 0, "bear": 0, "neutral": 0, "summary": "string", "tags": ["string"] }
  },
  "feed": [
    { "source": "string", "author": "string", "meta": "string", "tone": "Bullish", "headline": "string", "body": "string", "impact": 0, "time": "string" }
  ],
  "voices": [
    { "source": "string", "name": "string", "stance": "Bullish", "reach": "string", "quote": "string", "time": "string" }
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
        fallback(symbol, "openai_http_error", errText),
        { status: 200 }
      );
    }

    const data = await res.json();

    const outputText =
      data?.output_text ||
      data?.output
        ?.flatMap((item: any) => item?.content || [])
        ?.find((c: any) => c?.type === "output_text")?.text;

    if (!outputText) {
      return NextResponse.json(
        fallback(symbol, "missing_output_text"),
        { status: 200 }
      );
    }

    let parsed: SocialScanModelResponse;
    try {
      parsed = JSON.parse(extractJsonObject(outputText)) as SocialScanModelResponse;
    } catch (parseErr) {
      return NextResponse.json(
        fallback(
          symbol,
          "json_parse_failed",
          parseErr instanceof Error ? parseErr.message : "Unknown parse error",
          outputText.slice(0, 800)
        ),
        { status: 200 }
      );
    }

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
      debug: {
        phase: "success",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      fallback(
        symbol,
        "unexpected_route_error",
        error instanceof Error ? error.message : "Unknown error"
      ),
      { status: 200 }
    );
  }
}
