import { testDatabaseConnection, db } from './database';

async function main() {
  console.log('Testando conexão com o MySQL utilizando configurações do .env...');
  const ok = await testDatabaseConnection();
  if (ok) {
    console.log('✅ Sucesso! Conexão com o banco `ms2vest.db` validada.');
  } else {
    console.error('❌ Não foi possível conectar ao MySQL.');
    console.error('   Verifique se o serviço MySQL está ativo na porta informada no `.env`.');
  }
  await db.end();
  process.exit(ok ? 0 : 1);
}

main();
