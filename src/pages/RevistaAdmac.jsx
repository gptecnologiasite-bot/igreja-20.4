import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Heart, Users, Star, PenTool, Sun, Quote } from "lucide-react";
import "../css/Revista.css";

// Dados da Revista (Simulando CMS)
const magazineData = [
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
      { label: "Palavra do Pastor", page: 3, icon: BookOpen },
      { label: "Colunista: Pr. João", page: 4, icon: PenTool },
      { label: "Devocional Diário", page: 5, icon: Sun },
      { label: "Agenda do Mês", page: 6, icon: Calendar },
      { label: "Missões & Social", page: 7, icon: Heart },
      { label: "Ministério Infantil", page: 8, icon: Star },
      { label: "Jovens & Teen", page: 9, icon: Users },
    ],
  },
  {
    id: 3,
    type: "article",
    category: "Palavra Pastoral",
    title: "Um Novo Tempo",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    body: `Amada igreja, estamos vivendo um tempo precioso de renovação. O Senhor tem nos chamado para águas mais profundas e para um compromisso renovado com a Sua Palavra. 

    Neste mês, quero desafiar cada um de vocês a buscar a face de Deus como nunca antes. Não se contentem com o raso, não se contentem com o que já viveram. Deus tem coisas novas e maiores para nós.
    
    Lembrem-se das palavras de Isaías 43:19: "Eis que faço uma coisa nova; agora está saindo à luz; porventura não a percebeis? Eis que porei um caminho no deserto, e rios no ermo."
    
    Que este seja o nosso clamor e a nossa expectativa para o próximo ano. Deus abençoe a todos!`,
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
    body: `A unidade não é apenas uma boa ideia, é um mandamento do Senhor. Quando a igreja caminha unida, o inferno estremece e o Reino de Deus avança.
    
    Muitas vezes confundimos unidade com uniformidade. Deus ama a diversidade, mas Ele exige unidade de propósito e de espírito. Como corpo de Cristo, somos muitos membros, mas um só corpo.
    
    <quote>A verdadeira unidade nasce aos pés da cruz, onde reconhecemos que todos carecemos da mesma graça.</quote>
    
    Neste tempo final, precisamos deixar de lado nossas diferenças menores e focar no que realmente importa: a salvação de almas e a glória de Deus.`,
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
    body: `Nosso departamento de missões tem alcançado vidas em lugares onde o Evangelho ainda é pouco conhecido. Graças às suas orações e contribuições, enviamos mais dois missionários para o campo no último mês.
    
    O trabalho social também continua forte. Foram distribuídas mais de 50 cestas básicas para famílias carentes da nossa comunidade. Isso é ser igreja: amar a Deus e amar ao próximo com atitudes concretas.
    
    Continue orando e contribuindo. A obra não pode parar!`,
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
    body: `A Conferência Radical foi um marco na vida dos nossos jovens. Foram três dias de muita adoração, palavra e quebrantamento. Vimos jovens se entregando a Jesus e sendo batizados no Espírito Santo.
    
    Mas não para por aí! Nossos cultos de sábado continuam a todo vapor. Se você tem entre 18 e 30 anos, venha fazer parte dessa galera que é apaixonada por Jesus.`,
  },
];

// Componentes de Página
const PageCover = ({ page }) => (
  <div className="page-cover" style={{ backgroundImage: `url(${page.image})` }}>
    <div className="cover-content">
      <span className="cover-badge">{page.edition}</span>
      <h1 className="cover-title">{page.title}</h1>
      <p className="cover-subtitle">{page.subtitle}</p>
    </div>
  </div>
);

const PageIndex = ({ page, onNavigate }) => (
  <div className="page-index p-12">
    <h2 className="index-title">{page.title}</h2>
    <div className="index-list">
      {page.items.map((item, idx) => (
        <div key={idx} className="index-item" onClick={() => onNavigate(item.page - 1)}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-lg text-primary">
              <item.icon size={24} color="var(--primary-color)" />
            </div>
            <span className="index-label">{item.label}</span>
          </div>
          <span className="index-page-num">pág. {item.page}</span>
        </div>
      ))}
    </div>
  </div>
);

const PageArticle = ({ page }) => (
  <div className="page-container">
    <div className="article-header">
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>
    {page.image && <img src={page.image} alt={page.title} className="article-image" />}
    <div className="article-body">
      {page.body.split('\n').map((paragraph, idx) => (
        <p key={idx}>
          {idx === 0 && <span className="drop-cap">{paragraph.charAt(0)}</span>}
          {idx === 0 ? paragraph.slice(1) : paragraph}
        </p>
      ))}
    </div>
  </div>
);

const PageColumnist = ({ page }) => (
  <div className="page-container">
    <div className="article-header">
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>
    
    <div className="layout-sidebar">
      <div className="author-sidebar">
        <img src={page.author.image} alt={page.author.name} className="author-image" />
        <div className="author-name">{page.author.name}</div>
        <div className="author-role">{page.author.role}</div>
        <p className="author-bio">{page.author.bio}</p>
      </div>
      
      <div className="article-body" style={{ columns: 1 }}>
        {page.body.split('\n').map((paragraph, idx) => {
          if (paragraph.includes('<quote>')) {
            const content = paragraph.replace('<quote>', '').replace('</quote>', '');
            return <div key={idx} className="quote-box">{content}</div>;
          }
          return (
            <p key={idx}>
              {idx === 0 && <span className="drop-cap">{paragraph.charAt(0)}</span>}
              {idx === 0 ? paragraph.slice(1) : paragraph}
            </p>
          );
        })}
      </div>
    </div>
  </div>
);

const PageDevotional = ({ page }) => (
  <div className="page-container">
    <div className="article-header text-center mb-12">
      <span className="article-category">{page.category}</span>
      <h2 className="article-title">{page.title}</h2>
    </div>
    
    <div className="layout-3col">
      {page.items.map((item, idx) => (
        <div key={idx} className="devotional-card">
          <div className="devotional-date">{item.date}</div>
          <h3 className="devotional-title">{item.title}</h3>
          <p className="devotional-text">{item.text}</p>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
            <Heart size={16} className="text-primary" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PageFeature = ({ page }) => (
  <div className="page-container h-full flex flex-col justify-center">
    <div className="grid md:grid-cols-2 gap-12 items-center h-full">
      {/* Left Column: Title & Header */}
      <div className="flex flex-col justify-center text-left">
        <span className="article-category mb-4 block">{page.category}</span>
        <h2 className="article-title" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', lineHeight: 0.9 }}>
          {page.title}
        </h2>
        {page.highlight && (
          <div className="mt-8 p-6 bg-[var(--primary-color)] text-black rounded-xl font-semibold text-lg shadow-lg border-l-4 border-white">
            {page.highlight}
          </div>
        )}
      </div>
      
      {/* Right Column: Events List */}
      <div className="flex flex-col gap-4 overflow-y-auto max-h-full pr-2 custom-scrollbar">
        {page.events.map((event, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[var(--primary-color)] transition-all group">
            <div className="flex flex-col items-center justify-center p-3 bg-black/30 border border-white/10 rounded-lg min-w-[70px] group-hover:border-[var(--primary-color)] transition-colors">
              <div className="text-xs uppercase text-[var(--primary-color)] font-bold">DEZ</div>
              <div className="text-2xl font-bold text-white">{event.date.split('/')[0]}</div>
            </div>
            
            <div className="flex-1">
              <div className="text-lg font-semibold text-white group-hover:text-[var(--primary-color)] transition-colors">
                {event.title}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                <Calendar size={14} />
                <span>{event.date}</span>
                <span className="mx-1">•</span>
                <span className="text-[var(--primary-color)]">{event.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function RevistaAdmac() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = magazineData.length;

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  const goToPage = (index) => setCurrentPage(index);

  return (
    <div className="revista-container">
      <div className="revista-wrapper">
        {/* Header da Revista */}
        <header className="revista-header">
          <div className="revista-brand">
            <div className="revista-logo">AD</div>
            <div className="revista-info">
              <h1>ADMAC NEWS</h1>
              <p>Revista Digital</p>
            </div>
          </div>
          
          <div className="revista-controls">
            <button onClick={prevPage} className="btn-nav" title="Anterior">
              <ArrowLeft size={18} />
            </button>
            <span className="flex items-center px-4 font-mono text-sm text-white/50">
              {currentPage + 1} / {totalPages}
            </span>
            <button onClick={nextPage} className="btn-nav" title="Próxima">
              <ArrowRight size={18} />
            </button>
          </div>
        </header>

        {/* Conteúdo da Página com Animação */}
        <div className="revista-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ height: '100%' }}
            >
              {magazineData[currentPage].type === "cover" && <PageCover page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "index" && <PageIndex page={magazineData[currentPage]} onNavigate={goToPage} />}
              {magazineData[currentPage].type === "article" && <PageArticle page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "columnist" && <PageColumnist page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "devotional" && <PageDevotional page={magazineData[currentPage]} />}
              {magazineData[currentPage].type === "feature" && <PageFeature page={magazineData[currentPage]} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer da Revista */}
        <footer className="revista-footer">
          <div>Igreja ADMAC • Vivendo o Sobrenatural</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
