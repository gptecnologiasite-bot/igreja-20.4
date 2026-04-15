import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://SEU_PROJETO_SUPABASE.supabase.co';
const supabaseKey = 'REDACTED_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
  const { data, error } = await supabase
    .from('site_messages')
    .select('photo_url')
    .limit(1);
    
  if (error) {
    console.error('Column check failed:', error);
  } else {
    console.log('Column photo_url exists!');
  }
}

checkColumn();
