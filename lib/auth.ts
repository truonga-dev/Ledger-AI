import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getUserSession() {
  const supabase = await createSupabaseServerClient();
  let { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  // Dev bypass chỉ hoạt động ở môi trường development
  const isDev = process.env.NODE_ENV === "development";
  const hasDevBypass = isDev && cookieStore.get("dev_bypass")?.value === "1";
  
  if (!user && hasDevBypass) {
    user = { email: "test@ledger.ai" } as any;
  }

  return user;
}
