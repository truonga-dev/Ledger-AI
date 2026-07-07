"use client";

import { useState } from "react";
import styles from "./ExportExcelButton.module.css";

export default function ExportExcelButton({ monthStr }: { monthStr: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // Kích hoạt download qua trình duyệt
    window.location.href = `/api/transactions/export?month=${monthStr}`;
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <button 
      className={styles.exportBtn} 
      onClick={handleExport} 
      disabled={isExporting}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      {isExporting ? "Đang xuất..." : "Xuất Excel"}
    </button>
  );
}
