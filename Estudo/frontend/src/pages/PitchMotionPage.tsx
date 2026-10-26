import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Shield,
  ShoppingBag,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Scan,
  Database,
  ExternalLink,
} from 'lucide-react';
import { PITCH_CENAS, ICenaPitch, IPalavraPitch } from '../data/pitchManifest';

export const PitchMotionPage: React.FC = () => {
  const [cenaIndex, setCenaIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [autoAdvance] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const cenaAtual: ICenaPitch = PITCH_CENAS[cenaIndex] || PITCH_CENAS[0];

  // Carregar e tocar áudio da cena atual
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = cenaAtual.audioUrl;
    audio.playbackRate = playbackSpeed;
    audio.muted = isMuted;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (autoAdvance) {
        if (cenaIndex < PITCH_CENAS.length - 1) {
          setCenaIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay policy: aguarda primeiro clique do usuário
        setIsPlaying(false);
      });
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [cenaIndex]);

  // Sincronizar velocidade
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sincronizar Mudo
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Sincronizar Play/Pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const irParaCena = useCallback((index: number) => {
    if (index >= 0 && index < PITCH_CENAS.length) {
      setCenaIndex(index);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, []);

  const cenaAnterior = useCallback(() => {
    if (cenaIndex > 0) {
      irParaCena(cenaIndex - 1);
    }
  }, [cenaIndex, irParaCena]);

  const proximaCena = useCallback(() => {
    if (cenaIndex < PITCH_CENAS.length - 1) {
      irParaCena(cenaIndex + 1);
    }
  }, [cenaIndex, irParaCena]);

  const reiniciarApresentacao = useCallback(() => {
    irParaCena(0);
  }, [irParaCena]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          cenaAnterior();
          break;
        case 'ArrowRight':
          e.preventDefault();
          proximaCena();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyR':
          e.preventDefault();
          reiniciarApresentacao();
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          e.preventDefault();
          irParaCena(parseInt(e.key, 10) - 1);
          break;
        case 'Digit0':
          e.preventDefault();
          irParaCena(9);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, cenaAnterior, proximaCena, toggleMute, toggleFullscreen, reiniciarApresentacao, irParaCena]);

  const porcentagemCena = Math.min(100, (currentTime / (cenaAtual.duracao || 1)) * 100);

  // Determinar se uma palavra está ativa
  const getWordState = (p: IPalavraPitch) => {
    if (currentTime >= p.s && currentTime <= p.e + 0.12) return 'active';
    if (currentTime > p.e + 0.12) return 'passed';
    return 'upcoming';
  };

  // Cores dinâmicas para o tema da cena
  const themeGlow = {
    gold: 'from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-400',
    rose: 'from-rose-500/20 via-red-500/10 to-transparent border-rose-500/30 text-rose-400',
    indigo: 'from-indigo-500/20 via-blue-500/10 to-transparent border-indigo-500/30 text-indigo-400',
  }[cenaAtual.themeColor || 'gold'];

  // Renderizador do Card Visual de cada Cena (Framer Motion)
  const renderVisualShowcase = () => {
    switch (cenaAtual.id) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-10 space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 180 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-900/90 border-2 border-amber-400/50 flex items-center justify-center p-4 shadow-2xl">
                <img
                  src="/logo.png"
                  alt="MS² Vestuário"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <Sparkles className="w-12 h-12 text-amber-400 absolute" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2 max-w-xl"
            >
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30">
                PROJETO INTEGRADOR · FIRJAN SENAI
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                MS² <span className="text-amber-400">VESTUÁRIO</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-medium">
                Sistemas de Frente de Caixa e Gestão Comercial para o Varejo de Moda
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap justify-center gap-3 pt-2"
            >
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" /> PDV Sub-300ms
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Transações ACID
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Sprint 6 Homologada
              </span>
            </motion.div>
          </div>
        );

      case 2:
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/80 border border-rose-500/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    CRÍTICO
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">&gt; 18 min</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Filas Lentas no Caixa</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Lentidão extrema nos horários de pico. Filas congestionadas causam perda de 28% das vendas por desistência.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    SANGRIA
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">-35% Margem</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Descontos sem Controle</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Concessão arbitrária de descontos sem autenticação de gerente e sem registro para auditoria contábil.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/80 border border-rose-500/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    FALHAS
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">Rejeições</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Cadastros e Notas Rejeitadas</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  CPFs inválidos, duplicidades no banco de dados e cupom fiscal travando o operador no momento crucial.
                </p>
              </div>
            </motion.div>
          </div>
        );

      case 3:
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-amber-400 tracking-wider uppercase">PILAR 1</span>
              <h3 className="text-lg font-black text-white mt-1 mb-2">Frente de Caixa Ágil</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Leitura de código de barras em menos de 300ms, teclas de atalho (F1 a F12) e suporte a múltiplos meios de pagamento.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-emerald-400 tracking-wider uppercase">PILAR 2</span>
              <h3 className="text-lg font-black text-white mt-1 mb-2">Governança & Alçadas</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Bloqueio rígido de desconto &gt; 10%, matriz RBAC (Caixa, Gerente e Admin) e snapshot imutável de preços.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-indigo-400 tracking-wider uppercase">PILAR 3</span>
              <h3 className="text-lg font-black text-white mt-1 mb-2">BI & Conformidade Fiscal</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                NFC-e modelo 65 com chave SEFAZ e QR Code, além de relatórios executivos instantâneos em PDF, Excel e CSV.
              </p>
            </motion.div>
          </div>
        );

      case 4:
        return (
          <div className="w-full flex flex-col items-center p-4 sm:p-8 space-y-6">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-5 shadow-xl text-center"
              >
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                  FRONT-END SPA
                </div>
                <div className="text-xl font-black text-white mb-1">React 19 & TypeScript</div>
                <div className="text-xs text-slate-400 mb-3">Tailwind CSS • Framer Motion</div>
                <div className="text-[11px] text-emerald-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                  Sub-300ms de renderização • Zero lag
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-xl text-center"
              >
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  BACK-END API REST
                </div>
                <div className="text-xl font-black text-white mb-1">Node.js & Express</div>
                <div className="text-xs text-slate-400 mb-3">Validação Zod • RBAC Middleware</div>
                <div className="text-[11px] text-amber-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                  JWT Seguro • Autenticação Criptografada
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-xl text-center"
              >
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  BANCO RELACIONAL
                </div>
                <div className="text-xl font-black text-white mb-1">MySQL 8.0 & SQLite</div>
                <div className="text-xs text-slate-400 mb-3">Transações Atômicas ACID</div>
                <div className="text-[11px] text-emerald-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                  Integridade Referencial • Zero Perda
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="w-full max-w-4xl bg-slate-950/95 border border-emerald-500/40 rounded-2xl overflow-hidden shadow-2xl mx-auto my-2">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-400">PDV ATIVO · CAIXA 01 · OPERADOR: ANA SILVA</span>
              </div>
              <span className="font-mono text-slate-400 font-bold">LATÊNCIA: 180ms [SUB-300ms]</span>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center space-y-2">
                <div className="w-full flex items-center justify-center gap-1 font-mono text-slate-500 text-sm tracking-widest">
                  |||| | ||||| ||| |||| | ||||
                </div>
                <div className="w-3/4 h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pt-2">
                  <Scan className="w-4 h-4" /> Bipado com Sucesso: #103
                </div>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-200">
                  <span>#103 Calça Jeans Slim Raw Denim (1x)</span>
                  <span className="text-amber-400 font-mono">R$ 159,90</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold">TOTAL DA VENDA:</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">R$ 159,90</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/60 px-4 py-2 text-center text-[11px] font-mono text-slate-400 border-t border-slate-800">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">F2</kbd> Buscar · <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">F4</kbd> Qtd · <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">F8</kbd> Desconto · <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">F12</kbd> Finalizar
            </div>
          </div>
        );

      case 6:
        return (
          <div className="w-full max-w-3xl bg-slate-950 border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl mx-auto my-2 text-left">
            <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="font-mono text-slate-300 ml-2">src/utils/cpf-validator.ts (RN-01)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300">
                MÓDULO 11 OFICIAL
              </span>
            </div>
            <pre className="p-4 sm:p-5 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>
                <span className="text-indigo-400 font-bold">export function</span>{' '}
                <span className="text-yellow-300 font-bold">validarCPF</span>(cpf:{' '}
                <span className="text-emerald-400">string</span>):{' '}
                <span className="text-emerald-400">boolean</span> {'{\n'}
                {'  '}
                <span className="text-slate-500">// 1º e 2º dígitos calculados com algoritmo da Receita</span>{'\n'}
                {'  '}
                <span className="text-indigo-400">let</span> d1 = 11 - (somarPesos(limpo, 9, 10) % 11);{'\n'}
                {'  '}
                <span className="text-rose-400 font-bold">if</span> (d1 !== Number(limpo[9])){' '}
                <span className="text-rose-400 font-bold">return false</span>;{' '}
                <span className="text-rose-400/80">// Bloqueia CPF falso</span>{'\n'}
                {'  '}
                <span className="text-indigo-400">let</span> d2 = 11 - (somarPesos(limpo, 10, 11) % 11);{'\n'}
                {'  '}
                <span className="text-emerald-400 font-bold">return</span> d2 === Number(limpo[10]);{' '}
                <span className="text-emerald-400/80">// Homologado 100%</span>{'\n'}
                {'}'}
              </code>
            </pre>
          </div>
        );

      case 7:
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8">
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-5 shadow-xl text-center">
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-black">F10 EXPRESS</span>
              <h3 className="text-base font-bold text-white mt-3 mb-1">Consumidor Final</h3>
              <p className="text-xs text-slate-300">Venda imediata em 1 clique sem exigir identificação na correria.</p>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-5 shadow-xl text-center">
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-black">FIDELIZAÇÃO</span>
              <h3 className="text-base font-bold text-white mt-3 mb-1">Cliente por CPF</h3>
              <p className="text-xs text-slate-300">Histórico de compras, preferências de tamanhos e crédito no PDV.</p>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-5 shadow-xl text-center">
              <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-xs font-black">SEM SAIR DA VENDA</span>
              <h3 className="text-base font-bold text-white mt-3 mb-1">Cadastro Ágil</h3>
              <p className="text-xs text-slate-300">Modal instantâneo sobre o carrinho sem resetar as peças bipadas.</p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8">
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-emerald-400 uppercase">OPERADOR</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">NÍVEL 1</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Operador de Caixa</h3>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>✔ Operação completa do PDV</li>
                <li>✔ Bipagem e formas de pagamento</li>
                <li>✔ Emissão de NFC-e</li>
              </ul>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-amber-400 uppercase">GERENTE</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">NÍVEL 2</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Gerente de Loja</h3>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>✔ Liberação de alçada &gt; 10%</li>
                <li>✔ Cancelamento auditado c/ motivo</li>
                <li>✔ Abertura e fechamento de caixa</li>
              </ul>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-indigo-400 uppercase">ADMIN</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">NÍVEL 3</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Administrador</h3>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>✔ Gestão de equipe e perfis RBAC</li>
                <li>✔ Relatórios executivos e auditoria</li>
                <li>✔ Parâmetros fiscais e da empresa</li>
              </ul>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="w-full max-w-xl bg-slate-950 border-2 border-rose-500/50 rounded-2xl p-6 shadow-2xl mx-auto my-2 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">
                RN-02 · ALÇADA GERENCIAL OBRIGATÓRIA
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2">Desconto Solicitado: 15%</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Limite do operador é de 10%. Venda travada aguardando autenticação do gerente.
              </p>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-left text-xs font-mono space-y-1 text-slate-300">
              <div className="text-emerald-400 font-bold">✔ AUTORIZADO POR: MARCELO SOUZA (GERENTE)</div>
              <div>MOTIVO: PROMOÇÃO CAMPANHA DE INVERNO</div>
              <div>LOG AUDITADO: 2026-10-26T14:24:00Z · VENDA #4892</div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 mx-auto">
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-3">
              <span className="text-xs font-black text-amber-400 uppercase">RN-04 · SNAPSHOT DE PREÇO</span>
              <h3 className="text-lg font-bold text-white">Preço Congelado</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                O valor unitário do item é gravado no ato da venda. Se o produto mudar de preço no catálogo amanhã, o histórico contábil permanece 100% íntegro.
              </p>
            </div>
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-3">
              <span className="text-xs font-black text-emerald-400 uppercase">RN-03 · ESTORNO AUDITADO</span>
              <h3 className="text-lg font-bold text-white">Cancelamento com Motivo</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nenhuma venda é apagada sem registro. Todo cancelamento exige motivo formal, usuário responsável e estorno automático no estoque.
              </p>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 mx-auto">
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 shadow-xl">
              <div className="text-xs text-slate-400 font-bold">FATURAMENTO HOJE</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">R$ 14.850,00</div>
              <span className="text-[10px] text-emerald-300 font-semibold">+24.8% vs ontem</span>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 shadow-xl">
              <div className="text-xs text-slate-400 font-bold">TICKET MÉDIO</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">R$ 142,50</div>
              <span className="text-[10px] text-amber-300 font-semibold">104 vendas</span>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-4 shadow-xl">
              <div className="text-xs text-slate-400 font-bold">PRODUTO TOP #1</div>
              <div className="text-sm font-bold text-white mt-1 truncate">Calça Jeans Slim</div>
              <span className="text-[10px] text-indigo-300 font-semibold">42 un vendidas</span>
            </div>
            <div className="bg-slate-900/80 border border-purple-500/40 rounded-2xl p-4 shadow-xl">
              <div className="text-xs text-slate-400 font-bold">MEIOS DE PAGAMENTO</div>
              <div className="text-sm font-bold text-white mt-1">PIX: 52% · Cartão: 38%</div>
              <span className="text-[10px] text-purple-300 font-semibold">Dinheiro: 10%</span>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="w-full max-w-xl bg-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-2xl mx-auto my-2 text-center space-y-3 font-mono">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              DANFE NFC-e · MODELO 65
            </div>
            <div className="text-sm font-bold text-white">MS² VESTUÁRIO COMÉRCIO DE MODA LTDA</div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 break-all">
              CHAVE SEFAZ (44 DÍGITOS):<br />
              <span className="text-amber-300 font-bold">3326 1012 3456 7800 0190 6500 1000 0000 3410 0984 9201</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
              <span className="px-2 py-1 rounded bg-slate-800 text-emerald-400 font-bold">✔ QR CODE VÁLIDO</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200">LEI 12.741 TRANSPARÊNCIA: R$ 24,80</span>
            </div>
          </div>
        );

      case 13:
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8">
            <div className="bg-slate-900/80 border border-rose-500/40 rounded-2xl p-5 shadow-xl text-center space-y-2">
              <FileText className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Relatório em PDF</h3>
              <p className="text-xs text-slate-300">Layout A4 institucional completo com identidade visual e sumário.</p>
            </div>
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-5 shadow-xl text-center space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Planilha Excel (.xlsx)</h3>
              <p className="text-xs text-slate-300">Fórmulas automáticas, subtotais e colunas de margem bruta.</p>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-5 shadow-xl text-center space-y-2">
              <Database className="w-10 h-10 text-indigo-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Exportação CSV UTF-8</h3>
              <p className="text-xs text-slate-300">Compatibilidade instantânea com Power BI, Tableau e ERPs legados.</p>
            </div>
          </div>
        );

      case 14:
        return (
          <div className="w-full max-w-3xl bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-2xl mx-auto my-2 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-mono text-xs sm:text-sm font-bold text-white">SUÍTE AUTOMATIZADA DE TESTES E2E</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                18 / 18 PASS (100%)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-01 Módulo 11 CPF Válido: PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-01 Rejeição CPF Falso: PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-02 Desconto Caixa (&le; 10%): PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-02 Bloqueio Desconto &gt; 10%: PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-03 Estorno c/ Motivo Formal: PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-04 Snapshot Preço Congelado: PASS</div>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center text-xs font-bold text-emerald-400">
              EVIDÊNCIA COMPROVADA · ZERO FALHAS · HOMOLOGADO PARA PRODUÇÃO
            </div>
          </div>
        );

      case 15:
        return (
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 w-full flex flex-col items-center"
            >
              {/* Palavra do CTA Grande com Brilho (Página 7 do PDF) */}
              <div className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(250,204,21,0.6)]">
                MS2
              </div>

              {/* Caixa de Comentário Simulada (Página 7 do PDF) */}
              <div className="w-full max-w-md bg-slate-900/90 border-2 border-amber-400/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-lg shadow-md shrink-0">
                  💬
                </div>
                <div className="flex-1 text-left text-sm sm:text-base font-bold text-white flex items-center">
                  <span>Comente MS2 no chat</span>
                  <span className="inline-block w-0.5 h-5 bg-amber-400 ml-1.5 animate-pulse" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md">
                Moda, estilo e você — com a tecnologia que o seu varejo merece.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={reiniciarApresentacao}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Assistir Novamente [R]
              </button>
              <NavLink
                to="/pdv"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" /> Acessar Frente de Caixa [Alt+1]
              </NavLink>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans select-none"
    >
      {/* Luzes ambiente de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 bg-gradient-to-br ${themeGlow} transition-all duration-700`}
        />
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 bg-indigo-500/20" />
      </div>

      {/* TOPBAR: Cabeçalho com Ações e Retorno */}
      <header className="relative z-10 w-full px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <NavLink
            to="/pdv"
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Voltar ao PDV [Alt+1]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>PDV [Alt+1]</span>
          </NavLink>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              MS² Vestuário <span className="text-amber-400">· Pitch Motion Design</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Sprint 6 Homologada
            </span>
          </div>
        </div>

        {/* Controles da Barra Superior */}
        <div className="flex items-center gap-2">
          {/* Seletor de Velocidade */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
            {[1, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded transition-all ${
                  playbackSpeed === speed
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Mudo / Volume */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Alternar Áudio [M]"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Reiniciar */}
          <button
            onClick={reiniciarApresentacao}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Reiniciar [R]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Tela Cheia */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Tela Cheia [F]"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* CARROSSEL DOS 15 PILLS DE CENA */}
      <nav className="relative z-10 w-full px-4 sm:px-6 py-2 bg-slate-950/40 border-b border-slate-800/50 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {PITCH_CENAS.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => irParaCena(idx)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
              cenaIndex === idx
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black scale-105'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span className="font-mono text-[10px] opacity-70">#{String(c.id).padStart(2, '0')}</span>
            <span>{c.rotulo}</span>
          </button>
        ))}
      </nav>

      {/* ÁREA PRINCIPAL DO PALCO (STAGE) */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-6 max-w-6xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={cenaAtual.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8"
          >
            {/* Header da Cena com Badge */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-slate-900 border border-slate-700/80 text-amber-400">
                {cenaAtual.tag}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-300">
                {cenaAtual.title}
              </span>
            </div>

            {/* TELEPROMPTER DE ALTO CONTRASTE (KARAOKE DINÂMICO) */}
            <h1 className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-snug sm:leading-relaxed max-w-4xl px-2">
              {cenaAtual.palavras.map((p, idx) => {
                const state = getWordState(p);
                const isWordActive = state === 'active';
                const isWordPassed = state === 'passed';

                let colorClasses = 'text-slate-400 opacity-60 font-semibold';
                if (isWordActive) {
                  colorClasses =
                    'text-amber-300 font-black scale-110 drop-shadow-[0_0_16px_rgba(250,204,21,0.9)] bg-amber-400/20 px-1.5 py-0.5 rounded-lg border border-amber-400/40 inline-block';
                } else if (isWordPassed) {
                  if (p.accent === 'gold') colorClasses = 'text-amber-400 font-bold opacity-100';
                  else if (p.accent === 'emerald') colorClasses = 'text-emerald-400 font-bold opacity-100';
                  else if (p.accent === 'rose') colorClasses = 'text-rose-400 font-bold opacity-100';
                  else colorClasses = 'text-white font-bold opacity-100';
                }

                return (
                  <span
                    key={`${cenaAtual.id}-${idx}`}
                    className={`transition-all duration-150 inline-block mr-1.5 ${colorClasses}`}
                  >
                    {p.w}
                  </span>
                );
              })}
            </h1>

            {/* Showcase Visual Customizado da Cena */}
            <div className="w-full">{renderVisualShowcase()}</div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER: Barra de Controle de Palco & Timelines */}
      <footer className="relative z-10 w-full px-4 sm:px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-col gap-2.5">
        {/* Barra de Progresso da Cena Atual e Global */}
        <div className="w-full flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="text-amber-400 font-bold">
            {String(cenaAtual.id).padStart(2, '0')} / {String(PITCH_CENAS.length).padStart(2, '0')}
          </span>
          <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100 ease-linear"
              style={{ width: `${porcentagemCena}%` }}
            />
          </div>
          <span>
            {currentTime.toFixed(1)}s / {cenaAtual.duracao.toFixed(1)}s
          </span>
        </div>

        {/* Linha de Controles Inferiores */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Botões de Ação Play / Prev / Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={cenaAnterior}
              disabled={cenaIndex === 0}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all"
              title="Cena Anterior [←]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-all shadow-md"
              title="Play / Pause [ESPAÇO]"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
            </button>

            <button
              onClick={proximaCena}
              disabled={cenaIndex === PITCH_CENAS.length - 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all"
              title="Próxima Cena [→]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dicas de Atalhos */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-bold text-slate-300">Atalhos:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              Espaço
            </kbd>{' '}
            Play/Pause ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              ← →
            </kbd>{' '}
            Pular Cenas ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              M
            </kbd>{' '}
            Mudo ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              F
            </kbd>{' '}
            Tela Cheia ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              R
            </kbd>{' '}
            Reiniciar
          </div>

          {/* Link para o Player Standalone */}
          <a
            href="/motion-pitch-player.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Player Standalone HTML</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </footer>
    </div>
  );
};
