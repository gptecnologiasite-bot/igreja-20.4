import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Aceita chaves com nomes diferentes (publishable/anon)
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
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
    return { ok: false, env: false, db: false, storage: false, message: 'Variáveis ausentes' }
  }
  const result = { ok: true, env: true, db: false, storage: false, message: '' }
  try {
    const { error } = await supabase.from('site_settings').select('key').limit(1)
    result.db = !error
  } catch {
    result.db = false
  }
  try {
    // Lista 1 item do bucket padrão (se existir). Se não existir, permanece false.
    const { data, error } = await supabase.storage.from('site-images').list('', { limit: 1 })
    result.storage = Boolean(data || (!error && data !== null))
  } catch {
    result.storage = false
  }
  result.ok = result.env && (result.db || result.storage)
  return result
}
