import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getUserSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra auth
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Không có ảnh" }, { status: 400 });
    }

    // Upload ảnh lên Supabase Storage, dùng bucket receipts hiện tại để tiết kiệm setup
    const adminClient = createSupabaseAdminClient();
    const fileName = `profiles/${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await adminClient.storage
      .from("receipts")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload ảnh thất bại" }, { status: 500 });
    }

    // Lấy public URL
    const { data: { publicUrl } } = adminClient.storage
      .from("receipts")
      .getPublicUrl(fileName);

    return NextResponse.json({ imageUrl: publicUrl });
  } catch (err: any) {
    console.error("Upload profile image route error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
