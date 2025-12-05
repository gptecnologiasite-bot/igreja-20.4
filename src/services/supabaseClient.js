import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://PROJETO_SUPABASE_ANTIGO.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('activity_logs').select('count').limit(1);
    return !error;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
};
