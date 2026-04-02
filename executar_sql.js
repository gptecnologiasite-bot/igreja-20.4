// Script para executar o SQL de restauração dos dados completos
// Execute: node executar_sql.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfghllidghmgywotqyok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2hsbGlkZ2htZ3l3b3RxeW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDAxMzMsImV4cCI6MjA4OTAxNjEzM30.N5IWhBnWgxv9rEtWPVz7oYrluaJsmHsT2QMA72k6ck8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Dados completos do site para serem inseridos/atualizados
const siteData = [
  {
    key: 'home',
    data: {
      carousel: [
        { image: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', title: 'Culto de Louvor e Adoração', subtitle: 'Venha adorar a Deus conosco' },
        { image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', title: 'Comunhão e Fé', subtitle: 'Uma família para pertencer' },
        { image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', title: 'Ensino da Palavra', subtitle: 'Crescendo na graça e no conhecimento' }
      ],
      welcome: { title: 'Bem-vindo à ADMAC', text1: 'Somos uma igreja que ama a Deus e as pessoas. Nossa missão é proclamar o evangelho de Jesus Cristo, fazer discípulos e transformar vidas através do amor e da palavra de Deus.', text2: 'Venha fazer parte da nossa família! Aqui você encontrará um lugar de acolhimento, crescimento espiritual e comunhão genuína.', buttonText: 'Entre em Contato', buttonLink: '/contato' },
      pastors: [
        { name: 'Pastor Roberto Silva', title: 'Pastor Presidente', verse: '"Porque Deus amou o mundo de tal maneira..." - João 3:16', image: 'https://ui-avatars.com/api/?name=Pastor+Roberto&background=d4af37&color=000&size=200&bold=true' },
        { name: 'Pastora Ana Silva', title: 'Pastora Auxiliar', verse: '"O Senhor é o meu pastor, nada me faltará." - Salmos 23:1', image: 'https://ui-avatars.com/api/?name=Pastora+Ana&background=d4af37&color=000&size=200&bold=true' },
        { name: 'Pastor Carlos Mendes', title: 'Pastor de Jovens', verse: '"Ninguém despreze a tua mocidade..." - 1 Timóteo 4:12', image: 'https://ui-avatars.com/api/?name=Pastor+Carlos&background=d4af37&color=000&size=200&bold=true' }
      ],
      schedule: [
        { day: 'Domingo', time: '9h', event: 'EBD - Escola Bíblica', iconType: 'Book' },
        { day: 'Domingo', time: '18h', event: 'Culto de Celebração', iconType: 'Music' },
        { day: 'Terça', time: '19h30', event: 'Culto de Doutrina', iconType: 'Book' },
        { day: 'Quinta', time: '19h30', event: 'Culto de Oração', iconType: 'Heart' }
      ],
      activities: [
        { title: 'Distribuição de Cestas Básicas', date: '1º Sábado do Mês', description: 'Ajudando famílias em situação de vulnerabilidade', image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop' },
        { title: 'Sopa Solidária', date: 'Toda Quarta-feira', description: 'Servindo refeições para pessoas em situação de rua', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop' },
        { title: 'Ensaio de Louvor', date: 'Terça e Quinta', description: 'Preparação da equipe de louvor para os cultos', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop' }
      ],
      cta: { title: 'Faça Parte da Nossa Família', subtitle: 'Venha nos visitar e experimente o amor de Deus em nossa comunidade', primaryBtn: 'Quero Visitar', primaryLink: '/contato', secondaryBtn: 'Ligar Agora', secondaryLink: 'tel:+5561993241084' },
      ministries: [
        { title: 'Kids', description: 'Ensinando a criança no caminho em que deve andar', link: '/kids', icon: '👶', color: '#ff6b9d' },
        { title: 'Louvor', description: 'Adorando a Deus em espírito e em verdade', link: '/louvor', icon: '🎵', color: '#9b59b6' },
        { title: 'EBD', description: 'Crescendo no conhecimento da Palavra', link: '/edb', icon: '📚', color: '#d4af37' },
        { title: 'Ação Social', description: 'Servindo ao próximo com amor', link: '/social', icon: '❤️', color: '#e74c3c' },
        { title: 'Lares', description: 'Comunhão e crescimento nos lares', link: '/lares', icon: '🏠', color: '#3498db' },
        { title: 'Retiro', description: 'Momentos de renovação espiritual', link: '/retiro', icon: '⛰️', color: '#27ae60' },
        { title: 'Mídia', description: 'Comunicação e tecnologia a serviço do Reino', link: '/midia', icon: '🎬', color: '#d4af37' },
        { title: 'Intercessão', description: 'Clamando ao Senhor em todo o tempo', link: '/intercessao', icon: '🙏', color: '#d4af37' },
        { title: 'Casais', description: 'Edificando famílias sobre a Rocha', link: '/casais', icon: '💑', color: '#c19a6b' }
      ],
      spotifyUrl: 'https://open.spotify.com/embed/episode/6vf8aTHBG3ms8DGo5jCsAG?utm_source=generator'
    }
  },
  {
    key: 'header',
    data: {
      logo: { text: 'ADMAC', icon: '✝' },
      menu: [{ name: 'Início', path: '/' }, { name: 'Sobre', path: '/sobre' }, { name: 'Contato', path: '/contato' }],
      social: { instagram: '#', youtube: '#', facebook: '#', phone: '(61) 99324-1084', music: '#' }
    }
  },
  {
    key: 'footer',
    data: {
      logo: { text: 'ADMAC', tagline: 'Vivendo o Sobrenatural' },
      description: 'Assembleia de Deus Ministério Atos e Conquistas - Uma igreja comprometida com a Palavra de Deus e a transformação de vidas.',
      verse: '"Ide por todo o mundo e pregai o evangelho" - Marcos 16:15',
      contact: { address: 'QN 404 Conjunto A Lote 1 - Samambaia Norte, DF', phone: '(61) 99999-9999', email: 'contato@admac.com.br', cultos: 'Dom 18h | Qua 19h30' },
      social: { facebook: 'admac', instagram: '@admac', youtube: 'ADMAC TV', whatsapp: 'https://wa.me/5561993241084', spotify: 'https://open.spotify.com/show/2lzm9pXbj4PCoWcxsFzDtf' }
    }
  },
  { key: 'site_status', data: { online: true, message: '' } },
  {
    key: 'pastors_contacts',
    data: [
      { id: 1, name: 'Pr. Roberto Silva', role: 'Pastor Presidente', phone: '5561993241084', photo: '' },
      { id: 2, name: 'Pra. Ana Silva', role: 'Pastora Auxiliar', phone: '5561993241084', photo: '' },
      { id: 3, name: 'Secretaria ADMAC', role: 'Atendimento Geral', phone: '5561993241084', photo: '' }
    ]
  },
  {
    key: 'ministry_contact',
    data: { title: 'Entre em Contato', description: 'Estamos aqui para te receber! Entre em contato ou venha nos visitar.', address: 'QN 404 Conjunto A Lote 1 - Samambaia Norte, DF', phone: '(61) 99324-1084', email: 'contato@admac.com.br', whatsapp: 'https://wa.me/5561993241084', schedule: 'Domingo: 18h | Quarta: 19h30 | Quinta: 19h30' }
  }
];

async function run() {
  console.log('🚀 Iniciando sincronização dos dados do site...\n');

  // Verifica conexão
  const { data: test, error: connErr } = await supabase.from('site_settings').select('key').limit(1);
  if (connErr) {
    console.error('❌ Erro de conexão com Supabase:', connErr.message);
    process.exit(1);
  }
  console.log('✅ Conexão com Supabase OK\n');

  let ok = 0, fail = 0;

  for (const item of siteData) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: item.key, data: item.data });
    
    if (error) {
      console.error(`❌ Erro ao salvar '${item.key}':`, error.message);
      fail++;
    } else {
      console.log(`✅ Salvo: ${item.key}`);
      ok++;
    }
  }

  console.log(`\n📊 Resultado: ${ok} chaves salvas, ${fail} erros`);

  if (fail === 0) {
    console.log('\n🎉 Todos os dados foram sincronizados com sucesso!');
    console.log('👉 Agora execute o SQL completo no Supabase Editor para os ministérios.\n');
  }
}

run().catch(console.error);
