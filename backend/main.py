"""
الخادم الرئيسي – خادم API للوقف مسقط
Backend API Server – Al Waqf Muscat Portfolio Tracker

تشغيل: uvicorn main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager
from typing import Optional

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from portfolio_data import PORTFOLIO, calculate_position, build_summary
from scraper import fetch_all_prices, get_cached_prices

# ─────────────────────────────────────────────
# إعداد التسجيل
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)s │ %(name)s │ %(message)s",
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# قائمة الرموز المالية المطلوبة (غير المعلّقة)
# ─────────────────────────────────────────────
ACTIVE_TICKERS: list[str] = list(
    {p["msx_symbol"] for p in PORTFOLIO if not p["pending"] and p["msx_symbol"]}
)

# أسعار حية مخزّنة في الذاكرة
_live_prices: dict[str, Optional[float]] = {}


def refresh_prices() -> None:
    """تحديث أسعار السوق من MSX"""
    global _live_prices
    logger.info("🔄 جلب الأسعار من سوق مسقط...")
    prices = fetch_all_prices(ACTIVE_TICKERS)
    _live_prices.update(prices)
    logger.info("✅ تم تحديث الأسعار: %s", prices)


# ─────────────────────────────────────────────
# الجدولة الزمنية – كل 5 دقائق
# ─────────────────────────────────────────────
scheduler = BackgroundScheduler(timezone="Asia/Muscat")
scheduler.add_job(refresh_prices, "interval", minutes=5, id="price_refresh")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # عند البدء: جلب أولي للأسعار وبدء الجدولة
    refresh_prices()
    scheduler.start()
    logger.info("🚀 خادم الوقف مسقط يعمل")
    yield
    scheduler.shutdown()
    logger.info("🛑 تم إيقاف الخادم")


# ─────────────────────────────────────────────
# تهيئة التطبيق
# ─────────────────────────────────────────────
app = FastAPI(
    title="الوقف مسقط – متتبع المحفظة",
    description="API لتتبع محفظة الأسهم الحية في سوق مسقط للأوراق المالية",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# دوال مساعدة
# ─────────────────────────────────────────────
def _enrich_all() -> list[dict]:
    enriched = []
    for p in PORTFOLIO:
        price = _live_prices.get(p["msx_symbol"]) if p["msx_symbol"] else None
        enriched.append(calculate_position(p, price))
    return enriched


# ─────────────────────────────────────────────
# نقاط النهاية (Endpoints)
# ─────────────────────────────────────────────

@app.get("/", tags=["عام"])
def root():
    return {"message": "مرحباً – نظام تتبع محفظة الوقف مسقط يعمل بنجاح ✅"}


@app.get("/api/portfolio", tags=["المحفظة"])
def get_full_portfolio():
    """
    يعيد كامل المحفظة مع الأسعار الحية والحسابات.
    """
    positions = _enrich_all()
    summary = build_summary(positions)
    return {
        "positions": positions,
        "summary": summary,
        "prices_cache": get_cached_prices(),
    }


@app.get("/api/portfolio/{position_id}", tags=["المحفظة"])
def get_position(position_id: str):
    """
    يعيد تفاصيل مركز استثماري محدد بالـ ID.
    المعرّفات: oqep_1 | oqep_2 | oqpi | ishraq
    """
    target = next((p for p in PORTFOLIO if p["id"] == position_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"لم يُعثر على المركز: {position_id}")
    price = _live_prices.get(target["msx_symbol"]) if target["msx_symbol"] else None
    return calculate_position(target, price)


@app.get("/api/prices", tags=["الأسعار"])
def get_prices():
    """يعيد الأسعار الحية المخزّنة مؤقتاً"""
    return {"tickers": ACTIVE_TICKERS, "prices": _live_prices}


@app.post("/api/prices/refresh", tags=["الأسعار"])
def force_refresh():
    """يجبر تحديثاً فورياً للأسعار من MSX"""
    refresh_prices()
    return {"status": "تم التحديث", "prices": _live_prices}


@app.get("/api/summary", tags=["الملخص"])
def get_summary():
    """يعيد ملخص إجمالي المحفظة الاستثمارية"""
    positions = _enrich_all()
    return build_summary(positions)
