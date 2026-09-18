import { NextResponse } from "next/server";

type ExchangeRateResponse = {
  result?: string;
  rates?: Record<string, number>;
};

export const revalidate = 3600;

export async function GET() {
  const response = await fetch("https://open.er-api.com/v6/latest/KES", {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Exchange rates are temporarily unavailable" }, { status: 503 });
  }

  const data = (await response.json()) as ExchangeRateResponse;
  const usdRate = data.result === "success" ? data.rates?.USD : undefined;
  if (!usdRate || !Number.isFinite(usdRate) || usdRate <= 0) {
    return NextResponse.json({ error: "USD exchange rate is unavailable" }, { status: 503 });
  }

  return NextResponse.json({ base: "KES", rates: { KES: 1, USD: usdRate } });
}
