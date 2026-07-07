import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const user = await getUserSession();
  if (!user) redirect("/login");

  // Load DB user + stats
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { shopName: true, shopType: true, phone: true, createdAt: true, avatarUrl: true, backgroundUrl: true, logoUrl: true },
  });

  // Count transactions
  const txCount = await prisma.transaction.count({
    where: { user: { email: user.email! } },
  });

  // Total revenue this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTxs = await prisma.transaction.findMany({
    where: {
      user: { email: user.email! },
      transactionDate: { gte: monthStart },
    },
    select: { type: true, amount: true },
  });

  const monthThu = monthTxs.filter((t: any) => t.type === "THU").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const monthChi = monthTxs.filter((t: any) => t.type === "CHI").reduce((s: number, t: any) => s + Number(t.amount), 0);

  return (
    <ProfileClient
      email={user.email!}
      shopName={dbUser?.shopName ?? user.email!.split("@")[0]}
      shopType={dbUser?.shopType ?? "KHAC"}
      phone={dbUser?.phone ?? null}
      avatarUrl={dbUser?.avatarUrl ?? null}
      backgroundUrl={dbUser?.backgroundUrl ?? null}
      logoUrl={dbUser?.logoUrl ?? null}
      memberSince={dbUser?.createdAt?.toISOString() ?? new Date().toISOString()}
      stats={{ txCount, monthThu, monthChi }}
    />
  );
}


