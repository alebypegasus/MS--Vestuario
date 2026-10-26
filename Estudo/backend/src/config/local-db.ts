import { Database } from 'bun:sqlite';
import path from 'path';
import fs from 'fs';

// Arquivo do banco de dados local SQLite para persistência entre reinicializações
const DB_PATH = path.resolve(__dirname, '../../ms2vest-local.sqlite');

export class LocalDbAdapter {
  private static instance: Database | null = null;
  private static inTransaction = false;

  public static getDb(): Database {
    if (!this.instance) {
      this.instance = new Database(DB_PATH, { create: true });
      this.initSchemaAndSeeds(this.instance);
    }
    return this.instance;
  }

  private static initSchemaAndSeeds(db: Database) {
    db.run(`PRAGMA foreign_keys = ON;`);

    // 1. Tabela usuarios
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        cargo TEXT NOT NULL DEFAULT 'CAIXA',
        ativo INTEGER NOT NULL DEFAULT 1,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 2. Tabela clientes
    db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        telefone TEXT,
        email TEXT,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 3. Tabela produtos com todos os campos detalhados
    db.run(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL UNIQUE,
        descricao TEXT NOT NULL,
        categoria TEXT,
        subcategoria TEXT,
        tipo TEXT,
        cores TEXT,
        tamanhos TEXT,
        detalhes TEXT,
        imagens TEXT,
        unidade_medida TEXT DEFAULT 'UN',
        codigo_barras TEXT,
        marca TEXT,
        modelo TEXT,
        variacoes TEXT,
        garantia TEXT,
        data_validade TEXT,
        lote TEXT,
        estoque INTEGER NOT NULL DEFAULT 50,
        estoque_minimo INTEGER NOT NULL DEFAULT 10,
        preco_custo REAL NOT NULL DEFAULT 0.00,
        preco REAL NOT NULL,
        ativo INTEGER NOT NULL DEFAULT 1,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 4. Tabela configuracao_empresa
    db.run(`
      CREATE TABLE IF NOT EXISTS configuracao_empresa (
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
        segmento TEXT DEFAULT 'GERAL',
        atualizado_em TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 4.1 Tabela categorias dinâmicas (Multi-Ramo)
    db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
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

    // 4.2 Tabela subcategorias
    db.run(`
      CREATE TABLE IF NOT EXISTS subcategorias (
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

    // Migrações dinâmicas seguras para esquemas já existentes
    try { db.run('ALTER TABLE configuracao_empresa ADD COLUMN logo_url TEXT'); } catch {}
    try { db.run('ALTER TABLE configuracao_empresa ADD COLUMN logo_texto TEXT'); } catch {}
    try { db.run('ALTER TABLE configuracao_empresa ADD COLUMN favicon_url TEXT'); } catch {}
    try { db.run('ALTER TABLE configuracao_empresa ADD COLUMN segmento TEXT DEFAULT "GERAL"'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN tipo TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN cores TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN tamanhos TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN detalhes TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN imagens TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN estoque INTEGER DEFAULT 50'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN estoque_minimo INTEGER DEFAULT 10'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN preco_custo REAL DEFAULT 0.00'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN subcategoria TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN unidade_medida TEXT DEFAULT "UN"'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN codigo_barras TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN marca TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN modelo TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN variacoes TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN garantia TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN data_validade TEXT'); } catch {}
    try { db.run('ALTER TABLE produtos ADD COLUMN lote TEXT'); } catch {}

    // 5. Tabela vendas
    db.run(`
      CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
        gerente_aprovador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        subtotal REAL NOT NULL DEFAULT 0.00,
        desconto REAL NOT NULL DEFAULT 0.00,
        valor_total REAL NOT NULL DEFAULT 0.00,
        forma_pagamento TEXT NOT NULL,
        detalhes_pagamento TEXT,
        status TEXT NOT NULL DEFAULT 'CONCLUIDA',
        motivo_cancelamento TEXT,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        atualizado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 6. Tabela itens_venda
    db.run(`
      CREATE TABLE IF NOT EXISTS itens_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
        produto_id INTEGER NOT NULL REFERENCES produtos(id),
        quantidade INTEGER NOT NULL,
        preco_unitario REAL NOT NULL,
        subtotal REAL NOT NULL
      );
    `);

    // 7. Tabela agenda_dashboard (Eventos e metas do calendário)
    db.run(`
      CREATE TABLE IF NOT EXISTS agenda_dashboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'evento', -- 'meta', 'evento', 'estoque', 'auditoria'
        data_evento TEXT NOT NULL, -- YYYY-MM-DD
        horario TEXT,
        valor_meta REAL,
        descricao TEXT,
        concluido INTEGER NOT NULL DEFAULT 0,
        criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Verificar se já temos sementes inseridas
    const userCount = db.query(`SELECT COUNT(*) as total FROM usuarios`).get() as { total: number };
    if (userCount.total === 0) {
      console.log('🌱 Populando banco de dados local com seeds iniciais...');

      // 1. Usuários
      db.run(`
        INSERT INTO usuarios (id, nome, email, senha_hash, cargo, ativo) VALUES
        (1, 'Carlos Mendes (Gerente)', 'gerente@ms2.com.br', '$2a$10$3CEqRzPdLXO63817ZI8ovuZqFjekHbSBYlhw85LDzIiUkl2B1zvSu', 'GERENTE', 1),
        (2, 'Ana Silva (Caixa)', 'caixa@ms2.com.br', '$2a$10$b.tDzp0Gqi83HY9dZyn.SOQvRkctLdwbiw7NzZ9qcqmZX/3s8vo/a', 'CAIXA', 1),
        (3, 'Administrador Geral (Admin)', 'admin@ms2.com.br', '$2a$10$3CEqRzPdLXO63817ZI8ovuZqFjekHbSBYlhw85LDzIiUkl2B1zvSu', 'ADMIN', 1);
      `);

      // 2. Clientes
      db.run(`
        INSERT INTO clientes (id, nome, cpf, telefone, email) VALUES
        (1, 'Mariana Souza', '529.982.247-25', '(21) 98888-1001', 'mariana.souza@email.com'),
        (2, 'Lucas Pereira', '475.707.249-09', '(21) 97777-2002', 'lucas.pereira@email.com');
      `);

      // 3. Produtos enriquecidos (101 a 108)
      db.run(`
        INSERT INTO produtos (id, codigo, descricao, categoria, tipo, cores, tamanhos, detalhes, imagens, estoque, estoque_minimo, preco_custo, preco, ativo) VALUES
        (1, '101', 'Camiseta Básica Algodão Pima Preta', 'Vestuário', 'Camiseta Algodão Egípcio', '["Preto Ônix", "Chumbo", "Grafite"]', '["P", "M", "G", "GG"]', '100% Algodão Pima Peruano fio 40.1 penteado. Costura reforçada ombro a ombro com toque aveludado e caimento slim moderno.', '["/products/101.jpg"]', 45, 10, 22.00, 49.90, 1),
        (2, '102', 'Camiseta Básica Algodão Branca Regular', 'Vestuário', 'Camiseta Regular Fit', '["Branco Puro", "Off-White"]', '["P", "M", "G", "GG", "XG"]', 'Algodão sustentável com certificação BCI. Antipilling de alta durabilidade e gola com elastano que não deforma.', '["/products/102.jpg"]', 60, 15, 20.00, 49.90, 1),
        (3, '103', 'Calça Jeans Slim Stretch Raw Denim', 'Vestuário', 'Calça Jeans Stretch', '["Azul Escuro", "Raw Denim"]', '["38", "40", "42", "44", "46"]', '98% Algodão, 2% Elastano. Lavagem amaciada eco-friendly com pespontos contrastantes em ocre e bolsos traseiros reforçados.', '["/products/103.jpg"]', 32, 8, 75.00, 159.90, 1),
        (4, '104', 'Jaqueta Jeans Trucker Vintage Unissex', 'Vestuário', 'Jaqueta Jeans Vintage', '["Azul Médio Estonado"]', '["P", "M", "G", "GG"]', 'Denim 12.5 oz resistente a abrasão. Botões em metal oxidado personalizados com logo MS² e bolsos frontais utilitários.', '["/products/104.jpg"]', 18, 5, 110.00, 239.90, 1),
        (5, '105', 'Vestido Midi Fluido Floral Primavera', 'Vestuário', 'Vestido Fluido Midi', '["Floral Primavera", "Verde Botânico"]', '["P", "M", "G"]', 'Viscose maquinetada de alta gramatura com toque acetinado. Decote em V com fenda frontal discreta e forro respirável.', '["/products/105.jpg"]', 24, 6, 80.00, 189.90, 1),
        (6, '106', 'Boné Aba Curva Streetwear Dad Hat', 'Acessórios', 'Boné Dad Hat 6 Painéis', '["Preto Ônix", "Cáqui"]', '["Único"]', 'Sarja peletizada 100% algodão com fecho strapback de metal. Bordado frontal de alta definição.', '["/products/106.jpg"]', 55, 12, 22.00, 59.90, 1),
        (7, '107', 'Cinto de Couro Legítimo Escovado', 'Acessórios', 'Cinto Social e Casual', '["Marrom Havana", "Caramelo"]', '["95cm", "100cm", "105cm", "110cm"]', '100% Couro legítimo bovino com acabamento escovado nas bordas e fivela metálica niquelada fosca.', '["/products/107.jpg"]', 40, 10, 32.00, 79.90, 1),
        (8, '108', 'Kit 3 Pares de Meias Cano Médio Conforto', 'Acessórios', 'Kit Meias Respiráveis', '["Preto/Cinza/Branco"]', '["38-43"]', 'Composição: 78% Algodão, 19% Poliamida, 3% Elastodieno. Calcanhar verdadeiro anatômico com faixa de amortecimento.', '["/products/108.jpg"]', 80, 20, 12.00, 29.90, 1);
      `);

      // 4. Configuração Empresa
      db.run(`
        INSERT OR REPLACE INTO configuracao_empresa (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, telefone, email, logradouro, numero, complemento, bairro, cidade, uf, cep, regime_tributario, mensagem_cupom)
        VALUES (1, 'MS² Vestuário Comércio de Roupas LTDA', 'MS² Vestuário', '12.345.678/0001-90', '87.654.321', '(21) 3456-7890', 'contato@ms2vestuario.com.br', 'Rua da Moda', '100', 'Loja A - Firjan SENAI', 'Maracanã', 'Rio de Janeiro', 'RJ', '20271-110', 'Simples Nacional', 'Obrigado pela preferência! Trocas em até 30 dias com apresentação deste cupom fiscal.');
      `);

      // 5. Vendas Iniciais Homologadas
      db.run(`
        INSERT INTO vendas (id, usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total, forma_pagamento, detalhes_pagamento, status) VALUES
        (1, 2, 1, NULL, 209.80, 20.98, 188.82, 'PIX', '{"metodo_principal":"PIX","chave_pix":"financeiro@ms2vestuario.com.br","txid_pix":"PIX-MS2-0001-A9F2"}', 'CONCLUIDA'),
        (2, 1, 1, NULL, 239.90, 0.00, 239.90, 'CARTAO_CREDITO', '{"metodo_principal":"CARTAO_CREDITO","bandeira":"Mastercard","parcelas":2,"valor_parcela":119.95,"autorizacao_nsu":"849201"}', 'CONCLUIDA'),
        (3, 2, 2, NULL, 189.90, 0.00, 189.90, 'DINHEIRO', '{"metodo_principal":"DINHEIRO","valor_entregue":200.00,"troco":10.10}', 'CONCLUIDA'),
        (4, 2, NULL, NULL, 89.80, 0.00, 89.80, 'CARTAO_DEBITO', '{"metodo_principal":"CARTAO_DEBITO","bandeira":"Visa","autorizacao_nsu":"392104"}', 'CONCLUIDA');
      `);

      // 6. Itens de Venda
      db.run(`
        INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
        (1, 1, 1, 1, 49.90, 49.90),
        (2, 1, 3, 1, 159.90, 159.90),
        (3, 2, 4, 1, 239.90, 239.90),
        (4, 3, 5, 1, 189.90, 189.90),
        (5, 4, 6, 1, 59.90, 59.90),
        (6, 4, 8, 1, 29.90, 29.90);
      `);

      // 7. Eventos do Calendário Inicial
      db.run(`
        INSERT INTO agenda_dashboard (titulo, tipo, data_evento, horario, valor_meta, descricao) VALUES
        ('Chegada da Nova Coleção Inverno Pima', 'estoque', '2026-10-26', '09:30', NULL, 'Recebimento de 120 peças do fornecedor têxtil de algodão egípcio'),
        ('Meta Especial de Sábado', 'meta', '2026-10-25', '18:00', 8500.00, 'Meta de vendas do balcão para o final de semana'),
        ('Auditoria Fiscal e Fechamento de Caixa', 'auditoria', '2026-10-28', '19:00', NULL, 'Conferência cega e fechamento semanal de alçadas');
      `);

      console.log('✅ Banco de dados local inicializado e populado com sucesso!');
    }

    // 8. Inicializar Categorias e Subcategorias Multi-Ramo se vazias
    try {
      const catCount = db.query(`SELECT COUNT(*) as total FROM categorias`).get() as { total: number };
      if (catCount.total === 0) {
        db.run(`
          INSERT INTO categorias (id, nome, slug, descricao, icone, cor) VALUES
          (1, 'Vestuário & Moda', 'vestuario-moda', 'Roupas masculinas, femininas, infantis e moda casual/social', 'Shirt', '#4f46e5'),
          (2, 'Calçados & Sapatos', 'calcados-sapatos', 'Tênis, sapatos sociais, sandálias, botas e chinelos', 'Footprints', '#0891b2'),
          (3, 'Informática & Tecnologia', 'informatica-tecnologia', 'Hardware, computadores, celulares, cabos e periféricos', 'Laptop', '#2563eb'),
          (4, 'Confeitaria & Panificação', 'confeitaria-panificacao', 'Bolos, tortas, doces artesanais, salgados e pães frescos', 'Cake', '#f59e0b'),
          (5, 'Cosméticos & Beleza', 'cosmeticos-beleza', 'Perfumaria, maquiagens, estética e cuidados corporais', 'Sparkles', '#ec4899'),
          (6, 'Varejo Geral & Utilidades', 'varejo-geral', 'Artigos para casa, presentes, bazar e conveniência', 'Package', '#10b981');
        `);

        db.run(`
          INSERT INTO subcategorias (categoria_id, nome, slug, descricao) VALUES
          (1, 'Camisas & Camisetas', 'camisas-camisetas', 'Polos, regatas, camisas sociais e casuais'),
          (1, 'Calças & Jeans', 'calcas-jeans', 'Jeans, sarja, alfaiataria e moletom'),
          (1, 'Vestidos & Saias', 'vestidos-saias', 'Vestidos de festa, casuais e saias midi/curtas'),
          (1, 'Casacos & Jaquetas', 'casacos-jaquetas', 'Moletons, corta-vento, jaquetas de couro e blazers'),
          (1, 'Acessórios da Moda', 'acessorios-moda', 'Cintos, bonés, gravatas e meias'),
          (2, 'Tênis Esportivos & Casuais', 'tenis-esportivos', 'Running, academia, sneakers e casual'),
          (2, 'Sapatos Sociais', 'sapatos-sociais', 'Oxford, derby, mocassins e scarpins'),
          (2, 'Sandálias & Chinelos', 'sandalias-chinelos', 'Papetes, rasteirinhas e slides'),
          (2, 'Botas & Coturnos', 'botas-coturnos', 'Couro, camurça e cano curto/longo'),
          (3, 'Notebooks & Computadores', 'notebooks-computadores', 'Laptops, ultrabooks e desktops gamers/office'),
          (3, 'Smartphones & Acessórios', 'smartphones-acessorios', 'Aparelhos, capas, películas e carregadores'),
          (3, 'Periféricos & Áudio', 'perifericos-audio', 'Mouses, teclados mecânicos, fones e headsets'),
          (3, 'Hardware & Peças', 'hardware-pecas', 'Memória RAM, SSDs, placas de vídeo e fontes'),
          (3, 'Cabos & Conectores', 'cabos-conectores', 'HDMI, Type-C, cabos de rede e adaptadores'),
          (4, 'Bolos & Tortas', 'bolos-tortas', 'Bolos confeitados, tortas doces e naked cakes'),
          (4, 'Pães & Fatias', 'paes-fatias', 'Pães artesanais, bagquetes e pão francês'),
          (4, 'Doces Finos & Trufas', 'doces-finos', 'Brigadeiros gourmet, macarons e bombons'),
          (4, 'Salgados & Quiches', 'salgados-quiches', 'Coxinhas, empadas, folhados e quiches'),
          (4, 'Cafés & Bebidas', 'cafes-bebidas', 'Cafés especiais, cappuccinos e sucos naturais'),
          (5, 'Perfumes & Colônias', 'perfumes-colonias', 'Fragrâncias nacionais e importadas'),
          (5, 'Maquiagem & Batons', 'maquiagem-batons', 'Bases, corretivos, batons e sombras'),
          (5, 'Cuidados com a Pele (Skincare)', 'skincare', 'Hidratantes, protetor solar e séruns'),
          (6, 'Utilidades Domésticas', 'utilidades-domesticas', 'Copos, potes, térmicas e organizadores'),
          (6, 'Presentes & Papelaria', 'presentes-papelaria', 'Agendas, canecas, mochilas e lembranças');
        `);
        console.log('✅ Categorias e Subcategorias Multi-Ramo populadas com sucesso!');
      }
    } catch (e) {
      console.warn('⚠️  Não foi possível inicializar categorias locais:', e);
    }
  }

  /**
   * Executa query compatível com o retorno do mysql2: [rows] ou [resultHeader]
   */
  public static async execute(queryStr: string, params: any[] = []): Promise<[any, any]> {
    const db = this.getDb();
    const cleanSql = queryStr.trim();
    const isSelect = cleanSql.toUpperCase().startsWith('SELECT') || cleanSql.toUpperCase().startsWith('PRAGMA');
    const isShowColumns = cleanSql.toUpperCase().startsWith('SHOW COLUMNS FROM');

    if (isShowColumns) {
      const match = cleanSql.match(/SHOW COLUMNS FROM (\w+)/i);
      const tableName = match ? match[1] : 'produtos';
      const info = db.query(`PRAGMA table_info(${tableName})`).all() as any[];
      const cols = info.map(c => ({ Field: c.name, Type: c.type, Null: c.notnull ? 'NO' : 'YES' }));
      return [cols, null];
    }

    if (isSelect) {
      // Normalizar operadores booleanos para SQLite (TRUE -> 1, FALSE -> 0)
      let sql = cleanSql
        .replace(/\bTRUE\b/gi, '1')
        .replace(/\bFALSE\b/gi, '0');

      const stmt = db.query(sql);
      const rows = stmt.all(...params);
      return [rows, null];
    } else {
      // INSERT, UPDATE, DELETE
      let sql = cleanSql
        .replace(/\bTRUE\b/gi, '1')
        .replace(/\bFALSE\b/gi, '0')
        .replace(/ON DUPLICATE KEY UPDATE.*$/gi, ''); // SQLite já usou CREATE TABLE apropriado

      const stmt = db.prepare(sql);
      const result = stmt.run(...params);
      const header = {
        insertId: Number(result.lastInsertRowid),
        affectedRows: result.changes,
        warningStatus: 0
      };
      return [header, null];
    }
  }

  public static async getConnection() {
    return {
      execute: (sql: string, params: any[] = []) => this.execute(sql, params),
      query: (sql: string, params: any[] = []) => this.execute(sql, params),
      beginTransaction: async () => {
        this.getDb().run('BEGIN TRANSACTION;');
        this.inTransaction = true;
      },
      commit: async () => {
        if (this.inTransaction) {
          this.getDb().run('COMMIT;');
          this.inTransaction = false;
        }
      },
      rollback: async () => {
        if (this.inTransaction) {
          this.getDb().run('ROLLBACK;');
          this.inTransaction = false;
        }
      },
      release: () => {
        // Nada a liberar para SQLite local
      }
    };
  }
}
