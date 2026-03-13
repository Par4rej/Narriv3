import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SearchResult = {
  symbol: string;
  name: string;
  type: string;
};

const cryptoAliases: SearchResult[] = [
  { symbol: "BTC", name: "Bitcoin", type: "Crypto" },
  { symbol: "ETH", name: "Ethereum", type: "Crypto" },
  { symbol: "SOL", name: "Solana", type: "Crypto" },
  { symbol: "DOGE", name: "Dogecoin", type: "Crypto" },
];

function normalizeFinnhubType(type?: string) {
  const raw = (type || "").toLowerCase();
  if (raw.includes("etf")) return "ETF";
  if (raw.includes("fund")) return "Fund";
  if (raw.includes("common")) return "Equity";
  if (raw.includes("adr")) return "Equity";
  if (raw.includes("reit")) return "REIT";
  return "Equity";
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

    const q = (req.nextUrl.searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({
        results: [
          ...cryptoAliases,
          { symbol: "NVDA", name: "NVIDIA Corp", type: "Equity" },
          { symbol: "EQIX", name: "Equinix Inc", type: "REIT" },
          { symbol: "AAPL", name: "Apple Inc", type: "Equity" },
          { symbol: "TSLA", name: "Tesla Inc", type: "Equity" },
          { symbol: "MSTR", name: "MicroStrategy", type: "Equity" },
        ],
      });
    }

    const cryptoMatches = cryptoAliases.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q.toLowerCase()) ||
        item.name.toLowerCase().includes(q.toLowerCase())
    );

    const res = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${finnhubKey}`,
      { cache: "no-store" }
    );

    const data = await res.json();

    const stockResults: SearchResult[] = Array.isArray(data?.result)
      ? data.result
          .filter(
            (item: any) =>
              item?.symbol &&
              item?.description &&
              !String(item.symbol).includes(".") &&
              !String(item.symbol).includes(":")
          )
          .slice(0, 40)
          .map((item: any) => ({
            symbol: item.symbol,
            name: item.description,
            type: normalizeFinnhubType(item.type),
          }))
      : [];

    const lowerQ = q.toLowerCase();

    const exactSymbolMatches = stockResults.filter(
      (item) => item.symbol.toLowerCase() === lowerQ
    );
    const prefixSymbolMatches = stockResults.filter(
      (item) =>
        item.symbol.toLowerCase().startsWith(lowerQ) &&
        item.symbol.toLowerCase() !== lowerQ
    );
    const nameMatches = stockResults.filter(
      (item) =>
        !item.symbol.toLowerCase().startsWith(lowerQ) &&
        item.name.toLowerCase().includes(lowerQ)
    );

    return NextResponse.json({
      results: [
        ...cryptoMatches,
        ...exactSymbolMatches,
        ...prefixSymbolMatches,
        ...nameMatches,
      ].slice(0, 12),
    });
  } catch (error) {
    console.error("search route error:", error);
    return NextResponse.json({ results: [] });
  }
}
