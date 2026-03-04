// ================================================================
// DatabaseService.js — Camada de persistência local (localStorage)
// Todos os dados do site (home, cabeçalho, rodapé, ministérios,
// páginas, vídeos e logs) são salvos e recuperados daqui.
// Usa `deepMerge` para garantir que novos campos adicionados ao
// `initialData.js` não sejam perdidos quando o localStorage já
// existir com dados de uma versão anterior.
// ================================================================

import { 
  INITIAL_HOME_DATA, 
  INITIAL_MINISTRIES_DATA, 
  INITIAL_FOOTER_DATA, 
  INITIAL_HEADER_DATA,
  INITIAL_PAGES_DATA 
} from './initialData';

// Chaves utilizadas para armazenar cada recurso no localStorage
const DB_KEYS = {
  HOME: 'admac_home',
  PAGES: 'admac_pages',
  FOOTER: 'admac_footer',
  HEADER: 'admac_header',
  USER: 'admac_user',
  THEME: 'admac_theme',
  MINISTRIES: 'admac_ministry_',        // Prefixo; ID do ministério é concatenado
  MINISTRIES_LIST: 'admac_ministries',  // Lista de ministérios exibida na Home
  VIDEOS: 'admac_videos',
  LOGS: 'admac_logs'
};

const DatabaseService = {
  // Mescla recursiva de dois objetos, priorizando os dados do `source`.
  // Garante que campos novos do `target` (defaults) sejam preservados
  // quando o `source` (dado salvo) não os contém.
  deepMerge: (target, source) => {
    if (!source || typeof source !== 'object') return target;
    const output = { ...target };
    
    if (typeof target === 'object' && target !== null && typeof source === 'object' && source !== null) {
      Object.keys(source).forEach(key => {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          if (!(key in target) || target[key] === null) {
            // Chave não existe no alvo ou é nula: copia diretamente
            output[key] = source[key];
          } else {
            // Chave existe em ambos: mescla recursivamente
            output[key] = DatabaseService.deepMerge(target[key], source[key]);
          }
        } else {
          // Arrays e primitivos: o source tem prioridade (mesmo se for vazio ou null)
          // Mas se o source for uma string vazia e o target tiver algo, mantemos o target?
          // Não, o salvamento deve ser fiel.
          output[key] = source[key];
        }
      });
    }
    return output;
  },

  // Lê um item do localStorage e faz deep merge com o `defaultValue`.
  // Retorna `defaultValue` se o item não existir ou estiver corrompido.
  fetchItem: async (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      if (!parsed) return defaultValue;
      
      // Deep merge com o default para garantir que novos campos estejam presentes
      if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
        return DatabaseService.deepMerge(defaultValue, parsed);
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      return defaultValue;
    }
  },

  // Salva qualquer valor serializável no localStorage como JSON.
  saveItem: async (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        const usage = DatabaseService.getStorageUsage();
        console.warn(`LocalStorage quota exceeded! Current usage: ${usage.totalKB.toFixed(2)}KB`);
        throw new Error('QUOTA_EXCEEDED');
      }
      throw error;
    }
  },

  // Retorna estatísticas de uso do localStorage
  getStorageUsage: () => {
    let total = 0;
    const items = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = (key.length + value.length) * 2; // Aproximação de bytes (UTF-16)
      total += size;
      items[key] = size / 1024;
    }
    return {
      totalKB: total / 1024,
      totalMB: total / (1024 * 1024),
      percent: (total / (5 * 1024 * 1024)) * 100, // Assumindo limite de 5MB
      items
    };
  },

  // ── Dados da Home ────────────────────────────────────────────
  // Retorna os dados padrão sem acessar o localStorage (síncrono)
  getHomeDataDefault: () => INITIAL_HOME_DATA,
  
  getHomeData: async () => {
    const data = await DatabaseService.fetchItem(DB_KEYS.HOME, INITIAL_HOME_DATA);
    
    // Robusta garantia de dados: previne campos vazios salvos acidentalmente
    if (!data.welcome || !data.welcome.title) data.welcome = { ...INITIAL_HOME_DATA.welcome };
    if (!data.cta || !data.cta.title) data.cta = { ...INITIAL_HOME_DATA.cta };
    if (!data.carousel || data.carousel.length === 0) data.carousel = [...INITIAL_HOME_DATA.carousel];
    if (!data.pastors || data.pastors.length === 0) data.pastors = [...INITIAL_HOME_DATA.pastors];
    
    // Garante que "Mídia" esteja na lista de ministérios da Home mesmo com dados antigos em localStorage
    if (data.ministries) {
      const hasMidia = data.ministries.some(m => m.link === '/midia');
      if (!hasMidia) {
        data.ministries.push({ title: "Mídia", description: "Comunicação e tecnologia a serviço do Reino", link: "/midia", icon: "🎬", color: "#d4af37" });
      }
    } else {
      data.ministries = [...INITIAL_HOME_DATA.ministries];
    }
    
    return data;
  },

  saveHomeData: async (data) => {
    const success = await DatabaseService.saveItem(DB_KEYS.HOME, data);
    if (success) DatabaseService.broadcastUpdate(DB_KEYS.HOME);
    return success;
  },

  // --- Ministries List (for Home page) ---
  getMinistriesListDefault: () => [
    { title: "Kids", description: "Ensinando a criança no caminho em que deve andar", link: "/kids", icon: "👶", color: "#ff6b9d" },
    { title: "Louvor", description: "Adorando a Deus em espírito e em verdade", link: "/louvor", icon: "🎵", color: "#9b59b6" },
    { title: "EBD", description: "Crescendo no conhecimento da Palavra", link: "/edb", icon: "📚", color: "#d4af37" },
    { title: "Ação Social", description: "Servindo ao próximo com amor", link: "/social", icon: "❤️", color: "#e74c3c" },
    { title: "Lares", description: "Comunhão e crescimento nos lares", link: "/lares", icon: "🏠", color: "#3498db" },
    { title: "Retiro", description: "Momentos de renovação espiritual", link: "/retiro", icon: "⛰️", color: "#27ae60" }
  ],

  getMinistriesList: async () => {
    const homeData = await DatabaseService.getHomeData();
    if (homeData && homeData.ministries && homeData.ministries.length > 0) {
      return homeData.ministries;
    }
    const defaultList = DatabaseService.getMinistriesListDefault();
    return await DatabaseService.fetchItem(DB_KEYS.MINISTRIES_LIST, defaultList);
  },

  saveMinistriesList: async (ministries) => {
    const success = await DatabaseService.saveItem(DB_KEYS.MINISTRIES_LIST, ministries);
    if (success) DatabaseService.broadcastUpdate(DB_KEYS.MINISTRIES_LIST);
    return success;
  },

  addMinistryToList: async (ministry) => {
    const list = await DatabaseService.getMinistriesList();
    list.push(ministry);
    return DatabaseService.saveMinistriesList(list);
  },

  updateMinistryInList: async (index, ministry) => {
    const list = await DatabaseService.getMinistriesList();
    if (index >= 0 && index < list.length) {
      list[index] = ministry;
      return DatabaseService.saveMinistriesList(list);
    }
    return false;
  },

  deleteMinistryFromList: async (index) => {
    const list = await DatabaseService.getMinistriesList();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      return DatabaseService.saveMinistriesList(list);
    }
    return false;
  },

  // --- Pages Management ---
  getPagesDefault: () => INITIAL_PAGES_DATA,

  getPages: async () => {
    return DatabaseService.fetchItem(DB_KEYS.PAGES, INITIAL_PAGES_DATA);
  },

  savePages: async (pages) => {
    const success = await DatabaseService.saveItem(DB_KEYS.PAGES, pages);
    if (success) DatabaseService.broadcastUpdate(DB_KEYS.PAGES);
    return success;
  },

  addPage: async (page) => {
    // Cria uma nova página dinâmica no sistema
    const pages = await DatabaseService.getPages();
    const newPage = {
      ...page,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      type: 'dynamic',
      status: 'online'
    };
    pages.push(newPage);
    return DatabaseService.savePages(pages);
  },

  updatePage: async (id, updates) => {
    const pages = await DatabaseService.getPages();
    const updatedPages = pages.map(p => p.id === id ? { ...p, ...updates } : p);
    return DatabaseService.savePages(updatedPages);
  },

  deletePage: async (id) => {
    const pages = await DatabaseService.getPages();
    const updatedPages = pages.filter(p => p.id !== id);
    return DatabaseService.savePages(updatedPages);
  },

  // --- Ministry Data (individual ministry pages) ---
  getMinistryDefault: (id) => {
    return INITIAL_MINISTRIES_DATA[id] || { hero: { title: '', subtitle: '' }, mission: { title: '', text: '' } };
  },

  getMinistry: async (id) => {
    if (id === 'home') return await DatabaseService.getHomeData();
    const defaultData = DatabaseService.getMinistryDefault(id);
    const data = await DatabaseService.fetchItem(`${DB_KEYS.MINISTRIES}${id}`, defaultData);
    
    // Conferir integridade: garante que novos campos do initialData sejam incorporados
    return DatabaseService.deepMerge(defaultData, data);
  },

  saveMinistry: async (id, data) => {
    if (id === 'home') return DatabaseService.saveHomeData(data);
    const key = `${DB_KEYS.MINISTRIES}${id}`;
    const success = await DatabaseService.saveItem(key, data);
    if (success) DatabaseService.broadcastUpdate(key);
    return success;
  },

  // --- Footer Data ---
  getFooterDataDefault: () => INITIAL_FOOTER_DATA,

  getFooterData: async () => {
    return await DatabaseService.fetchItem(DB_KEYS.FOOTER, INITIAL_FOOTER_DATA);
  },

  saveFooterData: async (data) => {
    const success = await DatabaseService.saveItem(DB_KEYS.FOOTER, data);
    if (success) DatabaseService.broadcastUpdate(DB_KEYS.FOOTER);
    return success;
  },

  // --- Logs ---
  getLogs: async () => {
    try {
      const logs = localStorage.getItem(DB_KEYS.LOGS);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  },

  addLog: async (action, userEmail, details = '') => {
    // Registra atividades do sistema para auditoria no Painel Admin
    try {
      const logs = await DatabaseService.getLogs();
      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        action,
        user: userEmail,
        details,
        location: ['SP, Brasil', 'RJ, Brasil', 'DF, Brasil', 'Desconhecido'][Math.floor(Math.random() * 4)] // Simulação de local
      };
      logs.unshift(newLog); // Adiciona no início da lista
      if (logs.length > 500) logs.pop(); // Mantém o histórico sob controle (max 500)
      localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
      return true;
    } catch {
      return false;
    }
  },

  // --- Header Data ---
  getHeaderDataDefault: () => INITIAL_HEADER_DATA,

  getHeaderData: async () => {
    return DatabaseService.fetchItem(DB_KEYS.HEADER, INITIAL_HEADER_DATA);
  },

  saveHeaderData: async (data) => {
    const success = await DatabaseService.saveItem(DB_KEYS.HEADER, data);
    if (success) DatabaseService.broadcastUpdate(DB_KEYS.HEADER);
    return success;
  },

  // --- Videos Data ---
  getVideos: async () => {
    return DatabaseService.fetchItem(DB_KEYS.VIDEOS, []);
  },

  saveVideos: async (videos) => {
    const success = await DatabaseService.saveItem(DB_KEYS.VIDEOS, videos);
    if (success) DatabaseService.broadcastUpdate(DB_KEYS.VIDEOS);
    return success;
  },

  // Dispara um evento global para notificar outros componentes/abas sobre mudanças
  broadcastUpdate: (key) => {
    try {
      // Força um evento de storage que é capturado por outras abas
      const timestamp = String(Date.now());
      window.localStorage.setItem('admac_last_update', timestamp);
      window.localStorage.setItem('admac_update_key', key);
      
      // Dispara evento local para a mesma aba
      window.dispatchEvent(new CustomEvent('admac_db_update', { detail: { key, timestamp } }));
    } catch { /* ignore */ }
  }
};

export default DatabaseService;
