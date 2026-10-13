import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  ShieldCheck,
  AlertOctagon,
  Users,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { vendasApi, clientesApi } from '../services/api';
import { IVendaCompleta, ICliente } from '../types';
import { formatarMoeda } from '../utils/formatters';
import { obterImagemProduto } from '../utils/productImages';
import { NavLink } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [vendas, setVendas] = useState<IVendaCompleta[]>([]);
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [listaVendas, listaClientes] = await Promise.all([
        vendasApi.listar(),
        clientesApi.listar(),
      ]);
      setVendas(listaVendas);
      setClientes(listaClientes);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  // Cálculos das Métricas do Gerente
  const vendasConcluidas = vendas.filter((v) => v.status === 'CONCLUIDA');
  const vendasCanceladas = vendas.filter((v) => v.status === 'CANCELADA');
  const faturamentoTotal = vendasConcluidas.reduce((acc, v) => acc + Number(v.valor_total), 0);
  const ticketMedio = vendasConcluidas.length > 0 ? faturamentoTotal / vendasConcluidas.length : 0;
  const totalDescontos = vendasConcluidas.reduce((acc, v) => acc + Number(v.desconto), 0);
  const vendasComAlcada = vendasConcluidas.filter((v) => v.gerente_aprovador_id !== null);

  // Vendas por Forma de Pagamento
  const pagamentoMap: Record<string, { count: number; total: number }> = {
    PIX: { count: 0, total: 0 },
    DINHEIRO: { count: 0, total: 0 },
    CARTAO_DEBITO: { count: 0, total: 0 },
    CARTAO_CREDITO: { count: 0, total: 0 },
  };

  vendasConcluidas.forEach((v) => {
    if (pagamentoMap[v.forma_pagamento]) {
      pagamentoMap[v.forma_pagamento].count += 1;
      pagamentoMap[v.forma_pagamento].total += Number(v.valor_total);
    }
  });

  // Ranking dos Top Produtos Mais Vendidos
  const produtosRankingMap: Record<
    string,
    { codigo: string; descricao: string; quantidade: number; faturamento: number }
  > = {};

  vendasConcluidas.forEach((v) => {
    v.itens?.forEach((item) => {
      if (!produtosRankingMap[item.codigo]) {
        produtosRankingMap[item.codigo] = {
          codigo: item.codigo,
          descricao: item.descricao,
          quantidade: 0,
          faturamento: 0,
        };
      }
      produtosRankingMap[item.codigo].quantidade += item.quantidade;
      produtosRankingMap[item.codigo].faturamento += Number(item.subtotal);
    });
  });

  const topProdutos = Object.values(produtosRankingMap).sort(
    (a, b) => b.quantidade - a.quantidade
  ).slice(0, 5);

  // Cálculos Exclusivos para Administrador
  const vendasPorOperadorMap: Record<string, { nome: string; count: number; faturamento: number }> = {};
  vendasConcluidas.forEach((v) => {
    const nomeOperador = v.operador_nome || `Operador #${v.usuario_id}`;
    if (!vendasPorOperadorMap[nomeOperador]) {
      vendasPorOperadorMap[nomeOperador] = { nome: nomeOperador, count: 0, faturamento: 0 };
    }
    vendasPorOperadorMap[nomeOperador].count += 1;
    vendasPorOperadorMap[nomeOperador].faturamento += Number(v.valor_total);
  });

  const clientesIdentificadosVendas = vendasConcluidas.filter((v) => v.cliente_id !== null).length;
  const consumidorFinalVendas = vendasConcluidas.filter((v) => v.cliente_id === null).length;

  if (carregando) {
    return (
      <div className="py-24 text-center text-slate-400">
        Carregando indicadores gerenciais e executivos...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header com identificação de alçada */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
              <LayoutDashboard className="w-7 h-7 text-indigo-400" />
              {isAdmin ? 'Dashboard Executivo & Geral (Admin)' : 'Dashboard Gerencial da Loja'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
              {isAdmin ? 'Visão Completa de Administrador' : 'Visão Gerente de Loja'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Métricas de faturamento, alçadas aplicadas (RN-02), cancelamentos (RN-03) e auditoria
          </p>
        </div>

        {isAdmin && (
          <NavLink
            to="/configuracoes"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            Configurações Fiscais da Empresa
          </NavLink>
        )}
      </div>

      {/* Grid de KPIs Principais (Comum a Gerente e Admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Faturamento Total */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Faturamento Líquido
            </span>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {formatarMoeda(faturamentoTotal)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {vendasConcluidas.length} vendas concluídas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Ticket Médio */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ticket Médio por Venda
            </span>
            <p className="text-2xl font-black text-indigo-400 mt-1">
              {formatarMoeda(ticketMedio)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Média por atendimento</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Descontos & Alçadas (RN-02) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Descontos Concedidos
            </span>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {formatarMoeda(totalDescontos)}
            </p>
            <p className="text-[10px] text-amber-300 font-semibold mt-1">
              {vendasComAlcada.length} sob alçada gerencial (&gt;10%)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Vendas Canceladas (RN-03) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Vendas Canceladas
            </span>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {vendasCanceladas.length}
            </p>
            <p className="text-[10px] text-rose-300 font-semibold mt-1">
              Estornos auditados (RN-03)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Formas de Pagamento & Top Produtos com Fotos Reais */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Distribuição por Formas de Pagamento */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Volume por Meio de Pagamento
            </h3>

            <div className="space-y-3">
              {[
                { id: 'PIX', label: 'PIX Instantâneo', icon: QrCode, color: 'text-teal-400', bar: 'bg-teal-500' },
                { id: 'DINHEIRO', label: 'Dinheiro em Espécie', icon: Banknote, color: 'text-emerald-400', bar: 'bg-emerald-500' },
                { id: 'CARTAO_DEBITO', label: 'Cartão de Débito', icon: CreditCard, color: 'text-blue-400', bar: 'bg-blue-500' },
                { id: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: CreditCard, color: 'text-indigo-400', bar: 'bg-indigo-500' },
              ].map((met) => {
                const dados = pagamentoMap[met.id];
                const pct = faturamentoTotal > 0 ? (dados.total / faturamentoTotal) * 100 : 0;
                const Icon = met.icon;
                return (
                  <div key={met.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold flex items-center gap-1.5 ${met.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {met.label}
                      </span>
                      <span className="font-bold text-slate-200">
                        {formatarMoeda(dados.total)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${met.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-4 text-center">
            Liquidação instantânea no caixa sem intermediários físicos
          </p>
        </div>

        {/* Top 5 Produtos com Fotos */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            Top Produtos Mais Vendidos (Catálogo com Imagens)
          </h3>

          <div className="space-y-2.5">
            {topProdutos.length === 0 ? (
              <p className="py-8 text-center text-slate-500 text-xs">
                Nenhum produto computado nas vendas concluídas.
              </p>
            ) : (
              topProdutos.map((prod, idx) => (
                <div
                  key={prod.codigo}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-slate-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <img
                      src={obterImagemProduto(prod.codigo)}
                      alt={prod.descricao}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-700 shrink-0 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-200">{prod.descricao}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Cód SKU: #{prod.codigo} &bull; {prod.quantidade} unidades vendidas
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-400">
                      {formatarMoeda(prod.faturamento)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO EXCLUSIVA DE ADMINISTRADOR (O que o Admin pode ver a mais) */}
      {isAdmin && (
        <div className="pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-purple-300 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
                Painel Avançado de Auditoria & Gestão Executiva (Exclusivo Administrador)
              </h2>
              <p className="text-xs text-slate-400">
                Métricas internas de operadores, taxa de identificação de clientes e equipe
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Desempenho por Operador de Caixa */}
            <div className="glass-card rounded-2xl p-5 border border-purple-500/30 shadow-xl md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                Produtividade por Operador de Caixa
              </h4>
              <div className="space-y-2">
                {Object.values(vendasPorOperadorMap).map((op) => (
                  <div
                    key={op.nome}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">{op.nome}</p>
                      <p className="text-[10px] text-slate-400">{op.count} atendimentos finalizados</p>
                    </div>
                    <span className="text-xs font-black text-emerald-400">
                      {formatarMoeda(op.faturamento)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fidelização de Clientes (RN-01 vs Consumidor Final RN-06) */}
            <div className="glass-card rounded-2xl p-5 border border-purple-500/30 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  Taxa de Identificação de Clientes
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Clientes com CPF (RN-01):</span>
                    <span className="font-bold text-blue-400">{clientesIdentificadosVendas} vendas</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Consumidor Final (RN-06):</span>
                    <span className="font-bold text-slate-400">{consumidorFinalVendas} vendas</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-300">Total de Clientes Cadastrados:</span>
                    <span className="font-bold text-emerald-400">{clientes.length} pessoas</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <NavLink
                  to="/usuarios"
                  className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs text-center transition-colors"
                >
                  Gerenciar Equipe
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
