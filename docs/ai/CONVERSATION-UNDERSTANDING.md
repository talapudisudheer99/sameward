# Conversation understanding — product architecture

**Status:** **V1.5 direction locked** (Aug 12, 2026) · **V1 link-context docs locked** (Aug 13) · Path A **V1** already shipped  
**Audience:** Product + engineering — plain language first.

This note answers one question:

> After someone is away, how does TeamHub help them get back on the same page — without reading hundreds of messages or asking everyone for a KT?

And the follow-up:

> After I understand the summary, how do I ask about one specific thing and see **where** that happened?

---

## 1. The real problem

Work continues when a teammate is gone.

Example:

1. Sudheer takes leave for a week.
2. The team keeps talking in channels.
3. `#engineering` grows by ~500 messages. `#product` grows by ~500.
4. Sudheer returns to roughly **1,000 unread messages**.

The hard part is **not** “can he open the chat?”

The hard part is:

**He cannot efficiently recover the context of what happened while he was away.**

He should not have to ask everyone for a walkthrough or read hundreds of messages just to know what changed.

### What TeamHub AI is for

Turn a large conversation into the **context a returning teammate needs** — then let them dig into one detail with **evidence** (source messages).

---

## 2. What we will not do

We will **not** design the default path as:

> Take all 500 messages → send them straight to the AI → “summarize this.”

That costs too much, runs slowly, hits size limits, and buries decisions in noise.

**Principle:** Don’t make the AI read *more*. Give it *better* context.

---

## 3. Source of truth

**Original messages in the database stay the source of truth.**

Anything the AI produces is **derived help**. It never replaces the real chat. Summaries can be wrong; teammates must always be able to open the original messages.

---

## 4. Roadmap (locked)

| Stage | Goal | Status |
|-------|------|--------|
| **V1** | Prove Channel AI with a limited message window | ✅ Shipped |
| **V1 link-context** | When teammates paste public URLs, AI can use short page excerpts | 📋 Docs locked · ⬜ code next — [LINK-CONTEXT.md](./LINK-CONTEXT.md) |
| **V1.5** | Large-history Catch up + smarter Ask with sources + cache expensive results | 🎯 After link-context code |
| **V2** | Persistent conversation knowledge + stronger retrieval (when users prove they want it) | Later |

There is **no separate V3**. “Find the right moment, then answer” belongs in **V1.5** in a limited form (no vector database yet).

---

## 5. V1 — What we have now

User asks → we load an **authorized, limited** slice of messages → AI answers.

Good for proving the idea. It does **not** fully solve “500 messages while I was away.”

**Gap:** pasted links are only URL strings in that slice. Closing that gap is **V1 link-context** (AI-time fetch), not V1.5.

---

## 6. V1.5 — What we will build next

### Core objective

Solve:

1. **“I was away. There are hundreds of messages. Help me understand what happened without making me read everything.”**
2. **“I understood the summary, but I have a question about one specific thing. Find where that happened and explain it.”**

So V1.5 has **two connected capabilities** (per channel):

1. **Large-history Catch up**  
2. **Contextual Ask** — find the right moment, answer, show sources  

Plus: **cache expensive Catch-up / Summarize results** so we don’t regenerate the same work for free.

### Capability A — Large-history Catch up

**Small history** (about 50–60 messages or fewer):

Messages → AI → Catch-up

**Large history** (e.g. hundreds of messages):

Messages → split into chunks (~50 messages each as a processing size) → chunk summaries → merge → final Catch-up

Chunk summaries should pull out useful **team signals**, not a vague paragraph:

- Decisions  
- Completed work  
- Changes  
- Action items  
- Open questions  
- Important discussions  
- Mentions of the user  

The final answer is a **return-to-work** catch-up (what changed, what’s open, what needs you) — not a 10-paragraph essay.

~50–60 is a starting chunk / threshold size for the machine. It is **not** a forever product memory rule. Blind cuts can split one discussion across two chunks; we may improve boundaries later without changing the product idea.

### Capability B — Contextual Ask (“find the right moment”)

After Catch-up, the user might ask:

> “Why did we move the release to Friday?”

We should **not** send 500 messages to the AI again.

Instead:

1. Take the question  
2. Find likely relevant messages (search / filters / simple scoring — see below)  
3. Load a **small** context window around those messages  
4. Ask the AI  
5. Return the answer **and** show **source messages** the user can open  

Example answer shape:

> The release was moved to Friday because payment integration still had unresolved issues.

> **Sources**  
> Aug 9 — “Payment webhook is still failing…”  
> Aug 9 — “Let’s move release to Friday…”

Sources matter. Without them, the user cannot tell if the AI found the right conversation.

### How we find messages in V1.5 (no vector DB yet)

For V1.5 we use normal database tools and light scoring, for example:

- Keyword matching from the question  
- Date / time filters  
- Message metadata  
- Chunk or catch-up text we already produced  
- Mentions  
- Simple relevance ranking  

**Not in V1.5:** embeddings for every message, or a vector search product.

If that later proves too weak, **V2** can add embeddings and stronger retrieval.

### Cache expensive results

For V1.5, persist the **final** Catch-up / Summarize results (not necessarily every intermediate chunk).

Store enough metadata to know if a result is still valid, for example:

- Who asked (user)  
- Which channel  
- Type (catch-up / summarize)  
- Time range covered  
- How many messages were analyzed  
- Last message id included  
- When it was created  
- The text result  

Keep recent useful results rather than regenerating the same expensive run every time.

### Per channel only

Catch-up, Summarize, and Ask stay **inside one channel**.

- Open `#engineering` → AI for that channel only  
- Open `#product` → AI for that channel only  

A **workspace-wide** “catch me up everywhere” overview is **out of scope** for V1, V1.5, and V2. Revisit only if real usage demands it.

### What V1.5 deliberately does **not** include

- Vector database / embeddings for every message  
- Background AI workers that process every message as it arrives  
- Permanent conversation “memory” graphs  
- Complex topic clustering products  
- Workspace-wide knowledge graphs  
- Agents that post, edit, or change the workspace for you  

Validate that people use Catch-up and Ask first. Then invest in V2.

---

## 7. V2 — Later (after feedback)

Only after we know people use this intelligence:

- Build **persistent** per-channel conversation knowledge over time (decisions, open questions, etc.)  
- Stronger find/retrieve (including embeddings if needed)  
- Still: original messages = source of truth; AI never auto-posts  

Still **no** requirement for a workspace-wide overview unless we reopen that decision.

---

## 8. Product honesty (always)

Never claim: “The AI read every message.”

Say something like: “TeamHub looked at the conversation since your last visit and pulled out important changes, decisions, and discussions.”

Show scope in the UI, for example:

- Catch-up based on **427 messages since Aug 5**  
- **Analyzed across 8 conversation segments** when multi-pass was used  
- Ask answers with **visible source messages**

---

## 9. Picture of V1.5

```
                 TeamHub AI V1.5
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
        Catch up                      Ask
           │                         │
   How many messages?         Find relevant messages
           │                         │
      ┌────┴────┐                    ▼
      │         │              Small context window
    Small     Large                  │
      │         │                    ▼
      │      Chunk → summarize     AI answer
      │         │                    │
      │      Merge                   │
      └─────────┴────────────────────┘
                        │
                        ▼
                      Teammate
                 (+ sources on Ask)
                 (+ cache on Catch-up / Summarize)
```

**PO / engineering line:**

> **V1.5 = intelligent context selection** (compress large history + find a small window for Ask).  
> **V2 = persistent conversation intelligence** (background knowledge + stronger retrieval).

That keeps V1.5 ambitious enough to match the leave story, without building an AI platform before we know users want it.

---

## 10. What this doc is (and isn’t)

| This doc | Not this doc |
|----------|----------------|
| Problem, V1.5 scope, V2 later | Exact API field names forever |
| Catch-up + Ask + cache direction | Ticket-by-ticket code plan (see Tasks when written) |
| Hard “not in V1.5” list | Permission to start embedding infrastructure now |

**Next:** implement V1.5 against this doc; keep Path A V1 as the foundation already shipped.

---

[← AI module hub](./README.md) · [Vision →](./VISION.md)
