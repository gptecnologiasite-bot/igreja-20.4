import React, { useState, useEffect } from 'react';

/**
 * ATUALIZAÇÃO - PAINEL ADMINISTRATIVO (ADMAC)
 * - Adicionado campo para configuração do Link do WhatsApp no Ministério de Intercessão.
 * - Corrigidos diversos erros de linting (blocos catch vazios, variáveis não utilizadas, etc) para permitir o deploy via GitHub Actions.
 * - Melhorada a lógica de sincronização offline e fallback de dados.
 */

import { supabase, testSupabaseConnection, hasSupabaseConfigured } from '../lib/supabase';
import { INITIAL_HOME_DATA, INITIAL_MINISTRIES_DATA, INITIAL_FOOTER_DATA, INITIAL_HEADER_DATA, INITIAL_PASTORS_CONTACTS } from '../lib/constants';
import { deepMerge, transformImageLink, parseSafeJson } from '../lib/dbUtils';
import { broadcastUpdate } from '../hooks/usePageUpdate';
import BellSettingsCard from './BellSettingsCard';
import { palette, globalCSS } from './theme';
import { handleFileUpload } from './fileUpload';
import HomeAnivEditor from './HomeAnivEditor';
import LogsPage from './LogsPage';
import RelatoriosPage from './RelatoriosPage';
import UsuariosPage from './UsuariosPage';
import MembrosPage from './MembrosPage';
import PaginasPage from './PaginasPage';
import DashboardPage from './DashboardPage';
import MensagensPage from './MensagensPage';
import WhatsappPage from './WhatsappPage';
import ConfiguracoesPage from './ConfiguracoesPage';
import ConfigsPage from './ConfigsPage';
import ConteudoPage from './ConteudoPage';

const MOCK_USERS = [];

const buildBars = (users = [], logs = []) => {
  // Garantir que as entradas sejam arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  // Dados base para garantir que o gráfico nunca fique vazio
  const baseData = [
    { label: 'Jan', h: 45 }, { label: 'Fev', h: 70 }, { label: 'Mar', h: 55 },
    { label: 'Abr', h: 90 }, { label: 'Mai', h: 65 }, { label: 'Jun', h: 85 },
    { label: 'Jul', h: 50 }, { label: 'Ago', h: 75 }, { label: 'Set', h: 60 },
    { label: 'Out', h: 95 }, { label: 'Nov', h: 80 }, { label: 'Dez', h: 70 }
  ];

  // Se não houver dados reais, retorna o mock com uma pequena variação para parecer "vivo"
  if (safeUsers.length === 0 && safeLogs.length === 0) {
    return baseData.map(b => ({ ...b, h: Math.min(100, Math.max(10, b.h + (Math.floor(Math.random() * 11) - 5))) }));
  }

  // Agrega usuários por mês se houver created_at ou since
  const countsByMonth = Array(12).fill(0);
  safeUsers.forEach(u => {
    if (!u) return;
    const dateStr = u.created_at || u.since;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        countsByMonth[d.getMonth()]++;
      }
    }
  });

  // Também agrega logs do mês atual
  const currentMonth = new Date().getMonth();
  countsByMonth[currentMonth] += Math.floor(safeLogs.length / 5); // Cada 5 logs contam como 1 ponto de atividade

  return baseData.map((b, idx) => {
    const count = countsByMonth[idx];
    let height = b.h;

    // Se tivermos dados reais para este mês (via usuários ou logs), usamos uma base + o proporcional
    if (count > 0) {
      height = Math.min(100, 30 + (count * 10));
    } else {
      // Se não houver dados, mantém o mock mas um pouco menor
      height = Math.max(15, b.h - 10);
    }

    return { ...b, h: height };
  });
};

// STATS transformados em função ou calculados dentro do componente
// funções utilitárias removidas para evitar avisos de variáveis não usadas

const NAV_ITEMS_DEFAULT = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'paginas', label: 'Páginas', icon: '📄' },
  { id: 'conteudo', label: 'Conteúdo', icon: '📝' },
  { id: 'mensagens', label: 'Mensagens', icon: '📩' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' }
];

const NAV_SETTINGS_DEFAULT = [
  { id: 'usuarios', label: 'Usuários', icon: '👤' },
  { id: 'logs', label: 'Histórico Logs', icon: '📜' },
  { id: 'configs', label: 'Configurações', icon: '⚙️' }
];

const CREDENTIALS = { email: 'admin@admin.com', password: 'admac2024' };

// --------- Helpers para edição amigável de páginas específicas ---------

const getBetween = (source, startMarker, endMarker, fallback = '') => {
  const start = source.indexOf(startMarker);
  if (start === -1) return fallback;
  const from = start + startMarker.length;
  const end = source.indexOf(endMarker, from);
  if (end === -1) return fallback;
  return source.slice(from, end).trim();
};

// Removed unused replaceBetween function

// Remove chaves e espaços extras de qualquer lado do texto capturado
const cleanField = (value) => value.replace(/[{}]/g, '').trim();

const parseContactPage = (content) => ({
  title: cleanField(getBetween(content, '/* CMS_CONTACT_TITLE_START */', '/* CMS_CONTACT_TITLE_END */', 'Entre em Contato')),
  subtitle: cleanField(getBetween(content, '/* CMS_CONTACT_SUBTITLE_START */', '/* CMS_CONTACT_SUBTITLE_END */', '')),
  address: cleanField(getBetween(content, '/* CMS_CONTACT_ADDRESS_START */', '/* CMS_CONTACT_ADDRESS_END */', '')),
  phone: cleanField(getBetween(content, '/* CMS_CONTACT_PHONE_START */', '/* CMS_CONTACT_PHONE_END */', '')),
  email: cleanField(getBetween(content, '/* CMS_CONTACT_EMAIL_START */', '/* CMS_CONTACT_EMAIL_END */', '')),
  schedule: cleanField(getBetween(content, '/* CMS_CONTACT_SCHEDULE_START */', '/* CMS_CONTACT_SCHEDULE_END */', '')),
});

// Removed unused applyContactPage function

export default function PainelAdm() {
  const hasSupabase = hasSupabaseConfigured;
  const [isLogged, setIsLogged] = useState(() => sessionStorage.getItem('painel_auth') === '1');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Status de Conexão com Supabase
  const [connStatus, setConnStatus] = useState({ state: 'testing', message: 'Iniciando...' });
  const [isTestingConn, setIsTestingConn] = useState(false);

  const checkConnection = async (manual = false) => {
    setIsTestingConn(true);
    if (manual) setConnStatus({ state: 'testing', message: 'Testando...' });
    
    const result = await testSupabaseConnection();
    
    setConnStatus({
      state: result.ok ? 'online' : 'offline',
      message: result.ok ? 'Online' : 'Desativado'
    });
    setIsTestingConn(false);
    
    if (manual) {
      const msgs = [
        `Ambiente (URL/Key): ${result.env ? '✅ OK' : '❌ FALHA'}`,
        `Banco de Dados: ${result.db ? '✅ OK' : '❌ FALHA'}`,
        `Storage (Imagens): ${result.storage ? '✅ OK' : '❌ FALHA'}`
      ];
      
      let hint = '';
      if (!result.db) hint = '\n\nDICA: Se o Banco falhou, verifique se a URL no .env está correta e se você executou o SQL de infraestrutura no Supabase.';
      if (!result.storage && result.db) hint = '\n\nDICA: Se apenas o Storage falhou, verifique se o bucket "site-images" foi criado no Supabase.';

      alert(`Status da Conexão:\n\n${msgs.join('\n')}${result.message ? `\n\nErro: ${result.message}` : ''}${hint}`);
    }
  };

  useEffect(() => {
    if (isLogged) checkConnection();
  }, [isLogged]);

  const [showPassword, setShowPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [activePage, setActivePage] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showModalPw, setShowModalPw] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Viewer', status: 'active', photo: null, location: '' });
  const [userMode, setUserMode] = useState('create');
  const [editingUserId, setEditingUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [pageMode, setPageMode] = useState('create'); // create | edit | contact
  const [pageName, setPageName] = useState('');
  const [pageData, setPageData] = useState({ title: '', description: '', photo: null });
  const [pageSaving, setPageSaving] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  const [visitorLiveCount, setVisitorLiveCount] = useState(0);
  const [visitorLocations, setVisitorLocations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [bars, setBars] = useState(() => buildBars([], []));

  const [navMain, setNavMain] = useState(NAV_ITEMS_DEFAULT);
  const [navSettings, setNavSettings] = useState(NAV_SETTINGS_DEFAULT);

  // Aplica classe ao body para os estilos do painel não vazarem para o site
  useEffect(() => {
    document.body.classList.add('painel-body');
    return () => document.body.classList.remove('painel-body');
  }, []);

  const [ministryId, setMinistryId] = useState('jovens');
  const [ministryData, setMinistryData] = useState(null);
  const [ministryLoading, setMinistryLoading] = useState(false);
  const [ministryTab, setMinistryTab] = useState('geral');
  const [homeData, setHomeData] = useState(null);
  const [homeVideos, setHomeVideos] = useState([]);
  const [homeTab, setHomeTab] = useState('bemvindo');

  // Função utilitária para remover thumbnails pesadas do JSON antes de salvar no Supabase
  const sanitizeVideos = (arr) => (arr || []).map((v) => {
    if (!v) return null;
    const rest = { ...v };
    if ('thumbnail' in rest) delete rest.thumbnail;
    return rest;
  }).filter(Boolean);

  useEffect(() => {
    // Atualiza o gráfico sempre que os usuários ou logs forem carregados
    setBars(buildBars(users, logs));
  }, [users, logs]);

  const [hasPagesNotif, setHasPagesNotif] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bem-vindo ao Painel', text: 'Você agora pode ler avisos e alertas aqui no sino.', time: '01m atrás', read: false }
  ]);
  const [siteMessages, setSiteMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [waNumber, setWaNumber] = useState('');
  const [waText, setWaText] = useState('Olá! Aqui é da ADMAC - Assembleia de Deus Ministério Atos e Conquistas. 🙏');
  const [showNotifBox, setShowNotifBox] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // Tenta a chave nova e depois a legado para evitar logout forçado
      const storedUser = localStorage.getItem('admac_current_user') || localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      loadUsers();
      loadPages();
      loadVisitorCount();
      loadSiteMessages();
      loadLogs();
    }
  }, [currentUser]);


  const loadLogs = async () => {
    if (!hasSupabase) {
      setLogs([]);
      return;
    }
    const { data: dbLogs } = await supabase
      .from('site_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setLogs(dbLogs || []);
  };
  const ministryOptions = [
    { id: 'home', label: 'Home' },
    { id: 'jovens', label: 'Jovens' },
    { id: 'mulheres', label: 'Mulheres' },
    { id: 'homens', label: 'Homens' },
    { id: 'louvor', label: 'Louvor' },
    { id: 'kids', label: 'Kids' },
    { id: 'ebd', label: 'EBD' },
    { id: 'lares', label: 'Lares' },
    { id: 'social', label: 'Ação Social' },
    { id: 'retiro', label: 'Retiro' },
    { id: 'intercessao', label: 'Intercessão' },
    { id: 'missoes', label: 'Missões' },
    { id: 'midia', label: 'Mídia' },
    { id: 'revista', label: 'Revista' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'contact', label: 'Contato' },
    { id: 'casais', label: 'Casais' },
    { id: 'pastors_contacts', label: 'Contatos Pastores' },
  ];
  const pageToMinistry = {
    'Home': 'home',
    'HomePage': 'home',
    'Min. Kids': 'kids',
    'Kids': 'kids',
    'Min. Louvor': 'louvor',
    'Louvor': 'louvor',
    'Min. Jovens': 'jovens',
    'Jovens': 'jovens',
    'Min. Mulheres': 'mulheres',
    'Mulheres': 'mulheres',
    'Min. Homens': 'homens',
    'Homens': 'homens',
    'Min. Lares': 'lares',
    'Lares': 'lares',
    'Ação Social': 'social',
    'Social': 'social',
    'EBD': 'ebd',
    'Retiros': 'retiro',
    'Retiro': 'retiro',
    'Intercessão': 'intercessao',
    'Missões': 'missoes',
    'Missoes': 'missoes',
    'Midia': 'midia',
    'Revista': 'revista',
    'Revista Admac': 'revista',
    'Sobre': 'sobre',
    'Casais': 'casais'
  };

  // Carrega configurações do menu do painel (se existirem)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admac_painel_nav');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.main) && parsed.main.length) {
        const mainFiltered = parsed.main.filter((i) => i.id !== 'eventos' && i.id !== 'servicos' && i.id !== 'membros' && i.id !== 'financeiro');
        setNavMain(mainFiltered);
        const membItem = parsed.main.find((i) => i.id === 'membros');
        if (membItem) {
          const currentSettings = Array.isArray(parsed.settings) ? parsed.settings : [];
          const exists = currentSettings.some((i) => i.id === 'membros');
          if (!exists) {
            setNavSettings([...(currentSettings.length ? currentSettings : NAV_SETTINGS_DEFAULT), membItem]);
            return;
          }
        }
      }
      if (Array.isArray(parsed.settings) && parsed.settings.length) {
        let settingsMerged = parsed.settings;
        if (!settingsMerged.some(i => i.id === 'membros')) {
          settingsMerged = [...settingsMerged, { id: 'membros', label: 'Membros', icon: '👥' }];
        }
        if (!settingsMerged.some(i => i.id === 'relatorios')) {
          settingsMerged = [...settingsMerged, { id: 'relatorios', label: 'Relatórios', icon: '📊' }];
        }
        setNavSettings(settingsMerged);
      }
    } catch {
      // se der erro, usa defaults
    }
  }, []);

  const saveNavConfig = async () => {
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem alterar as configurações do menu.');
      return;
    }
    try {
      const payload = { main: navMain, settings: navSettings };
      await supabase.from('site_settings').upsert({
        key: 'painel_nav',
        data: payload
      });
      alert('Configurações do menu salvas com sucesso!');
    } catch {
      alert('Erro ao salvar configurações do menu.');
    }
  };

  const loadUsers = async () => {
    try {
      if (!hasSupabase) {
        // Modo offline: usa o usuário logado do localStorage
        const stored = localStorage.getItem('admac_current_user');
        const cu = stored ? JSON.parse(stored) : null;
        setUsers(cu ? [cu] : []);
        return;
      }
      const { data: dbUsers, error } = await supabase
        .from('site_users')
        .select('*');

      if (error) {
        console.warn('[loadUsers] Erro ao buscar site_users:', error.message, '| código:', error.code);
        // Fallback: mostra o usuário logado mesmo se a tabela falhar
        const stored = localStorage.getItem('admac_current_user');
        const cu = stored ? JSON.parse(stored) : null;
        setUsers(cu ? [cu] : []);
        return;
      }

      // Mescla: adiciona o usuário logado se ele não estiver na lista (segurança)
      const stored = localStorage.getItem('admac_current_user');
      const cu = stored ? JSON.parse(stored) : null;
      let finalUsers = dbUsers || [];
      if (cu && cu.email && !finalUsers.some(u => u.email === cu.email)) {
        finalUsers = [cu, ...finalUsers];
      }

      setUsers(finalUsers.length > 0 ? finalUsers : (cu ? [cu] : []));
    } catch (err) {
      console.warn('[loadUsers] Exceção:', err.message);
      // Fallback de emergência
      const stored = localStorage.getItem('admac_current_user');
      const cu = stored ? JSON.parse(stored) : null;
      setUsers(cu ? [cu] : []);
    }
  };

  const loadVisitorLiveCount = async () => {
    try {
      if (!supabase) return;
      const since = new Date(Date.now() - 10 * 1000 * 60).toISOString(); // Últimos 10 min
      const { count, error } = await supabase
        .from('site_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'visitor_access')
        .gte('created_at', since);
      if (!error) setVisitorLiveCount(count || 0);
    } catch (err) {
      console.warn('[Admin] Erro ao carregar visitantes ao vivo:', err.message);
    }
  };

  const loadVisitorLocations = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('site_logs')
        .select('user_email')
        .eq('action', 'visitor_access')
        .order('created_at', { ascending: false })
        .limit(500);
      if (!data) { setVisitorLocations([]); return; }
      const map = {};
      data.forEach(l => {
        const loc = (l.user_email || '').trim() || 'Visitante Anônimo';
        map[loc] = (map[loc] || 0) + 1;
      });
      const arr = Object.entries(map)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      setVisitorLocations(arr);
    } catch (err) {
      console.warn('[Admin] Erro ao carregar localidades dos visitantes:', err.message);
    }
  };

  const loadVisitorCount = async () => {
    try {
      // Carrega o total fixo
      const { data } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', 'visitor_stats')
        .single();

      if (data && data.data && typeof data.data.value === 'number') {
        setVisitorCount(data.data.value);
      }
      
      // Carrega os acessos recentes (On-line)
      await loadVisitorLiveCount();
      await loadVisitorLocations();
    } catch (err) {
      console.warn('Error loading visitor count:', err);
    }
  };

  const loadSiteMessages = async () => {
    setMessagesLoading(true);
    try {
      const { data: msgs } = await supabase
        .from('site_messages')
        .select('*')
        .order('created_at', { ascending: false });
      setSiteMessages(msgs || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };



  useEffect(() => {
    if (activePage === 'mensagens' || activePage === 'whatsapp') {
      loadSiteMessages();
      
      // Realtime subscription para novas mensagens
      const channel = supabase
        .channel('public:site_messages')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_messages' },
          () => {
            loadSiteMessages();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activePage]);

  // Header and Footer Data for Configs Tab
  // (Sino de Avisos agora é gerenciado pelo componente isolado BellSettingsCard)
  const [headerData, setHeaderData] = useState(INITIAL_HEADER_DATA);
  const [footerData, setFooterData] = useState(INITIAL_FOOTER_DATA);

  useEffect(() => {
    const fetchHeaderFooter = async () => {
      try {
        const [headerRes, footerRes] = await Promise.all([
          supabase.from('site_settings').select('data').eq('key', 'header').single(),
          supabase.from('site_settings').select('data').eq('key', 'footer').single()
        ]);

        if (headerRes.data?.data) {
          const parsedHeader = typeof headerRes.data.data === 'string' ? JSON.parse(headerRes.data.data) : headerRes.data.data;
          setHeaderData(deepMerge(INITIAL_HEADER_DATA, parsedHeader));
        } else {
          try {
            const cached = localStorage.getItem('admac_site_settings:header');
            if (cached) {
              setHeaderData(deepMerge(INITIAL_HEADER_DATA, JSON.parse(cached)));
            } else {
              setHeaderData(INITIAL_HEADER_DATA);
            }
          } catch {
            setHeaderData(INITIAL_HEADER_DATA);
          }
        }

        if (footerRes.data?.data) {
          const parsedFooter = typeof footerRes.data.data === 'string' ? JSON.parse(footerRes.data.data) : footerRes.data.data;
          setFooterData(deepMerge(INITIAL_FOOTER_DATA, parsedFooter));
        } else {
          try {
            const cached = localStorage.getItem('admac_site_settings:footer');
            if (cached) {
              setFooterData(deepMerge(INITIAL_FOOTER_DATA, JSON.parse(cached)));
            } else {
              setFooterData(INITIAL_FOOTER_DATA);
            }
          } catch {
            setFooterData(INITIAL_FOOTER_DATA);
          }
        }
      } catch (err) {
        console.error('Error fetching header/footer:', err);
        setHeaderData(INITIAL_HEADER_DATA);
        setFooterData(INITIAL_FOOTER_DATA);
      }
    };
    fetchHeaderFooter();
  }, []);

  const openCreateUser = () => {
    setUserMode('create')
    setEditingUserId(null)
    setNewUser({ name: '', email: '', password: '', role: 'Viewer', status: 'active', photo: null, location: '' })
    setShowModal(true)
  }

  const openEditUser = (u) => {
    setUserMode('edit')
    setEditingUserId(u.id)
    setNewUser({ name: u.name, email: u.email, password: u.password || '', role: u.role, status: u.status, photo: u.photo || null, location: u.location || '' })
    setShowModal(true)
  }

  const openViewUser = (u) => {
    setUserMode('view')
    setEditingUserId(u.id)
    setNewUser({ name: u.name, email: u.email, password: u.password || '', role: u.role, status: u.status, photo: u.photo || null, location: u.location || '' })
    setShowModal(true)
  }

  const saveUser = async (e) => {
    e.preventDefault();
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem criar ou editar usuários.');
      return;
    }

    // Helpers de cache local
    const readCache = () => {
      try { return JSON.parse(localStorage.getItem('admac_users_cache') || '[]'); } catch { return []; }
    };
    const writeCache = (arr) => {
      try { localStorage.setItem('admac_users_cache', JSON.stringify(arr)); } catch { /* ignore */ }
    };

    try {
      if (userMode === 'create') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: newUser.email,
          password: newUser.password,
          options: {
            data: {
              full_name: newUser.name,
              role: newUser.role
            }
          }
        });
        if (signUpError) {
          if (signUpError.message.includes('rate limit')) {
            alert('🚫 Erro: Limite de e-mails do Supabase excedido.\n\nPara resolver isso e permitir cadastros ilimitados, você deve:\n1. Acessar o seu painel do Supabase.\n2. Ir em Authentication > Providers > Email.\n3. DESATIVAR a opção "Confirm Email".\n\nIsso permitirá que os usuários se cadastrem sem precisar confirmar o e-mail (que é o que está causando o bloqueio).');
            setLoginLoading(false);
            return;
          }
          throw signUpError;
        }

        const userId = authData?.user?.id || `local-${Date.now()}`;
        // No cadastro via tela de login (logo, sem usuário logado), forçamos o status pendente e perfil viewer
        const isPublicRegistration = !isLogged;
        
        const userRecord = {
          id: userId,
          name: newUser.name,
          email: newUser.email,
          role: isPublicRegistration ? 'Viewer' : newUser.role,
          status: isPublicRegistration ? 'pending' : (newUser.status || 'active'),
          location: newUser.location || '',
          photo: newUser.photo || null,
          created_at: new Date().toISOString()
        };

        // Tenta inserir no banco
        const { error: dbError } = await supabase.from('site_users').insert(userRecord);
        if (dbError) {
          console.warn('[saveUser] Erro ao inserir em site_users:', dbError.message, '| Salvando localmente...');
        }

        // Sempre salva no cache local (garante que aparece mesmo com RLS)
        const cache = readCache();
        const exists = cache.some(u => u.email === userRecord.email);
        if (!exists) writeCache([...cache, userRecord]);

        if (isPublicRegistration) {
          alert('Conta criada com sucesso! Aguarde a aprovação de um administrador para realizar o login e editar o conteúdo.');
        } else {
          alert('Usuário cadastrado com sucesso!');
        }
      } else {
        // Edit mode
        const userRecord = {
          id: editingUserId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status || 'active',
          location: newUser.location || '',
          photo: newUser.photo || null
        };

        const { error } = await supabase.from('site_users').upsert(userRecord);
        if (error) {
          console.warn('[saveUser] Erro ao atualizar site_users:', error.message, '| Salvando localmente...');
        }

        // Atualiza no cache local também
        const cache = readCache();
        const updated = cache.map(u => u.id === editingUserId || u.email === newUser.email ? { ...u, ...userRecord } : u);
        writeCache(updated);

        alert('Usuário atualizado com sucesso!');
      }
      setShowModal(false);
      await loadUsers();
    } catch (err) {
      alert(`Erro ao salvar usuário: ${err.message}`);
    }
  }

  const deleteUser = async (id) => {
    if (id === currentUser?.id || id === 'offline-admin' || id === 'aelda-admin' || id === 'humberto-admin') {
      alert('Você não pode excluir o seu próprio usuário ou contas administrativas mestres.');
      return;
    }

    if (currentUser?.role !== 'Administrador') {
      alert('Apenas administradores podem excluir usuários.');
      return;
    }

    const ok = window.confirm('Excluir este usuário?');
    if (!ok) return;

    try {
      const { error } = await supabase.from('site_users').delete().eq('id', id);
      if (error) throw error;

      await loadUsers();
      alert('Usuário excluído com sucesso!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(`Erro ao excluir usuário: ${err.message}`);
    }
  }

  const approveUser = async (user) => {
    if (currentUser?.role !== 'Administrador') {
      alert('Apenas administradores podem liberar usuários.');
      return;
    }

    const ok = window.confirm(`Deseja liberar o acesso para ${user.name}?`);
    if (!ok) return;

    try {
      // Liberando como Viewer por padrão, mas mantendo o cargo se já tiver sido editado
      const { error } = await supabase
        .from('site_users')
        .update({ status: 'active' })
        .eq('id', user.id);

      if (error) throw error;
      
      alert(`Usuário ${user.name} liberado com sucesso!`);
      await loadUsers();
    } catch (err) {
      console.error('Error approving user:', err);
      alert(`Erro ao liberar usuário: ${err.message}`);
    }
  }


  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [sidebarOpen]);

  useEffect(() => {
    loadVisitorCount();

    // Atualização automática dos contadores (mesmo intervalo do Header)
    const interval = setInterval(() => {
      loadVisitorCount();
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onStorage = (e) => { if (!e.key || e.key === 'admac_analytics') setBars(buildBars(users, logs)); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [users, logs]);

  useEffect(() => {
    const loadUser = () => {
      try {
        const u = localStorage.getItem('admac_current_user');
        setCurrentUser(u ? JSON.parse(u) : null);
      } catch { setCurrentUser(null) }
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  useEffect(() => {
    if (activePage === 'paginas') setHasPagesNotif(false);
  }, [activePage]);

  // Sincroniza o usuário atual com a lista de usuários para restaurar fotos ausentes
  useEffect(() => {
    if (currentUser && !currentUser.photo && users.length > 0) {
      const match = users.find(u => u.email === currentUser.email);
      if (match && match.photo) {
        const updated = { ...currentUser, photo: match.photo, name: match.name, role: match.role };
        localStorage.setItem('admac_current_user', JSON.stringify(updated));
        setCurrentUser(updated);
      }
    }
  }, [users, currentUser]);

  // Alerta de novos usuários pendentes no Sino
  useEffect(() => {
    const pending = (users || []).filter(u => u.status === 'pending');
    if (pending.length > 0 && currentUser?.role === 'Administrador') {
      const notifId = 'pending-users-alert';
      setNotifications(prev => {
        if (prev.some(n => n.id === notifId)) return prev;
        return [{
          id: notifId,
          title: '⚠️ Liberação Pendente',
          text: `Há ${pending.length} novo(s) usuário(s) aguardando sua liberação no painel.`,
          time: 'Agora',
          read: false
        }, ...prev];
      });
      setHasPagesNotif(true);
    }
  }, [users, currentUser]);
  const loadMinistry = async (id) => {
    try {
      setMinistryLoading(true);
      const key = id === 'home' ? 'home' : id === 'pastors_contacts' ? 'pastors_contacts' : `ministry_${id}`;

      const [settingRes, videoRes] = await Promise.all([
        supabase.from('site_settings').select('data').eq('key', key).single(),
        id === 'home' ? supabase.from('site_settings').select('data').eq('key', 'videos').single() : Promise.resolve({ data: null })
      ]);

      let rawData = settingRes.data?.data;
      let vids = videoRes.data?.data;

      // Fallback offline: se falhar no Supabase ou vier vazio, tenta localStorage
      if (!rawData || settingRes.error) {
        try {
          const local = localStorage.getItem(`admac_site_settings:${key}`);
          if (local) rawData = JSON.parse(local);
        } catch { /* ignore fallback error */ }
      }
      if (id === 'home' && (!vids || videoRes.error)) {
        try {
          const localVideos = localStorage.getItem('admac_site_settings:videos');
          if (localVideos) vids = JSON.parse(localVideos);
        } catch { /* ignore fallback error */ }
      }

      const defaultData = id === 'home' ? INITIAL_HOME_DATA : id === 'pastors_contacts' ? INITIAL_PASTORS_CONTACTS : INITIAL_MINISTRIES_DATA[id];
      const parsedRaw = parseSafeJson(rawData);
      
      // Fusão robusta: Garante que nunca seja null
      let data = defaultData;
      if (parsedRaw) {
        // Se for pastors_contacts (array) ou não houver defaultData, usa raw. Senão faz merge.
        data = (id === 'pastors_contacts' || !defaultData) ? parsedRaw : (typeof deepMerge === 'function' ? deepMerge(defaultData, parsedRaw) : { ...defaultData, ...parsedRaw });
      }

      // Fallback final: se data ainda for null/undefined (ex: erro no banco e sem default), garanta algo seguro
      if (!data) data = defaultData || {};
      
      vids = parseSafeJson(vids) || [];

      if (id === 'home') {
        const syncedData = { ...data, videos: vids || [] };
        setHomeData(syncedData);
        setMinistryData(syncedData);
        setHomeVideos(vids || []);
      } else {
        setMinistryData(data);
      }
    } catch (err) {
      console.error('Error loading content:', err);
      // Fallback supremo para não deixar a tela branca/vazia
      const fallback = id === 'home' ? INITIAL_HOME_DATA : INITIAL_MINISTRIES_DATA[id];
      setMinistryData(fallback);
      if (id === 'home') setHomeData(fallback);
    } finally {
      setMinistryLoading(false);
    }
  };

  useEffect(() => {
    if (activePage === 'conteudo') {
      loadMinistry(ministryId);
    }
  }, [activePage, ministryId]);

  const saveMinistry = async () => {
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem salvar alterações em ministérios.');
      return;
    }
    if (!ministryId || !ministryData) return;
    try {
      const key = ministryId === 'home' ? 'home' : ministryId === 'pastors_contacts' ? 'pastors_contacts' : `ministry_${ministryId}`;

      let sanitizedMinistryData;
      let cleanHomeVideos = null;
      if (Array.isArray(ministryData)) {
        sanitizedMinistryData = ministryData;
      } else {
        cleanHomeVideos = ministryId === 'home' ? sanitizeVideos(homeVideos) : null;
        const sanitizedVideos = cleanHomeVideos || sanitizeVideos(ministryData?.videos);
        sanitizedMinistryData = {
          ...ministryData,
          videos: sanitizedVideos
        };
      }

      // Log de tamanho para diagnóstico, mas permite salvar (fallback de texto)
      const stringified = JSON.stringify(sanitizedMinistryData);
      if (stringified.length > 800000) {
        console.warn("Conteúdo grande detectado (>800KB). Isso pode dificultar o salvamento em conexões lentas.");
      }

      if (ministryId === 'home') {
        const [r1, r2] = await Promise.all([
          supabase.from('site_settings').upsert({ key: 'home', data: sanitizedMinistryData }),
          supabase.from('site_settings').upsert({ key: 'videos', data: cleanHomeVideos })
        ]);

        const e1 = r1?.error, e2 = r2?.error;
        if (e1 || e2) {
          console.error('[Supabase Error] Home Save (home):', e1);
          console.error('[Supabase Error] Home Save (videos):', e2);
          
          let tip = '';
          if ((e1?.message || '').includes('payload too large') || (e2?.message || '').includes('payload too large')) {
            tip = '\n\nATENÇÃO: Suas imagens são muito grandes para o banco de dados. Tente usar fotos menores ou links externos.';
          }
          alert(`Erro ao salvar no banco. Salvando LOCALMENTE em seu navegador.${tip}`);
        }

        if (!hasSupabase || e1 || e2) {
          try {
            localStorage.setItem('admac_site_settings:home', JSON.stringify(sanitizedMinistryData));
            localStorage.setItem('admac_site_settings:videos', JSON.stringify(cleanHomeVideos));
          } catch (err) { console.warn('LocalStorage Save Error:', err); }
        }

        setHomeData(sanitizedMinistryData);
        setHomeVideos(cleanHomeVideos);

        // CORREÇÃO: Só recarrega do banco se o save deu certo. 
        // Se deu erro, mantém o estado atual (para não apagar o que o usuário digitou)
        if (!e1 && !e2 && hasSupabase) {
          const { data: reload } = await supabase.from('site_settings').select('data').eq('key', 'home').single();
          if (reload?.data) {
            const parsedReload = parseSafeJson(reload.data);
            setMinistryData(deepMerge(INITIAL_HOME_DATA, parsedReload));
          }
        }
        
        broadcastUpdate('home');
        broadcastUpdate('videos');

        if (!hasSupabase || e1 || e2) {
          let errorHint = '';
          const err = e1 || e2;
          if (err) {
            if (err.code === '42P01') errorHint = '\n\nDICA: A tabela "site_settings" não foi encontrada no banco. Execute o SQL de configuração.';
            else if (err.code === '42501') errorHint = '\n\nDICA: Permissão negada (RLS). Você precisa autorizar o acesso anon ou entrar com uma conta real.';
            else if (err.message?.includes('payload too large') || err.code === '413') errorHint = '\n\nDICA: Suas fotos são muito grandes. Tente usar imagens menores.';
            else errorHint = `\n\nDetalhe: ${err.message || 'Erro desconhecido'}`;
          }
          alert(`Configurações da Home salvas APENAS LOCALMENTE (Offline). O Supabase retornou um erro.${errorHint}`);
        } else {
          alert('Configurações da Home salvas com sucesso no banco de dados!');
        }
      } else {
        const { error } = await supabase.from('site_settings').upsert({ key, data: sanitizedMinistryData });

        if (error) {
          console.error(`[Supabase Error] ${key} Save:`, error);
          if (error.code === '42P01') console.error('ERRO: Tabela site_settings não encontrada no novo Supabase.');
          if (error.message?.includes('payload too large')) console.error('ERRO: Imagens base64 muito grandes para o Supabase.');
        }

        if (!hasSupabase || error) {
          try {
            localStorage.setItem(`admac_site_settings:ministry_${ministryId}`, JSON.stringify(sanitizedMinistryData));
          } catch (err) { console.warn('LocalStorage Save Error:', err); }
        }

        // CORREÇÃO: Só recarrega do banco se o save deu certo.
        if (!error && hasSupabase) {
          const { data: reload } = await supabase.from('site_settings').select('data').eq('key', key).single();
          if (reload?.data) {
            const defaultData = INITIAL_MINISTRIES_DATA[ministryId] || {};
            const parsedReload = parseSafeJson(reload.data);
            setMinistryData(deepMerge(defaultData, parsedReload));
          }
        }
        
        broadcastUpdate(key);

        if (!hasSupabase || error) {
          let errorHint = '';
          if (error) {
            if (error.code === '42P01') errorHint = '\n\nDICA: Tabela não encontrada. Execute o SQL de configuração.';
            else if (error.code === '42501') errorHint = '\n\nDICA: Permissão negada (RLS). Mude para uma conta real ou libere o acesso anônimo no SQL.';
            else errorHint = `\n\nDetalhe: ${error.message}`;
          }
          alert(`Ministério salvo APENAS LOCALMENTE (Offline). ${errorHint}`);
        } else {
          alert('Ministério salvo com sucesso no banco de dados!');
        }
      }
    } catch (err) {
      console.error('Error saving content:', err);
      const detail = err?.message || String(err);
      alert(`Erro grave ao salvar conteúdo.\n\nDetalhe: ${detail}\n\nVerifique o console para mais informações.`);
    }
  };

  // Gera o HTML completo de um relatório de acessos para ser aberto em nova aba ou impresso.
  // CORREÇÃO: variáveis renomeadas de `pages`/`people` para `pagesData`/`peopleData` para evitar
  // sombreamento (variable shadowing) com o estado `pages` declarado no componente.
  const buildAccessReportHTML = (days = 30) => {
    let pagesData = [];
    let peopleData = [];
    const period = new Date(Date.now() - days * 86400000).toLocaleDateString('pt-BR') + ' a ' + new Date().toLocaleDateString('pt-BR');
    const total = 0;
    const style = `
      body{font-family:Arial,Helvetica,sans-serif;color:#000;padding:20px}
      .hdr{border-bottom:2px solid #000;margin-bottom:10px}
      .title{font-weight:bold;font-size:16px;text-align:center;margin:6px 0}
      .meta{font-size:12px;display:flex;flex-wrap:wrap;gap:12px;margin-bottom:8px}
      .blk{border-top:1px solid #000;margin-top:14px;padding-top:8px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #000;padding:6px;text-align:left}
      th{background:#eee}
      .right{text-align:right}
    `;
    // Gera as linhas HTML da tabela de páginas e pessoas para o relatório
    const rowsPages = pagesData.map(p => `<tr><td>${p.path}</td><td class="right">${p.count}</td><td class="right">${p.sessions}</td><td class="right">${p.people}</td><td>${p.last ? new Date(p.last).toLocaleString('pt-BR') : ''}</td></tr>`).join('');
    const rowsPeople = peopleData.map(p => `<tr><td>${p.name}</td><td>${p.email || ''}</td><td class="right">${p.count}</td><td class="right">${p.sessions}</td><td class="right">${p.pagesCount}</td><td>${p.last ? new Date(p.last).toLocaleString('pt-BR') : ''}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><style>${style}</style><title>Relatório de Acessos</title></head><body>
      <div class="hdr">
        <div class="title">ADMAC — Relatório de Acessos</div>
      </div>
      <div class="meta">
        <div><strong>Período:</strong> ${period}</div>
        <div><strong>Total de visitas:</strong> ${total}</div>
      </div>
      <div class="blk">
        <div class="title" style="text-align:left">Páginas</div>
        <table>
          <thead><tr><th>Página</th><th>Visitas</th><th>Sessões</th><th>Pessoas</th><th>Último acesso</th></tr></thead>
          <tbody>${rowsPages || '<tr><td colspan="5">Sem dados</td></tr>'}</tbody>
        </table>
      </div>
      <div class="blk">
        <div class="title" style="text-align:left">Pessoas</div>
        <table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Visitas</th><th>Sessões</th><th>Páginas únicas</th><th>Último acesso</th></tr></thead>
          <tbody>${rowsPeople || '<tr><td colspan="6">Sem dados</td></tr>'}</tbody>
        </table>
      </div>
    </body></html>`;
  };

  const openConfigEditHome = async () => {
    setPageMode('home');
    setPageName('Home');
    try {
      const [{ data: dbHome }, { data: dbVideos }] = await Promise.all([
        supabase.from('site_settings').select('data').eq('key', 'home').single(),
        supabase.from('site_settings').select('data').eq('key', 'videos').single()
      ]);

      let rawHd = parseSafeJson(dbHome?.data);
      let rawVideos = parseSafeJson(dbVideos?.data);

      // Fallback localStorage quando Supabase estiver indisponível
      if (!rawHd) {
        try {
          const raw = localStorage.getItem('admac_site_settings:home');
          if (raw) rawHd = JSON.parse(raw);
        } catch { /* ignore */ }
      }
      if (!rawVideos) {
        try {
          const raw = localStorage.getItem('admac_site_settings:videos');
          if (raw) rawVideos = JSON.parse(raw);
        } catch { /* ignore */ }
      }

      const hd = rawHd ? deepMerge(INITIAL_HOME_DATA, rawHd) : INITIAL_HOME_DATA;
      const videos = Array.isArray(rawVideos) ? rawVideos : [];
      
      // Sincroniza os conteúdos para evitar discrepância no editor
      const syncedHome = { ...hd, videos };

      setHomeData(syncedHome);
      setMinistryData(syncedHome);
      setHomeVideos(videos);
    } catch (err) {
      console.error('Error opening home config:', err);
      setHomeData(INITIAL_HOME_DATA);
      setMinistryData(INITIAL_HOME_DATA);
      setHomeVideos([]);
    }
    setHomeTab('bemvindo');
    setPageModalOpen(true);
  };

  const openConfigEditMinistry = async (id) => {
    if (!id) return;
    if (id === 'home') return openConfigEditHome();
    setPageMode('ministry');
    setPageName(id);
    setMinistryId(id);
    setMinistryTab('geral');
    await loadMinistry(id);
    setPageModalOpen(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const email = (loginData.email || '').trim().toLowerCase();
    const password = (loginData.password || '').trim();

    try {
      // Prioridade 1: Bypass para contas administrativas padrão (offline ou primeiro acesso)
      // ATENÇÃO: senhas padrão devem ser trocadas. Prefira contas reais via Supabase Auth.
      if ((email === 'admin@admin.com' && password === 'admac2024') || 
          (email === 'aelda@800' && password === '9hGzhdrEXwFtcbxp') ||
          (email === 'sansunghumberto13@gmail.com' && password === 'nFnUmqpmTwQ8KmxN')) {
        
        let masterId = 'offline-admin';
        let masterName = 'Admin (Master)';
        
        if (email === 'aelda@800') {
          masterId = 'aelda-admin';
          masterName = 'Aelda ADMAC';
        } else if (email === 'sansunghumberto13@gmail.com') {
          masterId = 'humberto-admin';
          masterName = 'Humberto (Master)';
        }

        const user = { 
          id: masterId, 
          name: masterName, 
          email: email, 
          role: 'Administrador', 
          status: 'active', 
          photo: null 
        };
        sessionStorage.setItem('painel_auth', '1');
        localStorage.setItem('admac_current_user', JSON.stringify(user));
        setCurrentUser(user);
        setIsLogged(true);
        console.info(`[Login] Acesso via conta mestre (${email}) autorizado.`);
        return;
      }

      // Prioridade 2: Autenticação real via Supabase
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          setLoginError(`Erro de Autenticação: ${error.message}${error.message?.includes('Invalid') ? '. Tente as credenciais padrão se não possuir uma conta.' : ''}`);
          return;
        }

          if (data?.user) {
            // Busca dados completos em site_users (foto, role, status, name personalizado)
            let siteUserData = null;
            try {
              const { data: siteUser } = await supabase
                .from('site_users')
                .select('*')
                .eq('id', data.user.id)
                .single();
              siteUserData = siteUser;
            } catch (e) {
              console.warn('[Login] Não foi possível buscar site_users:', e.message);
            }

            const user = {
              id: data.user.id,
              name: siteUserData?.name || data.user.user_metadata?.full_name || data.user.email.split('@')[0],
              email: data.user.email,
              role: siteUserData?.role || data.user.user_metadata?.role || 'Viewer',
              status: siteUserData?.status || 'active',
              photo: siteUserData?.photo || data.user.user_metadata?.avatar_url || null,
              location: siteUserData?.location || ''
            };

            // VERIFICAÇÃO DE STATUS: Bloqueia acesso se não estiver ativo
            if (user.status !== 'active') {
              setLoginError('Sua conta ainda não foi liberada pelo administrador. Por favor, aguarde a aprovação.');
              setLoginLoading(false);
              return;
            }

            sessionStorage.setItem('painel_auth', '1');
            localStorage.setItem('admac_current_user', JSON.stringify(user));
            setCurrentUser(user);
            setIsLogged(true);

            // Log de acesso (silencioso se falhar)
            try {
              await supabase.from('site_logs').insert({
                action: 'LOGIN_SISTEMA',
                user_email: user.email,
                details: 'Autenticado via Supabase Auth'
              });
            } catch (e) {
              console.warn('[Log] Falha ao registrar log de login:', e.message);
            }
          }
        } catch (authErr) {
          // Captura erros de rede como "Failed to fetch"
          console.error('[Auth Exception]', authErr);
          if (loginData.email === 'admin@admin.com' && loginData.password === 'admac2024') {
            const user = { id: 'offline-admin', name: 'Admin', email: 'admin@admin.com', role: 'Administrador', status: 'active', photo: null };
            sessionStorage.setItem('painel_auth', '1');
            localStorage.setItem('admac_current_user', JSON.stringify(user));
            setCurrentUser(user);
            setIsLogged(true);
          } else {
            setLoginError('Erro de conexão com o servidor. Verifique sua internet ou tente o acesso padrão.');
          }
      }
    } catch (err) {
      console.error('Erro ao autenticar no painel:', err);
      setLoginError('Erro inesperado no login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const userEmail = currentUser?.email || 'admin@admin.com';
    sessionStorage.removeItem('painel_auth');
    localStorage.removeItem('admac_current_user');
    setCurrentUser(null);
    setIsLogged(false);
    setLoginData({ email: '', password: '' });
    setActivePage('dashboard');
    try {
      await supabase.from('site_logs').insert({
        action: 'LOGOUT_SISTEMA',
        user_email: userEmail,
        details: 'Sessão encerrada pelo usuário'
      });
    } catch {
      console.error('Error logging logout');
    }
  };

  const loadPages = async () => {
    try {
      setPagesLoading(true)

      let pageFiles = [];

      // Tenta buscar a lista real de arquivos via API do Vite (disponível em dev)
      try {
        const resp = await fetch('/api/pages');
        const data = await resp.json();
        if (data && data.items) {
          pageFiles = data.items.map(it => ({ name: it.name, file: it.file }));
        }
      } catch {
        console.warn('Vite API not available, falling back to static list');
      }

      // Fallback para lista estática se a API falhar ou não retornar itens
      if (!pageFiles.length) {
        pageFiles = [
          { name: 'Home', file: 'Home.jsx' },
          { name: 'Kids', file: 'Kids.jsx' },
          { name: 'Louvor', file: 'Louvor.jsx' },
          { name: 'Jovens', file: 'JovensPage.jsx' },
          { name: 'Mulheres', file: 'Mulheres.jsx' },
          { name: 'Homens', file: 'Homens.jsx' },
          { name: 'Lares', file: 'Lares.jsx' },
          { name: 'Retiro', file: 'Retiro.jsx' },
          { name: 'Social', file: 'Social.jsx' },
          { name: 'EBD', file: 'EBD.jsx' },
          { name: 'Midia', file: 'Midia.jsx' },
          { name: 'Sobre', file: 'Sobre.jsx' },
          { name: 'Contact', file: 'Contact.jsx' },
          { name: 'Missões', file: 'Missoes.jsx' },
          { name: 'Revista Admac', file: 'RevistaAdmac.jsx' },
          { name: 'Intercessão', file: 'Intercessao.jsx' },
          { name: 'Casais', file: 'casais.jsx' }
        ];
      }

      const { data: dbSettings } = await supabase
        .from('site_settings')
        .select('key, data');

      const items = pageFiles.map(pf => {
        const id = pageToMinistry[pf.name] || pf.name.toLowerCase();
        const key = id === 'home' ? 'home' : `ministry_${id}`;
        let settings = parseSafeJson(dbSettings?.find(s => s.key === key)?.data);

        // Fallback offline: se não achou no Supabase, tenta no localStorage
        if (!settings) {
          try {
            const local = localStorage.getItem(`admac_site_settings:${key}`);
            if (local) settings = JSON.parse(local);
          } catch { /* ignore */ }
        }

        // Verifica se 'active' existe no JSON do banco ou local.
        const isActive = settings?.active !== false;

        const defaultPhoto = id === 'home'
          ? INITIAL_HOME_DATA?.carousel?.[0]?.image || null
          : INITIAL_MINISTRIES_DATA[id]?.hero?.image || null;

        return {
          ...pf,
          active: isActive,
          photo: settings?.hero?.image || settings?.welcome?.image || defaultPhoto || null
        };
      });

      setPages(items);
    } catch (err) {
      console.error('Error loading pages:', err);
    } finally {
      setPagesLoading(false)
    }
  }

  const openCreatePage = () => {
    setPageMode('create')
    setPageName('')
    setPageData({ title: '', description: '', photo: null })
    setPageModalOpen(true)
  }

  const openEditPage = async (name) => {
    try {
      const id = pageToMinistry[name] || name.toLowerCase();
      const key = id === 'home' ? 'home' : `ministry_${id}`;

      if (name === 'Home') {
        setPageMode('home');
        setPageName(name);

        const { data: dbHome } = await supabase.from('site_settings').select('data').eq('key', 'home').single();
        const { data: dbVideos } = await supabase.from('site_settings').select('data').eq('key', 'videos').single();

        const rawHd = parseSafeJson(dbHome?.data);
        const hd = rawHd ? deepMerge(INITIAL_HOME_DATA, rawHd) : INITIAL_HOME_DATA;
        const rawVideos = parseSafeJson(dbVideos?.data);
        const videosArr = Array.isArray(rawVideos) ? rawVideos : [];
        const syncedHomeData = { ...hd, videos: videosArr };

        setHomeData(syncedHomeData);
        setMinistryData(syncedHomeData);
        setHomeVideos(videosArr);
        setHomeTab('bemvindo');
        setPageModalOpen(true);
        return;
      }

      if (pageToMinistry[name]) {
        setPageMode('ministry');
        setPageName(name);
        setMinistryId(id);
        setMinistryTab('geral');
        await loadMinistry(id);
        setPageModalOpen(true);
        return;
      }

      // Generic page or specialized like 'Contact'
      const { data: dbPage } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', key)
        .single();

      const raw = dbPage?.data ? (typeof dbPage.data === 'string' ? dbPage.data : JSON.stringify(dbPage.data, null, 2)) : '';


      if (name.toLowerCase() === 'contact') {
        let parsed = {};
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = parseContactPage(raw);
        }
        setPageMode('contact');
        setPageName(name);
        setPageData({
          title: parsed.title || 'Entre em Contato',
          description: parsed.subtitle || parsed.description || '',
          address: parsed.address || '',
          phone: parsed.phone || '',
          email: parsed.email || '',
          schedule: parsed.schedule || '',
        });
        setPageModalOpen(true);
        return;
      }

      setPageMode('edit');
      setPageName(name);
      let pageDataObj = { title: name, description: '', photo: null };
      try {
        const parsed = JSON.parse(raw);
        if (parsed.title) pageDataObj = parsed;
      } catch {
        pageDataObj.description = raw;
      }
      setPageData(pageDataObj);
      setPageModalOpen(true);
    } catch (err) {
      console.error('Error opening page editor:', err);
    }
  }

  const handlePagePhoto = () => {
    handleFileUpload(url => {
      setPageData(d => ({ ...d, photo: url }));
    }, hasSupabase, supabase);
  };

  const savePage = async () => {
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem salvar alterações nas páginas.');
      return;
    }
    try {
      setPageSaving(true);
      if (!pageName.trim()) return;

      // Proteção contra payload excessivo (base64)
      // Log payload size for observability but don't block
      const totalPayload = JSON.stringify({ pageData, homeData, ministryData });
      if (totalPayload.length > 800000) {
        console.warn("⚠️ Payload grande detectado:", (totalPayload.length / 1024).toFixed(2), "KB");
      }

      const id = pageToMinistry[pageName] || pageName.toLowerCase();
      const key = id === 'home' ? 'home' : `ministry_${id}`;

      if (pageMode === 'home') {
        const cleanVideos = sanitizeVideos(homeVideos);
        const cleanHome = { 
          ...(homeData || {}), 
          videos: cleanVideos,
          // Ensure carousel is preserved if it exists in ministryData but missing in homeData due to state drift
          carousel: homeData?.carousel || ministryData?.carousel || [] 
        };

        const [r1, r2] = await Promise.all([
          supabase.from('site_settings').upsert({ key: 'home', data: cleanHome }),
          supabase.from('site_settings').upsert({ key: 'videos', data: cleanVideos })
        ]);

        // Persistência local quando Supabase estiver offline/erro
        const e1 = r1?.error, e2 = r2?.error;
        if (!hasSupabase || e1 || e2) {
          try {
            localStorage.setItem('admac_site_settings:home', JSON.stringify(cleanHome));
            localStorage.setItem('admac_site_settings:videos', JSON.stringify(homeVideos || []));
          } catch { /* ignore */ }
        }

        setHomeData(cleanHome);
        setMinistryData(cleanHome);
        broadcastUpdate('home');
        broadcastUpdate('videos');
        try {
          localStorage.setItem('home', String(Date.now()));
          localStorage.setItem('videos', String(Date.now()));
        } catch { /* ignore */ }
        setHasPagesNotif(true);
        setPageModalOpen(false);
        await loadPages();
        if (!hasSupabase || e1 || e2) {
          alert('Página Home salva em modo offline (navegador). Configure o Supabase para sincronizar.');
        } else {
          alert('Página Home salva com sucesso!');
        }
        return;
      }

      if (pageMode === 'ministry') {
        const sanitized = {
          ...ministryData,
          videos: sanitizeVideos(ministryData?.videos)
        };
        const { error } = await supabase.from('site_settings').upsert({
          key: `ministry_${ministryId}`,
          data: sanitized || {}
        });
        if (error) console.error(`[Supabase Error] Ministry ${ministryId} Save:`, error);
        
        if (!hasSupabase || error) {
          try {
            localStorage.setItem(`admac_site_settings:ministry_${ministryId}`, JSON.stringify(sanitized || {}));
          } catch { /* ignore */ }
        }
        broadcastUpdate(`ministry_${ministryId}`);
        setHasPagesNotif(true);
        setPageModalOpen(false);
        await loadPages();
        if (!hasSupabase || error) {
          let hint = '';
          if (error?.code === '42P01') hint = '\n\nDICA: Tabela site_settings n\u00e3o encontrada. Execute o SQL de configura\u00e7\u00e3o.';
          else if (error?.code === '42501') hint = '\n\nDICA: Permiss\u00e3o negada (RLS). Libere acesso an\u00f4nimo ou fa\u00e7a login com uma conta real.';
          else if (error?.message?.includes('payload too large')) hint = '\n\nDICA: Suas imagens s\u00e3o muito grandes. Tente usar fotos menores ou links externos.';
          else if (error) hint = `\n\nDetalhe: ${error.message}`;
          alert(`Minist\u00e9rio salvo LOCALMENTE (modo offline).${hint}`);
        } else {
          alert('Minist\u00e9rio salvo com sucesso no banco de dados!');
        }
        return;
      }

      let content;
      if (pageMode === 'contact') {
        const fields = {
          title: pageData.title || '',
          subtitle: pageData.description || '',
          address: pageData.address || '',
          phone: pageData.phone || '',
          whatsapp: pageData.whatsapp || '',
          email: pageData.email || '',
          schedule: pageData.schedule || '',
        };
        content = fields;

        // SYNC: Update Footer as well
        const updatedFooter = {
          ...footerData,
          contact: {
            ...footerData.contact,
            address: fields.address,
            phone: fields.phone,
            email: fields.email,
            cultos: fields.schedule
          },
          social: {
            ...footerData.social,
            whatsapp: fields.whatsapp
          }
        };

        // Save both in parallel
        const [rPage, rFooter] = await Promise.all([
          supabase.from('site_settings').upsert({ key: key, data: content }),
          supabase.from('site_settings').upsert({ key: 'footer', data: updatedFooter })
        ]);

        const ePage = rPage?.error;
        const eFooter = rFooter?.error;

        if (!hasSupabase || ePage || eFooter) {
          try {
            localStorage.setItem(`admac_site_settings:${key}`, JSON.stringify(content));
            localStorage.setItem('admac_site_settings:footer', JSON.stringify(updatedFooter));
          } catch { /* ignore */ }
          if (hasSupabase && (ePage || eFooter)) console.error('[Supabase Error] Contact/Footer:', ePage || eFooter);
          setFooterData(updatedFooter);
          broadcastUpdate(key);
          broadcastUpdate('footer');
          alert('Página de Contato salva LOCALMENTE (Offline).');
        } else {
          setFooterData(updatedFooter);
          broadcastUpdate(key);
          broadcastUpdate('footer');
          alert('Página de Contato e Rodapé atualizados com sucesso!');
        }
      } else {
        const { error } = await supabase.from('site_settings').upsert({
          key: key,
          data: pageData
        });

        if (!hasSupabase || error) {
          try {
            localStorage.setItem(`admac_site_settings:${key}`, JSON.stringify(pageData));
          } catch { /* ignore */ }
          if (hasSupabase && error) console.error(`[Supabase Error] ${key} Save:`, error);
          alert('Página salva LOCALMENTE (Offline).');
        } else {
          alert('Página salva com sucesso no banco de dados!');
        }
      }

      broadcastUpdate(key);
      setHasPagesNotif(true);
      setPageModalOpen(false);
      await loadPages();
    } catch (err) {
      console.error('Error saving page:', err);
      const msg = err?.message || String(err);
      alert(`Erro ao salvar a página.\n\nDetalhe: ${msg}`);
    } finally {
      setPageSaving(false);
    }
  }

  const togglePageStatus = async (name, currentStatus) => {
    try {
      const id = pageToMinistry[name] || name.toLowerCase();
      const key = id === 'home' ? 'home' : `ministry_${id}`;

      // Busca dados atuais para não sobrescrever o resto do objeto JSON
      let currentData = null;
      try {
        const { data: dbData } = await supabase.from('site_settings').select('data').eq('key', key).single();
        if (dbData?.data) {
          currentData = typeof dbData.data === 'string' ? JSON.parse(dbData.data) : dbData.data;
        }
      } catch (dbErr) {
        console.warn('Erro ao buscar dados do banco para toggle:', dbErr);
      }

      // Fallback para cache local se não encontrou no banco
      if (!currentData) {
        try {
          const local = localStorage.getItem(`admac_site_settings:${key}`);
          if (local) {
            currentData = typeof local === 'string' ? JSON.parse(local) : local;
          }
        } catch { /* ignore fallback error */ }
      }

      // Se mesmo assim for vazio, inicializa
      if (!currentData) {
        currentData = {};
      }

      const nextData = { ...currentData, active: !currentStatus };

      // Atualiza no banco
      const { error } = await supabase.from('site_settings').upsert({ key, data: nextData });

      if (!hasSupabase || error) {
        try {
          localStorage.setItem(`admac_site_settings:${key}`, JSON.stringify(nextData));
        } catch { /* ignore */ }
      }

      if (error && hasSupabase) {
        console.warn('[Supabase Error] Falha ao atualizar status no banco:', error);
      }

      // Atualiza estado local imediatamente para feedback visual instantâneo
      setPages(prev => prev.map(p => p.name === name ? { ...p, active: !currentStatus } : p));

      broadcastUpdate(key);
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Erro ao alterar status da página. Verifique sua conexão.');
    }
  }

  const deletePage = async (name) => {
    if (currentUser?.role === 'Viewer') {
      alert('Seu perfil de Visualizador não permite excluir conteúdos.');
      return;
    }

    const isProtected = ['Login', 'Dashboard', 'PainelAdm', 'PainelApp'].some(p => p.toLowerCase() === name.toLowerCase());
    if (isProtected) {
      alert('Esta é uma página protegida do sistema. Você não pode excluí-la.');
      return;
    }

    if (!window.confirm(`Deseja realmente excluir os dados da página "${name}"? \n\nO conteúdo voltará ao padrão original do sistema.`)) return;
    try {
      const id = pageToMinistry[name] || name.toLowerCase();
      const key = id === 'home' ? 'home' : `ministry_${id}`;

      const { error } = await supabase.from('site_settings').delete().eq('key', key);

      // Também remove do cache local para garantir sincronia em modo offline
      try {
        localStorage.removeItem(`admac_site_settings:${key}`);
      } catch { /* ignore */ }

      if (error && hasSupabase) throw error;

      alert('Conteúdo da página restaurado para o padrão do sistema!');
      broadcastUpdate(key);
      await loadPages();
    } catch (err) {
      console.error('Error deleting page:', err);
      alert('Erro ao excluir os dados da página. Verifique sua conexão.');
    }
  };

  useEffect(() => {
    if (activePage === 'paginas') loadPages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage])

  if (!isLogged) {
    return (
      <>
        <style>{globalCSS}</style>
        <div className="painel-login-wrap">
          <div className="painel-login-card">
            <div className="painel-login-logo">
              <div className="painel-login-logo-icon">
                {headerData?.logo?.icon ? (
                  headerData.logo.icon.includes('http') || headerData.logo.icon.includes('data:image') ? (
                    <img src={headerData.logo.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '1.4rem' }}>{headerData.logo.icon}</span>
                  )
                ) : '⛪'}
              </div>
              <span>{headerData?.logo?.text || 'ADMAC'} — Painel</span>
            </div>
            <h2>Bem-vindo</h2>
            <p>Faça login para acessar o painel administrativo.</p>
            {loginError && <div className="painel-login-error">⚠ {loginError}</div>}
            <form onSubmit={handleLogin} autoComplete="off">
              <div className="painel-field">
                <label>E-mail</label>
                <div className="painel-field-wrap">
                  <span>✉</span>
                  <input className="painel-input" type="email" placeholder="admin@admin.com" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
                </div>
              </div>
              <div className="painel-field">
                <label>Senha</label>
                <div className="painel-field-wrap">
                  <span>🔒</span>
                  <input className="painel-input" type={showPassword ? 'text' : 'password'} placeholder="••••••" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} style={{ paddingRight: '2.6rem' }} required />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#7c82a0', padding: '2px', lineHeight: 1 }} title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button className="painel-btn-primary" type="submit" disabled={loginLoading}>{loginLoading ? 'Entrando...' : 'Entrar no Painel →'}</button>
            </form>
            <button
              className="painel-btn-primary"
              type="button"
              onClick={openCreateUser}
              style={{
                marginTop: '0.8rem',
                background: 'transparent',
                border: `2px solid ${palette.accent}`,
                color: palette.accent,
                cursor: 'pointer',
                width: '100%',
                transition: 'background .2s, color .2s'
              }}
            >
              📝 Cadastrar
            </button>
          </div>

          {/* Modal de cadastro também disponível na tela de login */}
          {showModal && (
            <div className="pm-backdrop" onClick={() => setShowModal(false)}>
              <div className="pm-modal" onClick={e => e.stopPropagation()}>
                <div className="pm-header">
                  <h3>{userMode === 'create' ? 'Novo Usuário' : userMode === 'edit' ? 'Editar Usuário' : 'Usuário'}</h3>
                  <button className="pm-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <form onSubmit={saveUser}>
                  <div className="pm-body">
                    <div className="pm-photo-wrap">
                      <div className="pm-photo-preview">
                        {newUser.photo ? <img src={newUser.photo} alt="preview" /> : '👤'}
                      </div>
                      <label 
                        className="pm-photo-btn" 
                        onClick={() => handleFileUpload(url => setNewUser(u => ({ ...u, photo: url })), hasSupabase, supabase)}
                      >
                        Selecionar Foto
                      </label>
                    </div>
                    <div className="pm-row">
                      <div className="pm-field">
                        <label>Nome</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">👤</span>
                          <input className="pm-input" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>E-mail</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">✉</span>
                          <input className="pm-input" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                        </div>
                      </div>
                    </div>
                    {/* Apenas administradores podem gerenciar perfis e status */}
                    {(isLogged && currentUser?.role === 'Administrador') && (
                      <div className="pm-row">
                        <div className="pm-field">
                          <label>Perfil</label>
                          <select className="pm-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                            <option value="Viewer">Viewer</option>
                            <option value="Editor">Editor</option>
                            <option value="Administrador">Administrador</option>
                          </select>
                        </div>
                        <div className="pm-field">
                          <label>Status</label>
                          <select className="pm-select" value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })}>
                            <option value="active">Ativo</option>
                            <option value="pending">Pendente</option>
                            <option value="inactive">Inativo</option>
                            <option value="danger">Risco</option>
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="pm-field">
                      <label>Localização (Cidade/Estado)</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">📍</span>
                        <input className="pm-input" placeholder="Ex: Goiânia / GO" value={newUser.location} onChange={e => setNewUser({ ...newUser, location: e.target.value })} />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Senha</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🔒</span>
                        <input
                          className="pm-input"
                          type={showModalPw ? 'text' : 'password'}
                          value={newUser.password}
                          onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pm-footer">
                    <button type="button" className="pm-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="pm-btn-save">Salvar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  const filteredUsers = (users || []).filter(u => {
    if (!u) return false;
    const q = search.toLowerCase();
    const matchSearch =
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.location && u.location.toLowerCase().includes(q));
    const matchFilter = filter === 'all' || u.status === filter;
    return matchSearch && matchFilter;
  });

  const topLocLabels = (visitorLocations || []).slice(0, 3).map(l => (l.location || '').split(',')[0].trim()).filter(Boolean).join(', ');

  const dynamicStats = [
    { label: 'Membros', value: (users || []).length.toString(), change: '+0%', dir: 'up', icon: '👥', color: '#6c63ff', bg: 'rgba(108,99,255,0.12)', sub: 'Localizados' },
    { label: 'Visitantes agora', value: ((visitorCount || 0) + (visitorLiveCount || 0)).toString(), change: topLocLabels || 'Aguardando acessos', dir: 'up', icon: '🏃', color: '#22d3a5', bg: 'rgba(34,211,165,0.12)', sub: 'Localidade' },
    { label: 'Publicações', value: (pages || []).length.toString(), change: `+${(pages || []).length}`, dir: 'up', icon: '📄', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', sub: 'Ativas' }
  ];

  const renderPage = () => {
    const pendingUsers = (users || []).filter(u => u.status === 'pending');
    if (activePage === 'dashboard') {
      return <DashboardPage dynamicStats={dynamicStats} pendingUsers={pendingUsers} currentUser={currentUser} approveUser={approveUser} setActivePage={setActivePage} visitorLocations={visitorLocations} pages={pages} openEditPage={openEditPage} deletePage={deletePage} bars={bars} />;
    }

    if (activePage === 'mensagens') {
      return <MensagensPage loadSiteMessages={loadSiteMessages} messagesLoading={messagesLoading} siteMessages={siteMessages} currentUser={currentUser} />;
    }

    if (activePage === 'whatsapp') {
      return <WhatsappPage siteMessages={siteMessages} waNumber={waNumber} setWaNumber={setWaNumber} waText={waText} setWaText={setWaText} loadSiteMessages={loadSiteMessages} messagesLoading={messagesLoading} />;
    }

    if (activePage === 'conteudo') {
      return <ConteudoPage ministryId={ministryId} setMinistryId={setMinistryId} ministryTab={ministryTab} setMinistryTab={setMinistryTab} ministryOptions={ministryOptions} ministryData={ministryData} setMinistryData={setMinistryData} setHomeData={setHomeData} ministryLoading={ministryLoading} saveMinistry={saveMinistry} homeVideos={homeVideos} setHomeVideos={setHomeVideos} currentUser={currentUser} />;
    }
    if (activePage === 'membros') {
      return <MembrosPage filteredUsers={filteredUsers} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} openCreateUser={openCreateUser} openViewUser={openViewUser} approveUser={approveUser} openEditUser={openEditUser} deleteUser={deleteUser} currentUser={currentUser} />;
    }
    if (activePage === 'paginas') {
      return <PaginasPage pagesLoading={pagesLoading} pages={pages} openCreatePage={openCreatePage} openEditPage={openEditPage} togglePageStatus={togglePageStatus} deletePage={deletePage} currentUser={currentUser} />;
    }
    if (activePage === 'relatorios') {
      return <RelatoriosPage buildAccessReportHTML={buildAccessReportHTML} />;
    }
    if (activePage === 'conteudo' || activePage === 'configuracoes') {
      return <ConfiguracoesPage activePage={activePage} saveNavConfig={saveNavConfig} navMain={navMain} setNavMain={setNavMain} navSettings={navSettings} setNavSettings={setNavSettings} openConfigEditHome={openConfigEditHome} ministryId={ministryId} setMinistryId={setMinistryId} setMinistryTab={setMinistryTab} ministryOptions={ministryOptions} openConfigEditMinistry={openConfigEditMinistry} />;
    }
    if (activePage === 'logs') {
      return <LogsPage logs={logs} />;
    }
    if (activePage === 'usuarios') {
      return <UsuariosPage filteredUsers={filteredUsers} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} openCreateUser={openCreateUser} openViewUser={openViewUser} approveUser={approveUser} openEditUser={openEditUser} deleteUser={deleteUser} currentUser={currentUser} />;
    }
    if (activePage === 'configs') {
      return <ConfigsPage headerData={headerData} setHeaderData={setHeaderData} footerData={footerData} setFooterData={setFooterData} />;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: '1rem', color: palette.textMuted }}>
        <div style={{ fontSize: '3rem', opacity: .4 }}>🧭</div>
        <h2 style={{ fontSize: '1.1rem', color: palette.text, fontWeight: 600 }}>Em breve</h2>
        <p style={{ fontSize: '.85rem', textAlign: 'center', maxWidth: 280 }}>Conteúdo para {([...NAV_ITEMS_DEFAULT, ...NAV_SETTINGS_DEFAULT].find(i => i.id === activePage)?.label || 'Página')}.</p>
      </div>
    );
  };

  const currentLabel = ([...NAV_ITEMS_DEFAULT, ...NAV_SETTINGS_DEFAULT].find(i => i.id === activePage)?.label) || 'Dashboard';

  return (
    <>
      <style>{globalCSS}</style>
      <div className="painel-layout">
        <aside className={`painel-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="painel-sidebar-logo">
            <div className="painel-sidebar-logo-icon" style={headerData?.logo?.icon?.includes('http') || headerData?.logo?.icon?.includes('data:image') ? { background: 'transparent' } : {}}>
              {headerData?.logo?.icon && typeof headerData.logo.icon === 'string' && (headerData.logo.icon.includes('data:image') || headerData.logo.icon.includes('http')) ? (
                <img src={headerData.logo.icon.trim()} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                headerData?.logo?.icon || '⛪'
              )}
            </div>
            <span>{headerData?.logo?.text || 'ADMAC'} Painel</span>
          </div>
          <div className="painel-sidebar-section">
            <div className="painel-sidebar-section-label">Menu</div>
            {NAV_ITEMS_DEFAULT.map(item => (
              <div key={item.id} className={`painel-nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="painel-sidebar-section">
            <div className="painel-sidebar-section-label">Administração</div>
            {NAV_SETTINGS_DEFAULT.map(item => (
              <div key={item.id} className={`painel-nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="conn-status-wrap">
            <div className="conn-badge" title={connStatus.message}>
              <div className={`conn-status-dot ${connStatus.state}`}></div>
              <span>Supabase {connStatus.state === 'online' ? 'Online' : connStatus.state === 'testing' ? 'Testando...' : 'Desativado'}</span>
            </div>
            <button 
              className="conn-test-btn" 
              onClick={() => checkConnection(true)}
              disabled={isTestingConn}
            >
              {isTestingConn ? 'Testando...' : 'Testar Conexão'}
            </button>
          </div>
          <div className="painel-sidebar-footer">
            <button className="painel-logout-btn" onClick={handleLogout}>
              <span>⏻</span> Sair
            </button>
          </div>
        </aside>

        <div className={`painel-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

        <header className={`painel-topbar ${sidebarOpen ? '' : 'full'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
            <button className="painel-hamburger" onClick={() => setSidebarOpen(v => !v)}>☰</button>
            <div className="painel-breadcrumb">Você está em <strong>{currentLabel}</strong></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', position: 'relative' }}>
            <div
              title={connStatus.state === 'online' ? 'Conectado ao Supabase' : 'Modo offline (navegador)'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 8,
                border: `1px solid ${palette.border}`,
                background: connStatus.state === 'online' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                color: connStatus.state === 'online' ? '#22c55e' : '#f59e0b',
                fontSize: '.8rem',
                fontWeight: 600
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: connStatus.state === 'online' ? '#22c55e' : '#f59e0b'
              }} />
              <span>{connStatus.state === 'online' ? 'Supabase' : 'Offline'}</span>
            </div>
            <button
              className="painel-badge-btn"
              title="Testar conexão"
              onClick={() => checkConnection(true)}
              disabled={isTestingConn}
            >
              {isTestingConn ? '⌛' : '✅'}
            </button>
            <button
              className="painel-badge-btn"
              title={hasPagesNotif ? 'Há novas notificações' : 'Sem novas notificações'}
              onClick={() => {
                setShowNotifBox(!showNotifBox);
                setHasPagesNotif(false);
              }}
            >
              🔔
              {hasPagesNotif && <span className="painel-badge" />}
            </button>

            {showNotifBox && (
              <div
                className="painel-card"
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: 320,
                  zIndex: 1000,
                  padding: 0,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: `1px solid ${palette.border}`,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${palette.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: palette.bgSidebar }}>
                  <span style={{ fontWeight: 600, fontSize: '.9rem' }}>Notificações</span>
                  <button
                    style={{ background: 'none', border: 'none', color: palette.accentLight, fontSize: '.75rem', cursor: 'pointer' }}
                    onClick={() => setNotifications([])}
                  >
                    Limpar tudo
                  </button>
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: palette.textMuted, fontSize: '.85rem' }}>
                      Nenhuma notificação por enquanto.
                    </div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${palette.border}`,
                        cursor: 'pointer',
                        background: n.read ? 'transparent' : 'rgba(108, 99, 255, 0.05)',
                        transition: 'background .2s'
                      }}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        setSelectedNotif(n);
                        setShowNotifBox(false);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '.85rem', color: palette.accentLight }}>{n.title}</span>
                        <span style={{ fontSize: '.7rem', color: palette.textMuted }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '.8rem', color: palette.text, margin: 0, lineHeight: 1.4 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="painel-avatar">
              {currentUser?.photo ? (
                <img src={currentUser.photo} alt={currentUser.name || 'Usuário'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                (currentUser?.name || 'AD').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
              )}
            </div>
          </div>
        </header>

        <main className={`painel-main ${sidebarOpen ? '' : 'full'}`}>
          <div className="painel-page-header">
            <h1>{currentLabel}</h1>
            <p>Gerencie os recursos administrativos.</p>
          </div>
          {renderPage()}
        </main>
      </div>

      {showModal && (
        <div className="pm-backdrop" onClick={() => setShowModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-header">
              <h3>{userMode === 'create' ? 'Novo Usuário' : userMode === 'edit' ? 'Editar Usuário' : 'Usuário'}</h3>
              <button className="pm-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={saveUser}>
              <div className="pm-body">
                <div className="pm-photo-wrap">
                  <div className="pm-photo-preview">
                    {newUser.photo ? <img src={newUser.photo} alt="preview" /> : '👤'}
                  </div>
                  <label 
                    className="pm-photo-btn" 
                    style={{ pointerEvents: userMode === 'view' ? 'none' : 'auto', opacity: userMode === 'view' ? .6 : 1 }}
                    onClick={() => handleFileUpload(url => setNewUser(u => ({ ...u, photo: url })), hasSupabase, supabase)}
                  >
                    Selecionar Foto
                  </label>
                </div>
                <div className="pm-row">
                  <div className="pm-field">
                    <label>Nome</label>
                    <div className="pm-field-wrap">
                      <span className="pm-icon">👤</span>
                      <input className="pm-input" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required disabled={userMode === 'view'} />
                    </div>
                  </div>
                  <div className="pm-field">
                    <label>E-mail</label>
                    <div className="pm-field-wrap">
                      <span className="pm-icon">✉</span>
                      <input className="pm-input" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required disabled={userMode === 'view'} />
                    </div>
                  </div>
                </div>
                <div className="pm-row">
                  <div className="pm-field">
                    <label>Perfil</label>
                    <select className="pm-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} disabled={userMode === 'view'}>
                      <option value="Viewer">Viewer</option>
                      <option value="Editor">Editor</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                  <div className="pm-field">
                    <label>Status</label>
                    <select className="pm-select" value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })} disabled={userMode === 'view'}>
                      <option value="active">Ativo</option>
                      <option value="pending">Pendente</option>
                      <option value="inactive">Inativo</option>
                      <option value="danger">Risco</option>
                    </select>
                  </div>
                </div>
                <div className="pm-field">
                  <label>Localização (Cidade, Estado ou País)</label>
                  <div className="pm-field-wrap">
                    <span className="pm-icon">📍</span>
                    <input className="pm-input" placeholder="Ex: Goiânia / GO ou Brasil" value={newUser.location} onChange={e => setNewUser({ ...newUser, location: e.target.value })} disabled={userMode === 'view'} />
                  </div>
                </div>
                <div className="pm-field">
                  <label>Senha</label>
                  <div className="pm-field-wrap">
                    <span className="pm-icon">🔒</span>
                    <input className="pm-input" type={showModalPw ? 'text' : 'password'} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required disabled={userMode === 'view'} />
                    <button type="button" className="pm-toggle-pw" onClick={() => setShowModalPw(v => !v)} title={showModalPw ? 'Ocultar senha' : 'Mostrar senha'} disabled={userMode === 'view'}>
                      {showModalPw ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="pm-footer">
                <button type="button" className="pm-btn-cancel" onClick={() => setShowModal(false)}>{userMode === 'view' ? 'Fechar' : 'Cancelar'}</button>
                {userMode !== 'view' && <button type="submit" className="pm-btn-save">Salvar</button>}
              </div>
            </form>
          </div>
        </div>
      )}

      {pageModalOpen && (
        <div className="pm-backdrop" onClick={() => setPageModalOpen(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-header">
              <h3>{pageMode === 'create' ? 'Nova Página' : `Editar ${pageName}`}</h3>
              <button className="pm-close" onClick={() => setPageModalOpen(false)}>✕</button>
            </div>
            <div className="pm-body">
              {pageMode === 'contact' ? (
                <>
                  <div className="pm-field">
                    <label>Título da Página</label>
                    <div className="pm-field-wrap">
                      <span className="pm-icon">✏️</span>
                      <input
                        className="pm-input"
                        placeholder="Ex: Entre em Contato"
                        value={pageData.title}
                        onChange={e => setPageData(d => ({ ...d, title: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="pm-field">
                    <label>Subtítulo</label>
                    <textarea
                      value={pageData.description || ''}
                      onChange={e => setPageData(d => ({ ...d, description: e.target.value }))}
                      placeholder="Texto logo abaixo do título"
                      style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                    />
                  </div>

                  <div className="pm-field">
                    <label>Endereço</label>
                    <textarea
                      value={pageData.address || ''}
                      onChange={e => setPageData(d => ({ ...d, address: e.target.value }))}
                      placeholder="Endereço exibido na página"
                      style={{ width: '100%', height: 70, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                    />
                  </div>

                  <div className="pm-row">
                    <div className="pm-field">
                      <label>Telefone</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">📞</span>
                        <input
                          className="pm-input"
                          value={pageData.phone || ''}
                          onChange={e => setPageData(d => ({ ...d, phone: e.target.value }))}
                          placeholder="(61) 99999-9999"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Email</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">✉</span>
                        <input
                          className="pm-input"
                          type="email"
                          value={pageData.email || ''}
                          onChange={e => setPageData(d => ({ ...d, email: e.target.value }))}
                          placeholder="contato@igreja.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pm-field">
                    <label>Link Direto do WhatsApp (Ex: https://wa.me/...)</label>
                    <div className="pm-field-wrap">
                      <span className="pm-icon">💬</span>
                      <input
                        className="pm-input"
                        value={pageData.whatsapp || ''}
                        onChange={e => setPageData(d => ({ ...d, whatsapp: e.target.value }))}
                        placeholder="https://wa.me/5561993241084"
                      />
                    </div>
                  </div>

                  <div className="pm-field">
                    <label>Horário dos Cultos</label>
                    <textarea
                      value={pageData.schedule || ''}
                      onChange={e => setPageData(d => ({ ...d, schedule: e.target.value }))}
                      placeholder="Ex: Domingo: 18h | Quinta: 19h30"
                      style={{ width: '100%', height: 70, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                    />
                  </div>
                </>
              ) : pageMode === 'home' ? (
                <>
                  <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.8rem', flexWrap: 'wrap' }}>
                    {['bemvindo', 'sliders', 'programacao', 'atividades'].map(t => (
                      <button
                        key={t}
                        onClick={() => setHomeTab(t)}
                        className="painel-action-btn"
                        style={{
                          borderColor: homeTab === t ? palette.accent : palette.border,
                          color: homeTab === t ? palette.accentLight : palette.textMuted,
                          background: homeTab === t ? palette.accentGlow : 'transparent'
                        }}
                      >
                        {t === 'bemvindo' ? 'Boas‑vindas' : t === 'sliders' ? 'Sliders (Fotos)' : t === 'programacao' ? 'Programação' : 'Atividades'}
                      </button>
                    ))}
                  </div>
                  {homeTab === 'bemvindo' && (
                    <div>
                      <div className="pm-field">
                        <label>Título de Boas‑vindas</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">✏️</span>
                          <input
                            className="pm-input"
                            value={homeData?.welcome?.title || ''}
                            onChange={e => setHomeData(d => ({ ...d, welcome: { ...d.welcome, title: e.target.value } }))}
                          />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Texto 1</label>
                        <textarea
                          value={homeData?.welcome?.text1 || ''}
                          onChange={e => setHomeData(d => ({ ...d, welcome: { ...d.welcome, text1: e.target.value } }))}
                          style={{ width: '100%', height: 100, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                        />
                      </div>
                      <div className="pm-field">
                        <label>Texto 2</label>
                        <textarea
                          value={homeData?.welcome?.text2 || ''}
                          onChange={e => setHomeData(d => ({ ...d, welcome: { ...d.welcome, text2: e.target.value } }))}
                          style={{ width: '100%', height: 100, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                        />
                      </div>
                      
                      <div className="pm-field" style={{ marginTop: '1.5rem', borderTop: `1px solid ${palette.border}`, paddingTop: '1.5rem' }}>
                        <label>Vídeo Recomendado (URL do YouTube)</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">▶</span>
                          <input
                            className="pm-input"
                            placeholder="Ex: https://www.youtube.com/watch?v=HsNdzvG5SkM"
                            value={homeData?.extraVideoUrl || ''}
                            onChange={e => setHomeData(d => ({ ...d, extraVideoUrl: e.target.value }))}
                          />
                        </div>
                        <small style={{ color: palette.textMuted, fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                          O link aparecerá logo abaixo da seção central do site como vídeo integrado. Deixe em branco caso queira usar o padrão.
                        </small>
                      </div>

                      <div className="pm-field" style={{ marginTop: '1rem' }}>
                        <label>Link do App Bíblia (Google Play / App Store)</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">📱</span>
                          <input
                            className="pm-input"
                            placeholder="Ex: https://play.google.com/..."
                            value={homeData?.appsBibliaLink || ''}
                            onChange={e => setHomeData(d => ({ ...d, appsBibliaLink: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="pm-field" style={{ marginTop: '1rem' }}>
                        <label>Link do App Harpa Cristã (Google Play / App Store)</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">📱</span>
                          <input
                            className="pm-input"
                            placeholder="Ex: https://play.google.com/..."
                            value={homeData?.appsHarpaLink || ''}
                            onChange={e => setHomeData(d => ({ ...d, appsHarpaLink: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="pm-field" style={{ marginTop: '1rem' }}>
                        <label>Imagem do App (Aparecerá ao lado dos links)</label>
                        <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <span className="pm-icon">🖼</span>
                            <input
                              className="pm-input"
                              placeholder="URL da imagem ou faça o upload"
                              value={homeData?.appsImage || ''}
                              onChange={e => setHomeData(d => ({ ...d, appsImage: e.target.value }))}
                            />
                          </div>
                          <button
                            type="button"
                            className="pm-photo-btn"
                            style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                            onClick={() => handleFileUpload(url => {
                              setHomeData(d => ({ ...d, appsImage: url }));
                            }, hasSupabase, supabase)}
                          >
                            Subir Foto
                          </button>
                        </div>
                        {homeData?.appsImage && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <img src={transformImageLink(homeData.appsImage)} alt="Preview" style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {homeTab === 'sliders' && (
                    <div style={{ padding: '0.2rem' }}>
                      {(homeData?.carousel || []).map((s, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Imagem (URL)</label>
                            <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <span className="pm-icon">🖼</span>
                                <input
                                  className="pm-input"
                                  value={s.image || ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    const next = [...(homeData.carousel || [])];
                                    next[idx] = { ...next[idx], image: val };
                                    setHomeData(d => ({ ...d, carousel: next }));
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                className="pm-photo-btn"
                                style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                                onClick={() => handleFileUpload(url => {
                                  const next = [...(homeData.carousel || [])];
                                  next[idx] = { ...next[idx], image: url };
                                  setHomeData(d => ({ ...d, carousel: next }));
                                }, hasSupabase, supabase)}
                              >
                                Subir Foto
                              </button>
                            </div>
                          </div>
                          {s.image ? <div style={{ marginBottom: '.5rem', gridColumn: '1 / -1' }}><img src={transformImageLink(s.image)} alt="" style={{ width: 120, height: 72, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /></div> : null}
                          <div className="pm-field">
                            <label>Título</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">✏️</span>
                              <input
                                className="pm-input"
                                value={s.title || ''}
                                onChange={e => {
                                  const next = [...(homeData.carousel || [])];
                                  next[idx] = { ...next[idx], title: e.target.value };
                                  setHomeData(d => ({ ...d, carousel: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Subtítulo</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">📝</span>
                              <input
                                className="pm-input"
                                value={s.subtitle || ''}
                                onChange={e => {
                                  const next = [...(homeData.carousel || [])];
                                  next[idx] = { ...next[idx], subtitle: e.target.value };
                                  setHomeData(d => ({ ...d, carousel: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button
                              className="btn-deletar"
                              onClick={() => {
                                const next = [...(homeData.carousel || [])];
                                next.splice(idx, 1);
                                setHomeData(d => ({ ...d, carousel: next }));
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="pm-add-btn"
                        onClick={() => setHomeData(d => ({ ...d, carousel: [...(d.carousel || []), { image: '', title: '', subtitle: '' }] }))}
                      >
                        + Adicionar Slider (Foto)
                      </button>
                    </div>
                  )}
                  {homeTab === 'programacao' && (
                    <div>
                      {(homeData?.schedule || []).map((s, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Dia</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">🗓</span>
                              <input
                                className="pm-input"
                                value={s.day || ''}
                                onChange={e => {
                                  const next = [...(homeData.schedule || [])];
                                  next[idx] = { ...next[idx], day: e.target.value };
                                  setHomeData(d => ({ ...d, schedule: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Hora</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">⏰</span>
                              <input
                                className="pm-input"
                                value={s.time || ''}
                                onChange={e => {
                                  const next = [...(homeData.schedule || [])];
                                  next[idx] = { ...next[idx], time: e.target.value };
                                  setHomeData(d => ({ ...d, schedule: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Evento</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">📌</span>
                              <input
                                className="pm-input"
                                value={s.event || ''}
                                onChange={e => {
                                  const next = [...(homeData.schedule || [])];
                                  next[idx] = { ...next[idx], event: e.target.value };
                                  setHomeData(d => ({ ...d, schedule: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button
                              className="btn-deletar"
                              onClick={() => {
                                const next = [...(homeData.schedule || [])];
                                next.splice(idx, 1);
                                setHomeData(d => ({ ...d, schedule: next }));
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="pm-add-btn"
                        onClick={() => setHomeData(d => ({ ...d, schedule: [...(d.schedule || []), { day: '', time: '', event: '' }] }))}
                      >
                        + Adicionar Item
                      </button>
                    </div>
                  )}
                  {homeTab === 'atividades' && (
                    <div>
                      {(homeData?.activities || []).map((a, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Título</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">✏️</span>
                              <input
                                className="pm-input"
                                value={a.title || ''}
                                onChange={e => {
                                  const next = [...(homeData.activities || [])];
                                  next[idx] = { ...next[idx], title: e.target.value };
                                  setHomeData(d => ({ ...d, activities: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Data</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">🗓</span>
                              <input
                                className="pm-input"
                                value={a.date || ''}
                                onChange={e => {
                                  const next = [...(homeData.activities || [])];
                                  next[idx] = { ...next[idx], date: e.target.value };
                                  setHomeData(d => ({ ...d, activities: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Descrição</label>
                            <textarea
                              value={a.description || ''}
                              onChange={e => {
                                const next = [...(homeData.activities || [])];
                                next[idx] = { ...next[idx], description: e.target.value };
                                setHomeData(d => ({ ...d, activities: next }));
                              }}
                              style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                            />
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Imagem (URL)</label>
                            <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <span className="pm-icon">🖼</span>
                                <input
                                  className="pm-input"
                                  value={a.image || ''}
                                  onChange={e => {
                                    const next = [...(homeData.activities || [])];
                                    next[idx] = { ...next[idx], image: e.target.value };
                                    setHomeData(d => ({ ...d, activities: next }));
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                className="pm-photo-btn"
                                style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                                onClick={() => handleFileUpload(url => {
                                  const next = [...(homeData.activities || [])];
                                  next[idx] = { ...next[idx], image: url };
                                  setHomeData(d => ({ ...d, activities: next }));
                                }, hasSupabase, supabase)}
                              >
                                Subir Foto
                              </button>
                            </div>
                          </div>
                          {a.image ? <div style={{ marginBottom: '.5rem', gridColumn: '1 / -1' }}><img src={transformImageLink(a.image)} alt="" style={{ width: 120, height: 72, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /></div> : null}
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button
                              className="btn-deletar"
                              onClick={() => {
                                const next = [...(homeData.activities || [])];
                                next.splice(idx, 1);
                                setHomeData(d => ({ ...d, activities: next }));
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="pm-add-btn"
                        onClick={() => setHomeData(d => ({ ...d, activities: [...(d.activities || []), { title: '', date: '', description: '', image: '' }] }))}
                      >
                        + Adicionar Atividade
                      </button>
                    </div>
                  )}
                </>
              ) : pageMode === 'ministry' ? (
                <>
                  <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.8rem', flexWrap: 'wrap' }}>
                    {(() => {
                      let tabs = ['geral', 'equipe', 'programacao', 'galeria', 'aniversariantes'];
                      if (ministryId === 'missoes') tabs = ['geral', 'videos', 'estatisticas', 'missionarios', 'projetos', 'equipe', 'galeria'];
                      if (ministryId === 'revista') tabs = ['geral', 'paginas'];
                      return tabs.map(t => {
                        // Define which tabs are available for each ministry
                        const isGalleryAllowed = ['jovens', 'mulheres', 'homens', 'louvor', 'kids', 'ebd', 'lares', 'social', 'retiro', 'intercessao', 'missoes', 'midia', 'casais'].includes(ministryId);
                        const isBirthdaysAllowed = ['jovens', 'mulheres', 'homens', 'louvor', 'kids', 'ebd', 'lares', 'social', 'retiro', 'intercessao', 'missoes', 'midia', 'casais', 'revista'].includes(ministryId);
                        
                        if (t === 'galeria' && !isGalleryAllowed) return null;
                        if (t === 'aniversariantes' && !isBirthdaysAllowed) return null;
                        
                        return (
                          <button
                            key={t}
                            onClick={() => setMinistryTab(t)}
                            className="painel-action-btn"
                            style={{
                              borderColor: ministryTab === t ? palette.accent : palette.border,
                              color: ministryTab === t ? palette.accentLight : palette.textMuted,
                              background: ministryTab === t ? palette.accentGlow : 'transparent'
                            }}
                          >
                            {t === 'geral' ? 'Geral' : t === 'equipe' ? 'Equipe' : t === 'programacao' ? 'Programação' : t === 'galeria' ? 'Galeria' : t === 'aniversariantes' ? 'Aniversariantes' : t === 'paginas' ? 'Páginas' : t === 'estatisticas' ? 'Estatísticas' : t === 'missionarios' ? 'Missionários' : t === 'projetos' ? 'Projetos' : t === 'videos' ? 'Vídeos' : ''}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  {ministryTab === 'geral' && (
                    <div>
                      <div className="pm-field">
                        <label>Título Principal</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">✏️</span>
                          <input className="pm-input" value={ministryData?.hero?.title || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, title: e.target.value } }))} />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Subtítulo</label>
                        <textarea value={ministryData?.hero?.subtitle || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, subtitle: e.target.value } }))} style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                      </div>
                      <div className="pm-field">
                        <label>Versículo</label>
                        <textarea value={ministryData?.hero?.verse || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, verse: e.target.value } }))} style={{ width: '100%', height: 70, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                      </div>
                      <div className="pm-field">
                        <label>URL de Vídeo - Conheça o Trabalho</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">▶</span>
                          <input className="pm-input" value={ministryData?.hero?.videoUrl || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, videoUrl: e.target.value } }))} />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Link de Testemunho (Opcional)</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">🔗</span>
                          <input className="pm-input" value={ministryData?.hero?.testimonyUrl || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, testimonyUrl: e.target.value } }))} placeholder="Link para formulário ou página de depoimentos" />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Imagem de Fundo</label>
                        <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <span className="pm-icon">🖼</span>
                            <input className="pm-input" value={ministryData?.hero?.image || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, image: e.target.value } }))} />
                          </div>
                          <button
                            type="button"
                            className="pm-photo-btn"
                            style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                            onClick={() => handleFileUpload(url => {
                              setMinistryData(d => ({ ...d, hero: { ...d.hero, image: url } }));
                            }, hasSupabase, supabase)}
                          >
                            Subir Foto
                          </button>
                        </div>
                        {ministryData?.hero?.image && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <img src={transformImageLink(ministryData.hero.image)} alt="Preview Hero" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${palette.border}` }} />
                          </div>
                        )}
                      </div>
                      <div className="pm-field">
                        <label>Título da Seção</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">📌</span>
                          <input className="pm-input" value={ministryData?.mission?.title || ''} onChange={e => setMinistryData(d => ({ ...d, mission: { ...d.mission, title: e.target.value } }))} />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Texto Descritivo</label>
                        <textarea value={ministryData?.mission?.text || ''} onChange={e => setMinistryData(d => ({ ...d, mission: { ...d.mission, text: e.target.value } }))} style={{ width: '100%', height: 140, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                      </div>
                    </div>
                  )}
                  {ministryTab === 'videos' && (
                    <div style={{ padding: '1.2rem' }}>
                      <div className="pm-field">
                        <label>URL do Vídeo - Conheça o Trabalho</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">▶</span>
                          <input
                            className="pm-input"
                            value={ministryData?.hero?.videoUrl || ''}
                            onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, videoUrl: e.target.value } }))}
                          />
                        </div>
                        {(ministryData?.hero?.videoUrl) && (
                          <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${palette.border}`, background: palette.bg }}>
                            <iframe
                              width="100%"
                              height="180"
                              src={ministryData.hero.videoUrl.includes('embed') ? ministryData.hero.videoUrl : `https://www.youtube.com/embed/${ministryData.hero.videoUrl.split('v=')[1]?.split('&')[0] || ministryData.hero.videoUrl.split('/').pop()}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {ministryTab === 'estatisticas' && (
                    <div style={{ padding: '1.2rem' }}>
                      {(ministryData?.stats || []).map((s, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '1rem', background: palette.surfaceHover, padding: '1rem', borderRadius: '10px' }}>
                          <div className="pm-field">
                            <label>Ícone (Lucide)</label>
                            <select 
                              className="pm-input" 
                              value={s.icon || 'Globe'} 
                              onChange={e => {
                                const next = [...ministryData.stats];
                                next[idx].icon = e.target.value;
                                setMinistryData(d => ({ ...d, stats: next }));
                              }}
                              style={{ background: palette.bg, color: palette.text }}
                            >
                              <option value="Globe">Globo</option>
                              <option value="Users">Pessoas</option>
                              <option value="Heart">Coração</option>
                              <option value="Award">Troféu</option>
                              <option value="Target">Alvo</option>
                              <option value="TrendingUp">Gráfico</option>
                              <option value="Droplets">Água/Gota</option>
                              <option value="Book">Livro</option>
                            </select>
                          </div>
                          <div className="pm-field">
                            <label>Valor/Número</label>
                            <input className="pm-input" value={s.number || s.value || ''} onChange={e => {
                              const next = [...(ministryData.stats || [])];
                              next[idx] = { ...next[idx], number: e.target.value, value: e.target.value };
                              setMinistryData(d => ({ ...d, stats: next }));
                            }} />
                          </div>
                          <div className="pm-field">
                            <label>Rótulo</label>
                            <input className="pm-input" value={s.label || ''} onChange={e => {
                              const next = [...(ministryData.stats || [])];
                              next[idx] = { ...next[idx], label: e.target.value };
                              setMinistryData(d => ({ ...d, stats: next }));
                            }} />
                          </div>
                          <button className="btn-deletar" onClick={() => {
                            const next = ministryData.stats.filter((_, i) => i !== idx);
                            setMinistryData(d => ({ ...d, stats: next }));
                          }}>Remover</button>
                        </div>
                      ))}
                      <button className="pm-add-btn" onClick={() => setMinistryData(d => ({ ...d, stats: [...(d.stats || []), { number: '', label: '', icon: 'Globe' }] }))}>+ Adicionar Estatística</button>
                    </div>
                  )}
                  {ministryTab === 'missionarios' && (
                    <div style={{ padding: '1.2rem' }}>
                      {(ministryData?.missionaries || []).map((m, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', background: palette.surfaceHover, padding: '1rem', borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="pm-field">
                              <label>Nome do Missionário(a) / Família</label>
                              <input className="pm-input" value={m.name || ''} onChange={e => {
                                const next = [...(ministryData.missionaries || [])];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setMinistryData(d => ({ ...d, missionaries: next }));
                              }} />
                            </div>
                            <div className="pm-field">
                              <label>País / Atuação</label>
                              <input className="pm-input" value={m.country || m.location || ''} onChange={e => {
                                const next = [...(ministryData.missionaries || [])];
                                next[idx] = { ...next[idx], country: e.target.value, location: e.target.value };
                                setMinistryData(d => ({ ...d, missionaries: next }));
                              }} />
                            </div>
                            <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                              <label>Breve Descrição do Trabalho</label>
                              <textarea 
                                className="pm-input" 
                                style={{ height: '70px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} 
                                value={m.description || ''} 
                                onChange={e => {
                                  const next = [...(ministryData.missionaries || [])];
                                  next[idx] = { ...next[idx], description: e.target.value };
                                  setMinistryData(d => ({ ...d, missionaries: next }));
                                }} 
                              />
                            </div>
                            <div className="pm-field">
                              <label>Foto (URL)</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input className="pm-input" value={m.photo || m.image || ''} onChange={e => {
                                  const next = [...(ministryData.missionaries || [])];
                                  next[idx] = { ...next[idx], photo: e.target.value, image: e.target.value };
                                  setMinistryData(d => ({ ...d, missionaries: next }));
                                }} />
                                <button type="button" className="pm-photo-btn" onClick={() => handleFileUpload(url => {
                                  const next = [...(ministryData.missionaries || [])];
                                  next[idx].photo = url;
                                  next[idx].image = url;
                                  setMinistryData(d => ({ ...d, missionaries: next }));
                                }, hasSupabase, supabase)}>Up</button>
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Anos no Campo</label>
                              <input type="number" className="pm-input" value={m.yearsOnField || m.since || ''} onChange={e => {
                                const next = [...(ministryData.missionaries || [])];
                                const val = parseInt(e.target.value) || 0;
                                next[idx] = { ...next[idx], yearsOnField: val, since: val };
                                setMinistryData(d => ({ ...d, missionaries: next }));
                              }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            {(m.photo || m.image) ? <img src={transformImageLink(m.photo || m.image)} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} /> : <span>Sem foto</span>}
                            <button 
                              type="button" 
                              className="btn-deletar" 
                              onClick={() => {
                                const next = ministryData.missionaries.filter((_, i) => i !== idx);
                                setMinistryData(d => ({ ...d, missionaries: next }));
                              }}
                            >Excluir Missionário</button>
                          </div>
                        </div>
                      ))}
                      <button 
                        className="pm-add-btn" 
                        onClick={() => setMinistryData(d => ({ ...d, missionaries: [...(d.missionaries || []), { name: '', country: '', location: '', description: '', photo: '', image: '', yearsOnField: 0, since: 0 }] }))}
                      >
                        + Adicionar Missionário
                      </button>
                    </div>
                  )}
                  {ministryTab === 'projetos' && (
                    <div style={{ padding: '1.2rem' }}>
                      {(ministryData?.projects || []).map((p, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', background: palette.surfaceHover, padding: '1rem', borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                            <div className="pm-field">
                              <label>Ícone</label>
                              <select 
                                className="pm-input" 
                                value={p.icon || 'Target'} 
                                onChange={e => {
                                  const next = [...(ministryData.projects || [])];
                                  next[idx] = { ...next[idx], icon: e.target.value };
                                  setMinistryData(d => ({ ...d, projects: next }));
                                }}
                                style={{ background: palette.bg, color: palette.text }}
                              >
                                <option value="Target">Alvo</option>
                                <option value="Water">Água</option>
                                <option value="Book">Livro/Educação</option>
                                <option value="Heart">Coração/Social</option>
                                <option value="Globe">Global</option>
                              </select>
                            </div>
                            <div className="pm-field">
                              <label>Título do Projeto</label>
                              <input className="pm-input" value={p.title || ''} onChange={e => {
                                const next = [...(ministryData.projects || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, projects: next }));
                              }} />
                            </div>
                            <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                              <label>Descrição do Impacto / Objetivos</label>
                              <textarea 
                                className="pm-input" 
                                style={{ height: '70px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} 
                                value={p.description || ''} 
                                onChange={e => {
                                  const next = [...(ministryData.projects || [])];
                                  next[idx] = { ...next[idx], description: e.target.value };
                                  setMinistryData(d => ({ ...d, projects: next }));
                                }} 
                              />
                            </div>
                            <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                              <label>Resumo de Impacto (Ex: 5 poços construídos)</label>
                              <input className="pm-input" value={p.impact || ''} onChange={e => {
                                const next = [...(ministryData.projects || [])];
                                next[idx] = { ...next[idx], impact: e.target.value };
                                setMinistryData(d => ({ ...d, projects: next }));
                              }} />
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                            <button 
                              type="button" 
                              className="btn-deletar" 
                              onClick={() => {
                                const next = ministryData.projects.filter((_, i) => i !== idx);
                                setMinistryData(d => ({ ...d, projects: next }));
                              }}
                            >Remover Projeto</button>
                          </div>
                        </div>
                      ))}
                      <button 
                        className="pm-add-btn" 
                        onClick={() => setMinistryData(d => ({ ...d, projects: [...(d.projects || []), { icon: 'Target', title: '', description: '', impact: '' }] }))}
                      >
                        + Adicionar Projeto
                      </button>
                    </div>
                  )}
                  {ministryTab === 'aniversariantes' && (
                    <div>
                      <div className="pm-field">
                        <label>Título da Seção</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">🎉</span>
                          <input className="pm-input" value={ministryData?.birthdays?.title || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), title: e.target.value } }))} placeholder="Ex: Aniversariantes do Mês" />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Texto Descritivo</label>
                        <textarea value={ministryData?.birthdays?.text || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), text: e.target.value } }))} style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                      </div>
                      <div className="pm-field">
                        <label>Link do Vídeo (YouTube/Vimeo)</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">▶</span>
                          <input className="pm-input" value={ministryData?.birthdays?.videoUrl || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), videoUrl: e.target.value } }))} />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Link de Testemunho (Opcional)</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">🔗</span>
                          <input className="pm-input" value={ministryData?.hero?.testimonyUrl || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, testimonyUrl: e.target.value } }))} placeholder="Link para formulário ou página de depoimentos" />
                        </div>
                      </div>

                      <div style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: 600, fontSize: '.95rem', color: palette.text }}>Lista de Aniversariantes</div>
                      {(ministryData?.birthdays?.people || []).map((p, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', background: palette.surfaceHover, padding: '1rem', borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                          <div className="pm-photo-wrap" style={{ gridColumn: '1 / -1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="pm-photo-preview" style={{ width: 60, height: 60 }}>
                              {p.photo ? <img src={transformImageLink(p.photo)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : '👤'}
                            </div>
                            <button 
                              type="button" 
                              className="pm-action-btn" 
                              style={{ border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: palette.accentGlow, color: palette.accentLight, borderRadius: '6px' }}
                              onClick={() => handleFileUpload(url => {
                                const next = [...(ministryData?.birthdays?.people || [])];
                                next[idx] = { ...next[idx], photo: url };
                                setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                              }, hasSupabase, supabase)}
                            >
                              Alterar Foto
                            </button>
                          </div>
                          <div className="pm-field">
                            <label>Nome</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">👤</span>
                              <input
                                className="pm-input"
                                value={p.name || ''}
                                onChange={e => {
                                  const next = [...(ministryData?.birthdays?.people || [])];
                                  next[idx] = { ...next[idx], name: e.target.value };
                                  setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Data (ex: 15/05)</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">📅</span>
                              <input
                                className="pm-input"
                                value={p.date || ''}
                                onChange={e => {
                                  const next = [...(ministryData?.birthdays?.people || [])];
                                  next[idx] = { ...next[idx], date: e.target.value };
                                  setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              className="btn-deletar"
                              onClick={() => {
                                const next = [...(ministryData?.birthdays?.people || [])];
                                next.splice(idx, 1);
                                setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                              }}
                            >
                              Remover Pessoa
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="pm-add-btn"
                        onClick={() => setMinistryData(d => ({
                          ...d,
                          birthdays: {
                            ...(d.birthdays || {}),
                            people: [...(d.birthdays?.people || []), { name: '', date: '', photo: '' }]
                          }
                        }))}
                      >
                        + Adicionar Aniversariante
                      </button>
                    </div>
                  )}
                  {ministryTab === 'equipe' && (
                    <div>
                      {(ministryData?.team || []).map((m, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Nome</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">👤</span>
                              <input className="pm-input" value={m.name || ''} onChange={e => { const next = [...(ministryData.team || [])]; next[idx] = { ...next[idx], name: e.target.value }; setMinistryData(d => ({ ...d, team: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Cargo</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">💼</span>
                              <input className="pm-input" value={m.role || ''} onChange={e => { const next = [...(ministryData.team || [])]; next[idx] = { ...next[idx], role: e.target.value }; setMinistryData(d => ({ ...d, team: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Foto do Líder</label>
                            <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <span className="pm-icon">🖼</span>
                                <input
                                  className="pm-input"
                                  value={m.photo || ''}
                                  onChange={e => {
                                    const next = [...(ministryData.team || [])];
                                    next[idx] = { ...next[idx], photo: e.target.value };
                                    setMinistryData(d => ({ ...d, team: next }));
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                className="pm-photo-btn"
                                style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                                onClick={() => handleFileUpload(url => {
                                  const next = [...(ministryData.team || [])];
                                  next[idx] = { ...next[idx], photo: url };
                                  setMinistryData(d => ({ ...d, team: next }));
                                }, hasSupabase, supabase)}
                              >
                                Subir Foto
                              </button>
                            </div>
                          </div>
                          {m.photo ? <div style={{ marginBottom: '.5rem', gridColumn: '1 / -1' }}><img src={transformImageLink(m.photo)} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${palette.border}` }} /></div> : null}
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button className="btn-deletar" onClick={() => { const next = [...(ministryData.team || [])]; next.splice(idx, 1); setMinistryData(d => ({ ...d, team: next })); }}>Remover</button>
                          </div>
                        </div>
                      ))}
                      <button className="pm-add-btn" onClick={() => setMinistryData(d => ({ ...d, team: [...(d.team || []), { name: '', role: '', photo: '' }] }))}>+ Adicionar Membro</button>
                    </div>
                  )}
                  {ministryTab === 'programacao' && (
                    <div>
                      {(ministryData?.schedule || []).map((s, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Atividade</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">📌</span>
                              <input className="pm-input" value={s.activity || s.title || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], activity: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Dia</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">🗓</span>
                              <input className="pm-input" value={s.day || s.date || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], day: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Hora</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">⏰</span>
                              <input className="pm-input" value={s.time || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], time: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Local</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">📍</span>
                              <input className="pm-input" value={s.location || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], location: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Descrição</label>
                            <textarea value={s.description || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], description: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                          </div>
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button className="btn-deletar" onClick={() => { const next = [...(ministryData.schedule || [])]; next.splice(idx, 1); setMinistryData(d => ({ ...d, schedule: next })); }}>Remover</button>
                          </div>
                        </div>
                      ))}
                      <button className="pm-add-btn" onClick={() => setMinistryData(d => ({ ...d, schedule: [...(d.schedule || []), { activity: '', day: '', time: '', location: '', description: '' }] }))}>+ Adicionar Atividade</button>
                    </div>
                  )}
                  {ministryTab === 'galeria' && (
                    <div style={{ padding: '0.2rem' }}>
                      {(ministryData?.gallery || []).map((g, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Foto da Galeria</label>
                            <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <span className="pm-icon">🖼</span>
                                <input
                                  className="pm-input"
                                  value={g.url || ''}
                                  onChange={e => {
                                    const next = [...(ministryData.gallery || [])];
                                    next[idx] = { ...next[idx], url: e.target.value };
                                    setMinistryData(d => ({ ...d, gallery: next }));
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                className="pm-photo-btn"
                                style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                                onClick={() => handleFileUpload(url => {
                                  const next = [...(ministryData.gallery || [])];
                                  next[idx] = { ...next[idx], url: url };
                                  setMinistryData(d => ({ ...d, gallery: next }));
                                }, hasSupabase, supabase)}
                              >
                                Subir Foto
                              </button>
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Título / Legenda</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">✏️</span>
                              <input
                                className="pm-input"
                                value={g.title || g.caption || ''}
                                onChange={e => {
                                  const next = [...(ministryData.gallery || [])];
                                  next[idx] = { ...next[idx], title: e.target.value, caption: e.target.value };
                                  setMinistryData(d => ({ ...d, gallery: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Texto de Apoio (Opcional)</label>
                            <textarea
                              value={g.text || ''}
                              onChange={e => {
                                const next = [...(ministryData.gallery || [])];
                                next[idx] = { ...next[idx], text: e.target.value };
                                setMinistryData(d => ({ ...d, gallery: next }));
                              }}
                              style={{ width: '100%', height: 70, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                            />
                          </div>
                          {g.url ? <div style={{ marginBottom: '.5rem', gridColumn: '1 / -1' }}><img src={transformImageLink(g.url)} alt="" style={{ width: 120, height: 72, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /></div> : null}
                          <div className="pm-field">
                            <button
                              className="btn-deletar"
                              onClick={() => {
                                const next = [...(ministryData.gallery || [])];
                                next.splice(idx, 1);
                                setMinistryData(d => ({ ...d, gallery: next }));
                              }}
                            >
                              Remover Foto
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="pm-add-btn"
                        onClick={() => setMinistryData(d => ({ ...d, gallery: [...(d.gallery || []), { url: '', title: '', text: '' }] }))}
                      >
                        + Adicionar Foto à Galeria
                      </button>
                    </div>
                  )}

                  {ministryTab === 'paginas' && (
                    <div style={{ padding: '0.2rem' }}>
                      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, color: palette.text }}>Páginas da Revista</h4>
                        <button 
                          type="button"
                          className="pm-add-btn" 
                          style={{ margin: 0 }}
                          onClick={() => {
                            const newPage = { id: Date.now(), type: 'article', category: 'Nova Categoria', title: 'Novo Artigo', body: 'Conteúdo aqui...' };
                            setMinistryData(d => ({ ...d, pages: [...(d.pages || []), newPage] }));
                          }}
                        >
                          + Adicionar Página
                        </button>
                      </div>
                      
                      {(ministryData?.pages || []).map((page, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', background: palette.surfaceHover, padding: '1rem', borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: `1px solid ${palette.border}`, paddingBottom: '0.5rem' }}>
                            <div className="pm-field" style={{ flex: 1 }}>
                              <label>Tipo de Página</label>
                              <select 
                                className="pm-input" 
                                value={page.type || 'article'} 
                                onChange={e => {
                                  const next = [...(ministryData.pages || [])];
                                  next[idx] = { ...next[idx], type: e.target.value };
                                  if (e.target.value === 'index' && !next[idx].items) next[idx].items = [];
                                  if (e.target.value === 'devotional' && !next[idx].items) next[idx].items = [];
                                  if (e.target.value === 'feature' && !next[idx].events) next[idx].events = [];
                                  if (e.target.value === 'columnist' && !next[idx].author) next[idx].author = { name: '', role: '', image: '', bio: '' };
                                  setMinistryData(d => ({ ...d, pages: next }));
                                }}
                                style={{ background: palette.bg, color: palette.text }}
                              >
                                <option value="cover">Capa</option>
                                <option value="index">Índice</option>
                                <option value="article">Artigo</option>
                                <option value="columnist">Colunista</option>
                                <option value="devotional">Devocional</option>
                                <option value="feature">Destaque/Agenda</option>
                              </select>
                            </div>
                            <button 
                              type="button"
                              className="btn-deletar" 
                              style={{ alignSelf: 'center' }}
                              onClick={() => {
                                const next = [...(ministryData.pages || [])];
                                next.splice(idx, 1);
                                setMinistryData(d => ({ ...d, pages: next }));
                              }}
                            >
                              Excluir
                            </button>
                          </div>

                          {/* Fields based on type */}
                          {page.type === 'cover' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
                              <div className="pm-field">
                                <label>Edição</label>
                                <input className="pm-input" value={page.edition || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], edition: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                              </div>
                              <div className="pm-field">
                                <label>Título da Capa</label>
                                <input className="pm-input" value={page.title || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], title: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                              </div>
                              <div className="pm-field">
                                <label>Subtítulo</label>
                                <input className="pm-input" value={page.subtitle || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], subtitle: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                              </div>
                              <div className="pm-field">
                                <label>Imagem de Fundo</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input className="pm-input" value={page.image || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], image: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                                  <button type="button" className="pm-photo-btn" onClick={() => handleFileUpload(url => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], image: url }; setMinistryData(d => ({...d, pages: next})); }, hasSupabase, supabase)}>Upload</button>
                                </div>
                              </div>
                            </div>
                          )}

                          {(page.type === 'article' || page.type === 'columnist' || page.type === 'devotional' || page.type === 'feature') && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', width: '100%' }}>
                              <div className="pm-field">
                                <label>Categoria</label>
                                <input className="pm-input" value={page.category || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], category: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                              </div>
                              <div className="pm-field">
                                <label>Título</label>
                                <input className="pm-input" value={page.title || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], title: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                              </div>
                            </div>
                          )}

                          {page.type === 'article' && (
                            <div style={{ width: '100%' }}>
                              <div className="pm-field">
                                <label>Imagem do Artigo</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input className="pm-input" value={page.image || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], image: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                                  <button type="button" className="pm-photo-btn" onClick={() => handleFileUpload(url => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], image: url }; setMinistryData(d => ({...d, pages: next})); }, hasSupabase, supabase)}>Upload</button>
                                </div>
                              </div>
                              <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                                <label>Conteúdo (use \n para parágrafos)</label>
                                <textarea 
                                  className="pm-input" 
                                  style={{ height: '150px', whiteSpace: 'pre-wrap', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} 
                                  value={page.body || ''} 
                                  onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], body: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} 
                                />
                              </div>
                            </div>
                          )}

                          {page.type === 'columnist' && (
                            <div style={{ width: '100%' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem', border: `1px solid ${palette.border}`, padding: '0.8rem', borderRadius: '8px' }}>
                                <div className="pm-field" style={{ gridColumn: '1 / -1' }}><label style={{ fontWeight: 600 }}>Dados do Autor</label></div>
                                <div className="pm-field">
                                  <label>Nome do Autor</label>
                                  <input className="pm-input" value={page.author?.name || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, name: e.target.value } }; setMinistryData(d => ({...d, pages: next})); }} />
                                </div>
                                <div className="pm-field">
                                  <label>Cargo/Papel</label>
                                  <input className="pm-input" value={page.author?.role || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, role: e.target.value } }; setMinistryData(d => ({...d, pages: next})); }} />
                                </div>
                                <div className="pm-field">
                                  <label>Foto do Autor</label>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <input className="pm-input" value={page.author?.image || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, image: e.target.value } }; setMinistryData(d => ({...d, pages: next})); }} />
                                    <button type="button" className="pm-photo-btn" onClick={() => handleFileUpload(url => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, image: url } }; setMinistryData(d => ({...d, pages: next})); }, hasSupabase, supabase)}>Up</button>
                                  </div>
                                </div>
                                <div className="pm-field">
                                  <label>Biografia Curta</label>
                                  <input className="pm-input" value={page.author?.bio || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, bio: e.target.value } }; setMinistryData(d => ({...d, pages: next})); }} />
                                </div>
                              </div>
                              <div className="pm-field">
                                <label>Conteúdo (use &lt;quote&gt;...&lt;/quote&gt; para citações)</label>
                                <textarea 
                                  className="pm-input" 
                                  style={{ height: '150px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} 
                                  value={page.body || ''} 
                                  onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], body: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} 
                                />
                              </div>
                            </div>
                          )}

                          {page.type === 'index' && (
                            <div style={{ width: '100%' }}>
                              <label>Itens do Índice</label>
                              {(page.items || []).map((item, iIdx) => (
                                <div key={iIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                                  <div style={{ flex: 2 }}>
                                    <label style={{ fontSize: '0.75rem' }}>Rótulo</label>
                                    <input className="pm-input" value={item.label || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[iIdx].label = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem' }}>Página</label>
                                    <input type="number" className="pm-input" value={item.page || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[iIdx].page = parseInt(e.target.value); setMinistryData(d => ({...d, pages: next})); }} />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem' }}>Ícone</label>
                                    <select className="pm-input" style={{ background: palette.bg, color: palette.text }} value={item.icon || 'BookOpen'} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[iIdx].icon = e.target.value; setMinistryData(d => ({...d, pages: next})); }}>
                                      <option value="BookOpen">Livro</option>
                                      <option value="PenTool">Caneta</option>
                                      <option value="Sun">Sol</option>
                                      <option value="Calendar">Calendário</option>
                                      <option value="Heart">Coração</option>
                                      <option value="Star">Estrela</option>
                                      <option value="Users">Pessoas</option>
                                    </select>
                                  </div>
                                  <button type="button" className="btn-deletar" style={{ padding: '0.4rem', marginBottom: '4px' }} onClick={() => { const next = [...(ministryData.pages)]; next[idx].items.splice(iIdx, 1); setMinistryData(d => ({...d, pages: next})); }}>✕</button>
                                </div>
                              ))}
                              <button type="button" className="pm-add-btn" onClick={() => { const next = [...(ministryData.pages)]; next[idx].items = [...(next[idx].items || []), { label: '', page: 1, icon: 'BookOpen' }]; setMinistryData(d => ({...d, pages: next})); }}>+ Adicionar Item</button>
                            </div>
                          )}

                          {page.type === 'devotional' && (
                            <div style={{ width: '100%' }}>
                              <label>Devocionais Diários</label>
                              {(page.items || []).map((item, dIdx) => (
                                <div key={dIdx} style={{ marginBottom: '1rem', border: `1px solid ${palette.border}`, padding: '0.8rem', borderRadius: '8px' }}>
                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input placeholder="Data (Ex: 01 DEZ)" className="pm-input" value={item.date || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[dIdx].date = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                    <input placeholder="Título" className="pm-input" value={item.title || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[dIdx].title = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                  </div>
                                  <textarea placeholder="Texto reflexivo" className="pm-input" style={{ height: '80px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} value={item.text || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[dIdx].text = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                  <button type="button" className="btn-deletar" style={{ marginTop: '0.5rem' }} onClick={() => { const next = [...(ministryData.pages)]; next[idx].items.splice(dIdx, 1); setMinistryData(d => ({...d, pages: next})); }}>Remover Devocional</button>
                                </div>
                              ))}
                              <button type="button" className="pm-add-btn" onClick={() => { const next = [...(ministryData.pages)]; next[idx].items = [...(next[idx].items || []), { date: '', title: '', text: '' }]; setMinistryData(d => ({...d, pages: next})); }}>+ Adicionar Devocional</button>
                            </div>
                          )}

                          {page.type === 'feature' && (
                            <div style={{ width: '100%' }}>
                              <div className="pm-field">
                                <label>Destaque (Caixa Amarela)</label>
                                <textarea className="pm-input" style={{ height: '60px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} value={page.highlight || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].highlight = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                              </div>
                              <label>Eventos / Agenda</label>
                              {(page.events || []).map((event, eIdx) => (
                                <div key={eIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                  <input placeholder="Data (07/12)" className="pm-input" style={{ flex: 1 }} value={event.date || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].events[eIdx].date = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                  <input placeholder="Evento" className="pm-input" style={{ flex: 3 }} value={event.title || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].events[eIdx].title = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                  <input placeholder="Hora" className="pm-input" style={{ flex: 1 }} value={event.time || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].events[eIdx].time = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                  <button type="button" className="btn-deletar" onClick={() => { const next = [...(ministryData.pages)]; next[idx].events.splice(eIdx, 1); setMinistryData(d => ({...d, pages: next})); }}>✕</button>
                                </div>
                              ))}
                              <button type="button" className="pm-add-btn" onClick={() => { const next = [...(ministryData.pages)]; next[idx].events = [...(next[idx].events || []), { date: '', title: '', time: '' }]; setMinistryData(d => ({...d, pages: next})); }}>+ Adicionar Evento</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Foto da Página */}
                  <div className="pm-photo-wrap">
                    <div className="pm-photo-preview" style={{ width: 120, height: 120, borderRadius: 12 }}>
                      {pageData.photo ? <img src={transformImageLink(pageData.photo)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : <span style={{ fontSize: '2.5rem' }}>🖼️</span>}
                    </div>
                    <label className="pm-photo-btn">
                      📷 Selecionar Foto
                      <input type="file" accept="image/*" onChange={handlePagePhoto} style={{ display: 'none' }} />
                    </label>
                    {pageData.photo && (
                      <button type="button" onClick={() => setPageData(d => ({ ...d, photo: null }))} style={{ background: 'none', border: 'none', color: palette.danger, cursor: 'pointer', fontSize: '.82rem' }}>✕ Remover foto</button>
                    )}
                  </div>

                  {/* Nome do Arquivo (apenas ao criar) */}
                  {pageMode === 'create' && (
                    <div className="pm-field">
                      <label>Nome do Arquivo</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">📄</span>
                        <input className="pm-input" placeholder="Ex: Sobre" value={pageName} onChange={e => setPageName(e.target.value.replace(/[^A-Za-z0-9_-]/g, ''))} />
                      </div>
                    </div>
                  )}

                  {/* Título */}
                  <div className="pm-field">
                    <label>Título da Página</label>
                    <div className="pm-field-wrap">
                      <span className="pm-icon">✏️</span>
                      <input className="pm-input" placeholder="Ex: Sobre Nós" value={pageData.title} onChange={e => setPageData(d => ({ ...d, title: e.target.value }))} />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="pm-field">
                    <label>Descrição / Conteúdo</label>
                    <textarea
                      value={pageData.description}
                      onChange={e => setPageData(d => ({ ...d, description: e.target.value }))}
                      placeholder="Escreva o conteúdo da página aqui..."
                      style={{ width: '100%', height: 180, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="pm-footer">
              <button type="button" className="pm-btn-cancel" onClick={() => setPageModalOpen(false)}>Cancelar</button>
              <button type="button" className="pm-btn-save" onClick={savePage} disabled={pageSaving}>{pageSaving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {selectedNotif && (
        <div className="pm-backdrop" onClick={() => setSelectedNotif(null)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="pm-header">
              <h3>{selectedNotif.title}</h3>
              <button className="pm-close" onClick={() => setSelectedNotif(null)}>✕</button>
            </div>
            <div className="pm-body" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, color: palette.text }}>{selectedNotif.text}</p>
              <p style={{ fontSize: '.75rem', color: palette.textMuted, marginTop: '1.5rem' }}>Recebido em: {selectedNotif.time}</p>
            </div>
            <div className="pm-footer">
              <button className="pm-btn-save" onClick={() => setSelectedNotif(null)}>Entendi</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
