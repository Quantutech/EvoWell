# Implementation Plan: Supabase Integration & GCP Deployment

## Root Cause / Objective
The user has provided Supabase credentials and requires a complete setup for development and production (GCP). Additionally, there's a need for data migration guidance and resolving persistence issues.

## Proposed Changes

### 1. Environment Configuration
- **File**: `.env.local` (Create/Update)
  - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **File**: `.env.example`
  - Ensure it reflects the required variables.
- **File**: `app.yaml`
  - Add Supabase environment variables for GCP App Engine.

### 2. Provider Persistence Fix
- **Problem**: In production, "provider persistence" might be failing if the app relies on `mockStore` or inconsistent `localStorage` usage between refreshes, or if the `SupabaseAuthService` doesn't properly restore provider profiles on refresh.
- **Action**: Ensure `src/services/auth.service.ts` and `src/services/provider.service.ts` correctly fetch and cache the provider profile from Supabase when a session exists.

### 3. Database Migration & Documentation
- **File**: `MIGRATION_GUIDE.md` (Update)
  - Provide SQL snippets for the `users`, `providers`, and other tables based on `SEED_DATA`.
  - Explain how to use Supabase Dashboard for data import.

### 4. Security
- Document that `VITE_SUPABASE_ANON_KEY` is safe for client-side use if RLS (Row Level Security) is enabled.
- Advise against using the Service Role key in the frontend.

## Potential Side Effects
- Switching to Supabase implementation in `auth.service.ts` will disable mock logins.
- If RLS is not configured in Supabase, data will not be accessible or will be too accessible.

## Verification Plan
- `npm run build`: Ensure environment variables are correctly injected during build.
- Manual check: Verify `src/services/supabase.ts` correctly picks up variables.
- Connectivity check: `isConfigured` should be true in `supabase.ts`.
