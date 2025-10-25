function withTimeout(promise, ms) {
  // Crear una promesa que rechaza después de 'ms' [cite: 84]
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout')); // [cite: 84]
    }, ms);
  });

  // Competir la promesa original con la promesa de timeout
  return Promise.race([promise, timeoutPromise]);
}

/**
 * [cite: 94]
 * Consigna B: allSettledLite(promises) devuelve un array de objetos
 * de estado (sin usar Promise.allSettled). [cite: 85, 86]
 */
function allSettledLite(promises) {
  // Mapear cada promesa a una nueva promesa que siempre resuelve
  const wrappedPromises = promises.map(promise =>
    promise
      .then(value => ({
        status: 'fulfilled', // [cite: 85]
        value: value
      }))
      .catch(reason => ({
        status: 'rejected', // [cite: 86]
        reason: reason
      }))
  );
  
  // Esperar a que todas las promesas "envueltas" resuelvan
  return Promise.all(wrappedPromises);
}