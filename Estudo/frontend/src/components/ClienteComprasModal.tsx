import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Phone,
  Mail,
  Receipt,
  FileSpreadsheet,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { ICliente, IVendaCompleta } from '../types';
import { formatarMoeda, formatarDataHora } from '../utils/formatters';
import { formatarCPF } from '../utils/cpf.validator';
import { exportarParaCSV, exportarParaExcel, exportarRelatorioPDF } from '../utils/exportUtils';
import { useToast } from '../contexts/ToastContext';

interface ClienteComprasModalProps {
  aberto: boolean;
  onClose: () => void;
  cliente: ICliente | null;
  vendas: IVendaCompleta[];
  onAbrirRecibo?: (venda: IVendaCompleta) => void;
}

export const ClienteComprasModal: React.FC<ClienteComprasModalProps> = ({
  aberto,
  onClose,
  cliente,
  vendas,
  onAbrirRecibo,
}) => {
  const { adicionarToast } = useToast();
  const [buscaVenda, setBuscaVenda] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<'TODAS' | 'CONCLUIDA' | 'CANCELADA'>('TODAS');
  const [vendaExpandidaId, setVendaExpandidaId] = useState<number | null>(null);

  if (!aberto || !cliente) return null;

  // Filtrar vendas associadas a este cliente (por cliente_id ou por CPF)
  const vendasDoCliente = vendas.filter((v) => {
    const mesmoId = v.cliente_id === cliente.id;
    const mesmoCpf = v.cliente_cpf && cliente.cpf && v.cliente_cpf.replace(/\D/g, '') === cliente.cpf.replace(/\D/g, '');
    return mesmoId || mesmoCpf;
  });

  const vendasConcluidas = vendasDoCliente.filter((v) => v.status === 'CONCLUIDA');
  const totalGasto = vendasConcluidas.reduce((acc, v) => acc + Number(v.valor_total || 0), 0);
  const totalDescontos = vendasConcluidas.reduce((acc, v) => acc + Number(v.desconto || 0), 0);
  const totalCompras = vendasConcluidas.length;
  const ticketMedio = totalCompras > 0 ? totalGasto / totalCompras : 0;
  const ultimaCompra = vendasConcluidas.length > 0 ? vendasConcluidas[0].criado_em : null;

  const vendasFiltradas = vendasDoCliente.filter((v) => {
    const matchStatus = filtroStatus === 'TODAS' || v.status === filtroStatus;
    const termo = buscaVenda.toLowerCase();
    const matchBusca =
      !buscaVenda ||
      String(v.id).includes(termo) ||
      (v.operador_nome && v.operador_nome.toLowerCase().includes(termo)) ||
      (v.forma_pagamento && v.forma_pagamento.toLowerCase().includes(termo)) ||
      v.itens?.some((i) => i.descricao.toLowerCase().includes(termo) || i.codigo.includes(termo));
    return matchStatus && matchBusca;
  });

  // Métodos de Exportação do Relatório do Cliente
  const colunasExportacao = [
    'Venda #',
    'Data/Hora',
    'Operador/Vendedor',
    'Forma Pagamento',
    'Subtotal (R$)',
    'Desconto (R$)',
    'Total Pago (R$)',
    'Status',
    'Itens Comprados',
  ];

  const obterLinhasExportacao = () =>
    vendasFiltradas.map((v) => [
      `#${v.id}`,
      formatarDataHora(v.criado_em),
      v.operador_nome || 'Caixa',
      v.forma_pagamento,
      formatarMoeda(Number(v.subtotal)),
      formatarMoeda(Number(v.desconto)),
      formatarMoeda(Number(v.valor_total)),
      v.status,
      v.itens?.map((i) => `${i.quantidade}x ${i.descricao}`).join('; ') || '',
    ]);

  const handleExportarExcel = () => {
    const linhas = obterLinhasExportacao();
    const totais = [
      { label: 'Total de Compras Concluídas', valor: String(totalCompras) },
      { label: 'Total Gasto Acumulado (LTV)', valor: formatarMoeda(totalGasto) },
      { label: 'Ticket Médio por Compra', valor: formatarMoeda(ticketMedio) },
      { label: 'Total de Descontos Recebidos', valor: formatarMoeda(totalDescontos) },
    ];
    exportarParaExcel(
      `relatorio_cliente_${cliente.cpf.replace(/\D/g, '')}`,
      `Histórico de Compras - ${cliente.nome}`,
      colunasExportacao,
      linhas,
      totais
    );
    adicionarToast('success', 'Excel Gerado!', `Relatório de ${cliente.nome} baixado com sucesso.`);
  };

  const handleExportarCSV = () => {
    exportarParaCSV(
      `relatorio_cliente_${cliente.cpf.replace(/\D/g, '')}`,
      colunasExportacao,
      obterLinhasExportacao()
    );
    adicionarToast('success', 'CSV Exportado!', `Arquivo CSV de ${cliente.nome} gerado.`);
  };

  const handleExportarPDF = () => {
    const linhas = obterLinhasExportacao();
    const totais = [
      { label: 'Compras Concluídas', valor: String(totalCompras) },
      { label: 'Volume Total Gasto', valor: formatarMoeda(totalGasto) },
      { label: 'Ticket Médio', valor: formatarMoeda(ticketMedio) },
    ];
    exportarRelatorioPDF({
      titulo: `Relatório de Compras & Fidelização`,
      subtitulo: `Cliente: ${cliente.nome} • CPF: ${formatarCPF(cliente.cpf)} • Tel: ${cliente.telefone || 'N/I'}`,
      colunas: colunasExportacao.slice(0, 8), // omite itens longos no A4 para melhor enquadramento
      linhas: linhas.map((l) => l.slice(0, 8)),
      totais,
    });
    adicionarToast('info', 'Gerando PDF', 'Janela de impressão A4 do cliente aberta.');
  };

  const alternarExpansao = (id: number) => {
    setVendaExpandidaId(vendaExpandidaId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl glass-card border border-blue-500/30 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header com Perfil do Cliente e Botões de Exportação */}
        <div className="bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-transparent border-b border-blue-500/20 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
              {cliente.nome.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                  {cliente.nome}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  Cliente Cadastrado
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  CPF: {formatarCPF(cliente.cpf)}
                </span>
                {cliente.telefone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {cliente.telefone}
                  </span>
                )}
                {cliente.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {cliente.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Botões de Exportação */}
            <button
              onClick={handleExportarPDF}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-all btn-interactive"
              title="Exportar Relatório do Cliente em PDF (A4)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportarExcel}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-all btn-interactive"
              title="Exportar Compras do Cliente em Planilha Excel"
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

        {/* Bento Grid: Indicadores Financeiros do Cliente */}
        <div className="p-5 sm:p-6 pb-2 border-b border-slate-200 dark:border-slate-800/80">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Gasto (LTV)
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {formatarMoeda(totalGasto)}
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total de Compras
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {totalCompras} pedidos
              </p>
              {ultimaCompra && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Última: {formatarDataHora(ultimaCompra).split(' ')[0]}
                </span>
              )}
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ticket Médio
              </span>
              <p className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                {formatarMoeda(ticketMedio)}
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Descontos Recebidos
              </span>
              <p className="text-xl font-black text-rose-500 dark:text-rose-400 font-mono mt-0.5">
                {formatarMoeda(totalDescontos)}
              </p>
            </div>
          </div>

          {/* Barra de Filtros e Busca de Vendas do Cliente */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={buscaVenda}
                onChange={(e) => setBuscaVenda(e.target.value)}
                placeholder="Buscar por ID, operador ou peça..."
                className="w-full px-3 py-1.5 pl-8 rounded-xl glass-input text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto text-xs">
              {(['TODAS', 'CONCLUIDA', 'CANCELADA'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFiltroStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filtroStatus === st
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st === 'TODAS'
                    ? `Todas (${vendasDoCliente.length})`
                    : st === 'CONCLUIDA'
                    ? `Concluídas (${vendasConcluidas.length})`
                    : `Canceladas (${vendasDoCliente.length - vendasConcluidas.length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista / Tabela de Compras do Cliente */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {vendasFiltradas.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">Nenhuma compra localizada para este cliente.</p>
              <p className="text-xs text-slate-500">
                {buscaVenda
                  ? 'Tente ajustar os termos de pesquisa'
                  : 'Assim que este cliente realizar uma compra no PDV, ela aparecerá aqui em tempo real.'}
              </p>
            </div>
          ) : (
            vendasFiltradas.map((venda) => {
              const expandida = vendaExpandidaId === venda.id;
              return (
                <div
                  key={venda.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs hover:border-blue-500/40 transition-all"
                >
                  {/* Linha Resumida da Venda */}
                  <div
                    onClick={() => alternarExpansao(venda.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        #{venda.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                            Venda #{venda.id}
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
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{formatarDataHora(venda.criado_em)}</span>
                          <span>•</span>
                          <span>Atendido por: {venda.operador_nome || `Operador #${venda.usuario_id}`}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Total Líquido</span>
                        <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatarMoeda(Number(venda.valor_total))}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onAbrirRecibo && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAbrirRecibo(venda);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                            title="Visualizar Cupom / Recibo Térmico"
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

                  {/* Detalhe Expandido da Venda e dos Itens */}
                  {expandida && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 animate-in fade-in">
                      {/* Resumo de Pagamento e Desconto */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-slate-400 block">Forma de Pagamento:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {venda.forma_pagamento}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Subtotal dos Itens:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {formatarMoeda(Number(venda.subtotal))}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Desconto Aplicado:</span>
                          <span className="font-mono text-rose-500 font-bold">
                            {Number(venda.desconto) > 0 ? `- ${formatarMoeda(Number(venda.desconto))}` : 'R$ 0,00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Alçada Gerencial:</span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {venda.gerente_aprovador_nome ? `Autorizado por ${venda.gerente_aprovador_nome}` : 'Padrão Caixa'}
                          </span>
                        </div>
                      </div>

                      {/* Tabela de Produtos desta Venda */}
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                            <tr>
                              <th className="py-2 px-3">SKU</th>
                              <th className="py-2 px-3">Descrição da Peça</th>
                              <th className="py-2 px-3 text-center">Qtd</th>
                              <th className="py-2 px-3 text-right">Preço Unit.</th>
                              <th className="py-2 px-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/60">
                            {venda.itens && venda.itens.length > 0 ? (
                              venda.itens.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
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
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-400">
                                  Nenhum item listado nesta venda.
                                </td>
                              </tr>
                            )}
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

        {/* Rodapé com Fechamento */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 px-5 sm:px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Mostrando {vendasFiltradas.length} de {vendasDoCliente.length} compras registradas
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
