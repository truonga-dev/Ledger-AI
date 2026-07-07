import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import Link from "next/link";
import { IconTrendUp, IconTrendDown, IconCamera, IconReceipt, IconIncome, IconExpense } from "@/components/icons";
import TransactionListClient from "@/components/dashboard/TransactionListClient";
import ExportExcelButton from "@/components/dashboard/ExportExcelButton";
import FilterTabs from "@/components/dashboard/FilterTabs";

function fmtVND(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(".0", "") + " tỷ";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + " triệu";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toLocaleString("vi-VN") + "đ";
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

// Build 6 month options
function getMonthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    opts.push({ value: val, label: `Tháng ${d.getMonth()+1}/${d.getFullYear()}` });
  }
  return opts;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; type?: string; limit?: string }>;
}) {
  const user = await getUserSession();
  if (!user) return null;

  const params = await searchParams;
  const now = new Date();
  const monthStr = params.month ?? `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const [year, month] = monthStr.split("-").map(Number);

  const limit = parseInt(params.limit || "50", 10);

  const transactions = await prisma.transaction.findMany({
    where: {
      user: { email: user.email! },
      transactionDate: {
        gte: new Date(year, month-1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      },
      ...(params.type && params.type !== "all" ? { type: params.type as "THU" | "CHI" } : {}),
    },
    include: { category: true },
    orderBy: { transactionDate: "desc" },
    take: limit,
  });

  const totalCount = await prisma.transaction.count({
    where: {
      user: { email: user.email! },
      transactionDate: {
        gte: new Date(year, month-1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      },
      ...(params.type && params.type !== "all" ? { type: params.type as "THU" | "CHI" } : {}),
    }
  });

  const hasMore = transactions.length < totalCount;

  // Lấy tổng thu chi
  const totalStats = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      user: { email: user.email! },
      transactionDate: {
        gte: new Date(year, month-1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      },
      ...(params.type && params.type !== "all" ? { type: params.type as "THU" | "CHI" } : {}),
    },
    _sum: { amount: true }
  });

  const totalThu = Number(totalStats.find(s => s.type === "THU")?._sum.amount ?? 0);
  const totalChi = Number(totalStats.find(s => s.type === "CHI")?._sum.amount ?? 0);
  const net = totalThu - totalChi;

  const monthOptions = getMonthOptions();
  const typeFilter = params.type ?? "all";

  return (
    <div className={styles.page}>
      {/* ── Sticky Header ── */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Giao dịch</h1>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <ExportExcelButton monthStr={monthStr} />
            <select
              className={styles.monthPicker}
              defaultValue={monthStr}
              disabled
            >
              {monthOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Month nav links */}
        <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
          {monthOptions.slice(0,3).map(o => (
            <Link
              key={o.value}
              href={`/dashboard/transactions?month=${o.value}&type=${typeFilter}`}
              style={{
                fontSize:"0.75rem", fontWeight:600,
                padding:"5px 10px", borderRadius:8,
                background: monthStr === o.value ? "var(--primary)" : "var(--surface)",
                color: monthStr === o.value ? "white" : "var(--text-secondary)",
                border: `1.5px solid ${monthStr === o.value ? "var(--primary)" : "var(--border)"}`,
              }}
            >
              {o.label}
            </Link>
          ))}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Thu</span>
            <span className={styles.summaryThu}>+{fmtVND(totalThu)}</span>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Chi</span>
            <span className={styles.summaryChi}>-{fmtVND(totalChi)}</span>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Lời/Lỗ</span>
            <span className={`${styles.summaryNet} ${net >= 0 ? styles.summaryNetPos : styles.summaryNetNeg}`}>
              {net >= 0 ? "+" : "-"}{fmtVND(Math.abs(net))}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <FilterTabs monthStr={monthStr} typeFilter={typeFilter} />
      </div>

      {/* ── List ── */}
      <div className={styles.content}>
        <TransactionListClient 
          transactions={transactions.map(t => ({
            ...t,
            amount: Number(t.amount)
          }))} 
          hasMore={hasMore} 
          currentLimit={limit} 
        />
      </div>
    </div>
  );
}



