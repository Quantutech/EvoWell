# SYSTEM_REFACTOR_PLAN

## 1. Database Schema Audit & Refactor

### Current State
- **User:** Base identity (Auth).
- **ProviderProfile:** Rich profile linked to User.
- **Client:** No dedicated profile table; relies on base `User` + `Appointments` join.

### Proposed Schema (Supabase & Types)
We will introduce a strict separation of concerns by ensuring *every* role has a corresponding profile extension.

#### `public.client_profiles`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | PK, references `auth.users` |
| `user_id` | uuid | FK to `public.users` |
| `intake_status` | enum | `PENDING`, `COMPLETED` |
| `preferences` | jsonb | `{ communication: 'email'|'sms', ... }` |
| `documents` | jsonb[] | `[{ type: 'intake', url: '...' }, { type: 'insurance', url: '...' }]` |
| `emergency_contact` | jsonb | `{ name, phone, relation }` |
| `created_at` | timestamp | |

#### `public.provider_profiles` (Enhancements)
- Ensure `documents` or `verification_docs` is a formal column (currently using `certificates` array as workaround).

### TypeScript Interfaces
```typescript
interface ClientProfile {
  id: string;
  userId: string;
  intakeStatus: 'PENDING' | 'COMPLETED';
  documents: { type: string; url: string; uploadedAt: string }[];
  emergencyContact?: { name: string; phone: string };
}
```

---

## 2. Route Protection & Redirection (RBAC)

### Current State
- Single `/dashboard` route that switches content based on role.
- Vulnerable to logic errors where a provider might render a client view if role check fails.

### Proposed Routing Strategy
Split the application into distinct "Apps" within the router to enforce strict boundaries.

| Role | Base Route | Redirect Logic |
| :--- | :--- | :--- |
| **Client** | `/portal` | If accessing `/console` -> Redirect to `/portal` |
| **Provider** | `/console` | If accessing `/portal` -> Redirect to `/console` |
| **Admin** | `/admin` | Strict Access Control |

#### Implementation Plan
1.  **Refactor `App.tsx` Routes:**
    -   Replace generic `/dashboard` with specific parents.
    -   `<Route path="/portal/*" element={<ClientGuard><ClientLayout /></ClientGuard>} />`
    -   `<Route path="/console/*" element={<ProviderGuard><ProviderLayout /></ProviderGuard>} />`
2.  **Update `LoginView`:**
    -   On success, switch based on role:
        -   `CLIENT` -> `/portal`
        -   `PROVIDER` -> `/console`
        -   `ADMIN` -> `/admin`

---

## 3. Provider Dashboard Overhaul ("Professional Console")

### Concept
Shift from the "Wellness App" vibe to a "Practice Management OS".

### Layout Changes
- **Navigation:** Move from Top Bar to **Left Sidebar** (Collapsible).
- **Theme:** Enforce `data-theme="provider"` (Indigo/Violet/Slate).

### Key Modules (Priority Order)
1.  **Status Banner:** Persistent alert if `moderationStatus === 'PENDING'` or `!isPublished`.
2.  **"Today's Pulse":** High-level metrics row (Appointments Today, Pending Requests, Unread Messages).
3.  **Upcoming Schedule:** specialized list view (not calendar) of next 3 appointments with "Join Call" buttons.
4.  **Earnings Widget:** Simple chart of current month's projected revenue.

---

## 4. Dynamic Client Uploads

### User Story
"As a Client, I want to upload my insurance card and previous medical records securely."

### Implementation
1.  **UI Component:** Create `ClientDocumentCenter` in `/portal/documents`.
2.  **Storage:** Use `storageService` (Phase 2) with path `clients/{userId}/docs/{filename}`.
3.  **Persistence:** Save resulting URLs to `client_profiles.documents`.
4.  **Provider Access:** Update Provider Dashboard to fetch/view linked client documents in the Appointment/Patient details view.

---

## 5. Execution Order
1.  **Database/Types:** Create `ClientProfile` types and `api` methods.
2.  **Routing:** Refactor `App.tsx` to split `/portal` and `/console`.
3.  **Client Features:** Implement Document Center.
4.  **Provider UI:** Rebuild Dashboard layout.
