import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getUserSession();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get("month");
    
    let whereClause: any = { user: { email: user.email! } };

    if (monthStr) {
      const [year, month] = monthStr.split("-").map(Number);
      if (!isNaN(year) && !isNaN(month)) {
        whereClause.transactionDate = {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59),
        };
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { transactionDate: "asc" },
    });

    // Sử dụng exceljs để tạo file Excel đẹp mắt
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LedgerAI';
    const worksheet = workbook.addWorksheet('Giao dịch');

    // Cấu hình các cột
    worksheet.columns = [
      { header: 'Ngày giao dịch', key: 'date', width: 18 },
      { header: 'Loại', key: 'type', width: 12 },
      { header: 'Danh mục', key: 'category', width: 22 },
      { header: 'Số tiền (VNĐ)', key: 'amount', width: 20 },
      { header: 'Số lượng', key: 'qty', width: 12 },
      { header: 'Mô tả', key: 'desc', width: 45 },
      { header: 'Hình thức nhập', key: 'method', width: 18 },
    ];

    // Style cho dòng Header
    worksheet.getRow(1).eachCell((cell: any) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' } // Màu --brand-600 của ứng dụng
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    worksheet.getRow(1).height = 25;

    // Định dạng cột số tiền (cột D)
    worksheet.getColumn('amount').numFmt = '#,##0';
    worksheet.getColumn('qty').alignment = { horizontal: 'center' };

    // Thêm dữ liệu
    transactions.forEach((t) => {
      const row = worksheet.addRow({
        date: t.transactionDate.toLocaleDateString("vi-VN"),
        type: t.type === "THU" ? "Thu nhập" : "Chi tiêu",
        category: t.category?.name || "Khác",
        amount: Number(t.amount),
        qty: (t as any).quantity,
        desc: t.description || "",
        method: t.isManual ? "Thủ công" : "AI Quét",
      });

      // Style cho mỗi ô dữ liệu
      row.eachCell({ includeEmpty: true }, (cell: any) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
        };
        cell.alignment = { vertical: 'middle' };
      });
      row.height = 20;

      // Tô màu đỏ/xanh cho số tiền
      const amountCell = row.getCell('amount');
      if (t.type === "THU") {
        amountCell.font = { color: { argb: 'FF10B981' }, bold: true }; // Xanh lá
      } else {
        amountCell.font = { color: { argb: 'FFF43F5E' }, bold: true }; // Đỏ
      }
    });

    const buf = await workbook.xlsx.writeBuffer();

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="LedgerAI_BaoCao_${monthStr || "ToanBo"}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
