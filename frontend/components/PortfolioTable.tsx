"use client";

import { Position } from "@/lib/api";

interface Props {
  positions: Position[];
}

export default function PortfolioTable({ positions }: Props) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>نوع الأصل</th>
            <th>عدد الأسهم</th>
            <th>سعر الشراء</th>
            <th>قيمة الاستثمار (ر.ع)</th>
            <th>سعر الإغلاق</th>
            <th>القيمة السوقية الحالية</th>
            <th>الربح / الخسارة</th>
            <th>نسبة العائد</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos, idx) => {
            const isPending = pos.is_pending;
            const isProfit = pos.profit > 0;
            const color = isPending ? "#f59e0b" : isProfit ? "#10b981" : pos.profit < 0 ? "#e53935" : "#8B7AAA";

            return (
              <tr
                key={pos.id}
                style={{ cursor: "pointer" }}
                onClick={() => (window.location.href = `/stock/${pos.id}`)}
              >
                <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{idx + 1}</td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {pos.name_ar}
                    </span>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {pos.msx_symbol && (
                        <span
                          style={{
                            background: "rgba(92,45,145,0.08)",
                            color: "#5C2D91",
                            border: "1px solid rgba(92,45,145,0.2)",
                            borderRadius: "5px",
                            padding: "1px 7px",
                            fontSize: "0.72rem",
                            fontWeight: 800,
                          }}
                        >
                          {pos.msx_symbol}
                        </span>
                      )}
                      {pos.transaction_label && (
                        <span
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.72rem",
                            fontStyle: "italic",
                          }}
                        >
                          {pos.transaction_label}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ direction: "ltr", textAlign: "right" }}>
                  {pos.shares.toLocaleString("en-US")}
                </td>
                <td style={{ direction: "ltr", textAlign: "right" }}>
                  {pos.purchase_price.toFixed(3)}
                </td>
                <td style={{ direction: "ltr", textAlign: "right" }}>
                  {pos.investment_value.toLocaleString("en-US", { minimumFractionDigits: 3 })}
                </td>
                <td style={{ direction: "ltr", textAlign: "right", color: isPending ? "#f59e0b" : "var(--text-primary)", fontWeight: 700 }}>
                  {isPending ? (
                    <span className="badge-profit pending">قيد</span>
                  ) : (
                    pos.live_price?.toFixed(3) ?? (
                      <span style={{ color: "var(--text-muted)" }}>جاري...</span>
                    )
                  )}
                </td>
                <td style={{ direction: "ltr", textAlign: "right" }}>
                  {isPending ? (
                    <span style={{ color: "var(--text-muted)" }}>—</span>
                  ) : (
                    pos.market_value.toLocaleString("en-US", { minimumFractionDigits: 3 })
                  )}
                </td>
                <td style={{ color, fontWeight: 800, direction: "ltr", textAlign: "right" }}>
                  {isPending ? (
                    "—"
                  ) : (
                    `${pos.profit >= 0 ? "+" : ""}${pos.profit.toLocaleString("en-US", { minimumFractionDigits: 3 })}`
                  )}
                </td>
                <td style={{ color, fontWeight: 800 }}>
                  {isPending ? "—" : `${pos.roi_percent >= 0 ? "+" : ""}${pos.roi_percent.toFixed(2)}٪`}
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* صف الإجمالي */}
        <tfoot>
          <tr>
            <td colSpan={4} style={{ fontWeight: 800, color: "var(--purple)", paddingTop: "1rem", borderTop: "2px solid var(--card-border)" }}>
              المجموع
            </td>
            <td style={{ fontWeight: 800, color: "var(--text-primary)", direction: "ltr", textAlign: "right", borderTop: "2px solid var(--card-border)" }}>
              {positions
                .reduce((s, p) => s + p.investment_value, 0)
                .toLocaleString("en-US", { minimumFractionDigits: 3 })}
            </td>
            <td colSpan={2} style={{ borderTop: "2px solid var(--card-border)" }} />
            <td style={{ fontWeight: 800, color: "#10b981", direction: "ltr", textAlign: "right", borderTop: "2px solid var(--card-border)" }}>
              +{positions
                .reduce((s, p) => s + p.profit, 0)
                .toLocaleString("en-US", { minimumFractionDigits: 3 })}
            </td>
            <td style={{ borderTop: "2px solid var(--card-border)" }} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
