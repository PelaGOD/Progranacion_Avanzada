function pick(obj, keys) {
  const newObj = {};
  
  for (const key of keys) {
    // Solo agregar la clave si existe en el objeto original [cite: 18]
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  }
  
  // Criterio: No mutar obj (se retorna un objeto nuevo) [cite: 20]
  return newObj;
}