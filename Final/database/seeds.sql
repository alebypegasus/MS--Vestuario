-- ====================================================================
-- SISTEMA DE GESTÃO E PDV - OmniVarejo Enterprise
-- Release Pro 2.5: DADOS INICIAIS DE TESTE E DEMONSTRAÇÃO (SEEDS)
-- DIALETO: MySQL 8.0+
-- ====================================================================

USE `varejo_erp.db`;

-- 1. USUÁRIOS E FUNCIONÁRIOS DO SISTEMA (Bcrypt - custo 10)
-- 'admin123' -> $2a$10$3CEqRzPdLXO63817ZI8ovuZqFjekHbSBYlhw85LDzIiUkl2B1zvSu
-- 'caixa123' -> $2a$10$b.tDzp0Gqi83HY9dZyn.SOQvRkctLdwbiw7NzZ9qcqmZX/3s8vo/a

INSERT INTO usuarios (id, nome, email, senha_hash, cargo, ativo) VALUES
(1, 'Carlos Mendes (Gerente)', 'gerente@empresa.com.br', '$2a$10$3CEqRzPdLXO63817ZI8ovuZqFjekHbSBYlhw85LDzIiUkl2B1zvSu', 'GERENTE', TRUE),
(2, 'Ana Silva (Caixa)', 'caixa@empresa.com.br', '$2a$10$b.tDzp0Gqi83HY9dZyn.SOQvRkctLdwbiw7NzZ9qcqmZX/3s8vo/a', 'CAIXA', TRUE),
(3, 'Administrador Geral (Admin)', 'admin@empresa.com.br', '$2a$10$3CEqRzPdLXO63817ZI8ovuZqFjekHbSBYlhw85LDzIiUkl2B1zvSu', 'ADMIN', TRUE);

-- 2. CLIENTES DE DEMONSTRAÇÃO (Validação de CPF Unicidade de CPF válido no Módulo 11)
INSERT INTO clientes (id, nome, cpf, telefone, email) VALUES
(1, 'Mariana Souza', '529.982.247-25', '(21) 98888-1001', 'mariana.souza@email.com'),
(2, 'Lucas Pereira', '475.707.249-09', '(21) 97777-2002', 'lucas.pereira@email.com');

-- 3. CATÁLOGO DE PRODUTOS DA OmniVarejo Enterprise
INSERT INTO produtos (id, codigo, descricao, categoria, preco, ativo) VALUES
(1, '101', 'Camiseta Básica Algodão Preta P', 'Vestuário', 49.90, TRUE),
(2, '102', 'Camiseta Básica Algodão Branca M', 'Vestuário', 49.90, TRUE),
(3, '103', 'Calça Jeans Slim Azul Escuro 40', 'Vestuário', 159.90, TRUE),
(4, '104', 'Jaqueta Jeans Trucker Unissex G', 'Vestuário', 239.90, TRUE),
(5, '105', 'Vestido Midi Floral Primavera M', 'Vestuário', 189.90, TRUE),
(6, '106', 'Boné Aba Curva Streetwear Preto', 'Acessórios', 59.90, TRUE),
(7, '107', 'Cinto de Couro Legítimo Marrom', 'Acessórios', 79.90, TRUE),
(8, '108', 'Kit 3 Pares de Meias Cano Médio', 'Acessórios', 29.90, TRUE);

-- 4. CONFIGURAÇÃO FISCAL E DADOS DA EMPRESA (NFC-e / SAT)
INSERT INTO configuracao_empresa (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, telefone, email, logradouro, numero, complemento, bairro, cidade, uf, cep, regime_tributario, mensagem_cupom)
VALUES (1, 'Varejo Inteligente Comércio LTDA', 'OmniVarejo Enterprise', '12.345.678/0001-90', '87.654.321', '(21) 3456-7890', 'contato@omnivarejo.com.br', 'Rua da Moda', '100', 'Loja A - Enterprise Retail Suite', 'Maracanã', 'Rio de Janeiro', 'RJ', '20271-110', 'Simples Nacional', 'Obrigado pela preferência! Trocas em até 30 dias com apresentação deste cupom fiscal.')
ON DUPLICATE KEY UPDATE id=1;

-- 5. VENDAS HOMOLOGADAS DE DEMONSTRAÇÃO COM DETALHES DE PAGAMENTO

-- Venda 1: Ana Silva (Caixa #2) -> Mariana Souza (Cliente #1) - PIX
INSERT INTO vendas (id, usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total, forma_pagamento, detalhes_pagamento, status) VALUES
(1, 2, 1, NULL, 209.80, 20.98, 188.82, 'PIX', '{"metodo_principal":"PIX","chave_pix":"financeiro@omnivarejo.com.br","txid_pix":"PIX-OMNI-0001-A9F2"}', 'CONCLUIDA');

INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 1, 1, 49.90, 49.90),
(2, 1, 3, 1, 159.90, 159.90);

-- Venda 2: Carlos Mendes (Gerente #1) -> Mariana Souza (Cliente #1) - Cartão de Crédito 2x
INSERT INTO vendas (id, usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total, forma_pagamento, detalhes_pagamento, status) VALUES
(2, 1, 1, NULL, 239.90, 0.00, 239.90, 'CARTAO_CREDITO', '{"metodo_principal":"CARTAO_CREDITO","bandeira":"Mastercard","parcelas":2,"valor_parcela":119.95,"autorizacao_nsu":"849201"}', 'CONCLUIDA');

INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(3, 2, 4, 1, 239.90, 239.90);

-- Venda 3: Ana Silva (Caixa #2) -> Lucas Pereira (Cliente #2) - Dinheiro com Troco
INSERT INTO vendas (id, usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total, forma_pagamento, detalhes_pagamento, status) VALUES
(3, 2, 2, NULL, 189.90, 0.00, 189.90, 'DINHEIRO', '{"metodo_principal":"DINHEIRO","valor_entregue":200.00,"troco":10.10}', 'CONCLUIDA');

INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(4, 3, 5, 1, 189.90, 189.90);

-- Venda 4: Ana Silva (Caixa #2) -> Consumidor Final (Sem CPF) - Cartão de Débito
INSERT INTO vendas (id, usuario_id, cliente_id, gerente_aprovador_id, subtotal, desconto, valor_total, forma_pagamento, detalhes_pagamento, status) VALUES
(4, 2, NULL, NULL, 89.80, 0.00, 89.80, 'CARTAO_DEBITO', '{"metodo_principal":"CARTAO_DEBITO","bandeira":"Visa","autorizacao_nsu":"392104"}', 'CONCLUIDA');

INSERT INTO itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(5, 4, 6, 1, 59.90, 59.90),
(6, 4, 8, 1, 29.90, 29.90);
