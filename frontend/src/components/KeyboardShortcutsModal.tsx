import React from 'react';
import {
  X,
  Keyboard,
  Command,
  ShoppingCart,
  Video,
  Monitor,
  Sparkles,
  Zap,
} from 'lucide-react';

interface IKeyboardShortcutsModalProps {
  aberto: boolean;
  onFechar: () => void;
}

export const KeyboardShortcutsModal: React.FC<IKeyboardShortcutsModalProps> = ({
  aberto,
  onFechar,
}) => {
  if (!aberto) return null;

  const grupos = [
    {
      titulo: 'Navegação Global do Sistema',
      icone: Command,
      cor: 'text-indigo-500',
      atalhos: [
        { teclas: ['Alt', '1'], descricao: 'Ir para o PDV Caixa' },
        { teclas: ['Alt', '2'], descricao: 'Ir para o Catálogo de Produtos' },
        { teclas: ['Alt', '3'], descricao: 'Ir para Gestão de Clientes' },
        { teclas: ['Alt', '4'], descricao: 'Ir para Histórico de Vendas' },
        { teclas: ['Alt', '5'], descricao: 'Ir para o Dashboard Gerencial' },
        { teclas: ['Alt', '6'], descricao: 'Ir para Controle de Equipe (Admin)' },
        { teclas: ['Alt', '7'], descricao: 'Ir para Dados da Empresa & Fisco' },
        { teclas: ['Alt', 'P'], descricao: 'Abrir Apresentação Motion Pitch' },
        { teclas: ['Alt', 'H'], descricao: 'Abrir Dossiê de Homologação' },
        { teclas: ['Alt', 'T'], descricao: 'Alternar Tema (Claro / Escuro / Auto)' },
        { teclas: ['?'], descricao: 'Abrir este Guia de Atalhos' },
      ],
    },
    {
      titulo: 'Operação no PDV Caixa',
      icone: ShoppingCart,
      cor: 'text-emerald-500',
      atalhos: [
        { teclas: ['F2'], descricao: 'Focar no Leitor de Código de Barras' },
        { teclas: ['F4'], descricao: 'Abrir Seleção / Cadastro de Cliente' },
        { teclas: ['F8'], descricao: 'Aplicar Desconto / Alçada Gerencial' },
        { teclas: ['F9'], descricao: 'Concluir Venda / Ir para Pagamento' },
        { teclas: ['F12'], descricao: 'Limpar Carrinho Atual' },
        { teclas: ['ESC'], descricao: 'Fechar Modais e Telas de Apoio' },
      ],
    },
    {
      titulo: 'Player de Motion Design (Sprint 6)',
      icone: Video,
      cor: 'text-amber-500',
      atalhos: [
        { teclas: ['ESPAÇO'], descricao: 'Iniciar / Pausar Apresentação' },
        { teclas: ['R'], descricao: 'Reiniciar com Contagem 3-2-1' },
        { teclas: ['←', '→'], descricao: 'Avançar / Voltar Cenas (1 a 15)' },
        { teclas: ['1..9', '0'], descricao: 'Pular Direto para Cenas Específicas' },
        { teclas: ['T'], descricao: 'Exibir / Ocultar Timecode HUD' },
        { teclas: ['M'], descricao: 'Ativar / Desativar Áudio & Voz Neural' },
        { teclas: ['F'], descricao: 'Modo Tela Cheia (Fullscreen)' },
        { teclas: ['A'], descricao: 'Alternar Widescreen 16:9 vs Reels 9:16' },
        { teclas: ['C'], descricao: 'Ver Código-Fonte da Cena Atual' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-4xl rounded-2xl glass-card border border-brand-500/30 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto bg-slate-900 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-brand-600/20 via-indigo-600/20 to-amber-600/20 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Central de Atalhos de Teclado</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Agilidade Operacional
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pressione a qualquer momento no sistema para consultar as teclas de atalho
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Bento Grid com Atalhos */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {grupos.map((grupo, gIdx) => {
            const Icone = grupo.icone;
            return (
              <div
                key={gIdx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-3 shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                    <Icone className={`w-4 h-4 ${grupo.cor}`} />
                    <span className="font-extrabold text-xs uppercase tracking-wider text-slate-200">
                      {grupo.titulo}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    {grupo.atalhos.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="flex items-center justify-between gap-2 text-xs py-1"
                      >
                        <span className="text-slate-400 text-[11px] leading-tight">
                          {item.descricao}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.teclas.map((t, tIdx) => (
                            <kbd
                              key={tIdx}
                              className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-800 text-amber-300 border border-slate-700 shadow-xs"
                            >
                              {t}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com Dica */}
        <div className="bg-slate-950/90 border-t border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              Dica: aperte <kbd className="px-1.5 py-0.5 font-mono text-amber-300 bg-slate-800 rounded">?</kbd> em qualquer tela para abrir este painel.
            </span>
          </div>

          <button
            onClick={onFechar}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
