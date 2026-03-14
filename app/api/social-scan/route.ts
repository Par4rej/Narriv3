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

type FeedItemRaw = {
  source?: string;
  author?: string;
  meta?: string;
  tone?: Tone | string;
  headline?: string;
  body?: string;
  impact?: number;
  time?: string;
};

type VoiceItemRaw = {
  source?: string;
  name?: string;
  stance?: Tone | string;
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
  feed?: FeedItemRaw[];
  voices?: VoiceItemRaw[];
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

function normalizeBucket(bucket?: PlatformBucketRaw): Required<PlatformBucketRaw> {
  const bull = clampPercent(bucket?.bull, 50);
  const bear = clampPercent(bucket?.bear, 25);
  let neutral = clampPercent(bucket?.neutral, 25);

  const total = bull + bear + neutral;
  if (total !== 100) {
    neutral = Math.max(0, 100 - bull - bear);
  }

  return {
    volume: s(bucket?.volume, "light coverage"),
    bull,
    bear,
    neutral,
    summary: s(bucket?.summary, "Coverage is currently thin."),
    tags:
      Array.isArray(bucket?.tags) && bucket.tags.length > 0
        ? bucket.tags.slice(0, 5).map((x) => s(x)).filter(Boolean)
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
      icon: "X",
      accent: "#1DA1F2",
      soft: "rgba(29,161,242,0.12)",
      ...x,
    },
    {
      platform: "Reddit",
      icon: "R",
      accent: "#FF5700",
      soft: "rgba(255,87,0,0.12)",
      ...reddit,
    },
    {
      platform: "News",
      icon: "N",
      accent: "#5E8AFF",
      soft: "rgba(94,138,255,0.12)",
      ...news,
    },
    {
      platform: "YouTube",
      icon: "Y",
      accent: "#FF0033",
      soft: "rgba(255,0,51,0.12)",
      ...youtube,
    },
    {
      platform: "TikTok",
      icon: "T",
      accent: "#FE2C55",
      soft: "rgba(254,44,85,0.12)",
      ...tiktok,
    },
  ];
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

function cleanOutputText(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractFirstJsonObject(text: string) {
  const cleaned = cleanOutputText(text);
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object start found");

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === `"`) {
        inString = false;
      }
      continue;
    }

    if (ch === `"`) {
      inString = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return cleaned.slice(start, i + 1);
      }
    }
  }

  throw new Error("No complete JSON object found");
}

function fallback(symbol: string, note?: string): SocialScanResponse {
  return {
    symbol,
    pulseTitle: `${symbol} — Narrative Pulse`,
    pulseSummary:
      note ||
      `Narriv scanned public-web results for ${symbol}. Coverage is directional and live when available, but this request fell back safely instead of failing.`,
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
        summary: "No recent discussions surfaced on X.",
        tags: ["thin coverage"],
      },
      reddit: {
        volume: "thin coverage",
        bull: 0,
        bear: 0,
        neutral: 100,
        summary: "No recent discussions surfaced on Reddit.",
        tags: ["thin coverage"],
      },
      news: {
        volume: "thin coverage",
        bull: 0,
        bear: 0,
        neutral: 100,
        summary: "No recent news items were strong enough to surface.",
        tags: ["thin coverage"],
      },
      youtube: {
        volume: "thin coverage",
        bull: 0,
        bear: 0,
        neutral: 100,
        summary: "No recent YouTube items surfaced.",
        tags: ["thin coverage"],
      },
      tiktok: {
        volume: "thin coverage",
        bull: 0,
        bear: 0,
        neutral: 100,
        summary: "No recent TikTok items surfaced.",
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
      "Recent public-web signal was too thin or inconsistent, so Narriv returned a safe fallback instead of erroring.",
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
- Feed items should be RECENT and ideally within the last 24 hours. If not enough exist, return fewer.
- Voices should be RECENT and include a time field.
- attentionLabel should be short and plain English.
- attentionTake should be one simple sentence explaining what matters to an investor.
- Keep all strings concise and readable.
- If a platform has weak coverage, say so plainly.

Return this shape exactly:
{
  "symbol": "string",
  "pulseTitle": "string",
  "pulseSummary": "string",
  "updated": "string",
  "chips": ["string"],
  "verdict": "string",
  "entry": 50,
  "platformBuckets": {
    "x": { "volume": "string", "bull": 0, "bear": 0, "neutral": 100, "summary": "string", "tags": ["string"] },
    "reddit": { "volume": "string", "bull": 0, "bear": 0, "neutral": 100, "summary": "string", "tags": ["string"] },
    "news": { "volume": "string", "bull": 0, "bear": 0, "neutral": 100, "summary": "string", "tags": ["string"] },
    "youtube": { "volume": "string", "bull": 0, "bear": 0, "neutral": 100, "summary": "string", "tags": ["string"] },
    "tiktok": { "volume": "string", "bull": 0, "bear": 0, "neutral": 100, "summary": "string", "tags": ["string"] }
  },
  "feed": [
    { "source": "string", "author": "string", "meta": "string", "tone": "Bullish", "headline": "string", "body": "string", "impact": 50, "time": "string" }
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

    let parsed: SocialScanModelResponse;
    try {
      parsed = JSON.parse(extractFirstJsonObject(outputText)) as SocialScanModelResponse;
    } catch (err) {
      console.error("social-scan parse error:", err, outputText);
      return NextResponse.json(
        fallback(symbol, "Narrative output could not be parsed cleanly."),
        { status: 200 }
      );
    }

    const rawFeed: FeedItem[] = Array.isArray(parsed.feed)
      ? parsed.feed.slice(0, 12).map((item) => ({
          source: s(item.source, "Source"),
          author: s(item.author, "Unknown"),
          meta: s(item.meta),
          tone: normalizeTone(item.tone),
          headline: s(item.headline, "Recent item"),
          body: s(item.body),
          impact: clampPercent(item.impact, 50),
          time: s(item.time, "recently"),
        }))
      : [];

    const feed = rawFeed
      .filter((item) => isRecentEnough(item.time, 24))
      .slice(0, 6)
      .map((item) => ({
        ...item,
        time: formatRelativeTime(item.time),
      }));

    const rawVoices: VoiceItem[] = Array.isArray(parsed.voices)
      ? parsed.voices.slice(0, 12).map((voice) => ({
          source: s(voice.source, "Source"),
          name: s(voice.name, "Unknown"),
          stance: normalizeTone(voice.stance),
          reach: s(voice.reach),
          quote: s(voice.quote),
          time: s(voice.time, "recently"),
        }))
      : [];

    const voices = rawVoices
      .filter((voice) => isRecentEnough(voice.time, 72))
      .slice(0, 6)
      .map((voice) => ({
        ...voice,
        time: formatRelativeTime(voice.time),
      }));

    const response: SocialScanResponse = {
      symbol,
      pulseTitle:
        s(parsed.pulseTitle) && s(parsed.pulseTitle).includes(symbol)
          ? s(parsed.pulseTitle)
          : `${symbol} — Narrative Pulse`,
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
      cards: buildCards(parsed.platformBuckets),
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
