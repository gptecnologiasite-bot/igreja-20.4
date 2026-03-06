import { useEffect } from 'react';

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

    // Listener para outras abas (evento nativo)
    const handleStorage = (e) => handleUpdate(e.key);
    
    // Listener para a mesma aba (evento personalizado)
    const handleCustom = (e) => {
      if (e.detail && e.detail.key) {
        handleUpdate(e.detail.key);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('admac_db_update', handleCustom);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('admac_db_update', handleCustom);
    };
  }, [keys, onUpdate]);
};

/**
 * Dispara atualização para outras abas/componentes
 */
export const broadcastUpdate = (key) => {
  try {
    window.dispatchEvent(new CustomEvent('admac_db_update', { detail: { key, timestamp: Date.now() } }));
  } catch { /* ignore */ }
};
