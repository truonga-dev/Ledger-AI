# 🧾 Ledger AI - Sổ Thu Chi Thông Minh 🚀

Ledger AI là một ứng dụng quản lý tài chính cá nhân và cửa hàng hiện đại, được tích hợp trí tuệ nhân tạo (AI) giúp tự động đọc, phân tích và phân loại các giao dịch từ ảnh chụp hóa đơn. 

Dự án mang đến trải nghiệm UI/UX mượt mà, chuyên nghiệp với hiệu ứng chuyển động đẳng cấp, kết hợp cùng sức mạnh của Next.js (App Router) và Supabase.

![Ledger AI Banner](https://via.placeholder.com/1200x600/4F46E5/FFFFFF?text=Ledger+AI+-+Smart+Finance+Management)

---

## ✨ Tính Năng Nổi Bật

- **🤖 Tích hợp AI (Groq Vision):** Chụp hoặc tải ảnh hóa đơn lên, AI sẽ tự động trích xuất mô tả, số tiền, phân loại Thu/Chi và gán danh mục chính xác chỉ trong vài giây.
- **🔐 Xác thực an toàn (Supabase Auth):** Hỗ trợ đăng nhập một chạm với Google và đăng nhập bằng Email/Mật khẩu truyền thống.
- **📊 Báo cáo trực quan:** Thống kê chi tiết doanh thu, chi phí, lợi nhuận theo từng tháng với biểu đồ và giao diện dashboard chuyên nghiệp.
- **⚡ Hiệu năng vượt trội:** Xây dựng với Next.js 14+ (App Router), Server Actions và tối ưu hóa SSR/CSR.
- **💅 Giao diện đẳng cấp:** Thiết kế responsive, tích hợp các hiệu ứng (Animations) hiện đại, tự động tương thích kích thước màn hình thiết bị di động và máy tính.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** [Next.js](https://nextjs.org/) (React), Vanilla CSS (Modules) cho hiệu ứng độc bản.
- **Backend/API:** Next.js Route Handlers & Server Actions.
- **Cơ sở dữ liệu:** [PostgreSQL](https://www.postgresql.org/) lưu trữ trên [Supabase](https://supabase.com/).
- **ORM:** [Prisma](https://www.prisma.io/).
- **Xác thực:** Supabase Auth (SSR `@supabase/ssr`).
- **AI / LLM:** [Groq API](https://groq.com/) (Mô hình Vision).
- **Lưu trữ ảnh:** Supabase Storage.

---

## 🚀 Hướng Dẫn Cài Đặt (Local Development)

### 1. Yêu cầu hệ thống
- Node.js (phiên bản 18+).
- Một tài khoản Supabase.
- Một tài khoản Groq Cloud (để lấy API Key).

### 2. Clone mã nguồn
```bash
git clone https://github.com/truonga-dev/Ledger-AI.git
cd Ledger-AI
```

### 3. Cài đặt thư viện (Dependencies)
```bash
npm install
# hoặc
yarn install
```

### 4. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc của dự án và điền các thông số sau:

```env
# URL của Supabase Project
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cơ sở dữ liệu (PostgreSQL) từ Supabase
# DATABASE_URL dùng cổng pooler (6543)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# DIRECT_URL dùng cổng mặc định (5432) cho lệnh prisma db push
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Domain của ứng dụng (dùng cho Auth Redirect)
NEXTAUTH_URL=http://localhost:3000

# Groq API Key cho tính năng AI đọc hóa đơn
GROQ_API_KEY=your_groq_api_key
```

### 5. Khởi tạo Cơ sở dữ liệu (Prisma)
Đẩy cấu trúc schema lên cơ sở dữ liệu Supabase:
```bash
npx prisma db push
```

*(Tùy chọn)* Tạo dữ liệu mẫu (Seed) để test:
```bash
npx tsx seed.ts
```

### 6. Khởi chạy ứng dụng
```bash
npm run dev
```
Mở trình duyệt và truy cập `http://localhost:3000`.

---

## 📂 Cấu Trúc Thư Mục Chính

```
📦 Ledger-AI
 ┣ 📂 app               # Chứa toàn bộ các route và pages của Next.js App Router
 ┃ ┣ 📂 api             # Các RESTful API nội bộ (transactions, user, upload)
 ┃ ┣ 📂 auth            # Route callback để xử lý Supabase OAuth 
 ┃ ┣ 📂 dashboard       # Giao diện trang quản lý và biểu đồ
 ┃ ┣ 📂 login           # Giao diện đăng nhập/đăng ký
 ┃ ┗ 📂 update-password # Giao diện cập nhật mật khẩu
 ┣ 📂 components        # Chứa các UI Components tái sử dụng được (Biểu đồ, Form, Icons)
 ┣ 📂 lib               # Chứa cấu hình và hàm tiện ích
 ┃ ┣ 📜 auth.ts         # Logic xử lý User Session
 ┃ ┣ 📜 groq.ts         # Cấu hình kết nối và xử lý Groq AI
 ┃ ┣ 📜 prisma.ts       # Cấu hình kết nối Prisma (Postgres Adapter)
 ┃ ┗ 📂 supabase        # Cấu hình Client/Server Supabase Auth
 ┣ 📂 prisma            # Chứa file cấu hình Database (schema.prisma)
 ┗ 📜 package.json      # File cấu hình dependencies
```

---

## 🤝 Đóng Góp (Contributing)
Mọi ý tưởng đóng góp (Pull Requests) hoặc báo lỗi (Issues) đều luôn được chào đón để giúp ứng dụng hoàn thiện hơn. Cảm ơn bạn! 

## 📝 Giấy phép (License)
Dự án được phân phối dưới giấy phép MIT License.

---
*Phát triển bởi [truonga-dev](https://github.com/truonga-dev)*
