import { db } from '../config/database';
import bcrypt from 'bcryptjs';

async function migrate() {
  console.log('🔄 Atualizando estrutura da tabela usuarios para suportar ADMIN, GERENTE e CAIXA...');

  try {
    // 1. Modificar coluna cargo para aceitar ADMIN, GERENTE e CAIXA
    await db.execute(`
      ALTER TABLE usuarios 
      MODIFY COLUMN cargo ENUM('ADMIN', 'GERENTE', 'CAIXA') NOT NULL DEFAULT 'CAIXA'
    `);
    console.log('✅ Coluna cargo alterada com sucesso para ENUM("ADMIN", "GERENTE", "CAIXA")');

    // 2. Criar ou atualizar usuário Administrador
    const hashAdmin = bcrypt.hashSync('admin123', 10);
    const [rows]: any = await db.execute('SELECT id FROM usuarios WHERE email = ?', ['admin@ms2.com.br']);

    if (rows.length === 0) {
      await db.execute(
        `INSERT INTO usuarios (nome, email, senha_hash, cargo, ativo) VALUES (?, ?, ?, 'ADMIN', TRUE)`,
        ['Administrador Geral (Admin)', 'admin@ms2.com.br', hashAdmin]
      );
      console.log('✅ Usuário Administrador (admin@ms2.com.br / admin123) inserido!');
    } else {
      await db.execute(
        `UPDATE usuarios SET cargo = 'ADMIN', nome = 'Administrador Geral (Admin)', senha_hash = ? WHERE email = ?`,
        [hashAdmin, 'admin@ms2.com.br']
      );
      console.log('✅ Usuário Administrador atualizado!');
    }

    const [usuarios]: any = await db.execute('SELECT id, nome, email, cargo, ativo FROM usuarios');
    console.log('\n📋 Tabela usuarios atualizada no banco:');
    console.table(usuarios);

  } catch (err) {
    console.error('❌ Erro na migração:', err);
  } finally {
    await db.end();
  }
}

migrate();
