"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome, IconList, IconBarChart, IconCamera,
} from "@/components/icons";
import styles from "./DashboardNav.module.css";

// Profile icon inline
function IconUser({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

const LEFT_ITEMS = [
  { href: "/dashboard",              label: "Tổng quan", Icon: IconHome },
  { href: "/dashboard/transactions", label: "Giao dịch", Icon: IconList },
];
const RIGHT_ITEMS = [
  { href: "/dashboard/reports", label: "Báo cáo",  Icon: IconBarChart },
  { href: "/dashboard/profile", label: "Hồ sơ",    Icon: IconUser },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {/* Left two items */}
      {LEFT_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`${styles.item} ${active ? styles.active : ""}`}>
            <span className={styles.iconWrap}><Icon size={22} /></span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}

      {/* Centre camera CTA */}
      <Link href="/dashboard/upload" className={styles.cameraItem}>
        <span className={styles.cameraBtn}>
          <IconCamera size={24} color="white" />
        </span>
        <span className={styles.cameraLabel}>Chụp</span>
      </Link>

      {/* Right two items */}
      {RIGHT_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`${styles.item} ${active ? styles.active : ""}`}>
            <span className={styles.iconWrap}><Icon size={22} /></span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
