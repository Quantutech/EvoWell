
# EvoWell Secure Setup Guide

This guide details the steps required to configure the application securely, ensuring no sensitive keys are exposed in the client bundle.

## 1. Environment Variables

We use separate environment files for development and production.

### Local Development
1. Copy `.env.example` to `.env`.
2. Populate the variables:
   ```bash
   cp .env.example .env
   ```

**Required Variables:**
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Project API Anon Key.

**Note:** Do **not** add `GOOGLE_GENAI_KEY` to your local `.env` file. It is handled server-side.

## 2. Supabase Edge Functions

All AI operations are handled by the `ai-assistant` Edge Function to keep your Google API Key secure.

### Deploying the Function
1. Install Supabase CLI:
   ```bash
   brew install supabase/tap/supabase
   ```
2. Login:
   ```bash
   supabase login
   ```
3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
4. Set your Google API Secret (Production):
   ```bash
   supabase secrets set GOOGLE_GENAI_KEY=your-actual-google-key
   ```
5. Deploy the function:
   ```bash
   supabase functions deploy ai-assistant
   ```

## 3. Google Cloud Restrictions

To further secure your API key:

1. Go to **Google Cloud Console > APIs & Services > Credentials**.
2. Select your API Key.
3. **Application restrictions**: None (since it is called from Supabase Edge Functions, IP restriction is difficult as IPs rotate. However, storing it in Supabase Secrets is secure).
4. **API restrictions**: Select **Restrict key** and check only **Generative Language API**.

## 4. Troubleshooting

**"Missing Env Vars" Error:**
If you see a red screen or console error about missing variables, ensure your `.env` file exists in the root directory and contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart the dev server after changes.

**AI Features Not Working:**
Check the browser console. If you see "Edge Function Error", ensure:
1. You have deployed the function.
2. You have set the `GOOGLE_GENAI_KEY` secret in Supabase.
