-- ====================================================================
-- SISTEMA DE GESTÃO E PDV - MS² VESTUÁRIO
-- SPRINT 1: LINGUAGEM DE DEFINIÇÃO DE DADOS (DDL) & CARGA INICIAL (SEEDS)
-- DIALETO: PostgreSQL (Compatível com v13+)
-- ====================================================================

-- Limpeza preventiva de tabelas existentes (ordem inversa de dependência)
DROP TABLE IF EXISTS itens_venda CASCADE;
DROP TABLE IF EXISTS vendas CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- --------------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS (Operadores de Caixa e Gerentes)
-- --------------------------------------------------------------------
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_usuarios_cargo CHECK (cargo IN ('CAIXA', 'GERENTE'))
);

COMMENT ON TABLE usuarios IS 'Armazena credenciais e perfis de acesso para autenticação e alçadas.';
COMMENT ON COLUMN usuarios.cargo IS 'Define a alçada operacional: CAIXA ou GERENTE.';

-- --------------------------------------------------------------------
-- 2. TABELA DE CLIENTES (Base de Fidelização com CPF Único)
-- --------------------------------------------------------------------
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(120),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE clientes IS 'Base de clientes para registro de compras e fidelização.';
COMMENT ON COLUMN clientes.cpf IS 'Documento único (RN-01). Impede cadastros duplicados.';

-- --------------------------------------------------------------------
-- 3. TABELA DE PRODUTOS (Catálogo Digital de Vestuário e Acessórios)
-- --------------------------------------------------------------------
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(150) NOT NULL,
    categoria VARCHAR(50),
    preco NUMERIC(10, 2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_produtos_preco CHECK (preco >= 0.00)
);

COMMENT ON TABLE produtos IS 'Catálogo central de peças e acessórios da loja.';
COMMENT ON COLUMN produtos.ativo IS 'Soft delete para preservar integridade de vendas passadas.';

-- --------------------------------------------------------------------
-- 4. TABELA DE VENDAS (Cabeçalho da Transação do PDV)
-- --------------------------------------------------------------------
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    cliente_id INT,
    gerente_aprovador_id INT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    desconto NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    forma_pagamento VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONCLUIDA',
    motivo_cancelamento TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vendas_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_vendas_cliente 
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,

    CONSTRAINT fk_vendas_gerente_aprovador 
        FOREIGN KEY (gerente_aprovador_id) REFERENCES usuarios(id) ON DELETE SET NULL,

    CONSTRAINT chk_vendas_forma_pagamento 
        CHECK (forma_pagamento IN ('DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX')),

    CONSTRAINT chk_vendas_status 
        CHECK (status IN ('CONCLUIDA', 'CANCELADA')),

    CONSTRAINT chk_vendas_valores 
        CHECK (subtotal >= 0.00 AND desconto >= 0.00 AND valor_total >= 0.00)
);

COMMENT ON TABLE vendas IS 'Transações de venda realizadas no PDV.';
COMMENT ON COLUMN vendas.cliente_id IS 'Cliente associado. Se NULL, representa Consumidor Final (RN-06).';
COMMENT ON COLUMN vendas.gerente_aprovador_id IS 'Gerente que autorizou desconto > 10% ou cancelamento (RN-02 e RN-03).';

-- --------------------------------------------------------------------
-- 5. TABELA DE ITENS DA VENDA (Snapshot de Preço e Produtos Vendidos)
-- --------------------------------------------------------------------
CREATE TABLE itens_venda (
    id SERIAL PRIMARY KEY,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,

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
);

COMMENT ON TABLE itens_venda IS 'Linhas de produtos de cada venda com congelamento do preço histórico.';
COMMENT ON COLUMN itens_venda.preco_unitario IS 'Snapshot do preço no momento da venda (RN-04).';

-- --------------------------------------------------------------------
-- 6. ÍNDICES PARA CONSULTA DE ALTA PERFORMANCE (CHECKOUT RÁPIDO)
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

-- Senhas geradas com bcrypt (custo 10):
-- 'admin123' -> $2b$10$yQrgu0aUje4wqsdTrIklHOIftuRavan2piHprQ0mMmS15KXcTOx8a
-- 'caixa123' -> $2b$10$0y4MCkVV6.2wSMvBdTxN2OZ4qvEBO8uDNfrfPtahknQHGP6uv8R4.

INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES
('Carlos Mendes (Gerente)', 'gerente@ms2.com.br', '$2b$10$yQrgu0aUje4wqsdTrIklHOIftuRavan2piHprQ0mMmS15KXcTOx8a', 'GERENTE'),
('Ana Silva (Caixa)', 'caixa@ms2.com.br', '$2b$10$0y4MCkVV6.2wSMvBdTxN2OZ4qvEBO8uDNfrfPtahknQHGP6uv8R4.', 'CAIXA');

-- Clientes para demonstração da regra de CPF e busca rápida
INSERT INTO clientes (nome, cpf, telefone, email) VALUES
('Mariana Souza', '111.222.333-44', '(21) 98888-1001', 'mariana.souza@email.com'),
('Lucas Pereira', '555.666.777-88', '(21) 97777-2002', 'lucas.pereira@email.com');

-- Catálogo de Produtos da MS² Vestuário (códigos curtos facilitam teste da banca)
INSERT INTO produtos (codigo, descricao, categoria, preco) VALUES
('101', 'Camiseta Básica Algodão Preta P', 'Vestuário', 49.90),
('102', 'Camiseta Básica Algodão Branca M', 'Vestuário', 49.90),
('103', 'Calça Jeans Slim Azul Escuro 40', 'Vestuário', 159.90),
('104', 'Jaqueta Jeans Trucker Unissex G', 'Vestuário', 239.90),
('105', 'Vestido Midi Floral Primavera M', 'Vestuário', 189.90),
('106', 'Boné Aba Curva Streetwear Preto', 'Acessórios', 59.90),
('107', 'Cinto de Couro Legítimo Marrom', 'Acessórios', 79.90),
('108', 'Kit 3 Pares de Meias Cano Médio', 'Acessórios', 29.90);

-- Venda de Exemplo Homologada (Mariana comprou 1 Camiseta + 1 Calça Jeans com 10% de desconto no PIX)
-- Subtotal: 49.90 + 159.90 = 209.80 | Desconto 10%: 20.98 | Total: 188.82
INSERT INTO vendas (usuario_id, cliente_id, subtotal, desconto, valor_total, forma_pagamento, status) VALUES
(2, 1, 209.80, 20.98, 188.82, 'PIX', 'CONCLUIDA');

INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 1, 49.90, 49.90),
(1, 3, 1, 159.90, 159.90);
