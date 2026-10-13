import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  AlertOctagon,
} from 'lucide-react';
import { IVendaCompleta } from '../types';
import { vendasApi } from '../services/api';
import { formatarMoeda, formatarDataHora } from '../utils/formatters';
import { formatarCPF } from '../utils/cpf.validator';
import { useToast } from '../contexts/ToastContext';
import { CancelSaleModal } from '../components/CancelSaleModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const VendasPage: React.FC = () => {
  const { adicionarToast } = useToast();

  const [vendas, setVendas] = useState<IVendaCompleta[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODAS');
  const [busca, setBusca] = useState<string>('');

  // Modais
  const [vendaSelecionada, setVendaSelecionada] = useState<IVendaCompleta | null>(null);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState<boolean>(false);
  const [modalCancelarAberto, setModalCancelarAberto] = useState<boolean>(false);
  const [vendaParaCancelar, setVendaParaCancelar] = useState<IVendaCompleta | null>(null);

  useEffect(() => {
    carregarVendas();
  }, []);

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

  const handleVendaCancelada = () => {
    setModalCancelarAberto(false);
    carregarVendas();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-amber-400" />
            Histórico & Auditoria de Vendas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Rastreabilidade de operadores, preços históricos (RN-04) e alçadas (RN-02 e RN-03)
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por ID, operador ou cliente..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 self-stretch sm:self-auto justify-center">
          {['TODAS', 'CONCLUIDA', 'CANCELADA'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filtroStatus === st
                  ? st === 'CANCELADA'
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'TODAS' ? 'Todas' : st === 'CONCLUIDA' ? 'Concluídas' : 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="glass-card rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID Venda</th>
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Cliente (RN-06)</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Desconto</th>
                <th className="py-3 px-4 text-right">Total Líquido</th>
                <th className="py-3 px-4">Pagamento</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {carregando ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Carregando histórico de vendas...
                  </td>
                </tr>
              ) : vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              ) : (
                vendasFiltradas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      #{String(v.id).padStart(5, '0')}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{formatarDataHora(v.criado_em)}</td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {v.operador_nome || `#${v.usuario_id}`}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {v.cliente_nome ? (
                        <div>
                          <p className="font-semibold text-slate-100">{v.cliente_nome}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {formatarCPF(v.cliente_cpf || '')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Consumidor Final</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {formatarMoeda(Number(v.subtotal))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {Number(v.desconto) > 0 ? (
                        <div>
                          <span className="text-rose-400 font-bold">
                            -{formatarMoeda(Number(v.desconto))}
                          </span>
                          {v.gerente_aprovador_nome && (
                            <span className="block text-[9px] text-amber-400 font-semibold" title={`Aprovado por ${v.gerente_aprovador_nome}`}>
                              ★ Alçada RN-02
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm">
                      {formatarMoeda(Number(v.valor_total))}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {v.forma_pagamento}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {v.status === 'CONCLUIDA' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Concluída
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400" title={v.motivo_cancelamento || ''}>
                          <XCircle className="w-3.5 h-3.5" /> Cancelada
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => abrirDetalhes(v)}
                          title="Visualizar Comprovante & Itens Históricos"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {v.status === 'CONCLUIDA' && (
                          <button
                            onClick={() => abrirCancelar(v)}
                            title="Cancelar Venda com Alçada (RN-03)"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-colors"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
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
    </div>
  );
};
