# Client Wishlist System - Implementation Plan

## Overview
This plan outlines the implementation of the **Client Wishlist System**, a role-gated "save provider" system. It allows clients to bookmark providers for later, gives providers transparent visibility into interest, and gives admins full oversight. This system is independent of the Endorsement System and does not affect rankings.

## Key Changes
- **Database**:
  - New `provider_wishlists` table with unique constraints and RLS policies.
  - Indexes for performant querying by client and provider.
- **Backend/API**:
  - New `WishlistService` handling save, unsave, list, and check status operations.
  - Integration with `ProviderService` if needed for composite data.
- **UI Components**:
  - `WishlistButton`: Heart icon component with optimistic UI updates and role-based behavior.
  - `SavedProviders`: Dashboard section for clients.
  - `InterestedClients`: Dashboard section for providers.
- **Integration**:
  - Update `ProviderCard` to include the `WishlistButton`.
  - Update `ClientDashboard` and `ProviderDashboard`.

## Implementation Steps

### Phase 1: Data Layer & Core Logic
1.  **Database Schema**: Create Supabase migration `20240318_provider_wishlists.sql`:
    -   Table: `provider_wishlists` (id, provider_id, client_id, created_at).
    -   Constraints: Unique (provider_id, client_id), Foreign Keys.
    -   RLS Policies: Clients read/write own, Admins read/write all, Providers read-only (who saved them).
2.  **Types**: Update `src/types/supabase.ts` and `src/types.ts` to include `WishlistEntry` interfaces.
3.  **Service Layer**: Create `src/services/wishlist.service.ts` with methods:
    -   `toggleWishlist(providerId)`: Handle save/unsave logic.
    -   `getSavedProviders()`: For client dashboard.
    -   `getWishlistedBy(providerId)`: For provider dashboard.
    -   `checkWishlistStatus(providerIds)`: For card rendering (batch check).

### Phase 2: UI Components
4.  **Wishlist Button**: Create `src/components/provider/WishlistButton.tsx`.
    -   Handles generic heart icon.
    -   Accepts `providerId` and initial state.
    -   Handles click events based on user role (Client: toggle, Guest: auth, Provider: tooltip).
5.  **Provider Card Update**: Modify `src/components/provider/ProviderCard.tsx` to include `WishlistButton` in the top-right corner.

### Phase 3: Dashboard Views
6.  **Client Dashboard**:
    -   Create `src/components/dashboard/tabs/ClientSavedProviders.tsx`.
    -   Fetch and render saved providers using `ProviderCard` (reused).
    -   Add to `ClientDashboard.tsx`.
7.  **Provider Dashboard**:
    -   Create `src/components/dashboard/tabs/ProviderInterestedClients.tsx`.
    -   Fetch and render list of clients who saved the provider.
    -   Add to `ProviderDashboard.tsx`.

### Phase 4: Verification & Edge Cases
8.  **Verification**: Test all role permissions (Client, Provider, Admin, Guest).
9.  **Edge Cases**: Handle rapid clicks (debounce/optimistic UI), empty states, and error handling.

## Technical Considerations
-   **Performance**: Use batch checking for wishlist status in search results to avoid N+1 queries.
-   **Security**: RLS is the primary enforcement layer. API checks are secondary but necessary for UX (403 responses).
-   **Optimistic UI**: The heart icon must toggle immediately. Revert on error.
-   **Brand Consistency**: Use EvoWell visual identity (no emoji hearts, specific colors).

## Success Criteria
-   [ ] `provider_wishlists` table exists with correct RLS.
-   [ ] Clients can save/unsave providers.
-   [ ] Providers cannot save providers.
-   [ ] Guests trigger auth modal.
-   [ ] Client Dashboard shows saved providers.
-   [ ] Provider Dashboard shows interested clients count/list (read-only).
-   [ ] Provider Card shows heart icon in top-right.
