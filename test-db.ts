import 'dotenv/config';
import { prisma } from "./lib/prisma";

async function main() {
  try {
    console.log("Testing connection to database...");
    const users = await prisma.user.findMany({ take: 1 });
    console.log("Connection successful! Found users:", users.length);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
