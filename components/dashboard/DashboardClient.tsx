"use client";

import { useState } from "react";
import MonthGoal from "./MonthGoal";

interface Props {
  initialBudget: number;
  spent: number;
}

export default function DashboardClient({ initialBudget, spent }: Props) {
  const [budget, setBudget] = useState(initialBudget);

  async function handleSetBudget(amount: number) {
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyBudget: amount }),
      });
      if (!res.ok) throw new Error("Lưu thất bại");
      setBudget(amount);
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (budget === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1.5px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <span style={{ fontSize: "1.5rem" }}>🎯</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>Đặt ngân sách tháng</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>Theo dõi chi tiêu dễ hơn với mục tiêu cụ thể</p>
        </div>
        <button
          onClick={() => setBudget(-1)}
          style={{
            background: "var(--primary)", color: "white", border: "none",
            borderRadius: 10, padding: "8px 14px", fontSize: "0.8rem",
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Đặt
        </button>
      </div>
    );
  }

  return (
    <MonthGoal
      spent={spent}
      budget={budget === -1 ? 0 : budget}
      onSetBudget={handleSetBudget}
    />
  );
}
