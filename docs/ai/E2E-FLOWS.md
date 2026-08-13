# End-to-end flows — AI Knowledge Assistant

**Status:** ✅ Core Path A E2E verified (manual, Aug 10–11, 2026) · 📋 Link-context flow H / S14 documented (Aug 13) · ⬜ US-AI10 not coded yet  
**PO locks:** Path A · OpenAI · read-only · windowed context · (+ link excerpts when US-AI10 ships)  
**Prerequisite:** `OPENAI_API_KEY` in `.env.local` + restart Next. Realtime optional for AI routes but needed for normal live chat.

---

## Technical flows (as built)

### A) Summarize channel

```text
1. Member opens channel → AI panel → Summarize
2. POST …/ai/summarize { limit? }
3. Server: auth → requireChannelAccess → load last N → OpenAI → { text, meta }
4. Panel shows markdown/text
```

### B) Catch me up

```text
1. User picks preset (yesterday / 7d) or custom since
2. POST …/ai/catch-up { since }
3. Load messages createdAt >= since (capped) → summary
```

### C) Ask

```text
1. User types question in AI panel
2. POST …/ai/ask { question, limit?, since? }
3. Answer grounded in window; refuse hallucination when missing
```

### D) Explain message

```text
1. Right-click / long-press message → Explain with AI (explore tour may pin sparkle)
2. POST …/ai/explain { messageId }
3. Target + neighbors → explanation dialog
```

### E) Draft reply

```text
1. AI panel → Draft reply (optional tone)
2. POST …/ai/draft-reply { tone? }
3. If window has no teammate messages → 400 (do not insert)
4. Else draft as current user, aimed at others’ messages → insert into composer
5. User edits and Sends via existing message POST (AI never auto-posts)
```

### F) Meeting notes

```text
1. AI panel → Notes (optional since)
2. POST …/ai/notes { since?, limit? }
3. Structured markdown in panel; Copy button
```

### G) Security / isolation

```text
1. Workspace member not in private channel → all AI routes 404
2. Rate limit exceeded → 429
3. Missing OPENAI_API_KEY → 503 user-safe message
```

### H) Link context (V1 — planned · docs locked)

**Status:** ⬜ Not implemented yet — see [LINK-CONTEXT.md](./LINK-CONTEXT.md) · US-AI10

```text
1. Channel has messages that include public https URLs (e.g. Stack Overflow)
2. Member runs Explain on a message that cites the link (or Ask / Catch up over the window)
3. Server: build message window → extract URLs → SSRF-safe fetch → HTML→text excerpts
4. Prompt = transcript + “Linked pages” block → provider → answer uses page substance
5. If fetch fails / blocked → AI still answers from chat; meta may note failure
6. No preview cards required in the transcript for this slice
```

---

## Test setup

| Need | Why |
|------|-----|
| Two accounts (A + B), preferably normal + incognito | Draft, private channel, “teammate message” cases |
| Channel with a **real multi-turn technical thread** (see sample below) | Summarize / ask / notes need substance |
| DevTools → Network filter `ai/` | Confirm status codes (200 / 400 / 404 / 429 / 503) |
| Message count before/after AI actions | Prove read-only (count unchanged until user Send) |

---

## Sample conversation (seed data for tests)

Paste as **two users** in order (A = Maya voice, B = Arjun voice). Topic: separate Socket.IO vs merge into Next.

1. **A:** hey — quick architecture check before we lock Phase 6 deploy. I’m still uneasy about running Socket.IO as a separate process on Railway. Feels like extra ops for a learning project. Why not just attach sockets to the Next server?  
2. **B:** fair question. short answer: Next route handlers are request/response. WebSockets need a long-lived process. On serverless that dies. even on Node, mixing REST + sockets in one process makes deploys riskier — one bad socket leak takes down HTTP too.  
3. **A:** ok but we’re on Railway Option B anyway, always-on Node. so the “serverless kills sockets” argument is weaker for us, right?  
4. **B:** weaker, not gone. we still want a clean boundary: Next owns truth (Mongo writes), realtime owns fan-out. that split is what we documented — HTTP source of truth, socket is notification bus. if we merge them now we’ll rewrite later when we scale or split hosts.  
5. **A:** another thing — if sockets are separate, how do we trust `channel:join`? cookie to another origin?  
6. **B:** same session cookie / shared secret path we already built. handshake resolves userId, then every `channel:join` re-checks `canAccessChannel`. private channel without membership → deny. we must never treat “has a socket” as “is allowed.”  
7. **A:** got it. so authz on join mirrors REST 404 behavior. good interview line too.  
8. **B:** exactly. also typing/presence stay ephemeral — no DB writes. messages always POST REST first, then `notifyRealtime` → `message:new`.  
9. **A:** when do we need Redis adapter? two Railway instances would break rooms today, yes?  
10. **B:** yes. single instance = in-memory rooms are fine for v1. multi-instance without Redis adapter = user A on instance 1 never sees emits from instance 2. I’d defer Redis until we actually horizontally scale. premature infra tax.  
11. **A:** agreed — note that as explicit later item, not a blocker for demo.  
12. **A:** decision proposal: keep separate Socket.IO service, Next stays REST+UI, Option A internal HTTP emit for v1, Redis later. anyone blocking?  
13. **B:** no block. one ask: document the failure mode for teammates — if realtime is down, chat history still works via REST, only live append fails. reconnect banner + gap fetch covers blips.  
14. **A:** perfect. I’ll update deploy.md with that “degraded mode” note tonight.  
15. **B:** I’ll add a smoke checklist: connect → join private → deny outsider → send message → peer sees live. want that in E2E-FLOWS?  
16. **A:** yes please. also can you spike whether `REALTIME_INTERNAL_SECRET` rotation needs zero-downtime? not urgent — park in backlog.  
17. **B:** parked. shipping separate realtime as locked. thanks for pushing on the “why not merge” angle — forced us to articulate it.  
18. **A:** np. locking in standup tomorrow: separate process ✅ · Redis ❌ for now · degraded REST-only if socket down ✅  

**Ground-truth answers for Ask / Notes**

| Question | Expected answer direction |
|----------|---------------------------|
| Did we decide to use Redis now? | No — deferred until multi-instance |
| What’s the deploy decision? | Separate Socket.IO; Next = REST+UI; internal HTTP emit v1 |
| What’s our Stripe plan? | Not in messages / don’t know |
| Action items? | Update deploy.md (degraded mode); E2E smoke; secret rotation backlog |

---

## Manual test scenarios (pass / fail)

### S1 — Summarize

**Steps:** Open seeded channel → AI → Summarize → Generate.  
**Pass:** Coherent summary mentioning separate Socket.IO, REST as truth, Redis deferred; meta shows message count.  
**Fail:** Empty/garbage text, 5xx, or invents topics not in the thread.

### S2 — Catch me up

**Steps:** Prefer older messages earlier in the day (or seed rounds 1–8 first, wait / set clock narrative), then newer decision messages; Catch up → Since yesterday (or Last 7 days).  
**Pass:** Emphasizes what changed in the window (e.g. decision + Redis defer).  
**Fail:** Ignores `since` and treats ancient + new as one undifferentiated blob with no time focus.

### S3 — Ask (grounded)

**Steps:** Ask: “Did we decide to use Redis in v1?”  
**Pass:** Answer is no / later / deferred, grounded in B’s messages.  
**Fail:** Claims Redis is required now or invents a different decision.

### S4 — Ask (out of context)

**Steps:** Ask: “What’s our monthly AWS bill?”  
**Pass:** Explicitly says not in the provided messages / doesn’t know.  
**Fail:** Invents a dollar amount or vendor plan.

### S5 — Explain message

**Steps:** Explain A’s message: “so the serverless kills sockets argument is weaker for us, right?”  
**Pass:** Clarifies Railway always-on vs still wanting process boundary.  
**Fail:** Generic essay unrelated to that line / neighbors.

### S6 — Draft: only my messages

**Steps:** As A, in a channel where the AI window has **only A’s** messages → Draft.  
**Pass:** Toast / 400 — *Nothing from a teammate to reply to yet*; composer unchanged.  
**Fail:** Inserts “I agree with your approach…” (self-reply).

### S7 — Draft: teammate spoke last

**Steps:** B posts a question or the last seeded B message; as A → Draft (any tone).  
**Pass:** Composer fills with text in **A’s** voice answering **B**; panel closes with insert toast.  
**Fail:** Draft agrees with A’s own earlier proposal as if A were someone else.

### S8 — Draft never auto-posts

**Steps:** After S7, note message count → do **not** Send → wait → refresh.  
**Pass:** No new message from AI alone.  
**Fail:** A message appears without clicking Send.

### S9 — Draft then user Send

**Steps:** Edit draft if needed → Send.  
**Pass:** Normal `POST …/messages`; peers see it live; AI did not call create on its own.  
**Fail:** Duplicate posts or send without user action.

### S10 — Meeting notes

**Steps:** AI → Notes → Generate → Copy.  
**Pass:** Markdown with Summary / Decisions / Action items / Open questions; decisions match seed (separate sockets, Redis later); Copy works; channel message count unchanged.  
**Fail:** Auto-creates a channel message or Docs row.

### S11 — Private channel isolation

**Steps:** A creates private channel, does **not** invite B. B opens AI on that channel (or calls `POST …/ai/summarize`).  
**Pass:** UI/API **404** (same as chat).  
**Fail:** 200 with summary of private messages.

### S12 — Missing API key

**Steps:** Remove/rename `OPENAI_API_KEY`, restart Next, Summarize.  
**Pass:** User-safe **503** toast (not raw stack trace).  
**Fail:** Uncaught error page or empty hang with no message.

### S13 — Rate limit

**Steps:** Hammer Summarize (~30+/hour per user).  
**Pass:** Eventually **429** with clear message.  
**Fail:** Unlimited spend / silent failures.

### S14 — Link context (V1 · when US-AI10 ships)

**Setup:** Seed a short thread that pastes a **public** docs / SO URL and discusses one concrete claim from that page (do not rely on paywalled pages).

**Steps:** Explain the message that cites the link (or Ask: “What does the linked page say we should do?”).  
**Pass:** Answer reflects substance from the fetched page (or clearly cites the excerpt), not only the URL hostname.  
**Fail:** Invents page content that was never fetched; or hangs forever on a bad URL.

**Steps (failure path):** Use a URL that times out / 404 / blocked host.  
**Pass:** AI still returns using chat text; user-safe behavior; no SSRF to internal addresses.  
**Fail:** 5xx with stack traces; or server tries `http://127.0.0.1` / metadata IP.

---

## 15-minute smoke (minimum bar)

- [ ] S1 Summarize OK  
- [ ] S3 Ask grounded OK  
- [ ] S4 Ask out-of-context refuses OK  
- [ ] S6 Draft blocked when alone OK  
- [ ] S7 Draft answers teammate OK  
- [ ] S8 + S9 Draft insert + manual Send OK  
- [ ] S5 Explain OK  
- [ ] S10 Notes + copy OK  
- [ ] S14 Link context OK *(after US-AI10)*  

**Release bar:** all smoke items + S11 private 404.  
**Link-context release bar:** S14 pass + SSRF checklist in [LINK-CONTEXT.md](./LINK-CONTEXT.md).

---

## Manual E2E checklist (compact)

- [ ] Summarize on seeded thread returns coherent text  
- [ ] Catch-up respects time window  
- [ ] Ask grounded + Ask “not in context”  
- [ ] Explain uses neighbors  
- [ ] Draft blocked with only own messages  
- [ ] Draft answers teammate; never auto-posts; user Send works  
- [ ] Notes copyable; no AI-written channel messages  
- [ ] Private outsider → 404  
- [ ] Missing key → 503; spam → 429  
- [ ] Linked public URL improves Explain/Ask (S14) — when US-AI10 ships  
- [ ] Bad/private URL soft-fails; no SSRF  

---

[← User stories](./USER-STORIES.md) · [API →](./API-ROUTES.md)
