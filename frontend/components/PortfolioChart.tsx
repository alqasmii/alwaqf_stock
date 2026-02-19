'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, RefreshCw, Maximize2 } from 'lucide-react';

// ─── بيانات الأسعار التاريخية (محاكاة) ─────────────────────────────────────
// OQEP: شراء عند 0.390 ← الحالي 0.466 | OQPI: شراء عند 0.100 ← الحالي 0.218
const priceHistory = [
  { month: 'مار 24', oqep: 0.352, oqpi: 0.082 },
  { month: 'أبر 24', oqep: 0.360, oqpi: 0.089 },
  { month: 'ماي 24', oqep: 0.375, oqpi: 0.095 },
  { month: 'يون 24', oqep: 0.370, oqpi: 0.098 },
  { month: 'يول 24', oqep: 0.385, oqpi: 0.102 },
  { month: 'أغس 24', oqep: 0.390, oqpi: 0.108 },  // ← نقطة الشراء
  { month: 'سبت 24', oqep: 0.402, oqpi: 0.115 },
  { month: 'أكت 24', oqep: 0.415, oqpi: 0.130 },
  { month: 'نوف 24', oqep: 0.428, oqpi: 0.148 },
  { month: 'ديس 24', oqep: 0.440, oqpi: 0.165 },
  { month: 'يناير 25', oqep: 0.451, oqpi: 0.185 },
  { month: 'فبر 25', oqep: 0.458, oqpi: 0.201 },
  { month: 'الآن',   oqep: 0.466, oqpi: 0.218 },
];

const OQEP_COLOR  = '#5C2D91';
const OQPI_COLOR  = '#7B4FBB';
const GRID_COLOR  = '#E5DFF0';

// ─── CustomTooltip ────────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  const labels: Record<string, string> = { oqep: 'OQEP', oqpi: 'OQPI' };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5DFF0',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(92,45,145,0.12)',
      minWidth: 148,
      fontFamily: 'Tajawal, sans-serif',
    }}>
      <div style={{ fontSize: '0.72rem', color: '#8B7AAA', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: '0.78rem' }}>
          <div style={{
            width: 12, height: 12,
            borderRadius: '50%',
            border: `3px solid ${entry.color}`,
            background: '#fff',
            flexShrink: 0,
          }} />
          <span style={{ color: '#4E3A6B', flexGrow: 1 }}>{labels[entry.dataKey]}:</span>
          <span style={{ color: '#1A1035', fontWeight: 700, direction: 'ltr' }}>
            {entry.value.toFixed(3)} ر.ع
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Legend dot ──────────────────────────────────────────────────────────────
const LegendItem = ({ label, color, badge }: { label: string; color: string; badge?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{ width: 12, height: 12, borderRadius: '50%', border: `3px solid ${color}`, background: '#fff', flexShrink: 0 }} />
    <span style={{ fontSize: '0.8rem', color: '#4E3A6B' }}>{label}</span>
    {badge && (
      <span style={{
        fontSize: '0.68rem', fontWeight: 700,
        background: 'rgba(92,45,145,0.08)', color: '#5C2D91',
        border: '1px solid rgba(92,45,145,0.2)',
        borderRadius: 5, padding: '1px 6px',
      }}>{badge}</span>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PortfolioChart() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5DFF0',
      borderRadius: '16px',
      boxShadow: '0 1px 6px rgba(92,45,145,0.07)',
      overflow: 'hidden',
      fontFamily: 'Tajawal, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
        padding: '1rem 1.4rem',
        borderBottom: '1px solid #E5DFF0',
        minHeight: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(92,45,145,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={16} color="#5C2D91" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A1035' }}>
              أداء الأسهم
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8B7AAA' }}>
              تتبع الأسعار من مارس 2024 حتى الآن
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleRefresh}
            style={{
              background: 'transparent',
              border: '1px solid #E5DFF0',
              borderRadius: 8, cursor: 'pointer',
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8B7AAA', transition: 'all 0.2s',
            }}
            title="تحديث"
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.6s linear infinite' : 'none' }} />
          </button>
          <button
            style={{
              background: 'transparent',
              border: '1px solid #E5DFF0',
              borderRadius: 8, cursor: 'pointer',
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8B7AAA',
            }}
            title="توسيع"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Summary badges */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0.75rem 1.4rem',
        background: '#F8F6FC',
        borderBottom: '1px solid #E5DFF0',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
          <span style={{ color: '#8B7AAA' }}>OQEP:</span>
          <span style={{ color: '#1A1035', fontWeight: 700 }}>0.466 ر.ع</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>+19.5٪</span>
        </div>
        <div style={{ width: 1, height: 14, background: '#E5DFF0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
          <span style={{ color: '#8B7AAA' }}>OQPI:</span>
          <span style={{ color: '#1A1035', fontWeight: 700 }}>0.218 ر.ع</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>+118.0٪</span>
        </div>
        <div style={{ width: 1, height: 14, background: '#E5DFF0' }} />
        <div style={{ fontSize: '0.72rem', color: '#8B7AAA' }}>
          منذ تاريخ الشراء (أغسطس 2024)
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '1.2rem 0.5rem 0.5rem 0' }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={priceHistory}
            margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="4 8"
              stroke={GRID_COLOR}
              strokeOpacity={1}
              horizontal
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8B7AAA', fontFamily: 'Tajawal, sans-serif' }}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8B7AAA', fontFamily: 'Tajawal, sans-serif' }}
              tickFormatter={(v) => v.toFixed(2)}
              domain={[0.06, 0.52]}
              tickMargin={8}
              width={44}
            />
            {/* خط الشراء OQEP */}
            <ReferenceLine
              x="أغس 24"
              stroke="rgba(92,45,145,0.35)"
              strokeDasharray="4 4"
              label={{ value: 'شراء', position: 'top', fill: '#8B7AAA', fontSize: 10, fontFamily: 'Tajawal, sans-serif' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3', stroke: GRID_COLOR }}
            />
            <Line
              dataKey="oqep"
              type="monotone"
              stroke={OQEP_COLOR}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: OQEP_COLOR, stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              dataKey="oqpi"
              type="monotone"
              stroke={OQPI_COLOR}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: OQPI_COLOR, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + note */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
        padding: '0.75rem 1.4rem 1.2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <LegendItem label="OQEP" color={OQEP_COLOR} badge="سهم 1 + 2" />
          <LegendItem label="OQPI" color={OQPI_COLOR} />
        </div>
        <div style={{ fontSize: '0.7rem', color: '#8B7AAA', direction: 'rtl' }}>
          آخر تحديث: تلقائي كل 5 دقائق
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
