/**
 * Environment Variable Validator
 * Ensures all required configuration is present at startup.
 */

export const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
] as const;

export function validateEnv() {
  const missingVars: string[] = [];
  
  // Safe access to environment variables
  // Handle cases where import.meta.env might be undefined during certain build steps
  const env = (import.meta as any).env || {};

  // Check VITE_ variables (exposed to client)
  requiredEnvVars.forEach(key => {
    if (!env[key]) {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    const errorMsg = `
      ⚠️ CONFIGURATION WARNING: Missing Environment Variables
      -----------------------------------------------------
      The following required variables are missing:
      ${missingVars.join('\n      ')}

      The app will load in 'Demo Mode' but API calls may fail.
      Please create a .env file based on .env.example.
    `;
    console.warn(errorMsg);
    
    // We do NOT throw here anymore to prevent the "Failed to load app" white screen.
    // The app should attempt to render, and specific features will fail gracefully.
  } else {
    console.log('✅ Environment configuration validated.');
  }
}