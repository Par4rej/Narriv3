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
  time: string;
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
  attentionLabel: string;
  attentionTake: string;
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
  attentionLabel: string;
  attentionTake: string;
};

function s(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function clampPercent(value: unknown, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clampEntry(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.max(8, Math.min(92, Math.round(n)));
}

function normalizeTone(value: unknown): Tone {
  if (value === "Bullish" || value === "Bearish" || value === "Mixed") return value;
  return "Mixed";
}

function parseTimeValue(value?: string): number | null {
  if (!value) return null;

  const trimmed = value.trim();
  const direct = Date.parse(trimmed);
  if (!Number.isNaN(direct)) return direct;

  const lower = trimmed.toLowerCase();

  if (
    lower === "today" ||
    lower === "this morning" ||
    lower === "this afternoon" ||
    lower === "this evening" ||
    lower === "just now"
  ) {
    return Date.now() - 30 * 60 * 1000;
  }

  const hAgo = lower.match(/^(\d+)\s*h(?:ours?)?\s*ago$/);
  if (hAgo) return Date.now() - Number(hAgo[1]) * 60 * 60 * 1000;

  const mAgo = lower.match(/^(\d+)\s*m(?:in(?:utes?)?)?\s*ago$/);
  if (mAgo) return Date.now() - Number(mAgo[1]) * 60 * 1000;

  const dAgo = lower.match(/^(\d+)\s*d(?:ays?)?\s*ago$/);
  if (dAgo) return Date.now() - Number(dAgo[1]) * 24 * 60 * 60 * 1000;

  return null;
}

function formatRelativeTime(input?: string) {
  const ts = parseTimeValue(input);
  if (!ts) return input || "recently";

  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function isRecentEnough(input?: string, maxHours = 24) {
  const ts = parseTimeValue(input);
  if (!ts) return false;
  return Date.now() - ts <= maxHours * 60 * 60 * 1000;
}

function buildCards(
  buckets: SocialScanModelResponse["platformBuckets"]
): PlatformCard[] {
  return [
    {
      platform: "Twitter / X",
      icon: "X",
      accent: "#1DA1F2",
      soft: "rgba(29,161,242,0.12)",
      ...buckets.x,
    },
    {
      platform: "Reddit",
      icon: "R",
      accent: "#FF5700",
      soft: "rgba(255,87,0,0.12)",
      ...buckets.reddit,
    },
    {
      platform: "News",
      icon: "N",
      accent: "#5E8AFF",
      soft: "rgba(94,138,255,0.12)",
      ...buckets.news,
    },
    {
      platform: "YouTube",
      icon: "Y",
      accent: "#FF0033",
      soft: "rgba(255,0,51,0.12)",
      ...buckets.youtube,
    },
    {
      platform: "TikTok",
      icon: "T",
      accent: "#FE2C55",
      soft: "rgba(254,44,85,0.12)",
      ...buckets.tiktok,
    },
  ];
}

function fallback(symbol: string, note?: string): SocialScanResponse {
  return {
    symbol,
    pulseTitle: `${symbol} — Narrative Pulse`,
    pulseSummary:
      note ||
      `Narriv scanned public-web discussion for ${symbol}, but recent indexed signal was thin or inconsistent.`,
    updated: "just now",
    chips: ["Fallback mode", "Live route", "Retry soon"],
    verdict: "Mixed / thin coverage",
    entry: 50,
    cards: buildCards({
      x: {
        volume: "thin coverage",
        bull: 0,
        bear: 0,
        neutral: 100,
        summary: `No strong recent X discussion surfaced for ${symbol}.`,
        tags: ["thin coverage"],
      },
      reddit: {
        volume: "thin coverage",
        bull: 0,
        bear: 0,
        neutral: 100,
        summary: `No strong recent Reddit discussion surfaced for ${symbol}.`,
        tags: ["thin coverage"],
      },
      news: {
        volume: "thin coverage",
        bull: 0,
        bear: 0,
        neutral: 100,
        summary: `No strong recent news discussion surfaced for ${symbol}.`,
        tags: ["thin coverage"],
      },
      youtube: {
        volume: "thin coverage",
        bull: 0,
        bear: 0,
        neutral: 100,
        summary: `No strong recent YouTube discussion surfaced for ${symbol}.`,
        tags: ["thin coverage"],
      },
      tiktok: {
        volume: "thin coverage",
        bull: 0,
        bear: 0,
        neutral: 100,
        summary: `No strong recent TikTok discussion surfaced for ${symbol}.`,
        tags: ["thin coverage"],
      },
    }),
    feed: [],
    voices: [],
    velocity: "Stable",
    percentile: "50th",
    signals24h: "Few recent signals",
    attentionLabel: "Attention stable",
    attentionTake:
      `Recent indexed discussion around ${symbol} was too thin or inconsistent to build a stronger live narrative read.`,
  };
}

export async function GET(req: NextRequest) {
  const symbol = s(req.nextUrl.searchParams.get("asset"), "UNKNOWN").toUpperCase();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallback(symbol, "OpenAI key is missing."), {
        status: 200,
      });
    }

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
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              source: { type: "string" },
              author: { type: "string" },
              meta: { type: "string" },
              tone: { type: "string", enum: ["Bullish", "Mixed", "Bearish"] },
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
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              source: { type: "string" },
              name: { type: "string" },
              stance: { type: "string", enum: ["Bullish", "Mixed", "Bearish"] },
              reach: { type: "string" },
              quote: { type: "string" },
              time: { type: "string" },
            },
            required: ["source", "name", "stance", "reach", "quote", "time"],
          },
        },
        velocity: { type: "string" },
        percentile: { type: "string" },
        signals24h: { type: "string" },
        attentionLabel: { type: "string" },
        attentionTake: { type: "string" },
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
        "attentionLabel",
        "attentionTake",
      ],
    };

    const prompt = `
You are generating a live public-web narrative view for the stock/asset ticker ${symbol}.

The requested ticker is EXACTLY: ${symbol}
Do not answer for any other ticker.
If coverage is thin, still stay on ${symbol} and return thin-coverage JSON for ${symbol}.

Search recent publicly indexed web discussion for ${symbol}, including:
- Twitter / X
- Reddit
- News
- YouTube
- TikTok / short-form

Rules:
- The top-level symbol field MUST equal "${symbol}".
- Estimate bull / bear / neutral from actual recent chatter for ${symbol}.
- Feed items should be recent, ideally within 24 hours.
- Voice items should be recent and include a time field.
- Keep pulseSummary to 2-4 sentences.
- Be specific and honest about thin coverage.
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
      console.error("social-scan openai error:", res.status, errText);
      return NextResponse.json(
        fallback(symbol, "Live web scan was unavailable for this request."),
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
        fallback(symbol, "No usable model output returned."),
        { status: 200 }
      );
    }

    const parsed = JSON.parse(outputText) as SocialScanModelResponse;

    if (s(parsed.symbol).toUpperCase() !== symbol) {
      return NextResponse.json(
        fallback(symbol, `Symbol mismatch from model output for ${symbol}.`),
        { status: 200 }
      );
    }

    const feed = (parsed.feed || [])
      .filter((item) => isRecentEnough(item.time, 24))
      .map((item) => ({
        ...item,
        tone: normalizeTone(item.tone),
        impact: clampPercent(item.impact, 50),
        time: formatRelativeTime(item.time),
      }))
      .slice(0, 6);

    const voices = (parsed.voices || [])
      .filter((item) => isRecentEnough(item.time, 72))
      .map((item) => ({
        ...item,
        stance: normalizeTone(item.stance),
        time: formatRelativeTime(item.time),
      }))
      .slice(0, 6);

    const response: SocialScanResponse = {
      symbol,
      pulseTitle: s(parsed.pulseTitle, `${symbol} — Narrative Pulse`),
      pulseSummary: s(
        parsed.pulseSummary,
        `Narriv scanned recent public-web discussion around ${symbol}.`
      ),
      updated: formatRelativeTime(s(parsed.updated, "recently")),
      chips: Array.isArray(parsed.chips)
        ? parsed.chips.map((x) => s(x)).filter(Boolean).slice(0, 6)
        : [],
      verdict: s(parsed.verdict, "Mixed"),
      entry: clampEntry(parsed.entry),
      cards: buildCards({
        x: {
          ...parsed.platformBuckets.x,
          bull: clampPercent(parsed.platformBuckets.x.bull),
          bear: clampPercent(parsed.platformBuckets.x.bear),
          neutral: clampPercent(parsed.platformBuckets.x.neutral),
        },
        reddit: {
          ...parsed.platformBuckets.reddit,
          bull: clampPercent(parsed.platformBuckets.reddit.bull),
          bear: clampPercent(parsed.platformBuckets.reddit.bear),
          neutral: clampPercent(parsed.platformBuckets.reddit.neutral),
        },
        news: {
          ...parsed.platformBuckets.news,
          bull: clampPercent(parsed.platformBuckets.news.bull),
          bear: clampPercent(parsed.platformBuckets.news.bear),
          neutral: clampPercent(parsed.platformBuckets.news.neutral),
        },
        youtube: {
          ...parsed.platformBuckets.youtube,
          bull: clampPercent(parsed.platformBuckets.youtube.bull),
          bear: clampPercent(parsed.platformBuckets.youtube.bear),
          neutral: clampPercent(parsed.platformBuckets.youtube.neutral),
        },
        tiktok: {
          ...parsed.platformBuckets.tiktok,
          bull: clampPercent(parsed.platformBuckets.tiktok.bull),
          bear: clampPercent(parsed.platformBuckets.tiktok.bear),
          neutral: clampPercent(parsed.platformBuckets.tiktok.neutral),
        },
      }),
      feed,
      voices,
      velocity: s(parsed.velocity, feed.length > 2 ? "Elevated" : "Stable"),
      percentile: s(parsed.percentile, feed.length > 2 ? "65th" : "50th"),
      signals24h:
        s(parsed.signals24h).length > 0 && s(parsed.signals24h).length < 40
          ? s(parsed.signals24h)
          : feed.length > 0
          ? `${feed.length} recent signals surfaced`
          : "Few recent signals",
      attentionLabel: s(parsed.attentionLabel, "Attention stable"),
      attentionTake: s(
        parsed.attentionTake,
        `Recent discussion around ${symbol} is present but not broad enough yet to signal a major shift.`
      ),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("social-scan unexpected route error:", error);
    return NextResponse.json(
      fallback(symbol, "Unexpected route issue — returned safe fallback."),
      { status: 200 }
    );
  }
}
