'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StockChartProps {
  purchasePrice: number;
  currentPrice: number;
  stockSymbol?: string;
  nameAr: string;
  nameEn?: string;
  isPending?: boolean;
}

type Period = '1d' | '1w' | '1m' | '3m' | '1y';

interface DataPoint {
  label: string;
  price: number;
}

// ─── Data Generator ────────────────────────────────────────────────────────────
// Produces smooth data trending from a start near purchasePrice to currentPrice
function generateData(period: Period, purchasePrice: number, currentPrice: number): DataPoint[] {
  const counts: Record<Period, number> = { '1d': 24, '1w': 7, '1m': 30, '3m': 90, '1y': 365 };
  const n = counts[period];

  // For short periods (1d, 1w) the price is already close to current; for longer ones we show the full journey
  const startPrice =
    period === '1d' ? currentPrice * 0.997 :
    period === '1w' ? currentPrice * 0.985 :
    period === '1m' ? (purchasePrice * 0.75 + currentPrice * 0.25) :
    period === '3m' ? purchasePrice :
    purchasePrice * 0.92; // 1y: slightly before purchase

  const seed = purchasePrice * 1000; // deterministic pseudo-random

  return Array.from({ length: n }, (_, i) => {
    const progress = i / (n - 1);
    const trend = startPrice + (currentPrice - startPrice) * progress;
    // pseudo-random noise using sin — deterministic so chart doesn't flicker on re-render
    const noise = Math.sin(i * seed * 0.001 + i * 0.7) * (currentPrice * 0.008)
                + Math.sin(i * 0.3 + seed * 0.0001) * (currentPrice * 0.005);
    const price = Math.max(trend + noise, startPrice * 0.85);

    // X-axis label
    let label = '';
    if (period === '1d') label = i % 4 === 0 ? `${i}:00` : '';
    else if (period === '1w') {
      const days = ['أحد', 'اثن', 'ثلث', 'أرب', 'خمس', 'جمع', 'سبت'];
      label = days[i % 7];
    } else if (period === '1m') label = i % 7 === 0 ? `${i + 1}` : '';
    else if (period === '3m') label = i % 15 === 0 ? `${Math.floor(i / 30) + 1}م` : '';
    else label = i % 60 === 0 ? `ش${Math.floor(i / 30) + 1}` : '';

    return { label, price: parseFloat(price.toFixed(4)) };
  });
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5DFF0',
      borderRadius: 8,
      padding: '7px 12px',
      boxShadow: '0 4px 16px rgba(92,45,145,0.12)',
      fontFamily: 'Tajawal, sans-serif',
      fontSize: '0.8rem',
      color: '#1A1035',
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      {payload[0].value.toFixed(3)} <span style={{ fontWeight: 400, color: '#8B7AAA' }}>ر.ع</span>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const PERIODS: { label: string; value: Period }[] = [
  { label: 'يوم', value: '1d' },
  { label: 'أسبوع', value: '1w' },
  { label: 'شهر', value: '1m' },
  { label: '3 أشهر', value: '3m' },
  { label: 'سنة', value: '1y' },
];

export default function StockChart({ purchasePrice, currentPrice, stockSymbol, nameAr, nameEn, isPending }: StockChartProps) {
  const [period, setPeriod] = useState<Period>('3m');

  const data = useMemo(
    () => generateData(period, purchasePrice, isPending ? purchasePrice : currentPrice),
    [period, purchasePrice, currentPrice, isPending]
  );

  const priceDiff = currentPrice - purchasePrice;
  const pctChange = purchasePrice > 0 ? (priceDiff / purchasePrice) * 100 : 0;
  const isUp = pctChange >= 0;
  const lineColor = isPending ? '#8B7AAA' : isUp ? '#5C2D91' : '#e53935';
  const highest = Math.max(...data.map(d => d.price));
  const lowest = Math.min(...data.map(d => d.price));

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5DFF0',
      borderRadius: 16,
      boxShadow: '0 1px 6px rgba(92,45,145,0.07)',
      overflow: 'hidden',
      fontFamily: 'Tajawal, sans-serif',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.4rem', borderBottom: '1px solid #E5DFF0', gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(92,45,145,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isUp && !isPending
              ? <TrendingUp size={16} color="#5C2D91" />
              : <TrendingDown size={16} color={isPending ? '#8B7AAA' : '#e53935'} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1A1035' }}>
              مخطط السعر
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8B7AAA' }}>{nameEn ?? nameAr}</div>
          </div>
        </div>

        {/* رمز السهم */}
        {stockSymbol && (
          <span style={{
            background: 'rgba(92,45,145,0.08)', color: '#5C2D91',
            border: '1px solid rgba(92,45,145,0.2)',
            borderRadius: 7, padding: '3px 10px',
            fontSize: '0.78rem', fontWeight: 800,
          }}>
            {stockSymbol}
          </span>
        )}
      </div>

      {/* ── Price summary ── */}
      <div style={{ padding: '1rem 1.4rem 0.5rem', borderBottom: '1px solid #F8F6FC' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1A1035', direction: 'ltr', letterSpacing: '-0.5px' }}>
            {isPending ? '—' : currentPrice.toFixed(3)}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#8B7AAA' }}>ر.ع</span>
          {!isPending && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: isUp ? 'rgba(16,185,129,0.1)' : 'rgba(229,57,53,0.08)',
              color: isUp ? '#10b981' : '#e53935',
              borderRadius: 6, padding: '2px 8px',
              fontSize: '0.78rem', fontWeight: 700,
            }}>
              {isUp ? '▲' : '▼'} {Math.abs(pctChange).toFixed(2)}٪
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#8B7AAA' }}>
          {isPending ? 'في انتظار إدراج السهم' : `سعر الشراء: ${purchasePrice.toFixed(3)} ر.ع`}
        </div>
      </div>

      {/* ── Period selector ── */}
      <div style={{ padding: '0.75rem 1.4rem 0' }}>
        <div style={{
          display: 'flex', background: '#F8F6FC',
          border: '1px solid #E5DFF0', borderRadius: 10,
          overflow: 'hidden', width: '100%',
        }}>
          {PERIODS.map((p, i) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={{
                flex: 1,
                height: 34,
                border: 'none',
                background: period === p.value ? '#5C2D91' : 'transparent',
                color: period === p.value ? '#fff' : '#8B7AAA',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif',
                borderRadius: period === p.value ? 8 : 0,
                transition: 'all 0.18s',
                borderRight: i < PERIODS.length - 1 ? '1px solid #E5DFF0' : 'none',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ padding: '0.75rem 0.5rem 0.25rem 0' }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
            <CartesianGrid
              strokeDasharray="4 8"
              stroke="#E5DFF0"
              horizontal
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8B7AAA', fontFamily: 'Tajawal, sans-serif' }}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#8B7AAA', fontFamily: 'Tajawal, sans-serif' }}
              tickFormatter={(v) => v.toFixed(2)}
              domain={['auto', 'auto']}
              tickMargin={6}
              width={42}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3', stroke: '#E5DFF0' }}
            />
            <Line
              dataKey="price"
              type="monotone"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Highest / Lowest ── */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid #E5DFF0',
        margin: '0 0',
      }}>
        {[
          { label: 'الأعلى', value: highest, color: '#10b981' },
          { label: 'الأدنى', value: lowest, color: '#e53935' },
        ].map((item, i) => (
          <div key={item.label} style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '0.7rem',
            borderLeft: i === 0 ? '1px solid #E5DFF0' : 'none',
            fontSize: '0.8rem',
          }}>
            <span style={{ color: '#8B7AAA', fontWeight: 400 }}>{item.label}:</span>
            <span style={{ color: item.color, fontWeight: 700, direction: 'ltr' }}>
              {item.value.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
