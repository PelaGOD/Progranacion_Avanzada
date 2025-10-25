function sumUnique(nums) {
  // Criterios: Usar Set para manejar duplicados [cite: 12]
  // y Number.isFinite para validar números[cite: 12].
  const uniqueNumbers = new Set(
    nums.filter(num => Number.isFinite(num)) // Ignora no-numéricos [cite: 8]
  );

  // Sumar los números únicos [cite: 8]
  return [...uniqueNumbers].reduce((acc, num) => acc + num, 0);
}