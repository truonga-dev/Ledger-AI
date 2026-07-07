import Groq from "groq-sdk";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OcrItem {
  description: string;
  amount: number; // Đơn vị: VND (đồng)
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

// ─── Groq Client ─────────────────────────────────────────────────────────────

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Prompt Templates ─────────────────────────────────────────────────────────

const OCR_SYSTEM_PROMPT = `Bạn là một trợ lý đọc hóa đơn và sổ ghi chép cho hộ kinh doanh nhỏ tại Việt Nam.
Nhiệm vụ: Đọc kỹ ảnh hóa đơn hoặc ghi chú viết tay, trích xuất TẤT CẢ các khoản mục có số tiền.

Quy tắc đọc số tiền Việt Nam:
- "k" hoặc "K" = nghìn đồng (50k = 50,000 đồng)
- "tr" hoặc "triệu" = triệu đồng (2tr = 2,000,000 đồng)
- "đ" hoặc không có đơn vị = đồng
- Chuẩn hóa TẤT CẢ amounts về đơn vị đồng (VND số nguyên)

Trả về JSON theo format sau, KHÔNG thêm giải thích:
{
  "items": [
    {
      "description": "Mô tả khoản mục (giữ nguyên chữ gốc từ ảnh)",
      "amount": 50000,
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

Trả về JSON sau, KHÔNG thêm giải thích:
[
  {
    "description": "...",
    "amount": 0,
    "date": "...",
    "type": "CHI",
    "category": "Tiền hàng"
  }
]`;

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Bước 1: Dùng Groq Vision (Llama 4 Scout) để OCR ảnh hóa đơn
 */
export async function extractFromImage(imageUrl: string): Promise<OcrResult> {
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content: OCR_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
          {
            type: "text",
            text: "Đọc và trích xuất tất cả khoản mục từ ảnh này.",
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1, // Giữ thấp để kết quả ổn định
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq trả về kết quả rỗng");
  }

  try {
    const parsed = JSON.parse(content) as OcrResult;
    // Validate cơ bản
    if (!Array.isArray(parsed.items)) {
      throw new Error("Format JSON không hợp lệ: thiếu items");
    }
    return parsed;
  } catch {
    throw new Error(`Không parse được JSON từ Groq: ${content}`);
  }
}

/**
 * Bước 2: Dùng Llama 3.3 70B để phân loại THU/CHI và gán danh mục
 */
export async function classifyItems(items: OcrItem[]): Promise<ClassifiedItem[]> {
  if (items.length === 0) return [];

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: CLASSIFY_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Phân loại các khoản mục sau:\n${JSON.stringify(items, null, 2)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq phân loại trả về kết quả rỗng");
  }

  try {
    const parsed = JSON.parse(content);
    // Groq có thể trả về object bọc array
    const result = Array.isArray(parsed) ? parsed : (parsed.items ?? parsed.data ?? []);
    return result as ClassifiedItem[];
  } catch {
    throw new Error(`Không parse được JSON phân loại: ${content}`);
  }
}

/**
 * Pipeline đầy đủ: ảnh → OCR → phân loại
 */
export async function processReceiptImage(imageUrl: string): Promise<{
  ocrResult: OcrResult;
  classifiedItems: ClassifiedItem[];
}> {
  // Bước 1: OCR
  const ocrResult = await extractFromImage(imageUrl);

  // Bước 2: Phân loại
  const classifiedItems = await classifyItems(ocrResult.items);

  return { ocrResult, classifiedItems };
}
