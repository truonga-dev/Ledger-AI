"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Tx {
  transactionDate: string;
  amount: number;
  type: "THU" | "CHI";
}

function buildWeeklyData(transactions: Tx[]) {
  const weeks: Record<string, { thu: number; chi: number }> = {
    "T1": { thu: 0, chi: 0 }, "T2": { thu: 0, chi: 0 },
    "T3": { thu: 0, chi: 0 }, "T4": { thu: 0, chi: 0 },
  };
  for (const t of transactions) {
    const day = new Date(t.transactionDate).getDate();
    const k = day <= 7 ? "T1" : day <= 14 ? "T2" : day <= 21 ? "T3" : "T4";
    if (t.type === "THU") weeks[k].thu += t.amount / 1_000_000;
    else weeks[k].chi += t.amount / 1_000_000;
  }
  return Object.entries(weeks).map(([name, v]) => ({
    name,
    Thu: parseFloat(v.thu.toFixed(2)),
    Chi: parseFloat(v.chi.toFixed(2)),
  }));
}

function buildDailyData(transactions: Tx[]) {
  const byDay: Record<string, { thu: number; chi: number }> = {};
  for (const t of transactions) {
    const d = new Date(t.transactionDate);
    const key = `${d.getDate()}/${d.getMonth() + 1}`;
    if (!byDay[key]) byDay[key] = { thu: 0, chi: 0 };
    if (t.type === "THU") byDay[key].thu += t.amount / 1_000_000;
    else byDay[key].chi += t.amount / 1_000_000;
  }
  return Object.entries(byDay).slice(-14).map(([name, v]) => ({
    name,
    Thu: parseFloat(v.thu.toFixed(2)),
    Chi: parseFloat(v.chi.toFixed(2)),
  }));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e1b4b",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: "10px 14px",
      fontSize: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
    }}>
      <p style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value.toFixed(1)}tr
        </p>
      ))}
    </div>
  );
}

export default function MonthlyChart({ transactions }: { transactions: Tx[] }) {
  const [tab, setTab] = useState<"week" | "day">("week");
  const data = tab === "week" ? buildWeeklyData(transactions) : buildDailyData(transactions);

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "12px 16px 0" }}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>Xu hướng thu chi</p>
        <div style={{ display: "flex", gap: 4 }}>
          {(["week", "day"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "4px 10px",
                fontSize: "0.72rem",
                fontWeight: 700,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                background: tab === t ? "var(--primary)" : "var(--surface-2)",
                color: tab === t ? "white" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              {t === "week" ? "Theo tuần" : "Theo ngày"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 8px 8px 0" }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} barGap={4}>
            <defs>
              <linearGradient id="gradThu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradChi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="tr" width={55} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Thu" stroke="#10b981" strokeWidth={2.5} fill="url(#gradThu)" dot={false} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="Chi" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gradChi)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "4px 0 4px" }}>
          {[["#10b981", "Thu nhập"], ["#f43f5e", "Chi tiêu"]].map(([color, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 3, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
