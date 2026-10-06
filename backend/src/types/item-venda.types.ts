export interface IItemVenda {
  id: number;
  venda_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number; // Snapshot do preço histórico (RN-04)
  subtotal: number;
}

export interface IItemVendaCriacaoDTO {
  produto_id: number;
  quantidade: number;
}

export interface IItemVendaComProduto extends IItemVenda {
  codigo: string;
  descricao: string;
  categoria: string | null;
}

// Aliases para compatibilidade
export type ItemVenda = IItemVenda;
export type ItemVendaCriacaoDTO = IItemVendaCriacaoDTO;
export type ItemVendaComProduto = IItemVendaComProduto;
