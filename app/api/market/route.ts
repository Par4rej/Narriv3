import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type FinnhubQuote = {
  c?: number;
  d?: number;
  dp?: number;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
  t?: number;
};

type FinnhubProfile = {
  ticker?: string;
  name?: string;
  finnhubIndustry?: string;
};

type CandleResponse = {
  c?: number[];
  t?: number[];
  s?: string;
};

function formatPrice(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return value >= 1000
    ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : `$${value.toFixed(2)}`;
}

function formatPct(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function calcPct(current?: number, prior?: number) {
  if (
    typeof current !== "number" ||
    !Number.isFinite(current) ||
    typeof prior !== "number" ||
    !Number.isFinite(prior) ||
    prior === 0
  ) {
    return undefined;
  }
  return ((current - prior) / prior) * 100;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

function unixDaysAgo(days: number) {
  return Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
}

function startOfYearUnix() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor(start.getTime() / 1000);
}

function firstClose(data: CandleResponse) {
  if (data?.s !== "ok" || !Array.isArray(data?.c) || data.c.length === 0) {
    return undefined;
  }
  return data.c[0];
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

    const asset = (req.nextUrl.searchParams.get("asset") || "")
      .trim()
      .toUpperCase();

    if (!asset) {
      return NextResponse.json(
        { error: "Missing asset symbol" },
        { status: 400 }
      );
    }

    const base = "https://finnhub.io/api/v1";
    const nowUnix = Math.floor(Date.now() / 1000);

    const quoteUrl = `${base}/quote?symbol=${encodeURIComponent(asset)}&token=${apiKey}`;
    const profileUrl = `${base}/stock/profile2?symbol=${encodeURIComponent(asset)}&token=${apiKey}`;
    const weekUrl = `${base}/stock/candle?symbol=${encodeURIComponent(asset)}&resolution=D&from=${unixDaysAgo(10)}&to=${nowUnix}&token=${apiKey}`;
    const monthUrl = `${base}/stock/candle?symbol=${encodeURIComponent(asset)}&resolution=D&from=${unixDaysAgo(40)}&to=${nowUnix}&token=${apiKey}`;
    const ytdUrl = `${base}/stock/candle?symbol=${encodeURIComponent(asset)}&resolution=D&from=${startOfYearUnix()}&to=${nowUnix}&token=${apiKey}`;

    const [quote, profile, weekCandles, monthCandles, ytdCandles] =
      await Promise.all([
        fetchJson(quoteUrl) as Promise<FinnhubQuote>,
        fetchJson(profileUrl).catch(() => ({})) as Promise<FinnhubProfile>,
        fetchJson(weekUrl).catch(() => ({})) as Promise<CandleResponse>,
        fetchJson(monthUrl).catch(() => ({})) as Promise<CandleResponse>,
        fetchJson(ytdUrl).catch(() => ({})) as Promise<CandleResponse>,
      ]);

    if (
      !quote ||
      typeof quote.c !== "number" ||
      !Number.isFinite(quote.c) ||
      quote.c === 0
    ) {
      return NextResponse.json(
        { error: `No market quote returned for ${asset}` },
        { status: 404 }
      );
    }

    const current = quote.c;
    const response = {
      symbol: asset,
      name: profile?.name || asset,
      type: profile?.finnhubIndustry || "Asset",
      price: formatPrice(current),
      change1D:
        typeof quote.dp === "number" && Number.isFinite(quote.dp)
          ? formatPct(quote.dp)
          : formatPct(calcPct(current, quote.pc)),
      change1W: formatPct(calcPct(current, firstClose(weekCandles))),
      change1M: formatPct(calcPct(current, firstClose(monthCandles))),
      changeYTD: formatPct(calcPct(current, firstClose(ytdCandles))),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown market route error",
      },
      { status: 500 }
    );
  }
}
