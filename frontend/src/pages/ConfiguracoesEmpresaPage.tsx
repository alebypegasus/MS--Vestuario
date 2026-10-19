import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  Printer,
  Phone,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { empresaApi } from '../services/api';
import { IEmpresa } from '../types';
import { useToast } from '../contexts/ToastContext';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { HomologacaoModal } from '../components/HomologacaoModal';

export const ConfiguracoesEmpresaPage: React.FC = () => {
  const { adicionarToast } = useToast();
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [modalHomologacaoAberto, setModalHomologacaoAberto] = useState<boolean>(false);

  const [form, setForm] = useState<IEmpresa>({
    id: 1,
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    telefone: '',
    email: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: 'RJ',
    cep: '',
    regime_tributario: 'Simples Nacional',
    mensagem_cupom: '',
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setCarregando(true);
      const dados = await empresaApi.obter();
      if (dados) {
        setForm(dados);
      }
    } catch (err: any) {
      adicionarToast('error', 'Erro ao carregar dados da empresa', err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (campo: keyof IEmpresa, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvando(true);
      const atualizado = await empresaApi.atualizar(form);
      setForm(atualizado);
      adicionarToast(
        'success',
        'Configurações Atualizadas!',
        'Dados da empresa e parâmetros fiscais salvos. Eles já constam na Nota Fiscal/Cupom.'
      );
    } catch (err: any) {
      adicionarToast('error', 'Falha ao Salvar', err.message || 'Erro ao comunicar com a API');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="w-full px-4 py-24 text-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Carregando configurações da empresa...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-sm border border-cyan-500/20">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Configurações da Empresa & Dados Fiscais</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30">
                  Exclusivo Administrador
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Parâmetros emitidos em comprovantes térmicos, notas de balcão e E-Notas simuladas
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalHomologacaoAberto(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-2 transition-all shadow-xs btn-interactive self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>Dossiê de Homologação</span>
        </button>
      </div>

      {/* Bento Grid: Cards de Resumo Fiscal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Identificação Fiscal
            </span>
            <FileText className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {form.razao_social || 'Razão Social não definida'}
          </div>
          <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 mt-1">
            CNPJ: {form.cnpj || 'Não informado'}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Localização do Estabelecimento
            </span>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {form.cidade ? `${form.cidade} - ${form.uf}` : 'Endereço não configurado'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
            {form.logradouro ? `${form.logradouro}, ${form.numero}` : 'Sem logradouro'}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Regime & Cupom
            </span>
            <Printer className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {form.regime_tributario || 'Simples Nacional'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sincronização em tempo real ativa
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Formulário de Configuração (Esquerda) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-xl space-y-5">
            {/* Seção 1: Identificação Jurídica */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Identificação Jurídica & Razão Social
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Razão Social Completa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.razao_social}
                    onChange={(e) => handleChange('razao_social', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Fantasia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nome_fantasia}
                    onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CNPJ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.cnpj}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Inscrição Estadual (IE)
                  </label>
                  <input
                    type="text"
                    value={form.inscricao_estadual || ''}
                    onChange={(e) => handleChange('inscricao_estadual', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Regime Tributário
                  </label>
                  <select
                    value={form.regime_tributario || 'Simples Nacional'}
                    onChange={(e) => handleChange('regime_tributario', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Simples Nacional">Simples Nacional (ME/EPP)</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção 2: Contato */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Canais de Contato
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={form.telefone || ''}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    placeholder="(21) 3456-7890"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    value={form.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contato@ms2vestuario.com.br"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Endereço do Estabelecimento */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Endereço Físico do Ponto de Venda
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CEP</label>
                  <input
                    type="text"
                    value={form.cep}
                    onChange={(e) => handleChange('cep', e.target.value)}
                    placeholder="20000-000"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Logradouro / Rua</label>
                  <input
                    type="text"
                    value={form.logradouro}
                    onChange={(e) => handleChange('logradouro', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Número</label>
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) => handleChange('numero', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={form.complemento || ''}
                    onChange={(e) => handleChange('complemento', e.target.value)}
                    placeholder="Loja A, Sala 101"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => handleChange('bairro', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={form.uf}
                    onChange={(e) => handleChange('uf', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Mensagem Personalizada do Cupom */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mensagem Padrão de Rodapé (Cupom Fiscal / E-Nota)
              </label>
              <textarea
                value={form.mensagem_cupom || ''}
                onChange={(e) => handleChange('mensagem_cupom', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <ShimmerButton
                type="submit"
                disabled={salvando}
                className="w-full sm:w-auto h-11 px-8 text-xs font-bold btn-interactive shadow-md"
              >
                {salvando ? 'Salvando...' : 'Salvar Dados Fiscais da Empresa'}
              </ShimmerButton>
            </div>
          </form>
        </div>

        {/* Pré-visualização Dinâmica da Nota Fiscal / Cupom (Direita) */}
        <div className="lg:col-span-5 space-y-3 sticky top-20">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Preview da E-Nota / Cupom Térmico
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Live Sync
            </span>
          </div>

          <div className="rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-amber-50/70 dark:bg-slate-950 p-5 sm:p-6 font-mono text-[11px] text-slate-800 dark:text-slate-300 space-y-4 shadow-lg dark:shadow-2xl relative overflow-hidden">
            {/* Logo e Cabeçalho */}
            <div className="text-center border-b border-dashed border-slate-400 dark:border-slate-700 pb-3">
              <img
                src="/logo.png"
                alt="Logo MS² Vestuário"
                className="w-12 h-12 mx-auto rounded-xl object-contain mb-2 shadow-sm bg-slate-900 border border-slate-700"
              />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {form.razao_social || 'MS² VESTUÁRIO LTDA'}
              </h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                Nome Fantasia: {form.nome_fantasia || 'MS² Vestuário'}
              </p>
              <p className="text-[10px] text-slate-700 dark:text-slate-400 font-bold">
                CNPJ: {form.cnpj || '00.000.000/0000-00'} | IE: {form.inscricao_estadual || 'ISENTO'}
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                {form.logradouro}, {form.numero} {form.complemento ? `- ${form.complemento}` : ''}
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                {form.bairro} - {form.cidade} / {form.uf} - CEP {form.cep}
              </p>
              {form.telefone && (
                <p className="text-[10px] text-slate-600 dark:text-slate-400">Tel: {form.telefone}</p>
              )}
              <div className="mt-2 py-0.5 px-2 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 rounded font-bold text-[9px] inline-block border border-emerald-500/30">
                DOCUMENTO AUXILIAR DE VENDA (E-NOTA SIMULADA)
              </div>
            </div>

            {/* Simulação de Itens */}
            <div className="space-y-1.5 border-b border-dashed border-slate-400 dark:border-slate-700 pb-3">
              <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400 text-[10px]">
                <span>ITEM / CÓD / DESC</span>
                <span>TOTAL (R$)</span>
              </div>
              <div className="flex justify-between text-slate-800 dark:text-slate-200">
                <span>01 [101] Camiseta Básica Algodão 1x</span>
                <span>R$ 49,90</span>
              </div>
              <div className="flex justify-between text-slate-800 dark:text-slate-200">
                <span>02 [103] Calça Jeans Slim Azul 1x</span>
                <span>R$ 159,90</span>
              </div>
            </div>

            {/* Totais */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span>R$ 209,80</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-black text-sm pt-1 border-t border-slate-300 dark:border-slate-800">
                <span>TOTAL PAGO:</span>
                <span>R$ 209,80</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-0.5 text-[10px]">
                <span>Regime Tributário:</span>
                <span className="font-bold">{form.regime_tributario}</span>
              </div>
            </div>

            {/* Mensagem Fiscal e Rodapé */}
            <div className="border-t border-dashed border-slate-400 dark:border-slate-700 pt-3 text-center text-[10px] text-slate-600 dark:text-slate-400">
              <p className="italic">{form.mensagem_cupom || 'Obrigado pela preferência!'}</p>
              <p className="text-[9px] text-slate-500 mt-2">
                MS² Vestuário &bull; Sistema de Gestão Comercial e PDV
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Homologação Técnica & Fiscal */}
      <HomologacaoModal
        aberto={modalHomologacaoAberto}
        onFechar={() => setModalHomologacaoAberto(false)}
      />
    </div>
  );
};
