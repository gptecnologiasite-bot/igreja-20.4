import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfghllidghmgywotqyok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2hsbGlkZ2htZ3l3b3RxeW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDAxMzMsImV4cCI6MjA4OTAxNjEzM30.N5IWhBnWgxv9rEtWPVz7oYrluaJsmHsT2QMA72k6ck8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key')
    .eq('key', 'ministry_mulheres');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Found ${data.length} rows for ministry_mulheres`);
  }
}

checkData();
