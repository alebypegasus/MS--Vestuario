// ============================================================================
// TIPAGEM OFICIAL DO FRONTEND - MS² VESTUÁRIO
// Todos os contratos e interfaces seguem estritamente a notação húngara 'I'
// ============================================================================

export type CargoUsuario = 'ADMIN' | 'GERENTE' | 'CAIXA';

export interface IUsuario {
  id: number;
  nome: string;
  email: string;
  cargo: CargoUsuario;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface IUsuarioLoginDTO {
  email: string;
  senha: string;
}

export interface IUsuarioRespostaLogin {
  token: string;
  usuario: IUsuario;
}

export interface IUsuarioCriacaoDTO {
  nome: string;
  email: string;
  senha: string;
  cargo: CargoUsuario;
}

export interface IUsuarioAtualizacaoDTO {
  nome?: string;
  email?: string;
  senha?: string;
  cargo?: CargoUsuario;
  ativo?: boolean;
}

export interface ICliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  criado_em?: string;
  atualizado_em?: string;
}

export interface IClienteCriacaoDTO {
  nome: string;
  cpf: string;
  telefone?: string | null;
  email?: string | null;
}

export interface IClienteAtualizacaoDTO {
  nome?: string;
  telefone?: string | null;
  email?: string | null;
}

export interface IProduto {
  id: number;
  codigo: string;
  descricao: string;
  categoria: string | null;
  preco: number;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
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

export interface IVenda {
  id: number;
  usuario_id: number;
  cliente_id: number | null;
  gerente_aprovador_id: number | null;
  subtotal: number;
  desconto: number;
  valor_total: number;
  forma_pagamento: FormaPagamento;
  detalhes_pagamento?: IDetalhesPagamento | null;
  status: StatusVenda;
  motivo_cancelamento: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface IVendaCriacaoDTO {
  cliente_id?: number | null;
  gerente_aprovador_id?: number | null;
  desconto?: number;
  forma_pagamento: FormaPagamento;
  detalhes_pagamento?: IDetalhesPagamento | null;
  itens: IItemVendaCriacaoDTO[];
}

export interface IVendaCompleta extends IVenda {
  operador_nome?: string;
  cliente_nome?: string | null;
  cliente_cpf?: string | null;
  gerente_aprovador_nome?: string | null;
  itens: IItemVendaComProduto[];
}

// Modelos específicos do Carrinho no PDV
export interface ICarrinhoItem {
  produto: IProduto;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface IGerenteValidacaoResposta {
  valido: boolean;
  gerente_id: number;
  gerente_nome: string;
}

export interface IEmpresa {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual: string | null;
  telefone: string | null;
  email: string | null;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  regime_tributario: string | null;
  mensagem_cupom: string | null;
  atualizado_em?: string;
}

export interface IEmpresaAtualizacaoDTO {
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_estadual?: string | null;
  telefone?: string | null;
  email?: string | null;
  logradouro?: string;
  numero?: string;
  complemento?: string | null;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  regime_tributario?: string | null;
  mensagem_cupom?: string | null;
}
