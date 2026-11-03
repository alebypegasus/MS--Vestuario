import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Smartphone,
  Monitor,
  Clock,
  Gauge,
} from 'lucide-react';
import { PITCH_CENAS, ICenaPitch, IPalavraPitch } from '../data/pitchManifest';

type AspectRatioMode = '16:9' | '9:16';

export const PitchMotionPage: React.FC = () => {
  // Estados principais de reprodução e palco
  const [cenaIndex, setCenaIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('16:9');
  const [showTimecode, setShowTimecode] = useState<boolean>(true);
  const [audioError, setAudioError] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const cenaAtual: ICenaPitch = PITCH_CENAS[cenaIndex] || PITCH_CENAS[0];

  // Cálculo de duração acumulada total para a timeline global
  const duracaoTotal = useMemo(() => {
    return PITCH_CENAS.reduce((acc, c) => acc + c.duracao, 0);
  }, []);

  const tempoAcumuladoAnterior = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < cenaIndex; i++) {
      acc += PITCH_CENAS[i].duracao;
    }
    return acc;
  }, [cenaIndex]);

  const tempoGlobalAtual = tempoAcumuladoAnterior + currentTime;

  // Carregar e sincronizar áudio da cena atual
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = cenaAtual.audioUrl;
    audio.playbackRate = playbackSpeed;
    audio.muted = isMuted;
    setCurrentTime(0);
    setAudioError(false);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (cenaIndex < PITCH_CENAS.length - 1) {
        setCenaIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      // Fallback gracioso se áudio não carregar: aciona timer virtual
      setAudioError(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Bloqueio de autoplay do navegador: usuário clica play para iniciar
          setIsPlaying(false);
        });
      }
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [cenaIndex]);

  // Fallback timer se áudio estiver com erro ou ausente
  useEffect(() => {
    if (audioError && isPlaying) {
      const interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= cenaAtual.duracao) {
            if (cenaIndex < PITCH_CENAS.length - 1) {
              setCenaIndex((i) => i + 1);
            } else {
              setIsPlaying(false);
            }
            return 0;
          }
          return prev + 0.1;
        });
      }, 100 / playbackSpeed);
      fallbackTimerRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [audioError, isPlaying, cenaIndex, cenaAtual.duracao, playbackSpeed]);

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

  // Controle Play / Pause
  const togglePlay = useCallback(() => {
    if (audioRef.current && !audioError) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(true));
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [isPlaying, audioError]);

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

  const toggleAspectRatio = useCallback(() => {
    setAspectRatio((prev) => (prev === '16:9' ? '9:16' : '16:9'));
  }, []);

  const toggleTimecode = useCallback(() => {
    setShowTimecode((prev) => !prev);
  }, []);

  // Busca interativa na timeline da cena
  const handleSeekScene = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = clickRatio * cenaAtual.duracao;
    if (audioRef.current && !audioError) {
      audioRef.current.currentTime = targetTime;
    }
    setCurrentTime(targetTime);
  };

  // Atalhos de teclado oficiais do Roteiro (Sprint 6)
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
        case 'KeyA':
          e.preventDefault();
          toggleAspectRatio();
          break;
        case 'KeyT':
          e.preventDefault();
          toggleTimecode();
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
          irParaCena(9); // Cena 10
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    cenaAnterior,
    proximaCena,
    toggleMute,
    toggleFullscreen,
    reiniciarApresentacao,
    toggleAspectRatio,
    toggleTimecode,
    irParaCena,
  ]);

  // Formatação de segundos mm:ss.d
  const formatTimecode = (sec: number) => {
    const safe = Math.max(0, sec);
    const m = Math.floor(safe / 60);
    const s = Math.floor(safe % 60);
    const d = Math.floor((safe % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${d}`;
  };

  // Cores dinâmicas por tema da cena
  const themeStyles = {
    gold: {
      badge: 'bg-amber-400/15 text-amber-300 border-amber-400/40 shadow-amber-400/20',
      glow: 'rgba(250, 204, 21, 0.28)',
      accent: 'text-amber-400',
      border: 'border-amber-400/40',
      activeWord: 'text-yellow-300 font-black drop-shadow-[0_0_20px_rgba(253,224,71,0.85)] scale-105',
      spokenWord: 'text-amber-300/90',
    },
    emerald: {
      badge: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40 shadow-emerald-400/20',
      glow: 'rgba(16, 185, 129, 0.28)',
      accent: 'text-emerald-400',
      border: 'border-emerald-400/40',
      activeWord: 'text-emerald-300 font-black drop-shadow-[0_0_20px_rgba(110,231,183,0.85)] scale-105',
      spokenWord: 'text-emerald-300/90',
    },
    rose: {
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-rose-500/20',
      glow: 'rgba(244, 63, 94, 0.28)',
      accent: 'text-rose-400',
      border: 'border-rose-500/40',
      activeWord: 'text-rose-300 font-black drop-shadow-[0_0_20px_rgba(253,164,175,0.85)] scale-105',
      spokenWord: 'text-rose-300/90',
    },
    indigo: {
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-indigo-500/20',
      glow: 'rgba(99, 102, 241, 0.28)',
      accent: 'text-indigo-400',
      border: 'border-indigo-500/40',
      activeWord: 'text-indigo-300 font-black drop-shadow-[0_0_20px_rgba(165,180,252,0.85)] scale-105',
      spokenWord: 'text-indigo-300/90',
    },
  }[cenaAtual.themeColor || 'gold'];

  // Renderizador dos 15 Cards Visuais de Alto Impacto (Framer Motion)
  const renderVisualShowcase = () => {
    switch (cenaAtual.id) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 space-y-5">
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 160 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-900/90 border-2 border-amber-400/50 flex items-center justify-center p-4 shadow-2xl">
                <img
                  src="/logo.png"
                  alt="MS² Vestuário"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_18px_rgba(250,204,21,0.6)]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <Sparkles className="w-10 h-10 text-amber-400 absolute" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="space-y-2 max-w-xl"
            >
              <span className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30">
                PROJETO INTEGRADOR · FIRJAN SENAI
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                MS² <span className="text-amber-400">VESTUÁRIO</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Sistemas de Frente de Caixa e Gestão Comercial para o Varejo de Moda
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="flex flex-wrap justify-center gap-2.5 pt-1"
            >
              <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> PDV Sub-300ms
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Transações ACID
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Sprint 6 Homologada
              </span>
            </motion.div>
          </div>
        );

      case 2:
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 p-2 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="bg-slate-900/80 border border-rose-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    CRÍTICO
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">&gt; 18 min</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">Filas Lentas no Caixa</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lentidão extrema nos horários de pico. Filas congestionadas causam perda de 28% das vendas por desistência.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    SANGRIA
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">-35% Margem</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">Descontos sem Controle</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Concessão arbitrária de descontos sem autenticação de gerente e sem registro para auditoria contábil.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="bg-slate-900/80 border border-rose-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    FALHAS
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-400">Rejeições</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">Cadastros e Notas Rejeitadas</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  CPFs inválidos, duplicidades no banco de dados e cupom fiscal travando o operador no momento crucial.
                </p>
              </div>
            </motion.div>
          </div>
        );

      case 3:
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 p-2 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 }}
              className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black text-amber-400 tracking-wider uppercase">PILAR 1</span>
              <h3 className="text-base font-black text-white mt-1 mb-1.5">Frente de Caixa Ágil</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Leitura de código de barras em menos de 300ms, teclas de atalho (F1 a F12) e suporte a múltiplos meios de pagamento.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.16 }}
              className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black text-emerald-400 tracking-wider uppercase">PILAR 2</span>
              <h3 className="text-base font-black text-white mt-1 mb-1.5">Governança & Alçadas</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bloqueio rígido de desconto &gt; 10%, matriz RBAC (Caixa, Gerente e Admin) e snapshot imutável de preços.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.24 }}
              className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black text-indigo-400 tracking-wider uppercase">PILAR 3</span>
              <h3 className="text-base font-black text-white mt-1 mb-1.5">BI & Conformidade Fiscal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                NFC-e modelo 65 com chave SEFAZ e QR Code, além de relatórios executivos instantâneos em PDF, Excel e CSV.
              </p>
            </motion.div>
          </div>
        );

      case 4:
        return (
          <div className="w-full flex flex-col items-center p-2 sm:p-6 space-y-4">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 shadow-xl text-center"
              >
                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5">
                  FRONT-END SPA
                </div>
                <div className="text-lg font-black text-white mb-1">React 18 & TypeScript</div>
                <div className="text-xs text-slate-400 mb-2.5">Tailwind CSS · Framer Motion</div>
                <div className="text-[11px] text-emerald-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                  Sub-300ms de renderização · Zero lag
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl text-center"
              >
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                  BACK-END API REST
                </div>
                <div className="text-lg font-black text-white mb-1">Node.js & Express</div>
                <div className="text-xs text-slate-400 mb-2.5">Validação Zod · RBAC Middleware</div>
                <div className="text-[11px] text-amber-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                  JWT Seguro · Autenticação Criptografada
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24 }}
                className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl text-center"
              >
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                  BANCO RELACIONAL
                </div>
                <div className="text-lg font-black text-white mb-1">MySQL 8.0 & SQLite</div>
                <div className="text-xs text-slate-400 mb-2.5">Transações Atômicas ACID</div>
                <div className="text-[11px] text-emerald-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                  Integridade Referencial · Zero Perda
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="w-full max-w-3xl bg-slate-950/95 border border-emerald-500/40 rounded-2xl overflow-hidden shadow-2xl mx-auto my-1">
            <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-400">PDV ATIVO · CAIXA 01 · OPERADOR: ANA SILVA</span>
              </div>
              <span className="font-mono text-slate-400 font-bold">LATÊNCIA: 180ms [SUB-300ms]</span>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center space-y-2">
                <div className="w-full flex items-center justify-center gap-1 font-mono text-slate-500 text-sm tracking-widest">
                  |||| | ||||| ||| |||| | ||||
                </div>
                <div className="w-3/4 h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
                  <Scan className="w-4 h-4" /> Bipado com Sucesso: #103
                </div>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
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
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">F2</kbd> Buscar ·{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">F4</kbd> Qtd ·{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">F8</kbd> Desconto ·{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">F12</kbd> Finalizar
            </div>
          </div>
        );

      case 6:
        return (
          <div className="w-full max-w-2xl bg-slate-950 border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl mx-auto my-1 text-left">
            <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="font-mono text-slate-300 ml-1.5">src/utils/cpf-validator.ts (RN-01)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300">
                MÓDULO 11 OFICIAL
              </span>
            </div>
            <pre className="p-3.5 sm:p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>
                <span className="text-indigo-400 font-bold">export function</span>{' '}
                <span className="text-yellow-300 font-bold">validarCPF</span>(cpf:{' '}
                <span className="text-emerald-400">string</span>):{' '}
                <span className="text-emerald-400">boolean</span> {'{\n'}
                {'  '}
                <span className="text-slate-500">// 1º e 2º dígitos calculados com pesos oficiais da Receita</span>{'\n'}
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
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 p-2 sm:p-6">
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 shadow-xl text-center">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-black">
                F10 EXPRESS
              </span>
              <h3 className="text-base font-bold text-white mt-2 mb-1">Consumidor Final</h3>
              <p className="text-xs text-slate-300">Venda imediata em 1 clique sem exigir identificação na correria.</p>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 shadow-xl text-center">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-black">
                FIDELIZAÇÃO
              </span>
              <h3 className="text-base font-bold text-white mt-2 mb-1">Cliente por CPF</h3>
              <p className="text-xs text-slate-300">Histórico de compras, preferências de tamanhos e crédito no PDV.</p>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-4 shadow-xl text-center">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-xs font-black">
                SEM SAIR DA VENDA
              </span>
              <h3 className="text-base font-bold text-white mt-2 mb-1">Cadastro Ágil</h3>
              <p className="text-xs text-slate-300">Modal instantâneo sobre o carrinho sem resetar as peças bipadas.</p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 p-2 sm:p-6">
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-emerald-400 uppercase">OPERADOR</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                  NÍVEL 1
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Operador de Caixa</h3>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>✔ Operação completa do PDV</li>
                <li>✔ Bipagem e formas de pagamento</li>
                <li>✔ Emissão de NFC-e</li>
              </ul>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-amber-400 uppercase">GERENTE</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                  NÍVEL 2
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Gerente de Loja</h3>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>✔ Liberação de alçada &gt; 10%</li>
                <li>✔ Cancelamento auditado c/ motivo</li>
                <li>✔ Abertura e fechamento de caixa</li>
              </ul>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-indigo-400 uppercase">ADMIN</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
                  NÍVEL 3
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Administrador Geral</h3>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>✔ Gestão de equipe e perfis RBAC</li>
                <li>✔ Relatórios executivos e auditoria</li>
                <li>✔ Parâmetros fiscais e da empresa</li>
              </ul>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="w-full max-w-lg bg-slate-950 border-2 border-rose-500/50 rounded-2xl p-5 shadow-2xl mx-auto my-1 text-center space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">
                RN-02 · ALÇADA GERENCIAL OBRIGATÓRIA
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-2">Desconto Solicitado: 25%</h3>
              <p className="text-xs text-slate-300 mt-1">
                Limite do operador é de 10%. Venda travada aguardando autenticação do gerente.
              </p>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-left text-xs font-mono space-y-1 text-slate-300">
              <div className="text-emerald-400 font-bold">✔ AUTORIZADO POR: MARCELO SOUZA (GERENTE)</div>
              <div>MOTIVO: PROMOÇÃO CAMPANHA DE INVERNO</div>
              <div>LOG AUDITADO: 2026-10-26T14:24:00Z · VENDA #4892</div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 mx-auto">
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-2.5">
              <span className="text-xs font-black text-amber-400 uppercase">RN-04 · SNAPSHOT DE PREÇO</span>
              <h3 className="text-base font-bold text-white">Preço Congelado</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                O valor unitário do item é gravado no ato da venda. Se o produto mudar de preço no catálogo amanhã, o histórico contábil permanece 100% íntegro.
              </p>
            </div>
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-2.5">
              <span className="text-xs font-black text-emerald-400 uppercase">RN-03 · ESTORNO AUDITADO</span>
              <h3 className="text-base font-bold text-white">Cancelamento com Motivo</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nenhuma venda é apagada sem registro. Todo cancelamento exige motivo formal, usuário responsável e estorno automático no estoque.
              </p>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 mx-auto">
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-3.5 shadow-xl">
              <div className="text-[11px] text-slate-400 font-bold">FATURAMENTO HOJE</div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">R$ 14.890,00</div>
              <span className="text-[10px] text-emerald-300 font-semibold">+24.8% vs média</span>
            </div>
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-3.5 shadow-xl">
              <div className="text-[11px] text-slate-400 font-bold">TICKET MÉDIO</div>
              <div className="text-lg sm:text-xl font-black text-amber-400 mt-1">R$ 148,90</div>
              <span className="text-[10px] text-amber-300 font-semibold">100 vendas concluídas</span>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-3.5 shadow-xl">
              <div className="text-[11px] text-slate-400 font-bold">PRODUTO TOP #1</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1 truncate">Calça Jeans Slim</div>
              <span className="text-[10px] text-indigo-300 font-semibold">32 un vendidas</span>
            </div>
            <div className="bg-slate-900/80 border border-purple-500/40 rounded-2xl p-3.5 shadow-xl">
              <div className="text-[11px] text-slate-400 font-bold">MEIOS DE PAGAMENTO</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1">PIX 48% · Cartão 38%</div>
              <span className="text-[10px] text-purple-300 font-semibold">Dinheiro 14%</span>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="w-full max-w-lg bg-slate-950 border border-amber-500/40 rounded-2xl p-4 shadow-2xl mx-auto my-1 text-center space-y-2.5 font-mono">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              DANFE NFC-e · MODELO 65
            </div>
            <div className="text-xs sm:text-sm font-bold text-white">MS² VESTUÁRIO COMÉRCIO DE MODA LTDA</div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 break-all">
              CHAVE SEFAZ (44 DÍGITOS):<br />
              <span className="text-amber-300 font-bold">3326 1012 3456 7800 0190 6500 1000 0000 3410 0984 9201</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-1">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">✔ QR CODE VÁLIDO</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">LEI 12.741 TRANSPARÊNCIA: R$ 24,80</span>
            </div>
          </div>
        );

      case 13:
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 p-2 sm:p-6">
            <div className="bg-slate-900/80 border border-rose-500/40 rounded-2xl p-4 shadow-xl text-center space-y-1.5">
              <FileText className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Relatório em PDF</h3>
              <p className="text-xs text-slate-300">Layout A4 institucional completo com identidade visual e sumário.</p>
            </div>
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 shadow-xl text-center space-y-1.5">
              <FileSpreadsheet className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Planilha Excel (.xlsx)</h3>
              <p className="text-xs text-slate-300">Fórmulas automáticas, subtotais e colunas de margem bruta.</p>
            </div>
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-4 shadow-xl text-center space-y-1.5">
              <Database className="w-8 h-8 text-indigo-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Exportação CSV UTF-8</h3>
              <p className="text-xs text-slate-300">Compatibilidade instantânea com Power BI, Tableau e ERPs legados.</p>
            </div>
          </div>
        );

      case 14:
        return (
          <div className="w-full max-w-2xl bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-2xl mx-auto my-1 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs sm:text-sm font-bold text-white">SUÍTE AUTOMATIZADA DE TESTES E2E</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                18 / 18 PASS (100%)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-01 Módulo 11 CPF Válido: PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-01 Rejeição CPF Falso: PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-02 Desconto Caixa (&le; 10%): PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-02 Bloqueio Desconto &gt; 10%: PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-03 Estorno c/ Motivo Formal: PASS</div>
              <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✔</span> RN-04 Snapshot Preço Congelado: PASS</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center text-xs font-bold text-emerald-400">
              EVIDÊNCIA COMPROVADA · ZERO FALHAS · HOMOLOGADO PELA FIRJAN SENAI
            </div>
          </div>
        );

      case 15:
        return (
          <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-4">
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-3 w-full flex flex-col items-center"
            >
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                MS² VESTUÁRIO
              </div>

              <div className="w-full max-w-md bg-slate-900/90 border-2 border-amber-400/50 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-base shadow-md shrink-0">
                  ✨
                </div>
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-bold text-white">Moda, estilo e você.</div>
                  <div className="text-[11px] text-amber-300">Projeto Integrador · Firjan SENAI</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={reiniciarApresentacao}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-400/20 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Assistir Novamente [R]</span>
                </button>
                <NavLink
                  to="/pdv"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Acessar Frente de Caixa [PDV]</span>
                </NavLink>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  const porcentagemCena = Math.min(100, Math.max(0, (currentTime / (cenaAtual.duracao || 1)) * 100));
  const porcentagemGlobal = Math.min(100, Math.max(0, (tempoGlobalAtual / (duracaoTotal || 1)) * 100));

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#050811] text-slate-100 font-sans overflow-x-hidden flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950"
    >
      {/* FUNDO ILUMINADO: GLOWS DINÂMICOS & VINHETA RADIAL */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[160px] opacity-25 top-[-100px] left-[15%] transition-transform duration-700 ease-out"
          style={{ background: themeStyles.glow }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 bottom-[-80px] right-[10%] transition-transform duration-700 ease-out"
          style={{ background: 'rgba(99, 102, 241, 0.25)' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,8,17,0.92)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* HEADER: BARRA SUPERIOR DE COMANDOS */}
      <header className="relative z-20 w-full px-4 sm:px-6 py-2.5 border-b border-white/10 bg-slate-950/70 backdrop-blur-md flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Voltar + Identificação */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/pdv"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            title="Voltar ao PDV"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDV</span>
          </NavLink>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-black tracking-wider text-amber-400">
              MS² VESTUÁRIO <span className="text-white/40 hidden md:inline">· PITCH SPRINT 6</span>
            </span>
          </div>
        </div>

        {/* Centro: Timeline Geral Compacta */}
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-md mx-4">
          <span className="text-[11px] font-mono text-slate-400 font-bold">
            {formatTimecode(tempoGlobalAtual)}
          </span>
          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 transition-all duration-100 ease-linear"
              style={{ width: `${porcentagemGlobal}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {formatTimecode(duracaoTotal)}
          </span>
        </div>

        {/* Lado Direito: Controles de Palco (Proporção, Velocidade, Áudio, Fullscreen) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Seletor de Aspect Ratio (16:9 / 9:16) */}
          <button
            onClick={toggleAspectRatio}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              aspectRatio === '9:16'
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title="Alternar Proporção [A] (16:9 Apresentação / 9:16 Reels Vertical)"
          >
            {aspectRatio === '16:9' ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{aspectRatio}</span>
          </button>

          {/* Velocidade de Reprodução */}
          <button
            onClick={() => {
              const speeds = [1, 1.25, 1.5];
              const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
              setPlaybackSpeed(speeds[nextIndex]);
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all"
            title="Velocidade da narração"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>{playbackSpeed}x</span>
          </button>

          {/* Mudo / Som */}
          <button
            onClick={toggleMute}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
            title={isMuted ? 'Ativar Áudio [M]' : 'Silenciar [M]'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Timecode Toggle */}
          <button
            onClick={toggleTimecode}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
              showTimecode
                ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Alternar Timecode [T]"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Tela Cheia [F]"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Link para o Player Standalone */}
          <a
            href="/motion-pitch-player.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all"
            title="Abrir Player Standalone HTML"
          >
            <span>Player HTML</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* PALCO CENTRAL: CORPO PRINCIPAL COM SUPORTE A 16:9 E 9:16 REELS */}
      <main className="relative z-10 flex-1 w-full flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        <div
          className={`relative w-full transition-all duration-300 flex flex-col items-center justify-between ${
            aspectRatio === '9:16'
              ? 'max-w-[440px] min-h-[720px] max-h-[880px] rounded-[36px] border-2 border-white/20 bg-[#090d1a]/95 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-5'
              : 'max-w-6xl min-h-[580px] rounded-3xl border border-white/10 bg-[#090d1a]/85 backdrop-blur-xl shadow-2xl p-4 sm:p-8'
          }`}
        >
          {/* CAMERA RIG / NOTCH REELS quando em modo vertical */}
          {aspectRatio === '9:16' && (
            <div className="w-24 h-1.5 rounded-full bg-white/20 mb-3 mx-auto" />
          )}

          {/* Topo do Palco: Tag da Cena + Timecode da Cena */}
          <div className="w-full flex items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm ${themeStyles.badge}`}
              >
                {cenaAtual.tag}
              </span>
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                {cenaAtual.title}
              </span>
            </div>

            {showTimecode && (
              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 font-mono text-xs font-bold text-slate-300">
                {formatTimecode(currentTime)} / {formatTimecode(cenaAtual.duracao)}
              </div>
            )}
          </div>

          {/* ÁREA DINÂMICA DA CENA COM FRAMER MOTION */}
          <div className="w-full flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={cenaAtual.id}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center text-center space-y-4"
              >
                {/* Headline com Efeito Karaokê Sincronizado Palavra por Palavra */}
                <h1
                  className={`font-black tracking-tight leading-tight max-w-4xl px-2 ${
                    aspectRatio === '9:16'
                      ? 'text-lg sm:text-xl'
                      : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                  }`}
                >
                  {cenaAtual.palavras.map((p: IPalavraPitch, idx: number) => {
                    const isWordActive = currentTime >= p.s && currentTime < p.e;
                    const isWordSpoken = currentTime >= p.e;

                    let wordClass = 'text-slate-500 opacity-35';
                    if (isWordActive) {
                      if (p.accent === 'gold') wordClass = 'text-yellow-300 font-black drop-shadow-[0_0_25px_rgba(253,224,71,0.9)] scale-110';
                      else if (p.accent === 'emerald') wordClass = 'text-emerald-300 font-black drop-shadow-[0_0_25px_rgba(110,231,183,0.9)] scale-110';
                      else if (p.accent === 'rose') wordClass = 'text-rose-300 font-black drop-shadow-[0_0_25px_rgba(253,164,175,0.9)] scale-110';
                      else wordClass = 'text-white font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] scale-105';
                    } else if (isWordSpoken) {
                      if (p.accent === 'gold') wordClass = 'text-amber-300/90 font-bold';
                      else if (p.accent === 'emerald') wordClass = 'text-emerald-300/90 font-bold';
                      else if (p.accent === 'rose') wordClass = 'text-rose-300/90 font-bold';
                      else wordClass = 'text-slate-200/90 font-medium';
                    }

                    return (
                      <span
                        key={`${cenaAtual.id}-${idx}`}
                        className={`inline-block mr-1.5 transition-all duration-150 transform ${wordClass}`}
                      >
                        {p.w}
                      </span>
                    );
                  })}
                </h1>

                {/* Showcase Visual da Cena */}
                <div className="w-full flex items-center justify-center">
                  {renderVisualShowcase()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Barra de Progresso da Cena Atual com Clique Interativo */}
          <div
            onClick={handleSeekScene}
            className="w-full h-2 rounded-full bg-slate-900 border border-white/10 cursor-pointer overflow-hidden mt-2 relative group"
            title="Clique para navegar na cena"
          >
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-100 ease-linear group-hover:brightness-125"
              style={{ width: `${porcentagemCena}%` }}
            />
          </div>
        </div>
      </main>

      {/* FOOTER: CONTROLE DE REPRODUÇÃO & TIMELINE DAS 15 CENAS */}
      <footer className="relative z-20 w-full px-4 sm:px-6 py-3 border-t border-white/10 bg-slate-950/80 backdrop-blur-md flex flex-col gap-2.5">
        {/* Régua de Miniaturas / Pílulas das 15 Cenas */}
        <div className="w-full flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PITCH_CENAS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => irParaCena(i)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 ${
                i === cenaIndex
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-105'
                  : i < cenaIndex
                  ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                  : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
              }`}
              title={`${c.tag}: ${c.title}`}
            >
              {String(c.id).padStart(2, '0')}
            </button>
          ))}
        </div>

        {/* Linha de Controles Inferiores */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Botões Play / Anterior / Próximo / Reiniciar */}
          <div className="flex items-center gap-2">
            <button
              onClick={cenaAnterior}
              disabled={cenaIndex === 0}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all"
              title="Cena Anterior [←]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-all shadow-md active:scale-95"
              title="Play / Pause [ESPAÇO]"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
            </button>

            <button
              onClick={proximaCena}
              disabled={cenaIndex === PITCH_CENAS.length - 1}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all"
              title="Próxima Cena [→]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={reiniciarApresentacao}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all"
              title="Reiniciar Apresentação [R]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Dicas de Atalhos de Teclado */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-bold text-slate-300">Atalhos:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300 font-mono">
              Espaço
            </kbd>{' '}
            Play/Pause ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300 font-mono">
              ← →
            </kbd>{' '}
            Navegar ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300 font-mono">
              A
            </kbd>{' '}
            Proporção ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300 font-mono">
              T
            </kbd>{' '}
            Timecode ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300 font-mono">
              F
            </kbd>{' '}
            Tela Cheia ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300 font-mono">
              R
            </kbd>{' '}
            Reiniciar
          </div>

          {/* Indicador de Cena Atual */}
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="text-amber-400 font-bold">
              CENA {String(cenaAtual.id).padStart(2, '0')} / {String(PITCH_CENAS.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
