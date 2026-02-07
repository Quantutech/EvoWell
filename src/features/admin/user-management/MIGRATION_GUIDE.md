# Migration Guide: Admin User Management Overhaul

## **Overview**
We are transitioning from the current tab-specific, manual table implementations to a unified, high-performance architecture based on TanStack Table and generic components. This guide outlines how to move existing tabs without downtime.

## **New Component Architecture**
*   **Generic Table:** `UserDataTable<T>` - Handles virtualization, selection, and sorting.
*   **Bulk Logic:** `useBulkActions<T>` - Manages progress, notifications, and undo.
*   **Inline Editing:** `InlineEditCell` - Handles in-row updates.

## **Step-by-Step Migration**

### **1. Preparation (Non-destructive)**
*   The new components are already located in `src/features/admin/user-management/`.
*   Verify dependencies: `npm install @tanstack/react-table @tanstack/react-virtual`.

### **2. Component-by-Component Migration**

#### **Stage 1: Admin Users (High Priority)**
*   **Current:** `src/components/dashboard/tabs/admin/AdminUsersTab.tsx`
*   **New:** `src/features/admin/user-management/views/UserManagementView.tsx`
*   **Action:** Update `AdminDashboard.tsx` to import the new view.
*   **Reason:** Provides immediate search and bulk delete functionality.

#### **Stage 2: Practitioners (Specialized)**
*   **Current:** `src/components/dashboard/tabs/admin/AdminProvidersTab.tsx`
*   **New:** `src/features/admin/user-management/views/PractitionersTab.tsx`
*   **Action:** Switch the `providers` view in `AdminDashboard.tsx` to use the new tab.
*   **Benefit:** Enables license tracking and specialized vetting statuses in the table view.

#### **Stage 3: Clients**
*   **Current:** `src/components/dashboard/tabs/admin/AdminClientsTab.tsx`
*   **Action:** Create `ClientsTab.tsx` in the new feature folder following the same pattern as `PractitionersTab`.
*   **Benefit:** Adds bulk export of client data and inline intake status updates.

### **3. Data Layer Alignment**
*   Update `AdminService` in `src/services/admin.ts` to support batch operations:
    ```typescript
    async bulkDeleteUsers(ids: string[]) { ... }
    async bulkUpdateRoles(ids: string[], role: UserRole) { ... }
    ```
*   Implement server-side filtering by passing `filters` from `useUserFilters` to the API.

## **Rollout Strategy**
1.  **Beta Phase:** Enable the new `UserManagementView` for a subset of administrators.
2.  **Parallel Run:** Keep old tabs accessible via a "Legacy View" toggle if critical bugs are found.
3.  **Full Cutover:** Once bulk actions and inline editing are verified, remove the legacy tab files.

## **Backward Compatibility**
The new components use the same domain types (`User`, `ProviderProfile`) as the existing system, ensuring zero data transformation overhead during the transition.
