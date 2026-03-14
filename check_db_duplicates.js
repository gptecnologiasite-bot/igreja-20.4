
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://SEU_PROJETO_SUPABASE.supabase.co';
const supabaseKey = 'REDACTED_SUPABASE_ANON_KEY';

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
