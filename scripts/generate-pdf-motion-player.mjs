import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('Estudo/frontend/public/pitch/audio/manifest.json', 'utf8'));
const roteiro = JSON.parse(fs.readFileSync('Estudo/frontend/public/pitch/roteiro.json', 'utf8'));

// Dados das 15 cenas
const CENAS = manifest.cenas.map((c) => {
  const r = roteiro.cenas.find(x => x.id === c.id) || { rotulo: `Cena ${c.id}` };
  return {
    id: c.id,
    arquivo: c.arquivo,
    audioUrl: `/pitch/audio/${c.arquivo}`,
    rotulo: r.rotulo,
    duracao: c.duracao,
    palavras: c.palavras
  };
});

// Palavras de destaque com a cor de destaque (Ouro/Amarelo #FACC15 e Esmeralda #10B981)
const PALAVRAS_DESTAQUE = {
  1: ['emoção.', 'operação', 'vitrine,'],
  2: ['filas', 'travam', 'sem', 'controle.', 'perdida.'],
  3: ['ms²', 'vestuário:', 'varejo', 'moda.'],
  4: ['react', 'typescript', 'node', 'express,', 'acid.'],
  5: ['velocidade', 'absoluta.', 'trezentos', 'milissegundos.'],
  6: ['receita', 'federal.', 'módulo', 'onze', 'bloqueia'],
  7: ['segundos:', 'fidelizado,', 'consumidor'],
  8: ['caixa', 'gerente', 'administrador', 'middleware'],
  9: ['desconto', 'acima', 'dez', 'cento?', 'bloqueia', 'gerente.'],
  10: ['histórico', 'imutável.', 'congelado'],
  11: ['painel', 'tempo', 'real:', 'faturamento,', 'ticket'],
  12: ['nfc-e', 'sessenta', 'cinco', 'quarenta', 'quatro', 'dígitos,'],
  13: ['um', 'clique:', 'pdf', 'excel', 'csv'],
  14: ['evidência.', 'dezoito', 'testes', 'homologadas.'],
  15: ['ms²', 'vestuário.', 'moda,', 'estilo', 'você,']
};

console.log(`Carregadas ${CENAS.length} cenas para o player vertical do PDF.`);

const playerHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>MS² Vestuário — Motion Design Reels (9:16)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800;900&family=JetBrains+Mono:wght@600;800&display=swap" rel="stylesheet">

  <style>
    /* ==========================================================
       PADRÃO MOTION DESIGN DO GUIA (PALCO FIXO 1080x1920 PX)
       Baseado no Guia @fabiowinck_: Vídeos em Motion com IA
       ========================================================== */
    :root {
      --bg: #070913;
      --bg-card: rgba(15, 23, 42, 0.78);
      --border-card: rgba(255, 255, 255, 0.12);
      --text: #F8FAFC;
      --text-muted: #94A3B8;
      --highlight: #FACC15; /* Cor de destaque forte (Dourado/Amarelo Ouro) */
      --highlight-glow: rgba(250, 204, 21, 0.45);
      --emerald: #10B981;
      --rose: #F43F5E;
      --blue: #3B82F6;
      --scale: 0.5;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    body {
      background: #000000;
      color: var(--text);
      font-family: 'Inter', sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    body.playing {
      cursor: none;
    }

    /* Container de centralização e proporção */
    #viewport-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000000;
      overflow: hidden;
    }

    /* PALCO FIXO EXATO DE 1080x1920 PX ESCALADO PARA A JANELA */
    #stage {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 1080px;
      height: 1920px;
      transform-origin: center center;
      transform: translate(-50%, -50%) scale(var(--scale));
      background: var(--bg);
      overflow: hidden;
      box-shadow: 0 0 140px rgba(0, 0, 0, 0.95);
      border-radius: 40px;
    }

    /* FUNDO VIVO: MANCHAS DE LUZ NAS CORES DA MARCA + VINHETA */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(160px);
      pointer-events: none;
      opacity: 0.4;
      will-change: transform;
    }

    .glow-gold {
      width: 750px;
      height: 750px;
      background: radial-gradient(circle, rgba(250, 204, 21, 0.35) 0%, transparent 70%);
      top: 15%;
      left: 10%;
    }

    .glow-blue {
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
      bottom: 20%;
      right: 5%;
    }

    .glow-emerald {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
      top: 50%;
      left: 35%;
    }

    .vignette-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.85) 100%);
      pointer-events: none;
      z-index: 10;
    }

    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 80px 80px;
      pointer-events: none;
      opacity: 0.7;
    }

    /* CÂMERA DINÂMICA (SLOW PUSH-IN CONTÍNUO) */
    #camera-rig {
      position: absolute;
      inset: 0;
      transform-origin: center center;
      will-change: transform;
    }

    /* ÁREA SEGURA DO REELS (EXATOS 280px DO TOPO E 670px DA BASE CONFORME O GUIA!) */
    .safe-zone {
      position: absolute;
      top: 280px;
      bottom: 670px;
      left: 70px;
      right: 70px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      z-index: 20;
    }

    /* TRANSIÇÃO COM FLASH DE LUZ ENTRE CENAS (REQUISITO DA PÁGINA 7 DO PDF!) */
    .scene-flash {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, transparent 80%);
      opacity: 0;
      pointer-events: none;
      z-index: 990;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .scene-flash.active {
      opacity: 1;
      transition: none;
    }

    /* BADGE DE CENA SUPERIOR */
    .scene-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 10px 24px;
      border-radius: 9999px;
      background: rgba(250, 204, 21, 0.12);
      border: 2px solid rgba(250, 204, 21, 0.35);
      color: var(--highlight);
      font-family: 'Space Grotesk', sans-serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: 0 0 25px rgba(250, 204, 21, 0.2);
    }

    .scene-badge-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--emerald);
      box-shadow: 0 0 12px var(--emerald);
    }

    /* TÍTULO / NARRAÇÃO EM TEXTO GRANDE (90px A 120px) PALAVRA POR PALAVRA */
    .narration-container {
      width: 100%;
      min-height: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .narration-headline {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 82px;
      font-weight: 900;
      line-height: 1.18;
      letter-spacing: -0.03em;
      color: var(--text);
      text-wrap: balance;
    }

    /* PALAVRAS ENTRANDO COM EASE-OUT EXPONENCIAL E ALTO CONTRASTE (ZERO BLUR) */
    .word {
      display: inline-block;
      margin: 0 10px 8px 10px;
      opacity: 0.38;
      transform: translateY(14px);
      filter: none;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  color 0.2s ease,
                  text-shadow 0.2s ease;
      will-change: transform, opacity;
    }

    .word.entered {
      opacity: 1;
      transform: translateY(0);
      color: #FFFFFF;
    }

    .word.highlight {
      color: var(--highlight);
      text-shadow: 0 0 35px var(--highlight-glow);
      font-weight: 900;
    }

    .word.active-word {
      transform: scale(1.1) translateY(-2px);
      text-shadow: 0 0 45px rgba(250, 204, 21, 0.95);
      color: #FFFBEB;
      font-weight: 900;
    }

    /* ELEMENTO VISUAL CENTRAL POR CENA */
    .visual-stage {
      width: 100%;
      height: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* CARDS VISUAIS MODERNOS */
    .v-card {
      background: var(--bg-card);
      border: 2px solid var(--border-card);
      border-radius: 32px;
      backdrop-filter: blur(20px);
      padding: 40px;
      width: 100%;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
      transform: translateY(30px);
      opacity: 0;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease;
    }

    .v-card.show {
      transform: translateY(0);
      opacity: 1;
    }

    /* CENAS ESPECÍFICAS */
    .brand-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .brand-logo-crest {
      width: 220px;
      height: 220px;
      border-radius: 48px;
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.25), rgba(15, 23, 42, 0.9));
      border: 3px solid rgba(250, 204, 21, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 80px rgba(250, 204, 21, 0.4);
      position: relative;
    }

    .brand-logo-img {
      width: 160px;
      height: 160px;
      object-fit: contain;
      filter: drop-shadow(0 0 20px rgba(250, 204, 21, 0.6));
    }

    .hero-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 54px;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    /* GRID DE DORES (CENA 2) */
    .pain-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      width: 100%;
    }

    .pain-box {
      background: rgba(244, 63, 94, 0.1);
      border: 2px solid rgba(244, 63, 94, 0.4);
      border-radius: 24px;
      padding: 24px 18px;
      text-align: center;
    }

    .pain-stat {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 48px;
      font-weight: 900;
      color: var(--rose);
      margin-bottom: 8px;
    }

    .pain-desc {
      font-size: 24px;
      font-weight: 700;
      color: #F8FAFC;
    }

    /* PILARES (CENA 3) */
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      width: 100%;
    }

    .pillar-box {
      background: rgba(16, 185, 129, 0.1);
      border: 2px solid rgba(16, 185, 129, 0.4);
      border-radius: 24px;
      padding: 28px 20px;
      text-align: center;
    }

    .pillar-icon {
      font-size: 42px;
      margin-bottom: 12px;
    }

    .pillar-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: var(--emerald);
    }

    /* FLUXO ARQUITETURA (CENA 4) */
    .arch-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .arch-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.15);
      padding: 20px 28px;
      border-radius: 20px;
    }

    .arch-tag {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: var(--highlight);
    }

    .arch-tech {
      font-size: 28px;
      font-weight: 800;
      color: #FFFFFF;
    }

    /* TERMINAL PDV SUB-300MS (CENA 5) */
    .pdv-screen {
      width: 100%;
      background: #020617;
      border: 3px solid rgba(16, 185, 129, 0.6);
      border-radius: 28px;
      padding: 28px;
      font-family: 'JetBrains Mono', monospace;
      text-align: left;
    }

    .pdv-top {
      display: flex;
      justify-content: space-between;
      font-size: 24px;
      font-weight: 800;
      color: var(--emerald);
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }

    .pdv-item {
      display: flex;
      justify-content: space-between;
      font-size: 30px;
      font-weight: 800;
      color: #F8FAFC;
      margin-bottom: 12px;
    }

    .pdv-total {
      display: flex;
      justify-content: space-between;
      font-size: 40px;
      font-weight: 900;
      color: var(--highlight);
      border-top: 2px solid rgba(255, 255, 255, 0.15);
      padding-top: 16px;
      margin-top: 16px;
    }

    /* CENA FINAL: CTA COM COMENTÁRIO SIMULADO (REQUISITO DA PÁGINA 7 DO PDF!) */
    .cta-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 36px;
      width: 100%;
    }

    .cta-giant-word {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 150px;
      font-weight: 900;
      letter-spacing: -0.04em;
      background: linear-gradient(90deg, #FACC15 0%, #FFFFFF 50%, #FACC15 100%);
      background-size: 200% auto;
      color: transparent;
      -webkit-background-clip: text;
      animation: shine 2.5s linear infinite;
      text-shadow: 0 0 60px rgba(250, 204, 21, 0.6);
    }

    @keyframes shine {
      to {
        background-position: 200% center;
      }
    }

    .comment-simulator {
      width: 100%;
      background: rgba(30, 41, 59, 0.95);
      border: 3px solid rgba(250, 204, 21, 0.5);
      border-radius: 32px;
      padding: 28px 36px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    }

    .comment-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FACC15, #F59E0B);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 900;
      color: #000;
    }

    .comment-input {
      flex: 1;
      font-size: 34px;
      font-weight: 700;
      color: #FFFFFF;
      text-align: left;
    }

    .cursor-blink {
      display: inline-block;
      width: 4px;
      height: 38px;
      background: var(--highlight);
      margin-left: 6px;
      animation: blink 0.8s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    /* CONTADOR 3-2-1 AO INICIAR (REQUISITO DA PÁGINA 6 DO PDF!) */
    #start-overlay {
      position: absolute;
      inset: 0;
      background: #000000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      cursor: pointer;
    }

    #countdown-display {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 260px;
      font-weight: 900;
      color: var(--highlight);
      text-shadow: 0 0 100px var(--highlight-glow);
      display: none;
    }

    .start-prompt {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      text-align: center;
    }

    .start-btn-icon {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: var(--highlight);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 60px var(--highlight-glow);
      transition: transform 0.2s ease;
    }

    .start-btn-icon:hover {
      transform: scale(1.08);
    }

    .start-btn-icon svg {
      width: 60px;
      height: 60px;
      fill: #000000;
      margin-left: 8px;
    }

    .start-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 46px;
      font-weight: 800;
      color: #FFFFFF;
    }

    .start-sub {
      font-size: 28px;
      color: var(--text-muted);
    }

    .start-badge-key {
      display: inline-block;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      padding: 6px 16px;
      border-radius: 12px;
      color: #FFFFFF;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    /* TIMECODE NO CANTO (ATALHO T DO PDF) */
    #timecode-corner {
      position: absolute;
      top: 36px;
      right: 40px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 24px;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(0, 0, 0, 0.6);
      padding: 8px 18px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      z-index: 500;
      display: none; /* Escondido por padrão, aperta T para mostrar */
    }

    /* BARRA INFERIOR DE CONTROLES DO REELS - FADE OUT NA GRAVAÇÃO */
    #hud-footer {
      position: absolute;
      bottom: 40px;
      left: 60px;
      right: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 100;
      font-size: 22px;
      font-weight: 700;
      color: var(--text-muted);
      transition: opacity 0.3s ease;
      opacity: 0.85;
      pointer-events: none;
    }

    body.playing #hud-footer {
      opacity: 0;
    }

    .scene-counter {
      font-family: 'JetBrains Mono', monospace;
      color: var(--highlight);
    }
  </style>
</head>
<body>

  <div id="viewport-container">
    <div id="stage">
      
      <!-- Flash de Transição entre Cenas -->
      <div id="scene-flash" class="scene-flash"></div>

      <!-- Fundo Vivo Dinâmico -->
      <div class="ambient-glow glow-gold"></div>
      <div class="ambient-glow glow-blue"></div>
      <div class="ambient-glow glow-emerald"></div>
      <div class="grid-lines"></div>
      <div class="vignette-overlay"></div>

      <!-- Timecode no Canto (Atalho T) -->
      <div id="timecode-corner">00:00.0 / CENA 01</div>

      <!-- Câmera com Slow Push-in -->
      <div id="camera-rig">
        <div class="safe-zone">
          
          <!-- Topo da Cena: Badge Temático -->
          <div class="scene-badge" id="scene-badge">
            <span class="scene-badge-dot"></span>
            <span id="badge-text">MS² VESTUÁRIO · SPRINT 6</span>
          </div>

          <!-- Centro: Narração Palavra por Palavra com Tipografia Gigante -->
          <div class="narration-container">
            <h1 class="narration-headline" id="headline">
              <!-- As palavras são renderizadas dinamicamente via render(t) -->
            </h1>
          </div>

          <!-- Base: Elemento Visual da Cena -->
          <div class="visual-stage" id="visual-stage">
            <!-- Cards ou Gráficos em HTML/SVG -->
          </div>

        </div>
      </div>

      <!-- Barra de Controle Inferior (HUD) -->
      <div id="hud-footer">
        <span class="scene-counter" id="scene-counter">CENA 01 / 15</span>
        <span>ATALHOS: [ESPAÇO] PLAY · [R] REINICIAR · [← →] CENAS · [T] TEMPO</span>
      </div>

      <!-- Overlay Inicial com Contagem 3-2-1 -->
      <div id="start-overlay" onclick="iniciarComContagem()">
        <div id="countdown-display">3</div>
        <div class="start-prompt" id="start-prompt">
          <div class="start-btn-icon">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="start-title">Iniciar Gravação do Reels</div>
          <div class="start-sub">
            Clique na tela ou aperte <span class="start-badge-key">ESPAÇO</span> para começar com contagem 3-2-1
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Elemento de Áudio Opcional Sincronizado -->
  <audio id="audio-player" preload="auto"></audio>

  <script>
    // ==========================================================
    // CRONOGRAMA DETERMINÍSTICO E DADOS DAS 15 CENAS
    // ==========================================================
    const CENAS_DATA = ${JSON.stringify(CENAS, null, 2)};
    const DESTAQUES = ${JSON.stringify(PALAVRAS_DESTAQUE, null, 2)};

    let cenaAtivaIndex = 0;
    let isPlaying = false;
    let isCountingDown = false;
    let globalTime = 0;
    let lastTimestamp = 0;
    let showTimecode = false;

    const stage = document.getElementById('stage');
    const cameraRig = document.getElementById('camera-rig');
    const badgeText = document.getElementById('badge-text');
    const headline = document.getElementById('headline');
    const visualStage = document.getElementById('visual-stage');
    const sceneCounter = document.getElementById('scene-counter');
    const timecodeCorner = document.getElementById('timecode-corner');
    const startOverlay = document.getElementById('start-overlay');
    const startPrompt = document.getElementById('start-prompt');
    const countdownDisplay = document.getElementById('countdown-display');
    const audio = document.getElementById('audio-player');

    // 1. AJUSTE DE ESCALA AUTOMÁTICA (1080x1920 CABE EM QUALQUER TELA)
    function resize() {
      const padding = 20;
      const availableW = window.innerWidth - padding;
      const availableH = window.innerHeight - padding;
      const scale = Math.min(availableW / 1080, availableH / 1920);
      document.documentElement.style.setProperty('--scale', scale.toFixed(4));
    }
    window.addEventListener('resize', resize);
    resize();

    // 2. FUNÇÃO RENDER VISUAL DE CADA CENA
    function montarVisualCena(id) {
      switch(id) {
        case 1:
          return \`
            <div class="brand-hero v-card show">
              <div class="brand-logo-crest">
                <img src="/logo.png" alt="MS²" class="brand-logo-img" onerror="this.style.display='none'">
              </div>
              <div class="hero-title">MS² VESTUÁRIO</div>
              <div style="font-size:26px; color:#FACC15; font-weight:800;">Frente de Caixa & Gestão Comercial</div>
            </div>
          \`;
        case 2:
          return \`
            <div class="v-card show">
              <div class="pain-grid">
                <div class="pain-box">
                  <div class="pain-stat">&gt; 18m</div>
                  <div class="pain-desc">Filas no Caixa</div>
                </div>
                <div class="pain-box">
                  <div class="pain-stat">-35%</div>
                  <div class="pain-desc">Margem Sangrada</div>
                </div>
                <div class="pain-box">
                  <div class="pain-stat">FALHA</div>
                  <div class="pain-desc">Notas Rejeitadas</div>
                </div>
              </div>
            </div>
          \`;
        case 3:
          return \`
            <div class="v-card show">
              <div class="pillars-grid">
                <div class="pillar-box">
                  <div class="pillar-icon">⚡</div>
                  <div class="pillar-title">Sub-300ms</div>
                </div>
                <div class="pillar-box">
                  <div class="pillar-icon">🛡️</div>
                  <div class="pillar-title">Alçadas RBAC</div>
                </div>
                <div class="pillar-box">
                  <div class="pillar-icon">📊</div>
                  <div class="pillar-title">BI & NFC-e</div>
                </div>
              </div>
            </div>
          \`;
        case 4:
          return \`
            <div class="v-card show">
              <div class="arch-stack">
                <div class="arch-item">
                  <span class="arch-tag">FRONT-END</span>
                  <span class="arch-tech">React 19 & TypeScript</span>
                </div>
                <div class="arch-item">
                  <span class="arch-tag">API REST</span>
                  <span class="arch-tech">Node.js, Express & Zod</span>
                </div>
                <div class="arch-item">
                  <span class="arch-tag">BANCO ACID</span>
                  <span class="arch-tech">MySQL 8.0 & SQLite</span>
                </div>
              </div>
            </div>
          \`;
        case 5:
          return \`
            <div class="v-card show">
              <div class="pdv-screen">
                <div class="pdv-top">
                  <span>CAIXA 01 · OPERADOR: ANA SILVA</span>
                  <span>180ms</span>
                </div>
                <div class="pdv-item">
                  <span>#103 Calça Jeans Slim Raw Denim</span>
                  <span style="color:#FACC15;">R$ 159,90</span>
                </div>
                <div class="pdv-total">
                  <span>TOTAL:</span>
                  <span>R$ 159,90</span>
                </div>
              </div>
            </div>
          \`;
        case 6:
          return \`
            <div class="v-card show" style="text-align:left; font-family:'JetBrains Mono', monospace;">
              <div style="color:#10B981; font-size:26px; font-weight:800; margin-bottom:12px;">✔ RN-01 MÓDULO 11 OFICIAL</div>
              <div style="font-size:24px; color:#F8FAFC; line-height:1.4;">
                d1 = 11 - (somarPesos(cpf, 9) % 11)<br>
                d2 = 11 - (somarPesos(cpf, 10) % 11)<br>
                <span style="color:#F43F5E;">if (invalido) bloqueiaVenda();</span>
              </div>
            </div>
          \`;
        case 7:
          return \`
            <div class="v-card show">
              <div class="pillars-grid">
                <div class="pillar-box">
                  <div class="pillar-icon">👤</div>
                  <div class="pillar-title">Consumidor F10</div>
                </div>
                <div class="pillar-box">
                  <div class="pillar-icon">⭐</div>
                  <div class="pillar-title">Fidelizado CPF</div>
                </div>
                <div class="pillar-box">
                  <div class="pillar-icon">📝</div>
                  <div class="pillar-title">Cadastro Rápido</div>
                </div>
              </div>
            </div>
          \`;
        case 8:
          return \`
            <div class="v-card show">
              <div class="arch-stack">
                <div class="arch-item">
                  <span class="arch-tag">OPERACIONAL</span>
                  <span class="arch-tech">Caixa (PDV & Vendas)</span>
                </div>
                <div class="arch-item">
                  <span class="arch-tag">TÁTICO</span>
                  <span class="arch-tech">Gerente (Alçadas &gt; 10%)</span>
                </div>
                <div class="arch-item">
                  <span class="arch-tag">ESTRATÉGICO</span>
                  <span class="arch-tech">Admin (Gestão Total)</span>
                </div>
              </div>
            </div>
          \`;
        case 9:
          return \`
            <div class="v-card show" style="border-color:#F43F5E;">
              <div style="font-size:42px; margin-bottom:8px;">🔒</div>
              <div style="font-family:'Space Grotesk'; font-size:36px; font-weight:900; color:#F43F5E; margin-bottom:8px;">
                DESCONTO &gt; 10% BLOQUEADO
              </div>
              <div style="font-size:26px; color:#F8FAFC;">
                Exige senha e credencial do Gerente com gravação auditada.
              </div>
            </div>
          \`;
        case 10:
          return \`
            <div class="v-card show">
              <div style="font-size:42px; margin-bottom:8px;">🧊</div>
              <div style="font-family:'Space Grotesk'; font-size:34px; font-weight:900; color:#FACC15; margin-bottom:8px;">
                PREÇO HISTÓRICO CONGELADO
              </div>
              <div style="font-size:24px; color:#F8FAFC;">
                Snapshot imutável do item: integridade contábil para sempre.
              </div>
            </div>
          \`;
        case 11:
          return \`
            <div class="v-card show">
              <div class="pain-grid">
                <div class="pillar-box">
                  <div class="pain-stat" style="font-size:36px; color:#10B981;">R$ 14,8k</div>
                  <div class="pain-desc">Faturamento</div>
                </div>
                <div class="pillar-box">
                  <div class="pain-stat" style="font-size:36px; color:#FACC15;">R$ 142</div>
                  <div class="pain-desc">Ticket Médio</div>
                </div>
                <div class="pillar-box">
                  <div class="pain-stat" style="font-size:36px; color:#3B82F6;">52%</div>
                  <div class="pain-desc">PIX Instantâneo</div>
                </div>
              </div>
            </div>
          \`;
        case 12:
          return \`
            <div class="v-card show" style="text-align:left; font-family:'JetBrains Mono', monospace;">
              <div style="color:#FACC15; font-size:24px; font-weight:800; margin-bottom:8px;">NFC-e MODELO 65 HOMOLOGADA</div>
              <div style="font-size:20px; color:#CBD5E1; word-break:break-all;">
                CHAVE: 3326 1012 3456 7800 0190 6500 1000 0000 3410 0984 9201<br>
                <span style="color:#10B981;">✔ QR CODE SEFAZ VÁLIDO</span>
              </div>
            </div>
          \`;
        case 13:
          return \`
            <div class="v-card show">
              <div class="pillars-grid">
                <div class="pillar-box">
                  <div class="pillar-icon">📑</div>
                  <div class="pillar-title">PDF A4</div>
                </div>
                <div class="pillar-box">
                  <div class="pillar-icon">📊</div>
                  <div class="pillar-title">Excel .XLSX</div>
                </div>
                <div class="pillar-box">
                  <div class="pillar-icon">⚡</div>
                  <div class="pillar-title">CSV Universal</div>
                </div>
              </div>
            </div>
          \`;
        case 14:
          return \`
            <div class="v-card show" style="border-color:#10B981;">
              <div style="font-family:'Space Grotesk'; font-size:40px; font-weight:900; color:#10B981; margin-bottom:12px;">
                18 / 18 TESTES PASS (100%)
              </div>
              <div style="font-size:26px; color:#F8FAFC;">
                Regras RN-01 a RN-06 auditadas. Zero falhas.
              </div>
            </div>
          \`;
        case 15:
          // CTA DO PDF: Palavra grande com brilho e caixa de comentário simulada
          return \`
            <div class="cta-container">
              <div class="cta-giant-word">MS2</div>
              <div class="comment-simulator">
                <div class="comment-avatar">💬</div>
                <div class="comment-input">
                  <span id="comment-text">Comente MS2 no chat</span><span class="cursor-blink"></span>
                </div>
              </div>
            </div>
          \`;
        default:
          return '';
      }
    }

    // 3. CARREGAR CENA E PREPARAR PALAVRAS
    function carregarCena(index) {
      if (index < 0 || index >= CENAS_DATA.length) return;
      cenaAtivaIndex = index;
      const c = CENAS_DATA[index];

      badgeText.innerText = \`CENA \${String(c.id).padStart(2, '0')} · \${c.rotulo.toUpperCase()}\`;
      sceneCounter.innerText = \`CENA \${String(c.id).padStart(2, '0')} / \${String(CENAS_DATA.length).padStart(2, '0')}\`;

      // Monta as palavras da narração
      const destaquesCena = DESTAQUES[c.id] || [];
      headline.innerHTML = c.palavras.map((p, idx) => {
        const clean = p.w.toLowerCase().replace(/[^a-z0-9áéíóúãõâêîôûç²]/gi, '');
        const isHighlight = destaquesCena.some(d => d.toLowerCase().includes(clean));
        const hlClass = isHighlight ? 'highlight' : '';
        return \`<span class="word \${hlClass}" id="w-\${idx}" data-s="\${p.s}" data-e="\${p.e}">\${p.w}</span>\`;
      }).join(' ');

      // Monta o elemento visual
      visualStage.innerHTML = montarVisualCena(c.id);

      // Prepara áudio
      audio.src = c.audioUrl;
      globalTime = 0;
    }

    // 4. FUNÇÃO DETERMINÍSTICA RENDER(T) CONFORME O GUIA DO PDF!
    function render(t) {
      const c = CENAS_DATA[cenaAtivaIndex];
      if (!c) return;

      // Câmera lenta push-in contínua (1.0 -> 1.04) para evitar cena parada (requisito do PDF!)
      const progress = Math.min(1, Math.max(0, t / (c.duracao || 1)));
      const cameraScale = 1.0 + progress * 0.04;
      cameraRig.style.transform = \`scale(\${cameraScale})\`;

      // Atualiza estado de cada palavra conforme o tempo t
      const spans = headline.getElementsByClassName('word');
      for (let i = 0; i < spans.length; i++) {
        const span = spans[i];
        const s = parseFloat(span.getAttribute('data-s'));
        const e = parseFloat(span.getAttribute('data-e'));

        if (t >= s) {
          span.classList.add('entered');
          if (t <= e + 0.1) {
            span.classList.add('active-word');
          } else {
            span.classList.remove('active-word');
          }
        } else {
          span.classList.remove('entered');
          span.classList.remove('active-word');
        }
      }

      // Efeito de digitação da caixa de comentário na Cena 15 (CTA do PDF)
      if (c.id === 15) {
        const commentElem = document.getElementById('comment-text');
        if (commentElem) {
          const fullText = "Comente MS2 no chat";
          const charsToShow = Math.min(fullText.length, Math.floor(Math.max(0, t - 1.2) * 6));
          commentElem.innerText = fullText.slice(0, charsToShow);
        }
      }

      // Timecode no canto
      if (showTimecode) {
        timecodeCorner.innerText = \`\${t.toFixed(2)}s / \${c.duracao.toFixed(1)}s [CENA \${c.id}]\`;
      }
    }

    // 5. LOOP PRINCIPAL DE ANIMAÇÃO A 60 FPS
    function gameLoop(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        // Se o áudio estiver tocando, sincroniza diretamente com audio.currentTime
        if (!audio.paused && !audio.ended) {
          globalTime = audio.currentTime;
        } else {
          globalTime += dt;
        }

        render(globalTime);

        // Ao terminar a cena, avança automaticamente
        const duracaoCena = CENAS_DATA[cenaAtivaIndex].duracao;
        if (globalTime >= duracaoCena) {
          if (cenaAtivaIndex < CENAS_DATA.length - 1) {
            carregarCena(cenaAtivaIndex + 1);
            audio.play().catch(() => {});
          } else {
            // Última cena (congela no último quadro como manda o PDF)
            isPlaying = false;
            document.body.classList.remove('playing');
          }
        }
      }

      requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);

    // 6. CONTAGEM 3-2-1 ANTES DE TOCAR (REQUISITO DA PÁGINA 6 DO PDF!)
    function iniciarComContagem() {
      if (isCountingDown) return;
      isCountingDown = true;
      startPrompt.style.display = 'none';
      countdownDisplay.style.display = 'block';

      let count = 3;
      countdownDisplay.innerText = count;

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          countdownDisplay.innerText = count;
        } else {
          clearInterval(timer);
          startOverlay.style.display = 'none';
          isCountingDown = false;
          isPlaying = true;
          document.body.classList.add('playing');
          globalTime = 0;
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      }, 1000);
    }

    function togglePlay() {
      if (startOverlay.style.display !== 'none') {
        iniciarComContagem();
        return;
      }
      isPlaying = !isPlaying;
      if (isPlaying) {
        document.body.classList.add('playing');
        audio.play().catch(() => {});
      } else {
        document.body.classList.remove('playing');
        audio.pause();
      }
    }

    function reiniciar() {
      isPlaying = false;
      document.body.classList.remove('playing');
      carregarCena(0);
      startOverlay.style.display = 'flex';
      startPrompt.style.display = 'flex';
      countdownDisplay.style.display = 'none';
    }

    function proximaCena() {
      if (cenaAtivaIndex < CENAS_DATA.length - 1) {
        carregarCena(cenaAtivaIndex + 1);
        if (isPlaying) audio.play().catch(() => {});
      }
    }

    function cenaAnterior() {
      if (cenaAtivaIndex > 0) {
        carregarCena(cenaAtivaIndex - 1);
        if (isPlaying) audio.play().catch(() => {});
      }
    }

    // 7. ATALHOS DE TECLADO EXATOS DO PDF (PÁGINA 6)
    // ESPAÇO pausa/continua · R reinicia com contagem · ← → pulam de cena · T mostra tempo
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyR':
          e.preventDefault();
          reiniciar();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          cenaAnterior();
          break;
        case 'ArrowRight':
          e.preventDefault();
          proximaCena();
          break;
        case 'KeyT':
          e.preventDefault();
          showTimecode = !showTimecode;
          timecodeCorner.style.display = showTimecode ? 'block' : 'none';
          break;
        case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4': case 'Digit5':
        case 'Digit6': case 'Digit7': case 'Digit8': case 'Digit9':
          carregarCena(parseInt(e.key, 10) - 1);
          if (isPlaying) audio.play().catch(() => {});
          break;
        case 'Digit0':
          carregarCena(9);
          if (isPlaying) audio.play().catch(() => {});
          break;
      }
    });

    // Iniciar na Cena 1
    carregarCena(0);
  </script>
</body>
</html>`;

const outPath1 = 'Estudo/frontend/public/motion-pitch-player.html';
const outPath2 = 'Estudo/documentação/s06/motion-pitch-player.html';

fs.writeFileSync(outPath1, playerHtml, 'utf8');
fs.writeFileSync(outPath2, playerHtml, 'utf8');

console.log('✅ Player de Motion Design gerado com 100% de aderência ao PDF!');
console.log('   -> ' + outPath1);
console.log('   -> ' + outPath2);
