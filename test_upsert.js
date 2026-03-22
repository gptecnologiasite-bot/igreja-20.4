import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfghllidghmgywotqyok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2hsbGlkZ2htZ3l3b3RxeW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDAxMzMsImV4cCI6MjA4OTAxNjEzM30.N5IWhBnWgxv9rEtWPVz7oYrluaJsmHsT2QMA72k6ck8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsert() {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      key: 'test_upsert_key',
      data: { test: true }
    });
    
  if (error) {
    console.error('Upsert failed:', error);
  } else {
    console.log('Upsert successful:', data);
  }
}

testUpsert();
