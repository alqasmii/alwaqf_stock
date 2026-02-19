# بيانات المحفظة الاستثمارية - الوقف مسقط
# Portfolio static data extracted from document: الإستثمار في الأسهم2026.docx

from typing import Optional

PORTFOLIO: list[dict] = [
    {
        "id": "oqep_1",
        "ticker": "OQEP",
        "name_ar": "أو كيو للإستكشاف والإنتاج",
        "name_en": "OQ Exploration & Production",
        "transaction_label": "الصفقة الأولى",
        "shares": 274_000,
        "purchase_price": 0.390,
        "investment_value": 107_000.0,
        "msx_symbol": "OQEP",
        "pending": False,
    },
    {
        "id": "ishraq",
        "ticker": "ISHRAQ_WAQF",
        "name_ar": "صندوق إشراق الوقفي",
        "name_en": "Ishraq Waqf Fund",
        "transaction_label": None,
        "shares": 100_000,
        "purchase_price": 1.020,
        "investment_value": 100_000.0,
        "msx_symbol": None,          # سعر قيد – pending
        "pending": True,
    },
    {
        "id": "oqpi",
        "ticker": "OQPI",
        "name_ar": "أو كيو للصناعات الأساسية",
        "name_en": "OQ Base Industries",
        "transaction_label": None,
        "shares": 148_219,
        "purchase_price": 0.100,
        "investment_value": 14_877.0,
        "msx_symbol": "OQPI",
        "pending": False,
    },
    {
        "id": "oqep_2",
        "ticker": "OQEP",
        "name_ar": "أو كيو للإستكشاف والإنتاج",
        "name_en": "OQ Exploration & Production",
        "transaction_label": "الصفقة الثانية",
        "shares": 73_259,
        "purchase_price": 0.341,
        "investment_value": 24_999.597,
        "msx_symbol": "OQEP",
        "pending": False,
    },
]


def calculate_position(position: dict, live_price: Optional[float]) -> dict:
    """
    يحسب مؤشرات المركز الاستثماري بناءً على السعر الحي.
    إذا كان السعر غير متاح (قيد) تُعامَل القيمة السوقية = قيمة الشراء والربح = 0.
    """
    shares: int = position["shares"]
    purchase_price: float = position["purchase_price"]
    investment_value: float = position["investment_value"]

    if position["pending"] or live_price is None:
        return {
            **position,
            "live_price": None,
            "market_value": investment_value,
            "profit": 0.0,
            "profit_per_share": 0.0,
            "roi_percent": 0.0,
            "is_pending": True,
        }

    profit_per_share: float = round(live_price - purchase_price, 4)
    total_profit: float = round(profit_per_share * shares, 3)
    market_value: float = round(live_price * shares, 3)
    roi_percent: float = round((total_profit / investment_value) * 100, 4) if investment_value else 0.0

    return {
        **position,
        "live_price": live_price,
        "market_value": market_value,
        "profit": total_profit,
        "profit_per_share": profit_per_share,
        "roi_percent": roi_percent,
        "is_pending": False,
    }


def build_summary(positions: list[dict]) -> dict:
    """
    يبني ملخص إجمالي المحفظة.
    نسبة العائد = (إجمالي الربح ÷ إجمالي الاستثمار) × 100
    """
    total_investment = sum(p["investment_value"] for p in PORTFOLIO)
    total_profit = sum(p["profit"] for p in positions)
    total_market_value = sum(p["market_value"] for p in positions)
    roi_percent = round((total_profit / total_investment) * 100, 4) if total_investment else 0.0

    return {
        "total_investment": round(total_investment, 3),
        "total_profit": round(total_profit, 3),
        "total_market_value": round(total_market_value, 3),
        "roi_percent": roi_percent,
    }
