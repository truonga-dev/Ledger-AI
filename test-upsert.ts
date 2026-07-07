import { prisma } from "./lib/prisma";

async function main() {
  try {
    const user = { email: "test@ledger.ai" };
    const shopName = undefined;
    const phone = undefined;
    const avatarUrl = "http://example.com/avatar.png";
    const backgroundUrl = undefined;
    const logoUrl = undefined;
    const monthlyBudget = undefined;

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
        shopName: shopName || user.email!.split("@")[0],
        phone: phone || null,
        avatarUrl: avatarUrl || null,
        backgroundUrl: backgroundUrl || null,
        logoUrl: logoUrl || null,
        monthlyBudget: monthlyBudget ? BigInt(Math.round(Number(monthlyBudget))) : null,
      }
    });

    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR", err);
  }
}

main();
