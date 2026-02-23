import { 
  INITIAL_HOME_DATA, 
  INITIAL_MINISTRIES_DATA, 
  INITIAL_FOOTER_DATA, 
  INITIAL_HEADER_DATA,
  INITIAL_PAGES_DATA 
} from './initialData';

const DB_KEYS = {
  HOME: 'admac_home',
  PAGES: 'admac_pages',
  FOOTER: 'admac_footer',
  HEADER: 'admac_header',
  USER: 'admac_user',
  THEME: 'admac_theme',
  MINISTRIES: 'admac_ministry_',
  MINISTRIES_LIST: 'admac_ministries', // Lista de ministérios para a home
  VIDEOS: 'admac_videos'
};

const DatabaseService = {
  deepMerge: (target, source) => {
    const output = { ...target };
    if (typeof target === 'object' && target !== null && typeof source === 'object' && source !== null) {
      Object.keys(source).forEach(key => {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = DatabaseService.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  },

  fetchItem: async (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      
      // Deep merge with default to ensure new nested fields are present
      if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
        return DatabaseService.deepMerge(defaultValue, parsed);
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      return defaultValue;
    }
  },

  saveItem: async (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
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
    const defaultList = DatabaseService.getMinistriesListDefault();
    return DatabaseService.fetchItem(DB_KEYS.MINISTRIES_LIST, defaultList);
  },

  saveMinistriesList: async (ministries) => {
    return DatabaseService.saveItem(DB_KEYS.MINISTRIES_LIST, ministries);
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

  // --- Ministry Data (individual ministry pages) ---
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
  },

  // --- Header Data ---
  getHeaderDataDefault: () => INITIAL_HEADER_DATA,

  getHeaderData: async () => {
    return DatabaseService.fetchItem(DB_KEYS.HEADER, INITIAL_HEADER_DATA);
  },

  saveHeaderData: async (data) => {
    return DatabaseService.saveItem(DB_KEYS.HEADER, data);
  },

  // --- Videos Data ---
  getVideos: async () => {
    return DatabaseService.fetchItem(DB_KEYS.VIDEOS, []);
  },

  saveVideos: async (videos) => {
    return DatabaseService.saveItem(DB_KEYS.VIDEOS, videos);
  }
};

export default DatabaseService;
