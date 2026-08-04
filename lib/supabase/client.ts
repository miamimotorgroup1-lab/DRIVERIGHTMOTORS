import { createBrowserClient } from "@supabase/ssr";

// Supabase client for use in Client Components. Session cookies are
// handled automatically (falls back to document.cookie) — no custom
// cookie adapter needed here, unlike the server client.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
