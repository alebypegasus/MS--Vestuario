export interface IProduto {
  id: number;
  codigo: string;
  descricao: string;
  categoria: string | null;
  preco: number;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

export interface IProdutoCriacaoDTO {
  codigo: string;
  descricao: string;
  categoria?: string | null;
  preco: number;
}

export interface IProdutoAtualizacaoDTO {
  codigo?: string;
  descricao?: string;
  categoria?: string | null;
  preco?: number;
  ativo?: boolean;
}

// Aliases para compatibilidade
export type Produto = IProduto;
export type ProdutoCriacaoDTO = IProdutoCriacaoDTO;
export type ProdutoAtualizacaoDTO = IProdutoAtualizacaoDTO;
