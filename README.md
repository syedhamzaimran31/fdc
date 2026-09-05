# Skyline Residences — Lead Landing Page

FDC skills task submission. A Next.js (App Router) landing page that captures buyer
leads for an off-plan Dubai project, backed by Postgres.

## Run it

```bash
npm install
cp .env.example .env        # then set DATABASE_URL
npm run db:deploy           # applies prisma/migrations to your database
npm run dev                 # http://localhost:3000
```

Quality gates:

```bash
npm run typecheck           # tsc --noEmit, strict
npm run lint                # eslint, zero warnings
npm run build
```

`DATABASE_URL` is any Postgres — Neon and Supabase both work with the connection
string they hand you. `prisma/migrations/` is checked in, so `db:deploy` builds
the schema without anyone having to generate a migration.

---

## Architecture

TypeScript throughout, `strict` plus `noUncheckedIndexedAccess`. No JavaScript
files. The starter's flat root layout is gone; everything lives under `src/`.

```
src/
├── app/                        # routes only
│   ├── layout.tsx              # fonts, metadata, providers
│   ├── page.tsx                # server component — the landing page
│   └── api/lead/route.ts       # POST /api/lead
├── middleware.ts               # security headers + client IP passthrough
├── components/
│   ├── sections/               # Thesis, PaymentRail, FactGrid, Assurances
│   ├── leads/                  # LeadForm, LeadConfirmation
│   └── ui/                     # Field — the one reusable primitive
├── hooks/          use-submit-lead.ts     # React Query mutation
├── services/       leads.service.ts       # the only module that knows the URL
├── repositories/   lead.repository.ts     # the only module that knows Prisma
├── schemas/        lead.schema.ts         # one Zod schema, client + server
├── types/          lead.ts, api.ts
├── lib/            api-client.ts (axios), prisma.ts, logger.ts, rate-limit.ts
├── utils/          cn.ts, crypto.ts
├── constants/      api.ts, budget-ranges.ts, project.ts
├── providers/      query-provider.tsx
└── config/         site.ts
prisma/
├── schema.prisma
└── migrations/                 # checked in, applied with db:deploy
```

**The rule that shapes it.** Each layer knows only the one below it:

```
component  →  hook  →  service  →  axios client  →  API route  →  repository  →  Prisma
```

`LeadForm` does not know that `/api/lead` exists. `leads.service` does not know
Prisma exists. `lead.repository` is the only file that imports `@prisma/client`.
Moving the brokerage onto a CRM means rewriting one file.

### The layers, and why each one is there

**`lib/api-client.ts` — axios with a response interceptor.** Every failure mode
(HTTP error, timeout, offline, malformed body) is converted into a single
`ApiError` with `status` and `fieldErrors`. Nothing downstream ever sees an
`AxiosError`, so hooks and components have exactly one error type to handle.
`postJson` also unwraps the `{ ok, data }` envelope so callers never narrow the
union by hand.

**`middleware.ts`** sets security headers on every response — one place, so a new
route cannot ship without them — and passes the caller's IP down to the route as
`x-client-ip`. Route handlers have no direct access to the socket address on most
hosts. Rate limiting itself is *not* in middleware: the edge runtime has no
database access, so anything that might need Prisma stays in the route.

**`types/api.ts`** defines `ApiResponse<T>` as a discriminated union
(`{ok: true, data}` | `{ok: false, error}`). A caller cannot read `data` without
narrowing on `ok` first — the compiler enforces the error handling rather than a
convention doing it.

**`repositories/lead.repository.ts`** holds a compile-time assertion that the
budget values in `constants/budget-ranges.ts` are exactly the Prisma enum
members. The constants are written out by hand rather than imported from
`@prisma/client`, because that module is used by a client component and pulling
the Prisma runtime into the browser bundle to read three strings would cost about
100kB. The assertion is erased at build time, so if anyone adds a band to one
list and forgets the other, `tsc` fails instead of Postgres rejecting the insert
in production.

### Data model

`budgetRange` and `status` are Postgres enums, not free-text columns, so a
reworded marketing label can never invalidate stored history. `email` is indexed
but deliberately **not** unique — the same buyer legitimately enquires twice, and
silently rejecting the second attempt looks to them like a broken form.
De-duplication is a sales-side decision, not a database constraint.

Every lead is stamped server-side with `source` (the referer) and `ipHash` — a
salted one-way hash, so we can spot one machine submitting fifty leads without
storing anyone's raw IP.

---

## The design

The starter's UI was the default: centred dark hero, white rounded card floating
on a drop shadow, `#1668e3` button. Nothing on the page said Dubai, off-plan, or
property — swap three strings and it sells dental insurance.

So I picked a direction with an argument behind it. **An off-plan apartment is a
milestone-based payment obligation on a building that does not exist yet.** You
are not buying a home, you are signing a payment schedule. So the page is set as
a term sheet rather than a brochure.

| Token | Choice | Reasoning |
|---|---|---|
| Ground | `#e5e6e1` cool drafting stock | Not the warm cream that every AI-generated landing page reaches for. Reads as paper stock, not as a "look". |
| Signal | `#1d2bd4` ultramarine | Exactly one saturated colour, used as a flat field (the payment rail) rather than as button decoration. 8:1 on the ground. |
| Display | Archivo 700 | Tight and engineered. Carries the headline and every figure. |
| Body | Source Serif 4 | Reads as document prose, not marketing copy. |
| Data | IBM Plex Mono | Labels every value the way a spec sheet does, with tabular figures. |

**The signature element is the payment rail** — the 20/40/40 schedule drawn to
scale, each band's width its share of the total. It is the page's central claim
rendered as information rather than illustration, and it is the only thing on the
page that animates (once, on load, disabled under `prefers-reduced-motion`).

Structural decisions that follow from the thesis:

- **Form fields are ruled lines, not floating boxes.** A control on a baseline
  reads as a line on a signed document. Labels are mono, uppercase, always
  visible — a placeholder disappears the moment you start typing, which is
  exactly when you need to check what was being asked.
- **Success is a receipt, not a green tick.** Someone who just handed over a
  phone number wants to see what was sent and what happens next. The confirmation
  echoes back the name, phone and band with a short reference.
- **Assurances are a ruled definition list, not cards.** They are clauses.
  Clauses do not need boxes.
- **No numbered `01 / 02 / 03` markers anywhere except the payment plan**, which
  is a genuine sequence where order carries meaning.

Fonts are self-hosted through `next/font` with `display: swap`, so there is no
render-blocking request to Google and no invisible text on first paint.

### Accessibility

Not an afterthought, and checked rather than assumed:

- Skip link to the form; visible 3px focus rings everywhere.
- Visible label per field, `aria-required`, `aria-invalid` and `aria-describedby`
  wired through one `Field` primitive.
- Inline error under each field, **plus** a focused error summary when a submit
  fails with more than one error — links jump to the offending field.
- Errors are never colour alone: each carries a filled `!` marker.
- Body text 4.5:1 or better; every touch target ≥44px; `text-size-adjust` and
  pinch-zoom left alone.
- Single animation, disabled under reduced motion.

---

## Part 1 — What I changed and why

### The three things asked for

**1. The form works end to end.** The starter fired a `fetch` and ignored the
result: no success state, no error state, no loading state, nothing stopping a
double submit. The form now has idle / sending / done states, an error banner
when the request fails, and a disabled button while in flight. Submissions are
written to Postgres.

**2. Budget range field.** A required dropdown with the three bands, stored as a
Postgres enum. The options live in one `const` tuple that the Zod schema derives
from and the repository type-checks against the database enum, so the form, the
validation and the schema cannot drift apart.

**3. Bugs fixed in the code I was handed.** Not on the checklist, but the form is
not working without them:

| Issue | Why it mattered | Fix |
|---|---|---|
| `saveLead(lead)` was `async` but never awaited | The route returned `{ok:true}` before the write finished. A failed write was invisible — the user saw success, the lead was gone. | Awaited, wrapped, 500 on failure. |
| Read-modify-write on a JSON file with no coordination | Two leads submitted at the same moment both read the same array; the second write overwrote the first. Silent, intermittent lead loss. | Replaced with Postgres. (I first fixed it in the file store with a write queue — see the commit history — then the database made the whole class of bug go away.) |
| No validation anywhere | `/api/lead` accepted any JSON at all. | One Zod schema for the form and the route. The server revalidates; it never trusts the client. |
| No `type`, `inputMode` or `autoComplete` | Mobile users got a QWERTY keyboard for a phone number. On a mobile-first lead page that costs conversions. | Semantic input types and autocomplete hints. |
| Missing SEO metadata | No canonical, no Open Graph. Shared into WhatsApp with no preview. | Full metadata driven from `config/site.ts`. |
| No spam protection or rate limiting on a public endpoint | Public lead forms get found within days. | Honeypot (bots get a `202` and learn nothing) plus a fixed-window rate limit. |

Also: emails are trimmed and lowercased on the way in, and `id`, `createdAt`,
`status`, `source` and `ipHash` are all assigned server-side, never by the client.

### Judgement calls

The brief said keep the scope tight, so these were conscious noes:

- **No Zustand.** There is no global state on this page. One form owns its own
  state. A store would be architecture for its own sake.
- **No Tailwind, no component library.** The design is a bespoke token system in
  one stylesheet, which is both smaller and more specific to this page than a
  utility framework plus a component kit would be. There is exactly one shared UI
  primitive (`Field`) because that is how many the page needs.
- **React Query for one mutation.** `useState` would technically do. `useMutation`
  removes the hand-rolled loading/error/success bookkeeping that the starter got
  wrong, and keeps the component → hook → service layering intact.
- **Rate limiting is in-memory and documented as insufficient.** It is per-process
  and resets on deploy. It stops one bored person hammering the endpoint, not a
  distributed attack. The comment in `lib/rate-limit.ts` says exactly that and
  names Upstash Redis as the swap. I would rather ship an honest 20-line limiter
  with its limits written down than pretend the problem is solved.

### Assumptions

- Success means "the lead is durably stored". Notifying the sales team is out of
  scope here and is the first thing I would add — see the handover note.
- Phone validation is deliberately permissive (`+`, digits, spaces, brackets,
  dashes, 7–20 chars). Strict E.164 would reject real buyers typing
  `050 123 4567`, and a rejected real lead costs far more than a messy one.
- Project figures (price, unit mix, sq ft) are illustrative. A real build takes
  them from the developer's price list; they are isolated in
  `constants/project.ts` so that is a one-file change.
- Budget band is required. A lead with no budget is much less useful to the sales
  team, and it costs the buyer one tap.

### How I verified it

- `npm run build` — clean. Zero TypeScript errors, zero ESLint warnings.
- Submitted the form in a real browser: an empty submit produces four inline
  errors **and** a focused four-item error summary, with `aria-invalid` set on
  every offending control.
- Forced the failure path with no `DATABASE_URL`: the route logged one structured
  JSON error line, returned 500, and the buyer saw "We could not save your
  details. Please try again." — no stack trace, no silent success.
- Checked the two-column desktop layout and the stacked mobile layout, and
  confirmed the stored record shape including the lowercased email.
- Earlier, against the file-based store the starter shipped: 12 concurrent POSTs
  to `/api/lead` produced 12 records with none lost. That is the test the
  original code fails, and it is why the store was replaced.

---

## Part 2 — The review

```js
function newLeads(allLeads, contactedLeads) {
  const seen = contactedLeads.map((c) => c.email);
  return allLeads.filter((lead) => seen.includes(lead.email));
}
```

### 1. The logic is inverted — this is the bug that matters

`includes` returns `true` when the lead **has** been contacted, so the filter keeps
exactly the leads it was supposed to drop. The function returns the contacted leads,
not the new ones.

Why it matters: it fails in the worst possible way — quietly. Nobody gets an empty
result or an error. They get a full, plausible-looking batch, and the outreach goes to
people who were already contacted. That means duplicate emails to the same buyers, an
annoyed client, and a real spam-complaint risk on the sending domain. Meanwhile the
actual new leads are never contacted at all. This could run for weeks before anyone
worked out why.

Fix: `!seen.has(...)`.

### 2. Email comparison is case- and whitespace-sensitive

`"Aisha@Example.com"` and `"aisha@example.com"` are the same mailbox but not the same
string. Leads come from web forms where people type inconsistently, and the contacted
list may come from a different system (a CRM export) with different formatting. Every
mismatch is a duplicate contact. Normalise both sides — trim and lowercase — before
comparing.

### 3. `Array.includes` inside `filter` is O(n × m)

With a few hundred leads nobody notices. At tens of thousands it is a full scan per
lead. A `Set` makes it O(n + m) and reads better anyway. Cheap to fix now, annoying to
diagnose later.

### 4. No guard against missing or malformed input

If `allLeads` or `contactedLeads` is `undefined` — an API returned nothing, a file was
empty — this throws. If a record has no `email`, `undefined` gets compared against
`undefined` and unrelated records match each other. For a function feeding an outreach
batch, silently matching the wrong records is worse than throwing.

### 5. No types, and a name that does not describe the operation

In a TypeScript codebase the inverted logic in issue 1 would still compile — the types
are identical either way — but typed inputs would have caught the shape problems in
issue 4 at the call site. And `newLeads` names the output, not what the function does;
`getUncontactedLeads` says it plainly.

### How I would write it

```ts
interface Lead {
  email?: string | null;
}

const normaliseEmail = (email?: string | null): string =>
  email?.trim().toLowerCase() ?? "";

/** Leads from `allLeads` that do not appear in `contactedLeads`, matched by email. */
export function getUncontactedLeads<T extends Lead>(
  allLeads: readonly T[] = [],
  contactedLeads: readonly Lead[] = [],
): T[] {
  const contacted = new Set(
    contactedLeads.map((lead) => normaliseEmail(lead.email)).filter(Boolean),
  );

  return allLeads.filter((lead) => {
    const email = normaliseEmail(lead.email);
    // A lead with no email cannot be proven uncontacted — leave it out of the
    // batch rather than risk contacting someone twice.
    if (!email) return false;
    return !contacted.has(email);
  });
}
```

One product decision worth surfacing rather than deciding silently: leads with no email
are excluded. Including them risks duplicate contact; excluding them risks a lead going
cold. I would ask the sales team which they prefer — but either way the choice should
be explicit in the code, not an accident of how `undefined` compares.

**The wider point.** This function is six lines, has a comment stating the correct
intent directly above code that does the opposite, and it shipped. Three of these five
issues are things a reviewer catches in thirty seconds. The lesson is not "AI wrote a
bug" — it is that AI-written code is fluent and confident-looking, which makes it *less*
likely to get a careful read, not more. Small utilities that quietly do the wrong thing
are exactly where that fails.

---

## Part 3 — How I used AI

I used Claude Code throughout, the way I normally work: I decided the architecture and
the trade-offs, and used the tool to move fast on the parts where speed is safe.

**What I trusted it with.** Mechanical, verifiable work — converting JS to TypeScript,
scaffolding the folder structure, wiring react-hook-form to `zodResolver`, the
boilerplate around Open Graph metadata. If any of that is wrong, the compiler or the
browser tells me immediately, so the cost of being wrong is near zero.

**What I did not trust, and checked myself.** Three specific things:

1. **The concurrency fix.** (This was against the file store the starter shipped,
   before I replaced it with Postgres — the reasoning is the point.) The first
   instinct was to `await` the
   save and move on. That fixes the silent failure but not the race — two simultaneous
   submissions still read the same array and one overwrites the other. I did not accept
   "it is awaited now" as done. I wrote the write-queue myself and then proved it,
   firing 12 concurrent POSTs at `/api/lead` and counting records on disk: 12 in, 12
   stored. Before the fix, that test loses leads. This is the kind of bug that never
   shows up in manual testing and costs a client real money.

2. **The honeypot behaviour.** The first version validated the honeypot with
   `z.string().max(0)`, which meant a bot got a `422` naming the trap field — telling it
   exactly which field to leave empty next time. I only caught it because I POSTed to
   the endpoint with the honeypot filled and read the actual response body instead of
   assuming. Changed to accept silently with a `202` and discard the submission.

3. **Whether to add the suggested tooling at all.** Asked for a "proper" structure, the
   tool will happily reach for Zustand, Tailwind and a component library. None of those
   solve a problem this page has. I kept React Query because it removes the exact
   bookkeeping the starter got wrong, and dropped the rest. Deciding what *not* to
   install is the part the tool cannot do for you.

The rule I work to: AI is fast at writing plausible code and bad at knowing when
plausible is not correct. So anything touching data integrity, money or user trust gets
read line by line and tested against a real running server — not accepted because it
looks right.

---

## Part 4 — Handover note for a non-technical founder

**What I built.** I picked up the half-finished landing page and got the enquiry form
working properly. Someone can now fill in their name, email, phone and budget, hit send,
and get a clear confirmation with a reference number and a summary of what they sent. If
something goes wrong — no internet, server down — they see a plain message asking them to
try again, instead of the form quietly doing nothing. Enquiries are saved to a real
database, so nothing depends on a file sitting on one server. I added the budget range
dropdown you asked for, and it is saved with every enquiry.

I also redesigned the page. The version I was handed looked like a template: a dark
banner, a white card, a blue button. Nothing on it said Dubai, said property, or said
off-plan — you could swap three lines of text and it would sell dental insurance. Since
buying off-plan really means agreeing to a payment schedule for a building that does not
exist yet, I made that schedule the centrepiece: the 20 / 40 / 40 plan is drawn to scale
at the top of the page, and the whole layout reads like a terms document rather than a
brochure. That also makes the budget question feel like a normal part of the paperwork
instead of a nosy one, which should help the completion rate.

**How I approached it.** Before adding anything new, I made sure the existing pieces were
actually correct, because a lead page that loses enquiries is worse than one that does not
exist — you never find out what you missed. Two real bugs in the starter would have lost
leads silently in production; both are fixed and written up in the technical section
above.

**Three things to sort out before this goes live for a real client.**

*Nobody is notified when an enquiry comes in.* Right now leads are saved to the database
and sit there until someone goes and looks. For an off-plan property, response time is
close to everything — the buyer is enquiring with four brokerages the same afternoon. The
sales team needs an email or WhatsApp alert the moment a lead lands. This is now the most
important item on the list and it is roughly half a day of work.

*Nothing has been checked from a privacy or compliance angle.* We are collecting names,
emails and phone numbers from people in the UAE and storing them. Before launch the page
needs a privacy notice and a consent line on the form saying who will contact them and
why, someone needs to confirm where that data is legally allowed to be stored, and we
need an agreed answer for when a buyer asks to be deleted. That is a conversation with the
client rather than a coding task, but it should happen before the first real lead is
captured, not after.

*Every number on the page is made up.* The price, the unit sizes, the payment plan and the
handover date are placeholders I wrote to build against. Someone needs to replace them
with the developer's actual price list, and re-check them whenever it changes — publishing
a price the developer no longer honours is a problem for the brokerage, not for the
website. They are all kept in a single file so this is a five-minute job, not a hunt.

Two smaller notes. The form has basic spam protection and a simple limit on how often one
visitor can submit; both are enough to start with, but once the page is running ads expect
bot submissions to rise and budget a little time for stronger filtering — a sales team that
stops trusting the lead inbox quietly undoes the whole point of the page. And the database
currently has no backup schedule of its own beyond whatever the hosting provider does by
default; worth confirming, since the leads are now the only copy.

---

## Part 5 — The WordPress question

**How I would approach it.** For a client site I do not maintain daily, I would use a
well-established form plugin rather than writing custom code — WPForms, Fluent Forms or
Gravity Forms. The reason is not laziness. A form plugin means the client can reword a
field themselves without booking developer time, and it means the code is maintained by
someone other than me after I have moved on. Custom form code on a client WordPress site
becomes an orphan the first time the theme is updated.

The setup: add the form to the existing page via the plugin's block or shortcode, so I am
not touching the theme; enable the plugin's database storage so every entry is saved in
WordPress itself; then add the email notification to the sales team on top of that.

**The main thing I would watch out for** is the exact point the client asked about —
"stored so none are lost". Email notification alone is not storage. Emails get caught in
spam filters, shared hosting mail servers fail silently, someone deletes the thread, and
then there is no record the lead ever existed. Database storage is the source of truth
and the email is only the alert. Both, always, never one.

Related: WordPress sends mail through PHP's mail function by default, which lands in spam
far more often than people expect. I would route it through a proper transactional
provider — an SMTP plugin pointed at SendGrid, Postmark or similar — and confirm delivery
with a real test send rather than assuming it works.

The rest of what I would watch:

- **Spam.** A public WordPress form gets found by bots quickly. Honeypot plus a challenge,
  and check the entries a week later. A sales team that stops trusting the lead inbox is
  the real failure mode.
- **Plugin bloat and conflicts.** Check what form, caching and security plugins are
  already installed before adding another. Two form plugins fighting, or a page cache
  serving a stale nonce and silently breaking submissions, are both common and both look
  to the client like "the form just does not work sometimes".
- **Test on the live page, not a staging copy.** Caching, CDN and security plugins mean a
  form that works in staging can fail in production. I would submit a real test lead on
  the live page and confirm it lands in both the database and the sales inbox.
- **Privacy.** Same as above — consent line, privacy notice, a plan for deletion requests.
  Form plugins store personal data indefinitely by default, so I would set a retention
  policy rather than letting entries pile up forever.
- **Backups.** Confirm the client's backup actually covers the database, since that is now
  where the leads live. Plenty of "backups" only cover files.
