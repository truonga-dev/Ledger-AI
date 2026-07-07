import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// GET: Lấy danh sách nợ
export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const isPaidParam = searchParams.get("isPaid");

    const whereClause: any = { user: { email: user.email! } };
    if (isPaidParam !== null) {
      whereClause.isPaid = isPaidParam === "true";
    }

    const debts = await prisma.debt.findMany({
      where: whereClause,
      orderBy: [
        { isPaid: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json({ debts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Thêm khoản nợ mới
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { debtorName, amount, description, dueDate, borrowDate } = body;

    if (!debtorName || !amount) {
      return NextResponse.json({ error: "Thiếu thông tin nợ" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newDebt = await prisma.debt.create({
      data: {
        userId: dbUser.id,
        debtorName,
        amount: Number(amount),
        description: description || "",
        dueDate: dueDate ? new Date(dueDate) : null,
        borrowDate: borrowDate ? new Date(borrowDate) : new Date(),
      },
    });

    revalidatePath("/dashboard", "layout");
    return NextResponse.json(newDebt);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
