import { IItemVendaComProduto, IItemVendaCriacaoDTO } from './item-venda.types';

export type FormaPagamento = 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'PIX';
export type StatusVenda = 'CONCLUIDA' | 'CANCELADA';

export interface IDetalhesPagamento {
  metodo_principal?: FormaPagamento;
  bandeira?: string;
  parcelas?: number;
  valor_parcela?: number;
  autorizacao_nsu?: string;
  valor_entregue?: number;
  troco?: number;
  chave_pix?: string;
  txid_pix?: string;
  pagamento_dividido?: boolean;
  parcelamentos_multiplos?: {
    metodo: FormaPagamento;
    valor: number;
    detalhe?: string;
  }[];
}

export interface IVenda {
  id: number;
  usuario_id: number; // Operador de caixa (1 Usuário : N Vendas)
  cliente_id: number | null; // Cliente vinculado ou NULL para Consumidor Final (Fidelização de Clientes)
  gerente_aprovador_id: number | null; // Gerente que autorizou alçada (Alçada Gerencial e Estorno Auditado)
  subtotal: number;
  desconto: number;
  valor_total: number;
  forma_pagamento: FormaPagamento;
  detalhes_pagamento?: string | IDetalhesPagamento | null;
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
  detalhes_pagamento?: string | IDetalhesPagamento | null;
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
