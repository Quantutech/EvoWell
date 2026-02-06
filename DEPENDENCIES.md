
# Dependency Policy

This document outlines the guidelines for managing third-party dependencies in the EvoWell platform.

## Approved Dependencies

### Core Framework
- **React**: UI library.
- **React Router DOM**: Client-side routing.
- **Vite**: Build tool and dev server.

### State & Logic
- **React Context API**: Global state management (no external libraries like Redux or Zustand unless complexity demands it).
- **Hooks**: Custom hooks for shared logic.

### Data & Backend
- **Supabase JS**: Authentication, Database, and Realtime subscriptions.
- **Fetch API**: Native browser API for HTTP requests (no Axios).

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **Leaflet / React Leaflet**: Interactive maps (lazy loaded).
- **Headless UI / Radix UI**: (Optional) Accessible unstyled components.

### Utilities
- **Date-fns**: Lightweight date manipulation.
- **Zod**: Schema validation.
- **DOMPurify**: Content sanitization.

## Managing Dependencies

### Adding New Libraries
Before adding a new dependency, consider:
1. **Necessity**: Can this be solved with native APIs or simple custom code?
2. **Size**: Check bundle cost using [BundlePhobia](https://bundlephobia.com).
3. **Maintenance**: Is the library actively maintained?
4. **License**: Must be MIT, Apache 2.0, or compatible open-source license.

### Removal Process
1. Verify usage via `npm ls` and grep search in codebase.
2. Remove from `package.json`.
3. Run `npm install` to update lockfile.
4. Test application to ensure no regressions.

### Regular Audits
- Run `npm audit` monthly to check for vulnerabilities.
- Run `npm run analyze` (visualizer) quarterly to check bundle size bloat.
