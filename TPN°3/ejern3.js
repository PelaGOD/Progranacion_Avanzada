function groupBy(list, keyOrFn) {
  // Criterio: Retornar objeto plano [cite: 30]
  // Criterio: No mutar list (reduce crea un nuevo objeto) [cite: 30]
  return list.reduce((groups, item) => {
    
    // Determinar la clave según el tipo de keyOrFn
    const key = (typeof keyOrFn === 'function')
      ? keyOrFn(item) // Clave por función [cite: 28]
      : item[keyOrFn]; // Clave por propiedad [cite: 27]
      
    // Inicializar el array si la clave no existe
    if (!groups[key]) {
      groups[key] = [];
    }
    
    // Agregar el item al grupo
    groups[key].push(item);
    
    return groups;
  }, {});
}