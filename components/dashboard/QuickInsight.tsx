"use client";

import styles from "./QuickInsight.module.css";
import { IconCalendar, IconPieChart, IconFlame } from "@/components/icons";

interface Props {
  todayCount: number;
  todayAmount: number;
  topCategory: string;
  topCategoryAmount: number;
  streakDays: number;
}

function fmtShort(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(".0", "") + " tỷ";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + " tr";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toLocaleString("vi-VN") + "đ";
}

export default function QuickInsight({
  todayCount,
  todayAmount,
  topCategory,
  topCategoryAmount,
  streakDays,
}: Props) {
  return (
    <div className={styles.grid}>
      {/* Hôm nay */}
      <div className={styles.card}>
        <div className={styles.icon} style={{ background: "var(--indigo-50, #eef2ff)", color: "var(--indigo-600, #4f46e5)" }}>
          <IconCalendar size={18} />
        </div>
        <p className={styles.label}>Hôm nay</p>
        <p className={styles.value}>{todayCount} GD</p>
        <p className={styles.sub}>{fmtShort(todayAmount)}</p>
      </div>

      {/* Top danh mục */}
      <div className={styles.card}>
        <div className={styles.icon} style={{ background: "var(--amber-50, #fffbeb)", color: "var(--amber-600, #d97706)" }}>
          <IconPieChart size={18} />
        </div>
        <p className={styles.label}>Nhiều nhất</p>
        <p className={styles.value} style={{ fontSize: "0.78rem" }}>{topCategory || "—"}</p>
        <p className={styles.sub}>{topCategoryAmount > 0 ? fmtShort(topCategoryAmount) : "—"}</p>
      </div>

      {/* Streak */}
      <div className={styles.card}>
        <div className={styles.icon} style={{ background: "var(--rose-50, #fff1f2)", color: "var(--rose-600, #e11d48)" }}>
          <IconFlame size={18} />
        </div>
        <p className={styles.label}>Chuỗi ngày</p>
        <p className={styles.value}>{streakDays}</p>
        <p className={styles.sub}>ngày liên tiếp</p>
      </div>
    </div>
  );
}
