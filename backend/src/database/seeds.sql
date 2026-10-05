-- ====================================================================
-- SISTEMA DE GESTÃO E PDV - MS² VESTUÁRIO
-- SPRINT 1: DADOS INICIAIS DE TESTE E DEMONSTRAÇÃO (SEEDS)
-- DIALETO: MySQL 8.0+
-- ====================================================================

USE `ms2vest.db`;

-- 1. USUÁRIOS DE DEMONSTRAÇÃO (Bcrypt - custo 10)
-- 'admin123' -> $2b$10$yQrgu0aUje4wqsdTrIklHOIftuRavan2piHprQ0mMmS15KXcTOx8a
-- 'caixa123' -> $2b$10$0y4MCkVV6.2wSMvBdTxN2OZ4qvEBO8uDNfrfPtahknQHGP6uv8R4.

INSERT INTO usuarios (id, nome, email, senha_hash, cargo, ativo) VALUES
(1, 'Carlos Mendes (Gerente)', 'gerente@ms2.com.br', '$2b$10$yQrgu0aUje4wqsdTrIklHOIftuRavan2piHprQ0mMmS15KXcTOx8a', 'GERENTE', TRUE),
(2, 'Ana Silva (Caixa)', 'caixa@ms2.com.br', '$2b$10$0y4MCkVV6.2wSMvBdTxN2OZ4qvEBO8uDNfrfPtahknQHGP6uv8R4.', 'CAIXA', TRUE);

-- 2. CLIENTES DE DEMONSTRAÇÃO (RN-01 Unicidade de CPF)
INSERT INTO clientes (id, nome, cpf, telefone, email) VALUES
(1, 'Mariana Souza', '111.222.333-44', '(21) 98888-1001', 'mariana.souza@email.com'),
(2, 'Lucas Pereira', '555.666.777-88', '(21) 97777-2002', 'lucas.pereira@email.com');

-- 3. CATÁLOGO DE PRODUTOS DA MS² VESTUÁRIO
INSERT INTO produtos (id, codigo, descricao, categoria, preco, ativo) VALUES
(1, '101', 'Camiseta Básica Algodão Preta P', 'Vestuário', 49.90, TRUE),
(2, '102', 'Camiseta Básica Algodão Branca M', 'Vestuário', 49.90, TRUE),
(3, '103', 'Calça Jeans Slim Azul Escuro 40', 'Vestuário', 159.90, TRUE),
(4, '104', 'Jaqueta Jeans Trucker Unissex G', 'Vestuário', 239.90, TRUE),
(5, '105', 'Vestido Midi Floral Primavera M', 'Vestuário', 189.90, TRUE),
(6, '106', 'Boné Aba Curva Streetwear Preto', 'Acessórios', 59.90, TRUE),
(7, '107', 'Cinto de Couro Legítimo Marrom', 'Acessórios', 79.90, TRUE),
(8, '108', 'Kit 3 Pares de Meias Cano Médio', 'Acessórios', 29.90, TRUE);

-- 4. VENDA HOMOLOGADA DE EXEMPLO
-- Operadora Ana Silva (Caixa id 2) vendeu para Mariana Souza (Cliente id 1)
-- 1 Camiseta (R$ 49,90) + 1 Calça Jeans (R$ 159,90) = Subtotal R$ 209,80
-- Desconto padrão de 10% (R$ 20,98) -> Total Líquido: R$ 188,82 via PIX
INSERT INTO vendas (id, usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total, forma_pagamento, status) VALUES
(1, 2, 1, NULL, 209.80, 20.98, 188.82, 'PIX', 'CONCLUIDA');

INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 1, 1, 49.90, 49.90),
(2, 1, 3, 1, 159.90, 159.90);
