-- ====================================================================
-- SISTEMA DE GESTÃO E PDV - MS² VESTUÁRIO
-- SPRINT 1: DADOS INICIAIS DE TESTE E DEMONSTRAÇÃO (SEEDS)
-- DIALETO: PostgreSQL (v13+)
-- ====================================================================

-- 1. USUÁRIOS DE DEMONSTRAÇÃO (Bcrypt - custo 10)
-- 'admin123' -> $2b$10$yQrgu0aUje4wqsdTrIklHOIftuRavan2piHprQ0mMmS15KXcTOx8a
-- 'caixa123' -> $2b$10$0y4MCkVV6.2wSMvBdTxN2OZ4qvEBO8uDNfrfPtahknQHGP6uv8R4.

INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES
('Carlos Mendes (Gerente)', 'gerente@ms2.com.br', '$2b$10$yQrgu0aUje4wqsdTrIklHOIftuRavan2piHprQ0mMmS15KXcTOx8a', 'GERENTE'),
('Ana Silva (Caixa)', 'caixa@ms2.com.br', '$2b$10$0y4MCkVV6.2wSMvBdTxN2OZ4qvEBO8uDNfrfPtahknQHGP6uv8R4.', 'CAIXA');

-- 2. CLIENTES DE DEMONSTRAÇÃO (RN-01 Unicidade de CPF)
INSERT INTO clientes (nome, cpf, telefone, email) VALUES
('Mariana Souza', '111.222.333-44', '(21) 98888-1001', 'mariana.souza@email.com'),
('Lucas Pereira', '555.666.777-88', '(21) 97777-2002', 'lucas.pereira@email.com');

-- 3. CATÁLOGO DE PRODUTOS DA MS² VESTUÁRIO
INSERT INTO produtos (codigo, descricao, categoria, preco) VALUES
('101', 'Camiseta Básica Algodão Preta P', 'Vestuário', 49.90),
('102', 'Camiseta Básica Algodão Branca M', 'Vestuário', 49.90),
('103', 'Calça Jeans Slim Azul Escuro 40', 'Vestuário', 159.90),
('104', 'Jaqueta Jeans Trucker Unissex G', 'Vestuário', 239.90),
('105', 'Vestido Midi Floral Primavera M', 'Vestuário', 189.90),
('106', 'Boné Aba Curva Streetwear Preto', 'Acessórios', 59.90),
('107', 'Cinto de Couro Legítimo Marrom', 'Acessórios', 79.90),
('108', 'Kit 3 Pares de Meias Cano Médio', 'Acessórios', 29.90);

-- 4. VENDA HOMOLOGADA DE EXEMPLO
-- Operadora Ana Silva (Caixa id 2) vendeu para Mariana Souza (Cliente id 1)
-- 1 Camiseta (R$ 49,90) + 1 Calça Jeans (R$ 159,90) = Subtotal R$ 209,80
-- Desconto padrão de 10% (R$ 20,98) -> Total Líquido: R$ 188,82 via PIX
INSERT INTO vendas (usuario_id, cliente_id, subtotal, desconto, valor_total, forma_pagamento, status) VALUES
(2, 1, 209.80, 20.98, 188.82, 'PIX', 'CONCLUIDA');

INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 1, 49.90, 49.90),
(1, 3, 1, 159.90, 159.90);
