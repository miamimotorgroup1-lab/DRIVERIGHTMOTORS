import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

// Prisma 7's generated client has no built-in URL-based connection — it
// always needs a driver adapter. We use `pg` (node-postgres) pointed at
// Supabase's session pooler (DATABASE_URL), which is IPv4-compatible and
// supports the prepared statements Prisma relies on. See prisma.config.ts
// for the separate direct connection used by migrations.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env (see .env for the Supabase connection string format).",
  );
}

const adapter = new PrismaPg({ connectionString });

// Guard against creating a new PrismaClient (and a new connection pool) on
// every hot-reload in dev — stash the instance on the global object.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
