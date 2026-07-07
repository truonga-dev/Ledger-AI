"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { logoutAction } from "@/app/login/actions";
import { IconLogout } from "@/components/icons";
import styles from "@/app/dashboard/profile/page.module.css";

interface Props {
  email: string;
  shopName: string;
  shopType: string;
  phone: string | null;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  logoUrl?: string | null;
  memberSince: string;
  stats: { txCount: number; monthThu: number; monthChi: number };
}

const SHOP_TYPE_LABELS: Record<string, string> = {
  TAP_HOA: "Tiệm tạp hóa",
  QUAN_AN: "Quán ăn / Nhà hàng",
  SAP_CHO: "Sạp chợ",
  DICH_VU: "Dịch vụ",
  KHAC: "Khác",
};

function fmtShort(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(".0", "") + " tỷ";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + " tr";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toLocaleString("vi-VN") + "đ";
}

/* ── Inline SVG Icons ─────────────────────────────────────────── */
function IconGear({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconX({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconCamera({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function IconStore({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconPhone({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconMail({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function IconCalendar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconShield({ size = 18, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconBell({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconHelp({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconPalette({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}
function IconExport({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function IconTrash({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ── Settings items config ─────────────────────────────────────── */
interface SettingItem {
  Icon: React.FC<{ size?: number }>;
  label: string;
  sub: string;
  iconBg: string;
  iconColor: string;
  danger?: boolean;
  action?: () => void;
}

export default function ProfileClient({ email, shopName: initShopName, shopType, phone: initPhone, avatarUrl: initAvatarUrl, backgroundUrl: initBackgroundUrl, logoUrl: initLogoUrl, memberSince, stats: initStats }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  
  // State cho profile update
  const [shopName, setShopName] = useState(initShopName);
  const [phone, setPhone] = useState(initPhone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initAvatarUrl ?? null);
  const [backgroundUrl, setBackgroundUrl] = useState(initBackgroundUrl ?? null);
  const [logoUrl, setLogoUrl] = useState(initLogoUrl ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [stats, setStats] = useState(initStats);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [detailModal, setDetailModal] = useState<"theme" | "security" | "guide" | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const supabase = createSupabaseBrowserClient();

  const initials = shopName.slice(0, 2).toUpperCase();
  const joinDate = new Date(memberSince).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      await logoutAction();
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = "/login";
    }
  }

  async function handleUploadImage(file: File, type: "avatar" | "background" | "logo") {
    if (type === "avatar") setUploadingAvatar(true);
    else if (type === "background") setUploadingBg(true);
    else setUploadingLogo(true);
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload-profile", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload thất bại");
      
      const newUrl = data.imageUrl;
      // Lưu URL vào database
      const updateRes = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          type === "avatar" ? { avatarUrl: newUrl } :
          type === "background" ? { backgroundUrl: newUrl } :
          { logoUrl: newUrl }
        )
      });
      if (!updateRes.ok) {
        const errorData = await updateRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Không thể lưu thay đổi");
      }

      if (type === "avatar") setAvatarUrl(newUrl);
      else if (type === "background") setBackgroundUrl(newUrl);
      else setLogoUrl(newUrl);
      
      showToast("Cập nhật ảnh thành công!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else if (type === "background") setUploadingBg(false);
      else setUploadingLogo(false);
    }
  }

  async function handleUpdateProfile() {
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, phone }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      setProfileMsg("Cập nhật thành công!");
      setTimeout(() => {
        setShowEditModal(false);
        setProfileMsg("");
      }, 1500);
    } catch (_err) {
      setProfileMsg((_err as unknown as Error).message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleExportData() {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      if (!data.transactions) return;
      
      const csv = [
        ["Ngày", "Loại", "Danh mục", "Số tiền", "Mô tả"].join(","),
        ...data.transactions.map((tx: any) => 
          [
            new Date(tx.transactionDate).toLocaleDateString("vi-VN"),
            tx.type === "THU" ? "Thu" : "Chi",
            tx.category?.name || "Khác",
            tx.amount,
            `"${tx.description || ""}"`
          ].join(",")
        )
      ].join("\n");

      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LedgerAI_Export_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      showToast("Xuất dữ liệu thành công", "success");
    } catch (err: any) {
      showToast("Lỗi xuất dữ liệu: " + err.message, "error");
    }
  }

  async function handleDeleteAll() {
    setShowDeleteConfirm(true);
  }

  async function executeDeleteAll() {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/transactions?all=true", { method: "DELETE" });
      if (!res.ok) throw new Error("Xoá thất bại");
      setStats({ txCount: 0, monthThu: 0, monthChi: 0 });
      setShowDeleteConfirm(false);
      setShowSettings(false);
      showToast("Đã xoá toàn bộ dữ liệu", "success");
    } catch (err: any) {
      showToast(err.message || "Lỗi xoá dữ liệu", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const settingsGroups: { title: string; items: SettingItem[] }[] = [
    {
      title: "Tài khoản",
      items: [
        {
          Icon: IconStore,
          label: "Tên cửa hàng",
          sub: shopName,
          iconBg: "var(--primary-light)",
          iconColor: "var(--primary)",
          action: () => setShowEditModal(true),
        },
        {
          Icon: IconPhone,
          label: "Số điện thoại",
          sub: phone ? phone : "Chưa cập nhật",
          iconBg: "#dcfce7",
          iconColor: "#16a34a",
          action: () => setShowEditModal(true),
        },
        {
          Icon: IconMail,
          label: "Email",
          sub: email,
          iconBg: "#fef3c7",
          iconColor: "#d97706",
        },
      ],
    },
    {
      title: "Ứng dụng",
      items: [
        {
          Icon: IconBell,
          label: "Thông báo",
          sub: notifEnabled ? "Đang bật" : "Đã tắt",
          iconBg: "#ede9fe",
          iconColor: "#7c3aed",
          action: () => setNotifEnabled(v => !v),
        },
        {
          Icon: IconPalette,
          label: "Giao diện",
          sub: "Sáng · Hệ thống",
          iconBg: "#fce7f3",
          iconColor: "#be185d",
          action: () => setDetailModal("theme"),
        },
        {
          Icon: IconExport,
          label: "Dữ liệu",
          sub: "Xuất giao dịch ra CSV",
          iconBg: "#e0f2fe",
          iconColor: "#0369a1",
          action: handleExportData,
        },
      ],
    },
    {
      title: "Hỗ trợ",
      items: [
        {
          Icon: IconShield,
          label: "Bảo mật",
          sub: "OTP · Không lưu mật khẩu",
          iconBg: "#ecfdf5",
          iconColor: "#059669",
          action: () => setDetailModal("security"),
        },
        {
          Icon: IconHelp,
          label: "Hướng dẫn sử dụng",
          sub: "Cách dùng · Câu hỏi thường gặp",
          iconBg: "#f0f9ff",
          iconColor: "#0284c7",
          action: () => setDetailModal("guide"),
        },
      ],
    },
    {
      title: "Nguy hiểm",
      items: [
        {
          Icon: IconTrash,
          label: "Xoá tất cả dữ liệu",
          sub: "Không thể hoàn tác — Cẩn thận!",
          iconBg: "var(--danger-light)",
          iconColor: "var(--danger)",
          danger: true,
          action: handleDeleteAll,
        },
      ],
    },
  ];

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <div 
        className={styles.hero} 
        style={backgroundUrl ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.85)), url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {/* Gear button */}
        <button
          className={styles.gearBtn}
          onClick={() => setShowSettings(true)}
          title="Cài đặt"
          aria-label="Mở cài đặt"
        >
          <IconGear size={20} />
        </button>

        {/* Change Background Button */}
        <label className={styles.gearBtn} style={{ right: 56, cursor: 'pointer' }} title="Thay đổi hình nền">
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
            if (e.target.files && e.target.files[0]) handleUploadImage(e.target.files[0], "background");
          }} />
          {uploadingBg ? <span className="spinner" style={{width: 18, height: 18, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)'}} /> : <IconCamera size={18} />}
        </label>


        <div className={styles.avatarWrap} style={{ position: 'relative' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          ) : initials}
          
          {/* Change Avatar Button */}
          <label style={{
            position: 'absolute', bottom: -8, right: -8, background: '#4f46e5', color: 'white',
            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: '3px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }} title="Đổi ảnh đại diện">
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleUploadImage(e.target.files[0], "avatar");
            }} />
            {uploadingAvatar ? <span className="spinner" style={{width: 14, height: 14, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)'}} /> : <IconCamera size={16} />}
          </label>
        </div>
        <h1 className={styles.heroName}>{shopName}</h1>
        <p className={styles.heroEmail}>{email}</p>
      </div>

      <div className={styles.content}>
        {/* ── Stats ── */}
        <div className={styles.statsCard}>
          <p className={styles.cardTitle}>Thống kê tháng này</p>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Giao dịch</span>
              <span className={styles.statValue}>{stats.txCount}</span>
              <span className={styles.statSub}>tổng cộng</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Tháng này</span>
              <span className={styles.statValue} style={{ color: "var(--success)" }}>{fmtShort(stats.monthThu)}</span>
              <span className={styles.statSub}>doanh thu</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Chi tiêu</span>
              <span className={styles.statValue} style={{ color: "var(--danger)" }}>{fmtShort(stats.monthChi)}</span>
              <span className={styles.statSub}>tháng này</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Lợi nhuận</span>
              <span className={styles.statValue} style={{ color: stats.monthThu - stats.monthChi >= 0 ? "var(--success)" : "var(--danger)" }}>
                {fmtShort(Math.abs(stats.monthThu - stats.monthChi))}
              </span>
              <span className={styles.statSub}>{stats.monthThu - stats.monthChi >= 0 ? "lời" : "lỗ"}</span>
            </div>
          </div>
        </div>

        {/* ── Info Card ── */}
        <div className={styles.infoCard}>
          <p className={styles.cardTitle}>Thông tin cửa hàng</p>
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><IconStore size={17} /></div>
            <div className={styles.infoText}>
              <p className={styles.infoLabel}>Tên cửa hàng</p>
              <p className={styles.infoValue}>{shopName}</p>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><IconMail size={17} /></div>
            <div className={styles.infoText}>
              <p className={styles.infoLabel}>Email đăng nhập</p>
              <p className={styles.infoValue}>{email}</p>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><IconPhone size={17} /></div>
            <div className={styles.infoText}>
              <p className={styles.infoLabel}>Số điện thoại</p>
              <p className={styles.infoValue}>{phone ?? "Chưa cập nhật"}</p>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><IconStore size={17} /></div>
            <div className={styles.infoText}>
              <p className={styles.infoLabel}>Loại hình kinh doanh</p>
              <p className={styles.infoValue}>{SHOP_TYPE_LABELS[shopType] ?? "Khác"}</p>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><IconCalendar size={17} /></div>
            <div className={styles.infoText}>
              <p className={styles.infoLabel}>Thành viên từ</p>
              <p className={styles.infoValue}>{joinDate}</p>
            </div>
          </div>
        </div>

        {/* ── Logout ── */}
        <button className={styles.logoutBtn} onClick={handleLogout} disabled={loggingOut}>
          {loggingOut
            ? <span className="spinner" style={{ borderTopColor: "var(--danger)", borderColor: "rgba(244,63,94,0.2)" }} />
            : <IconLogout size={18} />}
          {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>

        <p className={styles.version}>LedgerAI v1.0 · Powered by Groq AI</p>
      </div>

      {/* ── Settings Bottom Sheet ── */}
      {showSettings && (
        <div className={styles.overlay} onClick={() => setShowSettings(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div className={styles.sheetHandle} />

            {/* Header */}
            <div className={styles.sheetHeader}>
              <div className={styles.sheetTitleWrap}>
                <div className={styles.sheetGearIcon}><IconGear size={17} /></div>
                <h2 className={styles.sheetTitle}>Cài đặt</h2>
              </div>
              <button className={styles.sheetClose} onClick={() => setShowSettings(false)} aria-label="Đóng">
                <IconX size={18} />
              </button>
            </div>

            {/* Settings groups */}
            <div className={styles.sheetBody}>
              {settingsGroups.map(group => (
                <div key={group.title} className={styles.settingGroup}>
                  <p className={styles.groupTitle}>{group.title}</p>
                  <div className={styles.groupCard}>
                    {group.items.map((item, idx) => (
                      <button
                        key={idx}
                        className={`${styles.settingItem} ${item.danger ? styles.settingItemDanger : ""}`}
                        onClick={item.action}
                      >
                        <div
                          className={styles.settingIcon}
                          style={{ background: item.iconBg, color: item.iconColor }}
                        >
                          <item.Icon size={16} />
                        </div>
                        <div className={styles.settingText}>
                          <span className={`${styles.settingLabel} ${item.danger ? styles.settingLabelDanger : ""}`}>
                            {item.label}
                          </span>
                          <span className={styles.settingSub}>{item.sub}</span>
                        </div>
                        <span className={styles.settingAction}>
                          {item.action && item.label.includes("Thông báo") ? (
                            <span className={`${styles.toggle} ${notifEnabled ? styles.toggleOn : ""}`}>
                              <span className={styles.toggleThumb} />
                            </span>
                          ) : (
                            <ChevronRight />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Logout inside sheet */}
              <button
                className={styles.sheetLogout}
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut
                  ? <span className="spinner" style={{ borderTopColor: "var(--danger)", borderColor: "rgba(244,63,94,0.2)" }} />
                  : <IconLogout size={17} />}
                {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ── */}
      {showEditModal && (
        <div className={styles.overlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()} style={{ paddingBottom: 24 }}>
            <div className={styles.sheetHandle} />
            <div className={styles.sheetHeader}>
              <h2 className={styles.sheetTitle}>Sửa thông tin</h2>
              <button className={styles.sheetClose} onClick={() => setShowEditModal(false)}>
                <IconX size={18} />
              </button>
            </div>
            <div className={styles.sheetBody} style={{ paddingTop: 20 }}>
              <div className="field">
                <label className="label">Tên cửa hàng</label>
                <input 
                  className="input" 
                  value={shopName} 
                  onChange={(e) => setShopName(e.target.value)} 
                />
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="label">Số điện thoại</label>
                <input 
                  className="input" 
                  type="tel"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>

              {profileMsg && (
                <p style={{ marginTop: 12, fontSize: "0.85rem", color: profileMsg.includes("thành công") ? "var(--success)" : "var(--danger)" }}>
                  {profileMsg}
                </p>
              )}

              <button 
                className="btn btn-primary" 
                style={{ width: "100%", marginTop: 24 }}
                onClick={handleUpdateProfile}
                disabled={savingProfile || !shopName}
              >
                {savingProfile ? <span className="spinner" /> : null}
                {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modals ── */}
      {detailModal && (
        <div className={styles.overlay} onClick={() => setDetailModal(null)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <h3 className={styles.sheetTitle}>
                {detailModal === "theme" && "Giao diện"}
                {detailModal === "security" && "Bảo mật tài khoản"}
                {detailModal === "guide" && "Hướng dẫn sử dụng"}
              </h3>
              <button className={styles.sheetClose} onClick={() => setDetailModal(null)}>
                <IconX size={18} />
              </button>
            </div>
            
            <div className={styles.sheetBody}>
              {detailModal === "theme" && (
                <div className={styles.themeOptions}>
                  <p className={styles.guideText}>Tính năng Giao diện tối (Dark mode) đang được phát triển và sẽ sớm ra mắt trong các phiên bản tiếp theo.</p>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="theme" defaultChecked />
                    <span>Sáng (Light)</span>
                  </label>
                  <label className={styles.radioLabel} style={{ opacity: 0.5, cursor: "not-allowed" }}>
                    <input type="radio" name="theme" disabled />
                    <span>Tối (Dark) - Sắp ra mắt</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="theme" />
                    <span>Tự động theo hệ thống</span>
                  </label>
                </div>
              )}

              {detailModal === "security" && (
                <div className={styles.securityInfo}>
                  <div className={styles.securityBadge}>
                    <IconShield size={32} color="#059669" />
                  </div>
                  <h4 style={{ textAlign: "center", marginBottom: "8px" }}>Bảo vệ nhiều lớp</h4>
                  <p className={styles.guideText}>Tài khoản của bạn được bảo vệ bởi <strong>Supabase Auth</strong>. Mật khẩu không được lưu trữ dưới dạng văn bản rõ mà được mã hoá một chiều an toàn.</p>
                  <ul className={styles.guideList}>
                    <li>Đăng nhập bằng mã OTP qua Email</li>
                    <li>Phiên làm việc tự động hết hạn</li>
                    <li>Bảo mật dữ liệu trên máy chủ đám mây</li>
                  </ul>
                </div>
              )}

              {detailModal === "guide" && (
                <div className={styles.guideInfo}>
                  <h4 style={{ marginBottom: "8px" }}>Câu hỏi thường gặp</h4>
                  <details className={styles.faqItem}>
                    <summary>Làm sao để thêm giao dịch?</summary>
                    <p>Bạn vào phần &quot;Nhập dữ liệu&quot;, có thể copy đoạn chat từ Zalo hoặc mô tả bằng giọng nói để AI tự động trích xuất thông tin.</p>
                  </details>
                  <details className={styles.faqItem}>
                    <summary>Dữ liệu có bị mất khi đăng xuất không?</summary>
                    <p>Không. Tất cả dữ liệu của bạn được đồng bộ tự động lên máy chủ bảo mật an toàn.</p>
                  </details>
                  <details className={styles.faqItem}>
                    <summary>Cách xuất báo cáo ra Excel?</summary>
                    <p>Vào Cài đặt {'>'} Ứng dụng {'>'} Dữ liệu và bấm &quot;Xuất giao dịch ra CSV&quot;, sau đó bạn có thể mở file này bằng Excel.</p>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div className={styles.overlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <h3 className={styles.sheetTitle} style={{ color: 'var(--danger)' }}>Xoá tất cả dữ liệu</h3>
              <button className={styles.sheetClose} onClick={() => setShowDeleteConfirm(false)}>
                <IconX size={18} />
              </button>
            </div>
            
            <div className={styles.sheetBody}>
              <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                <div style={{ 
                  width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-light)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--danger)' 
                }}>
                  <IconTrash size={32} />
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 8, fontWeight: 600 }}>
                  Bạn có chắc chắn muốn xoá toàn bộ?
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Hành động này sẽ xoá vĩnh viễn tất cả dữ liệu giao dịch của bạn và <strong>không thể khôi phục lại</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '12px', fontSize: 15 }} 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Huỷ bỏ
                </button>
                <button 
                  className="btn" 
                  style={{ flex: 1, padding: '12px', fontSize: 15, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--danger)', color: 'white', border: 'none' }} 
                  onClick={executeDeleteAll}
                  disabled={isDeleting}
                >
                  {isDeleting ? <span className="spinner" style={{ width: 16, height: 16, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : "Đồng ý xoá"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 30,
          fontSize: 14,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {toast.message}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}} />
    </div>
  );
}
