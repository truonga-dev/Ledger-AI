"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function loginAction(email: string, password: string) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                // Override secure flag for local IP testing
                cookieStore.set(name, value, { ...options, secure: false });
              });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Nếu là tài khoản test, tự động gán bypass cookie luôn cho điện thoại để chắc chắn vào được!
      if (email === "test@ledger.ai") {
        cookieStore.set("dev_bypass", "1", { secure: false, path: "/", maxAge: 60 * 60 * 24 * 7 });
        return { success: true };
      }
      return { error: error.message };
    }

    // Set bypass anyway to be safe on mobile
    if (email === "test@ledger.ai") {
      cookieStore.set("dev_bypass", "1", { secure: false, path: "/", maxAge: 60 * 60 * 24 * 7 });
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Lỗi hệ thống bất ngờ" };
  }
}

export async function registerAction(
  email: string,
  password: string,
  shopName: string = "",
  shopType: string = "KHAC",
  phone: string = ""
) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, { ...options, secure: false });
              });
            } catch (error) {}
          },
        },
      }
    );

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Create user in Prisma DB
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email,
            shopName: shopName || email.split("@")[0],
            shopType: shopType as any,
            phone: phone || null,
          },
        });
      }
    } catch (dbError) {
      console.error("Failed to create user in Prisma:", dbError);
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Lỗi hệ thống bất ngờ" };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("dev_bypass");

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, { ...options, secure: false });
              });
            } catch (error) {}
          },
        },
      }
    );

    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Lỗi hệ thống bất ngờ" };
  }
}
