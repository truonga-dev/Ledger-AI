"use client";

import { useState, useEffect } from "react";
import styles from "./DebtClient.module.css";
import { IconPlus, IconCheck, IconTrash, IconList } from "@/components/icons";

type Debt = {
  id: string;
  debtorName: string;
  amount: number;
  description: string;
  borrowDate: string;
  dueDate: string | null;
  isPaid: boolean;
  createdAt: string;
};

export default function DebtClient() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("unpaid");

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [debtorName, setDebtorName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const res = await fetch("/api/debts");
      const data = await res.json();
      if (res.ok) {
        setDebts(data.debts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debtorName,
          amount: Number(amount),
          description,
          borrowDate: borrowDate || null,
          dueDate: dueDate || null
        })
      });
      if (res.ok) {
        setShowForm(false);
        setDebtorName("");
        setAmount("");
        setDescription("");
        setBorrowDate(new Date().toISOString().split("T")[0]);
        setDueDate("");
        fetchDebts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    if (!confirm("Xác nhận đã thu khoản nợ này? Giao dịch sẽ được tự động ghi vào sổ thu.")) return;
    
    try {
      const res = await fetch(`/api/debts/${id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addTransaction: true })
      });
      if (res.ok) {
        fetchDebts();
        alert("Đã thu nợ và ghi vào sổ thành công!");
      } else {
        const data = await res.json();
        alert(data.error || "Lỗi");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa khoản nợ này?")) return;
    try {
      const res = await fetch(`/api/debts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDebts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDebts = debts.filter(d => {
    if (filter === "unpaid") return !d.isPaid;
    if (filter === "paid") return d.isPaid;
    return true;
  });

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.topActions}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${filter === "unpaid" ? styles.active : ""}`} onClick={() => setFilter("unpaid")}>
            Chưa thu
          </button>
          <button className={`${styles.tab} ${filter === "paid" ? styles.active : ""}`} onClick={() => setFilter("paid")}>
            Đã thu
          </button>
          <button className={`${styles.tab} ${filter === "all" ? styles.active : ""}`} onClick={() => setFilter("all")}>
            Tất cả
          </button>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          <IconPlus size={18} /> Thêm khoản nợ
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleAddDebt}>
          <h3>Thêm khoản nợ mới</h3>
          <div className={styles.inputGroup}>
            <label>Tên người nợ</label>
            <input required type="text" value={debtorName} onChange={e => setDebtorName(e.target.value)} placeholder="VD: Anh A" />
          </div>
          <div className={styles.inputGroup}>
            <label>Số tiền (VNĐ)</label>
            <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="VD: 500000" />
          </div>
          <div className={styles.inputGroup}>
            <label>Ghi chú</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="VD: Nợ tiền hàng" />
          </div>
          <div className={styles.inputGroup}>
            <label>Ngày nợ</label>
            <input type="date" value={borrowDate} onChange={e => setBorrowDate(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Hạn trả (không bắt buộc)</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Hủy</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>Lưu khoản nợ</button>
          </div>
        </form>
      )}

      <div className={styles.list}>
        {filteredDebts.length === 0 ? (
          <div className={styles.emptyState}>
            <IconList size={40} color="var(--text-muted)" />
            <p>Không có dữ liệu nợ.</p>
          </div>
        ) : (
          filteredDebts.map(debt => (
            <div key={debt.id} className={`${styles.card} ${debt.isPaid ? styles.paidCard : ""}`}>
              <div className={styles.cardMain}>
                <div className={styles.info}>
                  <h4 className={styles.name}>{debt.debtorName}</h4>
                  <p className={styles.desc}>{debt.description}</p>
                  <p className={styles.date}>Ngày nợ: {new Date(debt.borrowDate || debt.createdAt).toLocaleDateString("vi-VN")}</p>
                  {debt.dueDate && (
                    <p className={styles.date} style={{ marginTop: 0 }}>Hạn trả: {new Date(debt.dueDate).toLocaleDateString("vi-VN")}</p>
                  )}
                </div>
                <div className={styles.amountWrap}>
                  <span className={styles.amount}>{debt.amount.toLocaleString("vi-VN")}đ</span>
                  {debt.isPaid ? (
                    <span className={styles.badgePaid}>Đã thu</span>
                  ) : (
                    <span className={styles.badgeUnpaid}>Chưa thu</span>
                  )}
                </div>
              </div>
              <div className={styles.cardActions}>
                {!debt.isPaid && (
                  <button className={styles.btnAction} onClick={() => handleMarkPaid(debt.id)}>
                    <IconCheck size={16} /> Đã thu
                  </button>
                )}
                <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => handleDelete(debt.id)}>
                  <IconTrash size={16} /> Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
