// Prisma 7 config — connection URLs quản lý ở đây thay vì schema.prisma
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DATABASE_URL dùng pooler port 6543 — tránh bị firewall block
    url: process.env["DATABASE_URL"],
  },
});
