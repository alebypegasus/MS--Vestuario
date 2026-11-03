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

export interface IFechamentoCriacaoDTO {
  fundo_inicial: number;
  dinheiro_informado: number;
  observacoes?: string;
}

export interface IResumoTurno {
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

export interface IFechamentoAuditoriaDTO {
  gerente_parecer: string;
}

export interface IFiltrosFechamento {
  usuario_id?: number;
  status_diferenca?: 'CORRETO' | 'FALTA' | 'SOBRA';
  data_inicio?: string;
  data_fim?: string;
}
