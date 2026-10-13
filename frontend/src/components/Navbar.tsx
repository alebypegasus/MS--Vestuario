import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Users,
  Receipt,
  UserCheck,
  LogOut,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getRoleBadgeConfig } from '../utils/formatters';

import { FlipWords } from './ui/flip-words';

export const Navbar: React.FC = () => {
  const { usuario, logout, isAdmin, isGerenteOuAdmin } = useAuth();
  const { tema, temaEfetivo, setTema } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const badgeConfig = usuario ? getRoleBadgeConfig(usuario.cargo) : null;
  const tagWords = ['PDV Pro', 'Módulo 11', 'Alçada RN-02', 'Snapshot RN-04'];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0e1424]/90 backdrop-blur-xl shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <NavLink to="/pdv" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 overflow-hidden flex items-center justify-center shadow-glow-indigo group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="MS² Vestuário" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-indigo-200">
                  MS² Vestuário
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30">
                  <FlipWords words={tagWords} duration={2500} className="px-0 text-[10px] text-brand-600 dark:text-brand-300" />
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Gestão & Ponto de Venda</p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 ml-2">
            <NavLink
              to="/pdv"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <ShoppingCart className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              PDV Caixa
            </NavLink>

            <NavLink
              to="/produtos"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Package className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Catálogo
            </NavLink>

            <NavLink
              to="/clientes"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Clientes
            </NavLink>

            <NavLink
              to="/vendas"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Receipt className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Vendas
            </NavLink>

            {isGerenteOuAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                Dashboard
              </NavLink>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/usuarios"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <UserCheck className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  Equipe
                </NavLink>

                <NavLink
                  to="/configuracoes"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Settings className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  Empresa
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* User Info, Theme Switcher & Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <div
            className="flex items-center bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 rounded-xl p-0.5 shadow-sm"
            title={`Tema: ${tema === 'system' ? `Automático (${temaEfetivo})` : tema === 'dark' ? 'Modo Escuro' : 'Modo Claro'}`}
          >
            <button
              onClick={() => setTema('light')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                tema === 'light'
                  ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Modo Claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTema('system')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                tema === 'system'
                  ? 'bg-brand-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Automático (Preferência do Sistema)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTema('dark')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                tema === 'dark'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Modo Escuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {usuario && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{usuario.nome}</div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${badgeConfig?.badgeClass}`}
                  >
                    {badgeConfig?.label}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sair do Sistema"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/60 hover:border-rose-400 dark:hover:border-rose-500/40 text-slate-600 dark:text-slate-300 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
