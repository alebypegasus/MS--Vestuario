import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database';
import { Produto, ProdutoCriacaoDTO, ProdutoAtualizacaoDTO } from '../types';

export class ProdutoModel {
  /**
   * Cadastra um novo produto no catálogo
   */
  static async create(dados: ProdutoCriacaoDTO): Promise<Produto> {
    const query = `
      INSERT INTO produtos (codigo, descricao, categoria, preco)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute<ResultSetHeader>(query, [
      dados.codigo,
      dados.descricao,
      dados.categoria || null,
      dados.preco
    ]);

    const novoProduto = await this.findById(result.insertId);
    if (!novoProduto) {
      throw new Error(`Falha ao recuperar produto com id ${result.insertId}`);
    }
    return novoProduto;
  }

  /**
   * Busca produto por ID
   */
  static async findById(id: number): Promise<Produto | null> {
    const query = `
      SELECT id, codigo, descricao, categoria, preco, ativo, criado_em, atualizado_em
      FROM produtos
      WHERE id = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      codigo: row.codigo,
      descricao: row.descricao,
      categoria: row.categoria,
      preco: Number(row.preco),
      ativo: Boolean(row.ativo),
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    };
  }

  /**
   * Busca produto por código de barras ou SKU (busca instantânea no checkout do PDV)
   */
  static async findByCodigo(codigo: string): Promise<Produto | null> {
    const query = `
      SELECT id, codigo, descricao, categoria, preco, ativo, criado_em, atualizado_em
      FROM produtos
      WHERE codigo = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [codigo]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      codigo: row.codigo,
      descricao: row.descricao,
      categoria: row.categoria,
      preco: Number(row.preco),
      ativo: Boolean(row.ativo),
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    };
  }

  /**
   * Lista todos os produtos (com opção de filtrar somente ativos para o PDV)
   */
  static async findAll(somenteAtivos: boolean = true): Promise<Produto[]> {
    let query = `
      SELECT id, codigo, descricao, categoria, preco, ativo, criado_em, atualizado_em
      FROM produtos
    `;
    if (somenteAtivos) {
      query += ` WHERE ativo = TRUE`;
    }
    query += ` ORDER BY descricao ASC`;

    const [rows] = await db.execute<RowDataPacket[]>(query);
    return rows.map(row => ({
      id: row.id,
      codigo: row.codigo,
      descricao: row.descricao,
      categoria: row.categoria,
      preco: Number(row.preco),
      ativo: Boolean(row.ativo),
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    }));
  }

  /**
   * Atualiza dados e preço do produto no catálogo
   */
  static async update(id: number, dados: ProdutoAtualizacaoDTO): Promise<Produto | null> {
    const campos: string[] = [];
    const params: (string | number | boolean | null)[] = [];

    if (dados.codigo !== undefined) {
      campos.push('codigo = ?');
      params.push(dados.codigo);
    }
    if (dados.descricao !== undefined) {
      campos.push('descricao = ?');
      params.push(dados.descricao);
    }
    if (dados.categoria !== undefined) {
      campos.push('categoria = ?');
      params.push(dados.categoria);
    }
    if (dados.preco !== undefined) {
      campos.push('preco = ?');
      params.push(dados.preco);
    }
    if (dados.ativo !== undefined) {
      campos.push('ativo = ?');
      params.push(dados.ativo);
    }

    if (campos.length === 0) {
      return this.findById(id);
    }

    const query = `
      UPDATE produtos
      SET ${campos.join(', ')}
      WHERE id = ?
    `;
    params.push(id);

    await db.execute(query, params);
    return this.findById(id);
  }

  /**
   * Inativação lógica (soft delete) para preservar integridade de vendas passadas (RN-08)
   */
  static async inactivate(id: number): Promise<boolean> {
    const query = `UPDATE produtos SET ativo = FALSE WHERE id = ?`;
    const [result] = await db.execute<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }
}
