import { ItemVendaComProduto, ItemVendaCriacaoDTO } from './item-venda.types';

export type FormaPagamento = 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'PIX';
export type StatusVenda = 'CONCLUIDA' | 'CANCELADA';

export interface Venda {
  id: number;
  usuario_id: number; // Caixa que registrou a venda (Relação 1:N)
  cliente_id: number | null; // Cliente vinculado ou NULL para Consumidor Final (RN-06)
  gerente_aprovador_id: number | null; // Gerente que autorizou desconto > 10% ou cancelamento
  subtotal: number;
  desconto: number;
  valor_total: number;
  forma_pagamento: FormaPagamento;
  status: StatusVenda;
  motivo_cancelamento: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface VendaCriacaoDTO {
  usuario_id: number;
  cliente_id?: number | null;
  gerente_aprovador_id?: number | null;
  desconto?: number;
  forma_pagamento: FormaPagamento;
  itens: ItemVendaCriacaoDTO[];
}

export interface VendaCompleta extends Venda {
  operador_nome?: string;
  cliente_nome?: string | null;
  cliente_cpf?: string | null;
  gerente_aprovador_nome?: string | null;
  itens: ItemVendaComProduto[];
}
