-- ====================================================================
-- SISTEMA DE GESTÃO E PDV - VERSÃO ESTUDO (`ms2_vestuario`)
-- DIALETO: MySQL 8.0+ (InnoDB, UTF-8 Multibyte)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `ms2_vestuario`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ms2_vestuario`;

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

-- 1. Tabela de Usuários
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

-- 3. Tabela de Configuração da Empresa (Estudo - MS² Vestuário)
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
    segmento VARCHAR(60) DEFAULT 'VESTUARIO',
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
    CONSTRAINT fk_subcategorias_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
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
    INDEX idx_produtos_codigo (codigo),
    INDEX idx_produtos_codigo_barras (codigo_barras)
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
    CONSTRAINT fk_vendas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    CONSTRAINT fk_vendas_gerente FOREIGN KEY (gerente_aprovador_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabela de Itens de Venda
CREATE TABLE itens_venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_itens_venda_venda FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_itens_venda_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
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

-- SEEDS DA VERSÃO ESTUDO
INSERT INTO usuarios (id, nome, email, senha_hash, cargo, ativo) VALUES
(1, 'Carlos Mendes (Gerente)', 'gerente@ms2.com.br', '$2a$10$3CEqRzPdLXO63817ZI8ovuZqFjekHbSBYlhw85LDzIiUkl2B1zvSu', 'GERENTE', TRUE),
(2, 'Ana Silva (Caixa)', 'caixa@ms2.com.br', '$2a$10$b.tDzp0Gqi83HY9dZyn.SOQvRkctLdwbiw7NzZ9qcqmZX/3s8vo/a', 'CAIXA', TRUE),
(3, 'Administrador Geral (Admin)', 'admin@ms2.com.br', '$2a$10$3CEqRzPdLXO63817ZI8ovuZqFjekHbSBYlhw85LDzIiUkl2B1zvSu', 'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO clientes (id, nome, cpf, telefone, email) VALUES
(1, 'Mariana Souza', '529.982.247-25', '(21) 98888-1001', 'mariana.souza@email.com'),
(2, 'Lucas Pereira', '475.707.249-09', '(21) 97777-2002', 'lucas.pereira@email.com')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO configuracao_empresa (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, telefone, email, logradouro, numero, complemento, bairro, cidade, uf, cep, regime_tributario, mensagem_cupom, segmento)
VALUES (1, 'MS² Vestuário Comércio de Roupas LTDA', 'MS² Vestuário', '12.345.678/0001-90', '87.654.321', '(21) 3456-7890', 'contato@ms2vestuario.com.br', 'Rua da Moda', '100', 'Loja A - Firjan SENAI', 'Maracanã', 'Rio de Janeiro', 'RJ', '20271-110', 'Simples Nacional', 'Obrigado pela preferência! Trocas em até 30 dias com apresentação deste cupom.', 'VESTUARIO')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO categorias (id, nome, slug, descricao, icone, cor, ativo) VALUES
(1, 'Vestuário & Moda', 'vestuario-moda', 'Camisas, calças, vestidos e roupas em geral', 'Shirt', 'indigo', 1),
(2, 'Calçados & Sapatos', 'calcados-sapatos', 'Tênis esportivos, sapatos sociais e casuais', 'Footprints', 'teal', 1),
(3, 'Informática & Tecnologia', 'informatica-tecnologia', 'Hardware, periféricos, cabos e suprimentos', 'Cpu', 'blue', 1),
(4, 'Confeitaria & Panificação', 'confeitaria-panificacao', 'Bolos artesanais, tortas, pães e doces', 'Cake', 'amber', 1),
(5, 'Cosméticos & Beleza', 'cosmeticos-beleza', 'Skincare, perfumes, maquiagem e cuidados pessoais', 'Sparkles', 'rose', 1),
(6, 'Varejo Geral & Utilidades', 'varejo-geral', 'Utilidades domésticas, presentes e diversos', 'ShoppingBag', 'emerald', 1)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO subcategorias (id, categoria_id, nome, slug, descricao, ativo) VALUES
(1, 1, 'Camisas & Camisetas', 'camisas-camisetas', 'Camisetas gola redonda, camisas polo e botões', 1),
(2, 1, 'Calças & Jeans', 'calcas-jeans', 'Jeans stretch, alfaiataria e sarja', 1),
(3, 1, 'Vestidos & Saias', 'vestidos-saias', 'Vestidos fluídos, midi, longos e saias', 1),
(4, 1, 'Casacos & Jaquetas', 'casacos-jaquetas', 'Moletons, blazers e jaquetas', 1),
(5, 1, 'Acessórios da Moda', 'acessorios-moda', 'Bonés, cintos e meias', 1),
(6, 2, 'Tênis Esportivos & Casuais', 'tenis-esportivos', 'Running, academia e dia a dia', 1),
(7, 2, 'Sapatos Sociais', 'sapatos-sociais', 'Oxford, derby e mocassim', 1),
(8, 2, 'Sandálias & Chinelos', 'sandalias-chinelos', 'Conforto e descanso', 1),
(9, 2, 'Botas & Coturnos', 'botas-coturnos', 'Couro legítimo e proteção', 1),
(10, 3, 'Hardware & Peças', 'hardware-pecas', 'SSDs, memórias RAM, fontes e placas', 1),
(11, 3, 'Periféricos & Áudio', 'perifericos-audio', 'Mouses, teclados e headsets', 1),
(12, 3, 'Notebooks & Computadores', 'notebooks-computadores', 'Máquinas de escritório e gamers', 1),
(13, 3, 'Smartphones & Acessórios', 'smartphones-acessorios', 'Cabos, películas e carregadores', 1),
(14, 3, 'Cabos & Conectores', 'cabos-conectores', 'HDMI, DisplayPort e USB-C', 1),
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
(1, '101', 'Camiseta Básica Algodão Pima Preta', 'Vestuário & Moda', 'Camisas & Camisetas', 'Camiseta Pima', '["Preto Ônix", "Chumbo"]', '["P", "M", "G", "GG"]', '100% Algodão Pima Peruano fio 40.1 penteado.', '["/products/101.jpg"]', 'UN', '7891234560011', 'MS² Classic', 'Pima Fit', '90 dias', 45, 10, 22.00, 49.90, 1),
(2, '102', 'Camiseta Básica Algodão Branca Regular', 'Vestuário & Moda', 'Camisas & Camisetas', 'Camiseta Regular Fit', '["Branco Puro", "Off-White"]', '["P", "M", "G", "GG"]', 'Algodão sustentável com certificação BCI.', '["/products/102.jpg"]', 'UN', '7891234560028', 'MS² Classic', 'Regular Fit', '90 dias', 60, 15, 20.00, 49.90, 1),
(3, '103', 'Calça Jeans Slim Stretch Raw Denim', 'Vestuário & Moda', 'Calças & Jeans', 'Calça Jeans Stretch', '["Azul Escuro", "Raw Denim"]', '["38", "40", "42", "44"]', '98% Algodão, 2% Elastano. Lavagem amaciada eco-friendly.', '["/products/103.jpg"]', 'UN', '7891234560035', 'MS² Denim', 'Slim 5-Pockets', '90 dias', 32, 8, 75.00, 159.90, 1),
(4, '104', 'Jaqueta Jeans Trucker Vintage Unissex', 'Vestuário & Moda', 'Casacos & Jaquetas', 'Jaqueta Jeans Vintage', '["Azul Médio Estonado"]', '["P", "M", "G", "GG"]', 'Denim 12.5 oz resistente a abrasão.', '["/products/104.jpg"]', 'UN', '7891234560042', 'MS² Denim', 'Trucker Vintage', '90 dias', 18, 5, 110.00, 239.90, 1),
(5, '105', 'Vestido Midi Fluido Floral Primavera', 'Vestuário & Moda', 'Vestidos & Saias', 'Vestido Fluido Midi', '["Floral Primavera", "Verde Botânico"]', '["P", "M", "G"]', 'Viscose maquinetada de alta gramatura com toque acetinado.', '["/products/105.jpg"]', 'UN', '7891234560059', 'MS² Fashion', 'Midi Evasê', '90 dias', 24, 6, 80.00, 189.90, 1),
(6, '106', 'Boné Aba Curva Streetwear Dad Hat', 'Vestuário & Moda', 'Acessórios da Moda', 'Boné Dad Hat', '["Preto Ônix", "Cáqui"]', '["Único"]', 'Sarja peletizada 100% algodão com fecho strapback de metal.', '["/products/106.jpg"]', 'UN', '7891234560066', 'MS² Street', 'Dad Hat 6-Panel', '90 dias', 55, 12, 22.00, 59.90, 1),
(7, '107', 'Cinto de Couro Legítimo Escovado', 'Vestuário & Moda', 'Acessórios da Moda', 'Cinto Couro', '["Marrom Havana", "Caramelo"]', '["95cm", "105cm", "110cm"]', '100% Couro legítimo bovino com fivela metálica niquelada.', '["/products/107.jpg"]', 'UN', '7891234560073', 'MS² Leather', 'Classic Belt', '90 dias', 40, 10, 32.00, 79.90, 1),
(8, '108', 'Kit 3 Pares Meias Cano Médio Conforto', 'Vestuário & Moda', 'Acessórios da Moda', 'Kit Meias', '["Preto/Cinza/Branco"]', '["38-43"]', 'Composição: 78% Algodão, 19% Poliamida, 3% Elastodieno.', '["/products/108.jpg"]', 'PCT', '7891234560080', 'MS² Basic', 'Comfort 3-Pack', '90 dias', 80, 20, 12.00, 29.90, 1)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO vendas (id, usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total, forma_pagamento, detalhes_pagamento, status) VALUES
(1, 2, 1, NULL, 209.80, 20.98, 188.82, 'PIX', '{"metodo_principal":"PIX","chave_pix":"financeiro@ms2vestuario.com.br","txid_pix":"PIX-MS2-0001-A9F2"}', 'CONCLUIDA'),
(2, 1, 1, NULL, 239.90, 0.00, 239.90, 'CARTAO_CREDITO', '{"metodo_principal":"CARTAO_CREDITO","bandeira":"Mastercard","parcelas":2,"valor_parcela":119.95,"autorizacao_nsu":"849201"}', 'CONCLUIDA'),
(3, 2, 2, NULL, 189.90, 0.00, 189.90, 'DINHEIRO', '{"metodo_principal":"DINHEIRO","valor_entregue":200.00,"troco":10.10}', 'CONCLUIDA'),
(4, 2, NULL, NULL, 89.80, 0.00, 89.80, 'CARTAO_DEBITO', '{"metodo_principal":"CARTAO_DEBITO","bandeira":"Visa","autorizacao_nsu":"392104"}', 'CONCLUIDA')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 1, 1, 49.90, 49.90),
(2, 1, 3, 1, 159.90, 159.90),
(3, 2, 4, 1, 239.90, 239.90),
(4, 3, 5, 1, 189.90, 189.90),
(5, 4, 6, 1, 59.90, 59.90),
(6, 4, 8, 1, 29.90, 29.90)
ON DUPLICATE KEY UPDATE id=id;
