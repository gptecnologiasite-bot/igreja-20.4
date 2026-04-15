import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para as páginas da pasta 'pages' usarem para sincronização reativa.
 * @param {string|string[]} keys - Chave ou array de chaves a observar.
 * @param {function} onUpdate - Callback disparado quando os dados mudarem.
 */
export const usePageUpdate = (keys, onUpdate) => {
  useEffect(() => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    
    const handleUpdate = (eventKey) => {
      if (keysArray.includes(eventKey)) {
        onUpdate();
      }
    };

    // 1. SUPABASE REALTIME - Monitora mudanças reais no banco de dados
    const channel = supabase
      .channel('public:site_settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        (payload) => {
          if (payload.new && payload.new.key) {
            handleUpdate(payload.new.key);
          }
        }
      )
      .subscribe();

    // 2. STORAGE EVENT - Sincronização offline entre abas na mesma sessão
    const handleStorage = (e) => {
      if (e.key === 'admac_db_signal' && e.newValue) {
        try {
          const { key } = JSON.parse(e.newValue);
          handleUpdate(key);
        } catch { /* ignore */ }
      } else {
        handleUpdate(e.key);
      }
    };
    
    // 3. CUSTOM EVENT - Comunicação imediata no mesmo contexto de execução
    const handleCustom = (e) => {
      if (e.detail && e.detail.key) {
        handleUpdate(e.detail.key);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('admac_db_update', handleCustom);
    
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('admac_db_update', handleCustom);
    };
  }, [keys, onUpdate]);
};

/**
 * Dispara atualização para outras abas/componentes (Fallback Offline)
 */
export const broadcastUpdate = (key) => {
  try {
    // Sincronia na mesma aba
    window.dispatchEvent(new CustomEvent('admac_db_update', { detail: { key, timestamp: Date.now() } }));
    
    // Sincronia entre abas (offline/local)
    localStorage.setItem('admac_db_signal', JSON.stringify({ key, timestamp: Date.now() }));
  } catch { /* ignore */ }
};

