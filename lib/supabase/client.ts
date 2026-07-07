import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        secure: false,
        domain: '', // Tránh lỗi set cookie trên địa chỉ IP nội bộ
        sameSite: 'lax',
      }
    }
  );
}
