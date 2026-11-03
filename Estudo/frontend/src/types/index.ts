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
  subcategoria?: string | null;
  tipo?: string | null;
  cores?: string[] | string | null;
  tamanhos?: string[] | string | null;
  detalhes?: string | null;
  imagens?: string[] | string | null;
  unidade_medida?: string | null;
  codigo_barras?: string | null;
  marca?: string | null;
  modelo?: string | null;
  variacoes?: any[] | string | null;
  garantia?: string | null;
  data_validade?: string | null;
  lote?: string | null;
  estoque: number;
  estoque_minimo?: number;
  preco_custo?: number;
  preco: number;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface IProdutoCriacaoDTO {
  codigo: string;
  descricao: string;
  categoria?: string | null;
  subcategoria?: string | null;
  tipo?: string | null;
  cores?: string[] | string | null;
  tamanhos?: string[] | string | null;
  detalhes?: string | null;
  imagens?: string[] | string | null;
  unidade_medida?: string | null;
  codigo_barras?: string | null;
  marca?: string | null;
  modelo?: string | null;
  variacoes?: any[] | string | null;
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
  cores?: string[] | string | null;
  tamanhos?: string[] | string | null;
  detalhes?: string | null;
  imagens?: string[] | string | null;
  unidade_medida?: string | null;
  codigo_barras?: string | null;
  marca?: string | null;
  modelo?: string | null;
  variacoes?: any[] | string | null;
  garantia?: string | null;
  data_validade?: string | null;
  lote?: string | null;
  estoque?: number;
  estoque_minimo?: number;
  preco_custo?: number;
  preco?: number;
  ativo?: boolean;
}

export interface IAgendaItem {
  id: number;
  titulo: string;
  tipo: 'meta' | 'evento' | 'estoque' | 'auditoria';
  data_evento: string;
  horario?: string | null;
  valor_meta?: number | null;
  descricao?: string | null;
  concluido: boolean;
  criado_em?: string;
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
  logo_url?: string | null;
  logo_texto?: string | null;
  favicon_url?: string | null;
  segmento?: string | null;
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
  logo_url?: string | null;
  logo_texto?: string | null;
  favicon_url?: string | null;
  segmento?: string | null;
}

// 7. Categorias & Subcategorias Dinâmicas Multi-Ramo
export interface ISubcategoria {
  id: number;
  categoria_id: number;
  nome: string;
  slug: string;
  descricao?: string | null;
  ativo: boolean;
}

export interface ICategoria {
  id: number;
  nome: string;
  slug: string;
  descricao?: string | null;
  icone?: string | null;
  cor?: string | null;
  ativo: boolean;
  total_produtos?: number;
  subcategorias?: ISubcategoria[];
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

// ============================================================================
// TIPAGEM DE FECHAMENTO E AUDITORIA DE CAIXA
// ============================================================================

export interface IFechamentoCaixa {
  id: number;
  usuario_id: number;
  usuario_nome: string;
  data_abertura: string;
  data_fechamento: string;
  fundo_inicial: number;
  total_vendas_dinheiro: number;
  total_vendas_pix: number;
  total_vendas_cartao_credito: number;
  total_vendas_cartao_debito: number;
  total_vendas_geral: number;
  quantidade_vendas: number;
  dinheiro_informado: number;
  saldo_esperado_dinheiro: number;
  diferenca: number;
  status_diferenca: 'CORRETO' | 'FALTA' | 'SOBRA';
  observacoes?: string | null;
  gerente_auditor_id?: number | null;
  gerente_auditor_nome?: string | null;
  gerente_parecer?: string | null;
  data_auditoria?: string | null;
  criado_em?: string;
}

export interface IResumoTurnoCaixa {
  usuario_id: number;
  usuario_nome: string;
  data_abertura_sugerida: string;
  fundo_inicial_padrao: number;
  quantidade_vendas: number;
  total_vendas_dinheiro: number;
  total_vendas_pix: number;
  total_vendas_cartao_credito: number;
  total_vendas_cartao_debito: number;
  total_vendas_geral: number;
  saldo_esperado_dinheiro: number;
}

export interface IFechamentoCriacaoDTO {
  fundo_inicial: number;
  dinheiro_informado: number;
  observacoes?: string;
}

export interface IEstatisticasFechamento {
  total_fechamentos: number;
  total_faltas: number;
  valor_total_faltas: number;
  total_sobras: number;
  valor_total_sobras: number;
  total_corretos: number;
  total_geral_movimentado: number;
}

export interface IFechamentosResposta {
  itens: IFechamentoCaixa[];
  estatisticas: IEstatisticasFechamento;
}
