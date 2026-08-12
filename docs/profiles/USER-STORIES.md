# User stories — Profile v1

## US-P1 — Edit my profile

**As a** signed-in user  
**I want** to set my display name, title, bio, timezone, links, and avatar  
**So that** teammates see who I am at work.

**Acceptance**
- `/profile` loads my current fields  
- Save updates immediately; invalid fields → 400  
- Avatar: pick image → upload → appears; remove clears `avatarUrl`  
- Initials shown when no avatar  

## US-P2 — View a teammate

**As a** workspace member  
**I want** to open a teammate’s card from members list, channel members, or a message author  
**So that** I see title, bio, links, timezone, and email.

**Acceptance**
- Shared workspace → 200 with profile + email  
- Not in that workspace → 404  
- Non-member subject (not in workspace) → 404  

## US-P3 — Empty profile still works

**As a** teammate viewing someone who never filled the form  
**I want** a clean card with name + initials  
**So that** missing fields don’t look broken.

---

[← Vision](./VISION.md) · [E2E →](./E2E-FLOWS.md)
