/**
 * Utilitários para higienização e validação oficial de CPF (Algoritmo Módulo 11)
 */

export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function formatarCPF(cpf: string): string {
  const limpo = limparCPF(cpf);
  if (limpo.length !== 11) return cpf;
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function validarCPF(cpf: string): boolean {
  const limpo = limparCPF(cpf);

  // Deve ter exatamente 11 dígitos
  if (limpo.length !== 11) return false;

  // Bloquear sequências de dígitos idênticos conhecidas (000.000.000-00, 111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(limpo)) return false;

  // Cálculo do 1º dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let dv1 = resto >= 10 ? 0 : resto;
  if (dv1 !== parseInt(limpo.charAt(9), 10)) return false;

  // Cálculo do 2º dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let dv2 = resto >= 10 ? 0 : resto;
  if (dv2 !== parseInt(limpo.charAt(10), 10)) return false;

  return true;
}
