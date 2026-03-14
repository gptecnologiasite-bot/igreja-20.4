
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://SEU_PROJETO_SUPABASE.supabase.co';
const supabaseKey = 'REDACTED_SUPABASE_ANON_KEY';

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
