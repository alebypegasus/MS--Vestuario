import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database';
import { Usuario, UsuarioCriacaoDTO, UsuarioRespostaDTO } from '../types';

export class UsuarioModel {
  /**
   * Cria um novo usuário no banco de dados
   */
  static async create(dados: UsuarioCriacaoDTO): Promise<Usuario> {
    const query = `
      INSERT INTO usuarios (nome, email, senha_hash, cargo)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute<ResultSetHeader>(query, [
      dados.nome,
      dados.email,
      dados.senha_hash,
      dados.cargo
    ]);

    const novoId = result.insertId;
    const usuarioCriado = await this.findById(novoId);
    if (!usuarioCriado) {
      throw new Error(`Falha ao recuperar usuário recém-criado com id ${novoId}`);
    }
    return usuarioCriado;
  }

  /**
   * Busca um usuário pelo ID
   */
  static async findById(id: number): Promise<Usuario | null> {
    const query = `
      SELECT id, nome, email, senha_hash, cargo, ativo, criado_em, atualizado_em
      FROM usuarios
      WHERE id = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha_hash: row.senha_hash,
      cargo: row.cargo,
      ativo: Boolean(row.ativo),
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    };
  }

  /**
   * Busca um usuário pelo e-mail (usado na autenticação e alçadas)
   */
  static async findByEmail(email: string): Promise<Usuario | null> {
    const query = `
      SELECT id, nome, email, senha_hash, cargo, ativo, criado_em, atualizado_em
      FROM usuarios
      WHERE email = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [email]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha_hash: row.senha_hash,
      cargo: row.cargo,
      ativo: Boolean(row.ativo),
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    };
  }

  /**
   * Retorna todos os usuários (sem expor a senha_hash)
   */
  static async findAll(): Promise<UsuarioRespostaDTO[]> {
    const query = `
      SELECT id, nome, email, cargo, ativo, criado_em, atualizado_em
      FROM usuarios
      ORDER BY nome ASC
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query);
    return rows.map(row => ({
      id: row.id,
      nome: row.nome,
      email: row.email,
      cargo: row.cargo,
      ativo: Boolean(row.ativo),
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    }));
  }
}
