"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./login.module.css";
import { loginAction, registerAction } from "./actions";

function LedgerLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="3" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
      <rect x="4" y="9" width="20" height="3" rx="1.5" fill="currentColor" />
      <rect x="4" y="15" width="17" height="3" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="4" y="21" width="11" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function EyeIcon({ crossed }: { crossed?: boolean }) {
  if (crossed) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

type Mode = "login" | "register" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  
  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration fields
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopType, setShopType] = useState("KHAC");
  const [phone, setPhone] = useState("");
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    
    if (error) {
      setError("Lỗi đăng nhập Google: " + error.message);
      setGoogleLoading(false);
    }
  };

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email.trim()) {
      setError("Vui lòng nhập email của bạn.");
      return;
    }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setLoading(false);
    if (error) {
      setError("Lỗi: " + error.message);
    } else {
      setSuccessMsg("Hướng dẫn khôi phục mật khẩu đã được gửi đến email của bạn.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (mode === "login") {
      if (!email.trim() || !password.trim()) return;
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError && email.trim() !== "test@ledger.ai") {
        setError("Lỗi đăng nhập: " + signInError.message);
        setLoading(false);
      } else {
        // Đảm bảo chạy cả server action để set cookie dự phòng nếu là test user
        if (email.trim() === "test@ledger.ai" || signInError) {
          const res = await loginAction(email.trim(), password.trim());
          if (res.error) {
            setError("Lỗi đăng nhập: " + res.error);
            setLoading(false);
            return;
          }
        }
        window.location.href = "/dashboard";
      }
    } else if (mode === "register") {
      if (registerStep === 1) {
        if (!fullName.trim()) {
          setError("Vui lòng nhập Họ và tên.");
          return;
        }
        if (!email.trim() || !password.trim()) return;
        if (password.length < 6) {
          setError("Mật khẩu phải dài tối thiểu 6 ký tự.");
          return;
        }
        setRegisterStep(2);
        return;
      }
      
      if (!shopName.trim()) {
        setError("Vui lòng nhập tên cửa hàng.");
        return;
      }

      setLoading(true);
      // TODO: registerAction cần cập nhật để lưu thêm fullName nếu cần (hiện tại schema Users chưa có fullName)
      const res = await registerAction(email.trim(), password.trim(), shopName.trim(), shopType, phone.trim());
      if (res.error) {
        setError("Không thể đăng ký: " + res.error);
        setLoading(false);
      } else {
        setSuccessMsg("Đăng ký thành công! Đang chuyển hướng...");
        // Auto login on successful register or wait
        const loginRes = await loginAction(email.trim(), password.trim());
        if (!loginRes.error) {
          window.location.href = "/dashboard";
        } else {
          setMode("login");
          setRegisterStep(1);
          setLoading(false);
          setPassword("");
        }
      }
    }
  }

  return (
    <div className={styles.pageContainer}>
      
      {/* Hero / Visual Section (Left) */}
      <div className={styles.heroSection}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroLogoMark} style={{ color: 'white' }}>
            <LedgerLogo />
            <span className={styles.heroLogoText}>LedgerAI</span>
          </div>
          <h1 className={styles.heroTitle}>Kế toán thông minh cho tiểu thương</h1>
          <p className={styles.heroSubtitle}>
            Quản lý sổ sách, theo dõi thu chi và phân tích doanh thu tự động với sức mạnh của AI.
          </p>
          
          <div className={styles.heroStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚡</div>
              <div>
                <h4 className={styles.statTitle}>Tự động hoá</h4>
                <p className={styles.statDesc}>Xử lý hoá đơn trong 1 giây</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div>
                <h4 className={styles.statTitle}>Báo cáo trực quan</h4>
                <p className={styles.statDesc}>Theo dõi dòng tiền theo thời gian thực</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section (Right) */}
      <div className={styles.authSection}>
        <div className={styles.authWrapper}>
          <div className={styles.card}>
            <div className={styles.header}>
              <div className={styles.logoMarkMobile}>
                <LedgerLogo />
              </div>
              <h2 className={styles.title}>
                {mode === "login" ? "Đăng nhập" : mode === "forgot" ? "Khôi phục mật khẩu" : "Tạo tài khoản mới"}
              </h2>
              <p className={styles.subtitle}>
                {mode === "login" 
                  ? "Chào mừng bạn quay trở lại LedgerAI." 
                  : mode === "forgot" 
                    ? "Nhập email của bạn để nhận liên kết khôi phục."
                    : "Thiết lập cửa hàng của bạn chỉ trong 2 bước."}
              </p>
            </div>

            {/* Stepper cho Đăng ký */}
            {mode === "register" && (
              <div className={styles.stepperContainer}>
                <div className={`${styles.step} ${registerStep >= 1 ? styles.stepActive : ''}`}>
                  <div className={styles.stepCircle}>
                    {registerStep > 1 ? <CheckIcon /> : "1"}
                  </div>
                  <span className={styles.stepLabel}>Tài khoản</span>
                </div>
                <div className={`${styles.stepLine} ${registerStep >= 2 ? styles.stepLineActive : ''}`}></div>
                <div className={`${styles.step} ${registerStep >= 2 ? styles.stepActive : ''}`}>
                  <div className={styles.stepCircle}>2</div>
                  <span className={styles.stepLabel}>Cửa hàng</span>
                </div>
              </div>
            )}

            {mode === "forgot" ? (
              <form onSubmit={handleForgot} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>Địa chỉ email</label>
                  <input
                    id="email"
                    type="email"
                    className={styles.inputField}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && <div className={styles.errorMsg}>⚠️ {error}</div>}
                {successMsg && <div className={styles.successMsg}>✅ {successMsg}</div>}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : "Gửi liên kết khôi phục"}
                </button>

                <button 
                  type="button" 
                  className={styles.textBtn} 
                  onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                >
                  ← Quay lại đăng nhập
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Content Đăng ký Bước 2 */}
                {mode === "register" && registerStep === 2 ? (
                  <div className={styles.stepContent}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="shopName" className={styles.inputLabel}>Tên cửa hàng *</label>
                      <input
                        id="shopName"
                        type="text"
                        className={styles.inputField}
                        placeholder="Ví dụ: Tạp hoá Cô Ba"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Ngành nghề kinh doanh</label>
                      <div className={styles.radioCards}>
                        <label className={`${styles.radioCard} ${shopType === 'TAP_HOA' ? styles.selected : ''}`}>
                          <input type="radio" name="shopType" value="TAP_HOA" checked={shopType === 'TAP_HOA'} onChange={(e) => setShopType(e.target.value)} />
                          <span>🛍️ Tạp hóa</span>
                        </label>
                        <label className={`${styles.radioCard} ${shopType === 'QUAN_AN' ? styles.selected : ''}`}>
                          <input type="radio" name="shopType" value="QUAN_AN" checked={shopType === 'QUAN_AN'} onChange={(e) => setShopType(e.target.value)} />
                          <span>🍜 Quán ăn</span>
                        </label>
                        <label className={`${styles.radioCard} ${shopType === 'DICH_VU' ? styles.selected : ''}`}>
                          <input type="radio" name="shopType" value="DICH_VU" checked={shopType === 'DICH_VU'} onChange={(e) => setShopType(e.target.value)} />
                          <span>✂️ Dịch vụ</span>
                        </label>
                        <label className={`${styles.radioCard} ${shopType === 'KHAC' ? styles.selected : ''}`}>
                          <input type="radio" name="shopType" value="KHAC" checked={shopType === 'KHAC'} onChange={(e) => setShopType(e.target.value)} />
                          <span>✨ Khác</span>
                        </label>
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="phone" className={styles.inputLabel}>Số điện thoại liên hệ (Tuỳ chọn)</label>
                      <input
                        id="phone"
                        type="tel"
                        className={styles.inputField}
                        placeholder="0912345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    
                    {error && <div className={styles.errorMsg}>⚠️ {error}</div>}
                    {successMsg && <div className={styles.successMsg}>✅ {successMsg}</div>}

                    <div className={styles.buttonRow}>
                      <button 
                        type="button" 
                        className={styles.secondaryBtn} 
                        onClick={() => setRegisterStep(1)}
                        disabled={loading}
                      >
                        Quay lại
                      </button>
                      <button type="submit" className={styles.submitBtn} style={{ flex: 1, marginTop: 0 }} disabled={loading}>
                        {loading ? <span className={styles.spinner} /> : "Hoàn tất đăng ký"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Content Đăng nhập hoặc Đăng ký Bước 1 */
                  <div className={styles.stepContent}>
                    {mode === "register" && (
                      <div className={styles.inputGroup}>
                        <label htmlFor="fullName" className={styles.inputLabel}>Họ và tên</label>
                        <input
                          id="fullName"
                          type="text"
                          className={styles.inputField}
                          placeholder="Nguyễn Văn A"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required={mode === "register"}
                        />
                      </div>
                    )}
                    <div className={styles.inputGroup}>
                      <label htmlFor="email" className={styles.inputLabel}>Địa chỉ email</label>
                      <input
                        id="email"
                        type="email"
                        className={styles.inputField}
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <div className={styles.labelRow}>
                        <label htmlFor="password" className={styles.inputLabel}>Mật khẩu</label>
                        {mode === "login" && (
                          <button 
                            type="button" 
                            className={styles.forgotBtn}
                            onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }}
                            tabIndex={-1}
                          >
                            Quên mật khẩu?
                          </button>
                        )}
                      </div>
                      <div className={styles.inputWrapper}>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          className={styles.inputField}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button" 
                          className={styles.togglePwdBtn}
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          <EyeIcon crossed={!showPassword} />
                        </button>
                      </div>
                      {mode === "register" && (
                        <span className={styles.inputHint}>Mật khẩu phải chứa ít nhất 6 ký tự.</span>
                      )}
                    </div>

                    {error && <div className={styles.errorMsg}>⚠️ {error}</div>}
                    {successMsg && <div className={styles.successMsg}>✅ {successMsg}</div>}

                    <button type="submit" className={styles.submitBtn} disabled={loading || googleLoading}>
                      {loading ? <span className={styles.spinner} /> : mode === "login" ? "Đăng nhập" : "Tiếp tục tạo cửa hàng"}
                    </button>

                    {/* Nút Google ở dưới nút Submit */}
                    <div className={styles.divider}>Hoặc</div>

                    <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin} disabled={googleLoading || loading}>
                      {googleLoading ? <span className={`${styles.spinner} ${styles.spinnerDark}`} /> : <GoogleIcon />}
                      Tiếp tục với Google
                    </button>

                    {/* Chuyển đổi Mode Đăng nhập / Đăng ký ở dưới cùng */}
                    <div className={styles.footerText}>
                      {mode === "login" ? (
                        <>
                          Chưa có tài khoản?{" "}
                          <button type="button" className={styles.textLink} onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}>
                            Đăng ký ngay
                          </button>
                        </>
                      ) : (
                        <>
                          Đã có tài khoản?{" "}
                          <button type="button" className={styles.textLink} onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); setRegisterStep(1); }}>
                            Đăng nhập
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* Dùng thử ngay */}
            {mode === "login" && (
               <div className={styles.demoBlock}>
                 <button
                   type="button"
                   className={styles.demoBtn}
                   onClick={async () => {
                     setLoading(true);
                     setError("");
                     try {
                       const res = await loginAction("test@ledger.ai", "password123");
                       if (!res.error) {
                         window.location.href = "/dashboard";
                       } else {
                         setError("Lỗi: " + res.error);
                         setLoading(false);
                       }
                     } catch (err: any) {
                       setError("Lỗi hệ thống: " + err.message);
                       setLoading(false);
                     }
                   }}
                   disabled={loading || googleLoading}
                 >
                   {loading ? <span className={`${styles.spinner} ${styles.spinnerDark}`} /> : "🚀 Trải nghiệm ngay (Tài khoản Test)"}
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
