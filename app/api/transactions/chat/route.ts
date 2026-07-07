import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processTextToTransactions } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Vui lòng cung cấp nội dung chat" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { shopType: true },
    });

    const shopType = dbUser?.shopType || "KHAC";

    // Gọi hàm AI xử lý
    const result = await processTextToTransactions(text, shopType);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[Chat API Error]:", err);
    return NextResponse.json({ error: err.message || "Lỗi xử lý AI" }, { status: 500 });
  }
}
