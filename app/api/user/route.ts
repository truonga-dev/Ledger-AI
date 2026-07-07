import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { shopName, phone, avatarUrl, backgroundUrl, logoUrl, monthlyBudget } = body;

    await prisma.user.upsert({
      where: { email: user.email! },
      update: {
        ...(shopName !== undefined && shopName !== null && { shopName }),
        ...(phone !== undefined && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(backgroundUrl !== undefined && { backgroundUrl }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(monthlyBudget !== undefined && {
          monthlyBudget: monthlyBudget ? BigInt(Math.round(Number(monthlyBudget))) : null,
        }),
      },
      create: {
        email: user.email!,
        shopName: shopName ?? user.email!.split("@")[0],
        ...(phone !== undefined && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(backgroundUrl !== undefined && { backgroundUrl }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(monthlyBudget !== undefined && {
          monthlyBudget: monthlyBudget ? BigInt(Math.round(Number(monthlyBudget))) : null,
        }),
      }
    });

    // Return success without the BigInt dbUser object (BigInt cannot be JSON serialized)
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /api/user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
