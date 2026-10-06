export interface ItemVenda {
  id: number;
  venda_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number; // Snapshot do preço histórico
  subtotal: number;
}

export interface ItemVendaCriacaoDTO {
  produto_id: number;
  quantidade: number;
}

export interface ItemVendaComProduto extends ItemVenda {
  codigo: string;
  descricao: string;
  categoria: string | null;
}
