import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function pct(from: number, to: number) {
  if (!from || !to) return "0.0%";
  const val = ((to - from) / from) * 100;
  return `${val >= 0 ? "+" : ""}${val.toFixed(1)}%`;
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
    { symbol: string; displayName: string; finnhubSymbol: string; type: string }
  > = {
    BTC: {
      symbol: "BTC",
      displayName: "Bitcoin",
      finnhubSymbol: "BINANCE:BTCUSDT",
      type: "Crypto",
    },
    ETH: {
      symbol: "ETH",
      displayName: "Ethereum",
      finnhubSymbol: "BINANCE:ETHUSDT",
      type: "Crypto",
    },
    SOL: {
      symbol: "SOL",
      displayName: "Solana",
      finnhubSymbol: "BINANCE:SOLUSDT",
      type: "Crypto",
    },
    DOGE: {
      symbol: "DOGE",
      displayName: "Dogecoin",
      finnhubSymbol: "BINANCE:DOGEUSDT",
      type: "Crypto",
    },
  };

  if (cryptoMap[input]) return cryptoMap[input];

  return {
    symbol: input || "NVDA",
    displayName: input || "NVDA",
    finnhubSymbol: input || "NVDA",
    type: "Equity",
  };
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function firstClose(candles: any) {
  if (!Array.isArray(candles?.c) || candles.c.length === 0) return null;
  return candles.c[0];
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

    if (!asset.finnhubSymbol.includes(":")) {
      try {
        const profile = await fetchJson(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(
            asset.finnhubSymbol
          )}&token=${finnhubKey}`
        );
        if (profile?.name) name = profile.name;
      } catch {}
    }

    const nowUnix = Math.floor(Date.now() / 1000);
    const [weekCandles, monthCandles, ytdCandles] = await Promise.all([
      fetchJson(
        `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(
          asset.finnhubSymbol
        )}&resolution=D&from=${unixDaysAgo(8)}&to=${nowUnix}&token=${finnhubKey}`
      ),
      fetchJson(
        `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(
          asset.finnhubSymbol
        )}&resolution=D&from=${unixDaysAgo(32)}&to=${nowUnix}&token=${finnhubKey}`
      ),
      fetchJson(
        `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(
          asset.finnhubSymbol
        )}&resolution=D&from=${startOfYearUnix()}&to=${nowUnix}&token=${finnhubKey}`
      ),
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
      price: formatUsd(currentPrice),
      change1D: `${dp >= 0 ? "+" : ""}${dp.toFixed(1)}%`,
      change1W: pct(firstClose(weekCandles) || currentPrice, currentPrice),
      change1M: pct(firstClose(monthCandles) || currentPrice, currentPrice),
      changeYTD: pct(firstClose(ytdCandles) || currentPrice, currentPrice),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load market snapshot" },
      { status: 500 }
    );
  }
}
