
# EvoWell Project Documentation

**Version:** 0.1.2
**Last Updated:** February 2026
**Status:** Beta / Provider Feature Complete

## 1. Executive Summary

EvoWell is a professional, clinical-grade directory and practice management platform (SaaS) connecting patients with mental health specialists. The platform operates on a "Sovereign Practice" model, empowering providers with a complete operating system (OS) to manage their clinical business, while offering patients a secure, high-trust environment to find care.

**Current Focus:** The Provider Dashboard has been fully overhauled to support end-to-end practice management, including scheduling, detailed business compliance, and financial productization (service packages).

## 2. Technical Architecture

### Core Stack
*   **Frontend Framework:** React 18 (Functional Components, Hooks)
*   **Language:** TypeScript 5+ (Strict Mode enabled, extensive interface typing)
*   **Build Tool:** Vite 5 (ESModules, Hot Module Replacement)
*   **Styling:** Tailwind CSS (Custom configuration for "Brand" and "Accent" palettes, responsive design)
*   **AI Integration:** Google GenAI SDK (`@google/genai`) for content generation.
*   **State Management:**
    *   **Global:** React Context API (`AuthContext`, `NavigationContext`) for session and routing.
    *   **Local:** Complex local state management within huge views (e.g., `ProviderDashboard`) to handle form data and UI tabs without Redux overhead.
*   **Routing:** Custom Hash-based Routing (`#/path`) for lightweight, server-agnostic deployment (GitHub Pages compatible).

### Folder Structure & Component Philosophy
The project utilizes a flat-root structure mapped via `vite.config.ts` alias `@/`.

```
/
├── components/         # Reusable UI atoms
│   ├── ui/             # Generic UI elements (ThreeDIcon, Icon)
│   ├── brand/          # Branding assets (Logo)
│   ├── ScheduleBuilder.tsx # Complex drag-and-drop style availability manager
│   ├── SimpleChart.tsx # Lightweight SVG charting component (Area/Line)
│   └── ...
├── views/              # Page-level monolithic components
│   ├── ProviderDashboard.tsx # [MAJOR UPDATE] The core provider logic center
│   ├── HomeView.tsx    # Public landing page
│   └── ...
├── services/           # Business logic and Data Access Layer
│   ├── api.ts          # Asynchronous abstraction layer (simulates network latency)
│   ├── db.ts           # LocalStorage Mock Database (Seed data & persistence)
│   └── ai.ts           # Google Gemini Integration service
├── types.ts            # Global TypeScript definitions (Crucial for AI context)
```

## 3. Data Models & Entities

The application relies on a sophisticated `localStorage` mock database (`services/db.ts`). Recent updates have expanded the schema to support business operations.

*   **`User`**: Base identity (Admin, Provider, Client).
*   **`ProviderProfile`**: Extensive profile extensions for providers.
    *   *New Fields:* `businessInfo` (Tax ID, Stripe ID), `servicePackages` (Array of products), `address` (Detailed object), `social` (Map).
*   **`ServicePackage`**: Products defined by providers (e.g., "5 Session Bundle").
    *   *Fields:* `id`, `name`, `price`, `sessionsIncluded`, `active`, `description`.
*   **`Availability`**: Complex object defining recurring weekly schedules and blocked dates.
    *   *Structure:* Contains `schedule` array of `DaySchedule` objects (day, active, timeRanges).
*   **`Appointment`**: Links `providerId` and `clientId` with status and timestamps.
*   **`SupportTicket`**: Nested response model for help desk functionality.

## 4. Key Modules & Features

### A. Provider Dashboard (`views/ProviderDashboard.tsx`) [MAJOR OVERHAUL]
This view acts as a single-page application (SPA) within the main app, handling complex business logic.

1.  **Command Center (Overview Tab):**
    *   **KPI Visualization:** Displays Revenue, Active Patients, Completion Rate, and Satisfaction.
    *   **Custom Charting:** Implements `SimpleChart` (SVG) for revenue trends and demographics (Donut chart).
    *   **Activity Progress:** Visual progress bars for clinical workflows (Intake, Treatment Plans).

2.  **Clinical Calendar (Schedule Tab):**
    *   **Dual Mode:** Switch between "Appointments" (Calendar View) and "Availability" (Configuration).
    *   **Interactive Grid:** A CSS-grid based weekly view rendering appointments at specific time slots relative to the day.
    *   **Schedule Builder:** Integrated `ScheduleBuilder.tsx` component allows granular control of recurring hours and time-off blocking.

3.  **Financial Infrastructure (Financials Tab):**
    *   **Service Packages:** Full CRUD (Create, Read, Delete) capabilities for creating clinical bundles.
    *   **Stripe Integration Mock:** Visual status of Stripe Connect account (Active/Pending).
    *   **Invoicing:** Table view of recent transactions.

4.  **Practice Settings (Settings Tab):**
    *   **Sub-Navigation:** Split into Profile, Practice Details, and Business & Compliance.
    *   **Business Logic:** Fields for Tax ID/EIN, NPI Number, and Corporate Address.
    *   **Verification:** UI for License verification status.

5.  **Content Studio:**
    *   **AI Drafting:** Integration with `services/ai.ts` to generate blog posts and biographies using Gemini.

### B. Public Directory
*   **Search Engine:** Filter by query, location, specialty, insurance, and availability.
*   **Provider Profiles:** Detailed views including bio, credentials, media appearances, and booking widgets.

### C. Admin OS
*   **User Management:** CRUD operations for all users.
*   **Provider Vetting:** Approval workflow (Pending -> Approved/Rejected).

## 5. UI/UX Design System

*   **Design Language:** "Clinical Soft" - Uses large border radiuses (`rounded-[2.5rem]`), generous padding, and subtle shadows.
*   **Typography:** Plus Jakarta Sans for modern, approachable readability.
*   **Color Palette:**
    *   **Primary:** `#257a46` (Accessible Brand Green).
    *   **Secondary:** `#0f172a` (Slate 900 for text/headings).
    *   **Surfaces:** `#F8FAFC` (Slate 50) for backgrounds to reduce eye strain.
*   **Animations:** CSS-based animations (`animate-in`, `fade-in`, `slide-in`) for smooth page transitions.

## 6. Recent Codebase Changes (v0.1.2)

1.  **Refactored `ProviderDashboard`**: Moved from a simple list view to a complex, tabbed dashboard with sub-navigation.
2.  **Updated `types.ts`**: Added `businessInfo` and `servicePackages` to `ProviderProfile` interface.
3.  **Updated `db.ts`**: Enhanced seed data to include business addresses, tax IDs, and mock financial history for existing providers.
4.  **Fixed Calendar UI**: Resolved layout shifts in the footer and fixed SVG path errors in `SimpleChart`.
5.  **Fixed Assets**: Replaced broken CDN links in `PointSolutionsReplacement` with reliable SVG sources.

## 7. Future Roadmap (Technical)

1.  **Real Backend Migration:** The `services/db.ts` layer is designed to be replaced by a Supabase/Firebase adapter pattern without changing UI components.
2.  **Payment Processing:** The Financials tab currently mocks data; next step is integrating the Stripe Connect API.
3.  **WebRTC Video:** "Join Room" buttons currently trigger alerts; integration with Daily.co or Twilio Video is required for live sessions.
