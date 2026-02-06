
# TypeScript Type System

This project uses strict TypeScript configurations to ensure type safety.

## Database Types
Supabase database types are defined in `types/supabase.ts`. This file should be regenerated if the database schema changes using the Supabase CLI:
```bash
npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
```
For the current project, these are manually maintained to match the SQL migrations.

## Domain Interfaces
The core domain models (`User`, `ProviderProfile`, `Appointment`) are defined in `types.ts`. These interfaces abstract the raw database shape into the application domain.

## Enums
We strictly use enums for fixed values:
- `UserRole`: ADMIN, PROVIDER, CLIENT
- `AppointmentStatus`: PENDING, CONFIRMED, COMPLETED, CANCELLED
- `ModerationStatus`: PENDING, APPROVED, REJECTED

## Utilities
- **Type Guards**: `utils/type-guards.ts` contains functions to safely check types at runtime (e.g., `isProvider(user)`).
- **Validation**: `utils/validation.ts` uses Zod schemas for form validation and type inference.

## Linting
We enforce `@typescript-eslint/no-explicit-any` to prevent the use of `any`.
Run `npm run type-check` to verify the codebase.
