# Implementation Plan - Admin Dashboard Color Update

## Problem
The user wants the Admin Dashboard to use a "greenish" color scheme to distinguish it from the Provider Dashboard. Currently, the Admin Dashboard uses a Slate/Gray theme, while the Provider Dashboard uses an Indigo/Violet theme. The "greenish" color likely refers to the default brand color (Emerald/Green).

## Proposed Changes

### 1. Update Theme Configuration
**File:** `src/styles/theme.css`
- Modify the `[data-theme="admin"]` block.
- Replace the current Slate/Gray color palette with the Emerald/Green palette (matching the `:root` defaults).
- This ensures that any component using `var(--brand-*)` variables will render in green for admins.

### 2. Update Dashboard Layout
**File:** `src/components/dashboard/DashboardLayout.tsx`
- The sidebar background color for the Admin role is currently hardcoded to `#1e293b` (Slate-800).
- Update this to a dark green color (e.g., `#0f311c` or `bg-brand-900`) to match the new green theme and ensure distinctiveness from the Provider dashboard.

## Verification Plan

### Manual Verification
- **Admin Dashboard:**
    - Log in as an admin (or view the admin dashboard).
    - Verify the sidebar background is dark green.
    - Verify the active tab highlight is the primary green (`#257a46`).
    - Verify other elements using brand colors appear green.
- **Provider Dashboard:**
    - Verify the provider dashboard remains Indigo/Violet.
- **Client/Public Views:**
    - Verify no regression in public views (should remain green as they use `:root`).

### Automated Tests
- Since this is primarily a visual/CSS change, standard unit tests might not catch color differences unless we check computed styles.
- We will rely on the "System Impact Analysis" and careful code review.

## Risk Assessment
- **Low Risk:** This is a cosmetic change.
- **Side Effects:** Potentially affects any shared components that rely on `data-theme="admin"`. By switching to green, we align Admin with the main brand identity, which seems to be the desired outcome.
