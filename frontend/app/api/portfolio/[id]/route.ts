import { NextResponse } from "next/server";
import {
  PORTFOLIO,
  fetchLivePrice,
  calculatePosition,
} from "../../_lib/portfolio";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const target = PORTFOLIO.find((p) => p.id === params.id);
  if (!target) {
    return NextResponse.json(
      { error: `لم يُعثر على المركز: ${params.id}` },
      { status: 404 }
    );
  }
  const livePrice = target.msx_symbol
    ? await fetchLivePrice(target.msx_symbol)
    : null;
  return NextResponse.json(calculatePosition(target, livePrice));
}
