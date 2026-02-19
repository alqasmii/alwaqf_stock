"use client";

import { useState } from "react";
import { forceRefresh } from "@/lib/api";

interface Props {
  onRefresh?: () => void;
}

export default function RefreshButton({ onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await forceRefresh();
      setLastUpdate(new Date().toLocaleTimeString("ar-OM"));
      onRefresh?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
      <button
        className="btn btn-gold"
        onClick={handleRefresh}
        disabled={loading}
        style={{
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        <span
          style={{
            display: "inline-block",
            animation: loading ? "spin 0.8s linear infinite" : "none",
          }}
        >
          ↻
        </span>
        {loading ? "جاري التحديث..." : "تحديث الأسعار"}
      </button>
      {lastUpdate && (
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          آخر تحديث: {lastUpdate}
        </span>
      )}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
