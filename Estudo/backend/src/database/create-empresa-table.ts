import { db } from '../config/database';

async function setupEmpresa() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS configuracao_empresa (
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
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.execute(`
    INSERT INTO configuracao_empresa (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, telefone, email, logradouro, numero, complemento, bairro, cidade, uf, cep, regime_tributario, mensagem_cupom)
    VALUES (1, 'MS² Vestuário Comércio de Roupas LTDA', 'MS² Vestuário', '12.345.678/0001-90', '87.654.321', '(21) 3456-7890', 'contato@ms2vestuario.com.br', 'Rua da Moda', '100', 'Loja A - Firjan SENAI', 'Maracanã', 'Rio de Janeiro', 'RJ', '20271-110', 'Simples Nacional', 'Obrigado pela preferência! Trocas em até 30 dias com apresentação deste cupom fiscal.')
    ON DUPLICATE KEY UPDATE id=1;
  `);

  console.log('✅ Tabela configuracao_empresa criada e inicializada com sucesso!');
  process.exit(0);
}

setupEmpresa().catch(err => {
  console.error('Erro ao configurar tabela de empresa:', err);
  process.exit(1);
});
