import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DebtClient from "@/components/debts/DebtClient";
import styles from "./page.module.css";
import Link from "next/link";
import { IconArrowLeft } from "@/components/icons";

export default async function DebtsPage() {
  const user = await getUserSession();
  if (!user) redirect("/login");

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/dashboard/profile" className={styles.backBtn}>
          <IconArrowLeft size={20} />
        </Link>
        <h1>Sổ ghi nợ</h1>
      </div>
      <div className={styles.content}>
        <DebtClient />
      </div>
    </div>
  );
}
