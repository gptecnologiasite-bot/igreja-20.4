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
  console.log('--- Inspecionando Dados da Home ---');
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'home');

  if (error) {
    console.error('Erro ao ler:', error);
  } else if (data.length === 0) {
    console.log('Chave "home" não encontrada no site_settings.');
  } else {
    const homeData = data[0].data;
    console.log('Data da Home encontrada!');
    console.log('Carousel slides:', homeData.carousel?.length || 0);
    if (homeData.carousel?.[0]) {
      console.log('Primeiro Slide:', homeData.carousel[0].title);
    }
  }
}

inspect();
