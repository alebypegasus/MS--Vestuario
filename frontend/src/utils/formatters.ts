// ============================================================================
// FORMATADORES E HELPERS DE APRESENTAÇÃO VISUAL
// ============================================================================

import { CargoUsuario } from '../types';

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

export function formatarDataHora(dataIso?: string | Date): string {
  if (!dataIso) return '-';
  const data = new Date(dataIso);
  if (isNaN(data.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

export function formatarTelefone(telefone?: string | null): string {
  if (!telefone) return '-';
  const digits = telefone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return telefone;
}

export function getRoleBadgeConfig(cargo: CargoUsuario): { label: string; badgeClass: string } {
  switch (cargo) {
    case 'ADMIN':
      return {
        label: 'Administrador',
        badgeClass: 'bg-purple-950/80 text-purple-300 border border-purple-500/30',
      };
    case 'GERENTE':
      return {
        label: 'Gerente',
        badgeClass: 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30',
      };
    case 'CAIXA':
      return {
        label: 'Operador de Caixa',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30',
      };
    default:
      return {
        label: cargo,
        badgeClass: 'bg-slate-800 text-slate-300 border border-slate-600',
      };
  }
}
