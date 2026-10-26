import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MorphIcon, LucideIcons } from './MorphIcon';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getRoleBadgeConfig } from '../utils/formatters';
import { empresaApi } from '../services/api';
import { IEmpresa } from '../types';
import { HomologacaoModal } from './HomologacaoModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export const Navbar: React.FC = () => {
  const { usuario, logout, isAdmin, isGerenteOuAdmin } = useAuth();
  const { tema, temaEfetivo, setTema } = useTheme();
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);
  const [menuMobileAberto, setMenuMobileAberto] = useState<boolean>(false);
  const [modalHomologacaoAberto, setModalHomologacaoAberto] = useState<boolean>(false);
  const [modalAtalhosAberto, setModalAtalhosAberto] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    empresaApi.obter().then(setEmpresa).catch(() => {});
  }, []);

  // Ativação dos Atalhos Globais de Teclado
  useKeyboardShortcuts({
    onAbrirHomologacao: () => setModalHomologacaoAberto(true),
    onAbrirAjudaAtalhos: () => setModalAtalhosAberto(true),
  });

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
              {empresa?.logo_url ? (
                <img
                  src={empresa.logo_url}
                  alt={empresa.nome_fantasia || 'Logotipo da Empresa'}
                  className="h-10 sm:h-12 w-auto object-contain shrink-0 group-hover:scale-105 transition-all rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <img
                  src="/logo.png"
                  alt={empresa?.nome_fantasia || 'MS² Vestuário'}
                  className="h-15 sm:h-16 w-auto object-contain shrink-0 group-hover:scale-110 transition-all dark:brightness-125 dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
                />
              )}
              {empresa?.logo_texto && (
                <div className="hidden md:flex flex-col border-l border-slate-200 dark:border-slate-800 pl-3">
                  <span className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
                    {empresa.logo_texto}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {empresa.nome_fantasia || 'Terminal PDV'}
                  </span>
                </div>
              )}
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
              <MorphIcon icon={LucideIcons.ShoppingCart} size={16} className="text-emerald-500" />
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
              <MorphIcon icon={LucideIcons.Package} size={16} className="text-indigo-500" />
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
              <MorphIcon icon={LucideIcons.Users} size={16} className="text-blue-500" />
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
              <MorphIcon icon={LucideIcons.Receipt} size={16} className="text-amber-500" />
              <span>Vendas</span>
            </NavLink>

            {isGerenteOuAdmin && (
              <>
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
                  <MorphIcon icon={LucideIcons.BarChart3} size={16} className="text-teal-500" />
                  <span>Dashboard</span>
                </NavLink>
              </>
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
                  <MorphIcon icon={LucideIcons.UserCheck} size={16} className="text-purple-500" />
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
                  <MorphIcon icon={LucideIcons.Settings} size={16} className="text-cyan-500" />
                  <span>Empresa</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* 3. LADO DIREITO: Seletor de Tema, Perfil do Usuário e Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Botão de Dossiê de Homologação */}
            <button
              onClick={() => setModalHomologacaoAberto(true)}
              title="Dossiê de Homologação Fiscal & Regras de Negócio (RN-01 a RN-06) [Alt+H ou F1]"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 transition-all btn-interactive shadow-xs"
            >
              <MorphIcon icon={LucideIcons.ShieldCheck} size={14} className="text-amber-500" />
              <span>Homologação</span>
            </button>

            {/* Botão de Atalhos de Teclado */}
            <button
              onClick={() => setModalAtalhosAberto(true)}
              title="Guia de Atalhos de Teclado do Sistema [?]"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
            >
              <MorphIcon icon={LucideIcons.Keyboard} size={14} className="text-amber-500" />
              <span>Atalhos</span>
              <kbd className="text-[10px] font-mono px-1 py-0.2 bg-slate-200 dark:bg-slate-900 rounded text-slate-500 dark:text-slate-400">?</kbd>
            </button>

            {/* Link para Pitch em Motion Design (Sprint 6) */}
            <NavLink
              to="/pitch"
              title="Apresentação em Motion Design da Sprint 6 (Gabarito Firjan SENAI) [Alt+P ou F10]"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 transition-all btn-interactive shadow-xs"
            >
              <MorphIcon icon={LucideIcons.Play} size={14} className="text-indigo-500" />
              <span>Motion Pitch</span>
            </NavLink>

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
                <MorphIcon icon={LucideIcons.Sun} size={14} />
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
                <MorphIcon icon={LucideIcons.Monitor} size={14} />
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
                <MorphIcon icon={LucideIcons.Moon} size={14} />
              </button>
            </div>

            {/* Cartão de Identificação do Usuário */}
            {usuario && (
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  {usuario.nome.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[240px] truncate leading-tight" title={usuario.nome}>
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
                  <MorphIcon icon={LucideIcons.LogOut} size={16} />
                </button>
              </div>
            )}

            {/* Botão de Menu para Telas Menores que XL */}
            <button
              onClick={() => setMenuMobileAberto(!menuMobileAberto)}
              className="xl:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Menu de Navegação"
            >
              <MorphIcon icon={menuMobileAberto ? LucideIcons.X : LucideIcons.Menu} size={20} spring="bouncy" />
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
                  <MorphIcon icon={LucideIcons.ShoppingCart} size={16} />
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
                  <MorphIcon icon={LucideIcons.Package} size={16} />
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
                  <MorphIcon icon={LucideIcons.Users} size={16} />
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
                  <MorphIcon icon={LucideIcons.Receipt} size={16} />
                </div>
                <span>Vendas</span>
              </NavLink>

              {isGerenteOuAdmin && (
                <>
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
                      <MorphIcon icon={LucideIcons.BarChart3} size={16} />
                    </div>
                    <span>Dashboard</span>
                  </NavLink>
                </>
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
                      <MorphIcon icon={LucideIcons.UserCheck} size={16} />
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
                      <MorphIcon icon={LucideIcons.Settings} size={16} />
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
                <MorphIcon icon={LucideIcons.LogOut} size={16} />
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
          <MorphIcon icon={LucideIcons.ShoppingCart} size={16} className="text-emerald-600 dark:text-emerald-400" />
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
          <MorphIcon icon={LucideIcons.Package} size={16} className="text-indigo-600 dark:text-indigo-400" />
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
          <MorphIcon icon={LucideIcons.Users} size={16} className="text-blue-600 dark:text-blue-400" />
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
          <MorphIcon icon={LucideIcons.Receipt} size={16} className="text-amber-600 dark:text-amber-400" />
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
            <MorphIcon icon={LucideIcons.BarChart3} size={16} className="text-teal-600 dark:text-teal-400" />
            <span>Dash</span>
          </NavLink>
        )}
      </nav>

      {/* Modal de Homologação Técnica & Fiscal */}
      <HomologacaoModal
        aberto={modalHomologacaoAberto}
        onFechar={() => setModalHomologacaoAberto(false)}
      />

      {/* Modal de Ajuda de Atalhos de Teclado */}
      <KeyboardShortcutsModal
        aberto={modalAtalhosAberto}
        onFechar={() => setModalAtalhosAberto(false)}
      />
    </>
  );
};
