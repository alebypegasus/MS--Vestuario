import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database';
import { IProduto, IProdutoCriacaoDTO, IProdutoAtualizacaoDTO } from '../types';

export class ProdutoModel {
  private static parseJsonField(val: any) {
    if (!val) return null;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val.includes(',') ? val.split(',').map(s => s.trim()) : val;
      }
    }
    return val;
  }

  private static stringifyJsonField(val: any) {
    if (val === undefined || val === null) return null;
    if (typeof val === 'string') return val;
    return JSON.stringify(val);
  }

  private static mapRow(row: any): IProduto {
    return {
      id: row.id,
      codigo: row.codigo,
      descricao: row.descricao,
      categoria: row.categoria,
      subcategoria: row.subcategoria || null,
      tipo: row.tipo || null,
      cores: this.parseJsonField(row.cores),
      tamanhos: this.parseJsonField(row.tamanhos),
      detalhes: row.detalhes || null,
      imagens: this.parseJsonField(row.imagens),
      unidade_medida: row.unidade_medida || 'UN',
      codigo_barras: row.codigo_barras || null,
      marca: row.marca || null,
      modelo: row.modelo || null,
      variacoes: this.parseJsonField(row.variacoes),
      garantia: row.garantia || null,
      data_validade: row.data_validade || null,
      lote: row.lote || null,
      estoque: row.estoque !== undefined ? Number(row.estoque) : 50,
      estoque_minimo: row.estoque_minimo !== undefined ? Number(row.estoque_minimo) : 10,
      preco_custo: row.preco_custo !== undefined ? Number(row.preco_custo) : 0,
      preco: Number(row.preco),
      ativo: Boolean(row.ativo),
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em
    };
  }

  /**
   * Cadastra um novo produto no catálogo com detalhes completos
   */
  static async create(dados: IProdutoCriacaoDTO): Promise<IProduto> {
    const query = `
      INSERT INTO produtos (
        codigo, descricao, categoria, subcategoria, tipo, cores, tamanhos,
        detalhes, imagens, unidade_medida, codigo_barras, marca, modelo,
        variacoes, garantia, data_validade, lote,
        estoque, estoque_minimo, preco_custo, preco
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result]: any = await db.execute(query, [
      dados.codigo,
      dados.descricao,
      dados.categoria || null,
      dados.subcategoria || null,
      dados.tipo || null,
      this.stringifyJsonField(dados.cores),
      this.stringifyJsonField(dados.tamanhos),
      dados.detalhes || null,
      this.stringifyJsonField(dados.imagens),
      dados.unidade_medida || 'UN',
      dados.codigo_barras || null,
      dados.marca || null,
      dados.modelo || null,
      this.stringifyJsonField(dados.variacoes),
      dados.garantia || null,
      dados.data_validade || null,
      dados.lote || null,
      dados.estoque !== undefined ? dados.estoque : 50,
      dados.estoque_minimo !== undefined ? dados.estoque_minimo : 10,
      dados.preco_custo !== undefined ? dados.preco_custo : 0,
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
  static async findById(id: number): Promise<IProduto | null> {
    const query = `
      SELECT *
      FROM produtos
      WHERE id = ?
    `;
    const [rows]: [any[], any] = await db.execute(query, [id]);
    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  /**
   * Busca produto por código de barras ou SKU
   */
  static async findByCodigo(codigo: string): Promise<IProduto | null> {
    const query = `
      SELECT *
      FROM produtos
      WHERE codigo = ? OR codigo_barras = ?
    `;
    const [rows]: [any[], any] = await db.execute(query, [codigo, codigo]);
    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  /**
   * Lista produtos (ativos para o PDV, inativos/pausados ou todos para gestão)
   */
  static async findAll(somenteAtivos: boolean | 'todos' = true): Promise<IProduto[]> {
    let query = `
      SELECT *
      FROM produtos
    `;
    if (somenteAtivos === true) {
      query += ` WHERE ativo = 1`;
    } else if (somenteAtivos === false) {
      query += ` WHERE ativo = 0`;
    }
    query += ` ORDER BY descricao ASC`;

    const [rows] = await db.execute<RowDataPacket[]>(query);
    return rows.map(row => this.mapRow(row));
  }

  /**
   * Atualiza dados e preço do produto no catálogo
   */
  static async update(id: number, dados: IProdutoAtualizacaoDTO): Promise<IProduto | null> {
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
    if (dados.subcategoria !== undefined) {
      campos.push('subcategoria = ?');
      params.push(dados.subcategoria);
    }
    if (dados.tipo !== undefined) {
      campos.push('tipo = ?');
      params.push(dados.tipo);
    }
    if (dados.cores !== undefined) {
      campos.push('cores = ?');
      params.push(this.stringifyJsonField(dados.cores));
    }
    if (dados.tamanhos !== undefined) {
      campos.push('tamanhos = ?');
      params.push(this.stringifyJsonField(dados.tamanhos));
    }
    if (dados.detalhes !== undefined) {
      campos.push('detalhes = ?');
      params.push(dados.detalhes);
    }
    if (dados.imagens !== undefined) {
      campos.push('imagens = ?');
      params.push(this.stringifyJsonField(dados.imagens));
    }
    if (dados.unidade_medida !== undefined) {
      campos.push('unidade_medida = ?');
      params.push(dados.unidade_medida);
    }
    if (dados.codigo_barras !== undefined) {
      campos.push('codigo_barras = ?');
      params.push(dados.codigo_barras);
    }
    if (dados.marca !== undefined) {
      campos.push('marca = ?');
      params.push(dados.marca);
    }
    if (dados.modelo !== undefined) {
      campos.push('modelo = ?');
      params.push(dados.modelo);
    }
    if (dados.variacoes !== undefined) {
      campos.push('variacoes = ?');
      params.push(this.stringifyJsonField(dados.variacoes));
    }
    if (dados.garantia !== undefined) {
      campos.push('garantia = ?');
      params.push(dados.garantia);
    }
    if (dados.data_validade !== undefined) {
      campos.push('data_validade = ?');
      params.push(dados.data_validade);
    }
    if (dados.lote !== undefined) {
      campos.push('lote = ?');
      params.push(dados.lote);
    }
    if (dados.estoque !== undefined) {
      campos.push('estoque = ?');
      params.push(dados.estoque);
    }
    if (dados.estoque_minimo !== undefined) {
      campos.push('estoque_minimo = ?');
      params.push(dados.estoque_minimo);
    }
    if (dados.preco_custo !== undefined) {
      campos.push('preco_custo = ?');
      params.push(dados.preco_custo);
    }
    if (dados.preco !== undefined) {
      campos.push('preco = ?');
      params.push(dados.preco);
    }
    if (dados.ativo !== undefined) {
      campos.push('ativo = ?');
      params.push(dados.ativo ? 1 : 0);
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
   * Alterna ou define explicitamente o status ativo/pausado do produto (RN-08)
   */
  static async toggleStatus(id: number, novoStatus?: boolean): Promise<IProduto | null> {
    if (novoStatus !== undefined) {
      await db.execute<ResultSetHeader>('UPDATE produtos SET ativo = ? WHERE id = ?', [novoStatus ? 1 : 0, id]);
    } else {
      await db.execute<ResultSetHeader>('UPDATE produtos SET ativo = CASE WHEN ativo = 1 THEN 0 ELSE 1 END WHERE id = ?', [id]);
    }
    return this.findById(id);
  }

  /**
   * Inativação lógica (soft delete) para preservar integridade de vendas passadas (RN-08)
   */
  static async inactivate(id: number): Promise<boolean> {
    const query = `UPDATE produtos SET ativo = 0 WHERE id = ?`;
    const [result] = await db.execute<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }
}
