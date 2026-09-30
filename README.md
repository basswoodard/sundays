# Sundays

A home-cooked Sunday supper marketplace: cooks open a table for up to a
handful of guests, guests find and book a seat, and payment is a trust-based
donation settled directly between guest and cook (Sundays never touches the
money).

This is a real, working app — accounts, a database, bookings, and a payment
status workflow — not the earlier Claude Design prototype. It's meant as a
starting point for a real deploy, not a finished production system: read
"Known gaps" below before putting real users on it.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Drizzle ORM + @libsql/client** — talks to a plain local SQLite file in
  development, or a hosted [Turso](https://turso.tech) database in
  production, through the same client and the same schema (see "Deploying
  for free" below)
- **jose** (JWT session cookies) + **bcryptjs** (password hashing)
- **Tailwind CSS v4**
- Fonts self-hosted via `@fontsource` (no runtime or build-time call to
  Google Fonts — see "Why @fontsource" below)

## Running locally

```bash
npm install
cp .env.example .env          # fill in SESSION_SECRET at minimum
npx drizzle-kit push          # creates sundays.db from the schema
npm run dev                   # http://localhost:3000
```

`npx drizzle-kit push` is also how you apply schema changes after editing
`src/lib/db/schema.ts` — this project doesn't use versioned migrations yet
(see "Known gaps").

## Environment variables

See `.env.example` for the full description. In short:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | `file:./sundays.db` locally, or a `libsql://...` Turso URL in production. Read by both the app (`src/lib/db/index.ts`) and `drizzle-kit` (`drizzle.config.ts`). |
| `TURSO_AUTH_TOKEN` | Only needed against a Turso database — leave unset for local dev. |
| `SESSION_SECRET` | Signs session JWTs. Must be long and random in production, and must not change across deploys (or every logged-in user is signed out). Generate with `openssl rand -base64 48`. |

## Deploying for free

This stack (Next.js + libsql) was chosen specifically so the whole thing can
run on free tiers, with your own domain, indefinitely — not just a trial:

- **[Vercel](https://vercel.com)** (Hobby plan, free) to host the Next.js app
  and serve your custom domain over HTTPS.
- **[Turso](https://turso.tech)** (free tier: 500 databases, 5 GB storage,
  ~1 billion row reads/month — far more than a project like this needs) to
  host the SQLite database, since Vercel's serverless functions don't have a
  persistent local disk for a plain SQLite *file* to live on.
- **GitHub** (free) to hold the code, since that's how Vercel deploys it.

None of this needs a credit card. Steps:

### 1. Push the code to GitHub

Create a new empty repository on GitHub (github.com → New repository — don't
initialize it with a README), then from this project folder:

```bash
git init                      # if this folder isn't already a git repo
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### 2. Create a free Turso database

Install the Turso CLI and sign up (opens a browser to authenticate — no
credit card):

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create sundays
turso db show sundays --url        # copy this: your DATABASE_URL
turso db tokens create sundays     # copy this: your TURSO_AUTH_TOKEN
```

Then push the schema to it directly from your machine:

```bash
DATABASE_URL="<the libsql:// url>" TURSO_AUTH_TOKEN="<the token>" npx drizzle-kit push
```

### 3. Import the project into Vercel

At [vercel.com](https://vercel.com), sign up with GitHub, then "Add New →
Project" and pick the repo you just pushed. Vercel auto-detects Next.js — no
config needed. Before the first deploy, add these under
**Environment Variables**:

- `DATABASE_URL` → the `libsql://...` URL from step 2
- `TURSO_AUTH_TOKEN` → the token from step 2
- `SESSION_SECRET` → output of `openssl rand -base64 48`

Click Deploy. You'll get a working `your-project.vercel.app` URL.

### 4. Point leftoversdk.com at it

In the Vercel project → **Settings → Domains**, add `leftoversdk.com` (and
`www.leftoversdk.com` if you want both). Vercel shows you the exact DNS
records to add — normally an `A` record for the root domain and a `CNAME`
for `www`. Add those records at whichever registrar you bought
leftoversdk.com through (its DNS settings page). DNS changes can take
anywhere from a few minutes to a few hours to propagate; Vercel issues a free
HTTPS certificate automatically once it sees the domain pointing at it.

### Later: outgrowing the free tier

This setup comfortably handles real early usage. If it ever needs to scale
well past that, Turso's free tier has generous but real limits, and at that
point moving to a managed Postgres (Neon, Supabase — both also have free
tiers) is a small change: swap `@libsql/client` for `drizzle-orm/node-postgres`
in `src/lib/db/index.ts`, change `drizzle.config.ts`'s `dialect` to
`"postgresql"`, and switch from `drizzle-kit push` to real migrations
(`drizzle-kit generate` + `drizzle-kit migrate`) — `push` is fine for
development, not for a production database multiple people write to. The
schema itself (`src/lib/db/schema.ts`) needs only minor tweaks (SQLite's
`integer(..., { mode: "boolean" })` → Postgres `boolean`).

### Running your own server instead

The app is also a standard Next.js app (`npm run build && npm run start`),
so it runs unmodified on any Node host — a VM, Railway, Render, Fly.io —
if you'd rather not use Vercel. Point `DATABASE_URL` at a Turso database the
same way, or back at a local file if that host gives you a persistent disk.

### Why @fontsource instead of next/font/google

`next/font/google` needs a live connection to `fonts.googleapis.com` at
*build* time (not just runtime), which breaks builds in offline/restricted
CI or sandboxed environments. The app self-hosts Fraunces, Nunito Sans and
Caveat via the `@fontsource/*` npm packages instead (imported in
`src/app/layout.tsx`) — the font files are bundled with the app, so `npm run
build` never makes a network call. If your deploy environment has normal
internet access, switching back to `next/font/google` works too; this
project just doesn't require it.

## What's implemented

- **Auth** — signup/login/logout, bcrypt-hashed passwords, JWT session
  cookie (`src/lib/actions/auth.ts`)
- **Profile** (`/profile`) — bio, country/DOB, phone/Instagram with
  public/private toggles, preferred payment method (MobilePay/Revolut/
  Wise/Cash) + payment details, dietary/allergy tags, cooking credentials;
  plus **Hosting** (your tables, each guest's name/country/age/payment
  status/dietary info/notes, and a "Mark as paid" action) and **Attending**
  (your bookings, their status and payment state, "I've paid" and cancel)
- **Host a Supper** (`/host`) — a 4-step wizard (where / when + recurring /
  how many + public-or-private / what you're cooking) that creates a table,
  and re-opens pre-filled to edit your existing one
- **Find a Supper** (`/suppers`) — browse open public tables, book a seat
  (or request to join, for private tables) with dietary/allergy/note
  collected at booking time, and see your own booking + payment status
  inline
- **Payment status workflow** — `unpaid → awaiting_verification → paid`,
  driven by the guest ("I've paid") and confirmed by the host ("Mark as
  paid"), reflected live on both sides

## Known gaps

Worth knowing before treating this as production-ready:

- **No private-table link page.** A table's `visibility` can be `"private"`,
  and booking it is modeled as "request to join" rather than instant
  confirm, but there's no `/s/[id]`-style shareable link route yet for a
  guest to actually reach a private table — `/suppers` only lists public
  ones. (This mirrors the original prototype's design, which also assumed a
  share link outside the app's own routing.)
- **No migrations.** Schema changes are applied with `drizzle-kit push`,
  which is fine solo in development but can silently choose a destructive
  path (e.g. drop-and-recreate a column) against a database with real data.
  Move to `drizzle-kit generate`/`migrate` before this holds real user data.
- **No rate limiting or account lockout** on login/signup.
- **No password reset / email verification** — email is only used as the
  login identifier, nothing is ever sent to it.
- **No image uploads** — `avatarUrl` exists in the schema but nothing sets
  it; there's no profile photo or food photo anywhere in the UI.
- **Payment status is entirely self-reported** — by design, matching
  Sundays' trust-based model (no payment processor integration), but it
  means a host confirming "paid" is just a checkbox with no verification
  behind it.
- **No tests beyond manual/scripted smoke testing** done during
  development (signup/login flows, the host wizard, booking, and the
  payment workflow were exercised end-to-end with Playwright against both
  the dev server and a production build, but there's no automated test
  suite checked into the repo).
