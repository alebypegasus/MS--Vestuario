import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { ICliente, IClienteCriacaoDTO } from '../types';
import { clientesApi } from '../services/api';
import { formatarCPF, validarCPF } from '../utils/cpf.validator';
import { formatarTelefone } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

export const ClientesPage: React.FC = () => {
  const { adicionarToast } = useToast();

  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');

  // Modal de Cadastro
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [nome, setNome] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setCarregando(true);
      const lista = await clientesApi.listar();
      setClientes(lista);
    } catch (err: any) {
      adicionarToast('error', 'Erro ao carregar clientes', err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCpf(formatarCPF(raw));
  };

  const cpfValido = cpf.length > 0 ? validarCPF(cpf) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarCPF(cpf)) {
      adicionarToast(
        'warning',
        'CPF Inválido',
        'O CPF informado falhou na validação de dígitos verificadores (Módulo 11 - RN-01)'
      );
      return;
    }

    try {
      setSalvando(true);
      const payload: IClienteCriacaoDTO = {
        nome: nome.trim(),
        cpf: formatarCPF(cpf),
        telefone: telefone.trim() || null,
        email: email.trim() || null,
      };

      await clientesApi.criar(payload);
      adicionarToast('success', 'Cliente Cadastrado', `${nome} cadastrado com sucesso`);
      setModalAberto(false);
      setNome('');
      setCpf('');
      setTelefone('');
      setEmail('');
      carregarClientes();
    } catch (err: any) {
      adicionarToast('error', 'Falha no Cadastro', err.message);
    } finally {
      setSalvando(false);
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const termo = busca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) ||
      c.cpf.includes(termo) ||
      (c.email && c.email.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-400" />
            Base de Clientes & Fidelização
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identificação segura com validação oficial de CPF (RN-01)
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-indigo self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/60 shadow-lg">
        <div className="relative max-w-md">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome, CPF ou e-mail..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="glass-card rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nome do Cliente</th>
                <th className="py-3 px-4">CPF (Validado Módulo 11)</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {carregando ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Carregando base de clientes...
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Nenhum cliente localizado.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cli) => (
                  <tr key={cli.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0">
                        {cli.nome.charAt(0)}
                      </div>
                      <span>{cli.nome}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {formatarCPF(cli.cpf)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {formatarTelefone(cli.telefone)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {cli.email || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" /> Verificado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Cliente */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-card border border-blue-500/30 shadow-glow-indigo overflow-hidden">
            <div className="bg-blue-500/10 border-b border-blue-500/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-base">Cadastrar Cliente</h3>
              </div>
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
                  Nome Completo <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Beatriz Albuquerque"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  CPF (com Validação Módulo 11) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-mono ${
                      cpfValido === true
                        ? 'border-emerald-500/80 focus:border-emerald-400'
                        : cpfValido === false
                        ? 'border-rose-500/80 focus:border-rose-400'
                        : ''
                    }`}
                  />
                  <div className="absolute right-3.5 top-3 pointer-events-none">
                    {cpfValido === true && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {cpfValido === false && <XCircle className="w-4 h-4 text-rose-400" />}
                  </div>
                </div>
                {cpfValido === false && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">
                    CPF inválido pelo algoritmo de dígitos verificadores (Módulo 11)
                  </p>
                )}
                {cpfValido === true && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                    ✓ Dígitos verificadores válidos segundo a Receita Federal
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(21) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                />
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
                  disabled={salvando || !cpfValido}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-indigo disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
