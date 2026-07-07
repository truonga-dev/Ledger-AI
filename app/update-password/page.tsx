"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "../login/login.module.css";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Check session on load. If no session, they shouldn't be here.
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Phiên khôi phục mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu.");
      }
    };
    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    if (password.length < 6) {
      setError("Mật khẩu phải dài tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Lỗi cập nhật mật khẩu: " + error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authSection} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className={styles.authWrapper} style={{ maxWidth: 450, margin: "0 auto", width: "100%" }}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h2 className={styles.title}>Thiết lập mật khẩu mới</h2>
              <p className={styles.subtitle}>
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
              </p>
            </div>

            {success ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div className={styles.successMsg} style={{ display: 'inline-block', fontSize: 16 }}>
                  ✅ Đổi mật khẩu thành công!
                </div>
                <p style={{ marginTop: 10, color: "var(--text-secondary)" }}>Đang chuyển hướng về bảng điều khiển...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>Mật khẩu mới</label>
                  <input
                    id="password"
                    type="password"
                    className={styles.inputField}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword" className={styles.inputLabel}>Xác nhận mật khẩu mới</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className={styles.inputField}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <div className={styles.errorMsg}>⚠️ {error}</div>}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : "Cập nhật mật khẩu"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
