import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type FinnhubSearchItem = {
  description?: string;
  displaySymbol?: string;
  symbol?: string;
  type?: string;
};

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    const q = (req.nextUrl.searchParams.get("q") || "").trim();

    if (!apiKey) {
      return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });
    }

    if (!q) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Finnhub search failed: ${text}` }, { status: 500 });
    }

    const data = await res.json();

    const results = Array.isArray(data?.result)
      ? (data.result as FinnhubSearchItem[])
          .filter((item) => {
            const symbol = (item.symbol || item.displaySymbol || "").toUpperCase();
            const type = (item.type || "").toUpperCase();
            return Boolean(symbol) && !symbol.includes(".") && type !== "CRYPTO";
          })
          .slice(0, 12)
          .map((item) => ({
            symbol: (item.symbol || item.displaySymbol || "").toUpperCase(),
            name: item.description || item.symbol || "",
            type: item.type || "Common Stock",
          }))
      : [];

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown search error",
      },
      { status: 500 }
    );
  }
}
