/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LeoClub - Aplicación para clubes de lectura y estudiantes
 * Gestiona lecturas, porcentaje de avance, separación en Leyendo/Terminados,
 * persistencia local (localStorage) y moderación de debate con IA (Gemini).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Book, TabFilter, DebateResult } from './types';
import { loadBooks, saveBooks } from './utils/storage';
import { BookCard } from './components/BookCard';
import { BookFormModal } from './components/BookFormModal';
import { DebateModal } from './components/DebateModal';
import { BackupModal } from './components/BackupModal';
import {
  BookOpen,
  CheckCircle2,
  Plus,
  BookmarkCheck,
  HardDrive,
  Library,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  // Lista de libros en memoria reactiva
  const [books, setBooks] = useState<Book[]>(() => {
    /**
     * ¡Ojo donde alguien puede equivocarse!:
     * Inicializar con función () => loadBooks() evita leer localStorage
     * innecesariamente en cada re-renderizado del componente.
     */
    return loadBooks();
  });

  // Filtro activo: 'leyendo' | 'terminados'
  const [activeTab, setActiveTab] = useState<TabFilter>('leyendo');

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [selectedDebateBook, setSelectedDebateBook] = useState<Book | null>(null);

  // Mensajes de notificación amigables (Toast sin alert intrusivo)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  /**
   * PERSISTENCIA AUTOMÁTICA EN LOCALSTORAGE (M2)
   * ¡Ojo donde alguien puede equivocarse!:
   * Siempre guardar una copia inmutable. Nunca mutar el estado `books` directamente.
   */
  useEffect(() => {
    saveBooks(books);
  }, [books]);

  // Libros separados en "Leyendo" y "Terminados" (P0 / M1)
  const readingBooks = useMemo(() => {
    return books.filter((b) => b.readPages < b.totalPages);
  }, [books]);

  const finishedBooks = useMemo(() => {
    return books.filter((b) => b.readPages >= b.totalPages);
  }, [books]);

  const displayedBooks = activeTab === 'leyendo' ? readingBooks : finishedBooks;

  // 1. Agregar libro (P0 / M4)
  const handleAddBook = (
    newBookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>
  ): { success: boolean; message?: string } => {
    /**
     * ¡Ojo donde alguien puede equivocarse!:
     * Generar un ID único sin librerías externas pesadas utilizando timestamp + random.
     */
    const newBook: Book = {
      ...newBookData,
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setBooks((prev) => [newBook, ...prev]);

    // Si el libro fue agregado ya terminado (100%), mostrarlo en Terminados
    if (newBook.readPages >= newBook.totalPages) {
      setActiveTab('terminados');
      showToast(`¡"${newBook.title}" agregado como terminado! 🎉`);
    } else {
      setActiveTab('leyendo');
      showToast(`"${newBook.title}" agregado a tu club.`);
    }

    return { success: true };
  };

  // 2. Registrar páginas leídas y actualizar porcentaje (P0 / M1)
  const handleUpdatePages = (bookId: string, newReadPages: number) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== bookId) return book;

        /**
         * ¡Ojo donde alguien puede equivocarse!:
         * Clamping defensivo: las páginas leídas nunca pueden ser negativas
         * ni exceder el total de páginas del libro.
         */
        const clampedPages = Math.min(book.totalPages, Math.max(0, newReadPages));
        const wasFinishedBefore = book.readPages >= book.totalPages;
        const isFinishedNow = clampedPages >= book.totalPages;

        if (!wasFinishedBefore && isFinishedNow) {
          showToast(`¡Felicitaciones! Terminaste "${book.title}".`);
        }

        return {
          ...book,
          readPages: clampedPages,
          updatedAt: Date.now(),
        };
      })
    );
  };

  // 3. Eliminar libro con actualización inmediata
  const handleDeleteBook = (bookId: string) => {
    const bookToDelete = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (bookToDelete) {
      showToast(`Se quitó "${bookToDelete.title}" de la lista.`);
    }
  };

  // 4. Guardar debate generado por IA (M5)
  const handleSaveDebate = (bookId: string, debate: DebateResult) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, debate, updatedAt: Date.now() } : b))
    );
    showToast('Guía de debate guardada para el club.');
  };

  return (
    <div className="min-h-screen bg-stone-100/60 pb-28 text-stone-900 selection:bg-amber-200">
      {/* Notificación Toast accesible */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-60 w-[90%] max-w-sm rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white shadow-xl text-center flex items-center justify-center gap-2 border border-stone-800 animate-fade-in"
        >
          <BookmarkCheck className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Contenedor optimizado para lectura y uso a una mano en celular (desde 320px) */}
      <div className="mx-auto max-w-lg px-4 pt-5 pb-8 sm:px-6">
        {/* Encabezado de la App */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-700 text-white shadow-md shadow-amber-900/10">
              <Library className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-stone-950 flex items-center gap-1.5">
                LeoClub
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  Lectura
                </span>
              </h1>
              <p className="text-xs text-stone-600 font-medium">
                Tu progreso y temas de debate
              </p>
            </div>
          </div>

          {/* Botón secundario para gestión de respaldo (M2) */}
          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 active:scale-95 transition-all min-h-[44px] min-w-[44px]"
            aria-label="Abrir panel de memoria y respaldo"
            title="Exportar o restaurar datos (M2)"
          >
            <HardDrive className="h-4 w-4 text-stone-600" />
            <span className="hidden xs:inline">Memoria</span>
          </button>
        </header>

        {/* Resumen rápido de lectura para el club */}
        <section
          aria-label="Resumen de avance"
          className="mb-6 rounded-2xl bg-gradient-to-br from-amber-900 to-stone-900 p-4.5 text-white shadow-lg shadow-amber-950/15"
        >
          <div className="flex items-center justify-between text-xs text-amber-200/90 font-medium mb-1">
            <span>Club de Lectura</span>
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              {books.length} {books.length === 1 ? 'libro registrado' : 'libros registrados'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-xs text-amber-200/80">En proceso</p>
              <p className="text-2xl font-black text-amber-100 mt-0.5">
                {readingBooks.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-300/80">Completados</p>
              <p className="text-2xl font-black text-emerald-300 mt-0.5">
                {finishedBooks.length}
              </p>
            </div>
          </div>
        </section>

        {/* Pestañas de filtrado: Leyendo vs Terminados (P0 / M1) */}
        <nav
          aria-label="Listas de libros"
          className="mb-5 grid grid-cols-2 gap-1.5 rounded-xl bg-stone-200/80 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'leyendo'}
            onClick={() => setActiveTab('leyendo')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-bold transition-all min-h-[44px] cursor-pointer ${
              activeTab === 'leyendo'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Leyendo ({readingBooks.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'terminados'}
            onClick={() => setActiveTab('terminados')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-bold transition-all min-h-[44px] cursor-pointer ${
              activeTab === 'terminados'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Terminados ({finishedBooks.length})</span>
          </button>
        </nav>

        {/* Lista de libros o Estado Vacío (M3) */}
        <main>
          {displayedBooks.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white/70 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 mb-3">
                {activeTab === 'leyendo' ? (
                  <BookOpen className="h-7 w-7" />
                ) : (
                  <CheckCircle2 className="h-7 w-7 text-emerald-700" />
                )}
              </div>
              <h2 className="text-lg font-bold text-stone-900">
                {activeTab === 'leyendo'
                  ? 'No tienes lecturas en curso'
                  : 'Aún no has terminado ningún libro'}
              </h2>
              <p className="mt-1 text-sm text-stone-600 max-w-xs mx-auto">
                {activeTab === 'leyendo'
                  ? 'Agrega tu próximo libro con el botón de abajo para seguir tu avance página por página.'
                  : 'Cuando llegues al 100% de las páginas de un libro, aparecerá automáticamente aquí.'}
              </p>
              {activeTab === 'leyendo' && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-800 shadow-xs cursor-pointer min-h-[44px]"
                >
                  <Plus className="h-4 w-4" />
                  Agregar mi primer libro
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onUpdatePages={handleUpdatePages}
                  onDeleteBook={handleDeleteBook}
                  onOpenDebate={(b) => setSelectedDebateBook(b)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Botón flotante único principal en pantalla (M3: Un solo botón principal por pantalla) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-stone-100 via-stone-100/90 to-transparent p-4 pb-6 flex justify-center pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-amber-700 py-4 px-6 text-base font-bold text-white shadow-xl shadow-amber-900/25 hover:bg-amber-800 active:scale-[0.98] transition-all cursor-pointer min-h-[52px]"
            aria-label="Agregar un nuevo libro al club"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
            <span>Agregar nuevo libro</span>
          </button>
        </div>
      </div>

      {/* Modales */}
      <BookFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBook={handleAddBook}
        existingBooks={books}
      />

      <DebateModal
        isOpen={Boolean(selectedDebateBook)}
        onClose={() => setSelectedDebateBook(null)}
        book={selectedDebateBook}
        onSaveDebate={handleSaveDebate}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        books={books}
        onReloadBooks={(newBooks) => setBooks(newBooks)}
        showToast={showToast}
      />
    </div>
  );
}
