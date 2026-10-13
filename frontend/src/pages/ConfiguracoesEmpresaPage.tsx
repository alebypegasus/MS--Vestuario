import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  Printer,
  Phone,
  MapPin,
} from 'lucide-react';
import { empresaApi } from '../services/api';
import { IEmpresa } from '../types';
import { useToast } from '../contexts/ToastContext';
import { ShimmerButton } from '../components/ui/shimmer-button';

export const ConfiguracoesEmpresaPage: React.FC = () => {
  const { adicionarToast } = useToast();
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);

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
    uf: '',
    cep: '',
    regime_tributario: 'Simples Nacional',
    mensagem_cupom: '',
  });

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  const carregarConfiguracao = async () => {
    try {
      setCarregando(true);
      const dados = await empresaApi.obter();
      setForm(dados);
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
        'Configurações Salvas!',
        'As informações fiscais e de endereço foram atualizadas para todos os comprovantes e notas.'
      );
    } catch (err: any) {
      adicionarToast('error', 'Falha ao salvar configurações', err.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="py-24 text-center text-slate-400">
        Carregando parâmetros cadastrais e fiscais da empresa...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-400" />
            Configurações da Empresa & Dados Fiscais
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Informações que compõem o cabeçalho e rodapé da Nota Fiscal, E-Nota e Comprovante do PDV
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Configuração (Esquerda) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5">
            {/* Seção 1: Identificação Jurídica */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Identificação Jurídica & Razão Social
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Razão Social Completa <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.razao_social}
                    onChange={(e) => handleChange('razao_social', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Fantasia <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nome_fantasia}
                    onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CNPJ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.cnpj}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Inscrição Estadual (IE)
                  </label>
                  <input
                    type="text"
                    value={form.inscricao_estadual || ''}
                    onChange={(e) => handleChange('inscricao_estadual', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Regime Tributário
                  </label>
                  <select
                    value={form.regime_tributario || 'Simples Nacional'}
                    onChange={(e) => handleChange('regime_tributario', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  >
                    <option value="Simples Nacional">Simples Nacional (ME/EPP)</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção 2: Contato */}
            <div className="pt-3 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                Canais de Contato
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={form.telefone || ''}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    placeholder="(21) 3456-7890"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    value={form.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contato@ms2vestuario.com.br"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Endereço do Estabelecimento */}
            <div className="pt-3 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Endereço Físico do Ponto de Venda
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CEP</label>
                  <input
                    type="text"
                    value={form.cep}
                    onChange={(e) => handleChange('cep', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Logradouro / Rua</label>
                  <input
                    type="text"
                    value={form.logradouro}
                    onChange={(e) => handleChange('logradouro', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Número</label>
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) => handleChange('numero', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={form.complemento || ''}
                    onChange={(e) => handleChange('complemento', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => handleChange('bairro', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={form.uf}
                    onChange={(e) => handleChange('uf', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Mensagem Personalizada do Cupom */}
            <div className="pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mensagem Padrão de Rodapé (Cupom Fiscal / E-Nota)
              </label>
              <textarea
                value={form.mensagem_cupom || ''}
                onChange={(e) => handleChange('mensagem_cupom', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <ShimmerButton
                type="submit"
                disabled={salvando}
                className="w-full sm:w-auto h-11 px-8 text-xs font-bold"
              >
                {salvando ? 'Salvando...' : 'Salvar Dados Fiscais da Empresa'}
              </ShimmerButton>
            </div>
          </form>
        </div>

        {/* Pré-visualização Dinâmica da Nota Fiscal / Cupom (Direita) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-emerald-400" />
              Preview em Tempo Real da E-Nota / Cupom
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-slate-950 p-6 font-mono text-[11px] text-slate-300 space-y-4 shadow-2xl relative overflow-hidden">
            {/* Logo e Cabeçalho */}
            <div className="text-center border-b border-dashed border-slate-700 pb-3">
              <img
                src="/logo.png"
                alt="Logo MS² Vestuário"
                className="w-12 h-12 mx-auto rounded-xl object-contain mb-2 shadow-lg"
              />
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                {form.razao_social || 'MS² VESTUÁRIO LTDA'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Nome Fantasia: {form.nome_fantasia || 'MS² Vestuário'}
              </p>
              <p className="text-[10px] text-slate-400 font-bold">
                CNPJ: {form.cnpj || '00.000.000/0000-00'} | IE: {form.inscricao_estadual || 'ISENTO'}
              </p>
              <p className="text-[10px] text-slate-400">
                {form.logradouro}, {form.numero} {form.complemento ? `- ${form.complemento}` : ''}
              </p>
              <p className="text-[10px] text-slate-400">
                {form.bairro} - {form.cidade} / {form.uf} - CEP {form.cep}
              </p>
              {form.telefone && (
                <p className="text-[10px] text-slate-400">Tel: {form.telefone}</p>
              )}
              <div className="mt-2 py-0.5 px-2 bg-emerald-500/10 text-emerald-300 rounded font-bold text-[10px] inline-block">
                DOCUMENTO AUXILIAR DE VENDA (E-NOTA SIMULADA)
              </div>
            </div>

            {/* Simulação de Itens */}
            <div className="space-y-1.5 border-b border-dashed border-slate-700 pb-3">
              <div className="flex justify-between font-bold text-slate-400 text-[10px]">
                <span>ITEM / CÓD / DESC</span>
                <span>TOTAL (R$)</span>
              </div>
              <div className="flex justify-between text-slate-200">
                <span>01 [101] Camiseta Básica Algodão 1x</span>
                <span>R$ 49,90</span>
              </div>
              <div className="flex justify-between text-slate-200">
                <span>02 [103] Calça Jeans Slim Azul 1x</span>
                <span>R$ 159,90</span>
              </div>
            </div>

            {/* Totais */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>R$ 209,80</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-slate-800">
                <span>TOTAL PAGO:</span>
                <span>R$ 209,80</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-0.5">
                <span>Regime:</span>
                <span className="font-bold">{form.regime_tributario}</span>
              </div>
            </div>

            {/* Mensagem Fiscal e Rodapé */}
            <div className="border-t border-dashed border-slate-700 pt-3 text-center text-[10px] text-slate-400">
              <p className="italic">{form.mensagem_cupom || 'Obrigado pela preferência!'}</p>
              <p className="text-[9px] text-slate-500 mt-2">
                MS² Vestuário &bull; Sistema de Gestão Comercial e PDV
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
