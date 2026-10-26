// ============================================================================
// VALIDADOR E FORMATADOR DE CPF - ALGORITMO OFICIAL MÓDULO 11
// Conforme especificado na Validação de CPF para unicidade e consistência cadastral
// ============================================================================

export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function formatarCPF(cpf: string): string {
  const digits = limparCPF(cpf);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function validarCPF(cpf: string): boolean {
  const digits = limparCPF(cpf);

  if (digits.length !== 11) {
    return false;
  }

  // Bloqueia sequências de dígitos iguais repetidos (ex: 00000000000, 11111111111)
  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  // Cálculo do 1º Dígito Verificador (Módulo 11)
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(digits.charAt(i), 10) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digito1 = resto >= 10 ? 0 : resto;

  if (digito1 !== parseInt(digits.charAt(9), 10)) {
    return false;
  }

  // Cálculo do 2º Dígito Verificador (Módulo 11)
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(digits.charAt(i), 10) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digito2 = resto >= 10 ? 0 : resto;

  return digito2 === parseInt(digits.charAt(10), 10);
}
