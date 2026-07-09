/**
 * Script test Groq API — chạy: node scripts/test-groq.mjs
 * Test OCR với ảnh hóa đơn mẫu trước khi build UI
 */

import Groq from "groq-sdk";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Load biến môi trường từ .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const [key, ...valueParts] = line.split("=");
    if (key && !key.startsWith("#") && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  }
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Test ảnh mẫu (có thể thay bằng URL thật) ────────────────────────────────
// Dùng ảnh base64 từ file local hoặc URL public
const TEST_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Receipt_2009-10-26.jpg/800px-Receipt_2009-10-26.jpg";

async function testOcr() {
  console.log("🔍 Test 1: OCR ảnh hóa đơn...\n");

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "system",
          content: `Bạn là một trợ lý đọc hóa đơn. Quy tắc đọc số tiền Việt Nam:
- "k" hoặc "K" = nghìn đồng
- "tr" hoặc "triệu" = triệu đồng
Chuẩn hóa tất cả amounts về đơn vị đồng (VND).
Trả về JSON: { "items": [{ "description": "...", "amount": 0, "date": null }], "confidence": 0.9 }
CHỈ trả về JSON.`,
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: TEST_IMAGE_URL } },
            { type: "text", text: "Đọc và trích xuất tất cả khoản mục từ ảnh này." },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0]?.message?.content ?? "{}");
    console.log("✅ OCR kết quả:");
    console.log(JSON.stringify(result, null, 2));
    console.log(`\n📊 Tokens dùng: ${response.usage?.total_tokens ?? "N/A"}`);
    return result.items ?? [];
  } catch (err) {
    console.error("❌ OCR lỗi:", err.message);
    return [];
  }
}

async function testClassify(items) {
  if (items.length === 0) {
    console.log("\n⚠️  Không có items để phân loại (dùng items mẫu)\n");
    items = [
      { description: "Mua hàng tạp hóa", amount: 500000, date: null },
      { description: "Tiền bán hàng sáng", amount: 1200000, date: null },
      { description: "Tiền điện tháng 6", amount: 350000, date: null },
    ];
  }

  console.log("\n🏷️  Test 2: Phân loại THU/CHI...\n");

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Phân loại từng khoản là THU hoặc CHI, gán danh mục.
Danh mục CHI: "Tiền hàng", "Điện nước", "Lương nhân viên", "Thuê mặt bằng", "Vận chuyển", "Khác - Chi"
Danh mục THU: "Bán hàng", "Dịch vụ", "Khác - Thu"
Trả về JSON array: [{"description","amount","date","type":"CHI","category":"..."}]`,
        },
        {
          role: "user",
          content: `Phân loại: ${JSON.stringify(items)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = JSON.parse(response.choices[0]?.message?.content ?? "{}");
    const result = Array.isArray(raw) ? raw : (raw.items ?? raw.data ?? []);
    console.log("✅ Phân loại kết quả:");
    console.log(JSON.stringify(result, null, 2));
    console.log(`\n📊 Tokens dùng: ${response.usage?.total_tokens ?? "N/A"}`);
  } catch (err) {
    console.error("❌ Phân loại lỗi:", err.message);
  }
}

// ─── Run tests ────────────────────────────────────────────────────────────────
console.log("═══════════════════════════════════════");
console.log("  LedgerAI — Test Groq API");
console.log("═══════════════════════════════════════\n");

if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
  console.error("❌ GROQ_API_KEY chưa được cấu hình trong .env.local");
  console.log("   Thêm: GROQ_API_KEY=gsk_...");
  process.exit(1);
}

const items = await testOcr();
await testClassify(items);

console.log("\n═══════════════════════════════════════");
console.log("  Test hoàn tất!");
console.log("═══════════════════════════════════════");
