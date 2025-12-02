export const INITIAL_HOME_DATA = {
  carousel: [
    {
      image: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      title: 'Culto de Louvor e Adoração',
      subtitle: 'Venha adorar a Deus conosco'
    },
    {
      image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      title: 'Comunhão e Fé',
      subtitle: 'Uma família para pertencer'
    },
    {
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      title: 'Ensino da Palavra',
      subtitle: 'Crescendo na graça e no conhecimento'
    }
  ],
  pastor: {
    name: 'Pastor Roberto Silva',
    title: 'Pastor Presidente',
    verse: '"Porque Deus amou o mundo de tal maneira..." - João 3:16',
    image: 'https://ui-avatars.com/api/?name=Pastor+Roberto&background=d4af37&color=000&size=200&bold=true'
  },
  welcome: {
    title: 'Bem-vindo à ADMAC',
    text1: 'Somos uma igreja que ama a Deus e as pessoas. Nossa missão é proclamar o evangelho de Jesus Cristo, fazer discípulos e transformar vidas através do amor e da palavra de Deus.',
    text2: 'Venha fazer parte da nossa família! Aqui você encontrará um lugar de acolhimento, crescimento espiritual e comunhão genuína.'
  },
  schedule: [
    { day: 'Domingo', time: '9h', event: 'EBD - Escola Bíblica', iconType: 'Book' },
    { day: 'Domingo', time: '18h', event: 'Culto de Celebração', iconType: 'Music' },
    { day: 'Terça', time: '19h30', event: 'Culto de Doutrina', iconType: 'Book' },
    { day: 'Quinta', time: '19h30', event: 'Culto de Oração', iconType: 'Heart' },
  ],
  activities: [
    {
      title: 'Distribuição de Cestas Básicas',
      date: '1º Sábado do Mês',
      description: 'Ajudando famílias em situação de vulnerabilidade',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop'
    },
    {
      title: 'Sopa Solidária',
      date: 'Toda Quarta-feira',
      description: 'Servindo refeições para pessoas em situação de rua',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop'
    },
    {
      title: 'Ensaio de Louvor',
      date: 'Terça e Quinta',
      description: 'Preparação da equipe de louvor para os cultos',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop'
    }
  ]
};

export const INITIAL_MINISTRIES_DATA = {
  kids: {
    hero: { title: 'Ministério Kids', subtitle: 'Ensinando o caminho em que se deve andar', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=400&fit=crop' },
    info: { schedule: ['Domingos às 9h e 18h', 'Terças às 19h30'], location: 'Sala Kids - Térreo', age: '0 a 12 anos' },
    schedule: [
      { title: 'EBD Kids', date: 'Todo Domingo', time: '9h - 10h', location: 'Sala Kids', description: 'Aulas bíblicas divididas por idade.', image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d?w=400&h=300&fit=crop' },
      { title: 'Culto Infantil', date: 'Todo Domingo', time: '18h - 20h', location: 'Auditório Kids', description: 'Louvor, palavra e muita diversão.', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=400&h=300&fit=crop', caption: 'Dia das Crianças' },
      { url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&h=300&fit=crop', caption: 'EBF de Férias' },
      { url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=300&fit=crop', caption: 'Apresentação de Natal' }
    ],
    testimonials: [
      { name: 'Ana Clara', age: 8, text: 'Eu amo a tia da salinha, ela conta histórias muito legais!', photo: 'https://ui-avatars.com/api/?name=Ana+Clara&background=random' },
      { name: 'Pedro', age: 10, text: 'Fiz muitos amigos aqui na igreja.', photo: 'https://ui-avatars.com/api/?name=Pedro&background=random' }
    ]
  },
  louvor: {
    hero: { title: 'Ministério de Louvor', subtitle: 'Adorando a Deus em espírito e em verdade', verse: '"Cantai ao Senhor um cântico novo..." - Salmos 96:1' },
    mission: { title: 'Nossa Missão', text: 'Conduzir a igreja à presença de Deus através da música, com excelência e unção.' },
    schedule: [
      { activity: 'Ensaio Geral', day: 'Quinta-feira', time: '20h00', location: 'Templo Principal', description: 'Preparação para o culto de domingo.' },
      { activity: 'Ensaio Vocal', day: 'Terça-feira', time: '19h00', location: 'Sala de Música', description: 'Técnica vocal e harmonia.' }
    ],
    team: [
      { name: 'Carlos Oliveira', role: 'Líder de Louvor', photo: 'https://ui-avatars.com/api/?name=Carlos+Oliveira&background=random' },
      { name: 'Mariana Santos', role: 'Vocal', photo: 'https://ui-avatars.com/api/?name=Mariana+Santos&background=random' },
      { name: 'João Paulo', role: 'Tecladista', photo: 'https://ui-avatars.com/api/?name=Joao+Paulo&background=random' }
    ]
  },
  jovens: {
    hero: { title: 'Ministério de Jovens', subtitle: 'Jovens apaixonados por Deus', verse: '"Ninguém despreze a tua mocidade..." - 1 Timóteo 4:12' },
    mission: { title: 'Nossa Missão', text: 'Formar uma geração de jovens comprometidos com a Palavra de Deus, que influenciam a sociedade.' },
    schedule: [
      { activity: 'Culto Jovem', day: 'Sábado', time: '19h30', location: 'Templo Principal', description: 'Muito louvor, adoração e palavra direcionada.' },
      { activity: 'Célula Jovem', day: 'Quarta-feira', time: '20h00', location: 'Nas Casas', description: 'Tempo de comunhão e compartilhamento.' }
    ],
    team: [
      { name: 'Pr. Lucas', role: 'Líder de Jovens', photo: 'https://ui-avatars.com/api/?name=Pr+Lucas&background=random' },
      { name: 'Beatriz', role: 'Vice-Líder', photo: 'https://ui-avatars.com/api/?name=Beatriz&background=random' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop', caption: 'Acampamento 2024' },
      { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop', caption: 'Culto da Virada' },
      { url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=300&fit=crop', caption: 'Evangelismo na Praça' }
    ],
    testimonials: [
      { name: 'Gabriel', age: 22, text: 'O grupo de jovens mudou minha vida. Encontrei amigos verdadeiros.', photo: 'https://ui-avatars.com/api/?name=Gabriel&background=random' },
      { name: 'Juliana', age: 19, text: 'Aqui aprendi a amar a Bíblia.', photo: 'https://ui-avatars.com/api/?name=Juliana&background=random' }
    ]
  },
  mulheres: {
    hero: { title: 'Ministério de Mulheres', subtitle: 'Mulheres transformadas pelo amor de Jesus', verse: '"Mulher virtuosa, quem a achará?" - Provérbios 31:10' },
    mission: { title: 'Nossa Missão', text: 'Acolher, ensinar e inspirar mulheres a viverem o propósito de Deus em suas famílias e na sociedade.' },
    schedule: [
      { activity: 'Culto Rosa', day: '3ª Sexta do Mês', time: '19h30', location: 'Templo Principal', description: 'Um tempo especial só para elas.' },
      { activity: 'Chá de Mulheres', day: 'Trimestral', time: '16h00', location: 'Salão Social', description: 'Comunhão e palestras.' }
    ],
    team: [
      { name: 'Pra. Helena', role: 'Líder', photo: 'https://ui-avatars.com/api/?name=Pra+Helena&background=random' },
      { name: 'Sônia', role: 'Coordenadora', photo: 'https://ui-avatars.com/api/?name=Sonia&background=random' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop', caption: 'Conferência de Mulheres' },
      { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop', caption: 'Chá da Primavera' }
    ],
    testimonials: [
      { name: 'Maria', text: 'Me sinto muito acolhida neste ministério.', photo: 'https://ui-avatars.com/api/?name=Maria&background=random' }
    ]
  },
  lares: {
    hero: { title: 'Ministério de Lares', subtitle: 'Comunhão nos lares', verse: '"...partindo o pão em casa" - Atos 2:46' },
    mission: { title: 'Nossa Missão', text: 'Levar a igreja para dentro das casas, promovendo comunhão, discipulado e fortalecimento de vínculos.' },
    team: [
      { name: 'Ricardo & Vânia', role: 'Coordenadores Gerais', photo: 'https://ui-avatars.com/api/?name=Ricardo+Vania&background=random' },
      { name: 'Pr. Antônio', role: 'Supervisor', photo: 'https://ui-avatars.com/api/?name=Pr+Antonio&background=random' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop', caption: 'Célula Betel', title: 'Célula Betel', text: 'Encontro abençoado na casa do irmão João.', updated: 'Há 2 dias' },
      { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop', caption: 'Célula Vida', title: 'Célula Vida', text: 'Comunhão e estudo da palavra.', updated: 'Há 5 dias' },
      { url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=300&fit=crop', caption: 'Jantar de Líderes', title: 'Jantar de Líderes', text: 'Alinhamento e gratidão por mais um ano.', updated: 'Há 1 semana' }
    ],
    testimonials: [
      { name: 'Roberto', text: 'A célula foi fundamental para minha caminhada cristã.', photo: 'https://ui-avatars.com/api/?name=Roberto&background=random' }
    ]
  },
  retiro: {
    hero: { title: 'Retiros Espirituais', subtitle: 'Renovação e comunhão', verse: '"Vinde a mim..." - Mateus 11:28' },
    mission: { title: 'Por Que Participar?', text: 'Desconecte-se do mundo e conecte-se profundamente com Deus em dias de imersão espiritual.' },
    schedule: [
      { activity: 'Retiro de Carnaval', date: 'Fevereiro', location: 'Chácara Recanto', description: '4 dias de muita glória.' },
      { activity: 'Acampamento Jovem', date: 'Julho', location: 'Sítio das Águas', description: 'Aventura e presença de Deus.' }
    ],
    team: [
      { name: 'Equipe de Eventos', role: 'Organização', photo: 'https://ui-avatars.com/api/?name=Equipe&background=random' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=300&fit=crop', caption: 'Fogueira e Adoração' },
      { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop', caption: 'Batismo no Retiro' }
    ]
  },
  social: {
    hero: { title: 'Ação Social', subtitle: 'Servindo com amor', stats: [
      { value: '500+', label: 'Cestas Básicas' },
      { value: '1000+', label: 'Refeições' },
      { value: '50+', label: 'Voluntários' }
    ] },
    mission: { title: 'Nossa Missão', text: 'Demonstrar o amor de Cristo através de ações práticas, atendendo às necessidades dos menos favorecidos.' },
    schedule: [
      { activity: 'Entrega de Cestas', day: '1º Sábado', time: '09h00', location: 'Sede Social', description: 'Cadastro e distribuição.' },
      { activity: 'Sopa Solidária', day: 'Quarta-feira', time: '19h00', location: 'Praça Central', description: 'Alimento para moradores de rua.' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop', caption: 'Distribuição de Alimentos' },
      { url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop', caption: 'Sopa Solidária' }
    ]
  },
  ebd: {
    hero: { title: 'Escola Bíblica Dominical', subtitle: 'Crescendo no conhecimento', verse: '"Conheçamos e prossigamos em conhecer ao Senhor." - Oseias 6:3' },
    info: { time: 'Domingos, 9h', location: 'ADMAC', audience: 'Todas as idades' },
    schedule: [
      { class: 'Novos Convertidos', teacher: 'Pb. Marcos', room: 'Sala 1' },
      { class: 'Jovens', teacher: 'Dc. Felipe', room: 'Sala 2' },
      { class: 'Casais', teacher: 'Pr. Roberto', room: 'Auditório' },
      { class: 'Teologia Básica', teacher: 'Ev. João', room: 'Sala 3' }
    ],
    team: [
      { name: 'Pr. Roberto', role: 'Superintendente', photo: 'https://ui-avatars.com/api/?name=Pr+Roberto&background=random' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400&h=300&fit=crop', caption: 'Classe de Jovens' }
    ]
  },
  midia: {
    hero: { title: 'Mídia e Comunicação', subtitle: 'Levando a mensagem através da tecnologia', verse: '"...pregai-o sobre os telhados." - Mateus 10:27' },
    live: { title: 'Culto da Família', time: 'Domingos 18h', videoUrl: 'https://www.youtube.com/embed/live_stream?channel=UC...' },
    videos: [
      { title: 'Culto de Domingo - 24/11', date: '24 Nov 2024', views: '1.2k', thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=225&fit=crop' },
      { title: 'Palavra de Fé - Pr. Roberto', date: '20 Nov 2024', views: '850', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop' },
      { title: 'Melhores Momentos - Louvor', date: '15 Nov 2024', views: '2k', thumbnail: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=400&h=225&fit=crop' }
    ],
    team: [
      { name: 'Lucas Silva', role: 'Líder de Mídia', photo: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=random' },
      { name: 'Ana Paula', role: 'Social Media', photo: 'https://ui-avatars.com/api/?name=Ana+Paula&background=random' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1520509414578-d9cbf09933a1?w=400&h=300&fit=crop', caption: 'Equipe em Ação' },
      { url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=300&fit=crop', caption: 'Transmissão Ao Vivo' }
    ]
  },
  intercessao: {
    hero: {
      title: 'Ministério de Intercessão',
      subtitle: 'Levando as necessidades da igreja ao trono da graça',
      verse: '"A oração do justo é poderosa e eficaz." - Tiago 5:16',
      videoUrl: ''
    },
    mission: {
      title: 'Nossa Missão',
      text: 'Somos um grupo dedicado à oração e intercessão pela igreja, pelos líderes, pelas famílias e pelas necessidades apresentadas. Cremos no poder da oração e no mover de Deus através da intercessão.'
    },
    team: [
      { name: 'Ana Paula', role: 'Coordenadora', photo: 'https://ui-avatars.com/api/?name=Ana+Paula&background=d4af37&color=000' },
      { name: 'Carlos Mendes', role: 'Vice-Coordenador', photo: 'https://ui-avatars.com/api/?name=Carlos+Mendes&background=d4af37&color=000' },
      { name: 'Maria Santos', role: 'Secretária', photo: 'https://ui-avatars.com/api/?name=Maria+Santos&background=d4af37&color=000' }
    ],
    schedule: [
      { day: 'Segunda-feira', time: '06:00', activity: 'Vigília da Madrugada' },
      { day: 'Quarta-feira', time: '19:30', activity: 'Reunião de Intercessão' },
      { day: 'Sexta-feira', time: '21:00', activity: 'Corrente de Oração Online' },
      { day: 'Sábado', time: '08:00', activity: 'Intercessão pelos Ministérios' }
    ],
    testimonials: [
      {
        text: 'Deus tem feito maravilhas através da intercessão. Minha família foi restaurada!',
        author: 'Joana Silva'
      },
      {
        text: 'A oração mudou minha vida. Sou grato por este ministério.',
        author: 'Pedro Costa'
      }
    ]
  },
  missoes: {
    hero: {
      title: 'Missões & Ação Social',
      subtitle: 'Levando o amor de Cristo até os confins da terra',
      verse: '"Ide por todo o mundo e pregai o evangelho a toda criatura." - Marcos 16:15',
      videoUrl: ''
    },
    mission: {
      title: 'Nossa Missão',
      text: 'Somos chamados a levar o Evangelho a todas as nações e a demonstrar o amor de Cristo através de ações práticas. Apoiamos missionários no campo, realizamos projetos sociais e trabalhamos para transformar vidas através do poder de Deus.'
    },
    team: [
      { name: 'Marcos Silva', role: 'Coordenador de Missões', photo: 'https://ui-avatars.com/api/?name=Marcos+Silva&background=d4af37&color=000' },
      { name: 'Juliana Costa', role: 'Ação Social', photo: 'https://ui-avatars.com/api/?name=Juliana+Costa&background=d4af37&color=000' },
      { name: 'Roberto Lima', role: 'Apoio aos Missionários', photo: 'https://ui-avatars.com/api/?name=Roberto+Lima&background=d4af37&color=000' }
    ],
    missionaries: [
      {
        name: 'Família Oliveira',
        country: 'Moçambique',
        photo: 'https://ui-avatars.com/api/?name=Familia+Oliveira&background=d4af37&color=000',
        description: 'Plantando igrejas e discipulando líderes no sul da África.',
        yearsOnField: 5
      },
      {
        name: 'Casal Mendes',
        country: 'Índia',
        photo: 'https://ui-avatars.com/api/?name=Casal+Mendes&background=d4af37&color=000',
        description: 'Evangelizando e treinando pastores em regiões não alcançadas.',
        yearsOnField: 3
      },
      {
        name: 'Pastor André',
        country: 'Peru',
        photo: 'https://ui-avatars.com/api/?name=Pastor+Andre&background=d4af37&color=000',
        description: 'Trabalho com comunidades indígenas na Amazônia peruana.',
        yearsOnField: 7
      }
    ],
    projects: [
      {
        title: 'Cestas Básicas',
        description: 'Distribuição mensal para 100 famílias carentes',
        icon: 'Heart',
        impact: '1.200 cestas/ano'
      },
      {
        title: 'Evangelismo de Rua',
        description: 'Ações evangelísticas em praças e comunidades',
        icon: 'Users',
        impact: '500+ alcançados/mês'
      },
      {
        title: 'Apoio a Missionários',
        description: 'Sustento financeiro e espiritual de 8 missionários',
        icon: 'Globe',
        impact: '3 países alcançados'
      },
      {
        title: 'Projeto Criança Feliz',
        description: 'Atividades recreativas e evangelísticas para crianças',
        icon: 'Award',
        impact: '200 crianças atendidas'
      }
    ],
    stats: [
      { number: '8', label: 'Missionários Apoiados', icon: 'Users' },
      { number: '3', label: 'Países Alcançados', icon: 'Globe' },
      { number: '1.200', label: 'Famílias Assistidas/Ano', icon: 'Heart' },
      { number: 'R$ 50k', label: 'Investido em 2024', icon: 'DollarSign' }
    ]
  }
};

export const INITIAL_FOOTER_DATA = {
  contact: { address: 'QN 404 Conjunto A Lote 1 - Samambaia Norte, DF', phone: '(61) 99999-9999', email: 'contato@admac.com.br' },
  social: { facebook: 'admac', instagram: '@admac', youtube: 'ADMAC TV' }
};

export const INITIAL_PAGES_DATA = [
  { id: 'home', name: 'Home', path: '/', status: 'online', type: 'system' },
  { id: 'sobre', name: 'Sobre', path: '/sobre', status: 'online', type: 'system' },
  { id: 'revista', name: 'Revista', path: '/revista', status: 'online', type: 'system' },
  
  // Ministérios
  { id: 'kids', name: 'Min. Kids', path: '/kids', status: 'online', type: 'system' },
  { id: 'louvor', name: 'Min. Louvor', path: '/louvor', status: 'online', type: 'system' },
  { id: 'jovens', name: 'Min. Jovens', path: '/jovens', status: 'online', type: 'system' },
  { id: 'mulheres', name: 'Min. Mulheres', path: '/mulheres', status: 'online', type: 'system' },
  { id: 'lares', name: 'Min. Lares', path: '/lares', status: 'online', type: 'system' },
  { id: 'retiro', name: 'Retiros', path: '/retiro', status: 'online', type: 'system' },
  { id: 'social', name: 'Ação Social', path: '/social', status: 'online', type: 'system' },
  { id: 'midia', name: 'Mídia', path: '/midia', status: 'online', type: 'system' },
  { id: 'ebd', name: 'EBD', path: '/ebd', status: 'online', type: 'system' },
];

