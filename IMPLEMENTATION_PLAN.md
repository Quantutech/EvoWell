# Implementation Plan - HomeView & Navbar Responsiveness Fixes

This plan addresses four specific responsiveness issues on the HomeView and Navbar.

## Root Cause Analysis
1. **Counter Cards & Why Choose Cards**: Currently use `cols={4}` in the `Grid` component, which defaults to `grid-cols-4` on all screen sizes, causing overlapping on small screens.
2. **Logo Section**: The `PointSolutionsReplacement` component uses `grid-cols-1` on mobile, leading to excessive vertical space usage.
3. **Navbar Dropdowns**: The Navbar `z-index` might be lower than some scrolled page content or containers, or the dropdowns themselves are being clipped.

## Proposed Changes

### `src/views/HomeView.tsx`
- Update the counter cards `Grid` to `cols={2} md={4}`.
- Update the "Why Choose" `Grid` to `cols={2} md={4}`.
- Adjust font sizes for mobile where necessary.

### `src/components/AnimatedCounter.tsx`
- Make the count font size responsive: `text-2xl md:text-4xl`.
- Reduce padding on mobile: `p-6 md:p-10`.
- Reduce label font size if needed.

### `src/components/PointSolutionsReplacement.tsx`
- Change the mobile grid from `grid-cols-1` to `grid-cols-2`.
- Adjust the category headers to work with the 2-column layout (e.g., make them span 2 columns or integrate them differently).
- Reduce logo padding on mobile to save space.

### `src/components/Navbar.tsx`
- Increase the `z-index` of the `nav` element to ensure it's above all page content.
- Verify that the dropdown menus have appropriate `z-index` and aren't being hidden.

## Potential Side Effects
- Layout shifts on mobile: Changing from 1 to 2 columns might affect the height of sections.
- Alignment: Need to ensure 2nd column items align correctly.

## Implementation Steps
1. **Fix Counter Cards**:
    - Modify `src/views/HomeView.tsx` to use responsive grid columns for counters.
    - Modify `src/components/AnimatedCounter.tsx` for responsive sizing.
2. **Fix "Why Choose" Cards**:
    - Modify `src/views/HomeView.tsx` to use responsive grid columns for why choose section.
3. **Fix Logo Section**:
    - Modify `src/components/PointSolutionsReplacement.tsx` to use 2 columns on mobile.
4. **Fix Navbar z-index**:
    - Modify `src/components/Navbar.tsx` to increase `z-index`.
5. **Verify**:
    - Run `npm run build` to check for regressions.

## Success Criteria
- Counter cards show 2 per row on mobile, 4 on desktop, no overlapping.
- "Why Choose" cards show 2 per row on mobile.
- Logos show 2 per row on mobile.
- Navbar dropdowns are visible and stay above all content when scrolling.
