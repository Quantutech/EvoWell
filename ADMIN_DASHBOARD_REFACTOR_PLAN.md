# Admin Dashboard Implementation & Refactor Plan

## **1. Overview**
This plan outlines a phased approach to transform the current Admin Dashboard into a professional, scalable, and high-performance administration suite. The focus is on decoupling components, improving UX with modern patterns, and establishing a robust testing foundation.

## **2. Component Architecture Proposal**
*   **Folder Structure:**
    ```
    src/features/admin/
    ├── components/         # Admin-specific UI components
    │   ├── navigation/     # Accordion-based Sidebar
    │   ├── widgets/        # Dynamic Dashboard Cards
    │   └── tables/         # Specialized Data Tables
    ├── hooks/              # Admin-specific logic (useAdminStats, useUserManagement)
    ├── services/           # Admin API layer
    ├── views/              # Entry points (AdminDashboardView)
    └── types/              # Admin-specific interfaces
    ```
*   **State Management:** Standardize on **TanStack Query** for all data fetching, using cache invalidation for real-time-like updates. Use **Zustand** for global UI state (sidebar collapse, active tab persistence).

## **3. Implementation Steps**

### **Phase 1: Foundation & Navigation (Week 1-2)**
1.  **Refactor Sidebar:** Modify `DashboardLayout.tsx` to support collapsible accordion sections and `overflow-y-auto`.
2.  **Dynamic Navigation:** Move navigation configuration to a central config file or fetch from an API.
3.  **Audit Fixes:** Fix CSS overflow issues and implement basic accessibility (ARIA).
4.  **Component Decomposition:** Break down `AdminDashboard.tsx` into smaller, tab-specific view components.

### **Phase 2: Dashboard & User Management (Week 3-4)**
5.  **Dynamic Cards:** Implement `AdminOverviewTab` with real-time stats and initial charts (e.g., User Growth).
6.  **Advanced Data Table:** Create a shared `AdminDataTable` component with:
    *   Multi-column filtering
    *   Bulk actions (Select all, Bulk delete)
    *   Inline editing for simple fields (Status, Role)
7.  **Unified User View:** Implement the "WordPress-style" user listing with advanced filters.
8.  **Activity Feed:** Add a "Recent Actions" widget to the overview.

### **Phase 3: Content Management & Workflow (Week 5-6)**
9.  **Workflow Implementation:** Enhance `AdminContentReviewTab` with a full workflow (Draft -> Pending -> Approved -> Published).
10. **Content Calendar:** Add a calendar view for scheduled blog posts.
11. **Media Library:** Implement a basic media management tab with tagging.
12. **SEO Tools:** Integrate SEO preview and validation into the `BlogEditor`.

### **Phase 4: Advanced Features & Polish (Week 7-8)**
13. **Role-Based Access Control (RBAC):** Refine navigation visibility based on sub-admin permissions.
14. **Audit Logs:** Expand the `AdminAuditTab` with detailed change tracking (Diffs).
15. **System Metrics:** Add server health and performance monitoring widgets.
16. **Final Polish:** Animation refinements, dark mode optimization, and mobile responsive tweaks.

## **4. Testing Strategy**
*   **Unit Testing:** Vitest for utility functions and custom hooks.
*   **Integration Testing:** React Testing Library for Admin tabs, mocking API calls with MSW.
*   **E2E Testing:** Playwright for critical paths (User deletion, Content approval).
*   **Visual Regression:** Chromatic or similar for UI consistency.

## **5. Technical Considerations**
*   **Performance:** Implement virtualization for large user lists (e.g., `@tanstack/react-virtual`).
*   **Security:** Ensure all administrative API endpoints have strict server-side role validation.
*   **Scalability:** Use feature-based folder structure to prevent the `src/components` folder from becoming a bottleneck.

## **6. Success Metrics**
*   90%+ Test coverage for Admin business logic.
*   < 2s Load time for the main Admin Dashboard.
*   30% Reduction in time taken for common tasks (e.g., approving a provider).
*   Zero reported UI overflow issues across supported resolutions.
