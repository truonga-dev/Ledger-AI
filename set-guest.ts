import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@ledger.ai';
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`User ${email} not found.`);
  } else {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'GUEST' }
    });
    console.log(`Updated user ${email} to role: ${updated.role}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
