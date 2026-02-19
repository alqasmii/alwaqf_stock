// ─── Portfolio Data ────────────────────────────────────────────────────────────

export interface PortfolioEntry {
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
}

export const PORTFOLIO: PortfolioEntry[] = [
  {
    id: "oqep_1",
    ticker: "OQEP",
    name_ar: "أو كيو للإستكشاف والإنتاج",
    name_en: "OQ Exploration & Production",
    transaction_label: "الصفقة الأولى",
    shares: 274_000,
    purchase_price: 0.39,
    investment_value: 107_000.0,
    msx_symbol: "OQEP",
    pending: false,
  },
  {
    id: "ishraq",
    ticker: "ISHRAQ_WAQF",
    name_ar: "صندوق إشراق الوقفي",
    name_en: "Ishraq Waqf Fund",
    transaction_label: null,
    shares: 100_000,
    purchase_price: 1.02,
    investment_value: 100_000.0,
    msx_symbol: null,
    pending: true,
  },
  {
    id: "oqpi",
    ticker: "OQPI",
    name_ar: "أو كيو للصناعات الأساسية",
    name_en: "OQ Base Industries",
    transaction_label: null,
    shares: 148_219,
    purchase_price: 0.1,
    investment_value: 14_877.0,
    msx_symbol: "OQPI",
    pending: false,
  },
  {
    id: "oqep_2",
    ticker: "OQEP",
    name_ar: "أو كيو للإستكشاف والإنتاج",
    name_en: "OQ Exploration & Production",
    transaction_label: "الصفقة الثانية",
    shares: 73_259,
    purchase_price: 0.341,
    investment_value: 24_999.597,
    msx_symbol: "OQEP",
    pending: false,
  },
];

// ─── Scraping ──────────────────────────────────────────────────────────────────

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
  Referer: "https://www.msx.om/",
};

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/,/g, "").replace(/[^\d.]/g, "");
  const val = parseFloat(cleaned);
  return val > 0 ? val : null;
}

async function tryApiJson(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://www.msx.om/Api/GetSecurityInfo?symbol=${ticker}&lang=ar`,
      { headers: FETCH_HEADERS, signal: AbortSignal.timeout(8_000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    for (const key of ["ClosePrice", "LastTradePrice", "close", "last", "price"]) {
      if (data[key] != null) return parseFloat(data[key]);
    }
  } catch {
    // ignore
  }
  return null;
}

async function trySearchApi(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://www.msx.om/Api/GetSearchData?term=${ticker}&lang=ar`,
      { headers: FETCH_HEADERS, signal: AbortSignal.timeout(8_000) }
    );
    if (!res.ok) return null;
    const items = await res.json();
    if (Array.isArray(items) && items.length > 0) {
      const item = items[0];
      for (const key of ["ClosePrice", "LastTrade", "Close", "Price"]) {
        if (item[key] != null) return parseFloat(item[key]);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

async function tryHtmlScrape(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://www.msx.om/market-data/equities/${ticker.toLowerCase()}`,
      { headers: FETCH_HEADERS, signal: AbortSignal.timeout(12_000) }
    );
    if (!res.ok) return null;
    const html = await res.text();
    const patterns = [
      /data-field="[^"]*close[^"]*"[^>]*>\s*([0-9][0-9,.]*)/i,
      /class="[^"]*close[-_]?price[^"]*"[^>]*>\s*([0-9][0-9,.]*)/i,
      /"ClosePrice"\s*:\s*"?([0-9.]+)/i,
      /"LastTradePrice"\s*:\s*"?([0-9.]+)/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const price = parsePrice(match[1]);
        if (price && price > 0.01 && price < 100) return price;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function fetchLivePrice(ticker: string): Promise<number | null> {
  let price: number | null = null;

  price = await tryApiJson(ticker);
  if (!price) price = await trySearchApi(ticker);
  if (!price) price = await tryHtmlScrape(ticker);

  // env var fallback: OQEP_PRICE, OQPI_PRICE …
  if (!price) {
    const envVal = process.env[`${ticker.toUpperCase()}_PRICE`];
    if (envVal) price = parseFloat(envVal);
  }

  return price ?? null;
}

// ─── Calculations ──────────────────────────────────────────────────────────────

export function calculatePosition(pos: PortfolioEntry, livePrice: number | null) {
  if (pos.pending || livePrice === null) {
    return {
      ...pos,
      live_price: null,
      market_value: pos.investment_value,
      profit: 0,
      profit_per_share: 0,
      roi_percent: 0,
      is_pending: true,
    };
  }
  const profitPerShare = Math.round((livePrice - pos.purchase_price) * 10_000) / 10_000;
  const totalProfit = Math.round(profitPerShare * pos.shares * 1_000) / 1_000;
  const marketValue = Math.round(livePrice * pos.shares * 1_000) / 1_000;
  const roiPercent =
    Math.round((totalProfit / pos.investment_value) * 1_000_000) / 10_000;
  return {
    ...pos,
    live_price: livePrice,
    market_value: marketValue,
    profit: totalProfit,
    profit_per_share: profitPerShare,
    roi_percent: roiPercent,
    is_pending: false,
  };
}

export function buildSummary(positions: ReturnType<typeof calculatePosition>[]) {
  const totalInvestment = PORTFOLIO.reduce((s, p) => s + p.investment_value, 0);
  const totalProfit = positions.reduce((s, p) => s + p.profit, 0);
  const totalMarketValue = positions.reduce((s, p) => s + p.market_value, 0);
  const roiPercent =
    Math.round((totalProfit / totalInvestment) * 1_000_000) / 10_000;
  return {
    total_investment: Math.round(totalInvestment * 100) / 100,
    total_profit: Math.round(totalProfit * 1_000) / 1_000,
    total_market_value: Math.round(totalMarketValue * 1_000) / 1_000,
    roi_percent: roiPercent,
  };
}

// ─── Fetch all prices in parallel ─────────────────────────────────────────────

export async function fetchAllPrices(): Promise<Record<string, number | null>> {
  const tickers = [
    ...new Set(
      PORTFOLIO.filter((p) => !p.pending && p.msx_symbol).map(
        (p) => p.msx_symbol as string
      )
    ),
  ];
  const entries = await Promise.all(
    tickers.map(async (t) => [t, await fetchLivePrice(t)] as const)
  );
  return Object.fromEntries(entries);
}
