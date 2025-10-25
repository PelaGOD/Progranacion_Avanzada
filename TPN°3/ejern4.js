function sortByMany(list, specs) {
  // Criterio: No mutar el array original (clonar antes) [cite: 39]
  const clone = [...list];
  
  clone.sort((a, b) => {
    for (const spec of specs) {
      const { key, dir } = spec; // [cite: 37]
      const valA = a[key];
      const valB = b[key];
      
      // Determinar dirección [cite: 37]
      const direction = (dir === 'desc') ? -1 : 1;

      if (valA > valB) {
        return 1 * direction;
      }
      if (valA < valB) {
        return -1 * direction;
      }
      // Si son iguales, el bucle continúa con el siguiente criterio
    }
    return 0; // Son idénticos según todos los criterios
  });
  
  return clone;
}