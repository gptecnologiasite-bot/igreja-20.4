import { supabase } from './supabaseClient';
import { 
  INITIAL_HOME_DATA, 
  INITIAL_MINISTRIES_DATA, 
  INITIAL_FOOTER_DATA, 
  INITIAL_PAGES_DATA 
} from './initialData';

const DB_KEYS = {
  HOME: 'admac_home',
  PAGES: 'admac_pages',
  FOOTER: 'admac_footer',
  USER: 'admac_user',
  THEME: 'admac_theme',
  MINISTRIES: 'admac_ministry_'
};

const DatabaseService = {
  isSupabaseOnline: async () => {
    try {
      const { error } = await supabase
        .from('app_content')
        .select('key')
        .limit(1);
      return !error;
    } catch (e) { void e; }
    return false;
  },
  fetchItem: async (key, defaultValue) => {
    let v;
    try {
      // Tenta Supabase primeiro se houver conexão
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('app_content')
          .select('*')
          .eq('key', key)
          .maybeSingle();
        if (!error && data) v = data.value;
      }
    } catch (e) { void e; }
    
    if (v !== undefined) return v;
    
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) { void e; }
    
    // Garante que o valor default seja retornado se nada mais funcionar
    // e salva no localStorage para próxima vez
    try {
        localStorage.setItem(key, JSON.stringify(defaultValue));
    } catch (e) { void e; }

    return defaultValue;
  },

  saveItem: async (key, value) => {
    let ok = false;
    try {
      const { error } = await supabase
        .from('app_content')
        .upsert({ key, value }, { onConflict: 'key' });
      ok = !error;
    } catch (e) { void e; }
    if (!ok) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        ok = true;
      } catch (e) { void e; }
    }
    if (ok) window.dispatchEvent(new Event('storage'));
    return ok;
  },

  // --- Home Data ---
  getHomeDataDefault: () => INITIAL_HOME_DATA,
  
  getHomeData: async () => {
    return DatabaseService.fetchItem(DB_KEYS.HOME, INITIAL_HOME_DATA);
  },

  saveHomeData: async (data) => {
    return DatabaseService.saveItem(DB_KEYS.HOME, data);
  },

  // --- Pages Management ---
  getPagesDefault: () => INITIAL_PAGES_DATA,

  getPages: async () => {
    return DatabaseService.fetchItem(DB_KEYS.PAGES, INITIAL_PAGES_DATA);
  },

  savePages: async (pages) => {
    return DatabaseService.saveItem(DB_KEYS.PAGES, pages);
  },

  addPage: async (page) => {
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

  // --- Ministry Data ---
  getMinistryDefault: (id) => {
    return INITIAL_MINISTRIES_DATA[id] || { hero: { title: '', subtitle: '' }, mission: { title: '', text: '' } };
  },

  getMinistry: async (id) => {
    const defaultData = DatabaseService.getMinistryDefault(id);
    return DatabaseService.fetchItem(`${DB_KEYS.MINISTRIES}${id}`, defaultData);
  },

  saveMinistry: async (id, data) => {
    return DatabaseService.saveItem(`${DB_KEYS.MINISTRIES}${id}`, data);
  },

  // --- Footer Data ---
  getFooterDataDefault: () => INITIAL_FOOTER_DATA,

  getFooterData: async () => {
    return DatabaseService.fetchItem(DB_KEYS.FOOTER, INITIAL_FOOTER_DATA);
  },

  saveFooterData: async (data) => {
    return DatabaseService.saveItem(DB_KEYS.FOOTER, data);
  }
};

export default DatabaseService;
