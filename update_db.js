import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfghllidghmgywotqyok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2hsbGlkZ2htZ3l3b3RxeW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDAxMzMsImV4cCI6MjA4OTAxNjEzM30.N5IWhBnWgxv9rEtWPVz7oYrluaJsmHsT2QMA72k6ck8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDb() {
  console.log('Iniciando atualização do banco de dados...');

  // 1. Contatos dos Pastores
  const { error: err1 } = await supabase
    .from('site_settings')
    .upsert({
      key: 'pastors_contacts',
      data: [
        { id: 1, name: 'Pr. Roberto Silva', role: 'Pastor Presidente', phone: '5561993241084', photo: '' },
        { id: 2, name: 'Pra. Ana Silva', role: 'Pastora Auxiliar', phone: '5561993241084', photo: '' },
        { id: 3, name: 'Secretaria ADMAC', role: 'Atendimento Geral', phone: '5561993241084', photo: '' }
      ]
    }, { onConflict: 'key' });

  if (err1) console.error('Erro ao inserir pastors_contacts:', err1);
  else console.log('✓ Contatos dos pastores atualizados.');

  // 2. Status do Site
  const { error: err2 } = await supabase
    .from('site_settings')
    .upsert({
      key: 'site_status',
      data: { maintenance: false, online: true }
    }, { onConflict: 'key' });

  if (err2) console.error('Erro ao inserir site_status:', err2);
  else console.log('✓ Status do site atualizado.');

  console.log('Atualização concluída.');
}

updateDb();
