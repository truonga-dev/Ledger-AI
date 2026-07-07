import { prisma } from "./lib/prisma";

async function main() {
  const email = "atruong102005@gmail.com";
  let dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email,
        shopName: email.split("@")[0],
      },
    });
  }

  const catName = "Khác - Thu";
  let category = await prisma.category.findFirst({
    where: {
      userId: dbUser.id,
      name: catName,
      type: "THU",
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        userId: dbUser.id,
        name: catName,
        type: "THU",
      },
    });
  }

  const tx = await prisma.transaction.create({
    data: {
      userId: dbUser.id,
      type: "THU",
      amount: 4395100,
      description: "03/11/2014 Tiền mặt",
      transactionDate: new Date(),
      isManual: false,
      categoryId: category.id,
    },
  });

  console.log("Success:", tx);
}

main().catch(console.error).finally(() => prisma.$disconnect());
