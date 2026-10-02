/**
 * LeoClub - Módulo de persistencia local (M2)
 *
 * ¿Dónde se guarda?
 * Se guarda en `window.localStorage` bajo la clave 'leoclub_libros_v1'.
 * Este almacenamiento reside en el navegador del dispositivo (celular o PC)
 * y no requiere servidores externos ni cuentas de usuario.
 *
 * ¿Qué pasa si se borra el caché?
 * El caché del navegador (archivos de imagen, estilos CSS y scripts) NO borra el
 * localStorage. Sin embargo, si el usuario selecciona "Borrar datos de sitios web"
 * o navega en "Modo Incógnito", el almacenamiento se vacía al cerrar. Por eso
 * ofrecemos la función de "Exportar a JSON" para que los lectores conserven un
 * respaldo seguro de sus lecturas.
 */

import { Book } from '../types';

export const STORAGE_KEY = 'leoclub_libros_v1';

// Libro de ejemplo inicial cargado para que el lector no arranque en blanco (M2)
export const DEFAULT_SAMPLE_BOOKS: Book[] = [
  {
    id: 'sample-principito-01',
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    totalPages: 96,
    readPages: 48,
    notes: 'Hermosa reflexión sobre ver con el corazón y domesticar lazos afectivos.',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000,
    debate: {
      resumen: 'Una fábula poética sobre un pequeño príncipe que viaja por el cosmos aprendiendo el verdadero valor de la amistad, la responsabilidad y los lazos que elegimos crear.',
      tema_principal: 'La ceguera del mundo adulto frente a la inocencia y lo invisible para los ojos.',
      preguntas: [
        '¿Qué significa en nuestras relaciones actuales la idea del zorro de "crear lazos" y ser responsable de lo que domesticamos?',
        '¿Por qué los adultos del relato están tan obsesionados con contar estrellas y números en vez de disfrutar la vida?',
        'Si el principito visitara nuestra ciudad hoy, ¿qué le llamaría más la atención?'
      ],
    },
  },
  {
    id: 'sample-ficciones-02',
    title: 'Ficciones',
    author: 'Jorge Luis Borges',
    totalPages: 212,
    readPages: 212,
    notes: 'Laberintos, espejos y bibliotecas infinitas. Finalizado para la reunión del club.',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 2,
    debate: {
      resumen: 'Colección de relatos filosóficos que desafían las nociones de tiempo, destino, infinito e identidad mediante construcciones metafísicas laberínticas.',
      tema_principal: 'La ilusión del orden humano frente a la inmensidad del infinito y el azar.',
      preguntas: [
        'En "El jardín de senderos que se bifurcan", ¿cómo se relaciona el tiempo divergente con nuestras decisiones diarias?',
        '¿Es "La biblioteca de Babel" una metáfora de internet y la sobrecarga de información moderna?',
        '¿Cuál de los cuentos generó mayor incomodidad o fascinación en el grupo?'
      ],
    }
  },
];

/**
 * Lee los libros desde localStorage.
 * Cuidado con:
 * 1. JSON corrupto si un usuario editó la consola.
 * 2. Estructura no array.
 * 3. Valores nulos o undefined.
 */
export function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Primera vez: sembrar libro de muestra
      saveBooks(DEFAULT_SAMPLE_BOOKS);
      return DEFAULT_SAMPLE_BOOKS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[LeoClub] Datos inválidos en localStorage. Se restablecen a valores por defecto.');
      saveBooks(DEFAULT_SAMPLE_BOOKS);
      return DEFAULT_SAMPLE_BOOKS;
    }

    // Sanitización defensiva de cada elemento
    return parsed.map((item: any) => ({
      id: String(item.id || `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
      title: String(item.title || 'Sin título').trim(),
      author: String(item.author || 'Autor desconocido').trim(),
      totalPages: Math.max(1, parseInt(String(item.totalPages), 10) || 1),
      readPages: Math.max(0, parseInt(String(item.readPages), 10) || 0),
      notes: typeof item.notes === 'string' ? item.notes.trim() : '',
      createdAt: Number(item.createdAt) || Date.now(),
      updatedAt: Number(item.updatedAt) || Date.now(),
      debate: item.debate && Array.isArray(item.debate.preguntas) ? item.debate : undefined,
    }));
  } catch (error) {
    console.error('[LeoClub] Error al leer localStorage:', error);
    return DEFAULT_SAMPLE_BOOKS;
  }
}

/**
 * Guarda la lista de libros en localStorage.
 * Cuidado con:
 * - QuotaExceededError (si el almacenamiento está lleno).
 */
export function saveBooks(books: Book[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    return true;
  } catch (error) {
    console.error('[LeoClub] Error al guardar en localStorage:', error);
    return false;
  }
}

/**
 * Borra o reinicia los libros en el almacenamiento local.
 */
export function clearAllBooks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[LeoClub] Error al vaciar localStorage:', error);
  }
}

/**
 * Exporta los libros a un archivo JSON descargable (M2).
 */
export function exportBooksToJSON(books: Book[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(books, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `leoclub_respaldo_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Importa libros desde un archivo JSON (M2).
 */
export async function importBooksFromJSON(file: File): Promise<Book[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error('El archivo no contiene un listado válido de libros.');
        }
        const sanitized: Book[] = parsed.map((item: any, index: number) => ({
          id: String(item.id || `imported-${Date.now()}-${index}`),
          title: String(item.title || 'Sin título').trim(),
          author: String(item.author || 'Autor desconocido').trim(),
          totalPages: Math.max(1, parseInt(String(item.totalPages), 10) || 1),
          readPages: Math.max(0, parseInt(String(item.readPages), 10) || 0),
          notes: typeof item.notes === 'string' ? item.notes.trim() : '',
          createdAt: Number(item.createdAt) || Date.now(),
          updatedAt: Number(item.updatedAt) || Date.now(),
          debate: item.debate,
        }));
        saveBooks(sanitized);
        resolve(sanitized);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    reader.readAsText(file);
  });
}
