export interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  categoria: string | null;
  preco: number;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

export interface ProdutoCriacaoDTO {
  codigo: string;
  descricao: string;
  categoria?: string | null;
  preco: number;
}

export interface ProdutoAtualizacaoDTO {
  codigo?: string;
  descricao?: string;
  categoria?: string | null;
  preco?: number;
  ativo?: boolean;
}
