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

const offlineResponse = (msg = 'Supabase não configurado') => Promise.resolve({ data: null, error: { message: msg, code: 'OFFLINE' } })
const offlineQuery = () => ({
  select: () => offlineResponse(),
  upsert: () => offlineResponse(),
  insert: () => offlineResponse(),
  delete: () => offlineResponse(),
  update: () => offlineResponse(),
  order: () => offlineQuery(),
  limit: () => offlineQuery(),
  single: () => offlineResponse(),
  eq: () => offlineQuery()
})

export const supabase = hasEnv
  ? createClient(supabaseUrl, supabaseKey)
  : {
      from: () => offlineQuery(),
      storage: undefined,
      auth: {
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase não configurado', code: 'OFFLINE' } }),
        admin: {
          listUsers: async () => ({ data: { users: [] }, error: { message: 'Supabase não configurado', code: 'OFFLINE' } })
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
    const { data, error } = await supabase.from('site_settings').select('key').limit(1)
    if (error) {
      result.db = false
      result.details.db = error.message
      if (error.code === 'PGRST301') result.message += 'Erro de Autenticação (JWT/Key inválidos). '
      else if (error.code === '42501') result.message += 'Erro de Permissão (RLS bloqueando leitura). '
      else result.message += `Erro DB: ${error.message}. `
    } else {
      result.db = true
    }
  } catch (e) {
    result.db = false
    result.message += `Exceção DB: ${e.message}. `
  }

  try {
    // 2. Test Storage connection
    const { data, error } = await supabase.storage.from('site-images').list('', { limit: 1 })
    // We consider it working if we get data or if there's no error (even if empty)
    if (error) {
      result.storage = false
      result.details.storage = error.message
      result.message += `Erro Storage: ${error.message}. `
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
