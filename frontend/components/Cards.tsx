"use client";

import { Position } from "@/lib/api";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  type?: "default" | "profit" | "loss" | "pending" | "gold";
  large?: boolean;
}

export function StatCard({ label, value, sub, type = "default", large }: Props) {
  const colorMap = {
    default: "var(--text-primary)",
    profit: "#10b981",
    loss: "#e53935",
    pending: "#f59e0b",
    gold: "#5C2D91",
  };
  const bgMap = {
    default: "transparent",
    profit: "rgba(16,185,129,0.06)",
    loss: "rgba(229,57,53,0.06)",
    pending: "rgba(245,158,11,0.06)",
    gold: "rgba(92,45,145,0.06)",
  };

  return (
    <div
      style={{
        background: bgMap[type] || "var(--card-bg)",
        border: `1px solid ${type === "gold" ? "rgba(92,45,145,0.25)" : "var(--card-border)"}`,
        borderRadius: "var(--radius)",
        padding: large ? "1.6rem 1.4rem" : "1.2rem 1.2rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
      }}
    >
      <div style={{ color: "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 500 }}>
        {label}
      </div>
      <div
        style={{
          color: colorMap[type],
          fontWeight: 800,
          fontSize: large ? "1.7rem" : "1.3rem",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// بطاقة المركز الاستثماري
// ─────────────────────────────────────────────

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const isPending = position.is_pending;
  const isProfit = position.profit > 0;
  const isLoss = position.profit < 0;

  const profitColor = isPending ? "#f59e0b" : isProfit ? "#10b981" : isLoss ? "#ef4444" : "#8fa3c0";

  return (
    <a
      href={`/stock/${position.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "var(--radius)",
        padding: "1.4rem",
        transition: "all 0.25s",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
      }}
      className="position-card"
    >
      {/* رأس البطاقة */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
          gap: "0.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                background: "rgba(92,45,145,0.08)",
                color: "#5C2D91",
                border: "1px solid rgba(92,45,145,0.2)",
                borderRadius: "6px",
                padding: "2px 8px",
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
              }}
            >
              {position.msx_symbol || "—"}
            </span>
            {position.transaction_label && (
              <span
                style={{
                  background: "rgba(92,45,145,0.06)",
                  color: "var(--text-secondary)",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                {position.transaction_label}
              </span>
            )}
          </div>
          <div
            style={{
              color: "var(--text-primary)",
              fontWeight: 700,
              fontSize: "0.95rem",
              marginTop: "0.4rem",
            }}
          >
            {position.name_ar}
          </div>
        </div>

        {/* مؤشر الحالة */}
        <div
          style={{
            textAlign: "left",
            flexShrink: 0,
          }}
        >
          {isPending ? (
            <span className="badge-profit pending">قيد</span>
          ) : (
            <div
              style={{
                color: profitColor,
                fontWeight: 800,
                fontSize: "1.1rem",
                direction: "ltr",
              }}
            >
              {position.live_price?.toFixed(3)} ر.ع
            </div>
          )}
          {!isPending && (
            <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", textAlign: "left" }}>
              سعر الإغلاق
            </div>
          )}
        </div>
      </div>

      {/* خط فاصل */}
      <div style={{ height: 1, background: "var(--card-border)", marginBottom: "1rem" }} />

      {/* أرقام */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: "2px" }}>
            قيمة الاستثمار
          </div>
          <div style={{ color: "var(--text-secondary)", fontWeight: 700, fontSize: "0.9rem" }}>
            {position.investment_value.toLocaleString("ar-OM", { minimumFractionDigits: 3 })} ر.ع
          </div>
        </div>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: "2px" }}>
            عدد الأسهم
          </div>
          <div style={{ color: "var(--text-secondary)", fontWeight: 700, fontSize: "0.9rem" }}>
            {position.shares.toLocaleString("ar-OM")}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: "2px" }}>
            الربح / الخسارة
          </div>
          <div style={{ color: profitColor, fontWeight: 800, fontSize: "0.95rem" }}>
            {isPending
              ? "—"
              : `${position.profit >= 0 ? "+" : ""}${position.profit.toLocaleString("ar-OM", { minimumFractionDigits: 3 })} ر.ع`}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: "2px" }}>
            نسبة العائد
          </div>
          <div style={{ color: profitColor, fontWeight: 800, fontSize: "0.95rem" }}>
            {isPending ? "—" : `${position.roi_percent >= 0 ? "+" : ""}${position.roi_percent.toFixed(2)}٪`}
          </div>
        </div>
      </div>

      {/* سهم التفاصيل */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "4px",
          color: "#5C2D91",
          fontSize: "0.78rem",
          fontWeight: 600,
        }}
      >
        عرض التفاصيل ←
      </div>

      <style jsx>{`
        .position-card:hover {
          border-color: rgba(92, 45, 145, 0.35) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(92, 45, 145, 0.18) !important;
        }
      `}</style>
    </a>
  );
}
