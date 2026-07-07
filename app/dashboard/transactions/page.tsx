import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import Link from "next/link";
import { IconTrendUp, IconTrendDown, IconCamera, IconReceipt, IconIncome, IconExpense } from "@/components/icons";

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
  searchParams: Promise<{ month?: string; type?: string }>;
}) {
  const user = await getUserSession();
  if (!user) return null;

  const params = await searchParams;
  const now = new Date();
  const monthStr = params.month ?? `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const [year, month] = monthStr.split("-").map(Number);

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
  });

  const totalThu = transactions.filter(t => t.type === "THU").reduce((s,t) => s + Number(t.amount), 0);
  const totalChi = transactions.filter(t => t.type === "CHI").reduce((s,t) => s + Number(t.amount), 0);
  const net = totalThu - totalChi;

  const monthOptions = getMonthOptions();
  const typeFilter = params.type ?? "all";

  return (
    <div className={styles.page}>
      {/* ── Sticky Header ── */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Giao dịch</h1>
          <select
            className={styles.monthPicker}
            defaultValue={monthStr}
            // server-side — navigation via link below
            disabled
          >
            {monthOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
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
        <div className={styles.tabs}>
          {[
            { value: "all", label: "Tất cả", icon: null },
            { value: "THU", label: "Thu", icon: <IconIncome size={14} /> },
            { value: "CHI", label: "Chi", icon: <IconExpense size={14} /> },
          ].map(({ value, label, icon }) => (
            <Link
              key={value}
              href={`/dashboard/transactions?month=${monthStr}&type=${value}`}
              className={`${styles.tab} ${typeFilter === value ? styles.tabActive : ""}`}
            >
              {icon && (
                <span className={`${styles.tabIcon} ${value === "THU" ? styles.tabIconThu : value === "CHI" ? styles.tabIconChi : ""}`}>
                  {icon}
                </span>
              )}
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      <div className={styles.content}>
        {transactions.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <IconReceipt size={40} color="var(--text-muted)" />
            </div>
            <p className={styles.emptyText}>Không có giao dịch nào</p>
            <p className={styles.emptyHint}>Chụp hóa đơn để bắt đầu ghi chép</p>
            <div className={styles.emptyActions}>
              <Link href="/dashboard/upload" className="btn btn-primary">
                <IconCamera size={18} color="white" /> Chụp hóa đơn
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.list}>
            {transactions.map((t) => (
              <div key={t.id} className={styles.item}>
                <div className={`${styles.itemIcon} ${t.type === "THU" ? styles.itemIconThu : styles.itemIconChi}`}>
                  {t.type === "THU"
                    ? <IconTrendUp size={18} />
                    : <IconTrendDown size={18} />}
                </div>
                <div className={styles.itemLeft}>
                  <span className={styles.itemDesc}>{t.description}</span>
                  <div className={styles.itemMeta}>
                    <span>{t.category?.name ?? "Khác"}</span>
                    <span>·</span>
                    <span>{fmtDate(new Date(t.transactionDate))}</span>
                    {!t.isManual && <span className={styles.aiBadge}>✦ AI</span>}
                  </div>
                </div>
                <span className={`${styles.itemAmount} ${t.type === "THU" ? styles.amtThu : styles.amtChi}`}>
                  {t.type === "THU" ? "+" : "−"}{fmtVND(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



