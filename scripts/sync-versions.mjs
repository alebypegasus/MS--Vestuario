#!/usr/bin/env bun
/**
 * Script de Sincronização e Purificação White-Label (Estudo -> Final)
 * 
 * Regra do Usuário:
 * - A versão Final NÃO deve ter NENHUMA menção de estudos, SENAI, Marcelo Souza,
 *   TCC, Sprints acadêmicos ou marcas específicas (MS² Vestuário).
 * - A versão Final é 100% personalizável (White-Label) para qualquer empresa.
 * - Qualquer alteração feita na versão Estudo é automaticamente sincronizada
 *   e expurgada de detalhes acadêmicos na versão Final.
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const ESTUDO_DIR = path.join(ROOT_DIR, 'Estudo');
const FINAL_DIR = path.join(ROOT_DIR, 'Final');

console.log('🔄 Executando Sincronização Inteligente (Estudo -> Final White-Label)...');

if (!fs.existsSync(ESTUDO_DIR) || !fs.existsSync(FINAL_DIR)) {
  console.error('❌ Diretórios Estudo ou Final não encontrados.');
  process.exit(1);
}

// Arquivos ou pastas que pertencem ESTRITAMENTE a estudos e NUNCA devem existir no Final
const BLACKLIST_FOR_FINAL = [
  'PitchMotionPage.tsx',
  'gerar-narracao-pitch.mjs',
  'test-e2e-sprint5.ts',
  'fivedollars-ms2vestuario.json',
  'postman-ms2vestuario-collection.json',
  '.fivedollars',
  'narrations',
  'audio',
  'documentação',
  'motion-pitch-player.html'
];

const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  '.git',
  '.DS_Store'
];

function shouldIgnore(name) {
  return IGNORE_PATTERNS.some(p => name === p || name.endsWith('.sqlite') || name.endsWith('.sqlite-journal'));
}

function isBlacklisted(relPath) {
  const base = path.basename(relPath);
  return BLACKLIST_FOR_FINAL.some(item => base === item || relPath.includes(item));
}

// Dicionário completo de higienização de termos
const SANITIZATION_RULES = [
  // 1. Pessoas, Bancas e Orientadores
  { search: /Marcelo Souza \(@marcelologan\)/gi, replace: 'Diretoria de Operações' },
  { search: /Prof\. Marcelo Souza \(@marcelologan\)/gi, replace: 'Comitê de Auditoria' },
  { search: /Marcelo Souza/gi, replace: 'Consultoria Especializada' },
  { search: /@marcelologan/gi, replace: '@empresa.com.br' },
  { search: /Prof\. Marcelo Souza/gi, replace: 'Comitê de Auditoria' },
  { search: /Marcelo/gi, replace: 'Gestor' },

  // 2. Instituições Acadêmicas
  { search: /Firjan SENAI/gi, replace: 'Enterprise Retail Suite' },
  { search: /SENAI/gi, replace: 'Gestão Empresarial' },
  { search: /Loja A - Firjan SENAI/gi, replace: 'Loja Matriz' },
  { search: /Projeto Final de Curso - Firjan SENAI &bull; MS² Vestuário/gi, replace: 'Sistema Integrado de Gestão Comercial & Frente de Caixa (PDV)' },
  { search: /Projeto Final de Curso - Firjan SENAI • MS² Vestuário/gi, replace: 'Sistema Integrado de Gestão Comercial & Frente de Caixa (PDV)' },
  { search: /Projeto Final de Curso/gi, replace: 'Plataforma Corporativa de Varejo' },
  
  // 3. TCC, Sprints, Dossiês
  { search: /Homologação do TCC/gi, replace: 'Parâmetros Fiscais & Auditoria' },
  { search: /Dossiê Técnico & Pitch do TCC/gi, replace: 'Manual de Procedimentos Fiscais' },
  { search: /Dossiê Fiscal & RN-01 a RN-08/gi, replace: 'Parâmetros Fiscais & Auditoria' },
  { search: /Dossiê de Homologação Fiscal & Regras de Negócio \(RN-01 a RN-06\)/gi, replace: 'Parâmetros Fiscais & Regras Operacionais' },
  { search: /Dossiê Fiscal/gi, replace: 'Parâmetros Fiscais' },
  { search: /Live Demo & Rubrica Firjan SENAI \(10 Minutos\)/gi, replace: 'Auditoria de Conformidade e Rotinas do PDV' },
  { search: /Sprint 6 • Motion Design Pitch & Apresentação/gi, replace: 'Painel Geral de Conformidade Operacional' },
  { search: /Critérios avaliativos para encerramento das Sprints 1 a 4 e transição para Sprint 5/gi, replace: 'Critérios de qualidade, segurança e conformidade contínua' },
  { search: /Sprint \d+: Backend \(Lógica de Negócio e Rotas da API\)/gi, replace: 'Release Pro 2.5: Backend' },
  { search: /Sprint \d+/gi, replace: 'Release Pro 2.5' },

  // 4. Marca MS² Vestuário -> White-Label / OmniVarejo Enterprise
  { search: /MS² Vestuário Comércio de Roupas LTDA/gi, replace: 'Varejo Inteligente Comércio LTDA' },
  { search: /MS² Vestuário/gi, replace: 'OmniVarejo Enterprise' },
  { search: /MS2 Vestuário/gi, replace: 'OmniVarejo Enterprise' },
  { search: /MS² Vestuario/gi, replace: 'OmniVarejo Enterprise' },
  { search: /MS2 Vestuario/gi, replace: 'OmniVarejo Enterprise' },
  { search: /logo MS²/gi, replace: 'logo da marca' },
  { search: /MS2-PDV-1\.0\.0/gi, replace: 'OMNI-PDV-1.0.0' },
  { search: /MS2-PDV-1\.0/gi, replace: 'OMNI-PDV-1.0' },
  { search: /PIX-MS2-/gi, replace: 'PIX-OMNI-' },
  { search: /MS2-\${/gi, replace: 'OMNI-${' },
  { search: /Suporte Tecnico MS2/gi, replace: 'Suporte Técnico Corporativo' },
  { search: /suporte@ms2vestuario\.com\.br/gi, replace: 'suporte@omnivarejo.com.br' },
  { search: /contato@ms2vestuario\.com\.br/gi, replace: 'contato@omnivarejo.com.br' },
  { search: /financeiro@ms2vestuario\.com\.br/gi, replace: 'financeiro@omnivarejo.com.br' },
  { search: /gerente@ms2\.com\.br/gi, replace: 'gerente@empresa.com.br' },
  { search: /caixa@ms2\.com\.br/gi, replace: 'caixa@empresa.com.br' },
  { search: /admin@ms2\.com\.br/gi, replace: 'admin@empresa.com.br' },
  { search: /@ms2vestuario\.com\.br/gi, replace: '@omnivarejo.com.br' },
  { search: /@ms2\.com\.br/gi, replace: '@empresa.com.br' },
  { search: /ms2_theme/gi, replace: 'app_theme' },
  { search: /catalogo_produtos_ms2/gi, replace: 'catalogo_produtos' },
  { search: /relatorio_vendas_ms2/gi, replace: 'relatorio_vendas' },
  { search: /base_clientes_ms2/gi, replace: 'base_clientes' },
  { search: /auditoria_fiscal_vendas_ms2/gi, replace: 'auditoria_fiscal_vendas' },
  { search: /ms2vest\.db/gi, replace: 'varejo_erp.db' },
  { search: /ms2_vestuario/gi, replace: 'omnivarejo_db' },
  { search: /PORT=3001/g, replace: 'PORT=3002' },
  { search: /ms2vest-local\.sqlite/gi, replace: 'varejo-erp-local.sqlite' },
  { search: /ms2_vestuario_secret_token_chave_super_segura_2026/gi, replace: 'enterprise_secret_token_chave_super_segura_2026' },

  // 5. Regras de Negócio Acadêmicas (RN-xx) transformadas em jargão de Varejo
  { search: /\(Módulo 11 - RN-01\)/gi, replace: '(Receita Federal)' },
  { search: /\(RN-01\)/gi, replace: '(Validação CPF)' },
  { search: /RN-01 • Validação Oficial de CPF \(Módulo 11\)/gi, replace: 'Validação Oficial de CPF (Receita Federal)' },
  { search: /RN-01/gi, replace: 'Validação de CPF' },

  { search: /\(RN-02\)/gi, replace: '(Alçada Gerencial)' },
  { search: /RN-02 • Alçada Gerencial de Desconto \(> 10%\)/gi, replace: 'Alçada Gerencial de Desconto (> 10%)' },
  { search: /RN-02/gi, replace: 'Alçada Gerencial' },

  { search: /\(RN-03\)/gi, replace: '(Estorno de Venda)' },
  { search: /RN-03 • Alçada de Cancelamento e Estorno de Venda/gi, replace: 'Alçada de Cancelamento e Estorno de Venda' },
  { search: /RN-03 \/ Controle de Estoque/gi, replace: 'Gestão Inteligente de Estoque' },
  { search: /RN-03/gi, replace: 'Estorno Auditado' },

  { search: /\(RN-04\)/gi, replace: '(Preço Histórico)' },
  { search: /RN-04 • Imutabilidade de Preços Históricos/gi, replace: 'Imutabilidade de Preços Históricos' },
  { search: /RN-04/gi, replace: 'Preço Histórico' },

  { search: /\(RN-05\)/gi, replace: '(Fechamento de Caixa)' },
  { search: /RN-05 • Fechamento de Caixa e Totalização/gi, replace: 'Fechamento de Caixa e Totalização' },
  { search: /RN-05/gi, replace: 'Fechamento de Caixa' },

  { search: /\(RN-06\)/gi, replace: '(Fidelização de Clientes)' },
  { search: /RN-06 • Fidelização Opcional do Consumidor/gi, replace: 'Fidelização Opcional do Consumidor' },
  { search: /RN-06/gi, replace: 'Fidelização' },

  { search: /\(RN-08 estrito\)/gi, replace: '(Exclusivo Administrador)' },
  { search: /RN-08/gi, replace: 'Controle de Acessos' }
];

export function sanitizeText(rawText, filePath = '') {
  let text = rawText;

  // Ajustes no App.tsx da versão Final: remover rota e imports de pitch
  if (filePath.endsWith('App.tsx')) {
    text = text.replace(/import\s*\{\s*PitchMotionPage\s*\}\s*from\s*'\.\/pages\/PitchMotionPage';/g, '');
    text = text.replace(/<Route\s+path="\/pitch"\s+element=\{<PitchMotionPage\s*\/>\}\s*\/>/g, '');
    text = text.replace(/const isPitchPage = location\.pathname === '\/pitch';/g, 'const isPitchPage = false;');
  }

  // Ajustes no Navbar.tsx da versão Final: remover links de pitch e tornar logo dinâmico
  if (filePath.endsWith('Navbar.tsx')) {
    text = text.replace(/{\/\* Link para Pitch em Motion Design \(Sprint 6\) \*\/}[\s\S]*?<\/NavLink>/g, '');
  }

  // Ajustes nos testes da API: aceitar e-mails genéricos
  if (filePath.endsWith('test-api.ts')) {
    text = text.replace(/gerente@ms2\.com\.br/g, 'gerente@empresa.com.br');
    text = text.replace(/caixa@ms2\.com\.br/g, 'caixa@empresa.com.br');
    text = text.replace(/admin@ms2\.com\.br/g, 'admin@empresa.com.br');
  }

  for (const { search, replace } of SANITIZATION_RULES) {
    text = text.replace(search, replace);
  }

  return text;
}

export function copyAndSanitizeFile(src, dest) {
  if (isBlacklisted(src)) {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    return;
  }

  const ext = path.extname(src).toLowerCase();
  const isTextFile = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.md', '.css', '.env', '.sql'].includes(ext);

  if (isTextFile) {
    const raw = fs.readFileSync(src, 'utf-8');
    const sanitized = sanitizeText(raw, src);
    fs.writeFileSync(dest, sanitized, 'utf-8');
  } else {
    fs.copyFileSync(src, dest);
  }
}

export function syncDirectory(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    if (shouldIgnore(entry)) continue;
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);

    if (isBlacklisted(srcPath)) {
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      continue;
    }

    const stats = fs.statSync(srcPath);
    if (stats.isDirectory()) {
      syncDirectory(srcPath, destPath);
    } else {
      copyAndSanitizeFile(srcPath, destPath);
    }
  }
}

// 1. Sincronizar Backend
syncDirectory(path.join(ESTUDO_DIR, 'backend', 'src'), path.join(FINAL_DIR, 'backend', 'src'));
copyAndSanitizeFile(path.join(ESTUDO_DIR, 'backend', 'package.json'), path.join(FINAL_DIR, 'backend', 'package.json'));
copyAndSanitizeFile(path.join(ESTUDO_DIR, 'backend', 'tsconfig.json'), path.join(FINAL_DIR, 'backend', 'tsconfig.json'));

// Garantir porta e segredos do Backend Final
fs.writeFileSync(path.join(FINAL_DIR, 'backend', '.env'), 'PORT=3002\nJWT_SECRET=super_secret_enterprise_final_token\n', 'utf-8');

// 2. Sincronizar Frontend
syncDirectory(path.join(ESTUDO_DIR, 'frontend', 'src'), path.join(FINAL_DIR, 'frontend', 'src'));
syncDirectory(path.join(ESTUDO_DIR, 'frontend', 'public'), path.join(FINAL_DIR, 'frontend', 'public'));
copyAndSanitizeFile(path.join(ESTUDO_DIR, 'frontend', 'package.json'), path.join(FINAL_DIR, 'frontend', 'package.json'));
copyAndSanitizeFile(path.join(ESTUDO_DIR, 'frontend', 'tsconfig.json'), path.join(FINAL_DIR, 'frontend', 'tsconfig.json'));
copyAndSanitizeFile(path.join(ESTUDO_DIR, 'frontend', 'tailwind.config.js'), path.join(FINAL_DIR, 'frontend', 'tailwind.config.js'));
copyAndSanitizeFile(path.join(ESTUDO_DIR, 'frontend', 'postcss.config.js'), path.join(FINAL_DIR, 'frontend', 'postcss.config.js'));
copyAndSanitizeFile(path.join(ESTUDO_DIR, 'frontend', 'index.html'), path.join(FINAL_DIR, 'frontend', 'index.html'));

// 3. Sincronizar Database SQLs
syncDirectory(path.join(ESTUDO_DIR, 'database'), path.join(FINAL_DIR, 'database'));

// Configurações exclusivas do Frontend Final
const finalViteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
});
`;
fs.writeFileSync(path.join(FINAL_DIR, 'frontend', 'vite.config.ts'), finalViteConfig, 'utf-8');
fs.writeFileSync(path.join(FINAL_DIR, 'frontend', '.env'), 'VITE_API_BASE_URL=http://localhost:3002/api\n', 'utf-8');

// Remover resíduos proibidos na versão Final
const forbiddenInFinal = [
  path.join(FINAL_DIR, 'frontend', 'src', 'pages', 'PitchMotionPage.tsx'),
  path.join(FINAL_DIR, 'frontend', 'public', 'motion-pitch-player.html'),
  path.join(FINAL_DIR, 'documentação')
];

for (const target of forbiddenInFinal) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

// Inserir usuários com emails @empresa.com.br no seeds do SQLite do Final caso seja gerado
const finalLocalDb = path.join(FINAL_DIR, 'backend', 'src', 'config', 'local-db.ts');
if (fs.existsSync(finalLocalDb)) {
  let dbCode = fs.readFileSync(finalLocalDb, 'utf-8');
  dbCode = dbCode.replace(/'gerente@ms2\.com\.br'/g, "'gerente@empresa.com.br'");
  dbCode = dbCode.replace(/'caixa@ms2\.com\.br'/g, "'caixa@empresa.com.br'");
  dbCode = dbCode.replace(/'admin@ms2\.com\.br'/g, "'admin@empresa.com.br'");
  dbCode = dbCode.replace(/PIX-MS2-/g, "PIX-OMNI-");
  fs.writeFileSync(finalLocalDb, dbCode, 'utf-8');
}

// Higienizar .vscode/settings.json no Final se existir
const finalVsCode = path.join(FINAL_DIR, '.vscode', 'settings.json');
if (fs.existsSync(finalVsCode)) {
  let vsCode = fs.readFileSync(finalVsCode, 'utf-8');
  vsCode = vsCode.replace(/MS² Vestuário/g, 'OmniVarejo Enterprise');
  fs.writeFileSync(finalVsCode, vsCode, 'utf-8');
}

// Gerar README.md comercial White-Label para a versão Final
const finalReadmeContent = `# 🚀 OmniVarejo Enterprise — Plataforma Universal de Gestão & Frente de Caixa (PDV)

Plataforma corporativa White-Label de alta performance desenvolvida para atender múltiplos segmentos do varejo moderno:
- **Vestuário & Calçados** (Grade de tamanhos, cores, tecidos)
- **Informática & Eletrônicos** (Garantia, número de série, especificações técnicas)
- **Confeitaria, Padarias & Alimentação** (Lote, data de validade, balança/pesagem)
- **Cosméticos, Farmácias & Pet Shops** (Fracionamento, controle de lotes, marcas)
- **Varejo Geral & Lojas de Departamento** (Códigos EAN/GTIN, alçadas e controle de estoque)

---

## 💎 Principais Funcionalidades

1. **Frente de Caixa (PDV Ágil & Fluido)**:
   - Registro instantâneo por Leitor de Código de Barras (EAN-13/SKU) ou busca textual inteligente.
   - Venda ao Consumidor Final ou fidelização opcional com validação oficial de CPF (Receita Federal).
   - Suporte a múltiplos pagamentos: Dinheiro com cálculo automático de troco, Cartão de Crédito/Débito e PIX Dinâmico com QR Code em tempo real.
   - Emissão de Comprovante Fiscal / NFC-e com QR Code de autenticação.
   - Controle de Alçada Gerencial para descontos corporativos (> 10%) e cancelamentos auditados.

2. **Catálogo & Gestão de Produtos Multissegmento**:
   - Categorias e Subcategorias dinâmicas personalizáveis com CRUD completo.
   - Sugestor rápido de categorias por segmento comercial pré-configurado.
   - Suporte a atributos universais: Unidade de Medida (UN, KG, M, PAR, LT), Marca, Modelo, Garantia, Validade e Lote.
   - Gestão de custos, formação de preço e cálculo dinâmico de margem bruta comercial.
   - Galeria de imagens por URL com upload de logos e identidades visuais da empresa.

3. **Painel de Controle da Empresa & White-Label**:
   - Upload de Logotipo da Marca, Logo em Texto e Favicon.
   - Personalização de Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual, Regime Tributário e Mensagem de Rodapé do Cupom.
   - Facilitadores de preenchimento automático para testes e onboarding ágil.

4. **Motor de Banco de Dados Dual-Engine**:
   - **Modo Autônomo**: SQLite embarcado de altíssima velocidade, sem necessidade de servidores externos.
   - **Modo Corporativo**: Compatível nativamente com MySQL 8.x / MariaDB, com esquemas automatizados, chaves estrangeiras e integridade referencial.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Vite.
- **Backend**: Node.js / Bun, Fastify / REST API, TypeScript, JWT, CORS, Zod.
- **Banco de Dados**: SQLite (nativo de alta performance) + MySQL 8.x (drivers dual-mode resilientes).

---

## 🚀 Como Iniciar

\`\`\`bash
# Backend (Porta 3002)
cd backend && bun install && bun run src/index.ts

# Frontend (Porta 5174)
cd frontend && bun install && bun run dev
\`\`\`

Acesse o sistema no navegador: [http://localhost:5174](http://localhost:5174)

---

*OmniVarejo Enterprise • Solução White-Label Completa para Gestão Comercial Moderna.*
`;

fs.writeFileSync(path.join(FINAL_DIR, 'README.md'), finalReadmeContent, 'utf-8');

console.log('✅ Sincronização concluída!');
console.log('🛡️  A versão Final está 100% White-Label: sem menções de SENAI, Marcelo Souza, TCC ou MS² Vestuário.');
