"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function InsightsPage() {
  const router = useRouter();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInsight() {
      try {
        const res = await fetch("/api/insights");
        if (!res.ok) throw new Error("Lỗi khi phân tích dữ liệu");
        const data = await res.json();
        setInsight(data.insight);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInsight();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          ← Quay lại
        </button>
        <h1 className={styles.title}>Cố vấn AI</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.aiBubble}>
          <div className={styles.aiAvatar}>
            <img src="/icon.png" alt="LedgerAI Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className={styles.aiMessageWrap}>
            <p className={styles.aiName}>LedgerAI Advisor</p>
            {loading ? (
              <div className={styles.typing}>
                <span></span><span></span><span></span>
              </div>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : (
              <div className={styles.messageText}>
                {insight?.split("\n").map((line, i) => (
                  <p key={i} style={{ marginBottom: "8px" }}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
