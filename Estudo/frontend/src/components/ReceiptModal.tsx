import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle2, X, ShoppingBag, ShieldCheck } from 'lucide-react';
import { IVendaCompleta, IEmpresa } from '../types';
import { empresaApi } from '../services/api';
import { formatarMoeda, formatarDataHora } from '../utils/formatters';
import { formatarCPF } from '../utils/cpf.validator';

interface IReceiptModalProps {
  venda: IVendaCompleta | null;
  aberto?: boolean;
  isOpen?: boolean;
  onFechar?: () => void;
  onClose?: () => void;
}

export const ReceiptModal: React.FC<IReceiptModalProps> = ({
  venda,
  aberto,
  isOpen,
  onFechar,
  onClose,
}) => {
  const modalAberto = aberto ?? isOpen ?? false;
  const fechar = onFechar || onClose || (() => {});
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);

  useEffect(() => {
    if (modalAberto) {
      empresaApi.obter().then(setEmpresa).catch(() => null);
    }
  }, [modalAberto]);

  if (!modalAberto || !venda) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/30 shadow-2xl dark:shadow-glow-emerald overflow-hidden max-h-[94vh] flex flex-col transition-colors">
        {/* Top Header */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-500/20 px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug">Venda Concluída com Sucesso!</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Comprovante Fiscal Simulado &bull; Venda #{venda.id}</p>
            </div>
          </div>
          <button
            onClick={fechar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-mono text-xs space-y-4 bg-amber-50/60 dark:bg-slate-950/80 text-slate-800 dark:text-slate-300 print:text-black print:bg-white transition-colors">
          <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
            <img
              src={empresa?.logo_url || '/logo.png'}
              alt={empresa?.nome_fantasia || 'Logotipo da Empresa'}
              className="h-12 w-auto mx-auto object-contain mb-2 dark:brightness-125"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest print:text-black">
              {empresa?.razao_social || 'MS² VESTUÁRIO LTDA'}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Nome Fantasia: {empresa?.nome_fantasia || 'MS² Vestuário'}
            </p>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
              CNPJ: {empresa?.cnpj || '12.345.678/0001-90'} | IE: {empresa?.inscricao_estadual || '87.654.321'}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {empresa?.logradouro || 'Rua da Moda'}, {empresa?.numero || '100'} {empresa?.complemento ? `- ${empresa.complemento}` : ''}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {empresa?.bairro || 'Maracanã'} - {empresa?.cidade || 'Rio de Janeiro'} / {empresa?.uf || 'RJ'} - CEP {empresa?.cep || '20271-110'}
            </p>
            {empresa?.telefone && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Tel: {empresa.telefone}</p>
            )}
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 uppercase tracking-wider">
              *** DOCUMENTO AUXILIAR DE VENDA (E-NOTA / CUPOM) ***
            </p>
          </div>

          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Venda Nº:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">#{String(venda.id).padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Data e Hora:</span>
              <span className="text-slate-800 dark:text-slate-200">{formatarDataHora(venda.criado_em)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Operador de Caixa:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{venda.operador_nome || `Operador #${venda.usuario_id}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Cliente Identificado:</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">
                {venda.cliente_nome
                  ? `${venda.cliente_nome} (${formatarCPF(venda.cliente_cpf || '')})`
                  : 'Consumidor Final (RN-06)'}
              </span>
            </div>
            {venda.gerente_aprovador_nome && (
              <div className="flex justify-between items-center bg-amber-100/70 dark:bg-amber-500/10 p-1.5 rounded text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/20">
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Alçada Gerencial Autorizada por:
                </span>
                <span className="font-bold">{venda.gerente_aprovador_nome}</span>
              </div>
            )}
          </div>

          {/* Lista de Itens com Preço Histórico RN-04 */}
          <div>
            <div className="grid grid-cols-12 gap-1 font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 text-[11px]">
              <span className="col-span-1">QTD</span>
              <span className="col-span-6">DESCRIÇÃO</span>
              <span className="col-span-2 text-right">UNIT (R$)</span>
              <span className="col-span-3 text-right">TOTAL (R$)</span>
            </div>
            <div className="divide-y divide-slate-200/80 dark:divide-slate-800/60 my-1">
              {venda.itens?.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1 py-1 text-[11px] items-center">
                  <span className="col-span-1 font-semibold text-slate-700 dark:text-slate-300">{item.quantidade}x</span>
                  <span className="col-span-6 text-slate-900 dark:text-slate-200 break-words leading-tight pr-1">
                    [{item.codigo}] {item.descricao}
                  </span>
                  <span className="col-span-2 text-right text-slate-500 dark:text-slate-400">
                    {Number(item.preco_unitario).toFixed(2)}
                  </span>
                  <span className="col-span-3 text-right font-bold text-slate-900 dark:text-slate-200">
                    {formatarMoeda(Number(item.subtotal))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totais */}
          <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Subtotal dos Produtos:</span>
              <span>{formatarMoeda(Number(venda.subtotal))}</span>
            </div>
            {Number(venda.desconto) > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold">
                <span>Desconto Concedido:</span>
                <span>- {formatarMoeda(Number(venda.desconto))}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>TOTAL LÍQUIDO:</span>
              <span>{formatarMoeda(Number(venda.valor_total))}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 pt-1">
              <span>Forma de Pagamento:</span>
              <span className="font-bold uppercase text-slate-900 dark:text-slate-100">{venda.forma_pagamento}</span>
            </div>

            {venda.detalhes_pagamento && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 space-y-1 text-[11px] border border-slate-200 dark:border-slate-700/60">
                {venda.detalhes_pagamento.bandeira && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Bandeira do Cartão:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{venda.detalhes_pagamento.bandeira}</span>
                  </div>
                )}
                {venda.detalhes_pagamento.parcelas && venda.detalhes_pagamento.parcelas > 1 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Condição:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {venda.detalhes_pagamento.parcelas}x de {formatarMoeda(Number(venda.detalhes_pagamento.valor_parcela || (Number(venda.valor_total) / venda.detalhes_pagamento.parcelas)))}
                    </span>
                  </div>
                )}
                {venda.detalhes_pagamento.autorizacao_nsu && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    <span>NSU / Aut.:</span>
                    <span>{venda.detalhes_pagamento.autorizacao_nsu}</span>
                  </div>
                )}
                {venda.detalhes_pagamento.valor_entregue !== undefined && Number(venda.detalhes_pagamento.valor_entregue) > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Valor Recebido:</span>
                    <span className="font-semibold">{formatarMoeda(Number(venda.detalhes_pagamento.valor_entregue))}</span>
                  </div>
                )}
                {venda.detalhes_pagamento.troco !== undefined && Number(venda.detalhes_pagamento.troco) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Troco:</span>
                    <span>{formatarMoeda(Number(venda.detalhes_pagamento.troco))}</span>
                  </div>
                )}
                {venda.detalhes_pagamento.txid_pix && (
                  <div className="flex flex-col sm:flex-row sm:justify-between text-slate-500 dark:text-slate-400 font-mono text-[9px] gap-0.5">
                    <span>ID Transação PIX:</span>
                    <span className="font-semibold break-all text-slate-700 dark:text-slate-300">{venda.detalhes_pagamento.txid_pix}</span>
                  </div>
                )}
                {venda.detalhes_pagamento.pagamento_dividido && venda.detalhes_pagamento.parcelamentos_multiplos && (
                  <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="block font-semibold text-slate-700 dark:text-slate-300 text-[10px] mb-0.5">Composição do Pagamento Misto:</span>
                    {venda.detalhes_pagamento.parcelamentos_multiplos.map((m, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>&bull; {m.metodo} ({m.detalhe || 'Integral'}):</span>
                        <span className="font-mono font-medium">{formatarMoeda(Number(m.valor))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {empresa?.regime_tributario && (
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[10px] pt-0.5">
                <span>Regime Fiscal:</span>
                <span>{empresa.regime_tributario}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-300 dark:border-slate-800">
            <p className="italic">{empresa?.mensagem_cupom || 'Obrigado pela preferência! Volte sempre.'}</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
              MS² Vestuário &bull; Sistema de Gestão Comercial e PDV
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            Imprimir Cupom
          </button>
          <button
            onClick={fechar}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-emerald"
          >
            <ShoppingBag className="w-4 h-4" />
            Novo Atendimento
          </button>
        </div>
      </div>
    </div>
  );
};
