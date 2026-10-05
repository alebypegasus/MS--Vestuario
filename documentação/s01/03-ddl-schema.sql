-- ====================================================================
-- SISTEMA DE GESTÃO E PDV - MS² VESTUÁRIO
-- SPRINT 1: LINGUAGEM DE DEFINIÇÃO DE DADOS (DDL) & CARGA INICIAL (SEEDS)
-- DIALETO: MySQL 8.0+ (Engine InnoDB, Charset utf8mb4)
-- ====================================================================

-- Criação e seleção do banco de dados
CREATE DATABASE IF NOT EXISTS `ms2vest.db`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ms2vest.db`;

-- Desativa temporariamente checagem de FK para permitir recriação limpa
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS itens_venda;
DROP TABLE IF EXISTS vendas;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS (Operadores de Caixa e Gerentes)
-- --------------------------------------------------------------------
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo ENUM('CAIXA', 'GERENTE') NOT NULL DEFAULT 'CAIXA' COMMENT 'Define a alçada operacional',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Credenciais e perfis de acesso';

-- --------------------------------------------------------------------
-- 2. TABELA DE CLIENTES (Base de Fidelização com CPF Único)
-- --------------------------------------------------------------------
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE COMMENT 'Documento único (RN-01). Impede cadastros duplicados',
    telefone VARCHAR(20) NULL,
    email VARCHAR(120) NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Base de clientes para registro de compras e fidelização';

-- --------------------------------------------------------------------
-- 3. TABELA DE PRODUTOS (Catálogo Digital de Vestuário e Acessórios)
-- --------------------------------------------------------------------
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código interno ou de barras para busca rápida',
    descricao VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NULL,
    preco DECIMAL(10, 2) NOT NULL COMMENT 'Preço de venda atual no catálogo',
    ativo BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Soft delete para preservar integridade de vendas passadas (RN-08)',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_produtos_preco CHECK (preco >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de peças e acessórios';

-- --------------------------------------------------------------------
-- 4. TABELA DE VENDAS (Cabeçalho da Transação do PDV)
-- --------------------------------------------------------------------
CREATE TABLE vendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL COMMENT 'Operador de caixa que efetuou a venda',
    cliente_id INT NULL COMMENT 'Cliente associado. Se NULL, representa Consumidor Final (RN-06)',
    gerente_aprovador_id INT NULL COMMENT 'Gerente que autorizou desconto > 10% ou cancelamento (RN-02 e RN-03)',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    desconto DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Valor monetário de desconto (RN-02)',
    valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Subtotal menos desconto (RN-07)',
    forma_pagamento ENUM('DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX') NOT NULL,
    status ENUM('CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'CONCLUIDA' COMMENT 'Status da transação (RN-05)',
    motivo_cancelamento TEXT NULL COMMENT 'Justificativa obrigatória em caso de cancelamento',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_vendas_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_vendas_cliente 
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,

    CONSTRAINT fk_vendas_gerente_aprovador 
        FOREIGN KEY (gerente_aprovador_id) REFERENCES usuarios(id) ON DELETE SET NULL,

    CONSTRAINT chk_vendas_valores 
        CHECK (subtotal >= 0.00 AND desconto >= 0.00 AND valor_total >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Transações de venda registradas no PDV';

-- --------------------------------------------------------------------
-- 5. TABELA DE ITENS DA VENDA (Snapshot de Preço Histórico)
-- --------------------------------------------------------------------
CREATE TABLE itens_venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL COMMENT 'Snapshot do preço no ato da venda (RN-04)',
    subtotal DECIMAL(10, 2) NOT NULL,

    CONSTRAINT fk_itens_venda_venda 
        FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,

    CONSTRAINT fk_itens_venda_produto 
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT,

    CONSTRAINT chk_itens_venda_quantidade 
        CHECK (quantidade > 0),

    CONSTRAINT chk_itens_venda_preco_unitario 
        CHECK (preco_unitario >= 0.00),

    CONSTRAINT chk_itens_venda_subtotal 
        CHECK (subtotal >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Linhas de produtos com congelamento de preço histórico';

-- --------------------------------------------------------------------
-- 6. ÍNDICES DE PERFORMANCE (BUSCAS RÁPIDAS NO PDV)
-- --------------------------------------------------------------------
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_descricao ON produtos(descricao);
CREATE INDEX idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX idx_vendas_usuario_id ON vendas(usuario_id);
CREATE INDEX idx_itens_venda_venda_id ON itens_venda(venda_id);

-- ====================================================================
-- 7. CARGA DE DADOS INICIAIS PARA TESTES E DEMONSTRAÇÃO (SEEDS)
-- ====================================================================

-- Usuários de teste (senhas em bcrypt - custo 10):
-- 'admin123' -> $2b$10$yQrgu0aUje4wqsdTrIklHOIftuRavan2piHprQ0mMmS15KXcTOx8a
-- 'caixa123' -> $2b$10$0y4MCkVV6.2wSMvBdTxN2OZ4qvEBO8uDNfrfPtahknQHGP6uv8R4.

INSERT INTO usuarios (id, nome, email, senha_hash, cargo, ativo) VALUES
(1, 'Carlos Mendes (Gerente)', 'gerente@ms2.com.br', '$2b$10$yQrgu0aUje4wqsdTrIklHOIftuRavan2piHprQ0mMmS15KXcTOx8a', 'GERENTE', TRUE),
(2, 'Ana Silva (Caixa)', 'caixa@ms2.com.br', '$2b$10$0y4MCkVV6.2wSMvBdTxN2OZ4qvEBO8uDNfrfPtahknQHGP6uv8R4.', 'CAIXA', TRUE);

-- Clientes para demonstração da regra de CPF e busca rápida
INSERT INTO clientes (id, nome, cpf, telefone, email) VALUES
(1, 'Mariana Souza', '111.222.333-44', '(21) 98888-1001', 'mariana.souza@email.com'),
(2, 'Lucas Pereira', '555.666.777-88', '(21) 97777-2002', 'lucas.pereira@email.com');

-- Catálogo de Produtos da MS² Vestuário
INSERT INTO produtos (id, codigo, descricao, categoria, preco, ativo) VALUES
(1, '101', 'Camiseta Básica Algodão Preta P', 'Vestuário', 49.90, TRUE),
(2, '102', 'Camiseta Básica Algodão Branca M', 'Vestuário', 49.90, TRUE),
(3, '103', 'Calça Jeans Slim Azul Escuro 40', 'Vestuário', 159.90, TRUE),
(4, '104', 'Jaqueta Jeans Trucker Unissex G', 'Vestuário', 239.90, TRUE),
(5, '105', 'Vestido Midi Floral Primavera M', 'Vestuário', 189.90, TRUE),
(6, '106', 'Boné Aba Curva Streetwear Preto', 'Acessórios', 59.90, TRUE),
(7, '107', 'Cinto de Couro Legítimo Marrom', 'Acessórios', 79.90, TRUE),
(8, '108', 'Kit 3 Pares de Meias Cano Médio', 'Acessórios', 29.90, TRUE);

-- Venda de Exemplo Homologada (Mariana comprou 1 Camiseta + 1 Calça Jeans com 10% de desconto no PIX)
-- Subtotal: 49.90 + 159.90 = 209.80 | Desconto 10%: 20.98 | Total Líquido: 188.82
INSERT INTO vendas (id, usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total, forma_pagamento, status) VALUES
(1, 2, 1, NULL, 209.80, 20.98, 188.82, 'PIX', 'CONCLUIDA');

INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 1, 1, 49.90, 49.90),
(2, 1, 3, 1, 159.90, 159.90);
