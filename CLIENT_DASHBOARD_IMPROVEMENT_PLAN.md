# Client Dashboard Improvement Plan

## 1. Audit & Analysis
### Branding & UI
- **Current State**: Heavy use of generic `blue-500`/`blue-600` colors which may clash with EvoWell's specific brand identity (Teal/Slate).
- **Issue**: Inconsistent visual hierarchy and card styles compared to the new "Saved Providers" section.
- **Goal**: Unify styling using `brand-*` utility classes and consistent card border/shadow tokens.

### Logical & Functional Gaps
- **"My Care Team"**: Currently hardcoded to "Dr. Sarah Chen". Should reflect actual booked providers or saved providers.
- **"Next Session"**: "Join Secure Room" button is non-functional.
- **"Documents"**: "Upload New" button is non-functional.
- **"Journal"**: "Securely Save Entry" shows an alert but doesn't persist data.
- **"Profile Settings"**: Form feedback is limited to browser alerts.

## 2. Proposed Improvements

### Phase 1: Branding & Visual Unification
- [ ] **Color Update**: Replace `bg-blue-*` and `text-blue-*` with `brand-*` (EvoWell Teal) or `slate-*` where appropriate for neutrality.
- [ ] **Card Styling**: Apply the same `rounded-2xl border border-slate-200 shadow-sm` pattern used in `SavedProviders` to all dashboard cards.
- [ ] **Typography**: Ensure consistent use of `Heading` and `Text` components.

### Phase 2: Logic & Data Integration
- [ ] **Dynamic Care Team**: Update the sidebar widget to fetch providers from the user's `appointments` history or `wishlist` (fallback).
- [ ] **Functional Journal**: Connect the journal save button to `api.updateClientProfile` (appending to `wellnessLog`) so entries persist.
- [ ] **Navigation Fixes**: Ensure all sidebar links properly switch tabs or navigate to routes.

### Phase 3: UX Enhancements
- [ ] **Empty States**: Add friendly empty states for "Sessions", "Journal", and "Documents" similar to "Saved Providers".
- [ ] **Feedback**: Replace `alert()` with a toast notification system (if available) or inline success/error messages.
- [ ] **Join Room**: Add a logic check to "Join Secure Room" (e.g., only enable 10 mins before) or link to a placeholder meeting room.

## 3. Implementation Plan
1.  **Refactor `ClientDashboard.tsx`**: Apply branding updates and card styling fixes.
2.  **Update `My Care Team`**: Fetch real data.
3.  **Implement Journal Saving**: Update `handleUpdateProfile` or create `handleSaveJournal`.
4.  **Polish**: Add empty states and fix broken buttons.
