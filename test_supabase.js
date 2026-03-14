import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing connection to:', supabaseUrl);
console.log('Using Key starting with:', supabaseKey?.substring(0, 15));

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('\n--- Testing Read ---');
    const { data, error } = await supabase.from('site_settings').select('key').limit(1);
    if (error) {
        console.error('Read Error:', error.message);
    } else {
        console.log('Read Success! Found:', data.length, 'records.');
    }

    console.log('\n--- Testing Write (Insert/Upsert) ---');
    const { error: writeError } = await supabase.from('site_settings').upsert({ key: 'test_connection', data: { status: 'ok', timestamp: new Date().toISOString() } });
    if (writeError) {
        console.error('Write Error (expected if not authenticated):', writeError.message);
    } else {
        console.log('Write Success!');
    }
}

test();
