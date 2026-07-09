import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentMonthTx, lastMonthTx, dbUser] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          user: { email: user.email },
          transactionDate: { gte: currentMonthStart },
        },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: {
          user: { email: user.email },
          transactionDate: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        include: { category: true },
      }),
      prisma.user.findUnique({
        where: { email: user.email },
        select: { monthlyBudget: true, shopName: true },
      })
    ]);

    // Aggregate data
    const aggregate = (txs: any[]) => {
      let thu = 0;
      let chi = 0;
      const categories: Record<string, number> = {};
      
      txs.forEach(t => {
        const amount = Number(t.amount);
        if (t.type === "THU") {
          thu += amount;
        } else {
          chi += amount;
          const cat = t.category?.name || "Khác";
          categories[cat] = (categories[cat] || 0) + amount;
        }
      });
      return { thu, chi, categories };
    };

    const currentData = aggregate(currentMonthTx);
    const lastData = aggregate(lastMonthTx);

    // Format for AI
    const dataSummary = `
Dữ liệu tháng trước:
- Tổng thu: ${lastData.thu}
- Tổng chi: ${lastData.chi}
- Chi tiêu theo danh mục: ${JSON.stringify(lastData.categories)}

Dữ liệu tháng này (tính đến hiện tại):
- Tổng thu: ${currentData.thu}
- Tổng chi: ${currentData.chi}
- Ngân sách tháng đặt ra: ${dbUser?.monthlyBudget || "Không có"}
- Chi tiêu theo danh mục: ${JSON.stringify(currentData.categories)}
    `;

    const prompt = `Bạn là một Chuyên gia phân tích tài chính AI cao cấp của hệ thống LedgerAI.
Nhiệm vụ: Đọc dữ liệu thu chi 2 tháng gần nhất của người dùng và đưa ra MỘT bản đánh giá tài chính ngắn gọn, mang tính chuyên môn cao, súc tích (khoảng 3-4 câu).
Tập trung vào:
1. Phân tích chênh lệch chi tiêu tháng này so với tháng trước (đặc biệt các hạng mục có biến động lớn).
2. Tốc độ "đốt tiền" (burn rate) so với ngân sách.
3. Đề xuất 1 chiến lược cụ thể để tối ưu dòng tiền hoặc quản trị rủi ro tài chính.
Hãy sử dụng văn phong trang trọng, khách quan và chuyên nghiệp của một chuyên gia tài chính (vd: "Dữ liệu cho thấy tỷ trọng chi tiêu...", "Khuyến nghị điều chỉnh ngân sách..."). Tuyệt đối tránh các từ ngữ quá bình dân hoặc biểu cảm thái quá.
KHÔNG dùng markdown in đậm quá nhiều, KHÔNG dùng danh sách gạch đầu dòng dài dòng, chỉ cần viết thành 1-2 đoạn văn phân tích.

Dữ liệu của người dùng:
${dataSummary}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ insight: responseText });
  } catch (error: any) {
    console.error("Insight error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
