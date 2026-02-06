
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Ensure these variables are set in your .env file
// VITE_SUPABASE_URL
// VITE_SUPABASE_ANON_KEY

const getEnv = (key: string) => {
  // Safe access to import.meta.env
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Strict check for valid configuration
// Returns false if URL is missing, placeholder, or undefined string
export const isConfigured = 
  !!supabaseUrl && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl !== 'undefined' &&
  supabaseUrl !== 'null';

// Initialize with valid URL/Key or fallback to prevent crash on load
// Operations will fail if keys are invalid, but the app won't crash on import
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
