import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface IKeyboardShortcutsOptions {
  onAbrirHomologacao?: () => void;
  onAbrirAjudaAtalhos?: () => void;
}

/**
 * Hook global de atalhos de teclado do MS² Vestuário
 * 
 * Atalhos Globais:
 * - Alt + 1: Ir para PDV Caixa
 * - Alt + 2: Ir para Catálogo de Produtos
 * - Alt + 3: Ir para Clientes
 * - Alt + 4: Ir para Histórico de Vendas
 * - Alt + 5: Ir para Dashboard Gerencial (Gerente/Admin)
 * - Alt + 6: Ir para Equipe (Admin)
 * - Alt + 7: Ir para Empresa & Fiscal (Admin)
 * - Alt + P ou F10: Ir para o Motion Pitch (Sprint 6)
 * - Alt + H ou F1: Abrir Dossiê de Homologação
 * - Alt + T: Alternar Tema (Claro / Escuro / Sistema)
 * - ? ou Shift + /: Abrir Guia de Atalhos
 */
export const useKeyboardShortcuts = ({
  onAbrirHomologacao,
  onAbrirAjudaAtalhos,
}: IKeyboardShortcutsOptions = {}) => {
  const navigate = useNavigate();
  const { tema, setTema } = useTheme();
  const { isGerenteOuAdmin, isAdmin } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar digitação em inputs/textareas para teclas sem modificador (exceto F1-F12 e Esc)
      const target = e.target as HTMLElement | null;
      const estaDigitando =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // F1: Dossiê de Homologação
      if (e.key === 'F1') {
        e.preventDefault();
        onAbrirHomologacao?.();
        return;
      }

      // F10: Motion Pitch
      if (e.key === 'F10') {
        e.preventDefault();
        navigate('/pitch');
        return;
      }

      // ?: Abrir Guia de Atalhos (quando não estiver digitando)
      if (e.key === '?' && !estaDigitando) {
        e.preventDefault();
        onAbrirAjudaAtalhos?.();
        return;
      }

      // Atalhos combinados com Alt
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();

        switch (key) {
          case '1':
            e.preventDefault();
            navigate('/pdv');
            break;
          case '2':
            e.preventDefault();
            navigate('/produtos');
            break;
          case '3':
            e.preventDefault();
            navigate('/clientes');
            break;
          case '4':
            e.preventDefault();
            navigate('/vendas');
            break;
          case '5':
            if (isGerenteOuAdmin) {
              e.preventDefault();
              navigate('/dashboard');
            }
            break;
          case '6':
            if (isAdmin) {
              e.preventDefault();
              navigate('/usuarios');
            }
            break;
          case '7':
            if (isAdmin) {
              e.preventDefault();
              navigate('/configuracoes');
            }
            break;
          case 'p':
            e.preventDefault();
            navigate('/pitch');
            break;
          case 'h':
            e.preventDefault();
            onAbrirHomologacao?.();
            break;
          case 't':
            e.preventDefault();
            // Alternar: light -> dark -> system -> light
            if (tema === 'light') setTema('dark');
            else if (tema === 'dark') setTema('system');
            else setTema('light');
            break;
          case '/':
            e.preventDefault();
            onAbrirAjudaAtalhos?.();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, tema, setTema, isGerenteOuAdmin, isAdmin, onAbrirHomologacao, onAbrirAjudaAtalhos]);
};
