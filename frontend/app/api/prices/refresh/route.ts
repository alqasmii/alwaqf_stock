import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// No in-memory state in serverless functions — each GET /api/portfolio
// already fetches fresh prices. This endpoint exists for UI compatibility.
export async function POST() {
  return NextResponse.json({ status: "تم التحديث" });
}
