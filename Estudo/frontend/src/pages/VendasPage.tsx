import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  AlertOctagon,
  Percent,
  RefreshCw,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  ShieldCheck,
  ChevronDown,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import { IVendaCompleta, IEmpresa } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { vendasApi, empresaApi } from '../services/api';
import { formatarMoeda, formatarDataHora } from '../utils/formatters';
import { formatarCPF } from '../utils/cpf.validator';
import { useToast } from '../contexts/ToastContext';
import { CancelSaleModal } from '../components/CancelSaleModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { NfceModal } from '../components/NfceModal';
import { HomologacaoModal } from '../components/HomologacaoModal';
import {
  exportarParaCSV,
  exportarParaExcel,
  exportarRelatorioPDF,
  exportarParaJSON,
} from '../utils/exportUtils';

export const VendasPage: React.FC = () => {
  const { adicionarToast } = useToast();
  const { isGerenteOuAdmin } = useAuth();

  const [vendas, setVendas] = useState<IVendaCompleta[]>([]);
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODAS');
  const [busca, setBusca] = useState<string>('');
  const [menuExportarAberto, setMenuExportarAberto] = useState<boolean>(false);

  // Modais
  const [vendaSelecionada, setVendaSelecionada] = useState<IVendaCompleta | null>(null);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState<boolean>(false);
  const [modalCancelarAberto, setModalCancelarAberto] = useState<boolean>(false);
  const [vendaParaCancelar, setVendaParaCancelar] = useState<IVendaCompleta | null>(null);
  const [modalNfceAberto, setModalNfceAberto] = useState<boolean>(false);
  const [vendaParaNfce, setVendaParaNfce] = useState<IVendaCompleta | null>(null);
  const [modalHomologacaoAberto, setModalHomologacaoAberto] = useState<boolean>(false);

  useEffect(() => {
    carregarVendas();
    carregarEmpresa();
  }, []);

  const carregarEmpresa = async () => {
    try {
      const dados = await empresaApi.obter();
      setEmpresa(dados);
    } catch {
      // Ignora erro se backend ainda não configurado
    }
  };

  const carregarVendas = async () => {
    try {
      setCarregando(true);
      const lista = await vendasApi.listar();
      setVendas(lista);
    } catch (err: any) {
      adicionarToast('error', 'Falha ao buscar vendas', err.message);
    } finally {
      setCarregando(false);
    }
  };

  const abrirDetalhes = (venda: IVendaCompleta) => {
    setVendaSelecionada(venda);
    setModalDetalhesAberto(true);
  };

  const abrirCancelar = (venda: IVendaCompleta) => {
    setVendaParaCancelar(venda);
    setModalCancelarAberto(true);
  };

  const abrirNfce = (venda: IVendaCompleta) => {
    setVendaParaNfce(venda);
    setModalNfceAberto(true);
  };

  const handleVendaCancelada = () => {
    setModalCancelarAberto(false);
    carregarVendas();
  };

  const handleDesfazerCancelamento = async (venda: IVendaCompleta) => {
    const confirmar = window.confirm(
      `Deseja realmente desfazer o cancelamento da Venda #${String(venda.id).padStart(5, '0')}?\n\nO pedido será restaurado para o status 'CONCLUÍDA' e os itens retornarão à baixa de estoque.`
    );
    if (!confirmar) return;

    try {
      await vendasApi.reativar(venda.id);
      adicionarToast(
        'success',
        'Cancelamento Desfeito!',
        `A venda #${venda.id} foi reativada e restaurada com sucesso.`
      );
      await carregarVendas();
    } catch (err: any) {
      adicionarToast(
        'error',
        'Erro ao Reativar Pedido',
        err.message || 'Não foi possível desfazer o cancelamento.'
      );
    }
  };

  const vendasFiltradas = vendas.filter((v) => {
    const matchStatus = filtroStatus === 'TODAS' || v.status === filtroStatus;
    const termo = busca.toLowerCase();
    const matchBusca =
      !busca ||
      String(v.id).includes(termo) ||
      (v.operador_nome && v.operador_nome.toLowerCase().includes(termo)) ||
      (v.cliente_nome && v.cliente_nome.toLowerCase().includes(termo)) ||
      (v.cliente_cpf && v.cliente_cpf.includes(termo));
    return matchStatus && matchBusca;
  });

  // Métricas para o Bento Grid
  const totalVendas = vendas.length;
  const vendasConcluidas = vendas.filter((v) => v.status === 'CONCLUIDA');
  const vendasCanceladas = vendas.filter((v) => v.status === 'CANCELADA');
  const faturamentoTotal = vendasConcluidas.reduce((acc, v) => acc + Number(v.valor_total || 0), 0);
  const totalDescontos = vendasConcluidas.reduce((acc, v) => acc + Number(v.desconto || 0), 0);
  const alcadasAcionadas = vendasConcluidas.filter(
    (v) => Number(v.desconto || 0) > 0 && v.gerente_aprovador_nome
  ).length;

  // Handlers de Exportação
  const obterLinhasExportacao = () => {
    return vendasFiltradas.map((v) => [
      `#${String(v.id).padStart(5, '0')}`,
      formatarDataHora(v.criado_em),
      v.operador_nome || `#${v.usuario_id}`,
      v.cliente_nome || 'Consumidor Final',
      v.cliente_cpf ? formatarCPF(v.cliente_cpf) : 'Não Informado',
      formatarMoeda(Number(v.subtotal)),
      formatarMoeda(Number(v.desconto)),
      formatarMoeda(Number(v.valor_total)),
      v.forma_pagamento,
      v.status === 'CONCLUIDA' ? 'Concluída' : 'Cancelada',
      v.gerente_aprovador_nome || 'N/A',
    ]);
  };

  const colunasExportacao = [
    'ID Venda',
    'Data/Hora',
    'Operador',
    'Cliente (RN-06)',
    'CPF Cliente',
    'Subtotal (R$)',
    'Desconto (R$)',
    'Total Líquido (R$)',
    'Forma Pagamento',
    'Status',
    'Alçada Gerente (RN-02)',
  ];

  const handleExportarExcel = () => {
    setMenuExportarAberto(false);
    const linhas = obterLinhasExportacao();
    const totais = [
      { label: 'Total de Vendas Listadas', valor: String(vendasFiltradas.length) },
      { label: 'Faturamento Total Líquido', valor: formatarMoeda(faturamentoTotal) },
      { label: 'Total de Descontos Concedidos', valor: formatarMoeda(totalDescontos) },
    ];
    exportarParaExcel('relatorio_vendas_ms2', 'Relatório de Auditoria de Vendas & PDV', colunasExportacao, linhas, totais);
    adicionarToast('success', 'Excel Gerado!', 'Planilha formatada baixada com sucesso.');
  };

  const handleExportarCSV = () => {
    setMenuExportarAberto(false);
    const linhas = obterLinhasExportacao();
    exportarParaCSV('relatorio_vendas_ms2', colunasExportacao, linhas);
    adicionarToast('success', 'CSV Exportado!', 'Arquivo CSV (UTF-8 com BOM) baixado.');
  };

  const handleExportarPDF = () => {
    setMenuExportarAberto(false);
    const linhas = obterLinhasExportacao();
    const totais = [
      { label: 'Vendas Filtradas', valor: String(vendasFiltradas.length) },
      { label: 'Descontos Totais', valor: formatarMoeda(totalDescontos) },
      { label: 'Total Faturamento Líquido', valor: formatarMoeda(faturamentoTotal) },
    ];
    exportarRelatorioPDF({
      titulo: 'Relatório de Auditoria de Vendas & PDV',
      subtitulo: `Filtro aplicado: ${filtroStatus} • Período Atual • Sistema Homologado`,
      colunas: colunasExportacao.slice(0, 9),
      linhas: linhas.map((l) => l.slice(0, 9)),
      totais,
      empresa: empresa || undefined,
    });
    adicionarToast('info', 'Gerando PDF', 'Janela de impressão e exportação A4 aberta.');
  };

  const handleExportarJSON = () => {
    setMenuExportarAberto(false);
    exportarParaJSON('auditoria_fiscal_vendas_ms2', {
      empresa,
      data_extracao: new Date().toISOString(),
      total_registros: vendasFiltradas.length,
      faturamento_total: faturamentoTotal,
      vendas: vendasFiltradas,
    });
    adicionarToast('success', 'JSON Fiscal Gerado', 'Arquivo JSON de auditoria baixado.');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-8">
      {/* Header Bento */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm border border-amber-500/20">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Histórico & Auditoria de Vendas</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                  {vendas.length} Registros
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rastreabilidade de operadores, preços históricos (RN-04) e alçadas (RN-02 e RN-03)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Botão Dossiê de Homologação */}
          <button
            onClick={() => setModalHomologacaoAberto(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-2 transition-all btn-interactive shadow-xs"
            title="Abrir Dossiê de Homologação do Sistema"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Homologação Fiscal</span>
          </button>

          {/* Menu Dropdown de Exportação */}
          <div className="relative">
            <button
              onClick={() => setMenuExportarAberto(!menuExportarAberto)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-2 transition-all btn-interactive"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Relatórios</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {menuExportarAberto && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-30 animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Formatos Disponíveis
                </div>
                <button
                  onClick={handleExportarExcel}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Planilha Excel (.xlsx / .xls)</span>
                </button>
                <button
                  onClick={handleExportarPDF}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Relatório PDF (A4 Executivo)</span>
                </button>
                <button
                  onClick={handleExportarCSV}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                  <span>Arquivo CSV (UTF-8 com BOM)</span>
                </button>
                <button
                  onClick={handleExportarJSON}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileCode className="w-4 h-4 text-amber-500" />
                  <span>Auditoria Fiscal (JSON)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={carregarVendas}
            disabled={carregando}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 transition-all btn-interactive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin text-amber-500' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Bento Grid: Cards de Métricas em Tela Inteira */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Bento 1: Faturamento Líquido */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Faturamento Concluído
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {formatarMoeda(faturamentoTotal)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{vendasConcluidas.length} vendas liquidadas com sucesso</span>
          </div>
        </div>

        {/* Bento 2: Total de Vendas */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total de Vendas
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {totalVendas}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {vendasConcluidas.length} concluídas • {vendasCanceladas.length} canceladas
          </div>
        </div>

        {/* Bento 3: Cancelamentos (RN-03) */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Canceladas (RN-03)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {vendasCanceladas.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {totalVendas > 0 ? ((vendasCanceladas.length / totalVendas) * 100).toFixed(1) : 0}% de cancelamentos com alçada
          </div>
        </div>

        {/* Bento 4: Descontos & Alçadas */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Descontos Concedidos
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {formatarMoeda(totalDescontos)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {alcadasAcionadas} vendas com alçada gerencial (RN-02)
          </div>
        </div>
      </div>

      {/* Bento Grid: Barra de Filtros e Busca de Tela Inteira */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por ID, operador, cliente ou CPF..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs placeholder-slate-400 dark:placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-full md:w-auto overflow-x-auto justify-start md:justify-end">
          {['TODAS', 'CONCLUIDA', 'CANCELADA'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all btn-interactive ${
                filtroStatus === st
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'TODAS'
                ? `Todas (${vendas.length})`
                : st === 'CONCLUIDA'
                ? `Concluídas (${vendasConcluidas.length})`
                : `Canceladas (${vendasCanceladas.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Vendas Desktop (>= lg) */}
      <div className="hidden lg:block glass-card rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">ID Venda</th>
                <th className="py-3.5 px-4">Data/Hora</th>
                <th className="py-3.5 px-4">Operador</th>
                <th className="py-3.5 px-4">Cliente (RN-06)</th>
                <th className="py-3.5 px-4 text-right">Subtotal</th>
                <th className="py-3.5 px-4 text-right">Desconto</th>
                <th className="py-3.5 px-4 text-right">Total Líquido</th>
                <th className="py-3.5 px-4">Pagamento</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {carregando ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    Carregando histórico de vendas...
                  </td>
                </tr>
              ) : vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500">
                    Nenhuma venda encontrada com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                vendasFiltradas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      #{String(v.id).padStart(5, '0')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {formatarDataHora(v.criado_em)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-bold">
                      {v.operador_nome || `#${v.usuario_id}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {v.cliente_nome ? (
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{v.cliente_nome}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {formatarCPF(v.cliente_cpf || '')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">Consumidor Final</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300 font-mono">
                      {formatarMoeda(Number(v.subtotal))}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {Number(v.desconto) > 0 ? (
                        <div>
                          <span className="text-rose-500 dark:text-rose-400 font-bold font-mono">
                            -{formatarMoeda(Number(v.desconto))}
                          </span>
                          {v.gerente_aprovador_nome && (
                            <span
                              className="block text-[9px] text-amber-600 dark:text-amber-400 font-bold"
                              title={`Aprovado por ${v.gerente_aprovador_nome}`}
                            >
                              ★ Alçada RN-02
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                      {formatarMoeda(Number(v.valor_total))}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {v.forma_pagamento}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {v.status === 'CONCLUIDA' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Concluída
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 dark:text-rose-400"
                          title={v.motivo_cancelamento || ''}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancelada
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => abrirDetalhes(v)}
                          title="Visualizar Comprovante & Itens Históricos"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors btn-interactive"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {v.status === 'CONCLUIDA' && (
                          <button
                            onClick={() => abrirNfce(v)}
                            title="DANFE NFC-e / SAT (Modelo 65 - SEFAZ)"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors btn-interactive"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {v.status === 'CONCLUIDA' && (
                          <button
                            onClick={() => abrirCancelar(v)}
                            title="Cancelar Venda com Alçada (RN-03)"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/60 hover:border-rose-400 dark:hover:border-rose-500/40 transition-colors btn-interactive"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {v.status === 'CANCELADA' && isGerenteOuAdmin && (
                          <button
                            onClick={() => handleDesfazerCancelamento(v)}
                            title="Desfazer Cancelamento (Reativar Pedido)"
                            className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors btn-interactive"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Desfazer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualização em Cards para Mobile e Tablet (< lg) */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {carregando ? (
          <div className="col-span-full py-16 text-center text-slate-400">Carregando histórico de vendas...</div>
        ) : vendasFiltradas.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">Nenhuma venda localizada.</div>
        ) : (
          vendasFiltradas.map((v) => (
            <div
              key={v.id}
              className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                  Venda #{String(v.id).padStart(5, '0')}
                </span>
                {v.status === 'CONCLUIDA' ? (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Concluída
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Cancelada
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Data/Hora:</span>
                  <span className="font-mono">{formatarDataHora(v.criado_em)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Operador:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{v.operador_nome || `#${v.usuario_id}`}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Cliente:</span>
                  <span className="font-semibold">{v.cliente_nome || 'Consumidor Final'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Pagamento:</span>
                  <span className="font-bold uppercase">{v.forma_pagamento}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Líquido</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatarMoeda(Number(v.valor_total))}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => abrirDetalhes(v)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </button>
                  {v.status === 'CONCLUIDA' && (
                    <button
                      onClick={() => abrirNfce(v)}
                      title="NFC-e / SAT"
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-xs font-semibold flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>NFC-e</span>
                    </button>
                  )}
                  {v.status === 'CONCLUIDA' && (
                    <button
                      onClick={() => abrirCancelar(v)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold flex items-center gap-1"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  )}
                  {v.status === 'CANCELADA' && isGerenteOuAdmin && (
                    <button
                      onClick={() => handleDesfazerCancelamento(v)}
                      className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Desfazer Cancelamento</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes / Comprovante da Venda */}
      <ReceiptModal
        aberto={modalDetalhesAberto}
        venda={vendaSelecionada}
        onFechar={() => setModalDetalhesAberto(false)}
      />

      {/* Modal de Cancelamento de Venda (RN-03) */}
      <CancelSaleModal
        aberto={modalCancelarAberto}
        venda={vendaParaCancelar}
        onConfirmado={handleVendaCancelada}
        onFechar={() => setModalCancelarAberto(false)}
      />

      {/* Modal Fiscal DANFE NFC-e / SAT */}
      <NfceModal
        aberto={modalNfceAberto}
        venda={vendaParaNfce}
        onFechar={() => setModalNfceAberto(false)}
      />

      {/* Modal do Dossiê de Homologação */}
      <HomologacaoModal
        aberto={modalHomologacaoAberto}
        onFechar={() => setModalHomologacaoAberto(false)}
      />
    </div>
  );
};
