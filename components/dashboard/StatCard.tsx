import styles from "./StatCard.module.css";

import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  amount: number;
  type: "thu" | "chi" | "neutral";
  icon: ReactNode;
  change?: number; // % change vs last month (positive = up, negative = down)
  fullWidth?: boolean;
  large?: boolean;
}

function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1).replace(".0","") + " tỷ";
  if (amount >= 1_000_000)     return (amount / 1_000_000).toFixed(1).replace(".0","") + " triệu";
  if (amount >= 1_000)         return (amount / 1_000).toFixed(0) + "k";
  return amount.toLocaleString("vi-VN") + "đ";
}

function formatVNDFull(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function StatCard({ label, amount, type, icon, change, fullWidth, large }: StatCardProps) {
  const isPositiveChange = change !== undefined && change >= 0;
  
  if (large) {
    // Hero balance card
    return (
      <div className={`${styles.card} ${styles.largeCard} ${styles[type]}`}>
        <div className={styles.largeTop}>
          <p className={styles.largeLabel}>{label}</p>
          {change !== undefined && (
            <span className={`${styles.badge} ${isPositiveChange ? styles.badgeUp : styles.badgeDown}`}>
              {isPositiveChange ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
        <p className={styles.largeAmount}>{formatVND(amount)}</p>
        <p className={styles.largeFull}>{formatVNDFull(amount)}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${fullWidth ? styles.fullWidth : ""} ${styles[type]}`}>
      <div className={styles.top}>
        <p className={styles.label}>{label}</p>
        <div className={styles.iconWrap}>{icon}</div>
      </div>
      <p className={styles.amount}>{formatVND(amount)}</p>
      <div className={styles.bottom}>
        <p className={styles.full}>{formatVNDFull(amount)}</p>
        {change !== undefined && (
          <span className={`${styles.badge} ${isPositiveChange ? styles.badgeUp : styles.badgeDown}`}>
            {isPositiveChange ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
