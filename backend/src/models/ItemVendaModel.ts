import { ResultSetHeader, RowDataPacket, PoolConnection } from 'mysql2/promise';
import { db } from '../config/database';
import { IItemVenda, IItemVendaComProduto } from '../types';

export class ItemVendaModel {
  /**
   * Insere um item de venda com snapshot do preço unitário histórico (RN-04)
   */
  static async create(
    vendaId: number,
    produtoId: number,
    quantidade: number,
    precoUnitario: number,
    conn?: PoolConnection
  ): Promise<IItemVenda> {
    const subtotal = Number((quantidade * precoUnitario).toFixed(2));
    const query = `
      INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    const executor = conn || db;
    const [result] = await executor.execute<ResultSetHeader>(query, [
      vendaId,
      produtoId,
      quantidade,
      precoUnitario,
      subtotal
    ]);

    return {
      id: result.insertId,
      venda_id: vendaId,
      produto_id: produtoId,
      quantidade,
      preco_unitario: precoUnitario,
      subtotal
    };
  }

  /**
   * Busca todos os itens de uma venda específica, trazendo os dados do produto
   */
  static async findByVendaId(vendaId: number, conn?: PoolConnection): Promise<IItemVendaComProduto[]> {
    const query = `
      SELECT iv.id, iv.venda_id, iv.produto_id, iv.quantidade, 
             iv.preco_unitario, iv.subtotal,
             p.codigo, p.descricao, p.categoria
      FROM itens_venda iv
      JOIN produtos p ON p.id = iv.produto_id
      WHERE iv.venda_id = ?
      ORDER BY iv.id ASC
    `;
    const executor = conn || db;
    const [rows] = await executor.execute<RowDataPacket[]>(query, [vendaId]);

    return rows.map(row => ({
      id: row.id,
      venda_id: row.venda_id,
      produto_id: row.produto_id,
      quantidade: row.quantidade,
      preco_unitario: Number(row.preco_unitario),
      subtotal: Number(row.subtotal),
      codigo: row.codigo,
      descricao: row.descricao,
      categoria: row.categoria
    }));
  }
}
