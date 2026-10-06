import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configurações do Pool de Conexões MySQL
const poolConfig: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'alunolab',
  database: process.env.DB_NAME || 'ms2vest.db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true, // Retorna colunas DECIMAL como números JS (ex: 49.90 em vez de "49.90")
  timezone: '-03:00'    // Horário de Brasília
};

// Instância única do Pool para todo o ciclo de vida da aplicação
export const db: Pool = mysql.createPool(poolConfig);

/**
 * Função utilitária para testar a conectividade com o banco de dados
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await db.getConnection();
    console.log(`[Database] Conexão com o banco '${poolConfig.database}' estabelecida com sucesso!`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[Database] Falha ao conectar ao banco de dados MySQL:', error);
    return false;
  }
}
