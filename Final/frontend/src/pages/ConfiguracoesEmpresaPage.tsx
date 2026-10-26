import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  FileText,
  Printer,
  Phone,
  MapPin,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
  Globe,
  Type,
} from 'lucide-react';
import { empresaApi } from '../services/api';
import { IEmpresa } from '../types';
import { useToast } from '../contexts/ToastContext';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { HomologacaoModal } from '../components/HomologacaoModal';
import { obterExemploEmpresa } from '../utils/dataGenerators';

export const ConfiguracoesEmpresaPage: React.FC = () => {
  const { adicionarToast } = useToast();
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [modalHomologacaoAberto, setModalHomologacaoAberto] = useState<boolean>(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

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
    logo_url: '',
    logo_texto: '',
    favicon_url: '',
    segmento: 'GERAL',
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const aplicarFaviconNoNavegador = (url?: string | null) => {
    if (!url) return;
    try {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = url;
    } catch {
      // Ignora erro no ambiente de teste
    }
  };

  const carregarConfiguracoes = async () => {
    try {
      setCarregando(true);
      const dados = await empresaApi.obter();
      if (dados) {
        setForm(dados);
        aplicarFaviconNoNavegador(dados.favicon_url);
      }
    } catch (err: any) {
      adicionarToast('error', 'Erro ao carregar dados da empresa', err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (campo: keyof IEmpresa, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (campo === 'favicon_url') {
      aplicarFaviconNoNavegador(valor);
    }
  };

  const handlePreencherExemplo = () => {
    const exemplo = obterExemploEmpresa();
    setForm((prev) => ({
      ...prev,
      ...exemplo,
    }));
    aplicarFaviconNoNavegador(exemplo.favicon_url);
    adicionarToast('success', 'Dados Preenchidos!', 'Exemplo de empresa e parâmetros fiscais aplicados com sucesso.');
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        adicionarToast('warning', 'Arquivo Grande', 'Recomendamos imagens com menos de 2MB');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleChange('logo_url', base64);
        adicionarToast('success', 'Logotipo Carregado', 'A imagem foi carregada. Salve para aplicar no sistema e notas.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleChange('favicon_url', base64);
        adicionarToast('success', 'Favicon Carregado', 'O ícone da aba foi atualizado. Salve para confirmar.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverLogo = () => {
    handleChange('logo_url', '');
    if (logoInputRef.current) logoInputRef.current.value = '';
    adicionarToast('info', 'Logotipo Removido', 'A logo foi removida.');
  };

  const handleRemoverFavicon = () => {
    handleChange('favicon_url', '');
    if (faviconInputRef.current) faviconInputRef.current.value = '';
    adicionarToast('info', 'Favicon Removido', 'O favicon foi restaurado para o padrão.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvando(true);
      const atualizado = await empresaApi.atualizar(form);
      setForm(atualizado);
      aplicarFaviconNoNavegador(atualizado.favicon_url);
      adicionarToast(
        'success',
        'Configurações Atualizadas!',
        'Dados da empresa, logotipo, logo em texto e favicon salvos com sucesso.'
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
      {/* Header com Facilitador de Preenchimento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-sm border border-cyan-500/20">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Configurações da Empresa & Identidade Visual</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30">
                  Exclusivo Administrador
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Logotipo da marca, logo em texto, favicon da aba, DANFE NFC-e e parâmetros fiscais
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Facilitador de Preenchimento */}
          <button
            type="button"
            onClick={handlePreencherExemplo}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all shadow-xs btn-interactive"
            title="Preencher com dados corporativos de teste com 1 clique"
          >
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Preencher Exemplo</span>
          </button>

          <button
            type="button"
            onClick={() => setModalHomologacaoAberto(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all shadow-xs btn-interactive"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Dossiê de Homologação</span>
          </button>
        </div>
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
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Logo, texto e favicon ativos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Formulário de Configuração (Esquerda) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-xl space-y-6">
            
            {/* Seção 0: Identidade Visual Completa (Logo Imagem, Logo Texto, Favicon) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                  Identidade Visual: Logotipo, Logo em Texto & Favicon
                </h3>
              </div>

              {/* 1. Logotipo Oficial em Imagem */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  1. Logotipo em Imagem (Para Cupom, NFC-e e Navbar)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3.5">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2 overflow-hidden shadow-inner shrink-0">
                    {form.logo_url ? (
                      <img
                        src={form.logo_url}
                        alt="Logotipo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 text-center p-1">
                        <ImageIcon className="w-5 h-5 mb-0.5 opacity-40" />
                        <span className="text-[9px] font-semibold">Sem Imagem</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoFile}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Anexar Logo do Computador</span>
                      </button>

                      {form.logo_url && (
                        <button
                          type="button"
                          onClick={handleRemoverLogo}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={form.logo_url || ''}
                      onChange={(e) => handleChange('logo_url', e.target.value)}
                      placeholder="Ou cole a URL da logo (https://...)"
                      className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Logotipo em Texto */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-500" />
                  2. Logotipo em Texto / Slogan Tipográfico da Marca
                </label>
                <input
                  type="text"
                  value={form.logo_texto || ''}
                  onChange={(e) => handleChange('logo_texto', e.target.value)}
                  placeholder="Ex: VOGUE & STYLE • ALTA MODA (ou deixe em branco para usar o Nome Fantasia)"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-black tracking-wider uppercase"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Exibido na barra de navegação superior e cabeçalhos caso a empresa não utilize logotipo em imagem.
                </span>
              </div>

              {/* 3. Favicon da Aba do Navegador */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-teal-500" />
                  3. Favicon da Aba do Navegador (.ico, .png ou .svg)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-xs">
                    {form.favicon_url ? (
                      <img
                        src={form.favicon_url}
                        alt="Favicon"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe className="w-5 h-5 text-slate-400 opacity-50" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      ref={faviconInputRef}
                      onChange={handleFaviconFile}
                      accept="image/x-icon,image/png,image/svg+xml,image/jpeg"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Anexar Favicon</span>
                      </button>

                      {form.favicon_url && (
                        <button
                          type="button"
                          onClick={handleRemoverFavicon}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={form.favicon_url || ''}
                      onChange={(e) => handleChange('favicon_url', e.target.value)}
                      placeholder="Ou cole a URL do Favicon (https://...)"
                      className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 0: Ramo / Segmento de Atuação Comercial (Multi-Ramo) */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Ramo de Atuação do Estabelecimento (Sistema Universal)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                  Multi-Nicho
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Selecione o ramo da sua empresa para otimizar os cadastros de produtos, unidades de medida (UN, KG, PAR) e atributos específicos.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Segmento Principal
                  </label>
                  <select
                    value={form.segmento || 'GERAL'}
                    onChange={(e) => handleChange('segmento', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                  >
                    <option value="GERAL">Varejo Geral & Multiloja</option>
                    <option value="VESTUARIO">Vestuário, Moda & Acessórios</option>
                    <option value="INFORMATICA">Informática, Celulares & Eletrônicos</option>
                    <option value="SAPATOS">Calçados, Tênis & Sapataria</option>
                    <option value="CONFEITARIA_PADARIA">Confeitaria, Doceria & Panificação</option>
                    <option value="COSMETICOS">Cosméticos, Perfumaria & Beleza</option>
                    <option value="FARMACIA">Farmácia & Drogaria</option>
                    <option value="MERCADO">Supermercado, Empório & Mercearia</option>
                    <option value="OUTRO">Outro Ramo Comercial</option>
                  </select>
                </div>
                <div className="flex items-center p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                  <span>
                    💡 <strong>Flexibilidade Total:</strong> você pode cadastrar qualquer produto com unidades (UN, KG, L, PAR), código de barras EAN, datas de validade para alimentos ou garantias técnicas para eletrônicos.
                  </span>
                </div>
              </div>
            </div>

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
                    placeholder="Isento se não houver"
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
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                    <option value="MEI - Microempreendedor">MEI - Microempreendedor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção 2: Contato Corporativo */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Canais de Contato & SAC
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone de Atendimento
                  </label>
                  <input
                    type="text"
                    value={form.telefone || ''}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    placeholder="(00) 0000-0000"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    value={form.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Endereço do Estabelecimento */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Endereço Fiscal do Estabelecimento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CEP</label>
                  <input
                    type="text"
                    value={form.cep}
                    onChange={(e) => handleChange('cep', e.target.value)}
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
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={form.complemento || ''}
                    onChange={(e) => handleChange('complemento', e.target.value)}
                    placeholder="Ex: Loja 01, Sala 202"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => handleChange('bairro', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
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
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          {/* Preview da Aba do Navegador com Favicon */}
          <div className="p-3 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Simulação da Aba do Navegador (Favicon & Título)
            </span>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs">
              <div className="w-4 h-4 rounded shrink-0 overflow-hidden flex items-center justify-center">
                {form.favicon_url ? (
                  <img src={form.favicon_url} alt="Favicon" className="w-4 h-4 object-contain" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                )}
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {form.nome_fantasia || 'Sistema de Gestão & PDV'} • Terminal
              </span>
            </div>
          </div>

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
              {form.logo_url && (
                <img
                  src={form.logo_url}
                  alt="Logo da Empresa"
                  className="h-12 w-auto mx-auto object-contain mb-2 dark:brightness-125"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              {form.logo_texto && (
                <div className="text-xs font-black tracking-widest text-indigo-700 dark:text-indigo-400 uppercase mb-1">
                  {form.logo_texto}
                </div>
              )}
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {form.razao_social || 'EMPRESA COMÉRCIO LTDA'}
              </h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                Nome Fantasia: {form.nome_fantasia || 'Nome Fantasia'}
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
                <span>01 [101] Produto Exemplo A 1x</span>
                <span>R$ 49,90</span>
              </div>
              <div className="flex justify-between text-slate-800 dark:text-slate-200">
                <span>02 [103] Produto Exemplo B 1x</span>
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
                {form.nome_fantasia || 'Sistema de Gestão & PDV'}
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
