import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SearchResult = {
  symbol: string;
  name: string;
  type: string;
};

const cryptoAliases: SearchResult[] = [
  { symbol: "BTC", name: "Bitcoin", type: "crypto" },
  { symbol: "ETH", name: "Ethereum", type: "crypto" },
  { symbol: "SOL", name: "Solana", type: "crypto" },
  { symbol: "DOGE", name: "Dogecoin", type: "crypto" },
];

function normalizeFinnhubType(type?: string) {
  const raw = (type || "").toLowerCase();
  if (raw.includes("etf")) return "etf";
  if (raw.includes("common")) return "stock";
  if (raw.includes("adr")) return "stock";
  if (raw.includes("fund")) return "fund";
  return "stock";
}

export async function GET(req: NextRequest) {
  try {
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (!finnhubKey) {
      return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });
    }

    const q = (req.nextUrl.searchParams.get("q") || "").trim();
    if (!q) {
      return NextResponse.json({
        results: [
          ...cryptoAliases,
          { symbol: "AAPL", name: "Apple Inc", type: "stock" },
          { symbol: "MSFT", name: "Microsoft Corp", type: "stock" },
          { symbol: "NVDA", name: "NVIDIA Corp", type: "stock" },
          { symbol: "TSLA", name: "Tesla Inc", type: "stock" },
          { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", type: "etf" },
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
          .slice(0, 12)
          .map((item: any) => ({
            symbol: item.symbol,
            name: item.description,
            type: normalizeFinnhubType(item.type),
          }))
      : [];

    const merged = [...cryptoMatches, ...stockResults].slice(0, 12);

    return NextResponse.json({ results: merged });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ results: [] });
  }
}
