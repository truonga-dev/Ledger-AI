// Prisma 7 config — connection URLs quản lý ở đây thay vì schema.prisma
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL dùng port 5432 để thực hiện db push/migrate (CLI)
    // Ứng dụng (PrismaClient) vẫn dùng DATABASE_URL (port 6543) thông qua adapter-pg
    url: process.env["DIRECT_URL"],
  },
});
