import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    cards: [
      {
        platform: "Twitter / X",
        icon: "𝕏",
        accent: "#1DA1F2",
        soft: "rgba(29,161,242,0.12)",
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning public-web social results.",
        tags: ["loading"],
      },
      {
        platform: "Reddit",
        icon: "⬡",
        accent: "#FF5700",
        soft: "rgba(255,87,0,0.12)",
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning indexed forum results.",
        tags: ["loading"],
      },
      {
        platform: "News",
        icon: "◉",
        accent: "#5E8AFF",
        soft: "rgba(94,138,255,0.12)",
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning news coverage.",
        tags: ["loading"],
      },
      {
        platform: "YouTube",
        icon: "▶",
        accent: "#FF0033",
        soft: "rgba(255,0,51,0.12)",
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning creator coverage.",
        tags: ["loading"],
      },
      {
        platform: "TikTok",
        icon: "♪",
        accent: "#FE2C55",
        soft: "rgba(254,44,85,0.12)",
        volume: "light coverage",
        bull: 50,
        bear: 25,
        neutral: 25,
        summary: "Scanning short-form public results.",
        tags: ["loading"],
      },
    ],
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

Return JSON only in the schema provided.

Rules:
- This is a public-web scan, not native platform API telemetry.
- Be specific, useful, and honest about uncertainty.
- Do not invent certainty where coverage is thin.
- Keep the page investor-grade and readable.
- Make all fields react specifically to ${symbol}, not generic market commentary.
- If coverage is thin on one platform, say so plainly and reflect that in the volume and sentiment split.
- Sentiment splits should be directional estimates, not fake precision.
- "entry" is a 0-100 heuristic where lower is earlier/cleaner and higher is later/crowded.
- "velocity", "percentile", and "signals24h" should be readable strings, not deep quant claims.
- Keep pulseSummary to 2-4 sentences.
- Feed items should be recent, representative public-web items tied to ${symbol}.
- Voices should be actual visible names/accounts/outlets surfaced in the scan when possible.
- Use present-tense, concise writing.
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
        cards: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              platform: { type: "string" },
              icon: { type: "string" },
              accent: { type: "string" },
              soft: { type: "string" },
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
            required: [
              "platform",
              "icon",
              "accent",
              "soft",
              "volume",
              "bull",
              "bear",
              "neutral",
              "summary",
              "tags",
            ],
          },
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
        "cards",
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

    const parsed = JSON.parse(outputText) as SocialScanResponse;

    parsed.symbol = symbol;
    if (!parsed.pulseTitle?.includes(symbol)) {
      parsed.pulseTitle = `${symbol} — Narrative Pulse`;
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("social-scan route error:", error);
    const symbol = (req.nextUrl.searchParams.get("asset") || "UNKNOWN")
      .trim()
      .toUpperCase();
    return NextResponse.json(fallback(symbol));
  }
}
