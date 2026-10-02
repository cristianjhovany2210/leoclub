import React, { useState } from 'react';
import { Book, DebateResult } from '../types';
import {
  X,
  Sparkles,
  MessageCircleQuestion,
  BookOpenText,
  BookmarkCheck,
  Copy,
  Check,
  AlertTriangle,
  RotateCw,
  ZapOff
} from 'lucide-react';

interface DebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onSaveDebate: (bookId: string, debate: DebateResult) => void;
}

export const DebateModal: React.FC<DebateModalProps> = ({
  isOpen,
  onClose,
  book,
  onSaveDebate,
}) => {
  const [currentNotes, setCurrentNotes] = useState(book?.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [activeDebate, setActiveDebate] = useState<DebateResult | null>(book?.debate || null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [useDemoMode, setUseDemoMode] = useState(false);

  // Sincronizar estado cuando cambia el libro
  React.useEffect(() => {
    if (book) {
      setCurrentNotes(book.notes || '');
      setActiveDebate(book.debate || null);
      setErrorMessage(null);
      setWarningMessage(null);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleGenerate = async (forceDemo = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    setWarningMessage(null);

    const shouldUseDemo = forceDemo || useDemoMode;

    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          notes: currentNotes,
          useDemo: shouldUseDemo,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ocurrió un error al procesar el debate.');
      }

      if (result.warning) {
        setWarningMessage(result.warning);
      } else if (result.notice) {
        setWarningMessage(result.notice);
      }

      const debateData: DebateResult = result.data;
      setActiveDebate(debateData);
      onSaveDebate(book.id, debateData);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(
        error.message ||
        'No pudimos conectar con el moderador virtual. Puedes activar el "Modo de prueba" para obtener preguntas modelo de inmediato.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (!activeDebate) return;
    const fullText = `*LeoClub: Guía de Debate*\n📖 *Libro:* ${book.title} (${book.author})\n🎯 *Tema central:* ${activeDebate.tema_principal}\n\n📝 *Resumen del club:*\n${activeDebate.resumen}\n\n💬 *Preguntas para debatir:*\n${activeDebate.preguntas.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="debate-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-stone-900/10 max-h-[92vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-900">
              <Sparkles className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h2 id="debate-modal-title" className="text-xl font-bold text-stone-900 leading-tight">
                Debate para el club
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {book.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de debate"
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Interruptor de modo de ahorro / prueba sin gastar llamadas (M5.5) */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50/70 p-3 border border-amber-200/60 text-xs">
          <div className="flex items-center gap-2">
            <ZapOff className="h-4 w-4 text-amber-800" />
            <span className="font-semibold text-amber-950">
              Modo ahorro de llamadas (ejemplo inmediato)
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useDemoMode}
              onChange={(e) => setUseDemoMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-700" />
          </label>
        </div>

        {/* Input de notas antes de generar */}
        <div className="mt-4">
          <label htmlFor="debate-notes" className="block text-sm font-semibold text-stone-900 mb-1">
            Mis notas o impresiones de lectura
          </label>
          <textarea
            id="debate-notes"
            rows={2}
            placeholder="Anota qué te llamó la atención, un personaje conflictivo o una frase que quieras debatir..."
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-stone-900 text-sm shadow-xs placeholder:text-stone-400 focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Alerta de advertencia o aviso amigable */}
        {warningMessage && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="font-medium">{warningMessage}</p>
          </div>
        )}

        {/* Alerta de error */}
        {errorMessage && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-900 border border-red-200">
            <p className="font-bold mb-1">No se pudo completar la consulta:</p>
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => handleGenerate(true)}
              className="mt-2 text-xs font-bold text-red-800 underline hover:text-red-950"
            >
              Generar preguntas con el modo ejemplo sin conexión →
            </button>
          </div>
        )}

        {/* Botón de acción para generar/regenerar */}
        <div className="mt-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleGenerate()}
            className="w-full rounded-xl bg-amber-700 py-3 px-4 text-center text-sm font-bold text-white shadow-md hover:bg-amber-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer min-h-[48px]"
          >
            {isLoading ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Analizando con LeoClub IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{activeDebate ? 'Regenerar debate' : 'Crear preguntas de debate'}</span>
              </>
            )}
          </button>
        </div>

        {/* Salida estructurada de datos (M5.2: MOSTRADO COMO DATOS, NO COMO PÁRRAFO) */}
        {activeDebate && (
          <div className="mt-6 space-y-4 border-t border-stone-200 pt-5">
            {/* 1. Tema principal (Badge destacado) */}
            <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 mb-2">
                <BookmarkCheck className="h-3.5 w-3.5" />
                Tema central de debate
              </span>
              <p className="text-base font-bold text-stone-900 leading-snug">
                {activeDebate.tema_principal}
              </p>
            </div>

            {/* 2. Resumen orientado al debate */}
            <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 mb-1.5">
                <BookOpenText className="h-4 w-4 text-stone-700" />
                Resumen para el club
              </span>
              <p className="text-sm text-stone-800 leading-relaxed font-serif-book text-justify">
                {activeDebate.resumen}
              </p>
            </div>

            {/* 3. Preguntas de debate individuales (como lista de datos estructurada) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700">
                  <MessageCircleQuestion className="h-4 w-4 text-amber-700" />
                  3 Preguntas provocadoras para moderar:
                </span>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 p-1 rounded"
                >
                  {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedAll ? '¡Copiado todo!' : 'Copiar todo'}
                </button>
              </div>

              {activeDebate.preguntas.map((pregunta, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-white p-3.5 border border-stone-200/90 shadow-2xs flex items-start justify-between gap-3 transition-colors hover:border-amber-400"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-extrabold text-amber-900">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-stone-900 leading-snug">
                      {pregunta}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyQuestion(pregunta, idx)}
                    aria-label={`Copiar pregunta ${idx + 1}`}
                    title="Copiar pregunta"
                    className="shrink-0 rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
