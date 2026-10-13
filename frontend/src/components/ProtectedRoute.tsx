import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CargoUsuario } from '../types';

interface IProtectedRouteProps {
  children: React.ReactNode;
  cargosPermitidos?: CargoUsuario[];
}

export const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  children,
  cargosPermitidos,
}) => {
  const { autenticado, carregando, usuario } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  if (!autenticado || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (cargosPermitidos && !cargosPermitidos.includes(usuario.cargo)) {
    return <Navigate to="/pdv" replace />;
  }

  return <>{children}</>;
};
