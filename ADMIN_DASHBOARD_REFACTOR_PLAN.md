# Admin Dashboard Refactor Plan

## Overview
This plan addresses the need to reorganize the Admin Dashboard navigation into logical groups to improve usability and manage the growing number of features. It also ensures that all CRUD operations are robust.

## 1. Navigation Reorganization
The current flat list of 13 items is overwhelming. We will introduce **Grouped Navigation** with the following structure:

### **Group 1: Overview**
- **Dashboard** (`overview`): High-level stats and activity.

### **Group 2: User Management**
- **Users** (`users`): Manage internal users and system access.
- **Practitioners** (`providers`): Manage provider profiles and status.
- **Clients** (`clients`): View client accounts.
- **Applications** (`applications`): **New/Pending** provider applications waiting for review.

### **Group 3: Content Management**
- **Content Review** (`review`): Moderation queue for sensitive content.
- **Blog Posts** (`blogs`): Manage articles (Create, Edit, Delete, Approve).
- **Testimonials** (`testimonials`): Manage user testimonials.

### **Group 4: Support & Operations**
- **Message Center** (`messages`): System-wide messages.
- **Support Tickets** (`tickets`): Help desk tickets.
- **Career Jobs** (`jobs`): Manage job listings.

### **Group 5: System**
- **Audit Logs** (`audit`): Security and action logs.
- **Configuration** (`config`): Dropdown values (Specialties, Languages, etc.).

## 2. Technical Implementation

### **A. Update `DashboardLayout.tsx`**
- Modify `NavItem` interface to include an optional `category?: string` field.
- Update rendering logic to group items by `category` and display section headers (e.g., "User Management", "Content").
- Ensure backward compatibility for `ProviderDashboard` (which won't use categories initially).

### **B. Update `AdminDashboardLayout.tsx`**
- Reorder `sidebarLinks` array.
- Add `category` property to each link corresponding to the groups above.

## 3. CRUD & Functionality Check
- **Blogs**: Already refactored to full CRUD with `BlogEditor`.
- **Users/Providers**: Verify `DetailModal` handles updates correctly (it seems to).
- **Applications**: Ensure `AdminApplicationsTab` allows approving/rejecting (which moves them to Providers list).
- **Config**: Ensure `AdminConfigTab` allows adding/removing items (it does).

## 4. Execution Steps
1.  Modify `DashboardLayout.tsx` to support grouped rendering.
2.  Update `AdminDashboardLayout.tsx` with the new grouped structure.
3.  Verify the layout in the Admin Dashboard.
4.  Verify Provider Dashboard is unaffected.
