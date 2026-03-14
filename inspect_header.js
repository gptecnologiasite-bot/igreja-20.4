import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('--- Inspecionando Dados do Header ---');
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'header');

  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('Dados do Header:', JSON.stringify(data, null, 2));
  }
}

inspect();
