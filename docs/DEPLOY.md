# Deploying to Vercel with Neon

Vercel, not GitHub Pages. Pages serves static files only, and this app needs a
server for `POST /api/lead` and for Prisma to reach Postgres. Nothing on Pages
can run that.

The build is already set up for it: `npm run build` runs `prisma generate`
before `next build`, so the client exists in the deployed bundle.

---

## 1. Push the repo

```bash
cd "D:/software development/fdc"
git config user.name "Your Name"
git config user.email "you@example.com"
git push -u origin master
```

## 2. Import into Vercel

1. vercel.com → **Add New… → Project** → import `syedhamzaimran31/fdc`.
2. Framework preset auto-detects as Next.js. Leave the build and output
   settings alone.
3. **Do not deploy yet** — add the environment variables first (next step),
   otherwise the first build ships in demo mode.

## 3. Environment variables

In **Settings → Environment Variables**, add these for *Production*, *Preview*
and *Development*:

| Name | Value |
|---|---|
| `DATABASE_URL` | The Neon **pooled** string — the host containing `-pooler` — with `&pgbouncer=true` appended |
| `DIRECT_URL` | The same string with `-pooler` removed from the host |
| `IP_HASH_SALT` | Any long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` — set after the first deploy, then redeploy so canonical and Open Graph URLs are right |

Both database URLs are in your local `.env`. Copy them from there; do not
retype them.

**Why two.** The app runs on the pooled connection because serverless opens a
connection per invocation and would otherwise exhaust Neon's connection limit.
Migrations run on the direct one, because they take advisory locks and run DDL
in a session and neither survives a transaction-mode pooler.

## 4. Apply the schema

The migration is checked in, so this is one command against the production
database. From your machine, with `.env` pointing at the same Neon branch:

```bash
npm run db:deploy
```

Vercel does not run migrations during a build, deliberately: a build that
mutates a production schema is a bad default. Run it yourself when the schema
changes.

## 5. Deploy and verify

Trigger the deploy, then on the live URL:

1. The page should **not** show the amber "Demo mode" notice. If it does,
   `DATABASE_URL` was missing at build time — add it and redeploy.
2. Submit a real enquiry.
3. Confirm the row landed:

```bash
npx prisma studio
```

The reference shown on the confirmation is the last 8 characters of the row id.

---

## Neon's own Vercel integration

Neon publishes a Vercel integration that manages `DATABASE_URL` for you and can
create a database branch per preview deployment. It is genuinely useful once
there is a team, but it sets only the pooled URL — you still add `DIRECT_URL`
by hand, or migrations will hang. Setting all four by hand, as above, is fewer
moving parts for a single submission.

---

## What happens without a database

The app does not fail. `DATABASE_URL` absent puts it in **demo mode**: the
endpoint still answers, leads are held in memory (and written to
`data/leads.json` when the filesystem allows it), and the page shows a notice
saying so.

That exists so a reviewer can clone the repo and use the form without
provisioning Postgres first. It is **not** a second way to run this in
production, and the code says so in `src/lib/demo-store.ts`. On a serverless
host the filesystem is read-only apart from a per-instance `/tmp`, so a write
there can vanish without an error — which is exactly the "success response,
lost lead" bug this project opened by fixing. Silently degrading to it would
recreate that bug with a nicer face on it. Hence the loud server log and the
banner: if it is ever on in production, it is visible in the first second.
