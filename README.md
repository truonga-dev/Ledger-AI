# 🧾 Ledger AI — Sổ Thu Chi Thông Minh

Ledger AI là ứng dụng quản lý tài chính cá nhân/cửa hàng nhỏ, tích hợp **trí tuệ nhân tạo đa tầng** giúp tự động đọc hóa đơn, phân loại thu chi và theo dõi dòng tiền theo thời gian thực.

> **Lưu ý:** Đây là hệ thống riêng tư (Private System), thiết kế cho mục đích cá nhân. Không chấp nhận Pull Requests từ bên ngoài.

---

## ✨ Tính Năng Nổi Bật

- **🤖 AI Đọc Hóa Đơn 3 Tầng Dự Phòng**
  - **Tầng 1 — Gemini 2.5 Flash** (Google): Nhanh nhất, đọc chữ Việt cực chính xác, Single-Pass (vừa đọc vừa phân loại trong 1 lần gọi).
  - **Tầng 2 — Llama 4 Maverick** (OpenRouter): Tự động kích hoạt khi Gemini quá tải.
  - **Tầng 3 — Groq Llama Vision** (Groq): Backup cuối cùng, siêu nhanh, không bao giờ bị gián đoạn.
  - Nếu Tầng 1 lỗi → Tầng 2 tự bật. Tầng 2 lỗi → Tầng 3 tự bật. **Người dùng không hề biết.**

- **📅 Trích Xuất Ngày Tháng Thông Minh:** AI tự đọc ngày trên hóa đơn và điền sẵn vào form. Nếu ngày hóa đơn quá xa trong quá khứ (> 1 năm), hệ thống tự dùng ngày hôm nay.

- **🔐 Xác Thực Bảo Mật Cao:** Supabase Auth với Email/Mật khẩu và Google OAuth. Cookie bảo mật, không lộ thông tin hệ thống.

- **📊 Báo Cáo Trực Quan:** Biểu đồ Thu/Chi theo tháng, tổng số dư, thống kê lợi nhuận, chuỗi ngày nhập liệu.

- **📱 Skeleton Loading & PWA:** Giao diện có hiệu ứng loading mượt mà, hỗ trợ cài đặt như ứng dụng native trên điện thoại.

- **✏️ Xác Nhận & Chỉnh Sửa Trước Khi Lưu:** Sau khi AI đọc xong, người dùng có thể xem lại, sửa mô tả, số tiền, số lượng, ngày tháng, loại và danh mục trước khi lưu vào database.

- **📥 Xuất Báo Cáo Excel:** Hỗ trợ xuất toàn bộ dữ liệu giao dịch hoặc lọc theo từng tháng ra file Excel (.xlsx) với định dạng chuẩn, làm nổi bật màu sắc thu/chi để dễ dàng đối soát.

- **🌓 Chế Độ Sáng/Tối (Dark Mode):** Cung cấp công tắc chuyển đổi giữa giao diện Sáng và Tối (hoặc theo hệ thống) để tăng trải nghiệm người dùng và bảo vệ mắt.

---

## 🛠️ Công Nghệ Sử Dụng

| Lớp | Công nghệ |
|-----|-----------|
| **Frontend** | Next.js (App Router), Vanilla CSS Modules, Recharts |
| **Backend/API** | Next.js Route Handlers |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Xác thực** | Supabase Auth SSR |
| **AI — Tầng 1** | Google Gemini 2.5 Flash |
| **AI — Tầng 2** | Llama 4 Maverick (OpenRouter) |
| **AI — Tầng 3** | Groq Llama 4 Scout Vision |
| **Lưu trữ ảnh** | Supabase Storage |

---

## 📂 Cấu Trúc Thư Mục

```
📦 Ledger-AI
 ┣ 📂 app
 ┃ ┣ 📂 api              # REST API (transactions, upload, user)
 ┃ ┣ 📂 dashboard        # Trang chính: Tổng quan, Giao dịch, Báo cáo, Hồ sơ
 ┃ ┗ 📂 login            # Đăng nhập / Đăng ký
 ┣ 📂 components         # UI Components (Charts, ConfirmForm, StatCard...)
 ┣ 📂 lib                # Clients (Supabase, Prisma, AI module)
 ┃ ┗ 📄 ai.ts            # Engine AI 3 tầng dự phòng
 ┣ 📂 prisma             # Database Schema
 ┗ 📜 package.json
```

---

## ⚙️ Cài Đặt Môi Trường (`.env`)

```env
# AI
GROQ_API_KEY=...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Database
DATABASE_URL=...
DIRECT_URL=...

# Next.js
NEXTAUTH_SECRET=...
```

---

## 🔒 Giấy Phép & Quyền Sở Hữu

Phần mềm thuộc quyền sở hữu cá nhân. Mọi hành vi sao chép, phân phối hoặc tái sử dụng mà không có sự cho phép đều bị nghiêm cấm.

---
*Developed by [truonga-dev](https://github.com/truonga-dev) | Private & Confidential*
