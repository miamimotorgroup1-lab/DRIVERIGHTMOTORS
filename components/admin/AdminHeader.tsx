import Link from "next/link";
import { signOut } from "@/app/(admin)/admin/actions";

type AdminHeaderProps = {
  backHref?: string;
  backLabel?: string;
};

// Minimal admin chrome — no public Nav/Footer. Shared across the dashboard
// and the create/edit forms so every authenticated admin page looks the same.
export default function AdminHeader({ backHref, backLabel }: AdminHeaderProps) {
  return (
    <header className="border-b border-hairline">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-10">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="block">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Drive Right Motors
            </p>
            <p className="font-display text-lg font-semibold text-text">
              Admin
            </p>
          </Link>
          {backHref && (
            <Link
              href={backHref}
              className="text-sm text-muted transition-colors duration-300 hover:text-text"
            >
              ← {backLabel ?? "Back"}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted transition-colors duration-300 hover:text-text"
          >
            View site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-muted transition-colors duration-300 hover:text-text"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
