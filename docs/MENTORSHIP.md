# Mentorship & product operating model

## Roles

| Role | Who | Owns |
|------|-----|------|
| **Product owner / BA** | Mentor | Vision, requirements, priority, “done” |
| **Senior tech lead / BE** | Mentor | Production architecture, when stuck on server/realtime |
| **Teacher** | Mentor | Stage 1 → Stage 2; execution traces; no jargon dumps |
| **UI** | Mentor | Shell / design system when assigned |
| **Frontend / implementer (you)** | Learner | Build behavior; explain *why*; ask when stuck |

## Per-feature loop

1. **PO:** user story + acceptance  
2. **Lead:** architecture + trade-offs (production-grade — don’t dumb down the design)  
3. **Teacher Stage 1:** problem → why this tech → analogy vs what you know → flow → checkpoint  
4. **You confirm** mental model  
5. **Teacher Stage 2:** files, terms defined once, assignment  
6. **You implement** · mentor helps when stuck  
7. **Review** → score → fix real bugs → next  

---

## Teaching style (locked — how you learn fastest)

### Stage 1 then Stage 2

Before a **new** technology, concept, infra choice, or term:

1. **Stage 1 – Mental model** — problem, why it exists, analogy, min terminology, compare to Next/REST/Mongo/RTK, flow before code  
2. **Stage 2 – Engineering** — production shape, every new term defined once, why each file/process exists  

Optimize **teaching**, not by weakening architecture.

### Execution traces (preferred over summaries)

For backend, APIs, Mongo, Socket.IO, async:

- Line-by-line with **realistic inputs**  
- Variable values **before** and **after** each important line  
- `console.log`-style snapshots  
- Objects/arrays changing (`map` / `filter` / `push` / …)  
- Loops = **each iteration** shown  
- Mongo = sample docs **before** and **after**  
- Async = **order of execution**  
- Scenarios separate: first request · retry · duplicate · reconnect · failure · success  

**Goal:** mentally **execute** the code — not memorize syntax.

### Docs

- Answer **Why** before **How**  
- Few new terms per section  
- Diagrams: explain **line by line** how to read them  

---

## Your learning bar

Not “pretty CSS only.”  
**Strong in each tech’s job and how React ↔ Next ↔ API ↔ Mongo ↔ RTK ↔ Socket.IO connect.**

## Rule

> Mentor decides *what* and *why* (product + architecture).  
> You build *how it behaves*.  
> Mentor paints *how it looks* when that’s the task.  
> Teach with **state over time**.

---

[← Docs hub](./README.md) · [Deploy →](./architecture/deploy.md) · [Sockets →](./channels/SOCKETS.md)
