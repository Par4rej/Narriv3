import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const symbol = (req.nextUrl.searchParams.get("asset") || "NVDA").trim().toUpperCase();

    if (!apiKey) {
      return NextResponse.json({ step: "env", error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Give me one short sentence about ${symbol}.`,
      }),
    });

    const text = await res.text();

    return NextResponse.json({
      step: "plain_responses_test",
      status: res.status,
      ok: res.ok,
      body: text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        step: "plain_responses_test",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
