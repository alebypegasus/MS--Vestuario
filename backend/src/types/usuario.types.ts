export type CargoUsuario = 'CAIXA' | 'GERENTE';

export interface IUsuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  cargo: CargoUsuario;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

export interface IUsuarioCriacaoDTO {
  nome: string;
  email: string;
  senha_hash: string;
  cargo: CargoUsuario;
}

export type IUsuarioRespostaDTO = Omit<IUsuario, 'senha_hash'>;

// Aliases para compatibilidade
export type Usuario = IUsuario;
export type UsuarioCriacaoDTO = IUsuarioCriacaoDTO;
export type UsuarioRespostaDTO = IUsuarioRespostaDTO;
