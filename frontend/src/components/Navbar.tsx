import React, { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getRoleBadgeConfig } from '../utils/formatters';

export const Navbar: React.FC = () => {
  const { usuario, logout, isAdmin, isGerenteOuAdmin } = useAuth();
  const { tema, temaEfetivo, setTema } = useTheme();
  const [menuMobileAberto, setMenuMobileAberto] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const badgeConfig = usuario ? getRoleBadgeConfig(usuario.cargo) : null;
  const fecharMenu = () => setMenuMobileAberto(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xs transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* 1. LADO ESQUERDO: Logotipo Oficial & Título da Aplicação */}
          <div className="flex items-center gap-3 shrink-0">
            <NavLink to="/pdv" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 overflow-hidden flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <img src="/logo.png" alt="MS² Vestuário" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-indigo-200">
                    MS² Vestuário
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    PDV Ativo
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Gestão Comercial & Ponto de Venda
                </span>
              </div>
            </NavLink>
          </div>

          {/* 2. CENTRO: Barra de Navegação Desktop Espaçosa (Sem sobreposição) */}
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm shadow-xs">
            <NavLink
              to="/pdv"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm border border-slate-200/60 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <ShoppingCart className="w-4 h-4 text-emerald-500" />
              <span>PDV Caixa</span>
            </NavLink>

            <NavLink
              to="/produtos"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm border border-slate-200/60 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Package className="w-4 h-4 text-indigo-500" />
              <span>Catálogo</span>
            </NavLink>

            <NavLink
              to="/clientes"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm border border-slate-200/60 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>Clientes</span>
            </NavLink>

            <NavLink
              to="/vendas"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm border border-slate-200/60 dark:border-slate-700/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>Vendas</span>
            </NavLink>

            {isGerenteOuAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm border border-slate-200/60 dark:border-slate-700/80'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4 text-teal-500" />
                <span>Dashboard</span>
              </NavLink>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/usuarios"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm border border-slate-200/60 dark:border-slate-700/80'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <UserCheck className="w-4 h-4 text-purple-500" />
                  <span>Equipe</span>
                </NavLink>

                <NavLink
                  to="/configuracoes"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm border border-slate-200/60 dark:border-slate-700/80'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Settings className="w-4 h-4 text-cyan-500" />
                  <span>Empresa</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* 3. LADO DIREITO: Seletor de Tema, Perfil do Usuário e Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Seletor de Tema Triplo Elegante */}
            <div
              className="flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-0.5 shadow-xs"
              title={`Tema Atual: ${tema === 'system' ? `Automático (${temaEfetivo})` : tema === 'dark' ? 'Modo Escuro' : 'Modo Claro'}`}
            >
              <button
                onClick={() => setTema('light')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  tema === 'light'
                    ? 'bg-white text-amber-500 shadow-xs font-bold'
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
                    ? 'bg-brand-600 text-white shadow-xs font-bold'
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
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Modo Escuro"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cartão de Identificação do Usuário */}
            {usuario && (
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  {usuario.nome.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[150px] truncate leading-tight">
                    {usuario.nome}
                  </div>
                  <div className="mt-0.5">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wide uppercase ${badgeConfig?.badgeClass}`}
                    >
                      {badgeConfig?.label}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Encerrar Sessão"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/60 hover:border-rose-300 dark:hover:border-rose-500/40 text-slate-600 dark:text-slate-300 transition-all ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Botão de Menu para Telas Menores que XL */}
            <button
              onClick={() => setMenuMobileAberto(!menuMobileAberto)}
              className="xl:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Menu de Navegação"
            >
              {menuMobileAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 4. GAVETA BENTO DE NAVEGAÇÃO PARA TELAS MENORES (TABLET / MOBILE) */}
        {menuMobileAberto && (
          <div className="xl:hidden border-b border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl px-4 sm:px-6 py-5 space-y-4 shadow-xl transition-colors animate-in slide-in-from-top-2 duration-200">
            {usuario && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {usuario.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{usuario.nome}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{usuario.email}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeConfig?.badgeClass}`}>
                  {badgeConfig?.label}
                </span>
              </div>
            )}

            {/* Bento Grid de Navegação Móvel */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <NavLink
                to="/pdv"
                onClick={fecharMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span>PDV Caixa</span>
              </NavLink>

              <NavLink
                to="/produtos"
                onClick={fecharMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Package className="w-4 h-4" />
                </div>
                <span>Catálogo</span>
              </NavLink>

              <NavLink
                to="/clientes"
                onClick={fecharMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <span>Clientes</span>
              </NavLink>

              <NavLink
                to="/vendas"
                onClick={fecharMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Receipt className="w-4 h-4" />
                </div>
                <span>Vendas</span>
              </NavLink>

              {isGerenteOuAdmin && (
                <NavLink
                  to="/dashboard"
                  onClick={fecharMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span>Dashboard</span>
                </NavLink>
              )}

              {isAdmin && (
                <>
                  <NavLink
                    to="/usuarios"
                    onClick={fecharMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span>Equipe</span>
                  </NavLink>

                  <NavLink
                    to="/configuracoes"
                    onClick={fecharMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span>Empresa</span>
                  </NavLink>
                </>
              )}
            </div>

            {/* Logout Mobile */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Encerrar Sessão
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Floating Bottom Navigation Bar for Mobile Phones and Small Tablets (< sm) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-xl transition-colors">
        <NavLink
          to="/pdv"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold transition-colors ${
              isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
        >
          <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>PDV</span>
        </NavLink>

        <NavLink
          to="/produtos"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold transition-colors ${
              isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
        >
          <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Catálogo</span>
        </NavLink>

        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold transition-colors ${
              isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
        >
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Clientes</span>
        </NavLink>

        <NavLink
          to="/vendas"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold transition-colors ${
              isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
        >
          <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Vendas</span>
        </NavLink>

        {isGerenteOuAdmin && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold transition-colors ${
                isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Dash</span>
          </NavLink>
        )}
      </nav>
    </>
  );
};
