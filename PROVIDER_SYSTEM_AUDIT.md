# PROVIDER SYSTEM AUDIT

## 1. DATABASE LAYER

### Tables Overview
- **`providers`**: Core table. RLS enabled.
  - Columns: `id` (PK, text), `user_id` (FK -> users.id), `professional_title`, `bio`, `hourly_rate`, `moderation_status`, `is_published`, etc.
  - Constraints: FK on `user_id`.
  - Indexes: `hourly_rate`, `address_state`, `is_published`.
- **`provider_specialties`**: Junction table for specialties.
  - Indexes: `specialty_id`.
- **`provider_schedules`**: Availability data.
  - Indexes: `day`.
- **`provider_education`, `provider_licenses`, `provider_languages`, `provider_blocked_dates`**: Sub-tables for details.

### RLS Policies
- **`providers`**:
  - Public View: `is_published = true AND moderation_status = 'APPROVED'`.
  - Owner Update/Insert: `user_id = auth.uid() OR is_admin()`.
- **Sub-tables**: Inherit access via check on parent `providers` table (exists check).
- **Security Assessment**:
  - **Gap**: `is_admin()` function relies on `role = 'ADMIN'` in `users` table. If `users` table RLS allows users to update their own role (it shouldn't, only Admin should), this is a risk.
  - **Good**: Public access is correctly restricted to Approved & Published providers.

### Schema Mismatches
- `src/types/supabase.ts` was missing `specialties` table (Fixed in recent refactor).
- `ProviderProfile` in `src/types.ts` had fields like `therapeuticApproaches` that might not map 1:1 to columns (likely stored in JSON or separate table not fully typed in Supabase types yet).

## 2. STORAGE LAYER

### Implementation
- **Service**: `src/services/storageService.ts`.
- **Production**: Uses Supabase Storage bucket `provider-assets`.
- **Mock Mode**: Uses `URL.createObjectURL(file)` which creates a blob URL.
  - **Issue**: Blob URLs persist only for the session. Refreshing the page breaks images in mock mode.

### File Structure
- Avatars: `avatars/{providerId}/{timestamp}`.
- Verification: `verification/{providerId}/id_{timestamp}`.
- **Cleanup**: No automatic cleanup of old files when updating profile image (potential storage accumulation).

## 3. TYPE DEFINITIONS

### `ProviderProfile` Interface
- **Core**: `id`, `userId`, `firstName`, `lastName`, `email`.
- **Professional**: `professionalTitle`, `bio`, `specialties` (array of strings/IDs), `yearsExperience`.
- **Operational**: `availability`, `pricing`, `appointmentTypes`.
- **Status**: `onboardingComplete`, `moderationStatus`, `isPublished`.
- **Missing/Legacy**: `education` string vs `educationHistory` array. UI uses `educationHistory`, `api.ts` maps it to string for some updates.

## 4. PROVIDER REGISTRATION FLOW

### Path
1.  **UI**: `LoginView.tsx`. User selects "Healthcare Provider".
2.  **Action**: Calls `api.register({ role: UserRole.PROVIDER, ... })`.
3.  **Service**: `authService.register` creates `User` and empty `ProviderProfile` via `providerService.createBlankProviderProfile`.
4.  **Redirect**: `LoginView` redirects to `/onboarding` if `onboardingComplete` is false.

### Data Storage
- **Mock**: Stored in `mockStore` (memory).
- **Prod**: `users` table and `providers` table (linked).

## 5. PROVIDER ONBOARDING FLOW

### Wizard (`ProviderOnboardingView.tsx`)
- **Step 1**: Identity (Photo, Title, Category, Languages).
- **Step 2**: Location (Phone, State, Address).
- **Step 3**: Services (Specialties, Formats, Pricing).
- **Step 4**: Schedule (Availability).
- **Step 5**: Bio (Tagline, Bio).
- **Step 6**: Verification (Upload ID, License).
- **Completion**: Sets `onboardingComplete = true` and `moderationStatus = PENDING`. Redirects to `/console`.

### Issues
- **Validation**: Basic required checks (HTML5). `MultiSelect` might allow empty selection.
- **Abandonment**: Data is kept in local state/provider state. If user leaves, partial data *might* be lost if not saved step-by-step (Code saves only on Finish? No, `updateField` updates local state, but `ProviderOnboardingView` initializes from `provider` context. If `provider` context is updated, it persists. But `ProviderOnboardingView` doesn't call `api.updateProvider` until Finish?
  - Correction: `ProviderOnboardingView` uses `updateField` which updates `formData` state. It does NOT auto-save to API on step change.
  - **Risk**: Refreshing page during onboarding loses progress.

## 6. PROVIDER LOGIN FLOW

### Path
1.  **UI**: `LoginView.tsx`.
2.  **Service**: `authService.login`. Returns `user` and `provider`.
3.  **Redirect**: Checks `provider.onboardingComplete`.
    - If false: -> `/onboarding`.
    - If true: -> `/console`.

## 7. PROVIDER DASHBOARD

### Structure
- **View**: `ProviderDashboard.tsx` wraps `ProviderDashboardLayout`.
- **Tabs**: Overview, Schedule, Financials, Settings, Articles, Support.
- **Data Fetching**: Now uses `react-query` (refactored). Fetches Appointments, Blogs, Specialties.

### Edit Flow (`ProviderSettings.tsx`)
- Uses local state `editForm`.
- **Save**: Calls `api.updateProvider`. Updates `firstName`, `lastName` (synced to User?), `bio`, etc.
- **Sync**: `api.updateProvider` updates `providers` table. `firstName`/`lastName` are on `users` table.
  - **Issue**: `ProviderProfile` has `firstName`/`lastName` but DB `providers` table might not? `admin.ts` maps them from `users` join.
  - **Fix**: `api.updateProvider` needs to update `users` table too if name changes. Currently `SupabaseProviderService.updateProvider` only updates `providers` table fields. **Name change in Provider Settings is NOT persisted to Users table.**

## 8. PROVIDER SETTINGS

### Editable Fields
- Profile: Image, Name, Title, Bio, Education, Languages, Specialties.
- Practice: Address, Phone, Website, Media Links, Social.
- Business: Tax ID, NPI, License.

### Issues
- **Name Sync**: Updating First/Last name in settings updates `editForm`, but `api.updateProvider` implementation in `provider.service.ts` DOES NOT update `users` table.

## 9. PROVIDER PROFILE VIEW (Public)

### Features
- Displays: Bio, Specialties, Location (Map), Media, Articles.
- Booking: `BookingSidebar`.
- **Visibility**: Checks `moderationStatus === APPROVED` and `isPublished !== false`.
- **Issue**: `blog.createdAt` usage fixed to `publishedAt` in recent refactor.

## 10. ADMIN MANAGEMENT

### Features
- **List**: `AdminProvidersTab` lists providers with status.
- **Moderation**: Approve/Reject buttons.
- **Stats**: `AdminDashboard` shows counts.

### Flow
- Pending providers appear in `AdminProvidersTab` (filtered).
- Admin clicks "Approve" -> `api.moderateProvider` -> Updates status to `APPROVED`, sets `is_published = true`.

## 11. SEARCH & DISCOVERY

### Implementation
- **Service**: `providerService.search`.
- **Prod**: Calls `search_providers` RPC.
- **Filters**: Specialty, Query (text), Max Price, State, Day.
- **Refactor**: Now uses `useInfiniteQuery` in `SearchView.tsx`.

## 12. IDENTIFIED ISSUES

| Severity | Issue | File | Description |
| :--- | :--- | :--- | :--- |
| 🔴 **High** | Name Sync Failure | `src/services/provider.service.ts` | `updateProvider` only updates `providers` table. Changing name in Dashboard does not update `users` table, leading to data inconsistency. |
| 🟡 **Medium** | Onboarding Persistence | `src/views/ProviderOnboardingView.tsx` | Onboarding progress is not saved between steps. Refreshing page loses data. |
| 🟡 **Medium** | Mock Image Persistence | `src/services/storageService.ts` | Blob URLs in mock mode expire on refresh. |
| 🔵 **Low** | Missing `tickets` table | `src/services/admin.ts` | Admin stats count tickets, but `tickets` table seems missing in DB schema (mock only). |

## 13. FIELD INVENTORY

| Field Name | Type | Required | Set At | Editable | Stored In | UI Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `firstName` | string | Yes | Signup | Yes | `users` | Settings |
| `lastName` | string | Yes | Signup | Yes | `users` | Settings |
| `professionalTitle` | string | Yes | Onboarding | Yes | `providers` | Settings |
| `bio` | string | No | Onboarding | Yes | `providers` | Settings |
| `specialties` | string[] | No | Onboarding | Yes | `provider_specialties` | Settings |
| `hourlyRate` | number | Yes | Onboarding | Yes | `providers` | Settings |
| `moderationStatus` | enum | Yes | Onboarding (PENDING) | No (Admin only) | `providers` | Admin Dashboard |
| `isPublished` | boolean | Yes | Moderation | Yes | `providers` | Dashboard Toggle |
