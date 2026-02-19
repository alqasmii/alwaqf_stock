// تعريفات أنواع البيانات

export interface Position {
  id: string;
  ticker: string;
  name_ar: string;
  name_en: string;
  transaction_label: string | null;
  shares: number;
  purchase_price: number;
  investment_value: number;
  msx_symbol: string | null;
  pending: boolean;
  live_price: number | null;
  market_value: number;
  profit: number;
  profit_per_share: number;
  roi_percent: number;
  is_pending: boolean;
}

export interface PortfolioSummary {
  total_investment: number;
  total_profit: number;
  total_market_value: number;
  roi_percent: number;
}

export interface PortfolioResponse {
  positions: Position[];
  summary: PortfolioSummary;
  prices_cache: Record<string, { price: number; ts: number }>;
}

// ─────────────────────────────────────────────
// دوال الجلب
// ─────────────────────────────────────────────

const BASE = "/api";

export async function fetchPortfolio(): Promise<PortfolioResponse> {
  const res = await fetch(`${BASE}/portfolio`, { cache: "no-store" });
  if (!res.ok) throw new Error("فشل جلب بيانات المحفظة");
  return res.json();
}

export async function fetchPosition(id: string): Promise<Position> {
  const res = await fetch(`${BASE}/portfolio/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`فشل جلب المركز: ${id}`);
  return res.json();
}

export async function forceRefresh(): Promise<void> {
  await fetch(`${BASE}/prices/refresh`, { method: "POST" });
}
