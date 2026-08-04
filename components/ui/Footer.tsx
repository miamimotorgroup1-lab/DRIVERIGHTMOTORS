import Link from "next/link";
import { DEALER } from "@/lib/dealer";

const QUICK_LINKS = [
  { label: "Inventory", href: "/inventory" },
  { label: "Financing", href: "/financing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg text-text">DRIVE RIGHT MOTORS</p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Quality used vehicles and trustworthy service, backed by a team
            that treats every sale like a relationship.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-text">Quick links</p>
          <ul className="mt-4 space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted transition-colors duration-300 hover:text-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-text">Hours</p>
          <ul className="mt-4 space-y-2">
            {DEALER.hours.map((row) => (
              <li key={row.day} className="text-sm text-muted">
                <span className="text-text">{row.day}</span> — {row.time}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-text">Visit us</p>
          <address className="mt-4 text-sm not-italic text-muted">
            {DEALER.addressLines[0]}
            <br />
            {DEALER.addressLines[1]}
            <br />
            <a
              href={DEALER.phone.href}
              className="transition-colors duration-300 hover:text-text"
            >
              {DEALER.phone.display}
            </a>
          </address>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Drive Right Motors. All rights reserved.</p>
          <p>
            Prices plus tax, title, license, and dealer fees. See dealer for
            details.
          </p>
        </div>
      </div>
    </footer>
  );
}
