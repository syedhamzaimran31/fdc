# Changelog

Every change made to the FDC starter, and why. The starter is preserved as the first
commit (`5cf8170`), so anything below can be diffed against it.

Read this if you want the reasoning. `README.md` has the architecture, the design
rationale, and the written answers to Parts 2–5.

---

## What the starter was

A Next.js 14 App Router page in plain JavaScript, flat at the repo root:
`app/`, `components/LeadForm.js`, `lib/leads.js`, `data/leads.json`. The form
POSTed to `/api/lead` and ignored the response. No validation anywhere, no
success state, no error state, no database.

---

## 1. Correctness — the bugs in the code I was handed

These were not on the task checklist. The form is not "working" without them, and
both fail **silently**, which is what makes them worth leading with.

### 1.1 A failed write reported success

```js
saveLead(lead);                    // async, never awaited
return Response.json({ ok: true }); // returns before the write finishes
```

The route resolved before the write completed. If the write threw, nobody found
out: the buyer saw a success response and the lead was gone.

**Fixed:** awaited, wrapped in try/catch, `500` on failure, and the failure is
logged as one structured line. A lead is the product — a failed write has to be
loud.

### 1.2 Concurrent submissions overwrote each other

`saveLead` did a read-modify-write on a JSON file with no coordination. Two leads
submitted in the same moment both read the same array, and the second write
overwrote the first. Intermittent, invisible, and it only happens under the exact
conditions a lead-gen page is built to create.

**Fixed twice.** First with a promise queue serialising writes, proven with 12
concurrent POSTs — 12 in, 12 stored, where the original loses leads. Then the
whole class of bug went away by moving to Postgres (§2).

### 1.3 No validation on a public endpoint

`/api/lead` accepted any JSON at all. Empty and junk leads went straight to the
sales team.

**Fixed:** one Zod schema (`src/schemas/lead.schema.ts`) used by both the form and
the route. The client gets instant feedback; the server revalidates and never
trusts it, because the endpoint is public and can be called without the form.

### 1.4 Smaller things in the same pass

| Issue | Why it mattered | Fix |
|---|---|---|
| No `type` / `inputMode` / `autoComplete` | Mobile users got a QWERTY keyboard for a phone number, on a mobile-first lead page | Semantic input types and autocomplete hints |
| No canonical or Open Graph tags | Shared into WhatsApp with no preview | Full metadata from `src/config/site.ts` |
| No spam protection or rate limit | Public lead forms get found by bots within days | Honeypot + fixed-window limiter |
| Client could set any field | Nothing stopped a forged `id` or timestamp | `id`, `createdAt`, `status`, `source`, `ipHash` all assigned server-side |
| Emails stored as typed | `Aisha@X.com` and `aisha@x.com` become two people | Trimmed and lowercased on the way in |

---

## 2. Persistence — file store to Postgres

`5087522`, `3849b78`

- Prisma + Postgres, verified end to end against Neon.
- `budgetRange` and `status` are **Postgres enums**, not free-text, so a reworded
  marketing label can never invalidate stored history.
- `email` is indexed but deliberately **not unique** — the same buyer legitimately
  enquires twice, and silently rejecting the second attempt looks to them like a
  broken form. De-duplication is a sales decision, not a database constraint.
- `ipHash` is a salted one-way hash. We can spot one machine sending fifty leads
  without storing anyone's raw IP.
- The initial migration is generated and **checked in**, so a reviewer runs
  `npm run db:deploy` and never has to author a migration.

**Two connection strings, on purpose.** `DATABASE_URL` is the pooled connection
the app runs on — serverless opens a connection per invocation, so without a
pooler the database runs out of connections under real traffic. It needs
`?pgbouncer=true` so Prisma stops issuing prepared statements, which PgBouncer
cannot keep across queries in transaction mode. `DIRECT_URL` is the same database
with `-pooler` removed, used only by `prisma migrate`: migrations take advisory
locks and run DDL in a session, and neither survives a transaction-mode pooler.
On a plain Postgres, set both to the same value.

---

## 3. Structure and typing

`5087522`

TypeScript in `strict` mode plus `noUncheckedIndexedAccess`. No JavaScript files
remain. Everything moved under `src/` in the layout our standards use.

The rule that shapes it — each layer knows only the one below:

```
component → hook → service → axios client → API route → repository → Prisma
```

`LeadForm` does not know `/api/lead` exists. `leads.service` does not know Prisma
exists. `lead.repository.ts` is the only file importing `@prisma/client`. Moving
the brokerage onto a CRM is a one-file change.

Three details worth pointing at:

- **`ApiResponse<T>` is a discriminated union.** A caller cannot read `data`
  without narrowing on `ok` first, so the compiler enforces error handling rather
  than a convention doing it.
- **The axios interceptor collapses every failure into one `ApiError`** — HTTP
  error, timeout, offline, malformed body. Nothing downstream ever sees an
  `AxiosError`, so hooks and components have exactly one error type to handle.
- **A compile-time assertion ties the budget constants to the Prisma enum.** The
  values are written out by hand rather than imported, because a client component
  uses them and pulling the Prisma runtime into the browser to read three strings
  costs ~100kB. The assertion is erased at build time, so a mismatch fails `tsc`
  instead of failing an insert in production.

---

## 4. Design — from template to term sheet

`058fde7`, `1fb7d3b`

The starter UI was the default: centred dark hero, white rounded card on a drop
shadow, `#1668e3` button. Nothing said Dubai, property, or off-plan — swap three
strings and it sells dental insurance.

**The argument behind the redesign:** an off-plan apartment is a milestone-based
payment obligation on a building that does not exist yet. You are not buying a
home, you are signing a payment schedule. So the page is set as a term sheet.

| Token | Choice | Reasoning |
|---|---|---|
| Ground | `#e5e6e1` cool drafting stock | Not the warm cream every generated landing page reaches for |
| Signal | `#1d2bd4` ultramarine | Exactly one saturated colour, used as a flat field rather than button decoration |
| Display | Archivo 700 | Tight and engineered; carries the headline and every figure |
| Body | Source Serif 4 | Reads as document prose, not marketing copy |
| Data | IBM Plex Mono | Labels every value like a spec sheet, tabular figures |

**Signature element:** the 20/40/40 payment plan drawn *to scale*, each band's
width its share of the total. The page's central claim rendered as information
rather than illustration, and the only thing that animates — once, on load,
disabled under `prefers-reduced-motion`.

Decisions that follow from the thesis:

- Form fields are **ruled lines, not boxes** — a control on a baseline reads as a
  line on a signed document.
- Success is a **receipt**, not a green tick: it echoes back what was sent with a
  short reference, because someone who just handed over a phone number wants proof.
- Assurances are a ruled definition list, not cards. They are clauses; clauses do
  not need boxes.
- No `01 / 02 / 03` markers anywhere except the payment plan, which is a genuine
  sequence where order carries meaning.

Fonts are self-hosted via `next/font` with `display: swap` — no render-blocking
request, no invisible text on first paint.

---

## 5. Tailwind v4 + shadcn

`1fb7d3b`

Moved onto the project's standard stack. OKLCH semantic tokens in `:root`, mapped
to utilities through `@theme inline`; **no component names a colour**.

- Form uses shadcn's current `Field` / `FieldLabel` / `FieldError` with
  `Controller` — not the retired `FormField` wrapper.
- Radix Select for the budget band. A native `<select>` cannot be styled
  consistently across browsers and its default chrome is much of what read as
  templated. Verified by keyboard: Enter opens, arrows move, Enter selects, focus
  returns to the trigger.
- Icons are Phosphor, one family throughout.

**Two Tailwind v4 traps worth recording:**

1. `--spacing-shell` in `@theme` silently broke the *entire* spacing scale —
   `gap-x-16` and friends stopped resolving. `max-w-*` reads the `--container-*`
   namespace, so the token is `--container-shell`.
2. Tailwind v4 resolves auto-detected sources against the **working directory**,
   not the project root. Started from elsewhere, it compiled a different project's
   classes into the CSS (`border-zinc-200`, `max-w-[1120px]` — none of which exist
   here) while dropping half of this one's. An explicit `@source` pins it and makes
   the build byte-identical wherever it is invoked.

**No dark mode**, deliberately. The page commits to a paper-document look; a dark
term sheet is a different design, not a token swap.

---

## 6. Layout and form UX

`bb2ea33`, `c83bec0`

Reported from the rendered page, and each one measured rather than eyeballed:

| Problem | Cause | Fix |
|---|---|---|
| Form felt thin | 373px fields; the split favoured the prose column | 420px+; the form gets a fixed measure, prose absorbs the rest |
| Ragged alignment | Body text capped at 62ch stopped short of the rules below it | Every left-column element flush; both columns' first baselines aligned |
| Gaps too large and uneven | Section margins each inventing their own spacing | One rhythm: section gap 56/80 → 40/48, page ~150px shorter with nothing removed |
| Value floating in the field | 48px control, 8px label gap | 44px control, 4px gap |
| Errors far from their label | Rendered under the control | Moved onto the label's line, right-aligned |
| Errors shifted the layout | Adding a message changed field height | Label-line placement keeps height constant |
| Text touching rail dividers | Cells padded on the right only — but the divider is the *previous* cell's right border | Padded both sides, outer edges flush |
| Panel scrollbar looked broken | Raw browser scrollbar, and the frame scrolled away with the content | Thin, on-brand bar; frame moved onto the scroll container so it stays put |
| Fields 1000px wide when stacked | Sheet inherited full width | Capped at 36rem, centred |
| Cramped at 1024–1280 | Two columns too narrow; headline wrapped to four lines | Split moved `lg` → `xl`; mid-size gets the stacked layout, form first |

**Sticky panel scrolling.** The form panel caps to the viewport with its own
scroll container and `overscroll-contain`, so a form taller than the screen stays
fully reachable instead of stranding the submit button — and the pointer scrolls
the form while over the form, the page everywhere else.

**Error message wording.** Long sentences wrapped on the label line, which
reintroduced the height change the placement existed to prevent. Shortened to
`Required`, `Enter a valid email`, `Enter a valid number`, `Choose a band`,
`Enter your full name` — verified single-line down to 375px. The error summary
still spells out the field name alongside it.

**Asterisks removed.** Every field here is required, so the form says that once
above the first field rather than repeating a symbol four times. `aria-required`
stays on each control, so assistive tech is still told per field.

---

## 7. Accessibility

Verified against **computed** colours in a real browser, not estimated from the
palette:

| Pair | Ratio | Needs |
|---|---|---|
| Ink / paper | 14.15 | 4.5 |
| Input value / panel | 16.70 | 4.5 |
| Valid label / panel | 8.54 | 4.5 |
| Accent text / paper | 7.50 | 4.5 |
| Error message and invalid label / panel | 7.40 | 4.5 |
| Error summary / its surface | 6.44 | 4.5 |
| Invalid field rule (non-text) | 7.40 | 3.0 |
| Scrollbar thumb (non-text) | 4.39 | 3.0 |

**Zero failures.** One real fix along the way: the field rule measured **2.64:1**
against 1.4.11's 3:1 threshold — and because the fields are ruled rather than
boxed, that line *is* the control's only boundary, so it is load-bearing.
`--border-strong` was darkened. The spec-grid hairlines were left light on
purpose: they separate cells whose values are already conveyed in text, so they
are decorative dividers and 1.4.11 does not bind them.

Also in place: skip link, visible 3px focus rings, one `Field` primitive carrying
`aria-required` / `aria-invalid` / `aria-describedby`, inline errors plus a
**focused** error summary on multi-error submit, no target under 44px, no
horizontal scroll at 375px, pinch-zoom untouched, single animation disabled under
reduced motion.

Colour is never the only cue: the message is words and the label turns red
alongside it. The `!` icon that used to sit beside errors was removed — it was
decoration on top of text, and at that size read as a warning triangle glued to
the label.

---

## 8. Bugs found by verifying, not by reading

Each of these passed `typecheck`, `lint` and `build` first.

1. **`npm start` 500-ed on every request.** Next 15.5 edge middleware throws
   `EvalError: Code generation from strings disallowed` on Node 24. Invisible in
   `next dev`. Security headers moved to `next.config.ts` — static, so they need no
   runtime at all — and the route reads `x-forwarded-for` itself. Middleware deleted.
2. **The error summary never received focus.** `requestAnimationFrame` fired before
   React committed it, so there was nothing to focus. Asserting
   `document.activeElement === summary` returned `false`. Now an effect keyed on
   `submitCount`, so a repeat failed submit re-announces.
3. **Unhandled promise rejection on failed submit.** `mutateAsync` rethrows out of
   `handleSubmit`; React Query already surfaces the error, so `mutate` is correct.
4. **The honeypot was teaching bots to pass.** `z.string().max(0)` returned a `422`
   naming the trap field. Fixed to accept silently — and then fixed properly
   again in §11, because silent discarding was itself the bug.
5. **Tailwind compiling the wrong project's classes** — §5 above.

---

## 9. Verification performed

- `npm run typecheck`, `npm run lint`, `npm run build` — clean, zero warnings.
- **Live Neon database:** migration applied over the direct host, a lead submitted
  through the browser written over the pooled host. The reference shown in the
  confirmation matched the row id. Email arrived trimmed and lowercased,
  `budgetRange` stored as the enum, `status` `NEW`, `source` and a 64-char `ipHash`
  stamped server-side.
- **Edge cases against the live database:** honeypot → stored and flagged;
  invalid → `422` with per-field errors; rate limit → `201` ×5 then `429`.
- **12 concurrent POSTs** against the original file store → 12 stored, none lost.
- Layout measured at 375, 1040, 1100, 1300 and 1440px.
- Radix Select driven entirely by keyboard.
- Contrast computed from rendered colours (§7).

---

## 10. Deployment

`3b2b98e` onward

Built for Vercel; `docs/DEPLOY.md` has the steps. Not GitHub Pages — Pages is
static only, and this needs a server for `POST /api/lead` and for Prisma to
reach Postgres. `npm run build` now runs `prisma generate` first so the client
exists in the deployed bundle.

**Demo mode.** With `DATABASE_URL` unset the app no longer 500s: the repository
falls through to an in-memory store (mirrored to `data/leads.json` when the
filesystem allows), so a reviewer can clone and use the form without
provisioning Postgres.

It is gated, logged and visible rather than silent, and that is the whole point.
On a serverless host the filesystem is read-only apart from a per-instance
`/tmp`, so a JSON write there can vanish with no error — a `200 OK` and a lost
lead, which is exactly the bug in §1.1 wearing a nicer face. So demo mode warns
once in the server log and the page renders a notice saying enquiries are not
being saved. If it is ever on in production it is obvious immediately.

Verified both ways: built and run with `.env` removed — banner shown, form
submits, no 500, warning logged; then restored — banner gone, lead written to
Neon.

---

## 11. The honeypot was eating real leads

Found on the deployed site. A genuine submission came back showing
`Reference: IGNORED` and never reached the database.

**Cause.** The honeypot input was `id="company"` with a label reading "Company".
Chrome maps that to the *organisation* field of a saved address profile and
autofills it — `autocomplete="off"` does not reliably stop Chrome for profile
fields, and `aria-hidden` and `tabindex="-1"` do not stop it at all. Any visitor
with a saved Chrome profile was silently classified as a bot.

Reproduced against production: an identical POST with `company` set returned
`202 {"id":"ignored"}` and wrote nothing, while the same POST without it
returned `201` and a real id. So the deployment and the database were never the
problem.

**Two fixes, because there were two mistakes.**

1. The trap is renamed to `referenceCode`, which maps to nothing in Chrome's
   autofill vocabulary. The form now contains no field matching
   company / organisation / address for autofill to aim at.

2. More importantly, a honeypot hit is no longer discarded. It is stored with
   `status: UNQUALIFIED`, so it never reaches the NEW queue the sales team works
   from, and the response is identical to a normal one so a bot still learns
   nothing. The enum already had `UNQUALIFIED`, so no migration was needed.

The second one is the real lesson. A spam heuristic on a lead-capture form has
to fail towards *keeping* the lead: a false positive costs a customer, and
silent deletion means nobody ever finds out it happened. This was the same
silent-loss failure as §1.1 — reintroduced, ironically, by code written to
protect the lead list.

Verified: a POST carrying the old `company` field is now stored as `NEW`, a POST
carrying `referenceCode` is stored as `UNQUALIFIED`, and nothing is dropped.

---

## Known gaps

Honest list, all covered in the README's handover note:

- **No notification on a new lead.** Leads are stored and sit there. For off-plan
  property, response time is close to everything. This is the first thing to add.
- **The rate limiter is per-process** and resets on deploy. It stops one person
  hammering the endpoint, not a distributed attack. `lib/rate-limit.ts` says so and
  names Upstash Redis as the swap; the call signature does not change.
- **No privacy notice or consent line.** Names, emails and phone numbers from UAE
  residents are being stored. A conversation with the client, not a coding task, but
  it belongs before the first real lead.
- **Every figure on the page is illustrative** — price, unit sizes, handover date.
  All isolated in `src/constants/project.ts`, so replacing them is one file.
- **No automated tests.** Verification here was manual and reproducible but not
  codified. A first suite would cover the Zod schema, the repository, and the route's
  status codes.
