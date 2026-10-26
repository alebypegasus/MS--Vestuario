import fs from 'fs';
import path from 'path';

const manifest = JSON.parse(fs.readFileSync('Estudo/frontend/public/pitch/audio/manifest.json', 'utf8'));
const roteiro = JSON.parse(fs.readFileSync('Estudo/frontend/public/pitch/roteiro.json', 'utf8'));

// Cronograma exato
const cronograma = manifest.cenas.map((c) => {
  const r = roteiro.cenas.find(x => x.id === c.id) || { rotulo: `Cena ${c.id}` };
  return {
    id: c.id,
    arquivo: c.arquivo,
    rotulo: r.rotulo,
    duracaoAudio: c.duracao,
    palavras: c.palavras,
    textoCompleto: c.palavras.map(p => p.w).join(' ')
  };
});

// Badges temáticos
const BADGES = {
  1: { tag: 'MS² VESTUÁRIO', title: 'Abertura Cinemática', color: 'gold' },
  2: { tag: 'DIAGNÓSTICO', title: 'O Gargalo do Varejo', color: 'rose' },
  3: { tag: 'SOLUÇÃO', title: 'Os Três Pilares Integrados', color: 'gold' },
  4: { tag: 'ENGENHARIA', title: 'Arquitetura Full-Stack ACID', color: 'indigo' },
  5: { tag: 'PERFORMANCE', title: 'Frente de Caixa Sub-300ms', color: 'emerald' },
  6: { tag: 'REGRA RN-01', title: 'Validação Oficial de CPF (Módulo 11)', color: 'gold' },
  7: { tag: 'ERGONOMIA', title: 'Gestão Ágil de Clientes no PDV', color: 'emerald' },
  8: { tag: 'SEGURANÇA', title: 'Matriz Hierárquica RBAC', color: 'indigo' },
  9: { tag: 'REGRA RN-02', title: 'Alçada Gerencial de Desconto (> 10%)', color: 'rose' },
  10: { tag: 'AUDITORIA', title: 'Snapshot Imutável de Preço (RN-04)', color: 'gold' },
  11: { tag: 'BUSINESS INTELLIGENCE', title: 'Dashboard Executivo em Tempo Real', color: 'emerald' },
  12: { tag: 'CONFORMIDADE', title: 'Emissão Fiscal NFC-e Modelo 65', color: 'gold' },
  13: { tag: 'CONTABILIDADE', title: 'Exportação Executiva: PDF, Excel e CSV', color: 'emerald' },
  14: { tag: 'QUALIDADE', title: '18 Testes Automatizados E2E Homologados', color: 'gold' },
  15: { tag: 'GABARITO SENAI', title: 'Encerramento Oficial', color: 'gold' }
};

// Palavras-chave de destaque
const ACCENTS = {
  1: { gold: ['emoção.', 'vitrine,'], emerald: ['operação'], rose: ['não', 'pode', 'parar.'] },
  2: { rose: ['Filas', 'travam', 'sem', 'controle.', 'rejeitadas.', 'venda', 'perdida.'], gold: ['horário', 'pico.'] },
  3: { gold: ['MS²', 'Vestuário:', 'varejo', 'moda.'], emerald: ['PDV', 'gestão', 'comercial'] },
  4: { gold: ['React', 'TypeScript', 'Node', 'Express,'], emerald: ['Zod,', 'JWT', 'transações', 'ACID.'] },
  5: { emerald: ['velocidade', 'absoluta.', 'trezentos', 'milissegundos.'], gold: ['tecla', 'atalho.'] },
  6: { gold: ['Receita', 'Federal.', 'Módulo', 'onze'], emerald: ['dois', 'dígitos', 'verificadores'], rose: ['bloqueia', 'inválido'] },
  7: { emerald: ['decide', 'segundos:', 'fidelizado,'], gold: ['consumidor', 'final.'] },
  8: { gold: ['caixa', 'gerente', 'administrador'], emerald: ['middleware', 'acesso.'] },
  9: { rose: ['Desconto', 'acima', 'dez', 'cento?', 'bloqueia'], emerald: ['senha', 'gerente.', 'auditoria.'] },
  10: { gold: ['histórico', 'imutável.', 'congelado'], emerald: ['autorização', 'gerencial.'] },
  11: { emerald: ['painel', 'tempo', 'real:', 'faturamento,'], gold: ['ticket', 'médio,', 'ranking'] },
  12: { gold: ['NFC-e', 'sessenta', 'cinco', 'quarenta', 'quatro', 'dígitos,'], emerald: ['QR', 'Code', 'Lei', 'Transparência.'] },
  13: { emerald: ['um', 'clique:', 'PDF', 'planilha', 'Excel', 'CSV'], gold: ['relatórios', 'executivos'] },
  14: { emerald: ['Qualidade', 'não', 'promessa,', 'evidência.', 'Dezoito', 'testes'], gold: ['homologadas.'] },
  15: { gold: ['MS²', 'Vestuário.', 'Moda,', 'estilo', 'você,'], emerald: ['Firjan', 'SENAI.'] }
};

function renderWords(cena) {
  const acc = ACCENTS[cena.id] || {};
  return cena.palavras.map((p, idx) => {
    let cls = ['word'];
    const clean = p.w.toLowerCase().replace(/[^a-z0-9áéíóúãõâêîôûç²]/gi, '');

    if (acc.gold?.some(d => d.toLowerCase().includes(clean))) cls.push('accent-gold');
    else if (acc.emerald?.some(d => d.toLowerCase().includes(clean))) cls.push('accent-emerald');
    else if (acc.rose?.some(d => d.toLowerCase().includes(clean))) cls.push('accent-rose');

    return `<span class="${cls.join(' ')}" id="w-${cena.id}-${idx}" data-s="${p.s}" data-e="${p.e}">${p.w}</span>`;
  }).join(' ');
}

function renderVisualCard(id) {
  switch (id) {
    case 1:
      return `
        <div class="visual-container">
          <div class="hero-crest">
            <img src="/logo.png" alt="MS² Vestuário" class="crest-img">
            <div class="crest-glow"></div>
          </div>
          <div class="tag-row">
            <span class="pill-badge pill-gold">SENAI Moda & Varejo</span>
            <span class="pill-badge pill-emerald">Sprint 6 Homologada</span>
            <span class="pill-badge pill-indigo">Frente de Caixa Ágil</span>
          </div>
        </div>
      `;
    case 2:
      return `
        <div class="visual-container">
          <div class="grid-3">
            <div class="card-item card-rose">
              <div class="card-top"><span class="badge-tag tag-rose">CRÍTICO</span><span class="stat-num text-rose">> 18 min</span></div>
              <div class="card-headline">Filas Lentas no Caixa</div>
              <div class="card-sub">Lentidão nos horários de pico gera atrito, descontentamento e 28% de desistência da compra.</div>
            </div>
            <div class="card-item card-amber">
              <div class="card-top"><span class="badge-tag tag-amber">VULNERABILIDADE</span><span class="stat-num text-amber">-35%</span></div>
              <div class="card-headline">Descontos sem Controle</div>
              <div class="card-sub">Concessão arbitrária de margem no PDV sem alçada gerencial nem registro para auditoria.</div>
            </div>
            <div class="card-item card-rose">
              <div class="card-top"><span class="badge-tag tag-rose">FISCAL</span><span class="stat-num text-rose">Rejeição</span></div>
              <div class="card-headline">Erros e Furo de Estoque</div>
              <div class="card-sub">CPFs inválidos, duplicidades no banco de dados e cupom rejeitado na SEFAZ.</div>
            </div>
          </div>
        </div>
      `;
    case 3:
      return `
        <div class="visual-container">
          <div class="grid-3">
            <div class="card-item card-gold">
              <div class="card-top"><span class="badge-tag tag-gold">PILAR 1</span><span class="stat-num text-gold">&lt; 300ms</span></div>
              <div class="card-headline">PDV Instantâneo</div>
              <div class="card-sub">Bipagem imediata com catálogo fotográfico, carrinho fluido e atalhos operacionais inteligentes.</div>
            </div>
            <div class="card-item card-emerald">
              <div class="card-top"><span class="badge-tag tag-emerald">PILAR 2</span><span class="stat-num text-emerald">Auditado</span></div>
              <div class="card-headline">Governança & Alçadas</div>
              <div class="card-sub">Bloqueio automático de desconto > 10% exigindo credencial do gerente e histórico congelado.</div>
            </div>
            <div class="card-item card-indigo">
              <div class="card-top"><span class="badge-tag tag-indigo">PILAR 3</span><span class="stat-num text-indigo">100% Legal</span></div>
              <div class="card-headline">Conformidade Fiscal</div>
              <div class="card-sub">NFC-e modelo 65, chave de 44 dígitos, QR Code SEFAZ e transparência tributária da Lei 12.741.</div>
            </div>
          </div>
        </div>
      `;
    case 4:
      return `
        <div class="visual-container">
          <div class="arch-flow">
            <div class="arch-step">
              <span class="arch-lbl">INTERFACE SPA</span>
              <div class="arch-val text-indigo">React 18 • TypeScript</div>
              <span class="arch-sub">Tailwind CSS • Framer Motion</span>
            </div>
            <div class="arch-arrow">➔ <span>REST / JWT</span> ➔</div>
            <div class="arch-step">
              <span class="arch-lbl">API RESTFUL</span>
              <div class="arch-val text-gold">Node.js • Express</div>
              <span class="arch-sub">Validação Zod • RBAC Middleware</span>
            </div>
            <div class="arch-arrow">➔ <span>ACID POOL</span> ➔</div>
            <div class="arch-step">
              <span class="arch-lbl">BANCO RELACIONAL</span>
              <div class="arch-val text-emerald">MySQL 8.0 & SQLite</div>
              <span class="arch-sub">Transações Atômicas • Zero Perda</span>
            </div>
          </div>
        </div>
      `;
    case 5:
      return `
        <div class="visual-container">
          <div class="pos-terminal-box">
            <div class="pos-topbar">
              <span class="pos-status"><span class="pos-live-dot"></span> CAIXA LIVRE • OPERADOR: ANA SILVA</span>
              <span class="pos-latency">LATÊNCIA: 180ms</span>
            </div>
            <div class="pos-screen-grid">
              <div class="pos-scanner-col">
                <div class="barcode-reader">
                  <div class="barcode-bars">|||| | ||||| ||| |||| | ||||</div>
                  <div class="scanner-laser"></div>
                </div>
                <div class="pos-action-msg">BIPADO COM SUCESSO: #103</div>
              </div>
              <div class="pos-receipt-col">
                <div class="pos-line-item">
                  <span>#103 Calça Jeans Slim Stretch Raw Denim (1x)</span>
                  <span class="text-gold">R$ 159,90</span>
                </div>
                <div class="pos-total-row">
                  <span>TOTAL A PAGAR:</span>
                  <span class="total-val text-emerald">R$ 159,90</span>
                </div>
              </div>
            </div>
            <div class="pos-hotkeys">
              <kbd>F2</kbd> Buscar • <kbd>F4</kbd> Qtd • <kbd>F8</kbd> Desconto • <kbd>F12</kbd> Finalizar Venda
            </div>
          </div>
        </div>
      `;
    case 6:
      return `
        <div class="visual-container">
          <div class="code-box">
            <div class="code-head">
              <span class="code-dot red"></span><span class="code-dot amber"></span><span class="code-dot green"></span>
              <span class="code-filename">src/utils/cpf-validator.ts (Algoritmo Módulo 11)</span>
              <span class="code-badge">RN-01 HOMOLOGADA</span>
            </div>
            <pre class="code-pre"><code><span class="k">export function</span> <span class="f">validarCPF</span>(cpf: <span class="t">string</span>): <span class="t">boolean</span> {
  <span class="k">const</span> limpo = cpf.replace(<span class="s">/\\D/g</span>, <span class="s">''</span>);
  <span class="k">if</span> (limpo.length !== <span class="n">11</span> || <span class="s">/^(\\d)\\1{10}$/</span>.test(limpo)) <span class="k">return false</span>;

  <span class="c">// Cálculo do 1º Dígito (Pesos 10 a 2)</span>
  <span class="k">let</span> d1 = <span class="n">11</span> - (somarPesos(limpo, <span class="n">9</span>, <span class="n">10</span>) % <span class="n">11</span>);
  <span class="k">if</span> (d1 >= <span class="n">10</span>) d1 = <span class="n">0</span>;
  <span class="k">if</span> (d1 !== Number(limpo[<span class="n">9</span>])) <span class="k">return false</span>; <span class="c">// Bloqueio imediato de CPF falso</span>

  <span class="c">// Cálculo do 2º Dígito (Pesos 11 a 2)</span>
  <span class="k">let</span> d2 = <span class="n">11</span> - (somarPesos(limpo, <span class="n">10</span>, <span class="n">11</span>) % <span class="n">11</span>);
  <span class="k">if</span> (d2 >= <span class="n">10</span>) d2 = <span class="n">0</span>;
  <span class="k">return</span> d2 === Number(limpo[<span class="n">10</span>]); <span class="c">// CPF 100% Válido na Receita</span>
}</code></pre>
          </div>
        </div>
      `;
    case 7:
      return `
        <div class="visual-container">
          <div class="grid-3">
            <div class="card-item card-emerald">
              <div class="card-top"><span class="badge-tag tag-emerald">EXPRESS</span><span class="stat-num text-emerald">F10</span></div>
              <div class="card-headline">Consumidor Final</div>
              <div class="card-sub">Venda anônima rápida em 1 clique para compras corriqueiras sem retenção.</div>
            </div>
            <div class="card-item card-gold">
              <div class="card-top"><span class="badge-tag tag-gold">FIDELIDADE</span><span class="stat-num text-gold">Cashback</span></div>
              <div class="card-headline">Cliente Fidelizado</div>
              <div class="card-sub">Busca por CPF com histórico de tamanhos, cores favoritas e pontuação.</div>
            </div>
            <div class="card-item card-indigo">
              <div class="card-top"><span class="badge-tag tag-indigo">AGILIDADE</span><span class="stat-num text-indigo">Sem Sair</span></div>
              <div class="card-headline">Cadastro Expresso</div>
              <div class="card-sub">Modal abre sobre a tela sem resetar nem perder os itens já bipados no carrinho.</div>
            </div>
          </div>
        </div>
      `;
    case 8:
      return `
        <div class="visual-container">
          <div class="grid-3">
            <div class="card-item card-emerald">
              <div class="card-top"><span class="badge-tag tag-emerald">OPERACIONAL</span><span class="stat-num text-emerald">CAIXA</span></div>
              <div class="card-headline">Operador de Caixa</div>
              <div class="card-sub">Acesso restrito ao PDV, bipagem de peças, pagamentos (PIX/Cartão/Dinheiro) e emissão de cupom.</div>
            </div>
            <div class="card-item card-amber">
              <div class="card-top"><span class="badge-tag tag-amber">TÁTICO</span><span class="stat-num text-amber">GERENTE</span></div>
              <div class="card-headline">Gerente de Loja</div>
              <div class="card-sub">Autorização de alçadas de desconto acima de 10%, cancelamento auditado e abertura de caixa.</div>
            </div>
            <div class="card-item card-indigo">
              <div class="card-top"><span class="badge-tag tag-indigo">ESTRATÉGICO</span><span class="stat-num text-indigo">ADMIN</span></div>
              <div class="card-headline">Administrador Geral</div>
              <div class="card-sub">Gestão da equipe, parametrização tributária da empresa, relatórios gerenciais e auditoria fiscal.</div>
            </div>
          </div>
        </div>
      `;
    case 9:
      return `
        <div class="visual-container">
          <div class="modal-preview">
            <div class="modal-preview-head">
              <span class="text-rose font-bold">ALÇADA GERENCIAL REQUERIDA (RN-02)</span>
              <span class="badge-tag tag-rose">BLOQUEIO 403</span>
            </div>
            <div class="modal-preview-body">
              <div class="alert-banner">Desconto de <strong>25%</strong> excede o limite do Caixa (10%). Forneça credencial de Gerente.</div>
              <div class="auth-box">
                <span class="auth-user">Gerente: Carlos Mendes (ID #1)</span>
                <span class="auth-dots">● ● ● ● ● ● ● ●</span>
              </div>
              <div class="success-banner">✔ APROVAÇÃO GERENCIAL GRAVADA PARA AUDITORIA (ID: #AP-8492)</div>
            </div>
          </div>
        </div>
      `;
    case 10:
      return `
        <div class="visual-container">
          <div class="grid-2">
            <div class="card-item card-gold">
              <div class="card-top"><span class="badge-tag tag-gold">RN-04</span><span class="stat-num text-gold">Imutável</span></div>
              <div class="card-headline">Snapshot no Item da Venda</div>
              <div class="card-sub">O preço unitário é congelado na venda (R$ 49,90). Futuras alterações no catálogo não distorcem balanços passados.</div>
            </div>
            <div class="card-item card-emerald">
              <div class="card-top"><span class="badge-tag tag-emerald">RN-03</span><span class="stat-num text-emerald">Auditado</span></div>
              <div class="card-headline">Estorno Formal de Venda</div>
              <div class="card-sub">Cancelamentos exigem motivo formal e autorização gerencial, restaurando automaticamente o estoque.</div>
            </div>
          </div>
        </div>
      `;
    case 11:
      return `
        <div class="visual-container">
          <div class="grid-4">
            <div class="card-item card-emerald">
              <div class="stat-lbl">FATURAMENTO DO DIA</div>
              <div class="stat-val text-emerald">R$ 14.890,00</div>
              <div class="stat-badge text-emerald">+24,8% vs média</div>
            </div>
            <div class="card-item card-gold">
              <div class="stat-lbl">TICKET MÉDIO</div>
              <div class="stat-val text-gold">R$ 148,90</div>
              <div class="stat-badge text-gold">100 vendas concluídas</div>
            </div>
            <div class="card-item card-indigo">
              <div class="stat-lbl">FORMAS DE PAGAMENTO</div>
              <div class="mini-bar"><span style="width:48%; background:#10b981;"></span><span style="width:38%; background:#6366f1;"></span><span style="width:14%; background:#facc15;"></span></div>
              <div class="mini-legend">PIX 48% • Cartão 38% • Dinheiro 14%</div>
            </div>
            <div class="card-item card-gold">
              <div class="stat-lbl">TOP PRODUTO</div>
              <div class="stat-val text-gold">Calça Jeans Slim</div>
              <div class="stat-badge text-gold">32 unidades vendidas</div>
            </div>
          </div>
        </div>
      `;
    case 12:
      return `
        <div class="visual-container">
          <div class="receipt-card">
            <div class="rec-title">MS² VESTUÁRIO COMÉRCIO LTDA</div>
            <div class="rec-sub">DANFE NFC-e • DOCUMENTO AUXILIAR DA NOTA FISCAL DE CONSUMIDOR ELETRÔNICA</div>
            <div class="rec-key">CHAVE SEFAZ: 3326 1012 3456 7800 0190 6500 1000 0000 3410 0984 9201</div>
            <div class="rec-footer">
              <div class="rec-barcode">||| |||| || | |||| || |||| |||</div>
              <div class="rec-qr">QR CODE SEFAZ VÁLIDO</div>
              <div class="rec-tax">Tributos Totais Incidentes (Lei 12.741/2012): R$ 24,80</div>
            </div>
          </div>
        </div>
      `;
    case 13:
      return `
        <div class="visual-container">
          <div class="grid-3">
            <div class="card-item card-rose">
              <div class="card-top"><span class="badge-tag tag-rose">PDF A4</span><span class="stat-num text-rose">Executivo</span></div>
              <div class="card-headline">Relatório em PDF</div>
              <div class="card-sub">Layout institucional completo com cabeçalho da marca, gráficos e sumário executivo.</div>
            </div>
            <div class="card-item card-emerald">
              <div class="card-top"><span class="badge-tag tag-emerald">EXCEL</span><span class="stat-num text-emerald">.XLSX</span></div>
              <div class="card-headline">Planilha Formatada</div>
              <div class="card-sub">Colunas dinâmicas, fórmulas de margem bruta e subtotais prontos para a contabilidade.</div>
            </div>
            <div class="card-item card-indigo">
              <div class="card-top"><span class="badge-tag tag-indigo">CSV</span><span class="stat-num text-indigo">Universal</span></div>
              <div class="card-headline">Exportação CSV UTF-8</div>
              <div class="card-sub">Compatibilidade direta para ferramentas de BI (Power BI, Tableau) e ERPs externos.</div>
            </div>
          </div>
        </div>
      `;
    case 14:
      return `
        <div class="visual-container">
          <div class="qa-console">
            <div class="qa-head">
              <span class="text-emerald font-bold">SUÍTE AUTOMATIZADA DE TESTES END-TO-END</span>
              <span class="badge-tag tag-emerald">18 / 18 PASS</span>
            </div>
            <div class="qa-grid">
              <div>✔ RN-01 Módulo 11 CPF Válido: PASS</div>
              <div>✔ RN-01 Rejeição de CPF Duplicado: PASS</div>
              <div>✔ RN-02 Permissão de Desconto Caixa: PASS</div>
              <div>✔ RN-02 Bloqueio de Desconto > 10%: PASS</div>
              <div>✔ RN-02 Alçada Gerencial Concedida: PASS</div>
              <div>✔ RN-03 Estorno Auditado c/ Motivo: PASS</div>
              <div>✔ RN-04 Snapshot Preço no Item: PASS</div>
              <div>✔ RBAC Separação Clientes/Usuários: PASS</div>
            </div>
            <div class="qa-foot">STATUS FINAL: 100% HOMOLOGADO • ZERO DEFEITOS • PRONTO PARA PRODUÇÃO</div>
          </div>
        </div>
      `;
    case 15:
      return `
        <div class="visual-container text-center">
          <div class="hero-crest">
            <img src="/logo.png" alt="MS² Vestuário" class="crest-img">
            <div class="crest-glow"></div>
          </div>
          <div class="motto-box">
            <div class="motto-title">Moda, estilo e você.</div>
            <div class="motto-sub">Projeto Integrador • Curso Técnico em Desenvolvimento de Sistemas • Firjan SENAI</div>
          </div>
          <div class="action-row">
            <button class="btn-action btn-gold" onclick="reiniciar()">Assistir Novamente [R]</button>
            <a href="/pdv" class="btn-action btn-outline">Acessar Frente de Caixa [Alt+1]</a>
          </div>
        </div>
      `;
    default:
      return '';
  }
}

const scenesHtml = cronograma.map(c => {
  const b = BADGES[c.id];
  const wordsHtml = renderWords(c);
  const cardHtml = renderVisualCard(c.id);

  return `
    <section class="scene-panel" id="scene-${c.id}">
      <div class="badge-header">
        <span class="badge-chip chip-${b.color}">${b.tag}</span>
        <span class="badge-sep">•</span>
        <span class="badge-sub">${b.title}</span>
      </div>

      <h1 class="scene-headline">
        ${wordsHtml}
      </h1>

      ${cardHtml}
    </section>
  `;
}).join('\n');

const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MS² Vestuário — Apresentação em Motion Design (Sprint 6)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #060914;
      --bg-card: rgba(15, 23, 42, 0.82);
      --border-card: rgba(255, 255, 255, 0.14);
      --gold: #facc15;
      --gold-light: #fef08a;
      --emerald: #10b981;
      --emerald-light: #6ee7b7;
      --indigo: #6366f1;
      --indigo-light: #a5b4fc;
      --rose: #f43f5e;
      --rose-light: #fda4af;
      --amber: #f59e0b;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
    }

    body {
      background: #020409;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Fundo Luminoso */
    .bg-lights {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 1;
    }

    .light-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(140px);
      opacity: 0.35;
      transition: transform 0.3s ease;
    }

    .orb-gold { width: 700px; height: 700px; background: rgba(250, 204, 21, 0.28); top: -150px; left: 15%; }
    .orb-indigo { width: 650px; height: 650px; background: rgba(99, 102, 241, 0.28); bottom: -150px; right: 10%; }
    .orb-emerald { width: 550px; height: 550px; background: rgba(16, 185, 129, 0.2); top: 40%; left: 45%; }

    .grid-dots {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
      background-size: 32px 32px;
      opacity: 0.6;
    }

    /* Palco Central 100% Responsivo */
    #stage {
      position: relative;
      width: 100vw;
      height: 100vh;
      max-width: 1580px;
      max-height: 940px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 22px 36px 20px 36px;
      z-index: 10;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #stage.mode-vertical {
      max-width: 520px;
      max-height: 920px;
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(6, 9, 20, 0.88);
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.95);
      padding: 28px 24px;
    }

    /* Topo do Player */
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 12px;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 800;
      color: var(--gold-light);
      background: rgba(250, 204, 21, 0.1);
      border: 1px solid rgba(250, 204, 21, 0.3);
      padding: 6px 14px;
      border-radius: 9999px;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(0.85); }
    }

    .progress-track {
      flex: 1;
      max-width: 560px;
      height: 6px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      cursor: pointer;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #facc15, #10b981);
      box-shadow: 0 0 12px rgba(250, 204, 21, 0.8);
      transition: width 0.1s linear;
    }

    .timecode-box {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.06);
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Área de Cenas */
    .scene-viewport {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .scene-panel {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s ease;
      transform: translateY(8px);
    }

    .scene-panel.active {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    /* Badges de Cena */
    .badge-header {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }

    .badge-chip {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 9999px;
    }

    .chip-gold { background: rgba(250, 204, 21, 0.16); color: #fef08a; border: 1px solid rgba(250, 204, 21, 0.4); }
    .chip-emerald { background: rgba(16, 185, 129, 0.16); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }
    .chip-indigo { background: rgba(99, 102, 241, 0.16); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); }
    .chip-rose { background: rgba(244, 63, 94, 0.16); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.4); }

    .badge-sep { color: rgba(255, 255, 255, 0.3); }
    .badge-sub { font-size: 13px; font-weight: 700; color: #94a3b8; }

    /* Headline Cinética com Karaokê */
    .scene-headline {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: clamp(22px, 3.2vw, 42px);
      font-weight: 800;
      line-height: 1.28;
      text-align: center;
      max-width: 1320px;
      margin: 0 auto 24px auto;
      letter-spacing: -0.02em;
    }

    .word {
      display: inline-block;
      margin: 0 4px;
      color: rgba(255, 255, 255, 0.42);
      transition: color 0.16s ease, transform 0.16s ease, text-shadow 0.16s ease;
    }

    .word.spoken {
      color: #f1f5f9;
    }

    .word.active {
      color: #ffffff;
      transform: scale(1.12) translateY(-2px);
      text-shadow: 0 0 24px rgba(255, 255, 255, 0.9);
      font-weight: 900;
    }

    .word.active.accent-gold { color: #fef08a; text-shadow: 0 0 30px rgba(254, 240, 138, 0.95); }
    .word.active.accent-emerald { color: #6ee7b7; text-shadow: 0 0 30px rgba(110, 231, 183, 0.95); }
    .word.active.accent-rose { color: #fda4af; text-shadow: 0 0 30px rgba(253, 164, 175, 0.95); }

    .word.spoken.accent-gold { color: #fde047; }
    .word.spoken.accent-emerald { color: #34d399; }
    .word.spoken.accent-rose { color: #fb7185; }

    /* Componentes Visuais das Cenas */
    .visual-container {
      width: 100%;
      max-width: 1300px;
      margin: 0 auto;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 22px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .card-item {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 18px;
      padding: 22px;
      backdrop-filter: blur(20px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      text-align: left;
    }

    .card-gold { border-color: rgba(250, 204, 21, 0.35); }
    .card-emerald { border-color: rgba(16, 185, 129, 0.35); }
    .card-indigo { border-color: rgba(99, 102, 241, 0.35); }
    .card-rose { border-color: rgba(244, 63, 94, 0.35); background: rgba(30, 12, 18, 0.75); }
    .card-amber { border-color: rgba(245, 158, 11, 0.35); background: rgba(30, 20, 10, 0.75); }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .badge-tag {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .tag-gold { background: rgba(250, 204, 21, 0.18); color: #fef08a; }
    .tag-emerald { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; }
    .tag-indigo { background: rgba(99, 102, 241, 0.18); color: #a5b4fc; }
    .tag-rose { background: rgba(244, 63, 94, 0.18); color: #fda4af; }
    .tag-amber { background: rgba(245, 158, 11, 0.18); color: #fde68a; }

    .stat-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      font-weight: 800;
    }

    .card-headline {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .card-sub {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }

    .text-gold { color: var(--gold-light); }
    .text-emerald { color: #34d399; }
    .text-indigo { color: #818cf8; }
    .text-rose { color: #fb7185; }
    .text-amber { color: #fde68a; }

    /* Logo Hero */
    .hero-crest {
      position: relative;
      display: inline-block;
      margin-bottom: 12px;
    }

    .crest-img {
      max-height: 120px;
      filter: drop-shadow(0 10px 30px rgba(250, 204, 21, 0.45));
    }

    .tag-row {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 14px;
    }

    .pill-badge {
      font-size: 12px;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 9999px;
      backdrop-filter: blur(12px);
    }

    .pill-gold { background: rgba(250, 204, 21, 0.14); border: 1px solid rgba(250, 204, 21, 0.4); color: #fef08a; }
    .pill-emerald { background: rgba(16, 185, 129, 0.14); border: 1px solid rgba(16, 185, 129, 0.4); color: #6ee7b7; }
    .pill-indigo { background: rgba(99, 102, 241, 0.14); border: 1px solid rgba(99, 102, 241, 0.4); color: #a5b4fc; }

    /* Arquitetura */
    .arch-flow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 20px;
      padding: 24px;
    }

    .arch-step { text-align: center; }
    .arch-lbl { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.1em; }
    .arch-val { font-size: 17px; font-weight: 800; margin: 4px 0; }
    .arch-sub { font-size: 12px; color: #cbd5e1; }
    .arch-arrow { font-size: 12px; font-weight: 800; color: #94a3b8; font-family: monospace; }
    .arch-arrow span { color: var(--gold-light); display: block; font-size: 10px; margin-top: 2px; }

    /* Simulação PDV */
    .pos-terminal-box {
      background: rgba(10, 15, 28, 0.95);
      border: 1px solid rgba(250, 204, 21, 0.4);
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.8);
    }

    .pos-topbar {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
      font-size: 12px;
      font-weight: 800;
    }

    .pos-status { display: flex; align-items: center; gap: 6px; color: #34d399; }
    .pos-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; }
    .pos-latency { color: var(--gold-light); font-family: monospace; }

    .pos-screen-grid {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 20px;
      padding: 18px 0;
    }

    .barcode-reader {
      background: #000;
      border: 1px dashed rgba(244, 63, 94, 0.5);
      border-radius: 10px;
      padding: 16px;
      position: relative;
      overflow: hidden;
      text-align: center;
    }

    .barcode-bars { font-family: monospace; font-size: 24px; letter-spacing: 3px; color: #fff; }
    .scanner-laser {
      position: absolute;
      left: 0; right: 0; height: 3px; background: #f43f5e; box-shadow: 0 0 12px #f43f5e;
      animation: sweep 2s infinite ease-in-out;
    }

    @keyframes sweep {
      0%, 100% { top: 15%; opacity: 0.2; }
      50% { top: 85%; opacity: 1; }
    }

    .pos-action-msg { font-size: 11px; font-weight: 800; color: #34d399; margin-top: 8px; font-family: monospace; }
    .pos-receipt-col { display: flex; flex-direction: column; justify-content: space-between; text-align: left; }
    .pos-line-item { display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; background: rgba(255, 255, 255, 0.05); padding: 10px 14px; border-radius: 8px; }
    .pos-total-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px; font-size: 16px; font-weight: 800; }
    .total-val { font-size: 28px; font-weight: 900; font-family: 'JetBrains Mono', monospace; }

    .pos-hotkeys { border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 10px; font-size: 11px; color: #cbd5e1; }
    .pos-hotkeys kbd { background: rgba(255, 255, 255, 0.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; }

    /* Code Box */
    .code-box {
      background: rgba(8, 12, 24, 0.96);
      border: 1px solid rgba(250, 204, 21, 0.4);
      border-radius: 14px;
      overflow: hidden;
      text-align: left;
    }

    .code-head {
      background: rgba(15, 23, 42, 0.9);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .code-dot { width: 10px; height: 10px; border-radius: 50%; }
    .code-dot.red { background: #f43f5e; }
    .code-dot.amber { background: #f59e0b; }
    .code-dot.green { background: #10b981; }
    .code-filename { font-family: monospace; color: #cbd5e1; flex: 1; margin-left: 6px; font-size: 11px; }
    .code-badge { background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; }

    .code-pre {
      padding: 16px 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #e2e8f0;
      white-space: pre-wrap;
    }

    .code-pre .k { color: #f43f5e; font-weight: 700; }
    .code-pre .f { color: #38bdf8; }
    .code-pre .t { color: #a78bfa; }
    .code-pre .s { color: #fde047; }
    .code-pre .n { color: #fb923c; }
    .code-pre .c { color: #64748b; font-style: italic; }

    /* Modal Preview */
    .modal-preview {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(244, 63, 94, 0.5);
      border-radius: 16px;
      padding: 20px;
      max-width: 620px;
      margin: 0 auto;
      text-align: left;
    }

    .modal-preview-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 13px; }
    .alert-banner { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.35); padding: 10px 14px; border-radius: 8px; font-size: 13px; color: #fda4af; margin-bottom: 12px; }
    .auth-box { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px; }
    .auth-dots { letter-spacing: 4px; color: var(--gold-light); font-size: 16px; }
    .success-banner { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; color: #6ee7b7; }

    /* Stats Grid */
    .stat-lbl { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 6px; }
    .stat-val { font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; margin-bottom: 6px; }
    .stat-badge { font-size: 11px; font-weight: 700; }
    .mini-bar { display: flex; height: 6px; border-radius: 3px; overflow: hidden; margin: 8px 0; }
    .mini-legend { font-size: 10px; color: #cbd5e1; font-weight: 600; }

    /* Cupom Fiscal */
    .receipt-card {
      background: #fff;
      color: #0f172a;
      border-radius: 12px;
      padding: 18px 24px;
      max-width: 580px;
      margin: 0 auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-align: center;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9);
    }

    .rec-title { font-weight: 900; font-size: 13px; }
    .rec-sub { font-size: 9px; color: #475569; margin: 4px 0 10px 0; }
    .rec-key { background: #f1f5f9; padding: 6px; border-radius: 4px; font-size: 10px; font-weight: 800; word-break: break-all; margin-bottom: 10px; }
    .rec-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 9px; color: #475569; }
    .rec-barcode { font-size: 18px; letter-spacing: 2px; }

    /* QA Console */
    .qa-console {
      background: rgba(8, 14, 26, 0.95);
      border: 1px solid rgba(16, 185, 129, 0.4);
      border-radius: 16px;
      padding: 18px;
      max-width: 850px;
      margin: 0 auto;
      font-family: 'JetBrains Mono', monospace;
      text-align: left;
    }

    .qa-head { display: flex; justify-content: space-between; font-size: 11px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; margin-bottom: 12px; }
    .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; color: #34d399; }
    .qa-foot { margin-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 8px; font-size: 10px; color: #94a3b8; font-weight: 700; text-align: center; }

    /* Final */
    .motto-title { font-size: 34px; font-weight: 900; color: var(--gold-light); }
    .motto-sub { font-size: 14px; color: #94a3b8; margin-top: 4px; }
    .action-row { display: flex; gap: 14px; justify-content: center; margin-top: 18px; }

    .btn-action {
      padding: 10px 22px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-gold { background: linear-gradient(135deg, #facc15, #f59e0b); color: #020409; border: none; box-shadow: 0 0 25px rgba(250, 204, 21, 0.5); }
    .btn-gold:hover { transform: scale(1.06); box-shadow: 0 0 35px rgba(250, 204, 21, 0.8); }
    .btn-outline { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; }
    .btn-outline:hover { background: rgba(255, 255, 255, 0.15); transform: scale(1.05); }

    /* Barra Inferior de Controle */
    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .controls-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .control-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .control-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      color: var(--gold-light);
      transform: scale(1.1);
    }

    .btn-main-play {
      background: linear-gradient(135deg, #facc15, #f59e0b);
      color: #020409;
      width: 44px;
      height: 44px;
      border: none;
      box-shadow: 0 0 20px rgba(250, 204, 21, 0.5);
    }

    .btn-main-play:hover {
      color: #000;
      transform: scale(1.12);
      box-shadow: 0 0 30px rgba(250, 204, 21, 0.8);
    }

    .scene-navigator {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      max-width: 600px;
      padding: 4px;
    }

    .scene-dot {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .scene-dot:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .scene-dot.active {
      background: var(--gold);
      color: #020409;
      border-color: var(--gold-light);
      font-weight: 900;
    }

    .hud-keys {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11px;
      color: #94a3b8;
    }

    .hud-keys kbd {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      color: #fff;
      font-family: monospace;
    }

    /* Start Overlay */
    #start-overlay {
      position: absolute;
      inset: 0;
      background: rgba(2, 4, 9, 0.94);
      backdrop-filter: blur(28px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 200;
      cursor: pointer;
      text-align: center;
      padding: 30px;
    }

    .play-circle {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #facc15, #f59e0b);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 18px 0;
      box-shadow: 0 0 45px rgba(250, 204, 21, 0.6);
      transition: transform 0.25s ease;
    }

    .play-circle:hover {
      transform: scale(1.15);
      box-shadow: 0 0 65px rgba(250, 204, 21, 0.9);
    }

    .play-circle svg {
      width: 32px;
      height: 32px;
      fill: #020409;
      margin-left: 3px;
    }

    /* 9:16 Vertical */
    #stage.mode-vertical .grid-3,
    #stage.mode-vertical .grid-2,
    #stage.mode-vertical .grid-4,
    #stage.mode-vertical .arch-flow {
      grid-template-columns: 1fr;
      flex-direction: column;
      gap: 12px;
    }

    #stage.mode-vertical .pos-screen-grid {
      grid-template-columns: 1fr;
    }

    #stage.mode-vertical .scene-headline {
      font-size: 22px;
      line-height: 1.25;
      margin-bottom: 16px;
    }

    #stage.mode-vertical .scene-navigator,
    #stage.mode-vertical .hud-keys {
      display: none;
    }
  </style>
</head>
<body>

  <div class="bg-lights">
    <div class="light-orb orb-gold" id="fx-gold"></div>
    <div class="light-orb orb-indigo" id="fx-indigo"></div>
    <div class="light-orb orb-emerald" id="fx-emerald"></div>
    <div class="grid-dots"></div>
  </div>

  <div id="stage">
    <!-- Topo -->
    <div class="top-bar">
      <div class="brand-pill">
        <span class="live-dot"></span>
        <span id="label-audio">Áudio Neural Sincronizado</span>
      </div>

      <div class="progress-track" id="progress-bar" title="Clique para navegar no tempo">
        <div class="progress-fill" id="progress-fill"></div>
      </div>

      <div class="timecode-box" id="timecode-display">
        00:00.0 / 03:04.3
      </div>
    </div>

    <!-- Cenas -->
    <div class="scene-viewport">
${scenesHtml}
    </div>

    <!-- Controles Inferiores -->
    <div class="bottom-bar">
      <div class="controls-group">
        <button class="control-btn" onclick="pular(-1)" title="Cena Anterior [←]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="control-btn btn-main-play" onclick="togglePlay()" id="btn-play" title="Play / Pause [ESPAÇO]">
          <svg id="icon-play" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
        <button class="control-btn" onclick="pular(1)" title="Próxima Cena [→]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="control-btn" onclick="toggleMute()" id="btn-mute" title="Ativar/Desativar Som [M]">
          <svg id="icon-mute" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
        <button class="control-btn" onclick="toggleAspect()" title="Alternar 16:9 / 9:16 [A]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </button>
      </div>

      <div class="scene-navigator" id="nav-dots">
        ${cronograma.map((c, i) => `<button class="scene-dot ${i === 0 ? 'active' : ''}" onclick="irPara(${c.id})">#${String(c.id).padStart(2,'0')} ${c.rotulo}</button>`).join('')}
      </div>

      <div class="hud-keys">
        <span><kbd>ESPAÇO</kbd> Play</span>
        <span><kbd>←</kbd> <kbd>→</kbd> Cenas</span>
        <span><kbd>M</kbd> Mudo</span>
        <span><kbd>A</kbd> 16:9/9:16</span>
      </div>
    </div>
  </div>

  <!-- Overlay Inicial -->
  <div id="start-overlay" onclick="iniciar()">
    <img src="/logo.png" alt="MS² Vestuário" class="crest-img" style="max-height: 90px; margin-bottom: 8px;">
    <div class="play-circle">
      <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
    </div>
    <h2 style="font-size: 26px; font-weight: 900; margin-bottom: 6px;">
      Iniciar Apresentação em Motion Design
    </h2>
    <p style="font-size: 13.5px; color: #94a3b8; max-width: 520px;">
      15 cenas em alta definição, áudio neural sincronizado palavra-por-palavra e governança fiscal completa.
    </p>
    <div style="margin-top: 18px; font-size: 11px; color: var(--gold); font-family: monospace; font-weight: 700;">
      Clique para começar [ESPAÇO]
    </div>
  </div>

  <script>
    const CRONOGRAMA = ${JSON.stringify(cronograma, null, 2)};
    const DURACAO_TOTAL = CRONOGRAMA.reduce((s, c) => s + c.duracaoAudio, 0);

    let cenaAtivaId = 1;
    let tocando = false;
    let mudo = false;
    let vertical = false;
    let audioAtual = null;
    let animFrame = null;

    // Pré-carregamento dos áudios
    const audios = new Map();
    CRONOGRAMA.forEach(c => {
      const a = new Audio('/pitch/audio/' + c.arquivo);
      a.preload = 'auto';
      audios.set(c.id, a);
    });

    const stage = document.getElementById('stage');
    const startOverlay = document.getElementById('start-overlay');
    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-fill');
    const timecode = document.getElementById('timecode-display');
    const iconPlay = document.getElementById('icon-play');
    const iconMute = document.getElementById('icon-mute');
    const labelAudio = document.getElementById('label-audio');

    function iniciar() {
      startOverlay.style.display = 'none';
      irPara(1);
      tocar();
    }

    function irPara(id) {
      if (audioAtual) {
        audioAtual.pause();
        audioAtual.currentTime = 0;
      }

      cenaAtivaId = id;
      const cena = CRONOGRAMA.find(c => c.id === id) || CRONOGRAMA[0];

      // Atualiza cenas no DOM
      document.querySelectorAll('.scene-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('scene-' + id);
      if (panel) panel.classList.add('active');

      // Limpa destaques
      document.querySelectorAll('.word').forEach(w => {
        w.classList.remove('active', 'spoken');
      });

      // Atualiza botões
      document.querySelectorAll('.scene-dot').forEach((b, i) => {
        if (i + 1 === id) b.classList.add('active');
        else b.classList.remove('active');
      });

      audioAtual = audios.get(id);
      if (audioAtual) {
        audioAtual.currentTime = 0;
        audioAtual.muted = mudo;
        audioAtual.onended = () => {
          if (cenaAtivaId < CRONOGRAMA.length) {
            irPara(cenaAtivaId + 1);
            if (tocando) tocar();
          } else {
            pausar();
          }
        };
      }

      if (tocando) {
        tocar();
      }
      atualizarFrame();
    }

    function tocar() {
      tocando = true;
      iconPlay.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
      if (audioAtual && !mudo) {
        audioAtual.play().catch(() => {});
      }
      if (!animFrame) animFrame = requestAnimationFrame(loop);
    }

    function pausar() {
      tocando = false;
      iconPlay.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
      if (audioAtual) audioAtual.pause();
      if (animFrame) {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
    }

    function togglePlay() {
      if (startOverlay.style.display !== 'none') {
        iniciar();
        return;
      }
      if (tocando) pausar();
      else tocar();
    }

    function toggleMute() {
      mudo = !mudo;
      if (audioAtual) audioAtual.muted = mudo;
      if (mudo) {
        iconMute.innerHTML = '<line x1="1" y1="1" x2="23" y2="23"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
        labelAudio.textContent = 'Áudio Silenciado';
      } else {
        iconMute.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
        labelAudio.textContent = 'Áudio Neural Sincronizado';
      }
    }

    function toggleAspect() {
      vertical = !vertical;
      if (vertical) stage.classList.add('mode-vertical');
      else stage.classList.remove('mode-vertical');
    }

    function pular(delta) {
      let novo = cenaAtivaId + delta;
      if (novo < 1) novo = 1;
      if (novo > CRONOGRAMA.length) novo = CRONOGRAMA.length;
      irPara(novo);
    }

    function reiniciar() {
      irPara(1);
      tocar();
    }

    function atualizarFrame() {
      const cena = CRONOGRAMA.find(c => c.id === cenaAtivaId);
      if (!cena) return;

      const t = audioAtual ? audioAtual.currentTime : 0;

      // Atualiza destaques das palavras
      cena.palavras.forEach((p, idx) => {
        const el = document.getElementById('w-' + cena.id + '-' + idx);
        if (!el) return;

        if (t >= p.s && t < p.e) {
          el.classList.add('active');
          el.classList.remove('spoken');
        } else if (t >= p.e) {
          el.classList.remove('active');
          el.classList.add('spoken');
        } else {
          el.classList.remove('active', 'spoken');
        }
      });

      // Calcula tempo total decorrido
      let acumulado = 0;
      for (let i = 0; i < cena.id - 1; i++) {
        acumulado += CRONOGRAMA[i].duracaoAudio;
      }
      acumulado += t;

      const pct = Math.min(100, Math.max(0, (acumulado / DURACAO_TOTAL) * 100));
      progressFill.style.width = pct + '%';

      const min = Math.floor(acumulado / 60);
      const seg = Math.floor(acumulado % 60);
      const dec = Math.floor((acumulado % 1) * 10);
      const tMin = Math.floor(DURACAO_TOTAL / 60);
      const tSeg = Math.floor(DURACAO_TOTAL % 60);

      timecode.textContent = 
        String(min).padStart(2,'0') + ':' + String(seg).padStart(2,'0') + '.' + dec + ' / ' +
        String(tMin).padStart(2,'0') + ':' + String(tSeg).padStart(2,'0') + '.0';

      // Movimento suave dos glows
      const fxGold = document.getElementById('fx-gold');
      const fxIndigo = document.getElementById('fx-indigo');
      const fxEmerald = document.getElementById('fx-emerald');
      if (fxGold) fxGold.style.transform = 'translate(' + (Math.sin(acumulado * 0.3) * 50) + 'px, ' + (Math.cos(acumulado * 0.25) * 40) + 'px)';
      if (fxIndigo) fxIndigo.style.transform = 'translate(' + (Math.cos(acumulado * 0.28) * 45) + 'px, ' + (Math.sin(acumulado * 0.35) * 45) + 'px)';
      if (fxEmerald) fxEmerald.style.transform = 'scale(' + (1 + Math.sin(acumulado * 0.4) * 0.12) + ')';
    }

    function loop() {
      if (!tocando) return;
      atualizarFrame();
      animFrame = requestAnimationFrame(loop);
    }

    // Clique na Barra de Progresso para saltar de cena
    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        let alvoTempo = pct * DURACAO_TOTAL;
        let soma = 0;
        for (const c of CRONOGRAMA) {
          if (alvoTempo <= soma + c.duracaoAudio || c.id === CRONOGRAMA.length) {
            irPara(c.id);
            if (audioAtual) audioAtual.currentTime = Math.max(0, alvoTempo - soma);
            break;
          }
          soma += c.duracaoAudio;
        }
      });
    }

    // Atalhos de teclado
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
          pular(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          pular(1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyA':
          e.preventDefault();
          toggleAspect();
          break;
        case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4': case 'Digit5':
        case 'Digit6': case 'Digit7': case 'Digit8': case 'Digit9':
          irPara(parseInt(e.key, 10));
          break;
        case 'Digit0':
          irPara(10);
          break;
      }
    });

    // Comunicação com PitchMotionPage React via postMessage
    window.addEventListener('message', (e) => {
      if (!e.data) return;
      if (e.data.tipo === 'TOGGLE_PLAY') togglePlay();
      else if (e.data.tipo === 'TOGGLE_MUTE') toggleMute();
      else if (e.data.tipo === 'IR_PARA_CENA') irPara(e.data.cena);
    });

    // Inicialização da Cena 1
    irPara(1);
  </script>
</body>
</html>`;

const caminhoPublic = 'Estudo/frontend/public/motion-pitch-player.html';
const caminhoDoc = 'Estudo/documentação/s06/motion-pitch-player.html';

fs.writeFileSync(caminhoPublic, fullHtml, 'utf8');
fs.writeFileSync(caminhoDoc, fullHtml, 'utf8');

console.log('✅ Motion Player 100% reconstruído com alta fidelidade visual!');
console.log('   -> ' + caminhoPublic);
console.log('   -> ' + caminhoDoc);
