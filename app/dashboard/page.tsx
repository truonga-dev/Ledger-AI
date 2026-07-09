import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import QuickInsight from "@/components/dashboard/QuickInsight";
import DashboardClient from "@/components/dashboard/DashboardClient";
import styles from "./page.module.css";
import { IconTrendUp, IconTrendDown, IconTrophy, IconWarning, IconSparkles } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";
function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

function getTodayRange() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  return { start, end };
}

function calcStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates.map(d => d.toDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const ds of unique) {
    const d = new Date(ds);
    if (d.toDateString() === cursor.toDateString()) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

const MONTHS_VI = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                   "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

function hoursVi() {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function fmtShort(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(".0", "") + " tỷ";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + " triệu";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toLocaleString("vi-VN") + "đ";
}

export default async function DashboardPage() {
  const user = await getUserSession();

  if (!user) return null;

  const now = new Date();
  const { start: monthStart, end: monthEnd } = getMonthRange(now);
  const { start: todayStart, end: todayEnd } = getTodayRange();

  // Tháng này
  const monthTx = await prisma.transaction.findMany({
    where: { user: { email: user.email! }, transactionDate: { gte: monthStart, lte: monthEnd } },
    include: { category: true },
    orderBy: { transactionDate: "desc" },
  });

  // Tất cả (cho All-time balance & Streak)
  // Lấy danh sách ngày để tính streak (chỉ lấy transactionDate cho nhẹ)
  const allDates = await prisma.transaction.findMany({
    where: { user: { email: user.email! } },
    select: { transactionDate: true },
    orderBy: { transactionDate: 'desc' },
  });

  // Tháng trước (cho % change)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Tính tổng số dư bằng Prisma aggregate thay vì tải toàn bộ giao dịch
  const [allThuAgg, allChiAgg, prevThuAgg, prevChiAgg] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { user: { email: user.email! }, type: "THU" }
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { user: { email: user.email! }, type: "CHI" }
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { user: { email: user.email! }, type: "THU", transactionDate: { gte: prevMonthStart, lte: prevMonthEnd } }
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { user: { email: user.email! }, type: "CHI", transactionDate: { gte: prevMonthStart, lte: prevMonthEnd } }
    })
  ]);

  // User data
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { shopName: true, backgroundUrl: true, avatarUrl: true, logoUrl: true, monthlyBudget: true },
  });

  // ── Calculations ──
  const totalThu  = monthTx.filter(t => t.type === "THU").reduce((s, t) => s + Number(t.amount), 0);
  const totalChi  = monthTx.filter(t => t.type === "CHI").reduce((s, t) => s + Number(t.amount), 0);
  const loiLo     = totalThu - totalChi;
  const allTimeBal = Number(allThuAgg._sum.amount || 0) - Number(allChiAgg._sum.amount || 0);

  const prevThu = Number(prevThuAgg._sum.amount || 0);
  const prevChi = Number(prevChiAgg._sum.amount || 0);
  const thuChange = prevThu > 0 ? ((totalThu - prevThu) / prevThu) * 100 : 0;
  const chiChange = prevChi > 0 ? ((totalChi - prevChi) / prevChi) * 100 : 0;

  // Today
  const todayTx    = monthTx.filter(t => t.transactionDate >= todayStart && t.transactionDate <= todayEnd);
  const todayAmt   = todayTx.reduce((s, t) => s + Number(t.amount), 0);

  // Top category (by chi)
  const catMap: Record<string, { name: string; total: number }> = {};
  for (const t of monthTx.filter(x => x.type === "CHI")) {
    const k = t.category?.name ?? "Khác";
    if (!catMap[k]) catMap[k] = { name: k, total: 0 };
    catMap[k].total += Number(t.amount);
  }
  const topCat = Object.values(catMap).sort((a, b) => b.total - a.total)[0];

  // Streak
  const streak = calcStreak(allDates.map(t => new Date(t.transactionDate)));

  // Meta
  const shopName  = dbUser?.shopName ?? user.email!.split("@")[0];
  const initials  = shopName.slice(0, 2).toUpperCase();
  const period    = `${MONTHS_VI[now.getMonth()]} ${now.getFullYear()}`;
  const budget    = Number(dbUser?.monthlyBudget ?? 0);
  const avatarUrl = dbUser?.avatarUrl;
  const logoUrl   = dbUser?.logoUrl;
  const backgroundUrl = dbUser?.backgroundUrl;

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <div
        className={styles.hero}
        style={backgroundUrl
          ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.85)), url(${backgroundUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundImage: `linear-gradient(160deg, var(--brand-600) 0%, var(--brand-700) 100%)` }}
      >
        {/* Top bar: Logo + Avatar */}
        <div className={styles.heroTopBar}>
          <div className={styles.logoWordmark}>
            Ledger<span>AI</span>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <ThemeToggle />
            <div className={styles.heroAvatar}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" />
              ) : initials}
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className={styles.heroBody}>
          <p className={styles.heroGreeting}>{hoursVi()}, 👋</p>
          <h1 className={styles.heroTitle}>{shopName}</h1>
          <p className={styles.heroPeriod}>{period}</p>
        </div>

        {/* Balance Glass Card */}
        <div className={styles.heroBalanceWrap}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              SỐ DƯ TỔNG (TOÀN THỜI GIAN)
            </p>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {fmtShort(Math.abs(allTimeBal))}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
              {Math.abs(allTimeBal).toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statsWrap}>
        <div className={styles.statsGrid}>
          <StatCard
            label="Tổng Thu"
            amount={totalThu}
            type="thu"
            icon={<IconTrendUp size={24} />}
            change={thuChange}
          />
          <StatCard
            label="Tổng Chi"
            amount={totalChi}
            type="chi"
            icon={<IconTrendDown size={24} />}
            change={chiChange}
          />
        </div>
        <StatCard
          label={loiLo >= 0 ? "Lợi nhuận tháng này" : "Thua lỗ tháng này"}
          amount={Math.abs(loiLo)}
          type={loiLo >= 0 ? "thu" : "chi"}
          icon={loiLo >= 0 ? <IconTrophy size={24} /> : <IconWarning size={24} />}
          fullWidth
        />
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>
        {/* Quick Insight */}
        <QuickInsight
          todayCount={todayTx.length}
          todayAmount={todayAmt}
          topCategory={topCat?.name ?? "—"}
          topCategoryAmount={topCat?.total ?? 0}
          streakDays={streak}
        />

        {/* AI Advisor Link */}
        <div className={styles.section}>
          <Link href="/dashboard/insights" style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#transparent', width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
                  <img src="/icon.png" alt="LedgerAI Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--brand-600)' }}>Cố vấn Tài chính AI</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phân tích thu chi, nhận lời khuyên</p>
                </div>
              </div>
              <div style={{ color: 'var(--brand-500)' }}>→</div>
            </div>
          </Link>
        </div>

        {/* Month Goal */}
        <DashboardClient
          initialBudget={budget}
          spent={totalChi}
        />

        {/* Chart */}
        {monthTx.length > 0 && (
          <div className={styles.section}>
            <MonthlyChart transactions={monthTx.map(t => ({
              transactionDate: t.transactionDate.toISOString(),
              amount: Number(t.amount),
              type: t.type,
            }))} />
          </div>
        )}

        {/* Recent Transactions */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Giao dịch gần đây</h2>
            <Link href="/dashboard/transactions" className={styles.seeAll}>Xem tất cả →</Link>
          </div>
          <RecentTransactions transactions={monthTx.slice(0, 10).map(t => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            description: t.description,
            category: t.category?.name ?? "Khác",
            transactionDate: t.transactionDate.toISOString(),
          }))} />
        </div>
      </div>
    </div>
  );
}



