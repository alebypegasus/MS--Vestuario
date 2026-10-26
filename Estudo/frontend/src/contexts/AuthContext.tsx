import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUsuario, IUsuarioLoginDTO } from '../types';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';

interface IAuthContextData {
  usuario: IUsuario | null;
  token: string | null;
  autenticado: boolean;
  carregando: boolean;
  isAdmin: boolean;
  isGerenteOuAdmin: boolean;
  isCaixa: boolean;
  login: (dados: IUsuarioLoginDTO) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<IUsuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const { adicionarToast } = useToast();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('usuario');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUsuario(JSON.parse(storedUser));
      }
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    } finally {
      setCarregando(false);
    }
  }, []);

  const login = async (dados: IUsuarioLoginDTO) => {
    try {
      const resposta = await authApi.login(dados);
      localStorage.setItem('token', resposta.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
      setToken(resposta.token);
      setUsuario(resposta.usuario);
      adicionarToast('success', `Bem-vindo(a), ${resposta.usuario.nome}!`, `Sessão iniciada como ${resposta.usuario.cargo}.`);
    } catch (err: any) {
      const msg = err.message || 'Falha na autenticação';
      adicionarToast('error', 'Erro de Acesso', msg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    adicionarToast('info', 'Sessão Encerrada', 'Você saiu do sistema com segurança.');
  };

  const isAdmin = usuario?.cargo === 'ADMIN';
  const isGerenteOuAdmin = usuario?.cargo === 'ADMIN' || usuario?.cargo === 'GERENTE';
  const isCaixa = usuario?.cargo === 'CAIXA';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado: !!usuario && !!token,
        carregando,
        isAdmin,
        isGerenteOuAdmin,
        isCaixa,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): IAuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
