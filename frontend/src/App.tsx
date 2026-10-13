import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LoginPage } from './pages/LoginPage';
import { PdvPage } from './pages/PdvPage';
import { ProdutosPage } from './pages/ProdutosPage';
import { ClientesPage } from './pages/ClientesPage';
import { VendasPage } from './pages/VendasPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { DashboardPage } from './pages/DashboardPage';
import { ConfiguracoesEmpresaPage } from './pages/ConfiguracoesEmpresaPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { autenticado } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {autenticado && !isLoginPage && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                {/* Rota Pública de Login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rotas Autenticadas do Sistema */}
                <Route
                  path="/pdv"
                  element={
                    <ProtectedRoute>
                      <PdvPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/produtos"
                  element={
                    <ProtectedRoute>
                      <ProdutosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clientes"
                  element={
                    <ProtectedRoute>
                      <ClientesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendas"
                  element={
                    <ProtectedRoute>
                      <VendasPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute cargosPermitidos={['ADMIN', 'GERENTE']}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    <ProtectedRoute cargosPermitidos={['ADMIN']}>
                      <UsuariosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute cargosPermitidos={['ADMIN']}>
                      <ConfiguracoesEmpresaPage />
                    </ProtectedRoute>
                  }
                />

                {/* Redirecionamento Padrão */}
                <Route path="*" element={<Navigate to="/pdv" replace />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
