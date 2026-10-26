-- ====================================================================
-- SISTEMA DE GESTÃO E PDV - VERSÃO FINAL / WHITE-LABEL (`omnivarejo_db`)
-- DIALETO: MySQL 8.0+ (InnoDB, UTF-8 Multibyte)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `omnivarejo_db`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `omnivarejo_db`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS itens_venda;
DROP TABLE IF EXISTS vendas;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS subcategorias;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS configuracao_empresa;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS agenda_dashboard;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tabela de Usuários (White-Label)
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

-- 2. Tabela de Clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20) NULL,
    email VARCHAR(120) NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Configuração da Empresa (OmniVarejo Enterprise)
CREATE TABLE configuracao_empresa (
    id INT PRIMARY KEY DEFAULT 1,
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    inscricao_estadual VARCHAR(30) NULL,
    telefone VARCHAR(25) NULL,
    email VARCHAR(120) NULL,
    logradouro VARCHAR(120) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(60) NULL,
    bairro VARCHAR(60) NOT NULL,
    cidade VARCHAR(60) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    regime_tributario VARCHAR(50) DEFAULT 'Simples Nacional',
    mensagem_cupom TEXT NULL,
    logo_url LONGTEXT NULL,
    logo_texto VARCHAR(100) NULL,
    favicon_url LONGTEXT NULL,
    segmento VARCHAR(60) DEFAULT 'GERAL',
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela de Categorias
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    descricao TEXT NULL,
    icone VARCHAR(50) NULL,
    cor VARCHAR(30) NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabela de Subcategorias
CREATE TABLE subcategorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    descricao TEXT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_omni_subcategorias_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabela de Produtos Multi-Segmento
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(180) NOT NULL,
    categoria VARCHAR(100) NULL,
    subcategoria VARCHAR(100) NULL,
    tipo VARCHAR(100) NULL,
    cores JSON NULL,
    tamanhos JSON NULL,
    detalhes TEXT NULL,
    imagens JSON NULL,
    unidade_medida VARCHAR(10) DEFAULT 'UN',
    codigo_barras VARCHAR(50) NULL,
    marca VARCHAR(100) NULL,
    modelo VARCHAR(100) NULL,
    variacoes JSON NULL,
    garantia VARCHAR(60) NULL,
    data_validade VARCHAR(20) NULL,
    lote VARCHAR(50) NULL,
    estoque INT NOT NULL DEFAULT 50,
    estoque_minimo INT NOT NULL DEFAULT 10,
    preco_custo DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    preco DECIMAL(10, 2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_omni_produtos_codigo (codigo),
    INDEX idx_omni_produtos_codigo_barras (codigo_barras)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabela de Vendas
CREATE TABLE vendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    cliente_id INT NULL,
    gerente_aprovador_id INT NULL,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    desconto DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    forma_pagamento ENUM('DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX') NOT NULL,
    detalhes_pagamento TEXT NULL,
    status ENUM('CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'CONCLUIDA',
    motivo_cancelamento TEXT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_omni_vendas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_omni_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    CONSTRAINT fk_omni_vendas_gerente FOREIGN KEY (gerente_aprovador_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabela de Itens de Venda
CREATE TABLE itens_venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_omni_itens_venda_venda FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_omni_itens_venda_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabela da Agenda Dashboard
CREATE TABLE agenda_dashboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'evento',
    data_evento VARCHAR(20) NOT NULL,
    horario VARCHAR(10) NULL,
    valor_meta DECIMAL(10, 2) NULL,
    descricao TEXT NULL,
    concluido BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEEDS DA VERSÃO FINAL (100% WHITE-LABEL)
INSERT INTO usuarios (id, nome, email, senha_hash, cargo, ativo) VALUES
(1, 'Gerente Geral', 'gerente@empresa.com.br', '$2a$10$3CEqRzPdLXO63817ZI8ovuZqFjekHbSBYlhw85LDzIiUkl2B1zvSu', 'GERENTE', TRUE),
(2, 'Operador de Caixa', 'caixa@empresa.com.br', '$2a$10$b.tDzp0Gqi83HY9dZyn.SOQvRkctLdwbiw7NzZ9qcqmZX/3s8vo/a', 'CAIXA', TRUE),
(3, 'Administrador do Sistema', 'admin@empresa.com.br', '$2a$10$3CEqRzPdLXO63817ZI8ovuZqFjekHbSBYlhw85LDzIiUkl2B1zvSu', 'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO clientes (id, nome, cpf, telefone, email) VALUES
(1, 'Cliente Corporativo A', '123.456.789-01', '(11) 98888-0001', 'contato@cliente-a.com.br'),
(2, 'Cliente Premium B', '987.654.321-09', '(11) 97777-0002', 'financeiro@cliente-b.com.br')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO configuracao_empresa (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, telefone, email, logradouro, numero, complemento, bairro, cidade, uf, cep, regime_tributario, mensagem_cupom, segmento)
VALUES (1, 'OmniVarejo Soluções Comerciais LTDA', 'OmniVarejo Enterprise', '00.123.456/0001-78', '11.222.333', '(11) 3000-8000', 'contato@empresa.com.br', 'Avenida Paulista', '1000', 'Andar 15', 'Bela Vista', 'São Paulo', 'SP', '01310-100', 'Simples Nacional', 'Obrigado pela preferência! Trocas em até 30 dias com apresentação deste cupom.', 'GERAL')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO categorias (id, nome, slug, descricao, icone, cor, ativo) VALUES
(1, 'Informática & Tecnologia', 'informatica-tecnologia', 'Hardware, periféricos, cabos e suprimentos', 'Cpu', 'blue', 1),
(2, 'Vestuário & Moda', 'vestuario-moda', 'Camisas, calças, vestidos e roupas em geral', 'Shirt', 'indigo', 1),
(3, 'Calçados & Sapatos', 'calcados-sapatos', 'Tênis esportivos, sapatos sociais e casuais', 'Footprints', 'teal', 1),
(4, 'Confeitaria & Panificação', 'confeitaria-panificacao', 'Bolos artesanais, tortas, pães e doces', 'Cake', 'amber', 1),
(5, 'Cosméticos & Beleza', 'cosmeticos-beleza', 'Skincare, perfumes, maquiagem e cuidados pessoais', 'Sparkles', 'rose', 1),
(6, 'Varejo Geral & Utilidades', 'varejo-geral', 'Utilidades domésticas, presentes e diversos', 'ShoppingBag', 'emerald', 1)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO subcategorias (id, categoria_id, nome, slug, descricao, ativo) VALUES
(1, 1, 'Hardware & Peças', 'hardware-pecas', 'SSDs, memórias RAM, fontes e placas', 1),
(2, 1, 'Periféricos & Áudio', 'perifericos-audio', 'Mouses, teclados e headsets', 1),
(3, 1, 'Notebooks & Computadores', 'notebooks-computadores', 'Máquinas de escritório e gamers', 1),
(4, 1, 'Smartphones & Acessórios', 'smartphones-acessorios', 'Cabos, películas e carregadores', 1),
(5, 1, 'Cabos & Conectores', 'cabos-conectores', 'HDMI, DisplayPort e USB-C', 1),
(6, 2, 'Camisas & Camisetas', 'camisas-camisetas', 'Camisetas gola redonda, camisas polo e botões', 1),
(7, 2, 'Calças & Jeans', 'calcas-jeans', 'Jeans stretch, alfaiataria e sarja', 1),
(8, 2, 'Vestidos & Saias', 'vestidos-saias', 'Vestidos fluídos, midi, longos e saias', 1),
(9, 2, 'Casacos & Jaquetas', 'casacos-jaquetas', 'Moletons, blazers e jaquetas', 1),
(10, 2, 'Acessórios da Moda', 'acessorios-moda', 'Bonés, cintos e meias', 1),
(11, 3, 'Tênis Esportivos & Casuais', 'tenis-esportivos', 'Running, academia e dia a dia', 1),
(12, 3, 'Sapatos Sociais', 'sapatos-sociais', 'Oxford, derby e mocassim', 1),
(13, 3, 'Sandálias & Chinelos', 'sandalias-chinelos', 'Conforto e descanso', 1),
(14, 3, 'Botas & Coturnos', 'botas-coturnos', 'Couro legítimo e proteção', 1),
(15, 4, 'Bolos & Tortas', 'bolos-tortas', 'Bolos recheados e tortas artesanais', 1),
(16, 4, 'Pães & Fatias', 'paes-fatias', 'Pão francês, artesanal e fermentação natural', 1),
(17, 4, 'Doces Finos & Trufas', 'doces-finos', 'Brigadeiros gourmet e trufas belgas', 1),
(18, 4, 'Salgados & Quiches', 'salgados-quiches', 'Empadas, coxinhas e assados', 1),
(19, 4, 'Cafés & Bebidas', 'cafes-bebidas', 'Cafés especiais e sucos naturais', 1),
(20, 5, 'Cuidados com a Pele (Skincare)', 'skincare', 'Hidratantes e séruns faciais', 1),
(21, 5, 'Perfumes & Colônias', 'perfumes-colonias', 'Fragrâncias nacionais e importadas', 1),
(22, 5, 'Maquiagem & Batons', 'maquiagem-batons', 'Bases, batons e rímel', 1),
(23, 6, 'Utilidades Domésticas', 'utilidades-domesticas', 'Itens práticos para cozinha e lar', 1),
(24, 6, 'Presentes & Papelaria', 'presentes-papelaria', 'Artigos de presente e organização', 1)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO produtos (id, codigo, descricao, categoria, subcategoria, tipo, cores, tamanhos, detalhes, imagens, unidade_medida, codigo_barras, marca, modelo, garantia, estoque, estoque_minimo, preco_custo, preco, ativo) VALUES
(1, 'TECH-001', 'SSD NVMe PCIe 4.0 1TB Ultra Speed', 'Informática & Tecnologia', 'Hardware & Peças', 'SSD NVMe M.2 2280', '["Preto Grafite"]', '["1TB"]', 'Leitura até 7000 MB/s, dissipador térmico em grafeno.', '["/products/101.jpg"]', 'UN', '7898000000010', 'ApexTech', 'SpeedPro 1TB', '60 meses', 35, 5, 290.00, 489.90, 1),
(2, 'TECH-002', 'Teclado Mecânico RGB Switch Red ABNT2', 'Informática & Tecnologia', 'Periféricos & Áudio', 'Teclado Mecânico', '["Preto", "Branco"]', '["Padrão ABNT2"]', 'Switches mecânicos táteis silenciosos, anti-ghosting full key.', '["/products/102.jpg"]', 'UN', '7898000000027', 'VortexGear', 'K-900 Pro', '24 meses', 28, 6, 140.00, 279.90, 1),
(3, 'RUN-103', 'Tênis Esportivo Running Float Foam 41', 'Calçados & Sapatos', 'Tênis Esportivos & Casuais', 'Tênis Running', '["Preto / Laranja", "Azul Petróleo"]', '["39", "40", "41", "42", "43"]', 'Amortecimento com espuma injetada Float e solado antiderrapante.', '["/products/103.jpg"]', 'PAR', '7898000000034', 'AeroPace', 'Runner Pro V2', '6 meses', 40, 8, 120.00, 299.90, 1),
(4, 'CONF-204', 'Bolo Artesanal Trufado Belga 1.2kg', 'Confeitaria & Panificação', 'Bolos & Tortas', 'Bolo Recheado', '["Chocolate Belga"]', '["1.2 kg"]', 'Massa pão de ló com cacau 70% e cobertura trufada.', '["/products/104.jpg"]', 'KG', '7898000000041', 'Ateliê Gourmet', 'Trufado Especial', 'Consumir em 5 dias', 15, 3, 38.00, 95.00, 1),
(5, 'MODA-305', 'Camisa Casual Manga Longa Linho Puro', 'Vestuário & Moda', 'Camisas & Camisetas', 'Camisa Linho', '["Off-White", "Azul Céu"]', '["P", "M", "G", "GG"]', '100% Linho europeu pré-encolhido e botões em madrepérola.', '["/products/105.jpg"]', 'UN', '7898000000058', 'UrbanElegance', 'Pure Linen', '90 dias', 30, 8, 85.00, 199.90, 1),
(6, 'COSM-406', 'Sérum Facial Ácido Hialurônico 30ml', 'Cosméticos & Beleza', 'Cuidados com a Pele (Skincare)', 'Sérum Concentrado', '["Transparente"]', '["30 ml"]', 'Fórmula dermatologicamente testada com triplo peso molecular.', '["/products/106.jpg"]', 'UN', '7898000000065', 'DermaCare', 'HydraGlow 30ml', 'Validade 24 meses', 50, 10, 24.00, 69.90, 1)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO vendas (id, usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total, forma_pagamento, detalhes_pagamento, status) VALUES
(1, 2, 1, NULL, 489.90, 48.99, 440.91, 'PIX', '{"metodo_principal":"PIX","chave_pix":"financeiro@empresa.com.br","txid_pix":"PIX-OMNI-0001"}', 'CONCLUIDA'),
(2, 1, 2, NULL, 579.80, 0.00, 579.80, 'CARTAO_CREDITO', '{"metodo_principal":"CARTAO_CREDITO","bandeira":"Visa","parcelas":3,"valor_parcela":193.26,"autorizacao_nsu":"981240"}', 'CONCLUIDA')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 1, 1, 489.90, 489.90),
(2, 2, 2, 1, 279.90, 279.90),
(3, 2, 3, 1, 299.90, 299.90)
ON DUPLICATE KEY UPDATE id=id;
