"use client";

import { useState } from "react";
import styles from "./MonthGoal.module.css";
import { IconTarget, IconX, IconCheck, IconWarning } from "@/components/icons";

interface Props {
  spent: number;
  budget: number;
  onSetBudget: (amount: number) => void;
}

function fmtVND(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(".0", "") + " tỷ";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + " triệu";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toLocaleString("vi-VN") + "đ";
}

export default function MonthGoal({ spent, budget, onSetBudget }: Props) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(budget > 0 ? budget / 1_000_000 : ""));
  const [saving, setSaving] = useState(false);
  const [localMsg, setLocalMsg] = useState("");

  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const isOver = remaining < 0;
  const barColor = pct >= 90 ? "var(--danger)" : pct >= 70 ? "var(--warning)" : "var(--primary)";

  async function handleSave() {
    const val = parseFloat(input);
    if (isNaN(val) || val <= 0) {
      setLocalMsg("Vui lòng nhập số hợp lệ");
      return;
    }
    setSaving(true);
    setLocalMsg("");
    try {
      await onSetBudget(Math.round(val * 1_000_000));
      setLocalMsg("✓ Đã lưu thành công");
      setTimeout(() => setLocalMsg(""), 2000);
      setEditing(false);
    } catch {
      setLocalMsg("Lưu thất bại, thử lại");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setInput(String(budget > 0 ? budget / 1_000_000 : ""));
    setLocalMsg("");
    setEditing(false);
  }

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleRow}>
            <span className={styles.iconBadge}>
              <IconTarget size={15} color="white" />
            </span>
            <p className={styles.title}>Ngân sách tháng này</p>
          </div>
          <p className={styles.sub}>
            Đã chi: <strong>{fmtVND(spent)}</strong> / {fmtVND(budget > 0 ? budget : 0)}
          </p>
        </div>
        {!editing ? (
          <button className={styles.editBtn} onClick={() => setEditing(true)}>
            Sửa
          </button>
        ) : (
          <button className={styles.cancelBtn} onClick={handleCancel} aria-label="Hủy">
            <IconX size={15} />
          </button>
        )}
      </div>

      {/* Edit mode */}
      {editing ? (
        <div className={styles.editSection}>
          <p className={styles.editLabel}>Nhập ngân sách chi tiêu mục tiêu:</p>
          <div className={styles.editRow}>
            <div className={styles.inputWrap}>
              <input
                type="number"
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="VD: 10"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleSave()}
              />
              <span className={styles.unit}>triệu VNĐ</span>
            </div>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} /> : "Lưu"}
            </button>
          </div>
          {localMsg && (
            <p className={`${styles.msg} ${localMsg.includes("✓") ? styles.msgOk : styles.msgErr}`}>
              {localMsg}
            </p>
          )}
          <p className={styles.editHint}>💡 Nhập số triệu. Ví dụ: 10 = 10,000,000đ</p>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className={styles.barSection}>
            <div className={styles.barWrap}>
              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
              <span className={styles.pct} style={{ color: barColor }}>{Math.round(pct)}%</span>
            </div>

            {/* Remaining */}
            <div className={styles.remaining} style={{ color: isOver ? "var(--danger)" : "var(--success)" }}>
              {isOver ? (
                <>
                  <IconWarning size={14} className={styles.statusIcon} />
                  <span>Vượt ngân sách <strong>{fmtVND(Math.abs(remaining))}</strong></span>
                </>
              ) : (
                <>
                  <IconCheck size={14} className={styles.statusIcon} />
                  <span>Còn lại <strong>{fmtVND(remaining)}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* No budget set hint */}
          {budget === 0 && (
            <p className={styles.noBudgetHint}>Bấm &quot;Sửa&quot; để đặt mục tiêu ngân sách tháng</p>
          )}
        </>
      )}
    </div>
  );
}
