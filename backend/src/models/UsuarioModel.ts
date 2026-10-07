import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database';
import { IUsuario, IUsuarioCriacaoDTO, IUsuarioRespostaDTO } from '../types';

export class UsuarioModel {
  /**
   * Cria um novo usuário no banco de dados
   */
  static async create(dados: IUsuarioCriacaoDTO): Promise<IUsuario> {
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
  static async findById(id: number): Promise<IUsuario | null> {
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
  static async findByEmail(email: string): Promise<IUsuario | null> {
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
  static async findAll(): Promise<IUsuarioRespostaDTO[]> {
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

  /**
   * Atualiza dados de um usuário existente
   */
  static async update(id: number, dados: Partial<{ nome: string; email: string; senha_hash: string; cargo: string }>): Promise<IUsuarioRespostaDTO | null> {
    const campos: string[] = [];
    const params: (string | number)[] = [];

    if (dados.nome !== undefined) {
      campos.push('nome = ?');
      params.push(dados.nome);
    }
    if (dados.email !== undefined) {
      campos.push('email = ?');
      params.push(dados.email);
    }
    if (dados.senha_hash !== undefined) {
      campos.push('senha_hash = ?');
      params.push(dados.senha_hash);
    }
    if (dados.cargo !== undefined) {
      campos.push('cargo = ?');
      params.push(dados.cargo);
    }

    if (campos.length > 0) {
      const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
      params.push(id);
      await db.execute(query, params);
    }

    const usuario = await this.findById(id);
    if (!usuario) return null;
    const { senha_hash, ...semSenha } = usuario;
    return semSenha;
  }

  /**
   * Ativa ou desativa um usuário
   */
  static async updateStatus(id: number, ativo: boolean): Promise<boolean> {
    const query = `UPDATE usuarios SET ativo = ? WHERE id = ?`;
    const [result] = await db.execute<ResultSetHeader>(query, [ativo, id]);
    return result.affectedRows > 0;
  }
}
