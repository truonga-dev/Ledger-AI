import { redirect } from "next/navigation";

// Trang gốc "/" — middleware sẽ redirect dựa trên auth status
// Nếu middleware không xử lý kịp, redirect về login
export default function RootPage() {
  redirect("/login");
}
