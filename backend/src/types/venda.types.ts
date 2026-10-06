import { IItemVendaComProduto, IItemVendaCriacaoDTO } from './item-venda.types';

export type FormaPagamento = 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'PIX';
export type StatusVenda = 'CONCLUIDA' | 'CANCELADA';

export interface IVenda {
  id: number;
  usuario_id: number; // Operador de caixa (1 Usuário : N Vendas)
  cliente_id: number | null; // Cliente vinculado ou NULL para Consumidor Final (RN-06)
  gerente_aprovador_id: number | null; // Gerente que autorizou alçada (RN-02 e RN-03)
  subtotal: number;
  desconto: number;
  valor_total: number;
  forma_pagamento: FormaPagamento;
  status: StatusVenda;
  motivo_cancelamento: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface IVendaCriacaoDTO {
  usuario_id: number;
  cliente_id?: number | null;
  gerente_aprovador_id?: number | null;
  desconto?: number;
  forma_pagamento: FormaPagamento;
  itens: IItemVendaCriacaoDTO[];
}

export interface IVendaCompleta extends IVenda {
  operador_nome?: string;
  cliente_nome?: string | null;
  cliente_cpf?: string | null;
  gerente_aprovador_nome?: string | null;
  itens: IItemVendaComProduto[];
}

// Aliases para compatibilidade
export type Venda = IVenda;
export type VendaCriacaoDTO = IVendaCriacaoDTO;
export type VendaCompleta = IVendaCompleta;
