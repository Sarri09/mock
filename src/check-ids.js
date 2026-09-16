import fs from 'fs';
import path from 'path';

// Ajusta la ruta si tu questions.json está en otra carpeta (ej. './src/questions.json')
const filePath = path.resolve('./src/questions.json'); 

try {
  // Leer y parsear el archivo
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const questions = JSON.parse(rawData);

  // Extraer todos los IDs
  const ids = questions.map(q => q.id);
  
  // Buscar duplicados
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  // Buscar IDs faltantes (para ver si te saltaste algún número del 1 al 500)
  const missing = [];
  for (let i = 1; i <= 500; i++) {
    if (!ids.includes(i)) {
      missing.push(i);
    }
  }

  console.log('--- RESULTADOS DE LA VERIFICACIÓN ---');
  console.log(`Total de preguntas leídas: ${questions.length}`);

  if (duplicates.length === 0) {
    console.log('ESTADO: ¡Excelente! Todos los IDs son únicos.');
  } else {
    // Usamos Set para mostrar los duplicados sin repetirlos en consola
    console.log('ERROR: Se encontraron IDs duplicados:', [...new Set(duplicates)]);
  }

  if (missing.length === 0 && questions.length === 500) {
    console.log('SECUENCIA: Tienes exactamente del 1 al 500 sin saltos.');
  } else if (missing.length > 0) {
    console.log('ADVERTENCIA: Faltan los siguientes IDs en la secuencia:', missing);
  }

} catch (error) {
  console.error('Error al leer o procesar el archivo. Verifica la ruta.', error.message);
}