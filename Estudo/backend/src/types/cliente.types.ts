export interface ICliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface IClienteCriacaoDTO {
  nome: string;
  cpf: string;
  telefone?: string | null;
  email?: string | null;
}

export interface IClienteAtualizacaoDTO {
  nome?: string;
  telefone?: string | null;
  email?: string | null;
}

// Aliases para compatibilidade
export type Cliente = ICliente;
export type ClienteCriacaoDTO = IClienteCriacaoDTO;
export type ClienteAtualizacaoDTO = IClienteAtualizacaoDTO;
