import React, { useState } from 'react';
import { Book } from '../types';
import { X, BookPlus, AlertCircle } from 'lucide-react';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (newBook: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message?: string };
  existingBooks: Book[];
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onAddBook,
  existingBooks,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [readPages, setReadPages] = useState('0');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Validación robusta paso a paso (M4)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Evita doble clic accidental

    setErrorMsg(null);

    // 1. Título vacío
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg('Por favor escribe el título del libro.');
      return;
    }

    // 2. Título excesivamente largo (limite de 120 caracteres para evitar roturas visuales)
    if (trimmedTitle.length > 120) {
      setErrorMsg('El título es demasiado largo. Debe tener menos de 120 caracteres.');
      return;
    }

    // 3. Autor vacío
    const trimmedAuthor = author.trim();
    if (!trimmedAuthor) {
      setErrorMsg('Por favor escribe el nombre del autor.');
      return;
    }

    if (trimmedAuthor.length > 80) {
      setErrorMsg('El nombre del autor debe tener menos de 80 caracteres.');
      return;
    }

    // 4. Total de páginas: entero positivo mayor a 0
    const parsedTotal = parseInt(totalPages, 10);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setErrorMsg('El total de páginas debe ser un número entero mayor a 0.');
      return;
    }

    if (parsedTotal > 15000) {
      setErrorMsg('El número total de páginas parece irreal. El máximo permitido es 15.000.');
      return;
    }

    // 5. Páginas leídas: entero no negativo menor o igual al total
    const parsedRead = parseInt(readPages || '0', 10);
    if (isNaN(parsedRead) || parsedRead < 0) {
      setErrorMsg('Las páginas leídas no pueden ser números negativos.');
      return;
    }

    if (parsedRead > parsedTotal) {
      setErrorMsg(`Las páginas leídas (${parsedRead}) no pueden superar el total de páginas (${parsedTotal}).`);
      return;
    }

    // 6. Libro repetido (mismo título del mismo autor)
    const isDuplicate = existingBooks.some(
      (b) =>
        b.title.trim().toLowerCase() === trimmedTitle.toLowerCase() &&
        b.author.trim().toLowerCase() === trimmedAuthor.toLowerCase()
    );

    if (isDuplicate) {
      setErrorMsg('Ya tienes este libro registrado en tu club con el mismo autor.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = onAddBook({
        title: trimmedTitle,
        author: trimmedAuthor,
        totalPages: parsedTotal,
        readPages: parsedRead,
        notes: notes.trim(),
      });

      if (!result.success) {
        setErrorMsg(result.message || 'No se pudo agregar el libro.');
        setIsSubmitting(false);
        return;
      }

      // Limpiar formulario y cerrar
      setTitle('');
      setAuthor('');
      setTotalPages('');
      setReadPages('0');
      setNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-stone-900/10 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-900">
              <BookPlus className="h-5 w-5" />
            </div>
            <h2 id="modal-add-title" className="text-xl font-bold text-stone-900">
              Agregar libro
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800 text-sm border border-red-200"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="book-title" className="block text-sm font-semibold text-stone-900 mb-1">
              Título del libro <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="book-title"
              type="text"
              required
              maxLength={120}
              placeholder="Ej: Cien años de soledad"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-stone-900 text-base shadow-xs placeholder:text-stone-400 focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Autor */}
          <div>
            <label htmlFor="book-author" className="block text-sm font-semibold text-stone-900 mb-1">
              Autor o autora <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="book-author"
              type="text"
              required
              maxLength={80}
              placeholder="Ej: Gabriel García Márquez"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-stone-900 text-base shadow-xs placeholder:text-stone-400 focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Páginas en dos columnas para optimizar espacio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="book-total-pages" className="block text-sm font-semibold text-stone-900 mb-1">
                Total de páginas <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="book-total-pages"
                type="number"
                min="1"
                max="15000"
                step="1"
                required
                placeholder="Ej: 471"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 text-base shadow-xs placeholder:text-stone-400 focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label htmlFor="book-read-pages" className="block text-sm font-semibold text-stone-900 mb-1">
                Páginas leídas
              </label>
              <input
                id="book-read-pages"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={readPages}
                onChange={(e) => setReadPages(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 text-base shadow-xs placeholder:text-stone-400 focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Notas para el club de lectura */}
          <div>
            <label htmlFor="book-notes" className="block text-sm font-semibold text-stone-900 mb-1">
              Notas iniciales o ideas clave <span className="text-xs font-normal text-stone-500">(opcional)</span>
            </label>
            <textarea
              id="book-notes"
              rows={3}
              maxLength={400}
              placeholder="Ej: Apuntes sobre los primeros capítulos, dudas para la reunión del club..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-stone-900 text-base shadow-xs placeholder:text-stone-400 focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Botón principal único (M3) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-amber-700 py-3.5 px-4 text-center text-base font-bold text-white shadow-md hover:bg-amber-800 active:scale-[0.99] transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 disabled:opacity-60 cursor-pointer min-h-[48px]"
            >
              {isSubmitting ? 'Guardando libro...' : 'Guardar libro en el club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
