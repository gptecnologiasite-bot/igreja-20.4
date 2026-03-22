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
  pastors: [
    {
      name: 'Pastor Roberto Silva',
      title: 'Pastor Presidente',
      verse: '"Porque Deus amou o mundo de tal maneira..." - João 3:16',
      image: 'https://ui-avatars.com/api/?name=Pastor+Roberto&background=d4af37&color=000&size=200&bold=true'
    },
    {
      name: 'Pastora Ana Silva',
      title: 'Pastora Auxiliar',
      verse: '"O Senhor é o meu pastor, nada me faltará." - Salmos 23:1',
      image: 'https://ui-avatars.com/api/?name=Pastora+Ana&background=d4af37&color=000&size=200&bold=true'
    },
    {
      name: 'Pastor Carlos Mendes',
      title: 'Pastor de Jovens',
      verse: '"Ninguém despreze a tua mocidade..." - 1 Timóteo 4:12',
      image: 'https://ui-avatars.com/api/?name=Pastor+Carlos&background=d4af37&color=000&size=200&bold=true'
    }
  ],
  welcome: {
    title: 'Bem-vindo à ADMAC',
    text1: 'Somos uma igreja que ama a Deus e as pessoas. Nossa missão é proclamar o evangelho de Jesus Cristo, fazer discípulos e transformar vidas através do amor e da palavra de Deus.',
    text2: 'Venha fazer parte da nossa família! Aqui você encontrará um lugar de acolhimento, crescimento espiritual e comunhão genuína.',
    buttonText: 'Entre em Contato',
    buttonLink: '/contato'
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
  ],
  spotifyUrl: 'https://open.spotify.com/embed/episode/6vf8aTHBG3ms8DGo5jCsAG?utm_source=generator',
  cta: {
    title: 'Faça Parte da Nossa Família',
    subtitle: 'Venha nos visitar e experimente o amor de Deus em nossa comunidade',
    primaryBtn: 'Quero Visitar',
    primaryLink: '/contato',
    secondaryBtn: 'Ligar Agora',
    secondaryLink: 'tel:+5561993241084'
  },
  ministries: [
    { title: "Kids", description: "Ensinando a criança no caminho em que deve andar", link: "/kids", icon: "👶", color: "#ff6b9d" },
    { title: "Louvor", description: "Adorando a Deus em espírito e em verdade", link: "/louvor", icon: "🎵", color: "#9b59b6" },
    { title: "EBD", description: "Crescendo no conhecimento da Palavra", link: "/edb", icon: "📚", color: "#d4af37" },
    { title: "Ação Social", description: "Servindo ao próximo com amor", link: "/social", icon: "❤️", color: "#e74c3c" },
    { title: "Lares", description: "Comunhão e crescimento nos lares", link: "/lares", icon: "🏠", color: "#3498db" },
    { title: "Retiro", description: "Momentos de renovação espiritual", link: "/retiro", icon: "⛰️", color: "#27ae60" },
    { title: "Mídia", description: "Comunicação e tecnologia a serviço do Reino", link: "/midia", icon: "🎬", color: "#d4af37" },
    { title: "Intercessão", description: "Clamando ao Senhor em todo o tempo", link: "/intercessao", icon: "🙏", color: "#d4af37" }
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
    ],
    birthdays: {
      title: 'Aniversariantes do Mês',
      text: 'Vamos celebrar a vida dos nossos pequenos!',
      videoUrl: '',
      people: []
    }
  },
  louvor: {
    hero: { title: 'Ministério de Louvor', subtitle: 'Adorando a Deus em espírito e em verdade', verse: '"Cantai ao Senhor um cântico novo..." - Salmos 96:1', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop' },
    mission: { title: 'Nossa Missão', text: 'Conduzir a igreja à presença de Deus através da música, com excelência e unção.' },
    schedule: [
      { activity: 'Ensaio Geral', day: 'Quinta-feira', time: '20h00', location: 'Templo Principal', description: 'Preparação para o culto de domingo.' },
      { activity: 'Ensaio Vocal', day: 'Terça-feira', time: '19h00', location: 'Sala de Música', description: 'Técnica vocal e harmonia.' }
    ],
    team: [
      { name: 'Carlos Oliveira', role: 'Líder de Louvor', photo: 'https://ui-avatars.com/api/?name=Carlos+Oliveira&background=random' },
      { name: 'Mariana Santos', role: 'Vocal', photo: 'https://ui-avatars.com/api/?name=Mariana+Santos&background=random' },
      { name: 'João Paulo', role: 'Tecladista', photo: 'https://ui-avatars.com/api/?name=Joao+Paulo&background=random' }
    ],
    birthdays: {
      title: 'Aniversariantes do Mês',
      text: 'Parabéns aos nossos adoradores aniversariantes!',
      videoUrl: '',
      people: []
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800', caption: 'Ensaio Geral' },
      { url: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?auto=format&fit=crop&q=80&w=800', caption: 'Culto de domingo' },
      { url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800', caption: 'Noite de Adoração' },
    ]
  },
  jovens: {
    hero: { title: 'Ministério de Jovens', subtitle: 'Jovens apaixonados por Deus', verse: '"Ninguém despreze a tua mocidade..." - 1 Timóteo 4:12', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop' },
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
    ],
    birthdays: {
      title: 'Aniversariantes do Mês',
      text: 'Nossos jovens ficando mais velhos!',
      videoUrl: '',
      people: []
    }
  },
  mulheres: {
    hero: { title: 'Ministério de Mulheres', subtitle: 'Mulheres transformadas pelo amor de Jesus', verse: '"Mulher virtuosa, quem a achará?" - Provérbios 31:10', image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=400&fit=crop' },
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
    ],
    birthdays: {
      title: 'Aniversariantes do Mês',
      text: 'Mulheres virtuosas e abençoadas que celebram vida este mês!',
      videoUrl: '',
      people: []
    }
  },
  homens: {
    hero: { title: 'Ministério de Homens', subtitle: 'Firmes na fé, liderando em amor', verse: '"Sede firmes, inabaláveis..." - 1 Coríntios 15:58', videoUrl: '', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop' },
    mission: { title: 'Nossa Missão', text: 'Fortalecer homens na Palavra e no caráter de Cristo para liderarem suas famílias e servirem à igreja.' },
    schedule: [
      { activity: 'Encontro de Homens', day: '1º Sábado do Mês', time: '8h00', location: 'Salão Social', description: 'Comunhão, estudo e oração.' },
      { activity: 'Estudo Bíblico', day: 'Quarta-feira', time: '20h00', location: 'Sala 3', description: 'Formação de caráter cristão.' }
    ],
    team: [
      { name: 'Pr. Roberto', role: 'Líder Geral', photo: 'https://ui-avatars.com/api/?name=Pr+Roberto&background=random' },
      { name: 'Eduardo', role: 'Coordenador', photo: 'https://ui-avatars.com/api/?name=Eduardo&background=random' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop', caption: 'Café dos Homens' },
      { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop', caption: 'Estudo e Comunhão' },
      { url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=300&fit=crop', caption: 'Confraternização' },
      { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop', caption: 'Louvor e Oração' },
      { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop', caption: 'Retiro de Homens' }
    ],
    testimonials: [
      { name: 'André', text: 'Encontrei direção e irmãos que caminham comigo.', photo: 'https://ui-avatars.com/api/?name=Andre&background=random' }
    ],
    birthdays: {
      title: 'Aniversariantes do Mês',
      text: 'Homens segundo o coração de Deus.',
      videoUrl: '',
      people: []
    }
  },
  lares: {
    hero: { title: 'Ministério de Lares', subtitle: 'Comunhão nos lares', verse: '"...partindo o pão em casa" - Atos 2:46', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop' },
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
    ],
    birthdays: {
      title: 'Aniversariantes',
      text: 'Celebrando a comunhão.',
      videoUrl: '',
      people: []
    }
  },
  retiro: {
    hero: { title: 'Retiros Espirituais', subtitle: 'Renovação e comunhão', verse: '"Vinde a mim..." - Mateus 11:28', image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&h=400&fit=crop' },
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
    hero: { title: 'Ação Social', subtitle: 'Servindo com amor', image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&h=400&fit=crop', stats: [
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
    hero: { title: 'Escola Bíblica Dominical', subtitle: 'Crescendo no conhecimento', verse: '"Conheçamos e prossigamos em conhecer ao Senhor." - Oseias 6:3', image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1200&h=400&fit=crop' },
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
    hero: { 
      title: "Portal de Mídia", 
      subtitle: "Excelência técnica e criatividade a serviço do Reino de Deus", 
      image: "imagem/midia.jpg",
      cta: "Ver Programação",
      verse: '"...pregai-o sobre os telhados." - Mateus 10:27'
    },
    live: { 
      title: "Culto Online - Assista Agora", 
      url: "https://www.youtube.com/embed/3W6qi38SntU?si=4vC2GYojoOU2IfWY",
      description: "Acompanhe nossas transmissões ao vivo todos os domingos às 18h."
    },
    videos: [
      { title: 'Culto de Domingo - 24/11', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', date: '24 Nov 2024', views: '125', thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80' },
      { title: 'Palavra de Fé - Pr. Roberto', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', date: '20 Nov 2024', views: '89', thumbnail: 'https://images.unsplash.com/photo-1504052434569-7c96024f44c8?auto=format&fit=crop&q=80' }
    ],
    team: [
      { name: "Humberto Freitas", role: "Coordenador Geral", photo: "imagem/midia.jpg" },
      { name: "Equipe Técnica", role: "Produção & Transmissão", photo: "imagem/midia.jpg" }
    ],
    gallery: [
      { url: "imagem/midia1.jpg", caption: "Equipe em Ação" },
      { url: "imagem/midia.jpg", caption: "Transmissão Especial" },
      { url: "imagem/banner2.png", caption: "Workshop de Fotografia" }
    ],
    backstage: [
      { 
        title: "Por Trás das Câmeras", 
        text: "Nossa equipe trabalha incansavelmente para garantir que a mensagem chegue a cada lar com a melhor qualidade possível.",
        image: "/midia.jpg",
        layout: "left"
      },
      { 
        title: "Tecnologia & Fé", 
        text: "Utilizamos as melhores ferramentas digitais para expandir o alcance do Evangelho no mundo digital.",
        image: "imagem/midia1.jpg",
        layout: "right"
      }
    ],
    birthdays: { 
      title: "Aniversariantes do Mês", 
      text: "Celebrando a vida daqueles que tornam nossa missão possível!", 
      people: [
        { name: "Humberto Freitas", date: "02/03", photo: "imagem/midia.jpg", isToday: true }
      ] 
    },
    testimonials: [
      { name: "Maria Oliveira", role: "Membro Online", text: "A qualidade da transmissão é impecável. Sinto-me parte da igreja mesmo estando longe.", photo: "https://ui-avatars.com/api/?name=Maria+Oliveira" },
      { name: "João Souza", role: "Visitante", text: "Conheci a ADMAC através do YouTube e hoje sou membro presencial. Trabalho incrível!", photo: "https://ui-avatars.com/api/?name=Joao+Souza" }
    ],
    schedule: [
      { day: "Domingo", time: "18h", activity: "Culto de Celebração", location: "Templo Principal", isNext: true },
      { day: "Quarta", time: "19h30", activity: "Culto de Ensino", location: "Templo Principal", isNext: false },
      { day: "Sábado", time: "14h", activity: "Ensaio Técnico", location: "Cabine de Som", isNext: false }
    ],
    news: [
      { title: "Novo Equipamento de Transmissão", summary: "Chegaram as novas câmeras 4K para elevar o nível das nossas lives.", image: "imagem/midia1.jpg", date: "28 Fev, 2024" },
      { title: "Workshop de Mídia 2024", summary: "Treinamento intensivo para novos voluntários no próximo mês.", image: "imagem/midia.jpg", date: "25 Fev, 2024" }
    ],
    footer: {
      text: "ADMAC Mídia - Comunicando a Verdade com Excelência",
      social: { instagram: "@admacoficial", youtube: "ADMAC TV", facebook: "ADMAC" }
    }
  },
  intercessao: {
    hero: { 
      title: 'Ministério de Intercessão', 
      subtitle: 'Clamando ao Senhor em todo o tempo', 
      verse: '"Orai sem cessar." - 1 Tessalonicenses 5:17',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80'
    },
    mission: { 
      title: 'Nossa Missão', 
      text: 'Sustentar a igreja, seus ministérios e famílias através da oração intercessória, crendo no poder de Deus para transformar realidades.' 
    },
    schedule: [
      { day: 'Segunda-feira', time: '19h00', activity: 'Reunião de Intercessão' },
      { day: 'Quarta-feira', time: '06h00', activity: 'Oração Matutina' }
    ],
    team: [
      { name: 'Equipe de Intercessão', role: 'Líderes', photo: 'https://ui-avatars.com/api/?name=Intercessao&background=random' }
    ],
    testimonials: [
      { author: 'Visitante', text: 'Senti a presença de Deus e a força das orações desta igreja.' }
    ]
  },
  missoes: {
    hero: {
      title: 'Ministério de Missões',
      subtitle: 'Levando o Evangelho a todas as nações',
      verse: '"Ide por todo o mundo e pregai o evangelho a toda criatura." - Marcos 16:15',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    mission: {
      title: 'Nossa Missão',
      text: 'O Ministério de Missões da ADMAC tem como propósito cumprir o IDE de Jesus, apoiando missionários no campo e realizando ações sociais que demonstram o amor de Deus na prática.'
    },
    stats: [
      { icon: 'Globe', number: '12', label: 'Nações Alcançadas' },
      { icon: 'Users', number: '24', label: 'Missionários' },
      { icon: 'Heart', number: '500+', label: 'Vidas Impactadas' },
      { icon: 'Award', number: '15', label: 'Projetos Sociais' }
    ],
    missionaries: [
      {
        name: 'Família Oliveira',
        country: 'Moçambique',
        description: 'Trabalho com crianças e plantação de igrejas no interior de Moçambique.',
        photo: 'https://ui-avatars.com/api/?name=Familia+Oliveira&background=random',
        yearsOnField: 8
      },
      {
        name: 'Casal Mendes',
        country: 'Índia',
        description: 'Treinamento de líderes locais e apoio a comunidades rurais.',
        photo: 'https://ui-avatars.com/api/?name=Casal+Mendes&background=random',
        yearsOnField: 5
      }
    ],
    projects: [
      { icon: 'Water', title: 'Água Viva', description: 'Construção de poços artesianos em comunidades carentes.', impact: '5 poços construídos em 2023' },
      { icon: 'Book', title: 'Educar para o Reino', description: 'Apoio escolar e material didático para crianças órfãs.', impact: '120 crianças atendidas' }
    ],
    team: [
      { name: 'Pr. André Santos', role: 'Diretor de Missões', photo: 'https://ui-avatars.com/api/?name=Andre+Santos&background=random' },
      { name: 'Letícia Lima', role: 'Secretária', photo: 'https://ui-avatars.com/api/?name=Leticia+Lima&background=random' }
    ]
  },
  revista: {
    hero: { title: 'Revista Admac', subtitle: 'Nossa revista mensal' },
    pages: [
      {
        id: 1,
        type: "cover",
        title: "ANO DE ROMPER",
        subtitle: "Vivendo o sobrenatural de Deus em 2025",
        edition: "Edição Nº 42 • Dezembro 2025",
        image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: 2,
        type: "index",
        title: "Nesta Edição",
        items: [
          { label: "Palavra do Pastor", page: 3, icon: "BookOpen" },
          { label: "Colunista: Pr. João", page: 4, icon: "PenTool" },
          { label: "Devocional Diário", page: 5, icon: "Sun" },
          { label: "Agenda do Mês", page: 6, icon: "Calendar" },
          { label: "Missões & Social", page: 7, icon: "Heart" },
          { label: "Ministério Infantil", page: 8, icon: "Star" },
          { label: "Jovens & Teen", page: 9, icon: "Users" },
        ],
      },
      {
        id: 3,
        type: "article",
        category: "Palavra Pastoral",
        title: "Um Novo Tempo",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        body: `Amada igreja, estamos vivendo um tempo precioso de renovação. O Senhor tem nos chamado para águas mais profundas e para um compromisso renovado com a Sua Palavra. \n\n    Neste mês, quero desafiar cada um de vocês a buscar a face de Deus como nunca antes. Não se contentem com o raso, não se contentem com o que já viveram. Deus tem coisas novas e maiores para nós.\n    \n    Lembrem-se das palavras de Isaías 43:19: "Eis que faço uma coisa nova; agora está saindo à luz; porventura não a percebeis? Eis que porei um caminho no deserto, e rios no ermo."\n    \n    Que este seja o nosso clamor e a nossa expectativa para o próximo ano. Deus abençoe a todos!`,
      },
      {
        id: 4,
        type: "columnist",
        category: "Liderança",
        author: {
          name: "Pr. João Silva",
          role: "Vice-Presidente ADMAC",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
          bio: "Teólogo, escritor e conferencista. Dedica sua vida ao ensino da Palavra e formação de líderes."
        },
        title: "O Poder da Unidade",
        body: `A unidade não é apenas uma boa ideia, é um mandamento do Senhor. Quando a igreja caminha unida, o inferno estremece e o Reino de Deus avança.\n    \n    Muitas vezes confundimos unidade com uniformidade. Deus ama a diversidade, mas Ele exige unidade de propósito e de espírito. Como corpo de Cristo, somos muitos membros, mas um só corpo.\n    \n    <quote>A verdadeira unidade nasce aos pés da cruz, onde reconhecemos que todos carecemos da mesma graça.</quote>\n    \n    Neste tempo final, precisamos deixar de lado nossas diferenças menores e focar no que realmente importa: a salvação de almas e a glória de Deus.`,
      },
      {
        id: 5,
        type: "devotional",
        category: "Pão Diário",
        title: "Alimento para a Alma",
        items: [
          { date: "01 DEZ", title: "Fé Inabalável", text: "A fé não é sentir que tudo vai dar certo, é saber que Deus está no controle mesmo quando tudo parece dar errado. Hebreus 11:1 nos lembra que a fé é a certeza." },
          { date: "02 DEZ", title: "Amor ao Próximo", text: "Amar quem nos ama é fácil. O desafio do Evangelho é amar quem nos persegue. Jesus nos ensinou a orar pelos nossos inimigos e abençoar quem nos maldiz." },
          { date: "03 DEZ", title: "Esperança Viva", text: "Nossa esperança não está nas circunstâncias, mas na promessa daquele que é fiel. Ele prometeu estar conosco todos os dias até a consumação dos séculos." },
        ]
      },
      {
        id: 6,
        type: "feature",
        category: "Agenda",
        title: "Dezembro na ADMAC",
        events: [
          { date: "07/12", title: "Santa Ceia do Senhor", time: "19:00" },
          { date: "14/12", title: "Cantata de Natal Kids", time: "19:30" },
          { date: "21/12", title: "Culto da Família Especial", time: "18:00" },
          { date: "31/12", title: "Culto da Virada", time: "22:00" },
        ],
      },
      {
        id: 7,
        type: "article",
        category: "Missões",
        title: "Ide por todo o mundo",
        image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
        body: `Nosso departamento de missões tem alcançado vidas em lugares onde o Evangelho ainda é pouco conhecido. Graças às suas orações e contribuições, enviamos mais dois missionários para o campo no último mês.\n    \n    O trabalho social também continua forte. Foram distribuídas mais de 50 cestas básicas para famílias carentes da nossa comunidade. Isso é ser igreja: amar a Deus e amar ao próximo com atitudes concretas.\n    \n    Continue orando e contribuindo. A obra não pode parar!`,
      },
      {
        id: 8,
        type: "feature",
        category: "Kids",
        title: "Geração do Futuro",
        events: [
          { date: "Todo Domingo", title: "Escola Bíblica Dominical", time: "09:00" },
          { date: "Sábados", title: "Ensaio do Coral Kids", time: "15:00" },
        ],
        highlight: "Não perca a nossa Cantata de Natal! As crianças estão preparando algo lindo para o Senhor.",
      },
      {
        id: 9,
        type: "article",
        category: "Jovens",
        title: "Conferência Radical",
        image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
        body: `A Conferência Radical foi um marco na vida dos nossos jovens. Foram três dias de muita adoração, palavra e quebrantamento. Vimos jovens se entregando a Jesus e sendo batizados no Espírito Santo.\n    \n    Mas não para por aí! Nossos cultos de sábado continuam a todo vapor. Se você tem entre 18 e 30 anos, venha fazer parte dessa galera que é apaixonada por Jesus.`,
      },
    ]
  },
  sobre: {
    hero: { 
      title: 'Sobre a ADMAC', 
      subtitle: 'Nossa história, missão e valores',
      verse: '"Até aqui nos ajudou o Senhor." - 1 Samuel 7:12'
    },
    mission: { 
      title: 'Nossa Missão', 
      text: 'Proclamar o evangelho de Jesus Cristo, fazer discípulos e transformar vidas através do amor e da palavra de Deus. Queremos ser uma igreja relevante, que impacta a sociedade e vive o sobrenatural de Deus todos os dias.' 
    },
    team: [
      { name: 'Pr. Roberto Silva', role: 'Pastor Presidente', photo: 'https://ui-avatars.com/api/?name=Pastor+Roberto&background=d4af37&color=000&size=200&bold=true' },
      { name: 'Pra. Ana Silva', role: 'Pastora Auxiliar', photo: 'https://ui-avatars.com/api/?name=Pastora+Ana&background=d4af37&color=000&size=200&bold=true' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?auto=format&fit=crop&w=1200&q=80', caption: 'Nossa sede' },
      { url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80', caption: 'Comunhão' }
    ]
  }
};

export const INITIAL_HEADER_DATA = {
  logo: { text: 'ADMAC', icon: '✝' },
  menu: [
    { name: 'Início', path: '/' },
    { name: 'Sobre', path: '/sobre' },
    { name: 'Contato', path: '/contato' }
  ],
  social: {
    instagram: '#',
    youtube: '#',
    facebook: '#',
    phone: '(61) 99324-1084',
    music: '#'
  }
};

export const INITIAL_FOOTER_DATA = {
  logo: { text: 'ADMAC', tagline: 'Vivendo o Sobrenatural' },
  description: 'Assembleia de Deus Ministério Atos e Conquistas - Uma igreja comprometida com a Palavra de Deus e a transformação de vidas.',
  verse: '"Ide por todo o mundo e pregai o evangelho" - Marcos 16:15',
  contact: { 
    address: 'QN 404 Conjunto A Lote 1 - Samambaia Norte, DF', 
    phone: '(61) 99999-9999', 
    email: 'contato@admac.com.br',
    cultos: 'Dom 18h | Qua 19h30'
  },
  social: { 
    facebook: 'admac', 
    instagram: '@admac', 
    youtube: 'ADMAC TV',
    spotify: 'https://open.spotify.com/show/2lzm9pXbj4PCoWcxsFzDtf'
  }
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
  { id: 'homens', name: 'Min. Homens', path: '/homens', status: 'online', type: 'system' },
  { id: 'lares', name: 'Min. Lares', path: '/lares', status: 'online', type: 'system' },
  { id: 'retiro', name: 'Retiros', path: '/retiro', status: 'online', type: 'system' },
  { id: 'social', name: 'Ação Social', path: '/social', status: 'online', type: 'system' },
  { id: 'ebd', name: 'EBD', path: '/ebd', status: 'online', type: 'system' },
  { id: 'midia', name: 'Midia', path: '/midia', status: 'online', type: 'system' },
  { id: 'missoes', name: 'Missões', path: '/missoes', status: 'online', type: 'system' },
  { id: 'intercessao', name: 'Intercessão', path: '/intercessao', status: 'online', type: 'system' },
  { id: 'contact', name: 'Contato', path: '/contato', status: 'online', type: 'system' }
];

