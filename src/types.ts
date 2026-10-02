/**
 * LeoClub - Tipos de datos principales
 * Código tipado para evitar inconsistencias de tipos o conversiones inesperadas.
 */

export interface DebateResult {
  resumen: string;
  tema_principal: string;
  preguntas: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  readPages: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  debate?: DebateResult;
}

export type TabFilter = 'leyendo' | 'terminados';
