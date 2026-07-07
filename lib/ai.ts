import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OcrItem {
  description: string;
  amount: number; // Đơn vị: VND (đồng)
  quantity: number; // Số lượng
  date: string | null; // "YYYY-MM-DD" hoặc null nếu không thấy
}

export interface OcrResult {
  items: OcrItem[];
  confidence: number; // 0.0 - 1.0
}

export interface ClassifiedItem extends OcrItem {
  type: "THU" | "CHI";
  category: string;
}

export interface SinglePassResult {
  items: ClassifiedItem[];
  confidence: number;
}

// ─── Clients ─────────────────────────────────────────────────────────────

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ─── Prompt Templates ─────────────────────────────────────────────────────────

// Prompt cho Groq (2 bước)
const OCR_SYSTEM_PROMPT = `Bạn là một trợ lý đọc hóa đơn và sổ ghi chép cho hộ kinh doanh nhỏ tại Việt Nam.
Nhiệm vụ: Đọc kỹ ảnh hóa đơn hoặc ghi chú viết tay, trích xuất TẤT CẢ các khoản mục có số tiền và số lượng.

Quy tắc đọc số tiền Việt Nam:
- "k" hoặc "K" = nghìn đồng (50k = 50,000 đồng)
- "tr" hoặc "triệu" = triệu đồng (2tr = 2,000,000 đồng)
- "đ" hoặc không có đơn vị = đồng
- Chuẩn hóa TẤT CẢ amounts về đơn vị đồng (VND số nguyên)

Trường quantity (số lượng):
- Nếu hóa đơn có ghi rõ số lượng (vd: x2, 3 cái, 5kg), hãy trích xuất vào trường quantity.
- Nếu không ghi rõ, mặc định quantity là 1.

Trả về JSON theo format sau, KHÔNG thêm giải thích:
{
  "items": [
    {
      "description": "Mô tả khoản mục (giữ nguyên chữ gốc từ ảnh)",
      "amount": 50000,
      "quantity": 2,
      "date": "2024-01-15 hoặc null nếu không có ngày trong ảnh"
    }
  ],
  "confidence": 0.85
}

Lưu ý:
- Nếu chữ viết tay khó đọc, vẫn cố đoán nhưng giảm confidence
- Nếu ảnh có nhiều dòng, trích xuất từng dòng thành item riêng
- confidence = 1.0 nếu chắc chắn, < 0.5 nếu rất khó đọc`;

const CLASSIFY_SYSTEM_PROMPT = `Bạn là trợ lý kế toán cho hộ kinh doanh nhỏ Việt Nam.
Nhiệm vụ: Phân loại từng khoản mục là THU (tiền vào) hay CHI (tiền ra), và gán danh mục phù hợp.

Danh mục CHI: "Tiền hàng", "Điện nước", "Lương nhân viên", "Thuê mặt bằng", "Vận chuyển", "Ăn uống", "Khác - Chi"
Danh mục THU: "Bán hàng", "Dịch vụ", "Khác - Thu"

Hướng dẫn phân loại:
- Mua hàng nhập kho, hàng hoá → CHI / "Tiền hàng"
- Tiền bán hàng, doanh thu → THU / "Bán hàng"  
- Điện, nước, internet → CHI / "Điện nước"
- Trả lương, thưởng nhân viên → CHI / "Lương nhân viên"
- Tiền thuê nhà, mặt bằng → CHI / "Thuê mặt bằng"
- Ship hàng, vận chuyển → CHI / "Vận chuyển"
- Không xác định được → CHI/THU + "Khác - Chi" hoặc "Khác - Thu"

Trả về mảng JSON sau, KHÔNG bọc trong object, KHÔNG thêm giải thích:
[
  {
    "description": "...",
    "amount": 0,
    "quantity": 1,
    "date": "...",
    "type": "CHI",
    "category": "Tiền hàng"
  }
]`;

// Prompt Single-Pass cho Gemini (vừa đọc OCR, vừa phân loại)
const GEMINI_SINGLE_PASS_PROMPT = `Bạn là một chuyên gia kế toán và đọc hóa đơn tại Việt Nam.
Nhiệm vụ: Đọc ảnh hóa đơn/ghi chú, trích xuất CÁC KHOẢN MỤC và PHÂN LOẠI chúng ngay lập tức (THU hay CHI).

Quy tắc đọc số tiền:
- "k" = nghìn đồng, "tr" = triệu đồng. Chuẩn hóa về VND (vd: 50k -> 50000).
- Nếu không ghi số lượng, mặc định quantity = 1.

Quy tắc trích xuất NGÀY THÁNG (CỰC KỲ QUAN TRỌNG):
- Tìm ngày tháng trên hóa đơn (dạng: 16/11/2014, 2014-11-16, ngày 16 tháng 11, ...).
- Chuyển về định dạng "YYYY-MM-DD" và đặt vào trường "date".
- Nếu không tìm thấy ngày, đặt "date": null.
- ⚠️ TUYỆT ĐỐI KHÔNG đưa ngày tháng vào trường "description". Description chỉ chứa tên hàng hóa/dịch vụ.

Quy tắc phân loại danh mục:
- CHI: "Tiền hàng", "Điện nước", "Lương nhân viên", "Thuê mặt bằng", "Vận chuyển", "Ăn uống", "Khác - Chi"
- THU: "Bán hàng", "Dịch vụ", "Khác - Thu"
*(Mua hàng/nhập kho -> Tiền hàng; Bán hàng -> Bán hàng; Lương -> Lương nhân viên; Ship -> Vận chuyển)*

Trả về JSON ĐÚNG FORMAT sau, KHÔNG thêm text hay markdown:
{
  "items": [
    {
      "description": "Tên hàng hóa/dịch vụ (KHÔNG chứa ngày tháng)",
      "amount": 50000,
      "quantity": 1,
      "date": "2014-11-16",
      "type": "CHI",
      "category": "Tiền hàng"
    }
  ],
  "confidence": 0.9
}`;

// Prompt xử lý Văn bản (Chat)
const TEXT_TRANSACTION_PROMPT = `Bạn là trợ lý kế toán AI cho hộ kinh doanh tại Việt Nam.
Nhiệm vụ: Phân tích đoạn chat nhập liệu của người dùng, bóc tách thành các giao dịch riêng biệt.

Quy tắc đọc số tiền:
- "k" = nghìn đồng (50k = 50,000 đồng)
- "tr" = triệu đồng (2tr = 2,000,000 đồng)
- Mặc định là VND (số nguyên).

Quy tắc phân loại (THU / CHI):
- Mua hàng, trả tiền, đóng tiền, nộp phí -> CHI
- Bán hàng, nhận tiền, khách trả, thu -> THU
- Danh mục CHI: "Tiền hàng", "Điện nước", "Lương nhân viên", "Thuê mặt bằng", "Vận chuyển", "Ăn uống", "Khác - Chi"
- Danh mục THU: "Bán hàng", "Dịch vụ", "Khác - Thu"

Trả về JSON đúng format sau, KHÔNG thêm text giải thích:
{
  "items": [
    {
      "description": "Tên món hàng/dịch vụ",
      "amount": 100000,
      "quantity": 1,
      "type": "THU",
      "category": "Bán hàng"
    }
  ]
}
`;

// ─── Helpers ─────────────────────────────────────────────────────────────

async function urlToGenerativePart(url: string, mimeType: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString("base64"),
      mimeType
    },
  };
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Gemini: Single-Pass OCR & Classify (Siêu nhanh)
 */
async function processAllInOneGemini(imageUrl: string): Promise<SinglePassResult> {
  if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    }
  });
  
  const mimeType = imageUrl.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  const imagePart = await urlToGenerativePart(imageUrl, mimeType);

  const result = await model.generateContent([
    GEMINI_SINGLE_PASS_PROMPT,
    imagePart
  ]);

  const responseText = result.response.text();
  try {
    const parsed = JSON.parse(responseText) as SinglePassResult;
    if (!Array.isArray(parsed.items)) {
      throw new Error("Format JSON không hợp lệ: thiếu items");
    }
    return parsed;
  } catch (e) {
    throw new Error(`Không parse được JSON từ Gemini: ${responseText}`);
  }
}

/**
 * Llama 4 Maverick via OpenRouter: Single-Pass (Fallback 1)
 */
async function processAllInOneOpenRouter(imageUrl: string): Promise<SinglePassResult> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("Missing OPENROUTER_API_KEY");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ledgerai.vercel.app",
      "X-Title": "LedgerAI",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.2-90b-vision-instruct:free",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: GEMINI_SINGLE_PASS_PROMPT },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Qwen API lỗi ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Qwen trả về kết quả rỗng");

  // Xử lý chuỗi JSON có thể bị bọc trong markdown code block
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as SinglePassResult;
    if (!Array.isArray(parsed.items)) throw new Error("Format JSON thiếu items");
    return parsed;
  } catch {
    throw new Error(`Không parse được JSON từ Qwen: ${content}`);
  }
}

/**
 * Groq OCR (Fallback 2)
 */
async function extractFromImageGroq(imageUrl: string): Promise<OcrResult> {
  const response = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview",
    messages: [
      { role: "system", content: OCR_SYSTEM_PROMPT },
      { role: "user", content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: "Đọc và trích xuất tất cả khoản mục từ ảnh này." },
      ]},
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Groq trả về kết quả rỗng");
  try {
    const parsed = JSON.parse(content) as OcrResult;
    if (!Array.isArray(parsed.items)) throw new Error("Format JSON thiếu items");
    return parsed;
  } catch {
    throw new Error(`Không parse được JSON từ Groq: ${content}`);
  }
}

/**
 * Groq Classify (Fallback 2b)
 */
async function classifyItemsGroq(items: OcrItem[]): Promise<ClassifiedItem[]> {
  if (items.length === 0) return [];
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
      { role: "user", content: `Phân loại các khoản mục sau:\n${JSON.stringify(items, null, 2)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Groq phân loại trả về kết quả rỗng");
  try {
    const parsed = JSON.parse(content);
    const result = Array.isArray(parsed) ? parsed : (parsed.items ?? parsed.data ?? []);
    return result as ClassifiedItem[];
  } catch {
    throw new Error(`Không parse được JSON phân loại từ Groq: ${content}`);
  }
}

/**
 * Pipeline đầy đủ: ảnh → Phân loại
 */
export async function processReceiptImage(imageUrl: string): Promise<{
  ocrResult: OcrResult;
  classifiedItems: ClassifiedItem[];
}> {
  // Tầng 1: Gemini 2.5 Flash (Nhanh nhất)
  try {
    console.log("[AI] Tầng 1: Thử Gemini 2.5 Flash...");
    const { items, confidence } = await processAllInOneGemini(imageUrl);
    console.log("[AI] ✅ Gemini 2.5 Flash thành công!");
    return { ocrResult: { items, confidence }, classifiedItems: items };
  } catch (geminiError) {
    console.warn("[AI] ⚠️ Gemini thất bại. Chuyển sang Tầng 2: Qwen2.5-VL...", (geminiError as Error).message);
  }

  // Tầng 2: Llama 4 Maverick via OpenRouter (Vision mạnh, miễn phí)
  try {
    console.log("[AI] Tầng 2: Thử Llama 4 Maverick qua OpenRouter...");
    const { items, confidence } = await processAllInOneOpenRouter(imageUrl);
    console.log("[AI] ✅ Llama 4 Maverick thành công!");
    return { ocrResult: { items, confidence }, classifiedItems: items };
  } catch (openRouterError) {
    console.warn("[AI] ⚠️ OpenRouter thất bại. Chuyển sang Tầng 3: Groq Llama...", (openRouterError as Error).message);
  }

  // Tầng 3: Groq Llama (Backup cuối cùng)
  console.log("[AI] Tầng 3: Thử Groq Llama Vision...");
  const ocrResult = await extractFromImageGroq(imageUrl);
  console.log("[AI] ✅ Groq OCR thành công!");
  const classifiedItems = await classifyItemsGroq(ocrResult.items);
  console.log("[AI] ✅ Groq Phân loại thành công!");
  return { ocrResult, classifiedItems };
}

/**
 * Xử lý văn bản (Chat) thành danh sách giao dịch
 */
export async function processTextToTransactions(text: string, shopType: string): Promise<SinglePassResult> {
  console.log("[AI] Xử lý Chat Text (ShopType: " + shopType + "): " + text);
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: TEXT_TRANSACTION_PROMPT + "\nLoại hình kinh doanh hiện tại: " + shopType },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" }, // Hoặc có thể yêu cầu JSON array nhưng llama thích JSON object hơn, ta sẽ bọc lại
      temperature: 0.1,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "";
    let items: ClassifiedItem[] = [];
    try {
      const parsed = JSON.parse(content);
      items = Array.isArray(parsed) ? parsed : (parsed.items ?? parsed.data ?? []);
    } catch {
      // Thử dùng regex trích xuất mảng JSON nếu groq không trả về chuẩn
      const match = content.match(/\\[[\\s\\S]*\\]/);
      if (match) {
        items = JSON.parse(match[0]);
      } else {
        throw new Error("Không tìm thấy JSON hợp lệ trong câu trả lời.");
      }
    }

    // Gán date mặc định cho các items vì chat không có ảnh
    const formattedItems = items.map((i) => ({
      ...i,
      date: i.date || new Date().toISOString().split("T")[0],
    }));

    return {
      items: formattedItems,
      confidence: 0.95, // Text processing thường độ chính xác cao
    };
  } catch (error) {
    console.error("[AI] Lỗi khi xử lý văn bản:", error);
    throw error;
  }
}
