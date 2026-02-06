# SYSTEM_RECOVERY_PLAN

## 1. Executive Summary
This document outlines the critical architectural fixes required to restore system integrity. The core issue is that the application currently operates in a "Mock Mode" (due to missing/invalid environment variables) which lacks data persistence. This causes user sessions, provider registrations, and image uploads to vanish upon page refresh, breaking the provider lifecycle and directory visibility.

## 2. Root Cause Analysis (The "5 Pillars")

### 1. Auth Persistence
- **Issue:** In the current environment, `isConfigured` evaluates to `false` (missing `VITE_SUPABASE_URL`), forcing the app into "Demo Mode".
- **Defect:** `App.tsx` conditionally executes `supabase.auth.getSession()` ONLY if `isConfigured` is true. In Demo Mode, `api.login` returns a mock token, but `App.tsx` ignores it on page reload, resetting `user` to `null`.
- **Result:** Users are logged out immediately upon refreshing the page.

### 2. Broken Provider Lifecycle
- **Issue:** Provider data (onboarding status, profile updates) is stored in `_tempStore` (in-memory array) within `api.ts`.
- **Defect:** Since `_tempStore` is not persisted to `localStorage`, the moment the page refreshes (which happens after onboarding or login), the new provider account and its "Onboarding Complete" status are lost.
- **Result:** New providers never appear in the Admin Dashboard or Directory because their existence is wiped from memory before an Admin can approve them.

### 3. The 'Image Gap'
- **Issue:** `ProviderOnboardingView.tsx` converts images to Base64 strings using `FileReader`.
- **Defect:** 
  - **No Upload:** It does not attempt to upload files to Supabase Storage or S3.
  - **Data Loss:** Identity verification files (ID, License) are completely discarded (only filenames are stored).
  - **Performance:** Storing Base64 strings in the database (or memory) is inefficient and causes rendering issues.
- **Result:** Profile images are broken or temporary; verification documents are missing.

### 4. Distinct Branding
- **Issue:** All dashboards share the exact same color palette (`brand-*` greens and blues), making it difficult for users (who might hold multiple roles) to distinguish context.
- **Solution Strategy:** Implement a Theme Context that applies a `data-theme` attribute (`admin`, `provider`, `client`) to the root element, driving CSS variables for primary/secondary colors.

### 5. Directory Logic
- **Issue:** `SearchView` acts as both the search engine and the main directory, but relies on data that is currently being lost.
- **Defect:** The filter logic (`onboardingComplete && APPROVED && isPublished`) is correct, but the data flowing into it is volatile.
- **Solution Strategy:** Once persistence is fixed, differentiate the "Main Directory" view (default state) to highlight "Newest" or "Featured" providers, while the "Search" view activates upon user input.

---

## 3. Technical Implementation Steps

### Phase 1: Data Persistence Layer (The Foundation)
1.  **Create `src/services/persistence.ts`:**
    -   Implement a wrapper around `localStorage` to save/load `_tempStore` (Users, Providers, Appointments).
    -   This ensures "Mock Mode" data survives page reloads.

2.  **Fix `App.tsx` Auth Initialization:**
    -   Modify `init` function to check `persistence.getToken()` if `!isConfigured`.
    -   Allow `api.getUserById` to fetch from persisted local data.

3.  **Update `api.ts`:**
    -   Read/Write to `persistence.ts` instead of just `this._tempStore`.

### Phase 2: Image Handling
1.  **Create `src/services/storage.ts`:**
    -   **Prod:** Wrapper for `supabase.storage`.
    -   **Dev/Mock:** Store small images (avatars) in `localStorage` (Base64) or use persistent Placeholders + ObjectURLs for the session. *Note: For full persistence in Mock Mode without a backend, we must limit image size or use IndexedDB, but for now, we will ensure standard avatars work.*

2.  **Update `ProviderOnboardingView.tsx`:**
    -   Replace `FileReader` logic with `storageService.upload()`.

### Phase 3: Branding & UI
1.  **Update `tailwind.config.js` / `theme.css`:**
    -   Define semantic color names (e.g., `--primary`, `--secondary`) mapped to CSS variables.
    -   Create theme definitions:
        -   `[data-theme="client"]`: Green/Blue (Wellness)
        -   `[data-theme="provider"]`: Purple/Indigo (Professional)
        -   `[data-theme="admin"]`: Slate/Gray (Operational)

2.  **Create `ThemeContext`:**
    -   Automatically set `data-theme` based on `user.role`.

### Phase 4: Verification
1.  **Manual Test:**
    -   Register as Provider -> Refresh Page -> **Stay Logged In**.
    -   Complete Onboarding -> Refresh Page -> **Status Persists**.
    -   Log in as Admin -> See Provider in Dashboard -> **Approve**.
    -   Log in as Client -> Search Directory -> **See Provider**.

## 4. Approval Required
Waiting for user approval to proceed with **Phase 1: Data Persistence Layer**.
