
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isConfigured = 
  !!supabaseUrl && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl !== 'undefined' &&
  supabaseUrl !== 'null';

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
