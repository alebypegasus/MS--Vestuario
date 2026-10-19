import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, UserPlus, CheckCircle2, Phone, CreditCard, ShieldCheck } from 'lucide-react';
import { ICliente } from '../types';
import { formatarCPF } from '../utils/cpf.validator';

export interface ISearchClienteModalProps {
  aberto: boolean;
  aoFechar: () => void;
  clientes: ICliente[];
  clienteSelecionado: ICliente | null;
  aoSelecionarCliente: (cliente: ICliente | null) => void;
  aoAbrirNovoCliente: () => void;
}

export const SearchClienteModal: React.FC<ISearchClienteModalProps> = ({
  aberto,
  aoFechar,
  clientes,
  clienteSelecionado,
  aoSelecionarCliente,
  aoAbrirNovoCliente,
}) => {
  const [termoBusca, setTermoBusca] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setTermoBusca('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [aberto]);

  if (!aberto) return null;

  const termoLimpo = termoBusca.toLowerCase().trim();
  const termoNumeros = termoBusca.replace(/\D/g, '');

  const clientesFiltrados = clientes.filter((c) => {
    if (!termoLimpo) return true;
    const nomeMatch = c.nome.toLowerCase().includes(termoLimpo);
    const cpfMatch = c.cpf.includes(termoNumeros) || c.cpf.includes(termoLimpo);
    const telMatch = c.telefone ? c.telefone.toLowerCase().includes(termoLimpo) || c.telefone.replace(/\D/g, '').includes(termoNumeros) : false;
    const emailMatch = c.email ? c.email.toLowerCase().includes(termoLimpo) : false;
    return nomeMatch || cpfMatch || telMatch || emailMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Buscar & Selecionar Cliente
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  {clientes.length} Cadastrados
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione um cliente salvo ou opte por Consumidor Final
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Pesquisa Rápida */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Digite o Nome, CPF ou Telefone para filtrar..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 font-medium"
            />
            {termoBusca && (
              <button
                type="button"
                onClick={() => setTermoBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de Clientes e Opções */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          
          {/* Opção Fixa no Topo: Consumidor Final */}
          <div
            onClick={() => {
              aoSelecionarCliente(null);
              aoFechar();
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              !clienteSelecionado
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/40 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Consumidor Final
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Sem CPF
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Venda anônima (quando o cliente não quer ser cadastrado ou identificado)
                </p>
              </div>
            </div>

            {!clienteSelecionado ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selecionado
              </span>
            ) : (
              <button
                type="button"
                className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                Vincular
              </button>
            )}
          </div>

          <div className="pt-2 pb-1 px-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Clientes Cadastrados ({clientesFiltrados.length})</span>
            {termoBusca && (
              <span>Filtrado por: "{termoBusca}"</span>
            )}
          </div>

          {/* Lista Filtrada de Clientes */}
          {clientesFiltrados.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Nenhum cliente localizado para "{termoBusca}".
              </p>
              <button
                type="button"
                onClick={() => {
                  aoFechar();
                  aoAbrirNovoCliente();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar Novo Cliente Agora
              </button>
            </div>
          ) : (
            clientesFiltrados.map((cli) => {
              const estaSelecionado = clienteSelecionado?.id === cli.id;
              return (
                <div
                  key={cli.id}
                  onClick={() => {
                    aoSelecionarCliente(cli);
                    aoFechar();
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    estaSelecionado
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/50 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      estaSelecionado
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                      {cli.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate block">
                          {cli.nome}
                        </span>
                        {estaSelecionado && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                            Ativo na Venda
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-mono flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {formatarCPF(cli.cpf)}
                        </span>
                        {cli.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {cli.telefone}
                          </span>
                        )}
                        {cli.email && (
                          <span className="hidden sm:inline-block text-[10px] text-slate-400">
                            {cli.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {estaSelecionado ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Vinculado
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-2xs"
                      >
                        Selecionar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Validação oficial Módulo 11 (RN-01)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => {
                aoFechar();
                aoAbrirNovoCliente();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              + Novo Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
