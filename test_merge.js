
const deepMerge = (target, source) => {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return source;

  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
      targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(targetValue, sourceValue);
    } 
    else if (Array.isArray(targetValue) && !Array.isArray(sourceValue)) {
      // Ignore
    }
    else if (sourceValue !== undefined && sourceValue !== null) {
      output[key] = sourceValue;
    }
  });
  
  return output;
};

const INITIAL = {
  logo: { text: 'ADMAC', icon: '✝' }
};

const DB = {
  logo: { text: '📝 ADMAC', icon: 'data:image/png;base64,...' }
};

const result = deepMerge(INITIAL, DB);
console.log('Result:', JSON.stringify(result, null, 2));

if (result.logo.text === '📝 ADMAC') {
  console.log('SUCCESS: Merger worked!');
} else {
  console.log('FAILURE: Merger failed to overwrite!');
}
