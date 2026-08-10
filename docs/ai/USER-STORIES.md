# User stories — AI Knowledge Assistant

Format: **As a… I want… So that…**  
**PO locks:** Aug 10, 2026 — see [VISION.md](./VISION.md)

---

## Epic

**As a** workspace member with channel access,  
**I want** AI help to understand conversation history,  
**So that** I catch up and respond faster without the AI changing workspace data for me.

---

## US-AI1 — Channel summary

**As a** channel member,  
**I want** a summary of recent messages,  
**So that** I grasp the thread without reading every line.

**Acceptance**
- [ ] Entry from channel AI panel
- [ ] Uses last N messages (capped); empty channel → clear empty state
- [ ] Non-access → **404**

---

## US-AI2 — Catch me up

**As a** member returning after time away,  
**I want** a summary since a chosen time (yesterday / 7 days / custom ISO),  
**So that** I only review what I missed.

**Acceptance**
- [ ] `since` required (ISO); presets set it client-side
- [ ] Only messages with `createdAt >= since`
- [ ] Truncation note when window exceeds caps

---

## US-AI3 — Ask about conversations

**As a** member,  
**I want** to ask a question over messages I’m allowed to see,  
**So that** I get grounded answers (or “not in the provided messages”).

**Acceptance**
- [ ] Question required; answer cites only provided context
- [ ] Private isolation identical to chat

---

## US-AI4 — Explain a message

**As a** member,  
**I want** context/explanation for one message,  
**So that** cryptic lines make sense from nearby talk.

**Acceptance**
- [ ] Action on a message in the transcript
- [ ] Loads target + ±K neighbors in same channel
- [ ] Wrong channel / missing → **404**

---

## US-AI5 — Draft a reply

**As a** member,  
**I want** a suggested reply in the composer,  
**So that** I can edit and Send myself.

**Acceptance**
- [ ] Draft inserted into composer — **never** auto-POSTed
- [ ] Optional tone hint

---

## US-AI6 — Meeting notes

**As a** member,  
**I want** structured notes (summary, decisions, action items) as markdown,  
**So that** I can copy/edit them outside chat.

**Acceptance**
- [ ] Panel shows editable/copyable markdown
- [ ] No automatic Docs collection write

---

[← Vision](./VISION.md) · [E2E →](./E2E-FLOWS.md)
