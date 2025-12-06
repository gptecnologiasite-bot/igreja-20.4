// Configuração e Cliente do Supabase
// Responsável por gerenciar a conexão com o banco de dados

import { createClient } from '@supabase/supabase-js';

// URL e Chave pública do projeto Supabase
const supabaseUrl = 'https://PROJETO_SUPABASE_ANTIGO.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cria o cliente Supabase para ser usado em toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test Supabase connection
// Função para testar se a conexão com o Supabase está funcionando
export const testSupabaseConnection = async () => {
  try {
    // Tenta fazer uma consulta simples para verificar acesso
    const { error } = await supabase.from('activity_logs').select('count').limit(1);
    // Se não houver erro, a conexão está OK
    return !error;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
};
