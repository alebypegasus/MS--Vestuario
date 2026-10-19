import React, { useState } from 'react';
import { Sparkles, Monitor, Smartphone, Maximize2, RotateCcw, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const PitchMotionPage: React.FC = () => {
  const [aspectVertical, setAspectVertical] = useState<boolean>(false);

  const toggleFullscreen = () => {
    const iframe = document.getElementById('motion-player-frame') as HTMLIFrameElement;
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen().catch(() => {});
      }
    }
  };

  const restartPlayer = () => {
    const iframe = document.getElementById('motion-player-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8">
      {/* Barra Superior de Controle */}
      <div className="w-full max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <NavLink
            to="/pdv"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao PDV</span>
          </NavLink>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                Sprint 6 · Motion Design Pitch
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Gabarito Firjan SENAI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Player em código nativo com relógio <code className="text-amber-400 font-mono">render(t)</code> determinístico
            </p>
          </div>
        </div>

        {/* Ações e Alternadores de Proporção */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Toggle 16:9 vs 9:16 */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setAspectVertical(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                !aspectVertical
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9 Apresentação</span>
            </button>
            <button
              onClick={() => setAspectVertical(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                aspectVertical
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Reels</span>
            </button>
          </div>

          <button
            onClick={restartPlayer}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Reiniciar player"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Tela Cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Área Central: Iframe do Player Escalado */}
      <div className="w-full flex-1 flex items-center justify-center py-6">
        <div
          className={`relative bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 ${
            aspectVertical
              ? 'w-full max-w-[420px] aspect-[9/16] max-h-[82vh]'
              : 'w-full max-w-6xl aspect-[16/9]'
          }`}
        >
          <iframe
            id="motion-player-frame"
            src="/motion-pitch-player.html"
            title="MS² Vestuário Motion Pitch"
            className="w-full h-full border-0"
            allow="fullscreen; autoplay"
          />
        </div>
      </div>

      {/* Dicas de Atalhos e Guia da Apresentação */}
      <div className="w-full max-w-7xl pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span>Atalhos do Teclado:</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">ESPAÇO (Play/Pause)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">R (Reiniciar 3-2-1)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">← → (Pular Cenas)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">T (Timecode)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">F (Tela Cheia)</span>
        </div>

        <a
          href="/motion-pitch-player.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline font-bold flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Abrir Player Standalone em Nova Aba
        </a>
      </div>
    </div>
  );
};
