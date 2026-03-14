
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfghllidghmgywotqyok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2hsbGlkZ2htZ3l3b3RxeW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDAxMzMsImV4cCI6MjA4OTAxNjEzM30.N5IWhBnWgxv9rEtWPVz7oYrluaJsmHsT2QMA72k6ck8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('--- Checking table columns ---');
  // Simple select to see columns
  const { data: sample, error: errSample } = await supabase.from('site_settings').select('*').limit(1);
  if (errSample) {
      console.error('Error selecting from site_settings:', errSample);
  } else {
      console.log('Columns found in sample row:', Object.keys(sample[0] || {}));
  }

  console.log('\n--- Checking row counts ---');
  const { data: allData, error: errAll } = await supabase.from('site_settings').select('key');
  if (errAll) {
    console.error('Error counting rows:', errAll);
  } else {
    console.log(`Total rows: ${allData.length}`);
    const keyCounts = {};
    allData.forEach(r => {
      keyCounts[r.key] = (keyCounts[r.key] || 0) + 1;
    });
    console.log('Key distribution:', keyCounts);
  }
}

checkSchema().catch(console.error);
