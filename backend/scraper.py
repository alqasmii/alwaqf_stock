"""
مجتلب أسعار سوق مسقط للأوراق المالية (MSX)
Scraper for Muscat Stock Exchange – https://www.msx.om/

الاستراتيجية:
1. أولاً: محاولة جلب السعر من واجهة MSX JSON (الأسرع والأموثوق).
2. ثانياً: إن فشلت – استخدام طلب HTML عبر requests + BeautifulSoup.
3. ثالثاً: استخدام قيمة مخزّنة مؤقتاً آخر مرة تم جلبها.
"""

import logging
import time
import re
from typing import Optional
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────
# ④ أسعار يدوية (fallback) – يتم تحميلها من ملف .env.prices
# Manual fallback prices loaded from .env.prices in the same directory
# ─────────────────────────────────────────────────────────────────────
import os as _os

_MANUAL_PRICES: dict[str, float] = {}


def _load_manual_prices() -> None:
    """يقرأ ملف .env.prices ويملأ قاموس الأسعار اليدوية"""
    prices_file = _os.path.join(_os.path.dirname(__file__), ".env.prices")
    if not _os.path.exists(prices_file):
        return
    with open(prices_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                ticker, _, price_str = line.partition("=")
                try:
                    _MANUAL_PRICES[ticker.strip().upper()] = float(price_str.strip())
                except ValueError:
                    pass
    if _MANUAL_PRICES:
        logger.info("📋 تم تحميل أسعار يدوية: %s", _MANUAL_PRICES)


_load_manual_prices()

# رؤوس HTTP تحاكي متصفح حقيقي
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
    "Referer": "https://www.msx.om/",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

# ذاكرة تخزين مؤقت للأسعار [ticker -> {price, timestamp}]
_price_cache: dict[str, dict] = {}
CACHE_TTL_SECONDS = 300  # 5 دقائق

# -------------------------------------------------------------------
# ① استراتيجية API JSON
# -------------------------------------------------------------------
MSX_QUOTE_URL = "https://www.msx.om/Api/GetSecurityInfo"
MSX_SEARCH_URL = "https://www.msx.om/Api/GetSearchData"
MSX_MARKET_URL = "https://www.msx.om/market-data/equities"


def _try_api_json(ticker: str) -> Optional[float]:
    """محاولة جلب السعر عبر AJAX endpoint الرسمي لـ MSX"""
    try:
        resp = SESSION.get(
            MSX_QUOTE_URL,
            params={"symbol": ticker, "lang": "ar"},
            timeout=10,
        )
        if resp.status_code == 200:
            data = resp.json()
            # المواقع تختلف في مفاتيح JSON – نجرب عدة مفاتيح شائعة
            for key in ("ClosePrice", "LastTradePrice", "close", "last", "price"):
                val = data.get(key)
                if val is not None:
                    return float(val)
    except Exception as exc:
        logger.debug("API JSON attempt failed for %s: %s", ticker, exc)
    return None


def _try_search_api(ticker: str) -> Optional[float]:
    """محاولة البحث عبر endpoint آخر"""
    try:
        resp = SESSION.get(
            MSX_SEARCH_URL,
            params={"term": ticker, "lang": "ar"},
            timeout=10,
        )
        if resp.status_code == 200:
            items = resp.json()
            if isinstance(items, list) and items:
                item = items[0]
                for key in ("ClosePrice", "LastTrade", "Close", "Price"):
                    val = item.get(key)
                    if val is not None:
                        return float(val)
    except Exception as exc:
        logger.debug("Search API attempt failed for %s: %s", ticker, exc)
    return None


# -------------------------------------------------------------------
# ② استراتيجية HTML scraping
# -------------------------------------------------------------------

MSX_TICKER_PAGE = "https://www.msx.om/market-data/equities/{ticker}"


def _try_html_scrape(ticker: str) -> Optional[float]:
    """جلب سعر الإغلاق من صفحة HTML لورقة مالية محددة"""
    url = MSX_TICKER_PAGE.format(ticker=ticker.lower())
    try:
        resp = SESSION.get(url, timeout=15)
        if resp.status_code != 200:
            # جرب صفحة السوق العامة
            return _scrape_market_page(ticker)
        soup = BeautifulSoup(resp.text, "lxml")

        # بحث عن سعر الإغلاق – عدة أنماط محتملة في هيكل MSX
        patterns = [
            lambda s: s.find(attrs={"data-field": re.compile(r"close|Close", re.I)}),
            lambda s: s.find("span", class_=re.compile(r"close[-_]?price|last[-_]?price", re.I)),
            lambda s: s.find(string=re.compile(r"سعر الإغلاق|Close Price", re.I)),
        ]
        for pattern in patterns:
            el = pattern(soup)
            if el:
                text = el.get_text(strip=True) if hasattr(el, "get_text") else str(el)
                price = _parse_price(text)
                if price:
                    return price

        # بحث شامل في الجداول
        for td in soup.find_all("td"):
            text = td.get_text(strip=True)
            price = _parse_price(text)
            if price and 0.01 < price < 10:  # نطاق أسعار منطقي لـ MSX
                return price

    except Exception as exc:
        logger.debug("HTML scrape failed for %s: %s", ticker, exc)
    return None


def _scrape_market_page(ticker: str) -> Optional[float]:
    """جلب السعر من صفحة السوق العامة وفيلترة حسب الرمز"""
    try:
        resp = SESSION.get(MSX_MARKET_URL, timeout=20)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "lxml")

        # البحث عن صف يحتوي على رمز الورقة المالية
        all_rows = soup.find_all("tr")
        for row in all_rows:
            row_text = row.get_text(" ", strip=True)
            if ticker.upper() in row_text.upper():
                cells = row.find_all("td")
                if len(cells) >= 4:
                    # عادةً: [الرقم, الرمز, الاسم, سعر الإغلاق, ...]
                    for cell in cells[2:6]:
                        price = _parse_price(cell.get_text(strip=True))
                        if price and 0.01 < price < 100:
                            return price
    except Exception as exc:
        logger.debug("Market page scrape failed: %s", exc)
    return None


def _parse_price(text: str) -> Optional[float]:
    """تحليل نص وإرجاع سعر عشري"""
    if not text:
        return None
    # إزالة الفواصل وتنظيف النص
    cleaned = re.sub(r"[^\d.]", "", text.replace(",", ""))
    try:
        val = float(cleaned)
        return val if val > 0 else None
    except ValueError:
        return None


# -------------------------------------------------------------------
# الواجهة العامة
# -------------------------------------------------------------------

def fetch_live_price(ticker: str) -> Optional[float]:
    """
    يعيد آخر سعر إغلاق متاح للرمز المالي ticker.
    يحاول ثلاث استراتيجيات بالتسلسل، مع تخزين مؤقت لمدة 5 دقائق.
    يعيد None إذا لم يتمكن من الجلب (حالة "قيد").
    """
    now = time.time()
    cached = _price_cache.get(ticker)
    if cached and (now - cached["ts"]) < CACHE_TTL_SECONDS:
        logger.info("Cache hit for %s: %s", ticker, cached["price"])
        return cached["price"]

    price: Optional[float] = None

    # ① API JSON
    price = _try_api_json(ticker)
    if price:
        logger.info("Got price from API JSON for %s: %s", ticker, price)

    # ② Search API
    if not price:
        price = _try_search_api(ticker)
        if price:
            logger.info("Got price from Search API for %s: %s", ticker, price)

    # ③ HTML scrape
    if not price:
        price = _try_html_scrape(ticker)
        if price:
            logger.info("Got price from HTML scrape for %s: %s", ticker, price)

    # ④ الأسعار اليدوية – آخر ملاذ
    if not price:
        manual = _MANUAL_PRICES.get(ticker.upper())
        if manual:
            logger.info("Using manual fallback price for %s: %s", ticker, manual)
            price = manual

    if price:
        _price_cache[ticker] = {"price": price, "ts": now}

    return price


def fetch_all_prices(tickers: list[str]) -> dict[str, Optional[float]]:
    """يجلب أسعار قائمة رموز مالية ويعيد قاموساً {ticker: price}"""
    return {ticker: fetch_live_price(ticker) for ticker in tickers}


def get_cached_prices() -> dict[str, dict]:
    """يعيد نسخة من الذاكرة المؤقتة للأسعار"""
    return dict(_price_cache)
