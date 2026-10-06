import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database';
import { Cliente, ClienteCriacaoDTO, ClienteAtualizacaoDTO } from '../types';

export class ClienteModel {
  /**
   * Cadastra um novo cliente
   */
  static async create(dados: ClienteCriacaoDTO): Promise<Cliente> {
    const query = `
      INSERT INTO clientes (nome, cpf, telefone, email)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute<ResultSetHeader>(query, [
      dados.nome,
      dados.cpf,
      dados.telefone || null,
      dados.email || null
    ]);

    const novoId = result.insertId;
    const clienteCriado = await this.findById(novoId);
    if (!clienteCriado) {
      throw new Error(`Falha ao recuperar cliente com id ${novoId}`);
    }
    return clienteCriado;
  }

  /**
   * Busca cliente por ID
   */
  static async findById(id: number): Promise<Cliente | null> {
    const query = `
      SELECT id, nome, cpf, telefone, email, criado_em, atualizado_em
      FROM clientes
      WHERE id = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
      telefone: row.telefone,
      email: row.email,
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    };
  }

  /**
   * Busca cliente por CPF (utilizado para garantir unicidade - RN-01)
   */
  static async findByCpf(cpf: string): Promise<Cliente | null> {
    const query = `
      SELECT id, nome, cpf, telefone, email, criado_em, atualizado_em
      FROM clientes
      WHERE cpf = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [cpf]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
      telefone: row.telefone,
      email: row.email,
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    };
  }

  /**
   * Lista todos os clientes ou filtra por nome/CPF
   */
  static async findAll(termo?: string): Promise<Cliente[]> {
    let query = `
      SELECT id, nome, cpf, telefone, email, criado_em, atualizado_em
      FROM clientes
    `;
    const params: string[] = [];

    if (termo) {
      query += ` WHERE nome LIKE ? OR cpf LIKE ?`;
      params.push(`%${termo}%`, `%${termo}%`);
    }

    query += ` ORDER BY nome ASC`;

    const [rows] = await db.execute<RowDataPacket[]>(query, params);
    return rows.map(row => ({
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
      telefone: row.telefone,
      email: row.email,
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    }));
  }

  /**
   * Atualiza dados de um cliente existente
   */
  static async update(id: number, dados: ClienteAtualizacaoDTO): Promise<Cliente | null> {
    const campos: string[] = [];
    const params: (string | null | number)[] = [];

    if (dados.nome !== undefined) {
      campos.push('nome = ?');
      params.push(dados.nome);
    }
    if (dados.telefone !== undefined) {
      campos.push('telefone = ?');
      params.push(dados.telefone);
    }
    if (dados.email !== undefined) {
      campos.push('email = ?');
      params.push(dados.email);
    }

    if (campos.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE clientes
      SET ${campos.join(', ')}
      WHERE id = ?
    `;
    params.push(id);

    await db.execute(query, params);
    return this.findById(id);
  }
}
