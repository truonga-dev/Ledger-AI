import { IconFood, IconCar, IconShoppingBag, IconZap, IconHeart, IconGift, IconMore, IconWallet, IconReceipt } from "@/components/icons";
import styles from "./RecentTransactions.module.css";

interface Transaction {
  id: string;
  type: "THU" | "CHI";
  amount: number;
  description: string;
  category: string;
  transactionDate: string;
}

function fmtVND(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "tr";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toLocaleString("vi-VN") + "đ";
}

function getDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    const label = getDateLabel(t.transactionDate);
    if (!groups[label]) groups[label] = [];
    groups[label].push(t);
  }
  return groups;
}

function getCategoryTheme(category: string): [string, string] {
  const colorMap: Record<string, [string, string]> = {
    "Tiền hàng":    ["var(--indigo-50, #eef2ff)", "var(--indigo-600, #4f46e5)"],
    "Điện nước":    ["var(--sky-50, #e0f2fe)", "var(--sky-600, #0284c7)"],
    "Lương":        ["var(--emerald-50, #d1fae5)", "var(--emerald-600, #059669)"],
    "Lương nhân viên": ["var(--emerald-50, #d1fae5)", "var(--emerald-600, #059669)"],
    "Ăn uống":      ["var(--amber-50, #fef3c7)", "var(--amber-600, #d97706)"],
    "Vận chuyển":   ["var(--violet-50, #ede9fe)", "var(--violet-600, #7c3aed)"],
    "Mua sắm":      ["var(--pink-50, #fdf2f8)", "var(--pink-600, #db2777)"],
    "Chi khác":     ["var(--slate-50, #f8fafc)", "var(--slate-600, #475569)"],
    "Thu khác":     ["var(--emerald-50, #ecfdf5)", "var(--emerald-500, #10b981)"],
  };
  return colorMap[category] ?? ["var(--slate-100, #f1f5f9)", "var(--slate-500, #64748b)"];
}

function getCategoryIcon(category: string, type: "THU" | "CHI") {
  const cat = category.toLowerCase();
  if (cat.includes("ăn") || cat.includes("uống") || cat.includes("food")) return <IconFood size={18} />;
  if (cat.includes("xe") || cat.includes("vận chuyển") || cat.includes("di chuyển")) return <IconCar size={18} />;
  if (cat.includes("mua sắm") || cat.includes("shopping")) return <IconShoppingBag size={18} />;
  if (cat.includes("điện") || cat.includes("nước") || cat.includes("hóa đơn")) return <IconZap size={18} />;
  if (cat.includes("sức khỏe") || cat.includes("y tế")) return <IconHeart size={18} />;
  if (cat.includes("quà") || cat.includes("gift")) return <IconGift size={18} />;
  if (type === "THU") return <IconWallet size={18} />;
  return <IconMore size={18} />;
}

export default function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIconWrap}><IconReceipt size={32} /></div>
        <p className={styles.emptyTitle}>Chưa có giao dịch</p>
        <p className={styles.emptyHint}>Bấm &ldquo;Chụp hóa đơn&rdquo; để bắt đầu theo dõi</p>
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <div className={styles.list}>
      {Object.entries(groups).map(([dateLabel, txs]) => (
        <div key={dateLabel} className={styles.group}>
          <p className={styles.dateLabel}>{dateLabel}</p>
          {txs.map((t) => {
            const [bg, fg] = getCategoryTheme(t.category);
            return (
              <div key={t.id} className={styles.item}>
                <div className={styles.categoryIcon} style={{ background: bg, color: fg }}>
                  {getCategoryIcon(t.category, t.type)}
                </div>
                <div className={styles.left}>
                  <span className={styles.desc}>{t.description}</span>
                  <span className={styles.meta}>{t.category}</span>
                </div>
                <span className={`${styles.amount} ${t.type === "THU" ? styles.thu : styles.chi}`}>
                  {t.type === "THU" ? "+" : "−"}{fmtVND(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
