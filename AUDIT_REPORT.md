# Comprehensive System Audit Report

## 1. Executive Summary
**Health Score: B-**
The application demonstrates a solid foundation using modern technologies (React 18, Vite, Supabase, Tailwind CSS). The recent refactoring efforts have significantly improved the architectural separation of concerns (Layouts, Role Guards). However, the system is currently in a "hybrid" state between a Mock/Demo application and a Production-ready system. Critical gaps exist in Security (RLS policies), Testing coverage, and API organization.

**Critical Issues:**
1.  **RLS Policy Gaps:** `public.providers` table allows public read access to *all* rows, potentially exposing unpublished or pending profiles.
2.  **Redundant Security Utils:** Two sanitization utilities exist (`security.ts` vs `content-sanitizer.ts`), with `security.ts` using unsafe manual replacement.
3.  **Monolithic API Service:** `api.ts` handles Auth, Data, AI, and Mock logic, creating a maintenance bottleneck and potential bundle bloat.
4.  **Testing Void:** Unit and Integration testing coverage is minimal, posing high regression risks during future refactoring.

## 2. Detailed Findings

### 2.1 Architecture & Code Quality
*   **Strengths:**
    *   Clear directory structure (`src/views`, `src/components`, `src/layouts`).
    *   Effective use of TypeScript interfaces for type safety.
    *   Recent "Layout Switcher" implementation provides excellent route isolation.
*   **Issues:**
    *   **Monolithic Service:** `src/services/api.ts` is an anti-pattern. It mixes concerns (Auth, DB, AI, Mock Data). It should be split into `AuthService`, `ProviderService`, `ClientService`.
    *   **Hybrid Logic:** The `if (!isConfigured)` checks scattered throughout `api.ts` clutter the business logic. The Mock vs Prod strategy should be handled via a Service Interface pattern or Dependency Injection, not conditional logic inside methods.

### 2.2 Security Audit
*   **Strengths:**
    *   `content-sanitizer.ts` correctly implements `DOMPurify` for rich text.
    *   `RoleGuard` implementation effectively protects client-side routes.
*   **Issues:**
    *   **Critical:** `src/utils/security.ts` uses manual string replacement for XSS prevention (`input.replace(/</g, "&lt;")`). This is easily bypassed. **Recommendation:** Deprecate this file and strictly use `DOMPurify` or a library like `zod` for validation.
    *   **RLS Policy:** In `supabase/policies.sql`, `CREATE POLICY "Providers: Public View" ON public.providers FOR SELECT USING (true);` allows anyone to read *any* provider record. It must check `is_published = true` and `moderation_status = 'APPROVED'`.

### 2.3 Database Layer
*   **Strengths:**
    *   Normalized schema with clear relationships (User -> ProviderProfile).
    *   Extension tables (`provider_education`, `provider_licenses`) handled correctly.
*   **Issues:**
    *   **Client Profile:** `ClientProfile` structure is currently defined in Types/Mock but needs a formal SQL migration to be persistent in Production.
    *   **Indexing:** No explicit indexes defined on foreign keys (`user_id` in `providers`) or search fields (`specialties` array). This will cause performance degradation at scale.

### 2.4 Frontend/View Layer
*   **Strengths:**
    *   Responsive, consistent UI using Tailwind CSS variables (`data-theme`).
    *   Effective use of `React.lazy` and `Suspense` for route splitting.
*   **Issues:**
    *   **Form Management:** Forms (`ProviderOnboardingView`, `AdminDashboard`) use manual state management (`useState` for every field). This scales poorly. **Recommendation:** Adopt `react-hook-form` + `zod` for robust validation and state handling.
    *   **Accessibility:** Buttons and inputs generally lack `aria-labels` (except where recently added in Nav). `onKeyDown` handlers for accessibility are inconsistent.

### 2.5 Backend/API Layer
*   **Strengths:**
    *   Supabase RPC calls (`search_providers`) abstract complex queries.
*   **Issues:**
    *   **Rate Limiting:** No client-side rate limiting or debounce logic observed on expensive calls like `search` (except a basic timeout effect in UI).
    *   **Error Handling:** `errorHandler.logError` is good, but error *recovery* (e.g., retrying failed requests) is inconsistent.

### 2.6 Performance Analysis
*   **Strengths:**
    *   Route-based code splitting keeps initial bundle size low.
*   **Issues:**
    *   **Asset Optimization:** Images (especially in `FeaturedProviders`) are loaded without `srcset` or lazy loading attributes (native `loading="lazy"`).
    *   **Render Waste:** `AdminDashboard` fetches ALL data (Users, Providers, Blogs) on mount. This will freeze the browser as the dataset grows. **Recommendation:** Implement pagination and `react-query` for caching and incremental fetching.

### 2.7 Operational Readiness
*   **Issues:**
    *   **Testing:** `tests/` directory is sparse. Critical flows (Onboarding, Payment) are untested.
    *   **Monitoring:** Sentry is initialized, but custom instrumentation for business logic failures (e.g. "Onboarding Dropoff") is missing.

### 2.8 User Management
*   **Strengths:**
    *   MFA flows are implemented in the UI.
    *   Role-based separation is now structurally enforced.

## 3. Prioritization Matrix

| Issue | Effort | Impact | Phase | Recommended Action |
| :--- | :---: | :---: | :---: | :--- |
| **RLS Policy Gap** | Small | **Critical** | 1 | Update SQL policy to filter `is_published` |
| **Insecure Sanitization** | Small | **High** | 1 | Replace `security.ts` logic with `DOMPurify` |
| **Monolithic `api.ts`** | Large | Medium | 2 | Split into domain services (`auth.ts`, `provider.ts`) |
| **Admin Dashboard Perf** | Medium | High | 2 | Add pagination and `react-query` |
| **Missing Tests** | Large | High | 2 | Add E2E tests for Signup flow |
| **Form Refactor** | Medium | Medium | 3 | Migrate forms to `react-hook-form` |

## 4. Recommendations

### Immediate Fixes (Next Sprint)
1.  **Security Hardening:** Apply the following SQL change immediately:
    ```sql
    CREATE POLICY "Providers: Public View" ON public.providers
    FOR SELECT USING (is_published = true AND moderation_status = 'APPROVED');
    ```
2.  **Deprecate `security.ts`:** Redirect all calls to `sanitizeInput` to use `content-sanitizer.ts`.

### Strategic Improvements
1.  **Service Layer Pattern:** Move away from the "Hybrid" `api.ts`. Create an abstract `IDataProvider` interface with two implementations: `SupabaseProvider` and `MockProvider`. Inject the correct one at runtime. This cleans up the `if (!isConfigured)` clutter.
2.  **Data Fetching Strategy:** Adopt `@tanstack/react-query`. It handles caching, loading states, and deduplication out of the box, replacing the manual `useEffect` + `useState` + `loading` pattern found in every view.

## 5. Conclusion
EvoWell is functionally impressive but architecturally fragile. The "Mock Mode" implementation, while useful for demos, has entangled the codebase with conditional logic. Prioritizing the decoupling of Mock/Real logic and hardening the Database Security policies are the two most important next steps to ensure a safe, scalable launch.
