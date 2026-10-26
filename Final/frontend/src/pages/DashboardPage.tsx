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
  ExternalLink,
  Percent,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { vendasApi, clientesApi } from '../services/api';
import { IVendaCompleta, ICliente } from '../types';
import { formatarMoeda } from '../utils/formatters';
import { obterImagemProduto } from '../utils/productImages';
import { NavLink } from 'react-router-dom';
import { RelatorioVendedoresModal } from '../components/RelatorioVendedoresModal';

export const DashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [vendas, setVendas] = useState<IVendaCompleta[]>([]);
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [modalRelatorioVendedores, setModalRelatorioVendedores] = useState<boolean>(false);

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
      <div className="w-full px-4 py-24 text-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Carregando métricas do Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 lg:pb-8">
      {/* Header com Identificação de Perfil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Painel de Indicadores & Gestão</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                      : 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-500/30'
                  }`}
                >
                  {isAdmin ? 'Visão Executiva (Admin)' : 'Visão Operacional (Gerente)'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Métricas de faturamento, alçadas aplicadas (Alçada Gerencial), cancelamentos (Estorno de Venda) e auditoria
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <NavLink
            to="/configuracoes"
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto btn-interactive shadow-sm"
          >
            <Building2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            Configurações Fiscais da Empresa
          </NavLink>
        )}
      </div>

      {/* Grid de KPIs Principais (Comum a Gerente e Admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI: Faturamento Total */}
        <div className="glass-card-hover rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Faturamento Líquido
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatarMoeda(faturamentoTotal)}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {vendasConcluidas.length} vendas concluídas
            </p>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* KPI: Ticket Médio */}
        <div className="glass-card-hover rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ticket Médio
            </span>
            <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
              {formatarMoeda(ticketMedio)}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Média por atendimento</p>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* KPI: Descontos & Alçadas (Alçada Gerencial) */}
        <div className="glass-card-hover rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Descontos Concedidos
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {formatarMoeda(totalDescontos)}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-300 font-bold mt-1">
              {vendasComAlcada.length} sob alçada gerencial (&gt;10%)
            </p>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* KPI: Vendas Canceladas (Estorno de Venda) */}
        <div className="glass-card-hover rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vendas Canceladas
            </span>
            <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
              {vendasCanceladas.length}
            </p>
            <p className="text-[10px] text-rose-600 dark:text-rose-300 font-bold mt-1">
              Estornos auditados (Estorno de Venda)
            </p>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Grid Secundário: Métodos de Pagamento & Top Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Distribuição por Meio de Pagamento */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Recebimento por Forma de Pagamento
          </h3>

          <div className="space-y-3">
            {[
              { id: 'PIX', label: 'PIX Instantâneo', icon: QrCode, color: 'emerald' },
              { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote, color: 'blue' },
              { id: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: CreditCard, color: 'indigo' },
              { id: 'CARTAO_DEBITO', label: 'Cartão de Débito', icon: CreditCard, color: 'amber' },
            ].map((metodo) => {
              const dados = pagamentoMap[metodo.id] || { count: 0, total: 0 };
              const percentual = faturamentoTotal > 0 ? (dados.total / faturamentoTotal) * 100 : 0;
              const Icon = metodo.icon;

              return (
                <div key={metodo.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{metodo.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                      {formatarMoeda(dados.total)}
                    </span>
                  </div>

                  {/* Barra de Progresso Visual */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{dados.count} transações</span>
                    <span className="font-bold">{percentual.toFixed(1)}% do total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Produtos Mais Vendidos */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Top 5 Produtos Mais Vendidos (Catálogo com Fotos)
          </h3>

          <div className="space-y-2.5">
            {topProdutos.length === 0 ? (
              <p className="py-12 text-center text-slate-400 text-xs">
                Nenhum produto computado nas vendas concluídas.
              </p>
            ) : (
              topProdutos.map((prod, idx) => (
                <div
                  key={prod.codigo}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-black text-slate-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <img
                      src={obterImagemProduto(prod.codigo)}
                      alt={prod.descricao}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug" title={prod.descricao}>{prod.descricao}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        Cód SKU: #{prod.codigo} &bull; {prod.quantidade} unidades vendidas
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
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
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Painel Avançado de Auditoria & Gestão Executiva (Exclusivo Administrador)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Produtividade por operador de caixa individual, fidelização de clientes e atalhos estratégicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Desempenho por Operador de Caixa */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-purple-200 dark:border-purple-500/30 shadow-sm md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  Produtividade por Operador de Caixa
                </h4>
                <button
                  type="button"
                  onClick={() => setModalRelatorioVendedores(true)}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-purple-500/30 btn-interactive"
                >
                  <Award className="w-3.5 h-3.5" />
                  Relatório Completo
                </button>
              </div>
              <div className="space-y-2">
                {Object.values(vendasPorOperadorMap).map((op) => (
                  <div
                    key={op.nome}
                    onClick={() => setModalRelatorioVendedores(true)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-purple-500/40 hover:shadow-xs cursor-pointer transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {op.nome}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {op.count} atendimentos finalizados
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                        {formatarMoeda(op.faturamento)}
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold group-hover:underline">
                        Ver Vendas &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fidelização: Clientes com CPF vs Consumidor Final */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-purple-200 dark:border-purple-500/30 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5 mb-3">
                  <Percent className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  Taxa de Fidelização (Fidelização de Clientes)
                </h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                    <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">
                      Cliente Identificado (CPF)
                    </span>
                    <p className="text-lg font-black text-blue-800 dark:text-blue-200 mt-0.5">
                      {clientesIdentificadosVendas} vendas
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">
                      Consumidor Final (Anônimo)
                    </span>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                      {consumidorFinalVendas} vendas
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center">
                    Base ativa: <strong className="text-slate-700 dark:text-slate-200">{clientes.length}</strong> clientes cadastrados
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <NavLink
                  to="/usuarios"
                  className="w-full py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center justify-between hover:bg-purple-100 transition-colors btn-interactive"
                >
                  <span>Gerenciar Equipe da Loja</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </NavLink>
                <NavLink
                  to="/configuracoes"
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-between hover:bg-slate-200 transition-colors btn-interactive"
                >
                  <span>Dados Fiscais & CNPJ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Relatório de Vendedores & Desempenho */}
      <RelatorioVendedoresModal
        isOpen={modalRelatorioVendedores}
        onClose={() => setModalRelatorioVendedores(false)}
        vendas={vendas}
      />
    </div>
  );
};
