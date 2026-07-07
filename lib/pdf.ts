/**
 * lib/pdf.ts — Xuất báo cáo PDF tiếng Việt
 * Dùng html2canvas để render HTML (font từ browser) → jsPDF ghép thành PDF
 * Đảm bảo hiển thị dấu tiếng Việt đúng 100%
 */

interface ReportData {
  shopName: string;
  monthLabel: string;
  totalThu: number;
  totalChi: number;
  loiLo: number;
  byCategory: [string, number][];
  transactions: {
    type: "THU" | "CHI";
    amount: number;
    description: string;
    category: string;
    transactionDate: string;
  }[];
}

function fmtVND(n: number): string {
  return n.toLocaleString("vi-VN") + "đ";
}

function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(".0", "") + " tỷ";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(".0", "")     + " triệu";
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + "k";
  return n.toLocaleString("vi-VN") + "đ";
}

function buildHTML(data: ReportData): string {
  const isProfit = data.loiLo >= 0;
  const loiLoLabel = isProfit ? "Lợi nhuận" : "Thua lỗ";
  const loiLoColor = isProfit ? "#16a34a" : "#dc2626";

  const categoryRows = data.byCategory.map(([cat, amount], i) => `
    <tr style="background:${i % 2 === 0 ? "#f8fafc" : "#ffffff"}">
      <td style="padding:7px 12px;color:#475569;font-size:13px">${cat}</td>
      <td style="padding:7px 12px;text-align:right;color:#dc2626;font-weight:700;font-size:13px">${fmtVND(amount)}</td>
    </tr>
  `).join("");

  const txRows = data.transactions.slice(0, 80).map((t, i) => {
    const d = new Date(t.transactionDate);
    const dateStr = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
    const amtColor = t.type === "THU" ? "#16a34a" : "#dc2626";
    const sign = t.type === "THU" ? "+" : "-";
    return `
      <tr style="background:${i % 2 === 0 ? "#f8fafc" : "#ffffff"}">
        <td style="padding:6px 10px;color:#64748b;font-size:12px;white-space:nowrap">${dateStr}</td>
        <td style="padding:6px 10px;color:#334155;font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.description || "—"}</td>
        <td style="padding:6px 10px;color:#64748b;font-size:12px">${t.category}</td>
        <td style="padding:6px 10px;text-align:right;color:${amtColor};font-weight:700;font-size:12px;white-space:nowrap">${sign}${fmtShort(t.amount)}</td>
      </tr>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          background: #ffffff;
          width: 794px;
          color: #1e293b;
        }
        .page { width: 794px; padding: 0; }

        /* Header */
        .header {
          background: linear-gradient(135deg, #1d4ed8, #4f46e5);
          padding: 28px 32px 24px;
          color: white;
        }
        .brand { font-size: 26px; font-weight: 800; letter-spacing: -0.04em; }
        .brand span { color: #93c5fd; }
        .shop-name { font-size: 14px; margin-top: 4px; opacity: 0.85; font-weight: 500; }
        .month { font-size: 13px; opacity: 0.7; margin-top: 2px; }

        /* Summary cards */
        .summary { display: flex; gap: 12px; padding: 20px 32px; }
        .card {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
        }
        .card-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
        .card-value { font-size: 20px; font-weight: 800; margin-top: 4px; letter-spacing: -0.03em; }

        /* Section titles */
        .section { padding: 0 32px 20px; }
        .section-title {
          font-size: 13px; font-weight: 700; color: #475569;
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-title::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }

        /* Tables */
        table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; }
        thead tr { background: #1d4ed8; }
        thead th {
          padding: 8px 12px; text-align: left; font-size: 11px;
          font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 0.05em;
        }
        thead th:last-child { text-align: right; }

        /* Footer */
        .footer {
          background: #f1f5f9;
          border-top: 1px solid #e2e8f0;
          padding: 14px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-brand { font-size: 12px; font-weight: 700; color: #475569; }
        .footer-note { font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="page">

        <!-- Header -->
        <div class="header">
          <div class="brand">Ledger<span>AI</span></div>
          <div class="shop-name">${data.shopName}</div>
          <div class="month">Báo cáo ${data.monthLabel}</div>
        </div>

        <!-- Summary -->
        <div class="summary">
          <div class="card">
            <div class="card-label">Tổng Thu</div>
            <div class="card-value" style="color:#16a34a">${fmtShort(data.totalThu)}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px">${fmtVND(data.totalThu)}</div>
          </div>
          <div class="card">
            <div class="card-label">Tổng Chi</div>
            <div class="card-value" style="color:#dc2626">${fmtShort(data.totalChi)}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px">${fmtVND(data.totalChi)}</div>
          </div>
          <div class="card">
            <div class="card-label">${loiLoLabel}</div>
            <div class="card-value" style="color:${loiLoColor}">${fmtShort(Math.abs(data.loiLo))}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px">${fmtVND(Math.abs(data.loiLo))}</div>
          </div>
        </div>

        ${data.byCategory.length > 0 ? `
        <!-- Chi theo danh mục -->
        <div class="section">
          <div class="section-title">Chi tiêu theo danh mục</div>
          <table>
            <thead>
              <tr>
                <th>Danh mục</th>
                <th style="text-align:right">Số tiền</th>
              </tr>
            </thead>
            <tbody>${categoryRows}</tbody>
          </table>
        </div>
        ` : ""}

        <!-- Chi tiết giao dịch -->
        <div class="section">
          <div class="section-title">Chi tiết giao dịch (${data.transactions.length} giao dịch)</div>
          <table>
            <thead>
              <tr>
                <th style="width:60px">Ngày</th>
                <th>Mô tả</th>
                <th style="width:110px">Danh mục</th>
                <th style="text-align:right;width:90px">Số tiền</th>
              </tr>
            </thead>
            <tbody>${txRows}</tbody>
          </table>
          ${data.transactions.length > 80 ? `<p style="font-size:11px;color:#94a3b8;margin-top:8px;text-align:center">* Hiển thị 80/${data.transactions.length} giao dịch gần nhất</p>` : ""}
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-brand">LedgerAI — Sổ kế toán thông minh</div>
          <div class="footer-note">Xuất ngày ${new Date().toLocaleDateString("vi-VN")}</div>
        </div>

      </div>
    </body>
    </html>
  `;
}

export async function exportReportPDF(data: ReportData) {
  // 1. Build HTML template
  const html = buildHTML(data);

  // 2. Create hidden iframe to render HTML with correct fonts
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:794px;border:none;opacity:0;pointer-events:none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument!;
  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // 3. Wait for fonts to load
  await new Promise(resolve => setTimeout(resolve, 400));

  try {
    // 4. html2canvas captures the iframe content with browser fonts
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,          // 2x for sharp text
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 794,
    });

    // 5. Build PDF from canvas image
    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.default ?? (jsPDFModule as any).jsPDF;

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const imgW = 210; // A4 width in mm
    const imgH = (canvas.height * imgW) / canvas.width;

    // Split into A4 pages if content is tall
    const pageH = 297; // A4 height in mm
    let position = 0;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.addImage(imgData, "JPEG", 0, position, imgW, imgH);

    while (imgH - Math.abs(position) > pageH) {
      position -= pageH;
      doc.addPage();
      doc.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    }

    // 6. Save
    const fileName = `LedgerAI_${data.shopName.replace(/\s/g, "_")}_${data.monthLabel.replace(/\s/g, "_")}.pdf`;
    doc.save(fileName);
  } finally {
    document.body.removeChild(iframe);
  }
}
