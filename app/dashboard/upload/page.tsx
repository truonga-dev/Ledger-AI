"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ConfirmForm from "@/components/upload/ConfirmForm";
import { IconCamera, IconScan, IconPlus, IconImage } from "@/components/icons";
import styles from "./page.module.css";
import type { ClassifiedItem } from "@/lib/groq";

type UploadState = "idle" | "uploading" | "confirming" | "saving";

function IconBolt({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white" stroke="white" />
    </svg>
  );
}
function IconLightbulb({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}
function IconSquare({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}
function IconZoomIn({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

const TIPS = [
  { Icon: IconLightbulb, text: "Chụp nơi đủ sáng, tránh bóng tối và phản sáng" },
  { Icon: IconSquare,    text: "Để hóa đơn phẳng, không bị nhăn hay gập" },
  { Icon: IconZoomIn,    text: "Zoom đủ gần để thấy rõ từng chữ số" },
];

export default function UploadPage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<ClassifiedItem[]>([]);
  const [confidence, setConfidence] = useState(1);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setState("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lỗi không xác định");
      setItems(data.items);
      setConfidence(data.confidence);
      setState("confirming");
    } catch (err: any) {
      setError(err.message);
      setState("idle");
    }
  }

  async function handleSave(editedItems: ClassifiedItem[]) {
    setState("saving");
    setError("");
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: editedItems }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Lưu thất bại");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setState("confirming");
    }
  }

  function handleReset() {
    setState("idle");
    setPreview(null);
    setItems([]);
    setError("");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Chụp hóa đơn</h1>
        <p className={styles.subtitle}>AI sẽ tự đọc và phân loại thu / chi</p>
      </div>

      {/* Idle state */}
      {state === "idle" && (
        <div className={styles.body}>
          {/* Upload actions */}
          <div className={styles.uploadActions}>
            <div className={styles.uploadActionBtn} onClick={() => cameraInputRef.current?.click()}>
              <div className={`${styles.actionIconWrap} ${styles.camera}`}>
                <IconCamera size={26} />
              </div>
              <div>
                <p className={styles.actionLabel}>Chụp ảnh</p>
                <p className={styles.actionHint}>Dùng máy ảnh</p>
              </div>
            </div>

            <div className={styles.uploadActionBtn} onClick={() => galleryInputRef.current?.click()}>
              <div className={`${styles.actionIconWrap} ${styles.gallery}`}>
                <IconImage size={26} />
              </div>
              <div>
                <p className={styles.actionLabel}>Tải ảnh lên</p>
                <p className={styles.actionHint}>Từ thiết bị</p>
              </div>
            </div>
          </div>

          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {error && <p className={styles.error}>{error}</p>}

          {/* Manual entry */}
          <button
            className={styles.manualBtn}
            onClick={() => {
              setPreview(null);
              setConfidence(1);
              setItems([{ description: "", amount: 0, quantity: 1, date: null, type: "CHI", category: "Khác - Chi" }]);
              setState("confirming");
            }}
          >
            <IconPlus size={16} />
            Nhập giao dịch thủ công (không cần ảnh)
          </button>

          {/* Tips */}
          <div className={styles.tips}>
            <p className={styles.tipsTitle}>💡 Mẹo chụp ảnh đẹp</p>
            <ul className={styles.tipsList}>
              {TIPS.map(({ Icon, text }, i) => (
                <li key={i} className={styles.tipsItem}>
                  <span className={styles.tipIcon}><Icon size={14} /></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Uploading state */}
      {state === "uploading" && (
        <div className={styles.loading}>
          {preview && <img src={preview} alt="preview" className={styles.preview} />}
          <div className={styles.loadingBox}>
            <div className={styles.aiOrb}>
              <IconBolt size={26} />
            </div>
            <p className={styles.loadingText}>AI đang đọc hóa đơn...</p>
            <p className={styles.loadingSub}>Groq Vision đang phân tích</p>
            <div className={styles.dots}>
              <span /><span /><span />
            </div>
          </div>
        </div>
      )}

      {/* Confirm / Saving state */}
      {(state === "confirming" || state === "saving") && (
        <div style={{ padding: "0 16px" }}>
          <ConfirmForm
            items={items}
            confidence={confidence}
            preview={preview}
            saving={state === "saving"}
            onSave={handleSave}
            onCancel={handleReset}
          />
        </div>
      )}
    </div>
  );
}
