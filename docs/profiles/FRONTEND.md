# Frontend — Profiles

| Screen | Route / entry | Component |
|--------|---------------|-----------|
| Edit own | `/profile` | `components/profile/edit-profile-form.tsx` |
| Teammate card | Dialog | `components/profile/profile-card-dialog.tsx` |
| Avatar | Shared | `components/profile/user-avatar.tsx` |

**Entry points (click → card)**  
- Workspace members table (name/avatar)  
- Channel members panel row  
- Message list author name / letter  

**Nav:** Sidebar → Profile  

**Data:** RTK `store/api/profile/profile-api.ts` (+ extend `auth-api` `CurrentUser`).

---

[← API](./API-ROUTES.md) · [Lib →](./LIB-AND-MODELS.md)
