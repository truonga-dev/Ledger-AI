import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// PUT: Sửa khoản nợ
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { debtorName, amount, description, dueDate } = body;

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingDebt = await prisma.debt.findUnique({ where: { id: params.id } });
    if (!existingDebt || existingDebt.userId !== dbUser.id) {
      return NextResponse.json({ error: "Không tìm thấy khoản nợ" }, { status: 404 });
    }

    const updatedDebt = await prisma.debt.update({
      where: { id: params.id },
      data: {
        debtorName,
        amount: amount ? Number(amount) : undefined,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    revalidatePath("/dashboard", "layout");
    return NextResponse.json(updatedDebt);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Xóa khoản nợ
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingDebt = await prisma.debt.findUnique({ where: { id: params.id } });
    if (!existingDebt || existingDebt.userId !== dbUser.id) {
      return NextResponse.json({ error: "Không tìm thấy khoản nợ" }, { status: 404 });
    }

    await prisma.debt.delete({ where: { id: params.id } });

    revalidatePath("/dashboard", "layout");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
