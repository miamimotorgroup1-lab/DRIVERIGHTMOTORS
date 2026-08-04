import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same request-interception
// API). See node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only the admin route group needs session refresh / auth gating — the
  // public site's data layer (Prisma/Postgres) is untouched by this.
  matcher: ["/admin/:path*"],
};
