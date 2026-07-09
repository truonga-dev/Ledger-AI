"use client";

import { useState } from "react";
import { ClassifiedItem } from "@/lib/ai";
import { IconX, IconPlus, IconCheck, IconCamera, IconWarning } from "@/components/icons";
import styles from "./ConfirmForm.module.css";

const CATEGORIES_CHI = ["Tiền hàng", "Điện nước", "Lương nhân viên", "Thuê mặt bằng", "Vận chuyển", "Ăn uống", "Khác - Chi"];
const CATEGORIES_THU = ["Bán hàng", "Dịch vụ", "Khác - Thu"];

interface Props {
  items: ClassifiedItem[];
  confidence: number;
  preview: string | null;
  saving: boolean;
  onSave: (items: ClassifiedItem[]) => void;
  onCancel: () => void;
}

export default function ConfirmForm({ items: initialItems, confidence, preview, saving, onSave, onCancel }: Props) {
  const [items, setItems] = useState<ClassifiedItem[]>(() => {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    return initialItems.map(item => ({
      ...item,
      date: item.date || today
    }));
  });

  function update(index: number, field: keyof ClassifiedItem, value: any) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        // Khi đổi type, reset category cho đúng loại
        if (field === "type") {
          updated.category = value === "THU" ? "Bán hàng" : "Tiền hàng";
        }
        return updated;
      })
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    setItems((prev) => [
      ...prev,
      { description: "", amount: 0, quantity: 1, date: today, type: "CHI", category: "Khác - Chi" },
    ]);
  }

  const isLowConfidence = confidence < 0.7;

  return (
    <div className={styles.wrap}>
      {/* Preview ảnh */}
      {preview && (
        <img src={preview} alt="Hóa đơn" className={styles.preview} />
      )}

      {/* Cảnh báo confidence thấp */}
      {isLowConfidence && (
        <div className={styles.warning}>
          <IconWarning size={16} />
          AI không chắc chắn ({Math.round(confidence * 100)}%) — kiểm tra lại từng dòng
        </div>
      )}

      <p className={styles.label}>
        AI đọc được <strong>{items.length} khoản mục</strong> — xem lại và sửa nếu cần
      </p>

      {/* Danh sách items */}
      <div className={styles.items}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.itemNum}>#{i + 1}</span>
              <button type="button" className={styles.removeBtn} onClick={() => removeItem(i)}>
                <IconX size={14} />
              </button>
            </div>

            {/* Mô tả */}
            <div className={styles.field}>
              <label className="label">Mô tả</label>
              <input
                className="input"
                value={item.description ?? ""}
                onChange={(e) => update(i, "description", e.target.value)}
                placeholder="Mua hàng tạp hóa..."
              />
            </div>

            {/* Số tiền & Số lượng */}
            <div className={styles.row}>
              <div className={styles.field} style={{ flex: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="label">Số tiền (VND)</label>
                  {item.amount > 0 && (
                    <span className={styles.formattedAmount}>
                      {item.amount.toLocaleString("vi-VN")} đ
                    </span>
                  )}
                </div>
                <input
                  className="input"
                  type="number"
                  value={item.amount === null || item.amount === undefined ? "" : item.amount}
                  onChange={(e) => update(i, "amount", e.target.value === "" ? "" : Number(e.target.value))}
                  min={0}
                  placeholder="0"
                />
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className="label">Số lượng</label>
                <input
                  className="input"
                  type="number"
                  value={item.quantity === null || item.quantity === undefined ? "" : item.quantity}
                  onChange={(e) => update(i, "quantity", e.target.value === "" ? "" : Number(e.target.value))}
                  min={1}
                  placeholder="1"
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className="label">Ngày tháng (Tùy chọn)</label>
                <input
                  className="input"
                  type="date"
                  value={item.date || ""}
                  onChange={(e) => update(i, "date", e.target.value)}
                />
              </div>
            </div>

            <div className={styles.quickAdd}>
              <button type="button" onClick={() => update(i, "amount", (Number(item.amount) || 0) + 10000)}>+10k</button>
              <button type="button" onClick={() => update(i, "amount", (Number(item.amount) || 0) + 50000)}>+50k</button>
              <button type="button" onClick={() => update(i, "amount", (Number(item.amount) || 0) + 100000)}>+100k</button>
              <button type="button" onClick={() => update(i, "amount", (Number(item.amount) || 0) + 500000)}>+500k</button>
            </div>

            {/* THU / CHI */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className="label">Loại</label>
                <select
                  className="input"
                  value={item.type}
                  onChange={(e) => update(i, "type", e.target.value as "THU" | "CHI")}
                >
                  <option value="THU">💰 Thu</option>
                  <option value="CHI">💸 Chi</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className="label">Danh mục</label>
                <select
                  className="input"
                  value={item.category}
                  onChange={(e) => update(i, "category", e.target.value)}
                >
                  {(item.type === "THU" ? CATEGORIES_THU : CATEGORIES_CHI).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className={`btn btn-secondary ${styles.addBtn}`} onClick={addItem}>
        <IconPlus size={16} />
        Thêm dòng thủ công
      </button>

      <div className={styles.actions}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          <IconCamera size={18} />
          Chụp lại
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onSave(items)}
          disabled={saving || items.length === 0}
          style={{ flex: 1 }}
        >
          {saving ? <span className="spinner" /> : <IconCheck size={18} color="white" />}
          {saving ? "Đang lưu..." : "Lưu giao dịch"}
        </button>
      </div>
    </div>
  );
}
