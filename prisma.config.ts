// Prisma 7 config file — datasource URLs live here (and in lib/prisma.ts),
// not in prisma/schema.prisma. This file is only read by the Prisma CLI
// (migrate, generate, studio, db seed) — the Next.js app never imports it.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // `prisma db seed` / `prisma migrate dev` run this after migrating.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection — PgBouncer's
    // transaction/session pooling can break Prisma Migrate's advisory locks
    // and DDL statements. The app itself connects separately via
    // DATABASE_URL through the driver adapter in lib/prisma.ts.
    url: process.env.DIRECT_URL,
  },
});
