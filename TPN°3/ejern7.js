function wordFreq(text) {
  // Criterio: Usar Map [cite: 67]
  const frequencies = new Map();
  
  // Criterio: Normalizar a minúsculas [cite: 69]
  // Criterio: remover puntuación [,.:;!?] [cite: 69]
  const normalizedText = text.toLowerCase().replace(/[,.:;!?]/g, '');
  
  // Separar por uno o más espacios/saltos de línea
  const words = normalizedText.split(/\s+/);

  for (const word of words) {
    // Ignorar strings vacíos (si había doble espacio o puntuación al final)
    if (word) {
      const count = frequencies.get(word) || 0;
      frequencies.set(word, count + 1);
    }
  }
  
  return frequencies;
}