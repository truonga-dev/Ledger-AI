# 🚀 LedgerAI v2 — Kế hoạch nâng cấp

> Tài liệu này ghi lại toàn bộ cải tiến dự kiến cho phiên bản v2, dựa trên các điểm yếu đã phân tích ở v1.

---

## 🤖 1. Nâng cấp AI — Tăng độ chính xác OCR

### 1.1 Pipeline 2 tầng: Vision OCR + LLM
Thay vì dùng Llama Vision trực tiếp làm OCR, tách thành 2 bước:

```
Ảnh → [Google Cloud Vision / Tesseract OCR] → Text thô
Text thô → [Llama 3.3 70B] → JSON có cấu trúc
```

- **Lý do**: Google Vision OCR độ chính xác tiếng Việt ~95–98%, tốt hơn hẳn Vision LLM
- **Chi phí**: Google Vision API ~$1.50/1000 ảnh (rất rẻ)

### 1.2 Thêm fallback model
```
Groq (llama-4-scout) → nếu confidence < 0.6 → retry với GPT-4o mini
```

### 1.3 Fine-tune prompt với few-shot examples
Thêm 5–10 ví dụ hóa đơn Việt Nam thực tế vào system prompt để model hiểu pattern hơn.

### 1.4 Lưu `rawOcrText` vào DB
Field `rawOcrText` đã có trong schema nhưng chưa được dùng — lưu lại để debug và cải thiện prompt theo thời gian.

---

## ⚡ 2. Hiệu năng & Scale

### 2.1 Thay `allTx` dashboard bằng Prisma aggregate
```ts
// ❌ v1: Fetch toàn bộ → tính JS
const allTx = await prisma.transaction.findMany(...)
const balance = allTx.reduce(...)

// ✅ v2: Tính thẳng ở DB
const agg = await prisma.transaction.aggregate({
  _sum: { amount: true },
  where: { userId, type: "THU" }
})
```
Tiết kiệm ~80% thời gian query khi user có >500 giao dịch.

### 2.2 Pagination cho danh sách giao dịch
Thay `take: 200` bằng infinite scroll hoặc load-more.

### 2.3 Cache dashboard với Next.js `revalidate`
```ts
export const revalidate = 60; // Cache 60 giây
```
Giảm số lần query DB khi refresh liên tục.

---

## 🔒 3. Bảo mật nâng cao

### 3.1 Rate Limiting cho Upload API
```ts
// Dùng Upstash Redis + @upstash/ratelimit
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 ảnh/giờ/user
});
```

### 3.2 Validate file type thật sự (magic bytes)
Hiện tại chỉ check `file.type` (dễ giả mạo). v2 cần đọc magic bytes:
```ts
// PNG: 89 50 4E 47 | JPEG: FF D8 FF
const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
```

### 3.3 Content Security Policy (CSP) headers
Thêm vào `next.config.ts` để chống XSS.

---

## ✨ 4. Tính năng mới

### 4.1 Xuất báo cáo Excel (`.xlsx`)
Bên cạnh PDF, thêm export Excel — phổ biến hơn với chủ hộ kinh doanh.
Dùng thư viện: `xlsx` (SheetJS)

### 4.2 Nhắc nhở ghi chép hàng ngày (Push Notification)
- Dùng Web Push API (PWA đã sẵn sàng)
- Nhắc lúc 9pm nếu hôm đó chưa có giao dịch nào

### 4.3 Thống kê xu hướng (Trend Analysis)
- So sánh thu/chi tháng này vs cùng kỳ năm ngoái
- Dự báo chi tiêu tháng tới dựa trên lịch sử

### 4.4 Nhiều hóa đơn trong 1 lần chụp
Cho phép upload nhiều ảnh cùng lúc → xử lý song song.

### 4.5 Tìm kiếm giao dịch
Search bar tìm theo mô tả, số tiền, ngày, danh mục.

### 4.6 Chia sẻ báo cáo qua link
Tạo link public tạm thời để chia sẻ báo cáo tháng với kế toán.

---

## 📱 5. PWA nâng cao

### 5.1 Offline mode
- Service Worker cache các trang đã xem
- Queue giao dịch nhập tay khi offline → sync khi có mạng

### 5.2 Install prompt chủ động
Gọi `beforeinstallprompt` để hiển thị banner cài đặt đẹp thay vì chờ trình duyệt tự quyết.

---

## 🧹 6. Code Quality

### 6.1 Zod validation cho tất cả API routes
### 6.2 `error.tsx` error boundary cho từng route segment
### 6.3 Unit tests với `vitest` cho `lib/groq.ts` và `lib/pdf.ts`

---

## 📅 Thứ tự ưu tiên

| Priority | Tính năng | Effort |
|----------|-----------|--------|
| 🔴 Cao | Rate limiting upload API | 2h |
| 🔴 Cao | Prisma aggregate thay allTx | 1h |
| 🔴 Cao | Zod validation API routes | 3h |
| 🟠 Trung | Google Vision OCR pipeline | 1 ngày |
| 🟠 Trung | Pagination giao dịch | 4h |
| 🟠 Trung | Export Excel | 3h |
| 🟡 Thấp | Push notification | 1 ngày |
| 🟡 Thấp | Offline mode | 2 ngày |
| 🟡 Thấp | Tìm kiếm giao dịch | 4h |
