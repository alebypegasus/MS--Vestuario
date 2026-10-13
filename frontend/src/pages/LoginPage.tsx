import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Spotlight } from '../components/ui/spotlight';
import { FlipWords } from '../components/ui/flip-words';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { Meteors } from '../components/ui/meteors';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) return;

    try {
      setEnviando(true);
      await login({ email, senha });
      navigate('/pdv');
    } catch {
      // O toast de erro é disparado pelo AuthContext
    } finally {
      setEnviando(false);
    }
  };

  const preencherCredenciais = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setSenha(demoPass);
  };

  const words = ['Alta Performance', 'Alçadas Gerenciais', 'Auditoria Fiscal', 'PDV & Varejo'];

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Aceternity UI Spotlight */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#6366f1" />

      {/* Elementos visuais de fundo com glow suave */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Cabeçalho de Apresentação com Aceternity FlipWords */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-indigo-400 shadow-glow-indigo mb-4 transform hover:scale-105 transition-transform">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            MS² Vestuário
          </h1>
          <div className="text-sm text-slate-400 mt-2 font-medium flex items-center justify-center">
            Sistema com <FlipWords words={words} className="text-indigo-400" />
          </div>
        </div>

        {/* Card Principal de Login com Aceternity Meteors no Rodapé */}
        <div className="glass-card rounded-2xl p-8 border border-slate-700/60 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                E-mail Corporativo
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@ms2.com.br"
                  required
                  className="w-full px-4 py-3 pl-11 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pl-11 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Aceternity Shimmer Button */}
            <ShimmerButton
              type="submit"
              disabled={enviando}
              className="w-full h-12 text-sm flex items-center justify-center gap-2"
            >
              {enviando ? (
                'Autenticando...'
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </ShimmerButton>
          </form>

          {/* Seção de Acessos de Demonstração */}
          <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Acesso Rápido para Avaliação (Seeds)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => preencherCredenciais('admin@ms2.com.br', 'admin123')}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-medium flex flex-col items-center gap-1 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => preencherCredenciais('gerente@ms2.com.br', 'admin123')}
                className="p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-200 text-xs font-medium flex flex-col items-center gap-1 transition-all"
              >
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Gerente</span>
              </button>

              <button
                type="button"
                onClick={() => preencherCredenciais('caixa@ms2.com.br', 'caixa123')}
                className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex flex-col items-center gap-1 transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Caixa</span>
              </button>
            </div>
          </div>

          <Meteors number={15} />
        </div>

        {/* Rodapé institucional */}
        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
          Projeto Final de Curso - Firjan SENAI &bull; Sprint 4
        </p>
      </div>
    </div>
  );
};
