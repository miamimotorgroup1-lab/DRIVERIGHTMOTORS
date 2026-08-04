This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

The lead form ("Book test drive" / "Get financing" / "Contact") sends email via
[Resend](https://resend.com). Create a `.env.local` file (already gitignored) with:

```bash
# Resend API key — https://resend.com/api-keys
RESEND_API_KEY=

# Inbox that receives new test drive / financing / contact leads
DEALER_EMAIL=
```

**The sending domain must be verified in your Resend dashboard** (Domains →
Add Domain) or outgoing mail will fail to deliver. Once verified, update the
`FROM_EMAIL` constant in `app/api/lead/route.ts` to use an address on that
domain. Without a configured `RESEND_API_KEY` / `DEALER_EMAIL`, the API route
returns a 500 rather than throwing, so the rest of the site still works — only
lead submission is affected.

### Database & admin auth (Supabase)

Inventory data and admin login both run on the same Supabase project. Create
a `.env` file (already gitignored) with:

```bash
# Postgres, via Prisma — see prisma.config.ts and lib/prisma.ts
DATABASE_URL=   # Session pooler connection string (Project Settings → Database)
DIRECT_URL=     # Direct connection string, used only for migrations

# Supabase Auth — see lib/supabase/. Both are public (NEXT_PUBLIC_) by
# design; safe to expose to the browser.
NEXT_PUBLIC_SUPABASE_URL=       # Project Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Project Settings → API → anon/public key
```

The `/admin` area (email + password, protected by `proxy.ts`) has **no public
sign-up route** — the admin user is created manually in the Supabase
dashboard (Authentication → Users → Add user), not through the app.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
