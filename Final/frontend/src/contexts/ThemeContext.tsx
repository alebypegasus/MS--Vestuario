import React, { createContext, useContext, useState, useEffect } from 'react';

export type TemaModo = 'system' | 'dark' | 'light';

interface IThemeContextData {
  tema: TemaModo;
  temaEfetivo: 'dark' | 'light';
  setTema: (tema: TemaModo) => void;
}

const ThemeContext = createContext<IThemeContextData>({} as IThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização padrão: automático ('system')
  const [tema, setTemaState] = useState<TemaModo>(() => {
    return (localStorage.getItem('app_theme') as TemaModo) || 'system';
  });

  const [temaEfetivo, setTemaEfetivo] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const aplicarTema = () => {
      let resolved: 'dark' | 'light';

      if (tema === 'system') {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      } else {
        resolved = tema;
      }

      setTemaEfetivo(resolved);

      if (resolved === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    aplicarTema();

    const listener = () => {
      if (tema === 'system') {
        aplicarTema();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [tema]);

  const setTema = (novoTema: TemaModo) => {
    setTemaState(novoTema);
    localStorage.setItem('app_theme', novoTema);
  };

  return (
    <ThemeContext.Provider value={{ tema, temaEfetivo, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): IThemeContextData {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
}
