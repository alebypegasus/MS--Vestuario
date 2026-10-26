import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle2, AlertCircle, ShieldCheck, Phone, Mail, User, CreditCard, Sparkles } from 'lucide-react';
import { ICliente, IClienteCriacaoDTO } from '../types';
import { clientesApi } from '../services/api';
import { validarCPF, formatarCPF, limparCPF } from '../utils/cpf.validator';
import { obterExemploCliente } from '../utils/dataGenerators';
import { useToast } from '../contexts/ToastContext';

export interface IQuickClienteModalProps {
  aberto: boolean;
  aoFechar: () => void;
  aoClienteCriado: (cliente: ICliente) => void;
  nomeInicial?: string;
}

export const QuickClienteModal: React.FC<IQuickClienteModalProps> = ({
  aberto,
  aoFechar,
  aoClienteCriado,
  nomeInicial = '',
}) => {
  const { adicionarToast } = useToast();

  const [nome, setNome] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setNome(nomeInicial);
      setCpf('');
      setTelefone('');
      setEmail('');
      setErroValidacao(null);
    }
  }, [aberto, nomeInicial]);

  if (!aberto) return null;

  const cpfLimpo = limparCPF(cpf);
  const cpfValido = cpfLimpo.length === 11 ? validarCPF(cpfLimpo) : null;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarCPF(e.target.value);
    setCpf(formatado);
    setErroValidacao(null);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 6) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
    } else if (valor.length > 2) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    }
    setTelefone(valor);
  };

  const handlePreencherExemplo = () => {
    const exemplo = obterExemploCliente();
    setNome(exemplo.nome);
    setCpf(formatarCPF(exemplo.cpf));
    setTelefone(exemplo.telefone);
    setEmail(exemplo.email);
    setErroValidacao(null);
    adicionarToast('info', 'Exemplo Gerado', `Cliente ${exemplo.nome} gerado com CPF Módulo 11 válido.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroValidacao(null);

    const nomeFormatado = nome.trim();
    if (nomeFormatado.length < 2) {
      setErroValidacao('Informe o nome completo do cliente (mínimo 2 letras).');
      return;
    }

    if (!cpfValido) {
      setErroValidacao('Informe um CPF válido de acordo com o algoritmo oficial da Receita Federal (Receita Federal).');
      return;
    }

    try {
      setSalvando(true);
      const payload: IClienteCriacaoDTO = {
        nome: nomeFormatado,
        cpf: cpfLimpo,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
      };

      const novoCliente = await clientesApi.criar(payload);
      adicionarToast('success', 'Cliente Cadastrado!', `${novoCliente.nome} foi cadastrado e vinculado à venda.`);
      aoClienteCriado(novoCliente);
      aoFechar();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erro ao cadastrar cliente.';
      setErroValidacao(msg);
      adicionarToast('error', 'Erro no Cadastro', msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Adicionar Novo Cliente
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  PDV Ágil
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acesso liberado para Caixa, Gerente e Administrador
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreencherExemplo}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all"
              title="Preenche dados com CPF válido oficial"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Exemplo</span>
            </button>
            <button
              type="button"
              onClick={aoFechar}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Mensagem de Erro se houver */}
          {erroValidacao && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{erroValidacao}</span>
            </div>
          )}

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Nome Completo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Mariana Silva Souza"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          {/* CPF com Validação Oficial Módulo 11 (Validação CPF) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                CPF (Receita Federal) <span className="text-rose-500">*</span>
              </label>
              {cpfLimpo.length === 11 && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cpfValido
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {cpfValido ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> CPF Válido
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-rose-500" /> CPF Inválido
                    </>
                  )}
                </span>
              )}
            </div>
            <input
              type="text"
              required
              maxLength={14}
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              className={`w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 transition-all ${
                cpfLimpo.length === 11
                  ? cpfValido
                    ? 'border-emerald-500 focus:ring-emerald-500'
                    : 'border-rose-500 focus:ring-rose-500'
                  : 'focus:ring-blue-500'
              }`}
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Validação matemática em tempo real com bloqueio de duplicatas.
            </p>
          </div>

          {/* Grid com Telefone e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={telefone}
                onChange={handleTelefoneChange}
                placeholder="(21) 98765-4321"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                E-mail (Opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Rodapé e Botões */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={aoFechar}
              disabled={salvando}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || (cpfLimpo.length === 11 && !cpfValido)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-indigo disabled:opacity-50 btn-interactive"
            >
              {salvando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Cadastrar & Vincular à Venda
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
