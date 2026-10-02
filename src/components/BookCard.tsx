import React, { useState } from 'react';
import { Book } from '../types';
import {
  CheckCircle2,
  BookOpen,
  Sparkles,
  Trash2,
  Plus,
  Minus,
  MessageSquareQuote,
  Pencil,
  Check,
  X
} from 'lucide-react';

interface BookCardProps {
  book: Book;
  onUpdatePages: (bookId: string, newReadPages: number) => void;
  onDeleteBook: (bookId: string) => void;
  onOpenDebate: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onUpdatePages,
  onDeleteBook,
  onOpenDebate,
}) => {
  const [isEditingPages, setIsEditingPages] = useState(false);
  const [manualPagesInput, setManualPagesInput] = useState(String(book.readPages));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * CÁLCULO SEGURO DE PORCENTAJE (P0/M1)
   * ¡Ojo donde alguien puede equivocarse!:
   * 1. División por cero si totalPages llega a ser 0 o nulo.
   * 2. Porcentajes mayores a 100% si readPages supera totalPages.
   * 3. Números con coma flotante infinitos como 33.333333%.
   */
  const safeTotal = Math.max(1, book.totalPages);
  const safeRead = Math.min(safeTotal, Math.max(0, book.readPages));
  const percentage = Math.min(100, Math.max(0, Math.round((safeRead / safeTotal) * 100)));
  const isFinished = safeRead >= safeTotal;

  // Ajuste rápido con botones +/-
  const handleQuickAdjust = (delta: number) => {
    const target = Math.min(safeTotal, Math.max(0, book.readPages + delta));
    onUpdatePages(book.id, target);
  };

  // Guardar edición manual de páginas
  const handleSaveManualPages = () => {
    const parsed = parseInt(manualPagesInput, 10);
    if (isNaN(parsed) || parsed < 0) {
      setManualPagesInput(String(book.readPages));
      setIsEditingPages(false);
      return;
    }
    const target = Math.min(safeTotal, parsed);
    onUpdatePages(book.id, target);
    setIsEditingPages(false);
  };

  return (
    <article
      className="relative rounded-2xl bg-white p-5 shadow-xs ring-1 ring-stone-900/10 transition-shadow hover:shadow-md"
      aria-label={`Libro: ${book.title} de ${book.author}`}
    >
      {/* Encabezado de la tarjeta: Título, Autor y Estado */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isFinished ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Terminado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                <BookOpen className="h-3.5 w-3.5" />
                Leyendo
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-stone-900 leading-snug line-clamp-2 break-words">
            {book.title}
          </h3>
          <p className="text-sm font-medium text-stone-600 line-clamp-1 break-words">
            por {book.author}
          </p>
        </div>

        {/* Botón secundario para eliminar */}
        <div className="relative">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => onDeleteBook(book.id)}
                className="rounded px-2 py-1 text-xs font-bold bg-red-600 text-white hover:bg-red-700 min-h-[36px]"
                aria-label="Confirmar eliminación"
              >
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded p-1 text-stone-600 hover:bg-stone-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Cancelar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-red-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`Eliminar libro ${book.title}`}
              title="Eliminar este libro"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Barra de progreso y porcentaje (P0/M1) */}
      <div className="mt-4 rounded-xl bg-stone-50 p-3.5 border border-stone-200/80">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-semibold text-stone-700">Progreso</span>
          <span className="font-extrabold text-stone-900 text-base">
            {percentage}%
          </span>
        </div>

        {/* Barra visual accesible */}
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isFinished ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Contador de páginas y controles de ajuste rápido */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
          <div className="flex items-center gap-1.5">
            {isEditingPages ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max={book.totalPages}
                  value={manualPagesInput}
                  onChange={(e) => setManualPagesInput(e.target.value)}
                  className="w-20 rounded-md border border-stone-400 bg-white px-2 py-1 text-sm font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveManualPages}
                  className="rounded-md bg-stone-900 p-1.5 text-white hover:bg-stone-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="Confirmar páginas"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-stone-800">
                  <strong className="text-base text-stone-900">{book.readPages}</strong> de {book.totalPages} págs.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setManualPagesInput(String(book.readPages));
                    setIsEditingPages(true);
                  }}
                  className="rounded p-1 text-stone-500 hover:bg-stone-200/80 hover:text-stone-900 transition-colors"
                  aria-label="Editar páginas leídas manualmente"
                  title="Escribir número exacto de páginas"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Botones de acción rápida +/- */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={book.readPages <= 0}
              onClick={() => handleQuickAdjust(-1)}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
              aria-label="Restar 1 página"
              title="-1 página"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              disabled={book.readPages >= book.totalPages}
              onClick={() => handleQuickAdjust(1)}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
              aria-label="Sumar 1 página"
              title="+1 página"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              disabled={book.readPages >= book.totalPages}
              onClick={() => handleQuickAdjust(10)}
              className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none min-h-[38px] flex items-center justify-center active:scale-95"
              aria-label="Sumar 10 páginas"
            >
              +10
            </button>

            {!isFinished && (
              <button
                type="button"
                onClick={() => onUpdatePages(book.id, book.totalPages)}
                className="rounded-lg bg-emerald-50 border border-emerald-300 px-2 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 min-h-[38px] active:scale-95 transition-all"
                title="Marcar como 100% leído"
              >
                Terminar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notas del lector si existen */}
      {book.notes && (
        <div className="mt-3 rounded-lg bg-amber-50/60 p-2.5 text-xs text-stone-700 border border-amber-200/50">
          <p className="font-semibold text-amber-950 mb-0.5 flex items-center gap-1">
            <MessageSquareQuote className="h-3 w-3" />
            Notas para el debate:
          </p>
          <p className="italic line-clamp-2">{book.notes}</p>
        </div>
      )}

      {/* Botón de debate del Club (M5) */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <button
          type="button"
          onClick={() => onOpenDebate(book)}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-sm font-bold transition-all shadow-xs cursor-pointer min-h-[44px] ${
            book.debate
              ? 'bg-stone-100 text-stone-800 hover:bg-stone-200'
              : 'bg-stone-900 text-amber-100 hover:bg-stone-800'
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          {book.debate ? 'Ver debate generado del club' : 'Generar debate para el club (IA)'}
        </button>
      </div>
    </article>
  );
};
