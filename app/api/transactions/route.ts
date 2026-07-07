import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassifiedItem } from "@/lib/ai";

// GET /api/transactions — lấy danh sách giao dịch
export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // "2024-01"
    const type = searchParams.get("type") as "THU" | "CHI" | null;

    let dateFilter = {};
    if (month) {
      const [year, m] = month.split("-").map(Number);
      dateFilter = {
        gte: new Date(year, m - 1, 1),
        lte: new Date(year, m, 0, 23, 59, 59),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        user: { email: user.email! },
        ...(type ? { type } : {}),
        ...(month ? { transactionDate: dateFilter } : {}),
      },
      include: { category: true },
      orderBy: { transactionDate: "desc" },
      take: 200,
    });

    return NextResponse.json({ transactions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/transactions — lưu nhiều giao dịch sau khi user xác nhận
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const items: ClassifiedItem[] = body.items ?? [];
    const imageUrl: string | undefined = body.imageUrl;

    if (!items.length) {
      return NextResponse.json({ error: "Không có giao dịch để lưu" }, { status: 400 });
    }

    // Lấy hoặc tạo user trong DB
    let dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          shopName: user.email!.split("@")[0], // Tên tạm — user có thể đổi sau
        },
      });
    }

    // Lưu từng giao dịch
    const created = [];
    for (const item of items) {
      const catName = item.category || "Khác";
      const desc = item.description || "Giao dịch AI";
      const amt = item.amount || 0;
      const qty = item.quantity || 1;

      // Use findFirst instead of findUnique to avoid compound unique name issues
      let category = await prisma.category.findFirst({
        where: {
          userId: dbUser!.id,
          name: catName,
          type: item.type as "THU" | "CHI",
        },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            userId: dbUser!.id,
            name: catName,
            type: item.type as "THU" | "CHI",
          },
        });
      }

      const tx = await prisma.transaction.create({
        data: {
          userId: dbUser!.id,
          type: item.type as "THU" | "CHI",
          amount: Number(amt) || 0,
          quantity: Number(qty) || 1,
          description: desc,
          transactionDate: (() => {
            if (!item.date) return new Date();
            const parsed = new Date(item.date);
            if (isNaN(parsed.getTime())) return new Date();
            // Nếu ngày trên hóa đơn cách hôm nay quá 1 năm → dùng ngày hôm nay
            const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
            const diff = Math.abs(Date.now() - parsed.getTime());
            return diff > ONE_YEAR_MS ? new Date() : parsed;
          })(),
          receiptImageUrl: imageUrl,
          isManual: false,
          categoryId: category.id,
        },
      });
      created.push(tx);
    }

    return NextResponse.json({ count: created.length, success: true });
  } catch (err: any) {
    console.error("POST /api/transactions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/transactions?id=xxx hoặc ?all=true
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get("id");
    const deleteAll = searchParams.get("all");

    if (deleteAll === "true") {
      await prisma.transaction.deleteMany({
        where: { user: { email: user.email! } },
      });
      return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

    await prisma.transaction.deleteMany({
      where: { id, user: { email: user.email! } },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/transactions — cập nhật giao dịch
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, amount, quantity, description, type, transactionDate } = body;

    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

    // Verify ownership implicitly
    const existing = await prisma.transaction.findFirst({
      where: { id, user: { email: user.email! } }
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount: Number(amount),
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        description,
        type: type as "THU" | "CHI",
        transactionDate: transactionDate && !isNaN(new Date(transactionDate).getTime())
          ? new Date(transactionDate)
          : existing.transactionDate,
      }
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (err: any) {
    console.error("PUT /api/transactions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


