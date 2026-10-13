import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  UserPlus,
  Mail,
  CheckCircle2,
  XCircle,
  X,
  Lock,
} from 'lucide-react';
import { IUsuario, IUsuarioCriacaoDTO, CargoUsuario } from '../types';
import { usuariosApi } from '../services/api';
import { getRoleBadgeConfig } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

export const UsuariosPage: React.FC = () => {
  const { adicionarToast } = useToast();

  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-purple-400" />
            Gestão da Equipe & Usuários
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acesso administrativo aos perfis de Caixa, Gerente e Administrador
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-indigo self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Novo Colaborador
        </button>
      </div>

      {/* Grid de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {carregando ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Carregando usuários...
          </div>
        ) : (
          usuarios.map((user) => {
            const badge = getRoleBadgeConfig(user.cargo);
            return (
              <div
                key={user.id}
                className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${badge.badgeClass}`}
                    >
                      {badge.label}
                    </span>
                    {user.ativo ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                        <XCircle className="w-3.5 h-3.5" /> Inativo
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-100">{user.nome}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {user.email}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>ID do Usuário: #{user.id}</span>
                  {user.ativo && (
                    <button
                      onClick={() => handleDesativar(user)}
                      className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-card border border-purple-500/30 shadow-glow-indigo overflow-hidden">
            <div className="bg-purple-500/10 border-b border-purple-500/20 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-base">Cadastrar Colaborador</h3>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail de Login
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@ms2.com.br"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Senha Provisória
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cargo / Perfil de Acesso
                </label>
                <select
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value as CargoUsuario)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                >
                  <option value="CAIXA">Operador de Caixa (CAIXA)</option>
                  <option value="GERENTE">Gerente de Loja (GERENTE)</option>
                  <option value="ADMIN">Administrador Geral (ADMIN)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-indigo disabled:opacity-50"
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
