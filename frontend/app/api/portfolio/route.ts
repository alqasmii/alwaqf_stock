import { NextResponse } from "next/server";
import {
  PORTFOLIO,
  fetchAllPrices,
  calculatePosition,
  buildSummary,
} from "../_lib/portfolio";

// Always fetch fresh — no static caching
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prices = await fetchAllPrices();
    const positions = PORTFOLIO.map((p) =>
      calculatePosition(p, p.msx_symbol ? (prices[p.msx_symbol] ?? null) : null)
    );
    const summary = buildSummary(positions);
    return NextResponse.json({ positions, summary, prices_cache: {} });
  } catch (err) {
    console.error("Portfolio fetch error:", err);
    return NextResponse.json(
      { error: "فشل جلب بيانات المحفظة" },
      { status: 500 }
    );
  }
}
