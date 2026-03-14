import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const symbol = (req.nextUrl.searchParams.get("asset") || "NVDA").trim().toUpperCase();

    if (!apiKey) {
      return NextResponse.json(
        { step: "env", error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Search the web and summarize recent discussion about the stock ticker ${symbol}. Treat it as the stock/security, not an unrelated acronym.`,
        tools: [{ type: "web_search" }],
        tool_choice: "auto",
        text: {
          format: {
            type: "json_schema",
            name: "mini_social_scan",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                symbol: { type: "string" },
                verdict: { type: "string" },
                summary: { type: "string" }
              },
              required: ["symbol", "verdict", "summary"]
            }
          }
        }
      }),
    });

    const text = await res.text();

    return NextResponse.json({
      step: "responses_with_web_search_and_small_schema",
      status: res.status,
      ok: res.ok,
      body: text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        step: "responses_with_web_search_and_small_schema",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
