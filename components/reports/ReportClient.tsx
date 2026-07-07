"use client";

import { useState, useMemo } from "react";
import { IconDownload, IconBarChart, IconTrendUp, IconTrendDown, IconWallet } from "@/components/icons";
import styles from "./ReportClient.module.css";

interface Tx {
  id: string;
  type: "THU" | "CHI";
  amount: number;
  description: string;
  category: string;
  transactionDate: string;
}

interface Props {
  transactions: Tx[];
  shopName: string;
}

function fmtVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function fmtShort(n: number) {
  if (n >= 1_000_000_000) return (n/1_000_000_000).toFixed(1).replace(".0","") + " tỷ";
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(".0","") + " tr";
  if (n >= 1_000) return (n/1_000).toFixed(0) + "k";
  return n.toLocaleString("vi-VN") + "đ";
}

function getMonthLabel(d: Date) {
  return `Tháng ${d.getMonth()+1}/${d.getFullYear()}`;
}

export default function ReportClient({ transactions, shopName }: Props) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`
  );
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "detail">("summary");

  const filtered = useMemo(() => {
    const [y, m] = selectedMonth.split("-").map(Number);
    return transactions.filter(t => {
      const d = new Date(t.transactionDate);
      return d.getFullYear() === y && d.getMonth()+1 === m;
    });
  }, [transactions, selectedMonth]);

  const totalThu = filtered.filter(t => t.type === "THU").reduce((s,t) => s + t.amount, 0);
  const totalChi = filtered.filter(t => t.type === "CHI").reduce((s,t) => s + t.amount, 0);
  const loiLo = totalThu - totalChi;

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(t => t.type === "CHI").forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return Object.entries(map).sort((a,b) => b[1] - a[1]);
  }, [filtered]);

  const monthOptions: { value: string; label: string }[] = [];
  for (let y = 2028; y >= 2026; y--) {
    for (let m = 12; m >= 1; m--) {
      const d = new Date(y, m - 1, 1);
      monthOptions.push({
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: getMonthLabel(d),
      });
    }
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      const [y, m] = selectedMonth.split("-").map(Number);
      const monthLabel = getMonthLabel(new Date(y, m-1));
      const { exportReportPDF } = await import("@/lib/pdf");
      await exportReportPDF({ shopName, monthLabel, totalThu, totalChi, loiLo, byCategory, transactions: filtered });
    } catch (err) {
      console.error(err);
      alert("Xuất PDF thất bại. Vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  }

  const [selY, selM] = selectedMonth.split("-").map(Number);
  const monthLabel = getMonthLabel(new Date(selY, selM-1));

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Báo cáo</h1>
            <p className={styles.subtitle}>{shopName}</p>
          </div>
          <select
            className={styles.monthSelect}
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {monthOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.content}>
        {/* ── Summary Card ── */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryPeriod}>{monthLabel}</div>
          <div className={styles.summaryGrid}>
            <div className={styles.sumItem}>
              <div className={`${styles.sumIcon} ${styles.sumIconThu}`}>
                <IconTrendUp size={16} />
              </div>
              <span className={styles.sumLabel}>Tổng Thu</span>
              <span className={`${styles.sumValue} ${styles.thu}`}>{fmtShort(totalThu)}</span>
            </div>
            <div className={styles.sumItem}>
              <div className={`${styles.sumIcon} ${styles.sumIconChi}`}>
                <IconTrendDown size={16} />
              </div>
              <span className={styles.sumLabel}>Tổng Chi</span>
              <span className={`${styles.sumValue} ${styles.chi}`}>{fmtShort(totalChi)}</span>
            </div>
            <div className={`${styles.sumItem} ${styles.sumItemFull}`}>
              <div className={`${styles.sumIcon} ${loiLo >= 0 ? styles.sumIconThu : styles.sumIconChi}`}>
                <IconWallet size={16} />
              </div>
              <span className={styles.sumLabel}>{loiLo >= 0 ? "Lợi nhuận" : "Thua lỗ"}</span>
              <span className={`${styles.sumValue} ${loiLo >= 0 ? styles.thu : styles.chi}`}>
                {loiLo >= 0 ? "+" : "−"}{fmtShort(Math.abs(loiLo))}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === "summary" ? styles.tabActive : ""}`} onClick={() => setActiveTab("summary")}>
            <IconBarChart size={15} /> Danh mục
          </button>
          <button className={`${styles.tab} ${activeTab === "detail" ? styles.tabActive : ""}`} onClick={() => setActiveTab("detail")}>
            <IconReceipt size={15} /> Chi tiết ({filtered.length})
          </button>
        </div>

        {/* ── Content ── */}
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <IconBarChart size={36} color="var(--text-muted)" />
            <p>Không có dữ liệu tháng này</p>
          </div>
        ) : activeTab === "summary" ? (
          <div className={styles.categorySection}>
            {byCategory.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize:"0.875rem", textAlign:"center", padding:"20px 0" }}>
                Không có chi tiêu nào tháng này
              </p>
            ) : (
              byCategory.map(([cat, amount]) => {
                const pct = totalChi > 0 ? (amount / totalChi) * 100 : 0;
                return (
                  <div key={cat} className={styles.catItem}>
                    <div className={styles.catTop}>
                      <span className={styles.catName}>{cat}</span>
                      <span className={styles.catAmount}>{fmtVND(amount)}</span>
                    </div>
                    <div className={styles.catBar}>
                      <div className={styles.catBarFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.catPct}>{pct.toFixed(0)}% tổng chi</span>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className={styles.txList}>
            {filtered.map(t => (
              <div key={t.id} className={styles.txItem}>
                <div className={styles.txLeft}>
                  <span className={styles.txDesc}>{t.description}</span>
                  <span className={styles.txMeta}>
                    {new Date(t.transactionDate).toLocaleDateString("vi-VN")} · {t.category}
                  </span>
                </div>
                <span className={t.type === "THU" ? "amount-thu" : "amount-chi"}>
                  {t.type === "THU" ? "+" : "−"}{fmtVND(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Export Button ── */}
        <button
          className={`btn btn-primary ${styles.exportBtn}`}
          onClick={handleExportPDF}
          disabled={exporting || filtered.length === 0}
        >
          {exporting ? <span className="spinner" /> : <IconDownload size={18} color="white" />}
          {exporting ? "Đang tạo PDF..." : "Xuất báo cáo PDF"}
        </button>
      </div>
    </div>
  );
}

// Inline IconReceipt to avoid extra import issues
function IconReceipt({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l4-2 4 2 4-2 4 2V2l-4 2-4-2-4 2L4 2z" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="14" y2="14" />
    </svg>
  );
}
