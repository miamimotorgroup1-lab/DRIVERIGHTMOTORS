"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import MagneticButton from "@/components/ui/MagneticButton";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "error";

const FIELD_CLASS =
  "w-full border-b border-hairline bg-transparent py-2 text-sm text-text placeholder:text-muted focus:border-accent";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setStatus("error");
      return;
    }

    // Re-sync Server Components with the new session cookie, then move on.
    router.refresh();
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Drive Right Motors
        </p>
        <h1 className="mt-3 font-display text-display-md font-semibold text-text">
          Admin sign in
        </h1>
        <p className="mt-3 text-sm text-muted">Authorized staff only.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.15em] text-muted">
              Email
            </span>
            <div className="mt-2">
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={FIELD_CLASS}
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.15em] text-muted">
              Password
            </span>
            <div className="mt-2">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={FIELD_CLASS}
              />
            </div>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <MagneticButton
            type="submit"
            variant="accent"
            disabled={status === "submitting"}
            className="w-full justify-center"
          >
            {status === "submitting" ? "Signing in…" : "Sign in"}
          </MagneticButton>
        </form>
      </div>
    </div>
  );
}
