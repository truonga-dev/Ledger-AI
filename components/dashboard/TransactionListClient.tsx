"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./TransactionListClient.module.css";
import { IconTrendUp, IconTrendDown, IconCamera, IconReceipt } from "@/components/icons";
import Link from "next/link";
import TransactionModal from "./TransactionModal";

function fmtVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  transactionDate: Date;
  isManual: boolean;
  category: { id: string, name: string } | null;
};

export default function TransactionListClient({ 
  transactions, 
  hasMore, 
  currentLimit 
}: { 
  transactions: Transaction[],
  hasMore: boolean,
  currentLimit: number
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", (currentLimit + 50).toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (transactions.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className={styles.list}>
        {transactions.map((t) => (
          <div key={t.id} className={styles.item} onClick={() => setSelectedTx(t)}>
            <div className={`${styles.itemIcon} ${t.type === "THU" ? styles.itemIconThu : styles.itemIconChi}`}>
              {t.type === "THU" ? <IconTrendUp size={18} /> : <IconTrendDown size={18} />}
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

        {hasMore && (
          <div className={styles.loadMoreContainer}>
            <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
              Tải thêm giao dịch
            </button>
          </div>
        )}
      </div>

      {selectedTx && (
        <TransactionModal 
          transaction={selectedTx} 
          onClose={() => setSelectedTx(null)} 
          onSuccess={() => {
            setSelectedTx(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
