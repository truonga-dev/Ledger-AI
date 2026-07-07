import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getUserSession } from "@/lib/auth";
import { processReceiptImage } from "@/lib/groq";

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

    // Kiểm tra kích thước file (tối đa 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Ảnh quá lớn, tối đa 10MB" }, { status: 400 });
    }

    // Upload ảnh lên Supabase Storage
    const adminClient = createSupabaseAdminClient();
    const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
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

    // Gọi Groq AI pipeline
    const { ocrResult, classifiedItems } = await processReceiptImage(publicUrl);

    return NextResponse.json({
      imageUrl: publicUrl,
      confidence: ocrResult.confidence,
      items: classifiedItems,
    });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: err.message ?? "Lỗi server" },
      { status: 500 }
    );
  }
}
