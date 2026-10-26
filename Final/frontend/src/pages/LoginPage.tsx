import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, ShoppingCart, Sun, Moon, Laptop } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Spotlight } from '../components/ui/spotlight';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { Meteors } from '../components/ui/meteors';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const { tema, temaEfetivo, setTema } = useTheme();
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

  const alternarTema = () => {
    if (tema === 'system') setTema('light');
    else if (tema === 'light') setTema('dark');
    else setTema('system');
  };


  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden transition-colors duration-300">
      {/* Botão de Alternância de Tema Flutuante no Topo */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={alternarTema}
          title={`Tema: ${tema} (Efetivo: ${temaEfetivo}) - Clique para alternar`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition-all"
        >
          {tema === 'system' && <Laptop className="w-3.5 h-3.5 text-indigo-500" />}
          {tema === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
          {tema === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
          <span className="capitalize">{tema === 'system' ? 'Auto' : tema === 'light' ? 'Claro' : 'Escuro'}</span>
        </button>
      </div>

      {/* Aceternity UI Spotlight */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill={temaEfetivo === 'dark' ? '#6366f1' : '#818cf8'} />

      {/* Elementos visuais de fundo com glow suave */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Cabeçalho de Apresentação com Logo e Aceternity FlipWords */}
        <div className="text-center mb-7">
          <img
            src="/logo.png"
            alt="OmniVarejo Enterprise Logo"
            className="h-40 sm:h-80 w-auto object-contain mx-auto mb-3 transform hover:scale-105 transition-all dark:brightness-125 dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
          />
        </div>

        {/* Card Principal de Login com Aceternity Meteors no Rodapé */}
        <div className="bg-white/85 dark:bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-700/60 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden transition-colors">
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@empresa.com.br"
                  required
                  className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
                <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3 sm:top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
                <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3 sm:top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Aceternity Shimmer Button */}
            <ShimmerButton
              type="submit"
              disabled={enviando}
              className="w-full h-11 sm:h-12 text-sm flex items-center justify-center gap-2 mt-2"
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
          <div className="mt-7 pt-5 border-t border-slate-200 dark:border-slate-800 relative z-10">
            <p className="text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Acesso Rápido para Avaliação (Seeds)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => preencherCredenciais('admin@empresa.com.br', 'admin123')}
                className="p-2 sm:p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-200 text-xs font-medium flex flex-col items-center gap-1 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => preencherCredenciais('gerente@empresa.com.br', 'admin123')}
                className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-200 text-xs font-medium flex flex-col items-center gap-1 transition-all"
              >
                <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Gerente</span>
              </button>

              <button
                type="button"
                onClick={() => preencherCredenciais('caixa@empresa.com.br', 'caixa123')}
                className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-200 text-xs font-medium flex flex-col items-center gap-1 transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Caixa</span>
              </button>
            </div>
          </div>

          {temaEfetivo === 'dark' && <Meteors number={15} />}
        </div>

        {/* Rodapé institucional */}
        <p className="text-center text-xs text-slate-500 mt-5 font-medium">
          Plataforma Corporativa de Varejo - Enterprise Retail Suite &bull; OmniVarejo Enterprise
        </p>
      </div>
    </div>
  );
};
