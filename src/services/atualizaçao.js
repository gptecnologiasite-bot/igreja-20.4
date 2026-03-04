import { useEffect } from 'react';
import DatabaseService from './DatabaseService';
import { 
  INITIAL_HOME_DATA, 
  INITIAL_MINISTRIES_DATA, 
  INITIAL_FOOTER_DATA, 
  INITIAL_HEADER_DATA 
} from './initialData';

/**
 * atualizaçao.js — Serviço de Sincronização e Aplicação de Mudanças.
 * Este serviço centraliza a lógica de "aplicar" mudanças do painel às páginas,
 * garantindo que a integridade (via initialData) seja respeitada.
 */

const ContentUpdateService = {
  /**
   * Confere se há dados faltando usando o initialData como referência.
   * @param {string} key - A chave do recurso (ex: 'admac_home').
   * @param {object} currentData - Os dados vindos do painel ou localStorage.
   */
  ensureIntegrity: (key, currentData) => {
    let reference = null;

    if (key === 'admac_home') reference = INITIAL_HOME_DATA;
    else if (key.startsWith('admac_ministry_')) {
      const id = key.replace('admac_ministry_', '');
      reference = INITIAL_MINISTRIES_DATA[id] || { hero: { title: '', subtitle: '' }, mission: { title: '', text: '' } };
    } else if (key === 'admac_footer') reference = INITIAL_FOOTER_DATA;
    else if (key === 'admac_header') reference = INITIAL_HEADER_DATA;

    if (reference && currentData) {
      // Usa o deepMerge do DatabaseService para preencher buracos
      return DatabaseService.deepMerge(reference, currentData);
    }
    return currentData;
  },

  /**
   * Aplica a mudança na devida página disparando o broadcast de atualização.
   * @param {string} key - Chave do localStorage.
   */
  applyChange: (key) => {
    // Notifica todas as abas/componentes que os dados mudaram.
    DatabaseService.broadcastUpdate(key);
  },

  /**
   * Hook para as páginas da pasta 'pages' usarem para sincronização reativa.
   * @param {string|string[]} keys - Chave ou array de chaves a observar.
   * @param {function} onUpdate - Callback disparado quando os dados mudarem.
   */
  usePageUpdate: (keys, onUpdate) => {
    useEffect(() => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      
      const handleStorage = (e) => {
        if (keysArray.includes(e.key)) {
          onUpdate();
        }
      };

      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }, [keys, onUpdate]);
  }
};

export default ContentUpdateService;
