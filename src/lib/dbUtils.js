/**
 * Mescla recursiva de dois objetos
 */
export const deepMerge = (target, source) => {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return source;

  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    const targetValue = target[key];

    // Se ambos são objetos (e não arrays/null), faz merge recursivo
    if (
      sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
      targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(targetValue, sourceValue);
    } 
    // Se o target espera um array e o source não é um array válido, mantém o target
    else if (Array.isArray(targetValue) && !Array.isArray(sourceValue)) {
      // Ignora sourceValue inválido para arrays
    }
    // Caso contrário, sobrescreve se o valor do source for válido e do tipo esperado
    else if (sourceValue !== undefined && sourceValue !== null) {
      output[key] = sourceValue;
    }
  });
  
  return output;
};

/**
 * Tenta fazer o parse de uma string JSON com segurança.
 * Se o dado não for string (já for um objeto), ele retorna o próprio dado.
 * Útil para tratar respostas do Supabase que podem vir stringificadas dependendo do save original.
 */
export const parseSafeJson = (data) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data;
};

/**
 * Transform standard Google Drive sharing links into direct image links
 * format: https://drive.google.com/uc?export=download&id=FILE_ID
 */
export const transformImageLink = (url) => {
  if (!url || typeof url !== 'string') return url;

  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    let fileId = '';
    
    // Pattern: /file/d/[ID]/view
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      fileId = driveMatch[1];
    } 
    // Pattern: id=[ID]
    else {
      const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }

    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }

  // Handle local image folder paths
  if (url.startsWith('imagem/')) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    // Ensure we don't end up with double slashes if baseUrl ends with /
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    return cleanBase + url;
  }

  return url;
};
