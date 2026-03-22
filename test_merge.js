const deepMerge = (target, source) => {
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

const INITIAL = {
  team: [
    { name: 'Pra. Helena', role: 'Líder', photo: '1' },
    { name: 'Sônia', role: 'Coordenadora', photo: '2' }
  ]
};

const DB_DATA = {
  team: [
    { name: 'Regina', role: '123' },
    { name: 'Crislane', role: '456' }
  ]
};

console.log(JSON.stringify(deepMerge(INITIAL, DB_DATA), null, 2));

const MISSING_DATA = {
  team: []
};

console.log(JSON.stringify(deepMerge(INITIAL, MISSING_DATA), null, 2));
