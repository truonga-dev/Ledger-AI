import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReportClient from "@/components/reports/ReportClient";

export default async function ReportsPage() {
  const user = await getUserSession();
  if (!user) return null;

  const now = new Date();

  // Lấy dữ liệu 3 tháng gần nhất để chọn
  const transactions = await prisma.transaction.findMany({
    where: {
      user: { email: user.email! },
      transactionDate: {
        gte: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      },
    },
    include: { category: true },
    orderBy: { transactionDate: "desc" },
  });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { shopName: true },
  });

  return (
    <ReportClient
      transactions={transactions.map((t) => ({
        id: t.id,
        type: t.type as "THU" | "CHI",
        amount: Number(t.amount),
        description: t.description,
        category: t.category?.name ?? "Khác",
        transactionDate: t.transactionDate.toISOString(),
      }))}
      shopName={dbUser?.shopName ?? "Cửa hàng"}
    />
  );
}



