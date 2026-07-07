import { config } from 'dotenv';
config({ path: '.env' });
import { prisma } from './lib/prisma';

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found");
    return;
  }

  console.log("Seeding for user:", user.email);

  const categories = [
    { name: "Tiền hàng", type: "CHI" as const },
    { name: "Điện nước", type: "CHI" as const },
    { name: "Lương nhân viên", type: "CHI" as const },
    { name: "Doanh thu bán hàng", type: "THU" as const },
    { name: "Tiền dịch vụ", type: "THU" as const },
  ];

  const dbCats = [];
  for (const c of categories) {
    let cat = await prisma.category.findFirst({
      where: { userId: user.id, name: c.name, type: c.type },
    });
    if (!cat) {
      cat = await prisma.category.create({
        data: { userId: user.id, name: c.name, type: c.type },
      });
    }
    dbCats.push(cat);
  }

  const chiCats = dbCats.filter(c => c.type === "CHI");
  const thuCats = dbCats.filter(c => c.type === "THU");

  let txCount = 0;

  for (let year = 2026; year <= 2028; year++) {
    for (let month = 0; month < 12; month++) {
      // 2 Thu, 3 Chi per month
      for (let i = 0; i < 2; i++) {
        const cat = thuCats[Math.floor(Math.random() * thuCats.length)];
        const amt = Math.floor(Math.random() * 5000) * 1000 + 500000; // 500k to 5.5m
        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: "THU",
            amount: amt,
            description: "Thu tự động " + (i + 1),
            transactionDate: new Date(year, month, Math.floor(Math.random() * 28) + 1),
            isManual: true,
            categoryId: cat.id,
          }
        });
        txCount++;
      }
      for (let i = 0; i < 3; i++) {
        const cat = chiCats[Math.floor(Math.random() * chiCats.length)];
        const amt = Math.floor(Math.random() * 2000) * 1000 + 100000; // 100k to 2.1m
        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: "CHI",
            amount: amt,
            description: "Chi tự động " + (i + 1),
            transactionDate: new Date(year, month, Math.floor(Math.random() * 28) + 1),
            isManual: true,
            categoryId: cat.id,
          }
        });
        txCount++;
      }
    }
  }

  console.log(`Seeded ${txCount} transactions from 2026 to 2028.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
