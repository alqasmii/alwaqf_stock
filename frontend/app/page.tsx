"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { PortfolioResponse } from "@/lib/api";
import { StatCard, PositionCard } from "@/components/Cards";
import PortfolioTable from "@/components/PortfolioTable";
import RefreshButton from "@/components/RefreshButton";
import PortfolioChart from "@/components/PortfolioChart";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("فشل الاتصال بالخادم");
    return r.json();
  });

export default function DashboardPage() {
  const [view, setView] = useState<"cards" | "table">("cards");
  const { data, error, isLoading, mutate } = useSWR<PortfolioResponse>(
    "/api/portfolio",
    fetcher,
    { refreshInterval: 300_000 } // تحديث تلقائي كل 5 دقائق
  );

  const handleRefresh = useCallback(() => mutate(), [mutate]);

  // ─── حالة الخطأ ───
  if (error) {
    return (
      <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div
          style={{
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius)",
            padding: "2rem",
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⚠️</div>
          <div style={{ color: "#ef4444", fontWeight: 700, marginBottom: "0.5rem" }}>
            تعذّر الاتصال بالخادم
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            تأكد من تشغيل الخادم الخلفي على المنفذ 8000
          </div>
          <button className="btn btn-outline" onClick={() => mutate()}>
            ↻ إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // ─── حالة التحميل ───
  if (isLoading || !data) {
    return (
      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius)" }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 350, borderRadius: "var(--radius)" }} />
      </div>
    );
  }

  const { positions, summary } = data;
  const totalPendingCount = positions.filter((p) => p.is_pending).length;

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>

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
        <div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: "0.3rem",
            }}
          >
            لوحة التحكم
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            محفظة الوقف مسقط · سوق مسقط للأوراق المالية
          </p>
        </div>
        <RefreshButton onRefresh={handleRefresh} />
      </div>

      {/* ─── بطاقات الملخص ─── */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
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
            ملخص إجمالي الاستثمار
          </h2>
        </div>

        <div className="stats-grid">
          <StatCard
            label="إجمالي قيمة الاستثمار"
            value={`${summary.total_investment.toLocaleString("ar-OM", { minimumFractionDigits: 3 })} ر.ع`}
            sub="رأس المال المستثمر"
            type="gold"
            large
          />
          <StatCard
            label="إجمالي الربح"
            value={`${summary.total_profit >= 0 ? "+" : ""}${summary.total_profit.toLocaleString("ar-OM", { minimumFractionDigits: 3 })} ر.ع`}
            sub="الأرباح المحققة حتى الآن"
            type={summary.total_profit > 0 ? "profit" : summary.total_profit < 0 ? "loss" : "default"}
            large
          />
          <StatCard
            label="القيمة السوقية الحالية"
            value={`${summary.total_market_value.toLocaleString("ar-OM", { minimumFractionDigits: 3 })} ر.ع`}
            sub="القيمة الإجمالية اليوم"
            type="default"
            large
          />
          <StatCard
            label="نسبة العائد الإجمالية"
            value={`${summary.roi_percent >= 0 ? "+" : ""}${summary.roi_percent.toFixed(2)}٪`}
            sub={`كل 100 ر.ع أنتجت ${Math.abs(summary.roi_percent).toFixed(2)} ر.ع ربح`}
            type={summary.roi_percent > 0 ? "profit" : summary.roi_percent < 0 ? "loss" : "default"}
            large
          />
        </div>

        {/* معادلة الحساب */}
        <div
          style={{
            marginTop: "1.2rem",
            background: "rgba(92,45,145,0.04)",
            border: "1px solid rgba(92,45,145,0.12)",
            borderRadius: "10px",
            padding: "0.9rem 1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "#5C2D91", fontSize: "0.8rem", fontWeight: 600 }}>📐 طريقة الحساب:</span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", direction: "ltr" }}>
            نسبة العائد = (إجمالي الربح ÷ إجمالي الاستثمار) × 100 =
            ({summary.total_profit.toFixed(3)} ÷ {summary.total_investment.toFixed(3)}) × 100 = {summary.roi_percent.toFixed(2)}٪
          </span>
        </div>

        {totalPendingCount > 0 && (
          <div
            style={{
              marginTop: "0.75rem",
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "10px",
              padding: "0.75rem 1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
              color: "#f59e0b",
            }}
          >
            ⚠️ يوجد {totalPendingCount} أصل بحالة "قيد" – القيمة السوقية تعادل قيمة الشراء حتى يتوفر السعر.
          </div>
        )}
      </section>

      {/* ─── مخطط الأداء ─── */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
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
            مخطط الأداء السعري
          </h2>
        </div>
        <PortfolioChart />
      </section>

      {/* ─── جدول / بطاقات التبديل ─── */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1.2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
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
              المراكز الاستثمارية ({positions.length})
            </h2>
          </div>

          {/* تبديل العرض */}
          <div
            style={{
              display: "flex",
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "9px",
              padding: "3px",
              gap: "3px",
            }}
          >
            {(["cards", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Tajawal, sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: view === v ? "rgba(92,45,145,0.12)" : "transparent",
                  color: view === v ? "#5C2D91" : "var(--text-muted)",
                  transition: "all 0.2s",
                }}
              >
                {v === "cards" ? "بطاقات" : "جدول"}
              </button>
            ))}
          </div>
        </div>

        {view === "cards" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.2rem",
            }}
          >
            {positions.map((pos) => (
              <PositionCard key={pos.id} position={pos} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <PortfolioTable positions={positions} />
          </div>
        )}
      </section>
    </div>
  );
}
