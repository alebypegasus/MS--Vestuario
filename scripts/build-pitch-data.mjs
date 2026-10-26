import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('Estudo/frontend/public/pitch/audio/manifest.json', 'utf8'));
const roteiro = JSON.parse(fs.readFileSync('Estudo/frontend/public/pitch/roteiro.json', 'utf8'));

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

const ACCENTS = {
  1: { gold: ['emoção.', 'vitrine,'], emerald: ['operação'], rose: ['não', 'pode', 'parar.'] },
  2: { rose: ['filas', 'travam', 'sem', 'controle.', 'rejeitadas.', 'perdida.'], gold: ['horário', 'pico.'] },
  3: { gold: ['ms²', 'vestuário:', 'varejo', 'moda.'], emerald: ['pdv', 'gestão', 'comercial'] },
  4: { gold: ['react', 'typescript', 'node', 'express,'], emerald: ['zod,', 'jwt', 'transações', 'acid.'] },
  5: { emerald: ['velocidade', 'absoluta.', 'trezentos', 'milissegundos.'], gold: ['tecla', 'atalho.'] },
  6: { gold: ['receita', 'federal.', 'módulo', 'onze'], emerald: ['dois', 'dígitos', 'verificadores'], rose: ['bloqueia', 'inválido'] },
  7: { emerald: ['decide', 'segundos:', 'fidelizado,'], gold: ['consumidor', 'final.'] },
  8: { gold: ['caixa', 'gerente', 'administrador'], emerald: ['middleware', 'acesso.'] },
  9: { rose: ['desconto', 'acima', 'dez', 'cento?', 'bloqueia'], emerald: ['senha', 'gerente.', 'auditoria.'] },
  10: { gold: ['histórico', 'imutável.', 'congelado'], emerald: ['autorização', 'gerencial.'] },
  11: { emerald: ['painel', 'tempo', 'real:', 'faturamento,'], gold: ['ticket', 'médio,', 'ranking'] },
  12: { gold: ['nfc-e', 'sessenta', 'cinco', 'quarenta', 'quatro', 'dígitos,'], emerald: ['qr', 'code', 'lei', 'transparência.'] },
  13: { emerald: ['um', 'clique:', 'pdf', 'planilha', 'excel', 'csv'], gold: ['relatórios', 'executivos'] },
  14: { emerald: ['qualidade', 'não', 'promessa,', 'evidência.', 'dezoito', 'testes'], gold: ['homologadas.'] },
  15: { gold: ['ms²', 'vestuário.', 'moda,', 'estilo', 'você,'], emerald: ['firjan', 'senai.'] }
};

const cenas = manifest.cenas.map(c => {
  const r = roteiro.cenas.find(x => x.id === c.id) || { rotulo: 'Cena ' + c.id };
  const b = BADGES[c.id];
  const acc = ACCENTS[c.id] || {};
  return {
    id: c.id,
    arquivo: c.arquivo,
    audioUrl: '/pitch/audio/' + c.arquivo,
    rotulo: r.rotulo,
    tag: b.tag,
    title: b.title,
    themeColor: b.color,
    duracao: c.duracao,
    palavras: c.palavras.map(p => {
      const clean = p.w.toLowerCase().replace(/[^a-z0-9áéíóúãõâêîôûç²]/gi, '');
      let accent = null;
      if (acc.gold && acc.gold.some(w => w.includes(clean))) accent = 'gold';
      else if (acc.emerald && acc.emerald.some(w => w.includes(clean))) accent = 'emerald';
      else if (acc.rose && acc.rose.some(w => w.includes(clean))) accent = 'rose';
      return { w: p.w, s: p.s, e: p.e, accent };
    })
  };
});

const fileContent = `export interface IPalavraPitch {
  w: string;
  s: number;
  e: number;
  accent: 'gold' | 'emerald' | 'rose' | null;
}

export interface ICenaPitch {
  id: number;
  arquivo: string;
  audioUrl: string;
  rotulo: string;
  tag: string;
  title: string;
  themeColor: 'gold' | 'emerald' | 'rose' | 'indigo';
  duracao: number;
  palavras: IPalavraPitch[];
}

export const PITCH_CENAS: ICenaPitch[] = ${JSON.stringify(cenas, null, 2)};
`;

fs.mkdirSync('Estudo/frontend/src/data', { recursive: true });
fs.writeFileSync('Estudo/frontend/src/data/pitchManifest.ts', fileContent, 'utf8');
console.log('✅ Estudo/frontend/src/data/pitchManifest.ts criado com 15 cenas!');
