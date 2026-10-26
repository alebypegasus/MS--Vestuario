import bcrypt from 'bcryptjs';
import { db } from '../config/database';

// Gerador de CPFs válidos conforme Algoritmo Módulo 11 (Validação de CPF da Receita Federal)
function gerarCpfValido(baseNum: number): string {
  const base = String(baseNum).padStart(9, '0').slice(-9);
  const n = base.split('').map(Number);

  // 1º Dígito Verificador (pesos 10 a 2)
  let soma1 = 0;
  for (let i = 0; i < 9; i++) {
    soma1 += n[i] * (10 - i);
  }
  let d1 = 11 - (soma1 % 11);
  if (d1 >= 10) d1 = 0;

  // 2º Dígito Verificador (pesos 11 a 2)
  let soma2 = 0;
  for (let i = 0; i < 9; i++) {
    soma2 += n[i] * (11 - i);
  }
  soma2 += d1 * 2;
  let d2 = 11 - (soma2 % 11);
  if (d2 >= 10) d2 = 0;

  const limpo = `${base}${d1}${d2}`;
  return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9)}`;
}

export async function resetAndSeedDatabase() {
  console.log('🚀 Iniciando DROP e Recriação completa do banco de dados (OmniVarejo Enterprise)...');

  // Detecta se é MySQL ou SQLite
  let isSqlite = false;
  try {
    const [test]: any = await db.execute('SELECT sqlite_version()');
    if (test) isSqlite = true;
  } catch {
    isSqlite = false;
  }

  console.log(`ℹ️ Motor de Banco detectado: ${isSqlite ? 'SQLite (Local)' : 'MySQL 8.0'}`);

  if (isSqlite) {
    await db.execute('PRAGMA foreign_keys = OFF;');
  } else {
    await db.execute('SET FOREIGN_KEY_CHECKS = 0;');
  }

  // 1. Drop das tabelas
  const tabelas = [
    'itens_venda',
    'vendas',
    'produtos',
    'subcategorias',
    'categorias',
    'clientes',
    'usuarios',
    'configuracao_empresa'
  ];

  for (const t of tabelas) {
    await db.execute(`DROP TABLE IF EXISTS ${t};`);
  }

  if (isSqlite) {
    await db.execute('PRAGMA foreign_keys = ON;');
  } else {
    await db.execute('SET FOREIGN_KEY_CHECKS = 1;');
  }

  console.log('🧹 Tabelas dropadas com sucesso!');

  // 2. Recriação do Schema
  if (isSqlite) {
    await db.execute(`
      CREATE TABLE usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        cargo TEXT NOT NULL CHECK(cargo IN ('ADMIN', 'GERENTE', 'CAIXA')) DEFAULT 'CAIXA',
        ativo INTEGER NOT NULL DEFAULT 1,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    await db.execute(`
      CREATE TABLE clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        telefone TEXT,
        email TEXT,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    await db.execute(`
      CREATE TABLE categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL,
        descricao TEXT,
        icone TEXT,
        cor TEXT,
        ativo INTEGER NOT NULL DEFAULT 1,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    await db.execute(`
      CREATE TABLE subcategorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        slug TEXT NOT NULL,
        descricao TEXT,
        ativo INTEGER NOT NULL DEFAULT 1,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    await db.execute(`
      CREATE TABLE produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL UNIQUE,
        descricao TEXT NOT NULL,
        categoria TEXT,
        subcategoria TEXT,
        preco REAL NOT NULL,
        preco_custo REAL DEFAULT 0.00,
        estoque INTEGER NOT NULL DEFAULT 50,
        estoque_minimo INTEGER NOT NULL DEFAULT 10,
        unidade_medida TEXT DEFAULT 'UN',
        cores TEXT,
        tamanhos TEXT,
        tipo TEXT,
        detalhes TEXT,
        imagens TEXT,
        codigo_barras TEXT,
        marca TEXT DEFAULT 'OmniVarejo Enterprise',
        modelo TEXT,
        ativo INTEGER NOT NULL DEFAULT 1,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    await db.execute(`
      CREATE TABLE vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        cliente_id INTEGER REFERENCES clientes(id),
        gerente_aprovador_id INTEGER REFERENCES usuarios(id),
        subtotal REAL NOT NULL DEFAULT 0.00,
        desconto REAL NOT NULL DEFAULT 0.00,
        valor_total REAL NOT NULL DEFAULT 0.00,
        forma_pagamento TEXT NOT NULL CHECK(forma_pagamento IN ('DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX')),
        status TEXT NOT NULL CHECK(status IN ('CONCLUIDA', 'CANCELADA')) DEFAULT 'CONCLUIDA',
        motivo_cancelamento TEXT,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    await db.execute(`
      CREATE TABLE itens_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
        produto_id INTEGER NOT NULL REFERENCES produtos(id),
        quantidade INTEGER NOT NULL,
        preco_unitario REAL NOT NULL,
        subtotal REAL NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE configuracao_empresa (
        id INTEGER PRIMARY KEY DEFAULT 1,
        razao_social TEXT NOT NULL,
        nome_fantasia TEXT NOT NULL,
        cnpj TEXT NOT NULL,
        inscricao_estadual TEXT,
        telefone TEXT,
        email TEXT,
        logradouro TEXT NOT NULL,
        numero TEXT NOT NULL,
        complemento TEXT,
        bairro TEXT NOT NULL,
        cidade TEXT NOT NULL,
        uf TEXT NOT NULL,
        cep TEXT NOT NULL,
        regime_tributario TEXT DEFAULT 'Simples Nacional',
        mensagem_cupom TEXT,
        logo_url TEXT,
        logo_texto TEXT,
        favicon_url TEXT,
        segmento TEXT DEFAULT 'MODA_VESTUARIO',
        atualizado_em TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
  } else {
    // MySQL 8.0+
    await db.execute(`
      CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(120) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        cargo ENUM('ADMIN', 'GERENTE', 'CAIXA') NOT NULL DEFAULT 'CAIXA',
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(120) NOT NULL,
        cpf VARCHAR(14) NOT NULL UNIQUE,
        telefone VARCHAR(20) NULL,
        email VARCHAR(120) NULL,
        criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_clientes_cpf (cpf)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL,
        descricao TEXT NULL,
        icone VARCHAR(50) NULL,
        cor VARCHAR(30) NULL,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE subcategorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        categoria_id INT NOT NULL,
        nome VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        descricao TEXT NULL,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_subcat_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(50) NOT NULL UNIQUE,
        descricao VARCHAR(150) NOT NULL,
        categoria VARCHAR(50) NULL,
        subcategoria VARCHAR(50) NULL,
        preco DECIMAL(10, 2) NOT NULL,
        preco_custo DECIMAL(10, 2) DEFAULT 0.00,
        estoque INT NOT NULL DEFAULT 50,
        estoque_minimo INT NOT NULL DEFAULT 10,
        unidade_medida VARCHAR(10) DEFAULT 'UN',
        cores VARCHAR(255) NULL,
        tamanhos VARCHAR(255) NULL,
        tipo VARCHAR(100) NULL,
        detalhes TEXT NULL,
        imagens TEXT NULL,
        codigo_barras VARCHAR(50) NULL,
        marca VARCHAR(80) DEFAULT 'OmniVarejo Enterprise',
        modelo VARCHAR(80) NULL,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_produtos_codigo (codigo),
        INDEX idx_produtos_descricao (descricao)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE vendas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        cliente_id INT NULL,
        gerente_aprovador_id INT NULL,
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        desconto DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        forma_pagamento ENUM('DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX') NOT NULL,
        status ENUM('CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'CONCLUIDA',
        motivo_cancelamento TEXT NULL,
        criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_vendas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
        CONSTRAINT fk_vendas_gerente FOREIGN KEY (gerente_aprovador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        INDEX idx_vendas_usuario_id (usuario_id),
        INDEX idx_vendas_cliente_id (cliente_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE itens_venda (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venda_id INT NOT NULL,
        produto_id INT NOT NULL,
        quantidade INT NOT NULL,
        preco_unitario DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        CONSTRAINT fk_itens_venda_venda FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
        CONSTRAINT fk_itens_venda_produto FOREIGN KEY (produto_id) REFERENCES produtos(id),
        INDEX idx_itens_venda_venda_id (venda_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE configuracao_empresa (
        id INT PRIMARY KEY DEFAULT 1,
        razao_social VARCHAR(255) NOT NULL,
        nome_fantasia VARCHAR(255) NOT NULL,
        cnpj VARCHAR(20) NOT NULL,
        inscricao_estadual VARCHAR(20) NULL,
        telefone VARCHAR(20) NULL,
        email VARCHAR(100) NULL,
        logradouro VARCHAR(255) NOT NULL,
        numero VARCHAR(20) NOT NULL,
        complemento VARCHAR(100) NULL,
        bairro VARCHAR(100) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        uf VARCHAR(2) NOT NULL,
        cep VARCHAR(10) NOT NULL,
        regime_tributario VARCHAR(100) DEFAULT 'Simples Nacional',
        mensagem_cupom TEXT NULL,
        logo_url TEXT NULL,
        logo_texto VARCHAR(100) NULL,
        favicon_url TEXT NULL,
        segmento VARCHAR(50) DEFAULT 'MODA_VESTUARIO',
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  console.log('✅ Estrutura de tabelas recriada com sucesso!');

  // 3. SEED DOS USUÁRIOS (EXATAMENTE 1 ADMIN, 1 GERENTE, 4 VENDEDORES/CAIXAS)
  console.log('👥 Inserindo equipe: 1 ADM, 1 Gerente e 4 Vendedores...');
  const senhaPadraoHash = await bcrypt.hash('123456', 10);

  const usuariosData = [
    { nome: 'Carlos Drumond de Andrade', email: 'admin@omnivarejo.com.br', cargo: 'ADMIN' },
    { nome: 'Consultoria Especializada', email: 'gerente@omnivarejo.com.br', cargo: 'GERENTE' },
    { nome: 'Ana Paula Silva', email: 'ana.caixa@omnivarejo.com.br', cargo: 'CAIXA' },
    { nome: 'Lucas Oliveira Ramos', email: 'lucas.caixa@omnivarejo.com.br', cargo: 'CAIXA' },
    { nome: 'Beatriz Mendes Lima', email: 'beatriz.caixa@omnivarejo.com.br', cargo: 'CAIXA' },
    { nome: 'Carlos Eduardo Santos', email: 'carlos.caixa@omnivarejo.com.br', cargo: 'CAIXA' },
  ];

  for (const u of usuariosData) {
    await db.execute(
      `INSERT INTO usuarios (nome, email, senha_hash, cargo, ativo) VALUES (?, ?, ?, ?, 1)`,
      [u.nome, u.email, senhaPadraoHash, u.cargo]
    );
  }
  console.log('   -> 6 usuários inseridos com sucesso (1 ADMIN, 1 GERENTE, 4 CAIXAS).');

  // 4. SEED DA CONFIGURAÇÃO DA EMPRESA
  console.log('🏢 Inserindo configuração da empresa OmniVarejo Enterprise...');
  await db.execute(`
    INSERT INTO configuracao_empresa (
      id, razao_social, nome_fantasia, cnpj, inscricao_estadual, telefone, email,
      logradouro, numero, complemento, bairro, cidade, uf, cep, regime_tributario,
      mensagem_cupom, logo_url, logo_texto, segmento
    ) VALUES (
      1,
      'Varejo Inteligente Comércio LTDA',
      'OmniVarejo Enterprise',
      '12.345.678/0001-90',
      '87.654.321',
      '(21) 3456-7890',
      'contato@omnivarejo.com.br',
      'Rua da Moda',
      '100',
      'Loja A - Enterprise Retail Suite',
      'Maracanã',
      'Rio de Janeiro',
      'RJ',
      '20271-110',
      'Simples Nacional',
      'Obrigado pela preferência! Trocas em até 30 dias com apresentação deste cupom fiscal.',
      '/logo.png',
      'OmniVarejo Enterprise',
      'MODA_VESTUARIO'
    )
  `);

  // 5. SEED DE CATEGORIAS E SUBCATEGORIAS
  console.log('🏷️ Inserindo categorias e subcategorias de moda...');
  const categoriasLista = [
    { id: 1, nome: 'Masculino', slug: 'masculino', desc: 'Roupas e peças exclusivas para o público masculino', icone: 'Shirt', cor: '#3b82f6' },
    { id: 2, nome: 'Feminino', slug: 'feminino', desc: 'Tendências e coleções para o público feminino', icone: 'Sparkles', cor: '#ec4899' },
    { id: 3, nome: 'Alfaiataria & Social', slug: 'alfaiataria', desc: 'Ternos, blazers e camisas sociais de fino acabamento', icone: 'Briefcase', cor: '#8b5cf6' },
    { id: 4, nome: 'Denim & Jeans', slug: 'denim-jeans', desc: 'Linha completa em jeans, jaquetas e sarja premium', icone: 'Layers', cor: '#0ea5e9' },
    { id: 5, nome: 'Acessórios', slug: 'acessorios', desc: 'Cintos em couro legítimo, carteiras, bonés e gravatas', icone: 'Glasses', cor: '#f59e0b' },
    { id: 6, nome: 'Calçados', slug: 'calcados', desc: 'Tênis urbanos, sapatos sociais e mocassins confortáveis', icone: 'Footprints', cor: '#10b981' },
    { id: 7, nome: 'Infantil & Teen', slug: 'infantil', desc: 'Moda jovem, confortável e durável', icone: 'Smile', cor: '#14b8a6' },
  ];

  for (const c of categoriasLista) {
    await db.execute(
      `INSERT INTO categorias (id, nome, slug, descricao, icone, cor, ativo) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [c.id, c.nome, c.slug, c.desc, c.icone, c.cor]
    );
  }

  const subcategoriasLista = [
    { catId: 1, nome: 'Camisetas', slug: 'camisetas' },
    { catId: 1, nome: 'Camisas Polo', slug: 'polos' },
    { catId: 1, nome: 'Bermudas', slug: 'bermudas' },
    { catId: 2, nome: 'Vestidos', slug: 'vestidos' },
    { catId: 2, nome: 'Saias', slug: 'saias' },
    { catId: 2, nome: 'Blusas e Tops', slug: 'blusas' },
    { catId: 3, nome: 'Blazers', slug: 'blazers' },
    { catId: 3, nome: 'Camisas Sociais', slug: 'camisas-sociais' },
    { catId: 3, nome: 'Calças Alfaiataria', slug: 'calcas-alfaiataria' },
    { catId: 4, nome: 'Calças Jeans Slim', slug: 'jeans-slim' },
    { catId: 4, nome: 'Calças Jeans Straight', slug: 'jeans-straight' },
    { catId: 4, nome: 'Jaquetas Jeans', slug: 'jaquetas-jeans' },
    { catId: 5, nome: 'Cintos de Couro', slug: 'cintos' },
    { catId: 5, nome: 'Bonés e Chapéus', slug: 'bones' },
    { catId: 5, nome: 'Meias e Underwear', slug: 'meias' },
    { catId: 6, nome: 'Tênis Casual', slug: 'tenis-casual' },
    { catId: 6, nome: 'Sapato Social', slug: 'sapato-social' },
    { catId: 7, nome: 'Conjuntos Infantis', slug: 'conjuntos-infantis' },
  ];

  for (const s of subcategoriasLista) {
    await db.execute(
      `INSERT INTO subcategorias (categoria_id, nome, slug, descricao, ativo) VALUES (?, ?, ?, '', 1)`,
      [s.catId, s.nome, s.slug]
    );
  }
  console.log(`   -> ${categoriasLista.length} categorias e ${subcategoriasLista.length} subcategorias criadas.`);

  // 6. SEED DE MAIS DE 30 PRODUTOS COMPLETOS COM VARIAÇÕES
  console.log('👗 Inserindo mais de 30 produtos ricos com variações de cores, tamanhos e ficha técnica...');

  const produtosData = [
    // 101 - 105
    {
      codigo: '101',
      descricao: 'Camiseta Algodão Egípcio Pima Slim',
      categoria: 'Masculino',
      subcategoria: 'Camisetas',
      preco: 89.90,
      preco_custo: 38.00,
      estoque: 65,
      cores: JSON.stringify(['Preto Ônix', 'Chumbo', 'Grafite Escuro']),
      tamanhos: JSON.stringify(['P', 'M', 'G', 'GG']),
      tipo: 'Algodão Pima Fio 40.1',
      detalhes: '100% Algodão Pima Peruano fio 40.1 penteado. Costura reforçada ombro a ombro com toque suave aveludado e caimento slim moderno.',
      imagens: JSON.stringify(['/products/101.jpg']),
      marca: 'MS² Premium',
      codigo_barras: '7891010010015'
    },
    {
      codigo: '102',
      descricao: 'Camiseta Regular Fit Sustentável BCI',
      categoria: 'Masculino',
      subcategoria: 'Camisetas',
      preco: 59.90,
      preco_custo: 24.50,
      estoque: 90,
      cores: JSON.stringify(['Branco Puro', 'Off-White', 'Bege Areia']),
      tamanhos: JSON.stringify(['P', 'M', 'G', 'GG', 'XG']),
      tipo: 'Regular Fit Conforto',
      detalhes: 'Algodão sustentável com certificação BCI internacional. Antipilling de alta durabilidade e gola com elastano que não esgarça.',
      imagens: JSON.stringify(['/products/102.jpg']),
      marca: 'MS² Essencial',
      codigo_barras: '7891010010022'
    },
    {
      codigo: '103',
      descricao: 'Calça Jeans Slim Fit Raw Denim Stretch',
      categoria: 'Denim & Jeans',
      subcategoria: 'Calças Jeans Slim',
      preco: 159.90,
      preco_custo: 72.00,
      estoque: 48,
      cores: JSON.stringify(['Azul Marinho Índigo', 'Preto Denim']),
      tamanhos: JSON.stringify(['38', '40', '42', '44', '46', '48']),
      tipo: 'Slim Stretch 2% Elastano',
      detalhes: '98% Algodão e 2% Elastano de alta recuperação. Lavagem eco-wash sem uso agressivo de água, costuras reforçadas e rebites em latão.',
      imagens: JSON.stringify(['/products/103.jpg']),
      marca: 'MS² Denim Co.',
      codigo_barras: '7891010010039'
    },
    {
      codigo: '104',
      descricao: 'Jaqueta Jeans Trucker Vintage 12.5oz',
      categoria: 'Denim & Jeans',
      subcategoria: 'Jaquetas Jeans',
      preco: 249.90,
      preco_custo: 110.00,
      estoque: 28,
      cores: JSON.stringify(['Azul Médio Estonado', 'Preto Envelhecido']),
      tamanhos: JSON.stringify(['P', 'M', 'G', 'GG']),
      tipo: 'Trucker Clássica 12.5oz',
      detalhes: 'Denim encorpado 12.5 onças com lavagem estonada artesanal. Botões oxidado personalizados MS² e bolsos frontais com aba de segurança.',
      imagens: JSON.stringify(['/products/104.jpg']),
      marca: 'MS² Denim Co.',
      codigo_barras: '7891010010046'
    },
    {
      codigo: '105',
      descricao: 'Vestido Midi Fluido Manga Bufante',
      categoria: 'Feminino',
      subcategoria: 'Vestidos',
      preco: 189.90,
      preco_custo: 78.00,
      estoque: 35,
      cores: JSON.stringify(['Verde Botânico', 'Floral Primavera', 'Terracota']),
      tamanhos: JSON.stringify(['PP', 'P', 'M', 'G']),
      tipo: 'Midi Evasê com Fenda',
      detalhes: 'Viscose maquinetada de alta gramatura com toque acetinado. Decote em V com lastex traseiro para ajuste perfeito à silhueta.',
      imagens: JSON.stringify(['/products/105.jpg']),
      marca: 'MS² Mulher',
      codigo_barras: '7891010010053'
    },

    // 106 - 110
    {
      codigo: '106',
      descricao: 'Boné Dad Hat 6 Painéis Strapback',
      categoria: 'Acessórios',
      subcategoria: 'Bonés e Chapéus',
      preco: 69.90,
      preco_custo: 26.00,
      estoque: 70,
      cores: JSON.stringify(['Preto Ônix', 'Cáqui Deserto', 'Verde Militar']),
      tamanhos: JSON.stringify(['Único Regulável']),
      tipo: 'Dad Hat Sarja 100% Algodão',
      detalhes: 'Sarja peletizada 100% algodão com fecho strapback em metal niquelado. Ilhoses bordados para respirabilidade e aba curva moderna.',
      imagens: JSON.stringify(['/products/106.jpg']),
      marca: 'MS² Urban',
      codigo_barras: '7891010010060'
    },
    {
      codigo: '107',
      descricao: 'Cinto Masculino em Couro Legítimo Dupla Face',
      categoria: 'Acessórios',
      subcategoria: 'Cintos de Couro',
      preco: 99.90,
      preco_custo: 42.00,
      estoque: 50,
      cores: JSON.stringify(['Preto / Marrom Havana']),
      tamanhos: JSON.stringify(['95cm', '100cm', '105cm', '110cm']),
      tipo: 'Dupla Face Giratória',
      detalhes: 'Couro legítimo bovino com acabamento escovado. Fivela de engate giratório que permite alternar entre lado preto e marrom facilmente.',
      imagens: JSON.stringify(['/products/107.jpg']),
      marca: 'MS² Acessórios',
      codigo_barras: '7891010010077'
    },
    {
      codigo: '108',
      descricao: 'Kit Meias Invisíveis Anatômicas (3 Pares)',
      categoria: 'Acessórios',
      subcategoria: 'Meias e Underwear',
      preco: 39.90,
      preco_custo: 14.00,
      estoque: 120,
      cores: JSON.stringify(['Sortido (Preto, Branco, Cinza)']),
      tamanhos: JSON.stringify(['38-43']),
      tipo: 'Invisível com Silicone no Calcanhar',
      detalhes: '78% Algodão, 19% Poliamida e 3% Elastodieno. Tira interna em silicone no calcanhar que impede a meia de escorregar no sapato.',
      imagens: JSON.stringify(['/products/108.jpg']),
      marca: 'MS² Essencial',
      codigo_barras: '7891010010084'
    },
    {
      codigo: '109',
      descricao: 'Camisa Polo Piquet Duplo Penteado',
      categoria: 'Masculino',
      subcategoria: 'Camisas Polo',
      preco: 119.90,
      preco_custo: 48.00,
      estoque: 55,
      cores: JSON.stringify(['Azul Petróleo', 'Vinho Bordô', 'Branco']),
      tamanhos: JSON.stringify(['P', 'M', 'G', 'GG', 'XG']),
      tipo: 'Piquet Tradicional 2 Botoes',
      detalhes: 'Algodão piquet encorpado de alta resistência. Gola e punhos com friso contrastante e peitilho reforçado com botões perolados.',
      imagens: JSON.stringify(['/products/109.jpg']),
      marca: 'MS² Polo Club',
      codigo_barras: '7891010010091'
    },
    {
      codigo: '110',
      descricao: 'Blazer Alfaiataria Masculino Slim Fit',
      categoria: 'Alfaiataria & Social',
      subcategoria: 'Blazers',
      preco: 349.90,
      preco_custo: 155.00,
      estoque: 22,
      cores: JSON.stringify(['Azul Marinho Real', 'Cinza Chumbo']),
      tamanhos: JSON.stringify(['46', '48', '50', '52', '54']),
      tipo: 'Slim Estruturado Forrado',
      detalhes: 'Tecido nobre de microfibra com toque de lã fria. Forro acetinado interno com dois bolsos para carteira e fendas traseiras duplas.',
      imagens: JSON.stringify(['/products/110.jpg']),
      marca: 'MS² Sartoria',
      codigo_barras: '7891010010107'
    },

    // 111 - 115
    {
      codigo: '111',
      descricao: 'Camisa Social Masculina Easy Iron Algodão',
      categoria: 'Alfaiataria & Social',
      subcategoria: 'Camisas Sociais',
      preco: 149.90,
      preco_custo: 62.00,
      estoque: 40,
      cores: JSON.stringify(['Azul Claro Maquinetado', 'Branco Ópera']),
      tamanhos: JSON.stringify(['1', '2', '3', '4', '5']),
      tipo: 'Colarinho Italiano Semi-Aberto',
      detalhes: '100% Algodão com tecnologia Easy Iron que facilita o passar. Barbelas embutidas no colarinho para manter a estrutura impecável.',
      imagens: JSON.stringify(['/products/111.jpg']),
      marca: 'MS² Sartoria',
      codigo_barras: '7891010010114'
    },
    {
      codigo: '112',
      descricao: 'Calça Alfaiataria Social Sarja com Elastano',
      categoria: 'Alfaiataria & Social',
      subcategoria: 'Calças Alfaiataria',
      preco: 169.90,
      preco_custo: 74.00,
      estoque: 38,
      cores: JSON.stringify(['Preto Clássico', 'Bege Fendi', 'Azul Noite']),
      tamanhos: JSON.stringify(['38', '40', '42', '44', '46', '48']),
      tipo: 'Corte Chino Alfaiataria',
      detalhes: 'Sarja acetinada 97% algodão e 3% elastano. Bolsos traseiros embutidos tipo faca e cós anatômico com forro de alfaiataria.',
      imagens: JSON.stringify(['/products/112.jpg']),
      marca: 'MS² Sartoria',
      codigo_barras: '7891010010121'
    },
    {
      codigo: '113',
      descricao: 'Saia Plissada Midi Cintura Alta',
      categoria: 'Feminino',
      subcategoria: 'Saias',
      preco: 139.90,
      preco_custo: 58.00,
      estoque: 30,
      cores: JSON.stringify(['Preto Metalizado', 'Dourado Champanhe', 'Verde Esmeralda']),
      tamanhos: JSON.stringify(['P', 'M', 'G']),
      tipo: 'Plissado Soleil Permanente',
      detalhes: 'Tecido leve com efeito plissado estruturado térmico permanente. Cós largo com elástico reforçado confortável e forro interno macio.',
      imagens: JSON.stringify(['/products/113.jpg']),
      marca: 'MS² Mulher',
      codigo_barras: '7891010010138'
    },
    {
      codigo: '114',
      descricao: 'Blusa Feminina Seda Modal Manga Curta',
      categoria: 'Feminino',
      subcategoria: 'Blusas e Tops',
      preco: 99.90,
      preco_custo: 41.00,
      estoque: 50,
      cores: JSON.stringify(['Off-White', 'Rosa Blush', 'Lavanda']),
      tamanhos: JSON.stringify(['P', 'M', 'G', 'GG']),
      tipo: 'Decote Canoa Elegante',
      detalhes: 'Fibra natural de modal e elastano. Toque gelado hipoalergênico e caimento fluido que combina tanto com jeans quanto alfaiataria.',
      imagens: JSON.stringify(['/products/114.jpg']),
      marca: 'MS² Mulher',
      codigo_barras: '7891010010145'
    },
    {
      codigo: '115',
      descricao: 'Bermuda Sarja Masculina Chino Casual',
      categoria: 'Masculino',
      subcategoria: 'Bermudas',
      preco: 109.90,
      preco_custo: 46.00,
      estoque: 60,
      cores: JSON.stringify(['Cáqui', 'Azul Marinho', 'Verde Oliva']),
      tamanhos: JSON.stringify(['38', '40', '42', '44', '46']),
      tipo: 'Chino Acima do Joelho',
      detalhes: 'Sarja peletizada amaciada pré-encolhida. Bolsos frontais retos e bolso embutido traseiro com botão personalizado.',
      imagens: JSON.stringify(['/products/115.jpg']),
      marca: 'MS² Casual',
      codigo_barras: '7891010010152'
    },

    // 116 - 120
    {
      codigo: '116',
      descricao: 'Tênis Casual Couro Legítimo Minimalista',
      categoria: 'Calçados',
      subcategoria: 'Tênis Casual',
      preco: 229.90,
      preco_custo: 105.00,
      estoque: 35,
      cores: JSON.stringify(['Branco Puro / Solado Caramelo', 'All Black']),
      tamanhos: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
      tipo: 'Sneaker Low Top Urbano',
      detalhes: 'Cabedal em couro bovino legítimo com costura reforçada ao solado. Palmilha anatômica em EVA expandido antimicrobiano.',
      imagens: JSON.stringify(['/products/116.jpg']),
      marca: 'MS² Footwear',
      codigo_barras: '7891010010169'
    },
    {
      codigo: '117',
      descricao: 'Sapato Social Masculino Oxford Verniz',
      categoria: 'Calçados',
      subcategoria: 'Sapato Social',
      preco: 279.90,
      preco_custo: 125.00,
      estoque: 25,
      cores: JSON.stringify(['Preto Verniz', 'Café Imperial']),
      tamanhos: JSON.stringify(['39', '40', '41', '42', '43']),
      tipo: 'Oxford Cap Toe Nobre',
      detalhes: 'Construção clássica Oxford em couro nobre selecionado. Solado em borracha antiderrapante com salto fachetado em madeira tratada.',
      imagens: JSON.stringify(['/products/117.jpg']),
      marca: 'MS² Sartoria',
      codigo_barras: '7891010010176'
    },
    {
      codigo: '118',
      descricao: 'Vestido Longo Estampado Boho Chic',
      categoria: 'Feminino',
      subcategoria: 'Vestidos',
      preco: 219.90,
      preco_custo: 89.00,
      estoque: 24,
      cores: JSON.stringify(['Estampa Paisley Terrosa', 'Azul Marrocos']),
      tamanhos: JSON.stringify(['P', 'M', 'G']),
      tipo: 'Longo Fluido com Babados',
      detalhes: 'Crepe chiffon forrado com toque leve e esvoaçante. Amarração com tassel no decote e mangas com punho elástico delicado.',
      imagens: JSON.stringify(['/products/118.jpg']),
      marca: 'MS² Mulher',
      codigo_barras: '7891010010183'
    },
    {
      codigo: '119',
      descricao: 'Calça Jeans Feminina Wide Leg Cintura Alta',
      categoria: 'Denim & Jeans',
      subcategoria: 'Calças Jeans Straight',
      preco: 179.90,
      preco_custo: 76.00,
      estoque: 42,
      cores: JSON.stringify(['Azul Céu Lavado', 'Branco Off-White']),
      tamanhos: JSON.stringify(['36', '38', '40', '42', '44']),
      tipo: 'Wide Leg Pantalona',
      detalhes: '100% Algodão sustentável sem elastano. Modelagem solta ampla das coxas até a barra que alonga a silhueta com extremo conforto.',
      imagens: JSON.stringify(['/products/119.jpg']),
      marca: 'MS² Denim Co.',
      codigo_barras: '7891010010190'
    },
    {
      codigo: '120',
      descricao: 'Cardigan Tricô Canelado Manga Longa',
      categoria: 'Feminino',
      subcategoria: 'Blusas e Tops',
      preco: 129.90,
      preco_custo: 54.00,
      estoque: 38,
      cores: JSON.stringify(['Creme Baunilha', 'Preto', 'Caramelo']),
      tamanhos: JSON.stringify(['P', 'M', 'G']),
      tipo: 'Tricô Fino com Botões Madrepérola',
      detalhes: 'Tricot canelado em fio modal com toque térmico aconchegante. Botões de madrepérola natural costurados com reforço duplo.',
      imagens: JSON.stringify(['/products/120.jpg']),
      marca: 'MS² Mulher',
      codigo_barras: '7891010010206'
    },

    // 121 - 125
    {
      codigo: '121',
      descricao: 'Conjunto Infantil Menino Moletom Flanelado',
      categoria: 'Infantil & Teen',
      subcategoria: 'Conjuntos Infantis',
      preco: 119.90,
      preco_custo: 48.00,
      estoque: 45,
      cores: JSON.stringify(['Azul Marinho / Cinza Mescla']),
      tamanhos: JSON.stringify(['4', '6', '8', '10', '12', '14']),
      tipo: 'Moletom 2 Peças (Blusão + Calça)',
      detalhes: 'Moletom com felpa interna quentinha e macia. Punhos elásticos e cós com cordão funcional que não aperta a barriga da criança.',
      imagens: JSON.stringify(['/products/121.jpg']),
      marca: 'MS² Kids',
      codigo_barras: '7891010010213'
    },
    {
      codigo: '122',
      descricao: 'Vestido Infantil Floral Rodado Algodão',
      categoria: 'Infantil & Teen',
      subcategoria: 'Conjuntos Infantis',
      preco: 89.90,
      preco_custo: 36.00,
      estoque: 40,
      cores: JSON.stringify(['Rosa Jardim', 'Amarelo Sol']),
      tamanhos: JSON.stringify(['2', '4', '6', '8', '10']),
      tipo: 'Rodado Trapézio com Laço',
      detalhes: 'Tricoline 100% algodão respirável com estampa digital exclusiva que não desbota. Forro macio anti-coceira na saia.',
      imagens: JSON.stringify(['/products/122.jpg']),
      marca: 'MS² Kids',
      codigo_barras: '7891010010220'
    },
    {
      codigo: '123',
      descricao: 'Gravata Tradicional Seda Jacquard Italiana',
      categoria: 'Acessórios',
      subcategoria: 'Camisas Sociais',
      preco: 79.90,
      preco_custo: 31.00,
      estoque: 60,
      cores: JSON.stringify(['Azul Marinho Micropadrão', 'Bordô Prata']),
      tamanhos: JSON.stringify(['Largura 7.5cm (Semi-Slim)']),
      tipo: 'Jacquard 1200 Pontos',
      detalhes: 'Tecelagem em jacquard de alta densidade 1200 pontos com entretela de lã dupla para nó encorpado e caimento reto sem torcer.',
      imagens: JSON.stringify(['/products/123.jpg']),
      marca: 'MS² Sartoria',
      codigo_barras: '7891010010237'
    },
    {
      codigo: '124',
      descricao: 'Carteira Masculina Slim em Couro com Bloqueio RFID',
      categoria: 'Acessórios',
      subcategoria: 'Cintos de Couro',
      preco: 89.90,
      preco_custo: 35.00,
      estoque: 55,
      cores: JSON.stringify(['Preto Fosco', 'Pinhão Envelhecido']),
      tamanhos: JSON.stringify(['Slim Compacta (8x10cm)']),
      tipo: 'Antifurto RFID Shield',
      detalhes: 'Couro legítimo com manta interna blindada que bloqueia leitura por aproximação (NFC/RFID) de cartões de crédito e débito.',
      imagens: JSON.stringify(['/products/124.jpg']),
      marca: 'MS² Acessórios',
      codigo_barras: '7891010010244'
    },
    {
      codigo: '125',
      descricao: 'Jaqueta Bomber Corta-Vento Repelente à Água',
      categoria: 'Masculino',
      subcategoria: 'Jaquetas Jeans',
      preco: 199.90,
      preco_custo: 82.00,
      estoque: 32,
      cores: JSON.stringify(['Preto Fosco', 'Verde Musgo', 'Cinza Chumbo']),
      tamanhos: JSON.stringify(['P', 'M', 'G', 'GG']),
      tipo: 'Bomber com Zíper Tratorado',
      detalhes: 'Nylon Ripstop impermeável com tratamento repelente a garoa e vento. Forro respirável em tela mesh e bolsos internos seguros.',
      imagens: JSON.stringify(['/products/125.jpg']),
      marca: 'MS² Urban',
      codigo_barras: '7891010010251'
    },

    // 126 - 130
    {
      codigo: '126',
      descricao: 'Colete Feminino Alfaiataria Risca de Giz',
      categoria: 'Alfaiataria & Social',
      subcategoria: 'Blazers',
      preco: 149.90,
      preco_custo: 61.00,
      estoque: 28,
      cores: JSON.stringify(['Preto Risca Branca', 'Cinza Mescla']),
      tamanhos: JSON.stringify(['PP', 'P', 'M', 'G']),
      tipo: 'Vest Alfaiataria Trend',
      detalhes: 'Alfaiataria estruturada com riscas de giz clássicas. Abotoamento frontal com 4 botões rajados e fivela traseira regulável.',
      imagens: JSON.stringify(['/products/126.jpg']),
      marca: 'MS² Sartoria',
      codigo_barras: '7891010010268'
    },
    {
      codigo: '127',
      descricao: 'Bolsa Tote Feminina Couro Ecológico Estruturada',
      categoria: 'Acessórios',
      subcategoria: 'Cintos de Couro',
      preco: 189.90,
      preco_custo: 78.00,
      estoque: 30,
      cores: JSON.stringify(['Nude Caramelo', 'Preto', 'Off-White']),
      tamanhos: JSON.stringify(['Grande (Cabe Notebook 14")']),
      tipo: 'Tote Bag com Alça Tiracolo Removível',
      detalhes: 'Poliuretano premium de alta resistência ao atrito. Compartimento acolchoado para notebook, divisória central com zíper e pés metálicos.',
      imagens: JSON.stringify(['/products/127.jpg']),
      marca: 'MS² Mulher',
      codigo_barras: '7891010010275'
    },
    {
      codigo: '128',
      descricao: 'Camisa Linho Puro Masculina Manga Longa',
      categoria: 'Masculino',
      subcategoria: 'Camisas Sociais',
      preco: 179.90,
      preco_custo: 76.00,
      estoque: 36,
      cores: JSON.stringify(['Branco Linho Natural', 'Azul Bebê', 'Cru']),
      tamanhos: JSON.stringify(['P', 'M', 'G', 'GG']),
      tipo: 'Colarinho Francês Desestruturado',
      detalhes: '100% Linho europeu lavado e amaciado. Fibra fresca e altamente respirável com textura natural característica do linho nobre.',
      imagens: JSON.stringify(['/products/128.jpg']),
      marca: 'MS² Sartoria',
      codigo_barras: '7891010010282'
    },
    {
      codigo: '129',
      descricao: 'Shorts Saia Alfaiataria Cintura Alta Botões',
      categoria: 'Feminino',
      subcategoria: 'Saias',
      preco: 119.90,
      preco_custo: 49.00,
      estoque: 34,
      cores: JSON.stringify(['Off-White', 'Preto', 'Pink Fúcsia']),
      tamanhos: JSON.stringify(['36', '38', '40', '42']),
      tipo: 'Frente Transpassada com Shorts Interno',
      detalhes: 'Visual sofisticado de saia com a segurança e o conforto do shorts embutido por baixo. Tecido crepe twill encorpado que não marca.',
      imagens: JSON.stringify(['/products/129.jpg']),
      marca: 'MS² Mulher',
      codigo_barras: '7891010010299'
    },
    {
      codigo: '130',
      descricao: 'Moletom Canguru Unissex Heavyweight 3 Cabos',
      categoria: 'Masculino',
      subcategoria: 'Camisetas',
      preco: 169.90,
      preco_custo: 69.00,
      estoque: 50,
      cores: JSON.stringify(['Preto', 'Mescla Cinza', 'Verde Floresta']),
      tamanhos: JSON.stringify(['P', 'M', 'G', 'GG', 'XG']),
      tipo: 'Heavyweight Streetwear 400g/m²',
      detalhes: 'Moletom 3 cabos de altíssima gramatura (400g/m²). Capuz forrado com cadarço roliço de algodão e bolso frontal canguru reforçado.',
      imagens: JSON.stringify(['/products/130.jpg']),
      marca: 'MS² Urban',
      codigo_barras: '7891010010305'
    },

    // 131 - 135 (Total 35 produtos!)
    {
      codigo: '131',
      descricao: 'Mocassim Masculino Couro Nobuck Loafer',
      categoria: 'Calçados',
      subcategoria: 'Sapato Social',
      preco: 219.90,
      preco_custo: 95.00,
      estoque: 26,
      cores: JSON.stringify(['Azul Marinho Nobuck', 'Areia Safari']),
      tamanhos: JSON.stringify(['39', '40', '41', '42', '43']),
      tipo: 'Penny Loafer sem Cadarço',
      detalhes: 'Couro legítimo nobuck macio com palmilha acolchoada em espuma de memória. Solado flexível em borracha tratorada de alta aderência.',
      imagens: JSON.stringify(['/products/131.jpg']),
      marca: 'MS² Footwear',
      codigo_barras: '7891010010312'
    },
    {
      codigo: '132',
      descricao: 'Regata Feminina Ribana Canelada Alça Larga',
      categoria: 'Feminino',
      subcategoria: 'Blusas e Tops',
      preco: 49.90,
      preco_custo: 18.00,
      estoque: 80,
      cores: JSON.stringify(['Preto', 'Branco', 'Cinza Mescla', 'Marrom']),
      tamanhos: JSON.stringify(['PP', 'P', 'M', 'G']),
      tipo: 'Ribana 95% Algodão 5% Elastano',
      detalhes: 'Canelado estruturado que se molda confortavelmente ao corpo. Alça larga que cobre perfeitamente o sutiã com acabamento viés fino.',
      imagens: JSON.stringify(['/products/132.jpg']),
      marca: 'MS² Essencial',
      codigo_barras: '7891010010329'
    },
    {
      codigo: '133',
      descricao: 'Bermuda Jeans Masculina Destroyed Rasgos',
      categoria: 'Denim & Jeans',
      subcategoria: 'Bermudas',
      preco: 129.90,
      preco_custo: 55.00,
      estoque: 44,
      cores: JSON.stringify(['Azul Claro Estonado']),
      tamanhos: JSON.stringify(['38', '40', '42', '44', '46']),
      tipo: 'Destroyed com Barra Dobrada',
      detalhes: 'Denim 100% algodão com puídos e rasgos manuais protegidos por forro interno para não alargar com o uso. Lavagem sky wash moderna.',
      imagens: JSON.stringify(['/products/133.jpg']),
      marca: 'MS² Denim Co.',
      codigo_barras: '7891010010336'
    },
    {
      codigo: '134',
      descricao: 'Cachecol Xadrez em Lã Merino Toque Macio',
      categoria: 'Acessórios',
      subcategoria: 'Camisas Sociais',
      preco: 89.90,
      preco_custo: 34.00,
      estoque: 35,
      cores: JSON.stringify(['Xadrez Tartan Vermelho/Marinho', 'Cinza/Preto']),
      tamanhos: JSON.stringify(['180 x 30 cm']),
      tipo: 'Lã Merino com Franjas Artesanais',
      detalhes: 'Lã merino sintética hipoalergênica com toque idêntico ao cashmere. Excelente proteção térmica contra ventos frios com franjas torcidas.',
      imagens: JSON.stringify(['/products/134.jpg']),
      marca: 'MS² Acessórios',
      codigo_barras: '7891010010343'
    },
    {
      codigo: '135',
      descricao: 'Suéter Masculino Gola V Algodão e Caxemira',
      categoria: 'Masculino',
      subcategoria: 'Camisetas',
      preco: 159.90,
      preco_custo: 68.00,
      estoque: 32,
      cores: JSON.stringify(['Azul Marinho', 'Bordô', 'Cinza Grafite']),
      tamanhos: JSON.stringify(['P', 'M', 'G', 'GG']),
      tipo: 'Gola V para Sobreposição',
      detalhes: 'Tricot nobre fino 90% algodão e 10% caxemira. Perfeito para sobrepor sobre camisas sociais sem fazer volume no paletó.',
      imagens: JSON.stringify(['/products/135.jpg']),
      marca: 'MS² Sartoria',
      codigo_barras: '7891010010350'
    }
  ];

  for (const p of produtosData) {
    await db.execute(
      `INSERT INTO produtos (
        codigo, descricao, categoria, subcategoria, preco, preco_custo, estoque,
        estoque_minimo, unidade_medida, cores, tamanhos, tipo, detalhes, imagens,
        codigo_barras, marca, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 10, 'UN', ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        p.codigo, p.descricao, p.categoria, p.subcategoria, p.preco, p.preco_custo,
        p.estoque, p.cores, p.tamanhos, p.tipo, p.detalhes, p.imagens,
        p.codigo_barras, p.marca
      ]
    );
  }
  console.log(`   -> ${produtosData.length} produtos completos e enriquecidos inseridos com sucesso!`);

  // 7. SEED DE MAIS DE 40 CLIENTES COM CPF VÁLIDO (MÓDULO 11)
  console.log('👤 Inserindo 45 clientes reais com CPFs válidos homologados...');

  const nomesClientes = [
    'Mariana Ribeiro de Castro', 'Guilherme Albuquerque', 'Juliana Moreira Neves',
    'Rodrigo Barbosa Ferreira', 'Camila Vasconcelos', 'Felipe Guimarães Rocha',
    'Tatiane Farias Martins', 'Thiago Siqueira Lopes', 'Larissa Duarte Pires',
    'Eduardo Nogueira Ramos', 'Vanessa Toledo Campos', 'Gustavo Henrique Dias',
    'Renata Paiva Brandão', 'Leonardo Silveira Matos', 'Bruna Carvalho Peixoto',
    'Alexandre Frota Menezes', 'Fernanda Castilho Abreu', 'Bruno Antunes Vieira',
    'Patrícia Medeiros Cunha', 'Diego Sales Pinheiro', 'Sabrina Costa Magalhães',
    'Vinícius Rezende Moura', 'Aline Prado Figueiredo', 'Rafael Dornelles Paes',
    'Mônica Vianna Teles', 'Leandro Borges Macedo', 'Priscila Cavalcante Rios',
    'Danilo Santana Corrêa', 'Natália Arruda Lemos', 'Caio Fontes Bittencourt',
    'Isabela Guedes Pacheco', 'Fábio Meireles Fontoura', 'Débora Coutinho Aguiar',
    'Murilo Esteves Dantas', 'Carolina Barcellos Maia', 'Arthur Bezerra Franco',
    'Amanda Linhares Godoy', 'Gestor Camargo Xavier', 'Letícia Gusmão Tavares',
    'Victor Meireles Salgado', 'Cláudia Fontoura Vidal', 'Igor Vasques Quintana',
    'Evelyn Padilha Muniz', 'Henrique Beltrão Fogaça', 'Jéssica Trindade Bueno'
  ];

  const clientesIds: number[] = [];
  for (let i = 0; i < nomesClientes.length; i++) {
    const nome = nomesClientes[i];
    // Base única para gerar CPF matemático válido
    const cpf = gerarCpfValido(148200100 + i * 17);
    const primeiroNome = nome.split(' ')[0].toLowerCase();
    const sobrenome = nome.split(' ')[1].toLowerCase();
    const email = `${primeiroNome}.${sobrenome}${i + 1}@gmail.com`;
    const ddd = [21, 11, 31, 41, 71, 19, 85][i % 7];
    const telefone = `(${ddd}) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [res]: any = await db.execute(
      `INSERT INTO clientes (nome, cpf, telefone, email, criado_em) VALUES (?, ?, ?, ?, datetime('now', '-${(nomesClientes.length - i) * 2} days'))`,
      [nome, cpf, telefone, email]
    );

    const insertedId = res?.insertId || (i + 1);
    clientesIds.push(insertedId);
  }
  console.log(`   -> ${nomesClientes.length} clientes cadastrados com CPF auditado.`);

  // 8. SEED DE MAIS DE 100 VENDAS REALISTAS NO PDV
  console.log('💳 Inserindo 110 vendas com snapshot de preços, auditoria de desconto e itens...');

  // Busca produtos recém-inseridos
  const [prodsDb]: any = await db.execute('SELECT id, preco, codigo, estoque FROM produtos');
  const prods = Array.isArray(prodsDb) ? prodsDb : [];

  // Vendedores caixas são os IDs 3, 4, 5, 6
  const caixasIds = [3, 4, 5, 6];
  const formasPagto = ['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO'];

  const totalVendasMeta = 110;
  for (let v = 1; v <= totalVendasMeta; v++) {
    const operadorId = caixasIds[v % caixasIds.length];
    
    // 70% das vendas com cliente fidelizado, 30% consumidor final (cliente_id = null)
    const comCliente = v % 3 !== 0;
    const clienteId = comCliente ? clientesIds[v % clientesIds.length] : null;

    // Data retroativa nos últimos 30 dias
    const diasAtras = Math.floor((totalVendasMeta - v) / 3.8);
    const hora = 9 + (v % 12);
    const minuto = (v * 7) % 60;
    const criadoEmStr = isSqlite
      ? `datetime('now', '-${diasAtras} days', '+${hora} hours', '+${minuto} minutes')`
      : `DATE_SUB(NOW(), INTERVAL ${diasAtras} DAY)`;

    // Escolhe de 1 a 4 produtos aleatórios para a venda
    const qtdItens = 1 + (v % 3);
    let subtotalVenda = 0;
    const itensParaInserir: any[] = [];

    for (let it = 0; it < qtdItens; it++) {
      const pIdx = (v * 3 + it * 5) % prods.length;
      const prod = prods[pIdx];
      const qtd = 1 + ((v + it) % 2); // 1 ou 2 peças
      const precoUnit = Number(prod.preco);
      const sub = precoUnit * qtd;
      subtotalVenda += sub;

      itensParaInserir.push({
        produto_id: prod.id,
        quantidade: qtd,
        preco_unitario: precoUnit,
        subtotal: sub
      });
    }

    subtotalVenda = Math.round(subtotalVenda * 100) / 100;

    // Regra de Desconto:
    // A cada 12 vendas, 1 tem desconto > 10% (aprovada pelo Gerente id=2, cumprindo Alçada Gerencial!)
    // Algumas poucas têm desconto de até 10%
    let desconto = 0;
    let gerenteAprovadorId: number | null = null;
    let statusVenda = 'CONCLUIDA';
    let motivoCancelamento: string | null = null;

    if (v % 12 === 0) {
      // Desconto de 15% (acima da alçada do caixa) -> requer Gerente Consultoria Especializada (id=2)
      desconto = Math.round(subtotalVenda * 0.15 * 100) / 100;
      gerenteAprovadorId = 2; // Gerente
    } else if (v % 5 === 0) {
      // Desconto de 5% concedido pelo operador
      desconto = Math.round(subtotalVenda * 0.05 * 100) / 100;
    }

    // A cada 35 vendas, 1 é cancelada com motivo formal (Estorno Auditado/Fechamento de Caixa)
    if (v % 35 === 0) {
      statusVenda = 'CANCELADA';
      motivoCancelamento = 'Cliente desistiu do pagamento após registro dos itens.';
      gerenteAprovadorId = 2; // Cancelamento auditado por gerente
    }

    const valorTotal = Math.max(0, Math.round((subtotalVenda - desconto) * 100) / 100);
    const formaPagto = formasPagto[(v * 2) % formasPagto.length];

    // Inserção do cabeçalho da venda
    const [resVenda]: any = await db.execute(
      `INSERT INTO vendas (
        usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total,
        forma_pagamento, status, motivo_cancelamento, criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${criadoEmStr})`,
      [operadorId, clienteId, gerenteAprovadorId, subtotalVenda, desconto, valorTotal, formaPagto, statusVenda, motivoCancelamento]
    );

    const vendaId = resVenda?.insertId || v;

    // Inserção dos itens da venda com snapshot de preço
    for (const item of itensParaInserir) {
      await db.execute(
        `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [vendaId, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal]
      );
    }
  }

  console.log(`   -> ${totalVendasMeta} vendas inseridas com sucesso e seus respectivos itens de venda.`);
  console.log('🎉 POPULAÇÃO DO BANCO DE DADOS CONCLUÍDA COM 100% DE SUCESSO!');
}

// Execução imediata se chamado via linha de comando
if (require.main === module || process.argv[1]?.includes('reset-and-seed-full')) {
  resetAndSeedDatabase()
    .then(() => {
      console.log('✅ Finalizado com sucesso!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Erro fatal durante reset e seed:', err);
      process.exit(1);
    });
}
