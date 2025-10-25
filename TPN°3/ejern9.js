function debounce(fn, delay) {
  let timerId;

  return function(...args) {
    // Criterio: Preservar this [cite: 79]
    const context = this; 

    // Criterio: Cancelar timer previo [cite: 79]
    clearTimeout(timerId);

    // Configurar nuevo timer
    timerId = setTimeout(() => {
      // Criterio: Preservar this y argumentos [cite: 79]
      fn.apply(context, args); 
    }, delay); // [cite: 76]
  };
}