export interface IProduto {
  id: number;
  codigo: string;
  descricao: string;
  categoria: string | null;
  subcategoria?: string | null;
  tipo?: string | null;
  cores?: string | string[] | null;
  tamanhos?: string | string[] | null;
  detalhes?: string | null;
  imagens?: string | string[] | null;
  unidade_medida?: string | null;
  codigo_barras?: string | null;
  marca?: string | null;
  modelo?: string | null;
  variacoes?: string | any[] | null;
  garantia?: string | null;
  data_validade?: string | null;
  lote?: string | null;
  estoque: number;
  estoque_minimo?: number;
  preco_custo?: number;
  preco: number;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

export interface IProdutoCriacaoDTO {
  codigo: string;
  descricao: string;
  categoria?: string | null;
  subcategoria?: string | null;
  tipo?: string | null;
  cores?: string | string[] | null;
  tamanhos?: string | string[] | null;
  detalhes?: string | null;
  imagens?: string | string[] | null;
  unidade_medida?: string | null;
  codigo_barras?: string | null;
  marca?: string | null;
  modelo?: string | null;
  variacoes?: string | any[] | null;
  garantia?: string | null;
  data_validade?: string | null;
  lote?: string | null;
  estoque?: number;
  estoque_minimo?: number;
  preco_custo?: number;
  preco: number;
}

export interface IProdutoAtualizacaoDTO {
  codigo?: string;
  descricao?: string;
  categoria?: string | null;
  subcategoria?: string | null;
  tipo?: string | null;
  cores?: string | string[] | null;
  tamanhos?: string | string[] | null;
  detalhes?: string | null;
  imagens?: string | string[] | null;
  unidade_medida?: string | null;
  codigo_barras?: string | null;
  marca?: string | null;
  modelo?: string | null;
  variacoes?: string | any[] | null;
  garantia?: string | null;
  data_validade?: string | null;
  lote?: string | null;
  estoque?: number;
  estoque_minimo?: number;
  preco_custo?: number;
  preco?: number;
  ativo?: boolean;
}

// Aliases para compatibilidade
export type Produto = IProduto;
export type ProdutoCriacaoDTO = IProdutoCriacaoDTO;
export type ProdutoAtualizacaoDTO = IProdutoAtualizacaoDTO;
