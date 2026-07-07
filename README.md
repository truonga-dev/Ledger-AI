# 🧾 Ledger AI - Personal Finance & Business Intelligence 🚀

Ledger AI là một hệ thống quản lý tài chính và sổ sách cá nhân/cửa hàng chuyên nghiệp, được phát triển nội bộ để tối ưu hóa việc theo dõi thu chi. Dự án được tích hợp trí tuệ nhân tạo (AI) tiên tiến giúp tự động nhận diện, phân tích và phân loại các giao dịch từ hình ảnh hóa đơn.

> **Lưu ý:** Đây là một hệ thống riêng tư (Private System), được thiết kế và tối ưu hóa đặc quyền dành cho mục đích cá nhân. Không chấp nhận các yêu cầu đóng góp mã nguồn (Pull Requests) bên ngoài.

---

## ✨ Tính Năng Cốt Lõi

- **🤖 Tích Hợp AI (Groq Vision):** AI tự động trích xuất thông tin hóa đơn (mô tả, số tiền, phân loại Thu/Chi, danh mục) chỉ trong vài giây thông qua xử lý ảnh.
- **🔐 Bảo Mật Cao Cấp (Supabase Auth):** Xác thực an toàn tuyệt đối với hệ thống quản lý JWT và session bảo mật (Email/Mật khẩu hoặc Google OAuth).
- **📊 Báo Cáo Trực Quan:** Hệ thống biểu đồ thống kê chuyên sâu, theo dõi doanh thu, chi phí và lợi nhuận thời gian thực.
- **⚡ Hiệu Năng Vượt Trội:** Tận dụng tối đa sức mạnh của Next.js 14+ (App Router) với Server Actions, đảm bảo trải nghiệm SSR/CSR mượt mà nhất.
- **💅 Giao Diện Masterpiece:** Thiết kế giao diện mang hơi hướng tương lai (Deep Dark Mode & Glassmorphism), tối ưu UI/UX trên mọi thiết bị.

---

## 🛠️ Nền Tảng Công Nghệ

Hệ thống được xây dựng trên một ngăn xếp (stack) công nghệ hiện đại và mạnh mẽ nhất:

- **Frontend:** [Next.js](https://nextjs.org/) (React), Vanilla CSS (Modules) với hiệu ứng animation độc bản.
- **Backend/API:** Next.js Route Handlers & Server Actions.
- **Cơ Sở Dữ Liệu:** [PostgreSQL](https://www.postgresql.org/) lưu trữ phân tán trên nền tảng [Supabase](https://supabase.com/).
- **ORM:** [Prisma](https://www.prisma.io/).
- **Xác Thực (Authentication):** Supabase Auth SSR.
- **AI / LLM:** [Groq API](https://groq.com/) (Mô hình Vision siêu tốc độ).
- **Lưu Trữ Đám Mây:** Supabase Storage cho dữ liệu hình ảnh, hóa đơn.

---

## 📂 Cấu Trúc Hệ Thống Chính

```
📦 Ledger-AI
 ┣ 📂 app               # Chứa các Server Components & Routing của Next.js
 ┃ ┣ 📂 api             # RESTful API nội bộ (transactions, user, upload)
 ┃ ┣ 📂 auth            # Logic xử lý callback OAuth (Supabase)
 ┃ ┣ 📂 dashboard       # Core Dashboard: Thống kê, Quản lý giao dịch, Biểu đồ
 ┃ ┣ 📂 login           # Module xác thực & đăng ký (Dark Theme)
 ┃ ┗ 📂 update-password # Khôi phục & cập nhật mật khẩu an toàn
 ┣ 📂 components        # Thư viện UI Components dùng chung (Cards, Charts, Icons)
 ┣ 📂 lib               # Lớp trừu tượng cho các dịch vụ bên thứ ba (Prisma, Supabase, Groq)
 ┣ 📂 prisma            # Cấu trúc Database Schema
 ┗ 📜 package.json      # Quản lý thư viện hệ thống
```

---

## 🔒 Giấy Phép & Quyền Sở Hữu

Đây là phần mềm thuộc quyền sở hữu cá nhân. Mọi hành vi sao chép, phân phối hoặc tái sử dụng mã nguồn mà không có sự cho phép đều bị nghiêm cấm. 

---
*Developed by [truonga-dev](https://github.com/truonga-dev) | Private & Confidential*
