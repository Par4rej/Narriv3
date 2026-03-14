import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value || 0);
}

function formatPct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function pctFromPrices(start: number | null, end: number | null) {
  if (!start || !end || start === 0) return "—";
  return formatPct(((end - start) / start) * 100);
}

function unixDaysAgo(days: number) {
  return Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
}

function startOfYearUnix() {
  const now = new Date();
  return Math.floor(new Date(now.getFullYear(), 0, 1).getTime() / 1000);
}

function normalizeAsset(inputRaw: string) {
  const input = inputRaw.trim().toUpperCase();

  const cryptoMap: Record<
    string,
    { symbol: string; displayName: string; finnhubSymbol: string; type: string; isCrypto: boolean }
  > = {
    BTC: {
      symbol: "BTC",
      displayName: "Bitcoin",
      finnhubSymbol: "BINANCE:BTCUSDT",
      type: "Crypto",
      isCrypto: true,
    },
    ETH: {
      symbol: "ETH",
      displayName: "Ethereum",
      finnhubSymbol: "BINANCE:ETHUSDT",
      type: "Crypto",
      isCrypto: true,
    },
    SOL: {
      symbol: "SOL",
      displayName: "Solana",
      finnhubSymbol: "BINANCE:SOLUSDT",
      type: "Crypto",
      isCrypto: true,
    },
    DOGE: {
      symbol: "DOGE",
      displayName: "Dogecoin",
      finnhubSymbol: "BINANCE:DOGEUSDT",
      type: "Crypto",
      isCrypto: true,
    },
  };

  if (cryptoMap[input]) return cryptoMap[input];

  return {
    symbol: input || "NVDA",
    displayName: input || "NVDA",
    finnhubSymbol: input || "NVDA",
    type: "Equity",
    isCrypto: false,
  };
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }
  return res.json();
}

function firstClose(candles: any): number | null {
  if (!candles || candles.s !== "ok" || !Array.isArray(candles.c) || candles.c.length === 0) {
    return null;
  }
  return candles.c[0];
}

async function fetchCandles(
  symbol: string,
  from: number,
  to: number,
  token: string,
  isCrypto: boolean
) {
  const endpoint = isCrypto ? "crypto/candle" : "stock/candle";
  return fetchJson(
    `https://finnhub.io/api/v1/${endpoint}?symbol=${encodeURIComponent(
      symbol
    )}&resolution=D&from=${from}&to=${to}&token=${token}`
  );
}

export async function GET(req: NextRequest) {
  try {
    const finnhubKey = process.env.FINNHUB_API_KEY;

    if (!finnhubKey) {
      return NextResponse.json(
        { error: "Missing FINNHUB_API_KEY" },
        { status: 500 }
      );
    }

    const rawAsset = req.nextUrl.searchParams.get("asset") ?? "NVDA";
    const asset = normalizeAsset(rawAsset);

    const quote = await fetchJson(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
        asset.finnhubSymbol
      )}&token=${finnhubKey}`
    );

    let name = asset.displayName;
    let type = asset.type;

    if (!asset.isCrypto) {
      try {
        const profile = await fetchJson(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(
            asset.finnhubSymbol
          )}&token=${finnhubKey}`
        );
        if (profile?.name) name = profile.name;
      } catch {
        // keep fallback
      }
    }

    const nowUnix = Math.floor(Date.now() / 1000);

    const [weekCandles, monthCandles, ytdCandles] = await Promise.all([
      fetchCandles(asset.finnhubSymbol, unixDaysAgo(10), nowUnix, finnhubKey, asset.isCrypto),
      fetchCandles(asset.finnhubSymbol, unixDaysAgo(40), nowUnix, finnhubKey, asset.isCrypto),
      fetchCandles(asset.finnhubSymbol, startOfYearUnix(), nowUnix, finnhubKey, asset.isCrypto),
    ]);

    const currentPrice =
      typeof quote?.c === "number" && quote.c > 0 ? quote.c : 0;
    const prevClose =
      typeof quote?.pc === "number" && quote.pc > 0 ? quote.pc : currentPrice;

    const dp =
      typeof quote?.dp === "number"
        ? quote.dp
        : prevClose
        ? ((currentPrice - prevClose) / prevClose) * 100
        : 0;

    return NextResponse.json({
      symbol: asset.symbol,
      name,
      type,
      price: currentPrice ? formatUsd(currentPrice) : "—",
      change1D: currentPrice ? formatPct(dp) : "—",
      change1W: pctFromPrices(firstClose(weekCandles), currentPrice),
      change1M: pctFromPrices(firstClose(monthCandles), currentPrice),
      changeYTD: pctFromPrices(firstClose(ytdCandles), currentPrice),
    });
  } catch (error) {
    console.error("market route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load market snapshot",
      },
      { status: 500 }
    );
  }
}
