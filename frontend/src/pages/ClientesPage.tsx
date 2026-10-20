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
  CreditCard,
  ShoppingBag,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { ICliente, IClienteCriacaoDTO, IVendaCompleta } from '../types';
import { clientesApi, vendasApi } from '../services/api';
import { formatarCPF, validarCPF } from '../utils/cpf.validator';
import { formatarTelefone } from '../utils/formatters';
import { exportarParaCSV, exportarParaExcel, exportarRelatorioPDF } from '../utils/exportUtils';
import { useToast } from '../contexts/ToastContext';
import { ClienteComprasModal } from '../components/ClienteComprasModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const ClientesPage: React.FC = () => {
  const { adicionarToast } = useToast();

  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [vendas, setVendas] = useState<IVendaCompleta[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [menuExportarAberto, setMenuExportarAberto] = useState<boolean>(false);

  // Modal de Compras e Relatório do Cliente
  const [clienteCompras, setClienteCompras] = useState<ICliente | null>(null);
  const [modalComprasAberto, setModalComprasAberto] = useState<boolean>(false);
  const [vendaRecibo, setVendaRecibo] = useState<IVendaCompleta | null>(null);
  const [modalReciboAberto, setModalReciboAberto] = useState<boolean>(false);

  // Modal de Cadastro
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [nome, setNome] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);

  useEffect(() => {
    carregarClientes();
    carregarVendas();
  }, []);

  const carregarVendas = async () => {
    try {
      const lista = await vendasApi.listar();
      setVendas(lista);
    } catch {
      // Ignora erro inicial
    }
  };

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

  const comCpfValido = clientes.filter((c) => validarCPF(c.cpf)).length;
  const comEmail = clientes.filter((c) => !!c.email).length;
  const comTelefone = clientes.filter((c) => !!c.telefone).length;

  const contarComprasCliente = (cli: ICliente) => {
    return vendas.filter((v) => {
      const mesmoId = v.cliente_id === cli.id;
      const mesmoCpf =
        v.cliente_cpf && cli.cpf && v.cliente_cpf.replace(/\D/g, '') === cli.cpf.replace(/\D/g, '');
      return mesmoId || mesmoCpf;
    }).length;
  };

  const abrirRelatorioCompras = (cli: ICliente) => {
    setClienteCompras(cli);
    setModalComprasAberto(true);
  };

  const colunasClientes = ['Nome do Cliente', 'CPF', 'Telefone', 'E-mail', 'Status', 'Total de Compras'];
  const obterLinhasClientes = () =>
    clientesFiltrados.map((cli) => [
      cli.nome,
      formatarCPF(cli.cpf),
      cli.telefone || 'N/I',
      cli.email || 'N/I',
      'Verificado (Receita Federal)',
      `${contarComprasCliente(cli)} compras`,
    ]);

  const handleExportarExcelGeral = () => {
    setMenuExportarAberto(false);
    const linhas = obterLinhasClientes();
    const totais = [
      { label: 'Total de Clientes Cadastrados', valor: String(clientesFiltrados.length) },
      { label: 'Clientes com Telefone', valor: String(comTelefone) },
      { label: 'Clientes com E-mail', valor: String(comEmail) },
    ];
    exportarParaExcel('base_clientes_ms2', 'Base de Clientes & Fidelização', colunasClientes, linhas, totais);
    adicionarToast('success', 'Excel Gerado!', 'Base de clientes exportada em Excel.');
  };

  const handleExportarCSVGeral = () => {
    setMenuExportarAberto(false);
    exportarParaCSV('base_clientes_ms2', colunasClientes, obterLinhasClientes());
    adicionarToast('success', 'CSV Exportado!', 'Arquivo CSV gerado com sucesso.');
  };

  const handleExportarPDFGeral = () => {
    setMenuExportarAberto(false);
    const linhas = obterLinhasClientes();
    const totais = [{ label: 'Total de Clientes', valor: String(clientesFiltrados.length) }];
    exportarRelatorioPDF({
      titulo: 'Base de Clientes & Fidelização',
      subtitulo: 'Sistema Homologado MS² Vestuário • Validação Módulo 11',
      colunas: colunasClientes,
      linhas,
      totais,
    });
    adicionarToast('info', 'Gerando PDF', 'Janela de impressão A4 aberta.');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>Base de Clientes & Fidelização</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identificação segura com algoritmo oficial da Receita Federal (Módulo 11 - RN-01) e histórico de compras
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Menu Dropdown de Exportação Geral */}
          <div className="relative">
            <button
              onClick={() => setMenuExportarAberto(!menuExportarAberto)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2 transition-all btn-interactive"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Exportar Base</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {menuExportarAberto && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-card border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-30 animate-in fade-in">
                <button
                  onClick={handleExportarExcelGeral}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Planilha Excel (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportarPDFGeral}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Relatório PDF (A4)</span>
                </button>
                <button
                  onClick={handleExportarCSVGeral}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                  <span>Arquivo CSV (UTF-8)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setModalAberto(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-indigo btn-interactive"
          >
            <UserPlus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Top Bento Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Cadastrado</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 font-mono">{clientes.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CPFs Validados</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">{comCpfValido}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Com Contato (Email)</span>
            <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">{comEmail}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Com WhatsApp/Telefone</span>
            <p className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5 font-mono">{comTelefone}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-lg">
        <div className="relative max-w-md">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome, CPF ou e-mail..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs placeholder-slate-400 dark:placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Visualização em Tabela para Desktop (>= lg) */}
      <div className="hidden lg:block glass-card rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Nome do Cliente</th>
                <th className="py-3.5 px-4">CPF (Validado Módulo 11)</th>
                <th className="py-3.5 px-4">Telefone / WhatsApp</th>
                <th className="py-3.5 px-4">E-mail</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Compras & Relatório</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {carregando ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    Carregando base de clientes...
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    Nenhum cliente localizado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cli) => (
                  <tr key={cli.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs">
                        {cli.nome.charAt(0)}
                      </div>
                      <span>{cli.nome}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-200">
                      {formatarCPF(cli.cpf)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {formatarTelefone(cli.telefone)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {cli.email || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" /> Verificado
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => abrirRelatorioCompras(cli)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-bold transition-all btn-interactive"
                        title="Ver Todas as Compras do Cliente e Exportar Relatório"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Ver Compras ({contarComprasCliente(cli)})</span>
                      </button>
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
          <div className="col-span-full py-16 text-center text-slate-400">Carregando base de clientes...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">Nenhum cliente localizado.</div>
        ) : (
          clientesFiltrados.map((cli) => (
            <div
              key={cli.id}
              className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    {cli.nome.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{cli.nome}</h4>
                    <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {formatarCPF(cli.cpf)}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shrink-0">
                  Verificado
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{formatarTelefone(cli.telefone)}</span>
                </div>
                {cli.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cli.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {contarComprasCliente(cli)} compras
                </span>
                <button
                  type="button"
                  onClick={() => abrirRelatorioCompras(cli)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs btn-interactive"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Ver Compras</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro de Cliente */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-card border border-blue-500/30 shadow-2xl overflow-hidden">
            <div className="bg-blue-500/10 dark:bg-blue-500/15 border-b border-blue-500/20 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Cadastrar Cliente</h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Beatriz Albuquerque"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    CPF (com Validação Módulo 11) <span className="text-rose-500">*</span>
                  </label>
                  {cpfValido !== null && (
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        cpfValido ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {cpfValido ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Módulo 11 Válido
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Dígitos Inválidos
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono ${
                      cpfValido === false
                        ? 'border-rose-500/80 focus:border-rose-500'
                        : cpfValido === true
                        ? 'border-emerald-500/80 focus:border-emerald-500'
                        : ''
                    }`}
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Rejeita duplicidade e validação matemática oficial do algoritmo da Receita.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(21) 98888-7777"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  E-mail (Opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
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
                  disabled={salvando || cpfValido === false}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-glow-indigo disabled:opacity-50 btn-interactive"
                >
                  {salvando ? 'Salvando...' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Compras e Relatório Analítico do Cliente */}
      <ClienteComprasModal
        aberto={modalComprasAberto}
        onClose={() => setModalComprasAberto(false)}
        cliente={clienteCompras}
        vendas={vendas}
        onAbrirRecibo={(venda) => {
          setVendaRecibo(venda);
          setModalReciboAberto(true);
        }}
      />

      {/* Modal de Recibo Térmico */}
      <ReceiptModal
        aberto={modalReciboAberto}
        onClose={() => setModalReciboAberto(false)}
        venda={vendaRecibo}
      />
    </div>
  );
};
