import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// POST: Đánh dấu nợ đã trả và tự động thêm giao dịch THU
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingDebt = await prisma.debt.findUnique({ where: { id } });
    if (!existingDebt || existingDebt.userId !== dbUser.id) {
      return NextResponse.json({ error: "Không tìm thấy khoản nợ" }, { status: 404 });
    }

    if (existingDebt.isPaid) {
      return NextResponse.json({ error: "Khoản nợ này đã được thanh toán" }, { status: 400 });
    }

    const body = await request.json();
    const { addTransaction, transactionDate } = body;

    // Sử dụng transaction của prisma để đảm bảo tính toàn vẹn
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái nợ
      const updatedDebt = await tx.debt.update({
        where: { id },
        data: {
          isPaid: true,
          paidDate: new Date(),
        },
      });

      // 2. Thêm giao dịch THU nếu được yêu cầu
      if (addTransaction) {
        // Tìm category "Khác - Thu" hoặc category nào đó phù hợp
        let category = await tx.category.findFirst({
          where: { name: "Khác - Thu", type: "THU" }
        });

        if (!category) {
          category = await tx.category.create({
            data: { name: "Khác - Thu", type: "THU", userId: dbUser.id }
          });
        }

        await tx.transaction.create({
          data: {
            userId: dbUser.id,
            amount: existingDebt.amount,
            type: "THU",
            description: `Thu nợ từ ${existingDebt.debtorName}: ${existingDebt.description}`,
            transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
            categoryId: category.id,
            isManual: true,
          }
        });
      }

      return updatedDebt;
    });

    revalidatePath("/dashboard", "layout");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
