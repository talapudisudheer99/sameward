# Support email — support@sameward.com (Namecheap + ImprovMX)

**Status: done.** `support@sameward.com` receives mail and forwards to a real inbox. The steps below
are kept as the record of what was changed and how to roll it back.

Current state:

| Piece                     | Value                                             |
| ------------------------- | ------------------------------------------------- |
| Apex `@`                  | ALIAS → `q4xpj4ok.up.railway.app`                 |
| Namecheap Mail Settings   | Custom MX                                         |
| MX                        | `mx1.improvmx.com` (10), `mx2.improvmx.com` (20)  |
| Apex SPF                  | `v=spf1 include:spf.improvmx.com ~all`            |
| ImprovMX alias            | `support@sameward.com` → personal Gmail           |
| App default               | `lib/support.ts` fallback is `support@sameward.com` |

Sending (Resend, `no-reply@sameward.com`) is a separate system and was **not** touched.

## Why the DNS work came first

The apex used to be a real CNAME:

```
sameward.com.  IN  CNAME  q4xpj4ok.up.railway.app.
```

A CNAME cannot coexist with any other record at the same name (RFC 1034), so **MX records at the
apex were impossible** while it existed. Adding MX in Namecheap would have silently done nothing.

Namecheap BasicDNS supports **ALIAS**, which is apex-safe: the nameserver resolves the target and
answers with real A records, so it coexists with MX. Railway supports ALIAS/ANAME for root domains.

Resend is unaffected — its records live on the `send.sameward.com` subdomain.

## Before you start

- Do it at a quiet hour: deleting the apex CNAME briefly makes `sameward.com` unresolvable.
- Optional, reduces the gap: a few hours earlier, set the apex CNAME TTL to **1 min** in Namecheap.
  Current TTL is ~18 min, which is how long stale answers may linger.
- Record the current apex value so you can roll back: `q4xpj4ok.up.railway.app`

Namecheap path for everything below: **Domain List → Manage (sameward.com) → Advanced DNS**.

## Step 1 — Swap apex CNAME → ALIAS

1. Under **Host Records**, find the record with Host `@` (Type: CNAME Record, Value:
   `q4xpj4ok.up.railway.app`). **Delete** it. Namecheap refuses an ALIAS while a CNAME/A/AAAA/URL
   Redirect exists on the same host.
2. **Add New Record** → Type **ALIAS Record**, Host `@`, Value `q4xpj4ok.up.railway.app`,
   TTL Automatic. Save.
3. Leave every other record alone — especially `realtime`, `www`, `send`, and any
   `resend._domainkey` entries.

Verify (apex must now answer with an **A record**, not a CNAME):

```bash
dig sameward.com A +noall +answer     # expect: sameward.com. IN A <ip>  (no CNAME line)
curl -I https://sameward.com          # expect: 200/3xx from Railway
curl -I https://realtime.sameward.com # unchanged
```

Also confirm the custom domain still shows healthy in the Railway dashboard.

## Step 2 — Enable MX in Namecheap

Namecheap hides MX behind a mode switch:

1. On the same Advanced DNS page, find **Mail Settings**.
2. Change it to **Custom MX**. (If it is on Email Forwarding / Private Email / No Email Service,
   your MX records will not apply.)

## Step 3 — Create the ImprovMX forward

1. Sign up at <https://improvmx.com> and add the domain `sameward.com`.
2. Create the alias: `support` → forwards to your real inbox (e.g. `sudheertalaudi@gmail.com`).
3. ImprovMX will show the records to add. In Namecheap add:

| Type | Host | Value              | Priority |
| ---- | ---- | ------------------ | -------- |
| MX   | `@`  | `mx1.improvmx.com` | 10       |
| MX   | `@`  | `mx2.improvmx.com` | 20       |

4. Add SPF so forwarded mail is trusted:

| Type | Host | Value                             |
| ---- | ---- | --------------------------------- |
| TXT  | `@`  | `v=spf1 include:spf.improvmx.com ~all` |

Only **one** SPF TXT record may exist at the apex. There is none today, and Resend's SPF lives on
`send.sameward.com`, so there is no conflict.

Verify:

```bash
dig +short MX sameward.com   # expect mx1/mx2.improvmx.com
dig +short TXT sameward.com  # expect the improvmx spf line
```

Then send a real test message to `support@sameward.com` from an outside account and confirm it
lands in your Gmail. **Do not proceed until this works.**

## Step 4 — Point the app at it

Only after Step 3 delivers mail.

Railway → **web service** (not realtime) → Variables:

```bash
NEXT_PUBLIC_SUPPORT_EMAIL=support@sameward.com
```

`NEXT_PUBLIC_*` is baked in at build time, so **redeploy** the web service — a restart is not enough.

Locally in `.env.local`, add the same line and restart `npm run dev`.

The fallback in `lib/support.ts` is now `support@sameward.com` too, so the app shows the right
address even if the variable is ever missing. The variable stays useful for pointing a preview
environment somewhere else without a code change.

## Step 5 — Smoke test

- https://sameward.com/settings → **Email support** opens a mail draft to `support@sameward.com`
- Marketing footer shows the same address
- A message sent to that address arrives in your inbox
- Verification / reset / invite emails still send (Resend untouched)

## Rollback

If the site breaks after Step 1: delete the ALIAS record and re-add
Host `@` → Type **CNAME Record** → Value `q4xpj4ok.up.railway.app`. That restores the current state.
MX/TXT additions are independent and safe to remove at any time.

## Do not change

MongoDB, S3, Google OAuth, OpenAI, Resend/`EMAIL_FROM`, `REALTIME_URL`, or any existing
`teamhub`-named infrastructure identifier.
