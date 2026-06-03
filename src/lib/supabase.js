import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Aceita chaves com nomes diferentes (publishable/anon)
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY
const hasEnv = Boolean(supabaseUrl && supabaseKey)

if (!hasEnv) {
  console.warn('[Supabase] Variáveis de ambiente ausentes. Operando em modo offline.')
}

const offlineResponse = (msg = 'Supabase não configurado') => Promise.resolve({ data: null, error: { message: msg, code: 'OFFLINE' }, count: 0 })

const offlineQuery = () => {
  const query = {
    then: (onFulfilled) => {
      return Promise.resolve({
        data: null,
        error: { message: 'Supabase não configurado', code: 'OFFLINE' },
        count: 0
      }).then(onFulfilled);
    }
  };
  
  const proxy = new Proxy(query, {
    get: (target, prop) => {
      if (prop === 'then') {
        return target.then;
      }
      return () => proxy;
    }
  });
  
  return proxy;
};

const offlineChannel = () => {
  const channelObj = {
    on: () => channelObj,
    subscribe: () => channelObj
  };
  return channelObj;
};

export const supabase = hasEnv
  ? createClient(supabaseUrl, supabaseKey)
  : {
      from: () => offlineQuery(),
      channel: () => offlineChannel(),
      removeChannel: () => {},
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: { message: 'Supabase não configurado', code: 'OFFLINE' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          list: async () => ({ data: [], error: { message: 'Supabase não configurado', code: 'OFFLINE' } }),
          remove: async () => ({ data: [], error: { message: 'Supabase não configurado', code: 'OFFLINE' } })
        })
      },
      auth: {
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase não configurado', code: 'OFFLINE' } }),
        signUp: async () => ({ data: { user: { id: `local-${Date.now()}` } }, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        admin: {
          listUsers: async () => ({ data: { users: [] }, error: { message: 'Supabase não configurado', code: 'OFFLINE' } }),
          createUser: async () => ({ data: { user: null }, error: { message: 'Supabase não configurado', code: 'OFFLINE' } }),
          deleteUser: async () => ({ data: {}, error: { message: 'Supabase não configurado', code: 'OFFLINE' } })
        }
      }
    }

export const hasSupabaseConfigured = hasEnv

export async function testSupabaseConnection () {
  if (!hasEnv) {
    return { ok: false, env: false, db: false, storage: false, message: 'Variáveis de ambiente URL/KEY não encontradas no arquivo .env' }
  }

  // Diagnostic logging for key format (only logs first few chars for security)
  if (supabaseKey.startsWith('sb_publishable_')) {
    console.info('[Supabase] Usando chave de formato Publishable. Certifique-se que o RLS está configurado corretamente.');
  }

  const result = { ok: true, env: true, db: false, storage: false, message: '', details: {} }
  
  try {
    // 1. Test Database connection and RLS read
    const { error, status } = await supabase.from('site_settings').select('key').limit(1)
    if (error) {
      result.db = false
      result.details.db = error.message
      if (error.message.includes('Failed to fetch')) {
        result.message += 'Erro DB: Falha na Rede ou URL incorreta (VITE_SUPABASE_URL). '
      } else if (status === 401 || error.code === 'PGRST301') {
        result.message += 'Erro DB: Chave Inválida (VITE_SUPABASE_ANON_KEY). '
      } else if (status === 404) {
        result.message += 'Erro DB: Tabela "site_settings" não encontrada. Execute o SQL de infraestrutura. '
      } else if (error.code === '42501') {
        result.message += 'Erro DB: Acesso negado por RLS. '
      } else {
        result.message += `Erro DB: ${error.message}. `
      }
    } else {
      result.db = true
    }
  } catch (e) {
    result.db = false
    result.message += `Exceção DB: ${e.message}. `
  }

  try {
    // 2. Test Storage connection (Bucket: site-images)
    const { error } = await supabase.storage.from('site-images').list('', { limit: 1 })
    if (error) {
      result.storage = false
      result.details.storage = error.message
      if (error.message.includes('not found') || error.status === 404) {
        result.message += 'Erro Storage: Bucket "site-images" não encontrado. '
      } else {
        result.message += `Erro Storage: ${error.message}. `
      }
    } else {
      result.storage = true
    }
  } catch (e) {
    result.storage = false
    result.message += `Exceção Storage: ${e.message}. `
  }

  result.ok = result.env && (result.db || result.storage)
  if (!result.ok && !result.message) result.message = 'Falha desconhecida na conexão.'
  
  return result
}
