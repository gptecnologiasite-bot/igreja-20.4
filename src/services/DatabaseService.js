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
  // --- Generic Helpers ---
  
  // Fetch data from Supabase
  fetchItem: async (key, defaultValue) => {
    try {
      const { data, error } = await supabase
        .from('app_content')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (error) {
         console.warn(`Error fetching ${key} from Supabase:`, error.message);
         return defaultValue;
      }
      return data ? data.value : defaultValue;
    } catch (error) {
      console.error(`Unexpected error fetching ${key}:`, error);
      return defaultValue;
    }
  },

  // Save data to Supabase
  saveItem: async (key, value) => {
    try {
      const { error } = await supabase
        .from('app_content')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) {
        console.error(`Error saving ${key} to Supabase:`, error);
        return false;
      }
      // Dispatch event for real-time updates (if needed locally, though Supabase has subscriptions)
      window.dispatchEvent(new Event('storage')); 
      return true;
    } catch (error) {
      console.error(`Unexpected error saving ${key}:`, error);
      return false;
    }
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
