import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Receipt,
  User,
  ShoppingBag,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { IUsuario, IVendaCompleta } from '../types';
import { formatarMoeda, formatarDataHora } from '../utils/formatters';
import { formatarCPF } from '../utils/cpf.validator';
import { exportarParaCSV, exportarParaExcel, exportarRelatorioPDF } from '../utils/exportUtils';
import { useToast } from '../contexts/ToastContext';
import { usuariosApi, vendasApi } from '../services/api';

interface RelatorioVendedoresModalProps {
  aberto?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  usuarios?: IUsuario[];
  vendas?: IVendaCompleta[];
  vendedorIdInicial?: number | null;
  onAbrirRecibo?: (venda: IVendaCompleta) => void;
  onVerRecibo?: (venda: IVendaCompleta) => void;
}

export const RelatorioVendedoresModal: React.FC<RelatorioVendedoresModalProps> = ({
  aberto,
  isOpen,
  onClose,
  usuarios: usuariosProp,
  vendas: vendasProp,
  vendedorIdInicial = null,
  onAbrirRecibo,
  onVerRecibo,
}) => {
  const { adicionarToast } = useToast();
  const modalAberto = aberto ?? isOpen ?? false;
  const abrirRecibo = onAbrirRecibo || onVerRecibo;

  const [usuarios, setUsuarios] = useState<IUsuario[]>(usuariosProp || []);
  const [vendas, setVendas] = useState<IVendaCompleta[]>(vendasProp || []);

  useEffect(() => {
    if (modalAberto) {
      if (!usuariosProp || usuariosProp.length === 0) {
        usuariosApi.listar().then(setUsuarios).catch(() => null);
      } else {
        setUsuarios(usuariosProp);
      }

      if (!vendasProp || vendasProp.length === 0) {
        vendasApi.listar().then(setVendas).catch(() => null);
      } else {
        setVendas(vendasProp);
      }
    }
  }, [modalAberto, usuariosProp, vendasProp]);

  const [vendedorSelecionadoId, setVendedorSelecionadoId] = useState<number | 'TODOS'>(
    vendedorIdInicial || 'TODOS'
  );

  useEffect(() => {
    if (vendedorIdInicial !== undefined && vendedorIdInicial !== null) {
      setVendedorSelecionadoId(vendedorIdInicial);
    }
  }, [vendedorIdInicial]);

  const [filtroPeriodo, setFiltroPeriodo] = useState<'HOJE' | 'SEMANA' | 'MES' | 'TODOS'>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<'TODAS' | 'CONCLUIDA' | 'CANCELADA'>('CONCLUIDA');
  const [buscaVenda, setBuscaVenda] = useState<string>('');
  const [vendaExpandidaId, setVendaExpandidaId] = useState<number | null>(null);

  if (!modalAberto) return null;

  // Filtragem de vendas por período de data
  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioSemana = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  const vendasPorPeriodo = vendas.filter((v) => {
    const dataVenda = new Date(v.criado_em);
    if (filtroPeriodo === 'HOJE') return dataVenda >= inicioHoje;
    if (filtroPeriodo === 'SEMANA') return dataVenda >= inicioSemana;
    if (filtroPeriodo === 'MES') return dataVenda >= inicioMes;
    return true;
  });

  // Agrupamento de métricas por vendedor
  interface IVendedorMetrica {
    usuario: IUsuario | { id: number; nome: string; email: string; cargo: string };
    totalVendas: number;
    faturamento: number;
    ticketMedio: number;
    descontos: number;
    pecasVendidas: number;
  }

  const rankingVendedores: IVendedorMetrica[] = usuarios.map((user) => {
    const vendasUser = vendasPorPeriodo.filter(
      (v) => v.usuario_id === user.id && v.status === 'CONCLUIDA'
    );
    const totalVendas = vendasUser.length;
    const faturamento = vendasUser.reduce((acc, v) => acc + Number(v.valor_total || 0), 0);
    const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0;
    const descontos = vendasUser.reduce((acc, v) => acc + Number(v.desconto || 0), 0);
    const pecasVendidas = vendasUser.reduce(
      (acc, v) => acc + (v.itens?.reduce((sub, i) => sub + i.quantidade, 0) || 0),
      0
    );

    return {
      usuario: user,
      totalVendas,
      faturamento,
      ticketMedio,
      descontos,
      pecasVendidas,
    };
  }).sort((a, b) => b.faturamento - a.faturamento);

  // Vendedor ativo no painel de detalhe
  const vendedorAtual =
    vendedorSelecionadoId !== 'TODOS'
      ? usuarios.find((u) => u.id === vendedorSelecionadoId) || null
      : null;

  // Vendas exibidas no detalhe
  const vendasFiltradas = vendasPorPeriodo.filter((v) => {
    const matchVendedor =
      vendedorSelecionadoId === 'TODOS' || v.usuario_id === vendedorSelecionadoId;
    const matchStatus = filtroStatus === 'TODAS' || v.status === filtroStatus;
    const termo = buscaVenda.toLowerCase();
    const matchBusca =
      !buscaVenda ||
      String(v.id).includes(termo) ||
      (v.cliente_nome && v.cliente_nome.toLowerCase().includes(termo)) ||
      (v.operador_nome && v.operador_nome.toLowerCase().includes(termo)) ||
      v.itens?.some((i) => i.descricao.toLowerCase().includes(termo));
    return matchVendedor && matchStatus && matchBusca;
  });

  // Métricas do escopo selecionado
  const totalFaturamentoExibido = vendasFiltradas
    .filter((v) => v.status === 'CONCLUIDA')
    .reduce((acc, v) => acc + Number(v.valor_total || 0), 0);
  const totalVendasExibidas = vendasFiltradas.filter((v) => v.status === 'CONCLUIDA').length;
  const ticketMedioExibido =
    totalVendasExibidas > 0 ? totalFaturamentoExibido / totalVendasExibidas : 0;

  // Exportação do Relatório do Vendedor
  const colunasExportacao = [
    'Venda #',
    'Data/Hora',
    'Vendedor/Operador',
    'Cliente',
    'Forma Pagamento',
    'Subtotal (R$)',
    'Desconto (R$)',
    'Total Líquido (R$)',
    'Status',
  ];

  const obterLinhasExportacao = () =>
    vendasFiltradas.map((v) => [
      `#${v.id}`,
      formatarDataHora(v.criado_em),
      v.operador_nome || `Operador #${v.usuario_id}`,
      v.cliente_nome ? `${v.cliente_nome} (${formatarCPF(v.cliente_cpf || '')})` : 'Consumidor Final',
      v.forma_pagamento,
      formatarMoeda(Number(v.subtotal)),
      formatarMoeda(Number(v.desconto)),
      formatarMoeda(Number(v.valor_total)),
      v.status,
    ]);

  const nomeArquivo = vendedorAtual
    ? `relatorio_vendas_${vendedorAtual.nome.toLowerCase().replace(/\s+/g, '_')}`
    : 'relatorio_geral_vendedores';

  const handleExportarExcel = () => {
    const linhas = obterLinhasExportacao();
    const totais = [
      { label: 'Total de Vendas Concluídas', valor: String(totalVendasExibidas) },
      { label: 'Faturamento Total Gerado', valor: formatarMoeda(totalFaturamentoExibido) },
      { label: 'Ticket Médio por Venda', valor: formatarMoeda(ticketMedioExibido) },
    ];
    exportarParaExcel(
      nomeArquivo,
      `Relatório de Vendas - ${vendedorAtual ? vendedorAtual.nome : 'Todos os Vendedores'}`,
      colunasExportacao,
      linhas,
      totais
    );
    adicionarToast('success', 'Excel Gerado!', 'Relatório de vendas exportado com sucesso.');
  };

  const handleExportarCSV = () => {
    exportarParaCSV(nomeArquivo, colunasExportacao, obterLinhasExportacao());
    adicionarToast('success', 'CSV Exportado!', 'Arquivo CSV gerado com sucesso.');
  };

  const handleExportarPDF = () => {
    const linhas = obterLinhasExportacao();
    const totais = [
      { label: 'Vendas Concluídas', valor: String(totalVendasExibidas) },
      { label: 'Faturamento Total', valor: formatarMoeda(totalFaturamentoExibido) },
      { label: 'Ticket Médio', valor: formatarMoeda(ticketMedioExibido) },
    ];
    exportarRelatorioPDF({
      titulo: 'Relatório de Desempenho de Vendas por Operador',
      subtitulo: `Escopo: ${vendedorAtual ? vendedorAtual.nome : 'Toda a Equipe'} • Período: ${filtroPeriodo}`,
      colunas: colunasExportacao,
      linhas,
      totais,
    });
    adicionarToast('info', 'Gerando PDF', 'Janela de impressão A4 aberta.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl glass-card border border-teal-500/30 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header do Relatório */}
        <div className="bg-gradient-to-r from-teal-500/15 via-indigo-500/15 to-transparent border-b border-teal-500/20 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white font-black flex items-center justify-center shadow-md shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                  Relatório de Vendedores & Produtividade
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
                  Desempenho Comercial
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Acompanhamento analítico de faturamento, ticket médio e histórico detalhado por colaborador
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportarPDF}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-all btn-interactive"
              title="Exportar Relatório em PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportarExcel}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-all btn-interactive"
              title="Exportar Planilha Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportarCSV}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-all btn-interactive"
              title="Exportar CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros de Período e Seleção de Vendedor */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Seletor de Período */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <span className="text-[11px] text-slate-400 px-2 font-normal">Período:</span>
              {[
                { id: 'HOJE', label: 'Hoje' },
                { id: 'SEMANA', label: 'Últimos 7 dias' },
                { id: 'MES', label: 'Este Mês' },
                { id: 'TODOS', label: 'Todo o Histórico' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFiltroPeriodo(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filtroPeriodo === p.id
                      ? 'bg-teal-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Filtro de Status das Vendas */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <span className="text-[11px] text-slate-400 px-2 font-normal">Status:</span>
              {(['CONCLUIDA', 'TODAS', 'CANCELADA'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFiltroStatus(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filtroStatus === st
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st === 'CONCLUIDA' ? 'Concluídas' : st === 'TODAS' ? 'Todas' : 'Canceladas'}
                </button>
              ))}
            </div>
          </div>

          {/* Carrossel de Seleção Rápida de Vendedores */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            <button
              onClick={() => setVendedorSelecionadoId('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-1.5 btn-interactive ${
                vendedorSelecionadoId === 'TODOS'
                  ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Toda a Equipe ({usuarios.length})</span>
            </button>

            {rankingVendedores.map((item) => {
              const isSel = vendedorSelecionadoId === item.usuario.id;
              return (
                <button
                  key={item.usuario.id}
                  onClick={() => setVendedorSelecionadoId(item.usuario.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2 btn-interactive ${
                    isSel
                      ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center text-[10px]">
                    {item.usuario.nome.charAt(0)}
                  </span>
                  <span>{item.usuario.nome}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSel ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatarMoeda(item.faturamento)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Métricas do Escopo Atual */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Faturamento ({vendedorAtual ? vendedorAtual.nome : 'Equipe'})
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {formatarMoeda(totalFaturamentoExibido)}
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Vendas Concluídas
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {totalVendasExibidas} vendas
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ticket Médio
              </span>
              <p className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                {formatarMoeda(ticketMedioExibido)}
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total de Itens Vendidos
              </span>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                {vendasFiltradas.reduce(
                  (acc, v) => acc + (v.itens?.reduce((s, i) => s + i.quantidade, 0) || 0),
                  0
                )}{' '}
                peças
              </p>
            </div>
          </div>

          <div className="relative mt-3">
            <input
              type="text"
              value={buscaVenda}
              onChange={(e) => setBuscaVenda(e.target.value)}
              placeholder="Pesquisar venda por ID, cliente, operador ou peça vendida..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Tabela Analítica de Vendas do Vendedor */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {vendasFiltradas.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">Nenhuma venda encontrada para os filtros aplicados.</p>
              <p className="text-xs text-slate-500">
                Tente selecionar outro período ou limpar a busca.
              </p>
            </div>
          ) : (
            vendasFiltradas.map((venda) => {
              const expandida = vendaExpandidaId === venda.id;
              return (
                <div
                  key={venda.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs hover:border-teal-500/40 transition-all"
                >
                  <div
                    onClick={() => setVendaExpandidaId(expandida ? null : venda.id)}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        #{venda.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                            Venda #{venda.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            • {venda.operador_nome || `Operador #${venda.usuario_id}`}
                          </span>
                          {venda.status === 'CONCLUIDA' ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Concluída
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/30">
                              <XCircle className="w-3 h-3" /> Cancelada
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                          <span>{formatarDataHora(venda.criado_em)}</span>
                          <span>•</span>
                          <span>
                            Cliente: {venda.cliente_nome ? `${venda.cliente_nome} (${formatarCPF(venda.cliente_cpf || '')})` : 'Consumidor Final'}
                          </span>
                          <span>•</span>
                          <span>Pagamento: {venda.forma_pagamento}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Total Líquido</span>
                        <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatarMoeda(Number(venda.valor_total))}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {abrirRecibo && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirRecibo(venda);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
                            title="Recibo / Cupom"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          {expandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Detalhe Expandido de Itens da Venda */}
                  {expandida && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 animate-in fade-in">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 uppercase font-bold text-[10px]">
                            <tr>
                              <th className="py-2 px-3">SKU</th>
                              <th className="py-2 px-3">Produto</th>
                              <th className="py-2 px-3 text-center">Qtd</th>
                              <th className="py-2 px-3 text-right">Preço Unit.</th>
                              <th className="py-2 px-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/60">
                            {venda.itens?.map((item, idx) => (
                              <tr key={idx}>
                                <td className="py-2 px-3 font-mono font-bold text-slate-600 dark:text-slate-300">
                                  #{item.codigo}
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                  {item.descricao}
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-bold">
                                  {item.quantidade}x
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                                  {formatarMoeda(Number(item.preco_unitario))}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {formatarMoeda(Number(item.subtotal))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 px-5 sm:px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {vendasFiltradas.length} vendas filtradas • Total líquido: {formatarMoeda(totalFaturamentoExibido)}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all btn-interactive"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
