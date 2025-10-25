function deepEqual(a, b) {
  // 1. Si son estrictamente iguales (primitivos o misma referencia)
  if (a === b) return true;

  // 2. Criterio: Manejar null [cite: 49]
  // Si uno es null, o no son objetos, o son de tipos diferentes,
  // la única forma de que sean iguales es (a === b), lo cual ya se evaluó.
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  // 3. Comparar claves (funciona para Arrays y Objetos)
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // Criterio: Mismo conjunto de claves [cite: 49] (largo)
  if (keysA.length !== keysB.length) return false;

  // 4. Comparar recursivamente
  for (const key of keysA) {
    // Criterio: Mismo conjunto de claves [cite: 49] (nombres)
    // Y comparar valores recursivamente
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  
  return true;
}