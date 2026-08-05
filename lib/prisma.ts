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

// max caps how many physical connections THIS pg.Pool (and therefore this
// one PrismaClient instance) will ever open — not a Prisma setting, a
// node-postgres one, set via the adapter's pool config rather than a
// `?connection_limit=` query param (that's classic pre-driver-adapter
// Prisma; pg.Pool doesn't parse it, so it would silently do nothing here).
// It defaults to 10 per pool. Every environment that runs this module gets
// its own pool — 3 parallel Next.js build workers, or N concurrent
// Vercel serverless instances at runtime — so at the default of 10 it only
// takes 2 workers/instances to exceed Supabase's session-pooler limit of
// 15 total clients ("EMAXCONNSESSION"). Capping each pool at 1 keeps every
// environment's worst case (workers/instances × 1) comfortably under that
// ceiling; the cost is that same-request concurrent queries (e.g. the
// Promise.all in app/(site)/inventory/page.tsx) queue on one connection
// instead of running in parallel — slightly slower per request, not
// incorrect, and a fine trade for a low-traffic site over an intermittent
// build/runtime failure.
const adapter = new PrismaPg({ connectionString, max: 1 });

// Guard against creating a new PrismaClient (and a new connection pool) on
// every hot-reload in dev — stash the instance on the global object.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
