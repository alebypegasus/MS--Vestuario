import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  UserPlus,
  Mail,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  Users,
  Shield,
  KeyRound,
  Search,
} from 'lucide-react';
import { IUsuario, IUsuarioCriacaoDTO, CargoUsuario } from '../types';
import { usuariosApi } from '../services/api';
import { getRoleBadgeConfig } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

export const UsuariosPage: React.FC = () => {
  const { adicionarToast } = useToast();

  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [filtroCargo, setFiltroCargo] = useState<string>('TODOS');

  // Modal Novo Usuário
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [cargo, setCargo] = useState<CargoUsuario>('CAIXA');
  const [salvando, setSalvando] = useState<boolean>(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setCarregando(true);
      const lista = await usuariosApi.listar();
      setUsuarios(lista);
    } catch (err: any) {
      adicionarToast('error', 'Erro ao carregar equipe', err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha) return;

    try {
      setSalvando(true);
      const payload: IUsuarioCriacaoDTO = {
        nome: nome.trim(),
        email: email.trim(),
        senha: senha.trim(),
        cargo,
      };

      await usuariosApi.criar(payload);
      adicionarToast('success', 'Funcionário Cadastrado', `${nome} adicionado com o cargo ${cargo}`);
      setModalAberto(false);
      setNome('');
      setEmail('');
      setSenha('');
      setCargo('CAIXA');
      carregarUsuarios();
    } catch (err: any) {
      adicionarToast('error', 'Falha no Cadastro', err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleDesativar = async (user: IUsuario) => {
    if (!window.confirm(`Deseja realmente desativar o usuário ${user.nome}?`)) return;

    try {
      await usuariosApi.desativar(user.id);
      adicionarToast('info', 'Usuário Desativado', `${user.nome} foi desativado`);
      carregarUsuarios();
    } catch (err: any) {
      adicionarToast('error', 'Erro', err.message);
    }
  };

  // Métricas do Bento Grid
  const totalUsuarios = usuarios.length;
  const caixas = usuarios.filter((u) => u.cargo === 'CAIXA');
  const gerentes = usuarios.filter((u) => u.cargo === 'GERENTE');
  const admins = usuarios.filter((u) => u.cargo === 'ADMIN');
  const ativos = usuarios.filter((u) => u.ativo);

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchCargo = filtroCargo === 'TODOS' || u.cargo === filtroCargo;
    const termo = busca.toLowerCase();
    const matchBusca =
      !busca ||
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      String(u.id).includes(termo);
    return matchCargo && matchBusca;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-sm border border-purple-500/20">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Gestão da Equipe & Usuários</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                  {totalUsuarios} Colaboradores
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Alçadas de acesso aos perfis de Caixa, Gerente de Loja e Administrador Geral
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md self-start sm:self-auto btn-interactive"
        >
          <UserPlus className="w-4 h-4" />
          Novo Colaborador
        </button>
      </div>

      {/* Bento Grid: Cards de Métricas em Tela Inteira */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Bento 1: Total da Equipe */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total da Equipe
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {totalUsuarios}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{ativos.length} colaboradores ativos no sistema</span>
          </div>
        </div>

        {/* Bento 2: Caixas (PDV) */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Operadores de Caixa
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {caixas.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Acesso a vendas, emissão de tickets e catálogo
          </div>
        </div>

        {/* Bento 3: Gerentes */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Gerentes de Loja
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {gerentes.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Alçadas de desconto (RN-02) e cancelamento (RN-03)
          </div>
        </div>

        {/* Bento 4: Administradores */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Administradores
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {admins.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Gestão total, exclusão e parâmetros fiscais
          </div>
        </div>
      </div>

      {/* Bento Grid: Barra de Busca e Filtros de Cargo */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou ID..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs placeholder-slate-400 dark:placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-full md:w-auto overflow-x-auto justify-start md:justify-end">
          {['TODOS', 'CAIXA', 'GERENTE', 'ADMIN'].map((c) => (
            <button
              key={c}
              onClick={() => setFiltroCargo(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all btn-interactive ${
                filtroCargo === c
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {c === 'TODOS'
                ? `Todos (${usuarios.length})`
                : c === 'CAIXA'
                ? `Caixas (${caixas.length})`
                : c === 'GERENTE'
                ? `Gerentes (${gerentes.length})`
                : `Admins (${admins.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Usuários Bento Full-Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {carregando ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            Carregando equipe e permissões...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm">
            Nenhum colaborador encontrado com os filtros aplicados.
          </div>
        ) : (
          usuariosFiltrados.map((user) => {
            const badge = getRoleBadgeConfig(user.cargo);
            return (
              <div
                key={user.id}
                className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${badge.badgeClass}`}
                    >
                      {badge.label}
                    </span>
                    {user.ativo ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5" /> Inativo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-purple-600 dark:text-purple-400 shrink-0">
                      {user.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user.nome}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono">ID: #{user.id}</span>
                  {user.ativo && (
                    <button
                      onClick={() => handleDesativar(user)}
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold transition-colors btn-interactive"
                    >
                      Desativar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Criação de Usuário */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/30 shadow-2xl overflow-hidden">
            <div className="bg-purple-500/10 border-b border-purple-500/20 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Cadastrar Colaborador
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  E-mail de Login
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@ms2.com.br"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Senha Provisória
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cargo / Perfil de Acesso
                </label>
                <select
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value as CargoUsuario)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                >
                  <option value="CAIXA">Operador de Caixa (CAIXA)</option>
                  <option value="GERENTE">Gerente de Loja (GERENTE)</option>
                  <option value="ADMIN">Administrador Geral (ADMIN)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold btn-interactive"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 btn-interactive"
                >
                  {salvando ? 'Salvando...' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
