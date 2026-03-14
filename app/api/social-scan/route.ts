import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Tone = "Bullish" | "Mixed" | "Bearish";

type PlatformBucketRaw = {
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
  tone: Tone;
  headline: string;
  body: string;
  impact: number;
  time: string;
};

type VoiceItem = {
  source: string;
  name: string;
  stance: Tone;
  reach: string;
  quote: string;
};

type SocialScanModelResponse = {
  symbol: string;
  pulseTitle: string;
  pulseSummary: string;
  updated: string;
  chips: string[];
  verdict: string;
  entry: number;
  platformBuckets: {
    x: PlatformBucketRaw;
    reddit: PlatformBucketRaw;
    news: PlatformBucketRaw;
    youtube: PlatformBucketRaw;
    tiktok: PlatformBucketRaw;
  };
  feed: FeedItem[];
  voices: VoiceItem[];
  velocity: string;
  percentile: string;
  signals24h: string;
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
  feed: FeedItem[];
  voices: VoiceItem[];
  velocity: string;
  percentile: string;
  signals24h: string;
};

function clampPercent(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeBucket(bucket?: Partial<PlatformBucketRaw>): PlatformBucketRaw {
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
        ? bucket!.tags!.slice(0, 5)
        : ["thin coverage"],
  };
}

function buildCards(
  buckets: SocialScanModelResponse["platformBuckets"]
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

function fallback(symbol: string): SocialScanResponse {
  return {
    symbol,
    pulseTitle: `${symbol} — Narrative Pulse`,
    pulseSummary:
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
    velocity: "1.0x",
    percentile: "50th",
    signals24h: "—",
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
You are generating a live public-web narrative view for the asset ${symbol}.

Search the public web for recent, publicly indexed discussion about ${symbol}, including:
- Twitter / X
- Reddit
- News
- YouTube
- TikTok / short-form

Important:
- The UI has FIVE FIXED PLATFORM SLOTS ONLY:
  1. x
  2. reddit
  3. news
  4. youtube
  5. tiktok
- Do NOT rename those platforms.
- Do NOT use outlet names like CNBC, Bloomberg, WSJ, Reuters, etc. as platform names.
- Outlet names and personalities belong in summaries, tags, feed items, or voices — NOT as platform labels.
- If one platform has weak or no visible coverage, say so plainly in that platform bucket.
- Make the content specific to ${symbol}, not generic market commentary.

Return JSON only in the schema provided.

Additional rules:
- This is a public-web scan, not native platform API telemetry.
- Be specific, useful, and honest about uncertainty.
- Do not invent certainty where coverage is thin.
- Sentiment splits are directional estimates, not exact truth.
- "entry" is a 0-100 heuristic where lower is earlier/cleaner and higher is later/crowded.
- "velocity", "percentile", and "signals24h" should be readable strings, not pseudo-quant precision.
- Keep pulseSummary to 2-4 sentences.
- Feed items should be recent, representative public-web items tied to ${symbol}.
- Voices should be visible names/accounts/outlets surfaced in the scan when possible.
`.trim();

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        symbol: { type: "string" },
        pulseTitle: { type: "string" },
        pulseSummary: { type: "string" },
        updated: { type: "string" },
        chips: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 6,
        },
        verdict: { type: "string" },
        entry: { type: "number" },
        platformBuckets: {
          type: "object",
          additionalProperties: false,
          properties: {
            x: {
              type: "object",
              additionalProperties: false,
              properties: {
                volume: { type: "string" },
                bull: { type: "number" },
                bear: { type: "number" },
                neutral: { type: "number" },
                summary: { type: "string" },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 5,
                },
              },
              required: ["volume", "bull", "bear", "neutral", "summary", "tags"],
            },
            reddit: {
              type: "object",
              additionalProperties: false,
              properties: {
                volume: { type: "string" },
                bull: { type: "number" },
                bear: { type: "number" },
                neutral: { type: "number" },
                summary: { type: "string" },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 5,
                },
              },
              required: ["volume", "bull", "bear", "neutral", "summary", "tags"],
            },
            news: {
              type: "object",
              additionalProperties: false,
              properties: {
                volume: { type: "string" },
                bull: { type: "number" },
                bear: { type: "number" },
                neutral: { type: "number" },
                summary: { type: "string" },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 5,
                },
              },
              required: ["volume", "bull", "bear", "neutral", "summary", "tags"],
            },
            youtube: {
              type: "object",
              additionalProperties: false,
              properties: {
                volume: { type: "string" },
                bull: { type: "number" },
                bear: { type: "number" },
                neutral: { type: "number" },
                summary: { type: "string" },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 5,
                },
              },
              required: ["volume", "bull", "bear", "neutral", "summary", "tags"],
            },
            tiktok: {
              type: "object",
              additionalProperties: false,
              properties: {
                volume: { type: "string" },
                bull: { type: "number" },
                bear: { type: "number" },
                neutral: { type: "number" },
                summary: { type: "string" },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 5,
                },
              },
              required: ["volume", "bull", "bear", "neutral", "summary", "tags"],
            },
          },
          required: ["x", "reddit", "news", "youtube", "tiktok"],
        },
        feed: {
          type: "array",
          minItems: 0,
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              source: { type: "string" },
              author: { type: "string" },
              meta: { type: "string" },
              tone: {
                type: "string",
                enum: ["Bullish", "Mixed", "Bearish"],
              },
              headline: { type: "string" },
              body: { type: "string" },
              impact: { type: "number" },
              time: { type: "string" },
            },
            required: [
              "source",
              "author",
              "meta",
              "tone",
              "headline",
              "body",
              "impact",
              "time",
            ],
          },
        },
        voices: {
          type: "array",
          minItems: 0,
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              source: { type: "string" },
              name: { type: "string" },
              stance: {
                type: "string",
                enum: ["Bullish", "Mixed", "Bearish"],
              },
              reach: { type: "string" },
              quote: { type: "string" },
            },
            required: ["source", "name", "stance", "reach", "quote"],
          },
        },
        velocity: { type: "string" },
        percentile: { type: "string" },
        signals24h: { type: "string" },
      },
      required: [
        "symbol",
        "pulseTitle",
        "pulseSummary",
        "updated",
        "chips",
        "verdict",
        "entry",
        "platformBuckets",
        "feed",
        "voices",
        "velocity",
        "percentile",
        "signals24h",
      ],
    };

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
        text: {
          format: {
            type: "json_schema",
            name: "narriv_social_scan",
            strict: true,
            schema,
          },
        },
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

    const parsed = JSON.parse(outputText) as SocialScanModelResponse;

    const response: SocialScanResponse = {
      symbol,
      pulseTitle:
        parsed.pulseTitle && parsed.pulseTitle.includes(symbol)
          ? parsed.pulseTitle
          : `${symbol} — Narrative Pulse`,
      pulseSummary: parsed.pulseSummary,
      updated: parsed.updated || "just now",
      chips: Array.isArray(parsed.chips) ? parsed.chips.slice(0, 6) : [],
      verdict: parsed.verdict,
      entry: Math.max(0, Math.min(100, Math.round(parsed.entry ?? 50))),
      cards: buildCards(parsed.platformBuckets),
      feed: Array.isArray(parsed.feed) ? parsed.feed : [],
      voices: Array.isArray(parsed.voices) ? parsed.voices : [],
      velocity: parsed.velocity || "—",
      percentile: parsed.percentile || "—",
      signals24h: parsed.signals24h || "—",
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
