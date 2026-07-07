import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Sử dụng service role key (nếu có) hoặc thử dùng anon key
// Trong dự án Next.js, nếu không có SERVICE_ROLE, ta tạm bỏ qua
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log("Checking if 'receipts' bucket exists...");
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error("Lỗi khi lấy danh sách bucket:", listError);
    return;
  }

  const exists = buckets.some(b => b.name === "receipts");
  if (exists) {
    console.log("✅ Bucket 'receipts' đã tồn tại.");
    return;
  }

  console.log("Creating 'receipts' bucket...");
  const { data, error } = await supabase.storage.createBucket("receipts", {
    public: true, // Để load ảnh profile public
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  });

  if (error) {
    console.error("❌ Không thể tạo bucket tự động (Có thể cần Service_Role_Key). Lỗi:", error.message);
    console.log("👉 HƯỚNG DẪN: Bạn cần vào trang quản trị Supabase -> Storage -> Bấm 'New bucket' -> Đặt tên là 'receipts' và bật nút 'Public bucket'.");
  } else {
    console.log("✅ Tạo bucket 'receipts' thành công!", data);
  }
}

createBucket();
