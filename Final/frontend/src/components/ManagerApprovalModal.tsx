import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle2, X, Lock } from 'lucide-react';
import { authApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface IManagerApprovalModalProps {
  aberto: boolean;
  titulo?: string;
  motivo: string;
  onConfirmar: (gerenteId: number, gerenteNome: string) => void;
  onCancelar: () => void;
}

export const ManagerApprovalModal: React.FC<IManagerApprovalModalProps> = ({
  aberto,
  titulo = 'Autorização de Gerência Requerida',
  motivo,
  onConfirmar,
  onCancelar,
}) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [validando, setValidando] = useState(false);
  const { adicionarToast } = useToast();

  if (!aberto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      adicionarToast('warning', 'Campos Obrigatórios', 'Informe o e-mail e senha do gerente');
      return;
    }

    try {
      setValidando(true);
      const resposta = await authApi.validarGerente(email, senha);
      if (resposta.valido) {
        adicionarToast('success', 'Autorização Concedida', `Aprovado por: ${resposta.gerente_nome}`);
        onConfirmar(resposta.gerente_id, resposta.gerente_nome);
      }
    } catch (err: any) {
      adicionarToast('error', 'Autorização Recusada', err.message || 'Credenciais de gerente inválidas');
    } finally {
      setValidando(false);
    }
  };

  const preencherGerenteTeste = () => {
    setEmail('gerente@empresa.com.br');
    setSenha('admin123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl glass-card border border-amber-500/30 shadow-glow-amber overflow-hidden">
        {/* Header com destaque em Âmbar de Alçada */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base leading-snug">{titulo}</h3>
              <p className="text-xs text-amber-400 font-medium">Controle de Alçada (Alçada Gerencial / Estorno Auditado)</p>
            </div>
          </div>
          <button
            onClick={onCancelar}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informação do Motivo */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300 block mb-1">Ação sob restrição:</strong>
            {motivo}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail do Gerente / Administrador
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gerente@empresa.com.br"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha de Autorização
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Atalho de Demonstração para Banca/Apresentação */}
            <button
              type="button"
              onClick={preencherGerenteTeste}
              className="w-full py-1.5 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Preencher com Gerente Homologado (Demonstração)
            </button>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onCancelar}
                disabled={validando}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={validando}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-glow-amber disabled:opacity-50"
              >
                {validando ? (
                  'Verificando...'
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Autorizar Operação
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
