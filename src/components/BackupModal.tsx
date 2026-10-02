import React, { useRef, useState } from 'react';
import { Book } from '../types';
import {
  exportBooksToJSON,
  importBooksFromJSON,
  clearAllBooks,
  DEFAULT_SAMPLE_BOOKS,
  STORAGE_KEY
} from '../utils/storage';
import {
  X,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onReloadBooks: (books: Book[]) => void;
  showToast: (msg: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  books,
  onReloadBooks,
  showToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportBooksToJSON(books);
    showToast('Archivo JSON de respaldo descargado.');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importBooksFromJSON(file);
      onReloadBooks(imported);
      showToast(`Se restauraron ${imported.length} libros correctamente.`);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Error al importar archivo.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetDefaults = () => {
    clearAllBooks();
    onReloadBooks(DEFAULT_SAMPLE_BOOKS);
    showToast('Datos reiniciados con los libros de ejemplo.');
    setConfirmClear(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-stone-900/10 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-stone-100 p-2 text-stone-800">
              <HardDrive className="h-5 w-5" />
            </div>
            <h2 id="backup-modal-title" className="text-xl font-bold text-stone-900">
              Memoria y Respaldo (M2)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de respaldo"
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Explicación didáctica transparente solicitada en M2 */}
        <div className="mt-4 space-y-3 rounded-xl bg-amber-50/60 p-4 text-xs text-stone-800 border border-amber-200/70">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-900 text-sm">¿Dónde se guardan tus lecturas?</p>
              <p className="mt-0.5 text-stone-700">
                Se guardan de forma privada en el almacenamiento local (<code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-stone-900">localStorage['{STORAGE_KEY}']</code>) de este navegador. Sin cuentas ni servidores intermedios.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2 border-t border-amber-200/50">
            <AlertCircle className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-900 text-sm">¿Qué pasa si borras el caché?</p>
              <p className="mt-0.5 text-stone-700">
                Limpiar el <strong>caché de imágenes o páginas</strong> no borra tus libros. Pero si eliges <em>"Borrar datos de sitios y cookies"</em> o navegas de incógnito, se perderán. Por eso te recomendamos exportar un respaldo periódico.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="mt-5 space-y-3">
          {/* Exportar JSON */}
          <button
            type="button"
            onClick={handleExport}
            className="w-full flex items-center justify-between rounded-xl border border-stone-300 bg-white p-3.5 text-stone-800 hover:bg-stone-50 font-semibold text-sm shadow-2xs transition-colors min-h-[48px]"
          >
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4 text-stone-700" />
              Exportar lecturas a archivo JSON
            </span>
            <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600 font-mono">
              .json
            </span>
          </button>

          {/* Importar JSON */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between rounded-xl border border-stone-300 bg-white p-3.5 text-stone-800 hover:bg-stone-50 font-semibold text-sm shadow-2xs transition-colors min-h-[48px]"
          >
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-stone-700" />
              Restaurar libros desde JSON
            </span>
            <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
              Subir
            </span>
          </button>

          {/* Reiniciar datos */}
          {confirmClear ? (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3 space-y-2">
              <p className="text-xs font-bold text-red-900">
                ¿Seguro que deseas restablecer los libros de muestra? Se borrarán las lecturas añadidas que no hayas exportado.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 min-h-[36px]"
                >
                  Sí, reiniciar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded-lg bg-white border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 min-h-[36px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center gap-2 rounded-xl p-3 text-stone-500 hover:text-red-700 hover:bg-stone-50 text-xs font-semibold transition-colors min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4" />
              Restablecer libros de ejemplo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
