import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastTipo = 'success' | 'error' | 'warning' | 'info';

interface IToast {
  id: string;
  tipo: ToastTipo;
  titulo: string;
  mensagem?: string;
}

interface IToastContextData {
  adicionarToast: (tipo: ToastTipo, titulo: string, mensagem?: string) => void;
  removerToast: (id: string) => void;
}

const ToastContext = createContext<IToastContextData>({} as IToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<IToast[]>([]);

  const removerToast = useCallback((id: string) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  const adicionarToast = useCallback((tipo: ToastTipo, titulo: string, mensagem?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const novoToast: IToast = { id, tipo, titulo, mensagem };

    setToasts((state) => [...state, novoToast]);

    setTimeout(() => {
      removerToast(id);
    }, 4500);
  }, [removerToast]);

  return (
    <ToastContext.Provider value={{ adicionarToast, removerToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right ${
              toast.tipo === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-glow-emerald'
                : toast.tipo === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-glow-rose'
                : toast.tipo === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-glow-amber'
                : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-100 shadow-glow-indigo'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.tipo === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.tipo === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
              {toast.tipo === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.tipo === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">{toast.titulo}</h4>
              {toast.mensagem && (
                <p className="text-xs mt-1 text-slate-300 leading-relaxed">{toast.mensagem}</p>
              )}
            </div>
            <button
              onClick={() => removerToast(toast.id)}
              className="shrink-0 p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): IToastContextData {
  return useContext(ToastContext);
}
