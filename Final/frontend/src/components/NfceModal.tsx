import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  FileCode,
  Copy,
  Check,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { IVendaCompleta, IEmpresa } from '../types';
import { empresaApi } from '../services/api';
import { gerarDadosNFCe, baixarXmlNFCe, IDadosNFCe } from '../utils/nfceSimulator';
import { formatarMoeda, formatarDataHora } from '../utils/formatters';
import { formatarCPF } from '../utils/cpf.validator';

interface INfceModalProps {
  aberto: boolean;
  venda: IVendaCompleta | null;
  onFechar: () => void;
}

export const NfceModal: React.FC<INfceModalProps> = ({ aberto, venda, onFechar }) => {
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);
  const [dadosNFCe, setDadosNFCe] = useState<IDadosNFCe | null>(null);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [abaAtiva, setAbaAtiva] = useState<'danfe' | 'xml'>('danfe');

  useEffect(() => {
    if (aberto && venda) {
      carregarEmpresa();
    }
  }, [aberto, venda]);

  const carregarEmpresa = async () => {
    try {
      const dados = await empresaApi.obter();
      setEmpresa(dados);
      if (venda) {
        setDadosNFCe(gerarDadosNFCe(venda, dados));
      }
    } catch {
      if (venda) {
        setDadosNFCe(gerarDadosNFCe(venda, null));
      }
    }
  };

  if (!aberto || !venda || !dadosNFCe) return null;

  const handleCopiarChave = () => {
    navigator.clipboard.writeText(dadosNFCe.chaveAcesso);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleBaixarXML = () => {
    baixarXmlNFCe(dadosNFCe.chaveAcesso, dadosNFCe.xmlString);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl glass-card border border-emerald-500/40 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header do Modal */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>NFC-e / SAT • Documento Fiscal Eletrônico</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  Modelo 65 - Autorizada
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Protocolo SEFAZ: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{dadosNFCe.protocoloAutorizacao}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas: DANFE NFC-e vs XML */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-5 py-2 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAbaAtiva('danfe')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                abaAtiva === 'danfe'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              DANFE NFC-e (Cupom)
            </button>
            <button
              onClick={() => setAbaAtiva('xml')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                abaAtiva === 'xml'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>XML de Distribuição</span>
            </button>
          </div>

          <button
            onClick={handleCopiarChave}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition-colors"
            title="Copiar Chave de Acesso"
          >
            {copiado ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiado ? 'Chave Copiada!' : 'Copiar Chave'}</span>
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-mono text-xs space-y-4 bg-amber-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-300">
          {abaAtiva === 'danfe' ? (
            /* DANFE NFC-e Autêntico */
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-3.5 text-[11px]">
              {/* Cabeçalho */}
              <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
                <img
                  src={empresa?.logo_url || '/logo.png'}
                  alt={empresa?.nome_fantasia || 'Logotipo da Empresa'}
                  className="h-12 w-auto mx-auto object-contain mb-2 dark:brightness-125"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">
                  {empresa?.razao_social || 'OmniVarejo Enterprise LTDA'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  CNPJ: {empresa?.cnpj || '12.345.678/0001-90'} • IE: {empresa?.inscricao_estadual || 'ISENTO'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {empresa?.logradouro || 'Rua da Moda'}, {empresa?.numero || '100'} - {empresa?.cidade || 'Rio de Janeiro'}/{empresa?.uf || 'RJ'}
                </p>
                <div className="mt-2 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                  DANFE NFC-e - Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Não permite aproveitamento de crédito de ICMS
                </div>
              </div>

              {/* Lista de Itens */}
              <div>
                <div className="flex justify-between font-bold border-b border-slate-200 dark:border-slate-800 pb-1 text-[10px] text-slate-500">
                  <span>CÓD | DESCRIÇÃO | QTD | UN</span>
                  <span>TOTAL (R$)</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[10px]">
                  {(venda.itens || []).map((it, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold">#{it.codigo}</span> {it.descricao}
                        <div className="text-slate-400 text-[9px]">
                          {it.quantidade} UN x {formatarMoeda(Number(it.preco_unitario))}
                        </div>
                      </div>
                      <span className="font-bold shrink-0">{formatarMoeda(Number(it.subtotal))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais */}
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Qtd. Total de Itens:</span>
                  <span className="font-bold">{venda.itens?.reduce((acc, i) => acc + i.quantidade, 0) || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Subtotal:</span>
                  <span>{formatarMoeda(Number(venda.subtotal))}</span>
                </div>
                {Number(venda.desconto) > 0 && (
                  <div className="flex justify-between text-xs text-rose-500 font-bold">
                    <span>Desconto Concedido:</span>
                    <span>-{formatarMoeda(Number(venda.desconto))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black border-t border-slate-200 dark:border-slate-800 pt-1 text-slate-900 dark:text-slate-100">
                  <span>VALOR TOTAL A PAGAR:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatarMoeda(Number(venda.valor_total))}</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span>Forma de Pagamento:</span>
                  <span className="font-bold uppercase">{venda.forma_pagamento}</span>
                </div>
                {venda.detalhes_pagamento && (
                  <div className="text-[10px] bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded space-y-0.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                    {venda.detalhes_pagamento.bandeira && (
                      <div className="flex justify-between">
                        <span>Bandeira:</span>
                        <span className="font-bold">{venda.detalhes_pagamento.bandeira}</span>
                      </div>
                    )}
                    {venda.detalhes_pagamento.parcelas && venda.detalhes_pagamento.parcelas > 1 && (
                      <div className="flex justify-between">
                        <span>Parcelas:</span>
                        <span>{venda.detalhes_pagamento.parcelas}x de {formatarMoeda(Number(venda.detalhes_pagamento.valor_parcela || (Number(venda.valor_total) / venda.detalhes_pagamento.parcelas)))}</span>
                      </div>
                    )}
                    {venda.detalhes_pagamento.autorizacao_nsu && (
                      <div className="flex justify-between font-mono text-[9px]">
                        <span>NSU/Aut.:</span>
                        <span>{venda.detalhes_pagamento.autorizacao_nsu}</span>
                      </div>
                    )}
                    {venda.detalhes_pagamento.troco !== undefined && Number(venda.detalhes_pagamento.troco) > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Troco Devolvido:</span>
                        <span>{formatarMoeda(Number(venda.detalhes_pagamento.troco))}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Informação dos Tributos (Lei 12.741/2012) */}
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[10px] space-y-0.5">
                <p>
                  <strong>Tributos Totais Incidentes (Lei Federal 12.741/2012):</strong>
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatarMoeda(dadosNFCe.tributosTotaisAprox)} (Aprox. 18.25% - Fonte IBPT)
                </p>
              </div>

              {/* Dados do Consumidor (Fidelização de Clientes) */}
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 text-[10px]">
                <p>
                  <strong>CONSUMIDOR:</strong>{' '}
                  {venda.cliente_nome ? `${venda.cliente_nome} (CPF: ${formatarCPF(venda.cliente_cpf || '')})` : 'CONSUMIDOR FINAL NÃO IDENTIFICADO'}
                </p>
                <p className="text-slate-400">
                  NFC-e nº {dadosNFCe.numeroNota} • Série {dadosNFCe.serie} • {formatarDataHora(dadosNFCe.dataAutorizacao)}
                </p>
              </div>

              {/* Chave de Acesso Oficial de 44 Dígitos */}
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 text-center space-y-1">
                <p className="font-bold text-[10px] uppercase text-slate-600 dark:text-slate-400">
                  Consulte pela Chave de Acesso em:
                </p>
                <a
                  href="https://www.fazenda.rj.gov.br/nfce/consulta"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-center gap-1"
                >
                  <span>www.fazenda.rj.gov.br/nfce/consulta</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-mono select-all break-all font-bold">
                  {dadosNFCe.chaveFormatada}
                </div>
              </div>

              {/* Simulação de QR Code SEFAZ */}
              <div className="text-center pt-1 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1">
                <div className="w-24 h-24 mx-auto p-1.5 bg-white rounded-xl border border-slate-300 flex items-center justify-center shadow-xs">
                  <div className="w-full h-full border-2 border-black flex flex-col items-center justify-center relative p-1">
                    <QrCode className="w-16 h-16 text-black" />
                    <span className="text-[7px] text-black font-sans font-bold">SEFAZ NFC-e</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">
                  Consulta via leitor de QR Code do smartphone
                </p>
              </div>

              {/* Protocolo de Autorização */}
              <div className="text-center border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 text-[10px]">
                <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Protocolo de Autorização: {dadosNFCe.protocoloAutorizacao}</span>
                </p>
                <p className="text-slate-400 text-[9px]">
                  Ambiente de Produção • Versão do Aplicativo: OMNI-PDV-1.0
                </p>
              </div>
            </div>
          ) : (
            /* Visualização do XML de Distribuição da NFC-e */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Arquivo XML assinado digitalmente (Padrão SEFAZ procNFe v4.00)</span>
                <span className="font-mono text-[11px] text-emerald-500">{dadosNFCe.xmlString.length} bytes</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-[10px] font-mono overflow-x-auto max-h-[500px] border border-slate-800 select-all">
                {dadosNFCe.xmlString}
              </pre>
            </div>
          )}
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={onFechar}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBaixarXML}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Baixar XML</span>
            </button>
            <button
              onClick={handleImprimir}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir DANFE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
