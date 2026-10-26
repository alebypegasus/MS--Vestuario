import { db } from '../config/database';

async function migrateProdutos() {
  console.log('🔄 Verificando colunas da tabela produtos...');
  const [cols]: any = await db.execute(`SHOW COLUMNS FROM produtos`);
  const nomes = cols.map((c: any) => c.Field);

  if (!nomes.includes('imagens')) {
    console.log('➕ Adicionando coluna imagens...');
    await db.execute(`ALTER TABLE produtos ADD COLUMN imagens TEXT NULL COMMENT 'JSON array de URLs de fotos do produto'`);
  }
  if (!nomes.includes('cores')) {
    console.log('➕ Adicionando coluna cores...');
    await db.execute(`ALTER TABLE produtos ADD COLUMN cores VARCHAR(255) NULL COMMENT 'Cores disponíveis (JSON ou vírgula)'`);
  }
  if (!nomes.includes('tamanhos')) {
    console.log('➕ Adicionando coluna tamanhos...');
    await db.execute(`ALTER TABLE produtos ADD COLUMN tamanhos VARCHAR(255) NULL COMMENT 'Grade de tamanhos (P, M, G, etc.)'`);
  }
  if (!nomes.includes('tipo')) {
    console.log('➕ Adicionando coluna tipo...');
    await db.execute(`ALTER TABLE produtos ADD COLUMN tipo VARCHAR(100) NULL COMMENT 'Subtipo ou modelagem da peça'`);
  }
  if (!nomes.includes('detalhes')) {
    console.log('➕ Adicionando coluna detalhes...');
    await db.execute(`ALTER TABLE produtos ADD COLUMN detalhes TEXT NULL COMMENT 'Composição, cuidados e ficha técnica'`);
  }
  if (!nomes.includes('estoque')) {
    console.log('➕ Adicionando coluna estoque...');
    await db.execute(`ALTER TABLE produtos ADD COLUMN estoque INT NOT NULL DEFAULT 50 COMMENT 'Saldo atual em estoque'`);
  }

  // Atualizar os produtos existentes de 1 a 8 com dados ricos de cores, tamanhos, tipos, detalhes e estoque
  console.log('✨ Enriquecendo produtos padrão 101 a 108...');
  await db.execute(`
    UPDATE produtos SET
      tipo = 'Camiseta Algodão Egípcio',
      cores = '["Preto", "Chumbo", "Grafite"]',
      tamanhos = '["P", "M", "G", "GG"]',
      detalhes = '100% Algodão Pima Peruano fio 40.1 penteado. Costura reforçada ombro a ombro com toque aveludado e caimento slim moderno.',
      estoque = 45,
      imagens = '["/products/101.jpg"]'
    WHERE codigo = '101'
  `);

  await db.execute(`
    UPDATE produtos SET
      tipo = 'Camiseta Regular Fit',
      cores = '["Branco Puro", "Off-White"]',
      tamanhos = '["P", "M", "G", "GG", "XG"]',
      detalhes = 'Algodão sustentável com certificação BCI. Antipilling de alta durabilidade e gola com elastano que não deforma.',
      estoque = 60,
      imagens = '["/products/102.jpg"]'
    WHERE codigo = '102'
  `);

  await db.execute(`
    UPDATE produtos SET
      tipo = 'Calça Jeans Stretch',
      cores = '["Azul Escuro", "Raw Denim"]',
      tamanhos = '["38", "40", "42", "44", "46"]',
      detalhes = '98% Algodão, 2% Elastano. Lavagem amaciada eco-friendly com pespontos contrastantes em ocre e bolsos traseiros reforçados.',
      estoque = 32,
      imagens = '["/products/103.jpg"]'
    WHERE codigo = '103'
  `);

  await db.execute(`
    UPDATE produtos SET
      tipo = 'Jaqueta Jeans Vintage',
      cores = '["Azul Médio Estonado"]',
      tamanhos = '["P", "M", "G", "GG"]',
      detalhes = 'Denim 12.5 oz resistente a abrasão. Botões em metal oxidado personalizados com logo da marca e bolsos frontais utilitários.',
      estoque = 18,
      imagens = '["/products/104.jpg"]'
    WHERE codigo = '104'
  `);

  await db.execute(`
    UPDATE produtos SET
      tipo = 'Vestido Fluido Midi',
      cores = '["Floral Primavera", "Verde Botânico"]',
      tamanhos = '["P", "M", "G"]',
      detalhes = 'Viscose maquinetada de alta gramatura com toque acetinado. Decote em V com fenda frontal discreta e forro respirável.',
      estoque = 24,
      imagens = '["/products/105.jpg"]'
    WHERE codigo = '105'
  `);

  await db.execute(`
    UPDATE produtos SET
      tipo = 'Boné Dad Hat 6 Painéis',
      cores = '["Preto Ônix", "Cáqui"]',
      tamanhos = '["Único"]',
      detalhes = 'Sarja peletizada 100% algodão com fecho strapback de metal. Bordado frontal de alta definição.',
      estoque = 55,
      imagens = '["/products/106.jpg"]'
    WHERE codigo = '106'
  `);

  await db.execute(`
    UPDATE produtos SET
      tipo = 'Cinto Social e Casual',
      cores = '["Marrom Havana", "Caramelo"]',
      tamanhos = '["95cm", "100cm", "105cm", "110cm"]',
      detalhes = '100% Couro legítimo bovino com acabamento escovado nas bordas e fivela metálica niquelada fosca.',
      estoque = 40,
      imagens = '["/products/107.jpg"]'
    WHERE codigo = '107'
  `);

  await db.execute(`
    UPDATE produtos SET
      tipo = 'Kit Meias Respiráveis',
      cores = '["Preto/Cinza/Branco"]',
      tamanhos = '["38-43"]',
      detalhes = 'Composição: 78% Algodão, 19% Poliamida, 3% Elastodieno. Calcanhar verdadeiro anatômico com faixa de amortecimento.',
      estoque = 80,
      imagens = '["/products/108.jpg"]'
    WHERE codigo = '108'
  `);

  console.log('✅ Migração da tabela produtos concluída com sucesso!');
  process.exit(0);
}

migrateProdutos().catch((err) => {
  console.error('❌ Erro na migração:', err);
  process.exit(1);
});
