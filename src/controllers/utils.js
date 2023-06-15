// utils.js

// Función para aleatorizar un arreglo
function shuffle(array) {
    // Crear una copia del arreglo original
    const shuffledArray = array.slice();
  
    // Recorrer el arreglo desde el último elemento hasta el segundo
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      // Generar un índice aleatorio entre 0 y i
      const j = Math.floor(Math.random() * (i + 1));
  
      // Intercambiar los elementos en las posiciones i y j
      const temp = shuffledArray[i];
      shuffledArray[i] = shuffledArray[j];
      shuffledArray[j] = temp;
    }
  
    return shuffledArray;
  }
  
  
  module.exports = { shuffle };
  