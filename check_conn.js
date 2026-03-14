import { testSupabaseConnection } from './src/lib/supabase.js';

async function run() {
  console.log('Testing Supabase Connection...');
  const result = await testSupabaseConnection();
  console.log('Result:', JSON.stringify(result, null, 2));
}

run();
