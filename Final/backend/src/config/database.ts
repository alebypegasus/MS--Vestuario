import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';
import { LocalDbAdapter } from './local-db';

dotenv.config();

// Configurações do Pool de Conexões MySQL
const poolConfig: PoolOptions = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root',
  database: process.env.DB_NAME || 'omnivarejo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  timezone: '-03:00'
};

let mysqlPool: Pool | null = null;
let useLocalDb = false;
let checkDone = false;

async function checkDatabaseDriver(): Promise<boolean> {
  if (checkDone) return !useLocalDb;
  try {
    // 1. Tenta pingar o servidor MySQL na porta configurada
    const tempPool = mysql.createPool({
      host: poolConfig.host,
      port: poolConfig.port,
      user: poolConfig.user,
      password: poolConfig.password,
      connectTimeout: 1200
    });

    const conn = await Promise.race([
      tempPool.getConnection(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout de conexão MySQL')), 1200))
    ]);

    // Garante que o schema existe no MySQL
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${poolConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    conn.release();
    await tempPool.end();

    // 2. Conecta ao pool com o schema selecionado
    mysqlPool = mysql.createPool({ ...poolConfig, connectTimeout: 2000 });
    const connDb = await mysqlPool.getConnection();
    connDb.release();

    console.log(`[Database] ✅ Conectado com sucesso ao MySQL na porta ${poolConfig.port} (Schema: ${poolConfig.database})!`);
    useLocalDb = false;
    checkDone = true;
    return true;
  } catch (err: any) {
    useLocalDb = true;
    checkDone = true;
    console.log(`[Database] ⚡ Servidor MySQL offline/não encontrado (${err?.message || 'offline'}). Ativando Motor Local SQLite Embutido (100% Autônomo e Funcional)...`);
    // Inicializa as tabelas e seeds locais
    LocalDbAdapter.getDb();
    return true;
  }
}

export interface IDbExecutor {
  execute<T = any>(queryStr: string, params?: any[]): Promise<[T, any]>;
  query<T = any>(queryStr: string, params?: any[]): Promise<[T, any]>;
  getConnection(): Promise<any>;
  end(): Promise<void>;
}

// Proxy transparente para db
export const db: IDbExecutor = {
  async execute<T = any>(queryStr: string, params: any[] = []): Promise<[T, any]> {
    if (!checkDone) await checkDatabaseDriver();
    if (useLocalDb) {
      return LocalDbAdapter.execute(queryStr, params) as Promise<[T, any]>;
    }
    return mysqlPool!.execute(queryStr, params) as Promise<[T, any]>;
  },
  async query<T = any>(queryStr: string, params: any[] = []): Promise<[T, any]> {
    if (!checkDone) await checkDatabaseDriver();
    if (useLocalDb) {
      return LocalDbAdapter.execute(queryStr, params) as Promise<[T, any]>;
    }
    return mysqlPool!.query(queryStr, params) as Promise<[T, any]>;
  },
  async getConnection() {
    if (!checkDone) await checkDatabaseDriver();
    if (useLocalDb) {
      return LocalDbAdapter.getConnection();
    }
    return mysqlPool!.getConnection();
  },
  async end() {
    if (mysqlPool) await mysqlPool.end();
  }
};

/**
 * Função utilitária para testar a conectividade com o banco de dados
 */
export async function testDatabaseConnection(): Promise<boolean> {
  return checkDatabaseDriver();
}
