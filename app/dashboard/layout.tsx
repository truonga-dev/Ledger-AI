import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserSession();

  if (!user) redirect("/login");

  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>
      <DashboardNav />
    </div>
  );
}


