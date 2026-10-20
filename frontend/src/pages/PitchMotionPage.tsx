import React, { useState } from 'react';
import {
  Sparkles,
  Monitor,
  Smartphone,
  Maximize2,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const CENAS_PITCH = [
  { id: 1,  titulo: 'Abertura Cinemática', tag: 'Marca' },
  { id: 2,  titulo: 'O Gargalo do Varejo', tag: 'Dores' },
  { id: 3,  titulo: 'A Solução MS² Vestuário', tag: 'PILARES' },
  { id: 4,  titulo: 'Engenharia & Arquitetura', tag: 'ACID' },
  { id: 5,  titulo: 'PDV ao Vivo Sub-300ms', tag: 'EXPRESS' },
  { id: 6,  titulo: 'Código: RN-01 Módulo 11 (CPF)', tag: 'MATH' },
  { id: 7,  titulo: 'Gestão de Clientes & Fidelização', tag: 'RN-06' },
  { id: 8,  titulo: 'Matriz de Segurança RBAC', tag: 'ROLES' },
  { id: 9,  titulo: 'Código: RN-02 Alçada de Desconto', tag: 'ALÇADA' },
  { id: 10, titulo: 'Histórico Imutável & Snapshot', tag: 'RN-04' },
  { id: 11, titulo: 'Dashboard Executivo BentoGrid', tag: 'BI' },
  { id: 12, titulo: 'Emissão Fiscal NFC-e / SAT', tag: 'SEFAZ' },
  { id: 13, titulo: 'Relatórios Excel, CSV e PDF', tag: 'AUDITORIA' },
  { id: 14, titulo: '18/18 Testes E2E Homologados', tag: '100% PASS' },
  { id: 15, titulo: 'Encerramento & Firjan SENAI', tag: 'OURO' },
];

export const PitchMotionPage: React.FC = () => {
  const [aspectVertical, setAspectVertical] = useState<boolean>(false);
  const [cenaAtiva, setCenaAtiva] = useState<number>(1);

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

  const saltarParaCena = (num: number) => {
    setCenaAtiva(num);
    const iframe = document.getElementById('motion-player-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      // Dispara evento ou chama irParaCena
      iframe.contentWindow.postMessage({ tipo: 'IR_PARA_CENA', cena: num }, '*');
      const win = iframe.contentWindow as any;
      if (typeof win.irParaCena === 'function') {
        win.irParaCena(num);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-3 sm:p-5 lg:p-6 space-y-4">
      {/* Barra Superior de Controle */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <NavLink
            to="/pdv"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao PDV [Alt+1]</span>
          </NavLink>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                Sprint 6 · Motion Design Pitch (15 Apresentações)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Gabarito Firjan SENAI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Player em código com relógio determinístico <code className="text-amber-400 font-mono">render(t)</code>, áudio neural e atalhos de palco
            </p>
          </div>
        </div>

        {/* Ações e Alternadores de Proporção */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
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
              <span>16:9 Cinema</span>
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
            title="Reiniciar Apresentação (3-2-1)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Modo Tela Cheia [F]"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carrossel Rápido das 15 Cenas */}
      <div className="w-full max-w-7xl overflow-x-auto pb-1 flex items-center gap-2 scrollbar-thin">
        {CENAS_PITCH.map((c) => (
          <button
            key={c.id}
            onClick={() => saltarParaCena(c.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              cenaAtiva === c.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="font-mono text-[10px] opacity-70">#{String(c.id).padStart(2, '0')}</span>
            <span>{c.titulo}</span>
          </button>
        ))}
      </div>

      {/* Área Central: Iframe do Player Escalado */}
      <div className="w-full flex-1 flex items-center justify-center py-2">
        <div
          className={`relative bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 ${
            aspectVertical
              ? 'w-full max-w-[420px] aspect-[9/16] max-h-[80vh]'
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
      <div className="w-full max-w-7xl pt-3 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-bold text-slate-300">Atalhos de Palco:</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">ESPAÇO (Play/Pause)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">R (Reiniciar 3-2-1)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">← → (Pular Cenas)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">1..9, 0 (Cenas)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">M (Mudo/Voz)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">F (Tela Cheia)</span>
          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">A (16:9 / 9:16)</span>
        </div>

        <a
          href="/motion-pitch-player.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline font-bold flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Abrir Player Standalone em Nova Aba</span>
        </a>
      </div>
    </div>
  );
};
