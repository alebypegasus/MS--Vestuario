export type CargoUsuario = 'CAIXA' | 'GERENTE';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  cargo: CargoUsuario;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

export interface UsuarioCriacaoDTO {
  nome: string;
  email: string;
  senha_hash: string;
  cargo: CargoUsuario;
}

export type UsuarioRespostaDTO = Omit<Usuario, 'senha_hash'>;
