"use client";

import useSWR from "swr";
import { Position } from "@/lib/api";
import { StatCard } from "@/components/Cards";
import RefreshButton from "@/components/RefreshButton";
import StockChart from "@/components/StockChart";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const POSITION_LABELS: Record<string, string> = {
  oqep_1: "أو كيو للإستكشاف والإنتاج – الصفقة الأولى",
  oqep_2: "أو كيو للإستكشاف والإنتاج – الصفقة الثانية",
  oqpi: "أو كيو للصناعات الأساسية",
  ishraq: "صندوق إشراق الوقفي",
};

export default function StockPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data, error, isLoading, mutate } = useSWR<Position>(
    `/api/portfolio/${id}`,
    fetcher,
    { refreshInterval: 300_000 }
  );

  if (isLoading || !data) {
    return (
      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div className="skeleton" style={{ height: 36, width: 200, marginBottom: "2rem" }} />
        <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius)" }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 280, borderRadius: "var(--radius)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div
          style={{
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius)",
            padding: "2rem",
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          <div style={{ color: "#ef4444", fontWeight: 700, marginBottom: "1rem" }}>
            لم يُعثر على المركز الاستثماري
          </div>
          <a href="/" className="btn btn-outline" style={{ display: "inline-block" }}>
            → العودة للوحة التحكم
          </a>
        </div>
      </div>
    );
  }

  const pos = data;
  const isPending = pos.is_pending;
  const isProfit = pos.profit > 0;
  const profitColor = isPending ? "#f59e0b" : isProfit ? "#10b981" : pos.profit < 0 ? "#ef4444" : "#8fa3c0";

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>

      {/* ─── رابط العودة ─── */}
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          marginBottom: "1.8rem",
          padding: "0.4rem 0.8rem",
          borderRadius: "7px",
          border: "1px solid var(--card-border)",
          background: "var(--card-bg)",
          transition: "all 0.2s",
        }}
      >
        → العودة للوحة التحكم
      </a>

      {/* ─── رأس الصفحة ─── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* أيقونة الشركة */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(92,45,145,0.15), rgba(92,45,145,0.04))",
              border: "1px solid rgba(92,45,145,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5C2D91",
              fontWeight: 800,
              fontSize: "1.2rem",
            }}
          >
            {pos.msx_symbol?.charAt(0) ?? "☪"}
          </div>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.35rem" }}>
              {pos.msx_symbol && (
                <span
                  style={{
                    background: "rgba(92,45,145,0.08)",
                    color: "#5C2D91",
                    border: "1px solid rgba(92,45,145,0.25)",
                    borderRadius: "7px",
                    padding: "3px 10px",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                  }}
                >
                  {pos.msx_symbol}
                </span>
              )}
              {pos.transaction_label && (
                <span
                  style={{
                    background: "rgba(92,45,145,0.06)",
                    color: "var(--text-secondary)",
                    borderRadius: "7px",
                    padding: "3px 10px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  {pos.transaction_label}
                </span>
              )}
            </div>
            <h1 style={{ fontWeight: 800, fontSize: "1.45rem", color: "var(--text-primary)", lineHeight: 1.25 }}>
              {pos.name_ar}
            </h1>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
              {pos.name_en}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <RefreshButton onRefresh={() => mutate()} />
          {/* السعر الحي */}
          <div style={{ textAlign: "left" }}>
            {isPending ? (
              <span className="badge-profit pending" style={{ fontSize: "0.9rem", padding: "5px 12px" }}>
                قيد – سعر غير متاح
              </span>
            ) : (
              <div>
                <div
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 800,
                    fontSize: "2rem",
                    lineHeight: 1.1,
                    direction: "ltr",
                  }}
                >
                  {pos.live_price?.toFixed(3)} ر.ع
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textAlign: "right" }}>
                  سعر الإغلاق الحي
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── بطاقات الإحصاءات ─── */}
      <div className="stats-grid" style={{ marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem" }}>
        <StatCard
          label="قيمة الاستثمار"
          value={`${pos.investment_value.toLocaleString("ar-OM", { minimumFractionDigits: 3 })} ر.ع`}
          sub="المبلغ المدفوع أصلاً"
          type="gold"
        />
        <StatCard
          label="القيمة السوقية الحالية"
          value={
            isPending
              ? "—"
              : `${pos.market_value.toLocaleString("ar-OM", { minimumFractionDigits: 3 })} ر.ع`
          }
          sub={isPending ? "في انتظار حركة تداول" : "سعر الإغلاق × عدد الأسهم"}
          type="default"
        />
        <StatCard
          label="إجمالي الربح / الخسارة"
          value={
            isPending
              ? "—"
              : `${pos.profit >= 0 ? "+" : ""}${pos.profit.toLocaleString("ar-OM", { minimumFractionDigits: 3 })} ر.ع`
          }
          sub={isPending ? "قيد – لا توجد بيانات" : undefined}
          type={isPending ? "pending" : isProfit ? "profit" : pos.profit < 0 ? "loss" : "default"}
        />
        <StatCard
          label="نسبة العائد"
          value={
            isPending
              ? "—"
              : `${pos.roi_percent >= 0 ? "+" : ""}${pos.roi_percent.toFixed(2)}٪`
          }
          sub="(إجمالي الربح ÷ قيمة الاستثمار) × 100"
          type={isPending ? "pending" : isProfit ? "profit" : pos.profit < 0 ? "loss" : "default"}
        />
      </div>

      {/* ─── مخطط السعر ─── */}
      <div style={{ marginBottom: "2rem" }}>
        <StockChart
          purchasePrice={pos.purchase_price}
          currentPrice={pos.live_price ?? pos.purchase_price}
          stockSymbol={pos.msx_symbol ?? undefined}
          nameAr={pos.name_ar}
          nameEn={pos.name_en}
          isPending={pos.is_pending}
        />
      </div>

      {/* ─── تفاصيل الورقة المالية ─── */}
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: 3,
              height: 20,
              background: "linear-gradient(180deg, #5C2D91, #4A2478)",
              borderRadius: 2,
            }}
          />
          <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
            تفاصيل الحساب
          </h2>
        </div>

        <table className="data-table">
          <tbody>
            <tr>
              <td style={{ color: "var(--text-muted)", width: "50%" }}>عدد الأسهم</td>
              <td style={{ fontWeight: 700, direction: "ltr", textAlign: "right" }}>
                {pos.shares.toLocaleString("en-US")} سهم
              </td>
            </tr>
            <tr>
              <td style={{ color: "var(--text-muted)" }}>سعر الشراء (قيمة السهم عند الشراء)</td>
              <td style={{ fontWeight: 700, direction: "ltr", textAlign: "right" }}>
                {pos.purchase_price.toFixed(3)} ر.ع
              </td>
            </tr>
            <tr>
              <td style={{ color: "var(--text-muted)" }}>سعر الإغلاق</td>
              <td style={{ fontWeight: 700, direction: "ltr", textAlign: "right" }}>
                {isPending
                  ? <span className="badge-profit pending">قيد</span>
                  : `${pos.live_price?.toFixed(3)} ر.ع`}
              </td>
            </tr>
            <tr>
              <td style={{ color: "var(--text-muted)" }}>الربح لكل سهم</td>
              <td style={{ fontWeight: 700, color: profitColor, direction: "ltr", textAlign: "right" }}>
                {isPending
                  ? "—"
                  : `${pos.profit_per_share >= 0 ? "+" : ""}${pos.profit_per_share.toFixed(4)} ر.ع`}
              </td>
            </tr>
            <tr>
              <td style={{ color: "var(--text-muted)" }}>قيمة الاستثمار (ر.ع)</td>
              <td style={{ fontWeight: 700, direction: "ltr", textAlign: "right" }}>
                {pos.investment_value.toLocaleString("en-US", { minimumFractionDigits: 3 })} ر.ع
              </td>
            </tr>
            <tr>
              <td style={{ color: "var(--text-muted)" }}>القيمة السوقية الحالية</td>
              <td style={{ fontWeight: 700, direction: "ltr", textAlign: "right" }}>
                {isPending ? "—" : `${pos.market_value.toLocaleString("en-US", { minimumFractionDigits: 3 })} ر.ع`}
              </td>
            </tr>
            <tr>
              <td style={{ color: "var(--text-muted)" }}>إجمالي الربح / الخسارة</td>
              <td style={{ fontWeight: 800, color: profitColor, direction: "ltr", textAlign: "right" }}>
                {isPending
                  ? "—"
                  : `${pos.profit >= 0 ? "+" : ""}${pos.profit.toLocaleString("en-US", { minimumFractionDigits: 3 })} ر.ع`}
              </td>
            </tr>
            <tr>
              <td style={{ color: "var(--text-muted)" }}>نسبة العائد على الاستثمار</td>
              <td style={{ fontWeight: 800, color: profitColor }}>
                {isPending ? "—" : `${pos.roi_percent >= 0 ? "+" : ""}${pos.roi_percent.toFixed(4)}٪`}
              </td>
            </tr>
          </tbody>
        </table>

        {/* معادلة الحساب */}
        {!isPending && (
          <div
            style={{
              marginTop: "1.5rem",
              background: "rgba(92,45,145,0.04)",
              border: "1px solid rgba(92,45,145,0.12)",
              borderRadius: "10px",
              padding: "1rem 1.2rem",
            }}
          >
            <div style={{ color: "#5C2D91", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.6rem" }}>
              📐 تفصيل المعادلات
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                direction: "ltr",
                textAlign: "left",
                fontFamily: "monospace",
              }}
            >
              <div>ربح السهم = {pos.live_price?.toFixed(3)} – {pos.purchase_price.toFixed(3)} = {pos.profit_per_share.toFixed(4)} ر.ع</div>
              <div>إجمالي الربح = {pos.profit_per_share.toFixed(4)} × {pos.shares.toLocaleString("en-US")} = {pos.profit.toFixed(3)} ر.ع</div>
              <div>القيمة السوقية = {pos.live_price?.toFixed(3)} × {pos.shares.toLocaleString("en-US")} = {pos.market_value.toFixed(3)} ر.ع</div>
              <div>نسبة العائد = ({pos.profit.toFixed(3)} ÷ {pos.investment_value.toFixed(3)}) × 100 = {pos.roi_percent.toFixed(4)}٪</div>
            </div>
          </div>
        )}

        {isPending && (
          <div
            style={{
              marginTop: "1.5rem",
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "10px",
              padding: "1rem 1.2rem",
              color: "#f59e0b",
              fontSize: "0.82rem",
            }}
          >
            ⚠️ هذا الأصل بحالة <strong>قيد</strong> – لا يوجد سعر إغلاق متاح من سوق مسقط حتى الآن.
            القيمة السوقية تُعامَل مساوية لقيمة الشراء ({pos.investment_value.toLocaleString("ar-OM", { minimumFractionDigits: 3 })} ر.ع) والربح = 0 إلى أن يتوفر السعر.
          </div>
        )}
      </div>
    </div>
  );
}
