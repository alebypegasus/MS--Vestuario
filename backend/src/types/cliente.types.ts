export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface ClienteCriacaoDTO {
  nome: string;
  cpf: string;
  telefone?: string | null;
  email?: string | null;
}

export interface ClienteAtualizacaoDTO {
  nome?: string;
  telefone?: string | null;
  email?: string | null;
}
