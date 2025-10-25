function isBalanced(s) {
  // Criterio: Usar un stack (array como pila) [cite: 62]
  const stack = [];
  
  const map = {
    '(': ')',
    '[': ']',
    '{': '}',
  };
  
  const closers = new Set([')', ']', '}']);

  for (const char of s) {
    if (map.hasOwnProperty(char)) {
      // Es un caracter de apertura, apilar
      stack.push(char);
    } else if (closers.has(char)) {
      // Es un caracter de cierre
      if (stack.length === 0) {
        return false; // Cierre sin apertura (ej. "}")
      }
      
      const lastOpen = stack.pop();
      
      // Verificar si el cierre coincide con la última apertura
      if (map[lastOpen] !== char) {
        return false; // Mal anidado (ej. "([)]") [cite: 59]
      }
    }
    // Ignorar otros caracteres
  }
  
  // Si el stack está vacío, está balanceado [cite: 58]
  return stack.length === 0;
}