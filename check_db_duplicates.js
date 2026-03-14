
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfghllidghmgywotqyok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2hsbGlkZ2htZ3l3b3RxeW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDAxMzMsImV4cCI6MjA4OTAxNjEzM30.N5IWhBnWgxv9rEtWPVz7oYrluaJsmHsT2QMA72k6ck8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
  console.log('--- Verificando em site_settings ---');
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'home');

  if (error) {
    console.error('Erro ao buscar dados:', error.message);
    return;
  }

  console.log(`Encontradas ${data.length} entradas para a chave "home".`);
  data.forEach((item, idx) => {
    console.log(`\n--- Registro [${idx}] ---`);
    console.log(`Key: ${item.key}`);
    const d = item.data;
    if (d) {
        console.log('Welcome Title:', d.welcome?.title);
        console.log('Carousel Sliders:', d.carousel ? d.carousel.length : 0);
        if (d.carousel) {
            d.carousel.forEach((s, i) => console.log(`  [${i}] ${s.title}`));
        }
        console.log('Videos no objeto home:', d.videos ? d.videos.length : 0);
    } else {
        console.log('O campo "data" está VAZIO ou nulo.');
    }
  });

  process.exit();
}

checkDuplicates();
