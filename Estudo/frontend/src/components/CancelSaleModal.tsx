import React, { useState } from 'react';
import { AlertOctagon, Lock, KeyRound, X, CheckCircle2 } from 'lucide-react';
import { authApi, vendasApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { IVendaCompleta } from '../types';
import { formatarMoeda } from '../utils/formatters';

interface ICancelSaleModalProps {
  venda: IVendaCompleta | null;
  aberto: boolean;
  onConfirmado: () => void;
  onFechar: () => void;
}

export const CancelSaleModal: React.FC<ICancelSaleModalProps> = ({
  venda,
  aberto,
  onConfirmado,
  onFechar,
}) => {
  const [motivo, setMotivo] = useState('');
  const [emailGerente, setEmailGerente] = useState('');
  const [senhaGerente, setSenhaGerente] = useState('');
  const [salvando, setSalvando] = useState(false);
  const { adicionarToast } = useToast();

  if (!aberto || !venda) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motivo.trim() || motivo.trim().length < 5) {
      adicionarToast('warning', 'Motivo Obrigatório', 'A justificativa do cancelamento deve conter no mínimo 5 caracteres (RN-03)');
      return;
    }

    if (!emailGerente || !senhaGerente) {
      adicionarToast('warning', 'Credenciais Requeridas', 'Informe as credenciais do gerente para cancelamento');
      return;
    }

    try {
      setSalvando(true);
      // 1. Validação de Alçada do Gerente
      const respostaGerente = await authApi.validarGerente(emailGerente, senhaGerente);
      if (!respostaGerente.valido) {
        throw new Error('Gerente não autorizado');
      }

      // 2. Efetivação do Cancelamento da Venda
      await vendasApi.cancelar(venda.id, {
        motivo_cancelamento: motivo.trim(),
        gerente_aprovador_id: respostaGerente.gerente_id,
      });

      adicionarToast(
        'success',
        'Venda Cancelada',
        `Venda #${venda.id} cancelada com sucesso por ${respostaGerente.gerente_nome}`
      );
      onConfirmado();
    } catch (err: any) {
      adicionarToast('error', 'Falha no Cancelamento', err.message || 'Não foi possível cancelar a venda');
    } finally {
      setSalvando(false);
    }
  };

  const preencherGerenteTeste = () => {
    setEmailGerente('gerente@ms2.com.br');
    setSenhaGerente('admin123');
    setMotivo('Cliente desistiu da compra no ato do fechamento');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl glass-card border border-rose-500/40 shadow-glow-rose overflow-hidden">
        {/* Header Destaque em Rose/Vermelho */}
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base leading-snug">
                Estorno & Cancelamento de Venda
              </h3>
              <p className="text-xs text-rose-400 font-medium">Controle de Alçada Gerencial (RN-03)</p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <div className="flex justify-between font-semibold mb-1">
              <span>Venda Selecionada:</span>
              <span className="text-slate-100 font-bold">#{venda.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Valor Total:</span>
              <span className="text-emerald-400 font-bold">{formatarMoeda(Number(venda.valor_total))}</span>
            </div>
            <div className="flex justify-between">
              <span>Operador:</span>
              <span>{venda.operador_nome || `#${venda.usuario_id}`}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Motivo do Cancelamento <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva detalhadamente a justificativa para auditoria..."
              rows={3}
              required
              minLength={5}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail do Gerente
              </label>
              <input
                type="email"
                value={emailGerente}
                onChange={(e) => setEmailGerente(e.target.value)}
                placeholder="gerente@ms2.com.br"
                required
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha do Gerente
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={senhaGerente}
                  onChange={(e) => setSenhaGerente(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Atalho Demo */}
          <button
            type="button"
            onClick={preencherGerenteTeste}
            className="w-full py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Preencher Dados de Demonstração (Gerente Homologado)
          </button>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onFechar}
              disabled={salvando}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-glow-rose disabled:opacity-50"
            >
              {salvando ? (
                'Processando Cancelamento...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Cancelamento com Alçada
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
