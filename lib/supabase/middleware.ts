import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const LOGIN_PATH = "/admin/login";
const ADMIN_HOME_PATH = "/admin";

// Called from proxy.ts (Next.js 16's renamed middleware — see
// https://nextjs.org/docs/app/getting-started/proxy). Refreshes the
// Supabase session cookie on every /admin request (per @supabase/ssr
// guidance, so sessions don't silently expire mid-use) and gates access to
// the /admin route group.
//
// This is an *optimistic* check only — it protects the route shell, not
// the data. app/(admin)/admin/page.tsx re-verifies the session itself.
export async function updateSession(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.",
    );
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Do not add logic between createServerClient and this call —
  // a stray return here can silently break session refresh for everyone.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = data?.claims != null;

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === LOGIN_PATH;

  if (!isAuthenticated && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_HOME_PATH;
    return NextResponse.redirect(url);
  }

  return response;
}
