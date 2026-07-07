"use client";

import { useState } from "react";
import styles from "./TransactionModal.module.css";
import { IconTrash } from "@/components/icons"; // Assuming IconTrash exists or I will create it

type Transaction = {
  id: string;
  type: string;
  amount: number;
  quantity?: number;
  description: string;
  transactionDate: Date;
  isManual: boolean;
  category: { id: string, name: string } | null;
};

export default function TransactionModal({ 
  transaction, 
  onClose,
  onSuccess 
}: { 
  transaction: Transaction,
  onClose: () => void,
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [quantity, setQuantity] = useState((transaction.quantity || 1).toString());
  const [description, setDescription] = useState(transaction.description);
  const [type, setType] = useState(transaction.type);
  const [date, setDate] = useState(new Date(transaction.transactionDate).toISOString().split('T')[0]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: transaction.id,
          amount: Number(amount),
          quantity: Number(quantity) || 1,
          description,
          type,
          transactionDate: new Date(date).toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");
      onSuccess();
    } catch (err) {
      alert(err);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?id=${transaction.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Xóa thất bại");
      onSuccess();
    } catch (err) {
      alert(err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Chi tiết giao dịch</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleUpdate} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Loại giao dịch</label>
            <select value={type} onChange={e => setType(e.target.value)} className={styles.input}>
              <option value="THU">Thu</option>
              <option value="CHI">Chi</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div className={styles.inputGroup} style={{ flex: 2 }}>
              <label>Số tiền (VNĐ)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label>Số lượng</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
                className={styles.input}
                min={1}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Nội dung</label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Ngày giao dịch</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className={styles.input}
              required
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
              <IconTrash size={16} /> Xóa
            </button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
