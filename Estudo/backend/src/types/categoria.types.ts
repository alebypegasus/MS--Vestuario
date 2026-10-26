export interface ISubcategoria {
  id: number;
  categoria_id: number;
  nome: string;
  slug: string;
  descricao?: string | null;
  ativo: boolean;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}

export interface ICategoria {
  id: number;
  nome: string;
  slug: string;
  descricao?: string | null;
  icone?: string | null;
  cor?: string | null;
  ativo: boolean;
  subcategorias?: ISubcategoria[];
  total_produtos?: number;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}

export interface ICategoriaCriacaoDTO {
  nome: string;
  descricao?: string | null;
  icone?: string | null;
  cor?: string | null;
}

export interface ISubcategoriaCriacaoDTO {
  categoria_id: number;
  nome: string;
  descricao?: string | null;
}
