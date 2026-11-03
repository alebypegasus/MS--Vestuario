import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Search,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { caixaApi } from '../services/api';
import { IFechamentoCaixa, IEstatisticasFechamento } from '../types';
import { formatarMoeda } from '../utils/formatters';

interface IAuditoriaFechamentosModalProps {
  aberto: boolean;
  onFechar: () => void;
}

export const AuditoriaFechamentosModal: React.FC<IAuditoriaFechamentosModalProps> = ({
  aberto,
  onFechar
}) => {
  const { isGerenteOuAdmin } = useAuth();
  const { adicionarToast } = useToast();

  const [carregando, setCarregando] = useState<boolean>(true);
  const [fechamentos, setFechamentos] = useState<IFechamentoCaixa[]>([]);
  const [estatisticas, setEstatisticas] = useState<IEstatisticasFechamento | null>(null);

  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [buscaVendedor, setBuscaVendedor] = useState<string>('');

  // Modal interno de parecer gerencial
  const [itemSelecionado, setItemSelecionado] = useState<IFechamentoCaixa | null>(null);
  const [parecerTexto, setParecerTexto] = useState<string>('');
  const [salvandoParecer, setSalvandoParecer] = useState<boolean>(false);

  const carregarDados = () => {
    setCarregando(true);
    const filtrosApi: any = {};
    if (filtroStatus !== 'todos') {
      filtrosApi.status = filtroStatus;
    }

    caixaApi
      .listarFechamentos(filtrosApi)
      .then((res) => {
        setFechamentos(res.itens || []);
        setEstatisticas(res.estatisticas || null);
      })
      .catch((err) => {
        adicionarToast('error', 'Falha ao listar fechamentos', err.message || 'Erro de comunicação');
      })
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    if (aberto) {
      carregarDados();
    }
  }, [aberto, filtroStatus]);

  if (!aberto) return null;

  // Filtragem local por vendedor
  const itensFiltrados = fechamentos.filter((item) => {
    if (!buscaVendedor) return true;
    return item.usuario_nome.toLowerCase().includes(buscaVendedor.toLowerCase());
  });

  const abrirAuditoriaItem = (item: IFechamentoCaixa) => {
    setItemSelecionado(item);
    setParecerTexto(item.gerente_parecer || '');
  };

  const salvarParecerGerencial = async () => {
    if (!itemSelecionado) return;
    if (parecerTexto.trim().length < 3) {
      adicionarToast('warning', 'Parecer Vazio', 'Escreva uma observação de auditoria formal.');
      return;
    }

    try {
      setSalvandoParecer(true);
      const res = await caixaApi.auditarFechamento(itemSelecionado.id, parecerTexto.trim());
      adicionarToast('success', 'Auditoria Registrada', 'Visto gerencial gravado com sucesso.');

      // Atualiza na lista local
      setFechamentos((prev) =>
        prev.map((f) => (f.id === itemSelecionado.id ? res.fechamento : f))
      );
      setItemSelecionado(null);
    } catch (err: any) {
      adicionarToast('error', 'Falha ao auditar', err.message || 'Erro ao registrar.');
    } finally {
      setSalvandoParecer(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* CABEÇALHO */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Auditoria & Fechamentos de Caixa</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  Gerência & Administração
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhamento em tempo real de caixas operados, divergências e conferência física de gaveta
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO DO PAINEL */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* CARDS DE INDICADORES / METRICAS GERAIS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Fechamentos Registrados
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {estatisticas?.total_fechamentos || 0}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {estatisticas?.total_corretos || 0} sem divergência
              </span>
            </div>

            {/* CARD DE FALTAS DE DINHEIRO (DESTAQUE EM VERMELHO SE HOUVER FALTA) */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                (estatisticas?.total_faltas || 0) > 0
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-200'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                  Faltas no Caixa (Prejuízo)
                </span>
                {(estatisticas?.total_faltas || 0) > 0 && (
                  <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                )}
              </div>
              <span className="text-xl font-black font-mono">
                {(estatisticas?.total_faltas || 0) > 0
                  ? `- ${formatarMoeda(estatisticas?.valor_total_faltas || 0)}`
                  : 'R$ 0,00'}
              </span>
              <span className="text-[10px] block mt-1 opacity-80">
                {estatisticas?.total_faltas || 0} fechamento(s) com falta
              </span>
            </div>

            {/* CARD DE SOBRAS */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Sobras de Gaveta (Excedente)
              </span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                + {formatarMoeda(estatisticas?.valor_total_sobras || 0)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {estatisticas?.total_sobras || 0} fechamento(s) com sobra
              </span>
            </div>

            {/* TOTAL MOVIMENTADO */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Geral Movimentado
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatarMoeda(estatisticas?.total_geral_movimentado || 0)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Dinheiro, PIX e Cartões somados
              </span>
            </div>
          </div>

          {/* FILTROS E BUSCA */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {/* Abas Rápidas de Status */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'FALTA', label: 'Com Falta de Dinheiro' },
                { id: 'SOBRA', label: 'Com Sobra' },
                { id: 'CORRETO', label: 'Caixas que Bateram' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFiltroStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    filtroStatus === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Busca por Vendedor */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar vendedor (Ana, Lucas...)"
                value={buscaVendedor}
                onChange={(e) => setBuscaVendedor(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* TABELA DE FECHAMENTOS */}
          {carregando ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
              Carregando dados da auditoria...
            </div>
          ) : itensFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Receipt className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p className="text-sm font-semibold">Nenhum fechamento encontrado com os filtros selecionados.</p>
              <p className="text-xs text-slate-400">
                Os fechamentos são registrados pelos vendedores através da opção "Fechar Caixa" no PDV.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">ID / Data</th>
                      <th className="py-3 px-3.5">Vendedor (Caixa)</th>
                      <th className="py-3 px-3.5">Vendas Turno</th>
                      <th className="py-3 px-3.5">Fundo / Dinheiro</th>
                      <th className="py-3 px-3.5">Gaveta Declarada</th>
                      <th className="py-3 px-3.5">Divergência</th>
                      <th className="py-3 px-3.5">Auditoria Gerencial</th>
                      <th className="py-3 px-3.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-300">
                    {itensFiltrados.map((item) => {
                      const temFaltaItem = item.status_diferenca === 'FALTA';
                      const temSobraItem = item.status_diferenca === 'SOBRA';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          {/* ID e Data */}
                          <td className="py-3 px-3.5">
                            <span className="font-bold text-slate-900 dark:text-white font-mono block">
                              #{item.id}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.data_fechamento.replace(' ', ' • ')}
                            </span>
                          </td>

                          {/* Vendedor */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                                {item.usuario_nome.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {item.usuario_nome}
                                </span>
                                <span className="text-[10px] text-slate-400">Terminal Caixa #01</span>
                              </div>
                            </div>
                          </td>

                          {/* Vendas do Turno */}
                          <td className="py-3 px-3.5">
                            <span className="font-bold font-mono text-slate-900 dark:text-white block">
                              {formatarMoeda(item.total_vendas_geral)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.quantidade_vendas} vendas concluídas
                            </span>
                          </td>

                          {/* Fundo e Dinheiro Esperado */}
                          <td className="py-3 px-3.5">
                            <span className="text-slate-500 block text-[11px]">
                              Troco: {formatarMoeda(item.fundo_inicial)}
                            </span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                              Espécie: {formatarMoeda(item.total_vendas_dinheiro)}
                            </span>
                          </td>

                          {/* Dinheiro Declarado */}
                          <td className="py-3 px-3.5">
                            <span className="font-bold font-mono text-slate-900 dark:text-white">
                              {formatarMoeda(item.dinheiro_informado)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Esperado: {formatarMoeda(item.saldo_esperado_dinheiro)}
                            </span>
                          </td>

                          {/* Divergência (Alerta se faltou dinheiro) */}
                          <td className="py-3 px-3.5">
                            {temFaltaItem ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                <span>FALTA: -{formatarMoeda(Math.abs(item.diferenca))}</span>
                              </span>
                            ) : temSobraItem ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                <TrendingUp className="w-3 h-3" />
                                <span>SOBRA: +{formatarMoeda(item.diferenca)}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>BATEU (R$ 0,00)</span>
                              </span>
                            )}
                            {item.observacoes && (
                              <span className="text-[10px] text-slate-400 block mt-1 truncate max-w-[160px]" title={item.observacoes}>
                                Obs: {item.observacoes}
                              </span>
                            )}
                          </td>

                          {/* Status de Auditoria do Gerente */}
                          <td className="py-3 px-3.5">
                            {item.gerente_auditor_nome ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Auditado por {item.gerente_auditor_nome}</span>
                                </span>
                                {item.gerente_parecer && (
                                  <span
                                    className="text-[10px] text-slate-500 dark:text-slate-400 block italic truncate max-w-[170px]"
                                    title={item.gerente_parecer}
                                  >
                                    "{item.gerente_parecer}"
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                Pendente de Visto
                              </span>
                            )}
                          </td>

                          {/* Ação */}
                          <td className="py-3 px-3.5 text-right">
                            {isGerenteOuAdmin ? (
                              <button
                                onClick={() => abrirAuditoriaItem(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>{item.gerente_auditor_nome ? 'Revisar' : 'Auditar'}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Registrado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL INTERNO: REGISTRAR PARECER GERENCIAL */}
        {itemSelecionado && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Parecer Gerencial • Fechamento #{itemSelecionado.id}
                  </h3>
                </div>
                <button
                  onClick={() => setItemSelecionado(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Informações da Ocorrência */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Operador / Vendedor:</span>
                  <span className="font-bold">{itemSelecionado.usuario_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data de Fechamento:</span>
                  <span>{itemSelecionado.data_fechamento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Saldo Esperado em Gaveta:</span>
                  <span>{formatarMoeda(itemSelecionado.saldo_esperado_dinheiro)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dinheiro Físico Declarado:</span>
                  <span className="font-bold">{formatarMoeda(itemSelecionado.dinheiro_informado)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1.5">
                  <span>Divergência Apurada:</span>
                  <span
                    className={
                      itemSelecionado.status_diferenca === 'FALTA'
                        ? 'text-rose-500 font-black'
                        : itemSelecionado.status_diferenca === 'SOBRA'
                        ? 'text-amber-500 font-black'
                        : 'text-emerald-500 font-bold'
                    }
                  >
                    {itemSelecionado.status_diferenca === 'FALTA'
                      ? `FALTA DE ${formatarMoeda(Math.abs(itemSelecionado.diferenca))}`
                      : itemSelecionado.status_diferenca === 'SOBRA'
                      ? `SOBRA DE ${formatarMoeda(itemSelecionado.diferenca)}`
                      : 'CAIXA BATEU'}
                  </span>
                </div>
                {itemSelecionado.observacoes && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    <strong>Justificativa do Vendedor:</strong> {itemSelecionado.observacoes}
                  </div>
                )}
              </div>

              {/* Campo de Parecer do Gerente */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parecer do Gerente / Administrador *
                </label>
                <textarea
                  rows={3}
                  value={parecerTexto}
                  onChange={(e) => setParecerTexto(e.target.value)}
                  placeholder="Ex: Divergência conferida e aceita referente a troco na venda #42 / Ciente e aprovado / Autorizado acerto..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setItemSelecionado(null)}
                  disabled={salvandoParecer}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={salvarParecerGerencial}
                  disabled={salvandoParecer}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-50"
                >
                  {salvandoParecer ? 'Gravando...' : 'Gravar Parecer e Visto'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
