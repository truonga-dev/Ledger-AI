"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/transactions/page.module.css";
import { IconIncome, IconExpense } from "@/components/icons";

export default function FilterTabs({ monthStr, typeFilter }: { monthStr: string, typeFilter: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleTabClick = (value: string) => {
    if (value === typeFilter) return;
    startTransition(() => {
      router.push(`/dashboard/transactions?month=${monthStr}&type=${value}`);
    });
  };

  const tabs = [
    { value: "all", label: "Tất cả", icon: null },
    { value: "THU", label: "Thu", icon: <IconIncome size={14} /> },
    { value: "CHI", label: "Chi", icon: <IconExpense size={14} /> },
  ];

  return (
    <div className={styles.tabs} style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
      {tabs.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => handleTabClick(value)}
          className={`${styles.tab} ${typeFilter === value ? styles.tabActive : ""}`}
          style={{ border: "none", cursor: "pointer", fontFamily: "inherit" }}
        >
          {icon && (
            <span className={`${styles.tabIcon} ${value === "THU" ? styles.tabIconThu : value === "CHI" ? styles.tabIconChi : ""}`}>
              {icon}
            </span>
          )}
          {label}
        </button>
      ))}
    </div>
  );
}
