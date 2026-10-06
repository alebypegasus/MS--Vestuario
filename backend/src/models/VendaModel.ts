import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { db } from '../config/database';
import { IVendaCriacaoDTO, IVendaCompleta } from '../types';
import { ProdutoModel } from './ProdutoModel';
import { ItemVendaModel } from './ItemVendaModel';

export class VendaModel {
  /**
   * Registra uma nova venda de forma transacional (ACID) no PDV:
   * 1. Inicia transação
   * 2. Calcula subtotal e congela o preço atual de cada produto (RN-04)
   * 3. Grava cabeçalho em `vendas` (1 Usuário : N Vendas)
   * 4. Grava linhas em `itens_venda`
   * 5. Efetua commit
   */
  static async create(dados: IVendaCriacaoDTO): Promise<IVendaCompleta> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      let subtotal = 0;
      const itensComPreco: { produto_id: number; quantidade: number; preco_unitario: number }[] = [];

      // Validar cada produto e recuperar o snapshot do preço atual do catálogo
      for (const item of dados.itens) {
        const produto = await ProdutoModel.findById(item.produto_id);
        if (!produto) {
          throw new Error(`Produto com ID ${item.produto_id} não encontrado.`);
        }
        if (!produto.ativo) {
          throw new Error(`Produto '${produto.descricao}' está inativo no catálogo.`);
        }
        if (item.quantidade <= 0) {
          throw new Error(`Quantidade do produto '${produto.descricao}' deve ser maior que zero.`);
        }

        const linhaSubtotal = Number((item.quantidade * produto.preco).toFixed(2));
        subtotal += linhaSubtotal;

        itensComPreco.push({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: produto.preco
        });
      }

      subtotal = Number(subtotal.toFixed(2));
      const desconto = Number((dados.desconto || 0).toFixed(2));
      if (desconto > subtotal) {
        throw new Error('O desconto não pode ser maior que o subtotal da venda.');
      }
      const valorTotal = Number((subtotal - desconto).toFixed(2));

      // 1. Inserir Cabeçalho da Venda (1 Usuário : N Vendas)
      const queryVenda = `
        INSERT INTO vendas (
          usuario_id, cliente_id, gerente_aprovador_id,
          subtotal, desconto, valor_total, forma_pagamento, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'CONCLUIDA')
      `;
      const [resVenda] = await conn.execute<ResultSetHeader>(queryVenda, [
        dados.usuario_id,
        dados.cliente_id || null,
        dados.gerente_aprovador_id || null,
        subtotal,
        desconto,
        valorTotal,
        dados.forma_pagamento
      ]);

      const vendaId = resVenda.insertId;

      // 2. Inserir cada item com snapshot histórico de preço
      for (const item of itensComPreco) {
        await ItemVendaModel.create(
          vendaId,
          item.produto_id,
          item.quantidade,
          item.preco_unitario,
          conn
        );
      }

      await conn.commit();

      const vendaCompleta = await this.findById(vendaId);
      if (!vendaCompleta) {
        throw new Error(`Erro ao recuperar venda finalizada ID ${vendaId}`);
      }
      return vendaCompleta;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  /**
   * Busca uma venda por ID trazendo dados do operador, cliente e itens
   */
  static async findById(id: number): Promise<IVendaCompleta | null> {
    const query = `
      SELECT v.id, v.usuario_id, v.cliente_id, v.gerente_aprovador_id,
             v.subtotal, v.desconto, v.valor_total, v.forma_pagamento,
             v.status, v.motivo_cancelamento, v.criado_em, v.atualizado_em,
             u.nome AS operador_nome,
             c.nome AS cliente_nome,
             c.cpf AS cliente_cpf,
             g.nome AS gerente_aprovador_nome
      FROM vendas v
      JOIN usuarios u ON u.id = v.usuario_id
      LEFT JOIN clientes c ON c.id = v.cliente_id
      LEFT JOIN usuarios g ON g.id = v.gerente_aprovador_id
      WHERE v.id = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const itens = await ItemVendaModel.findByVendaId(id);

    return {
      id: row.id,
      usuario_id: row.usuario_id,
      cliente_id: row.cliente_id,
      gerente_aprovador_id: row.gerente_aprovador_id,
      subtotal: Number(row.subtotal),
      desconto: Number(row.desconto),
      valor_total: Number(row.valor_total),
      forma_pagamento: row.forma_pagamento,
      status: row.status,
      motivo_cancelamento: row.motivo_cancelamento,
      criado_em: row.criado_em,
      atualizado_em: row.atualizado_em,
      operador_nome: row.operador_nome,
      cliente_nome: row.cliente_nome,
      cliente_cpf: row.cliente_cpf,
      gerente_aprovador_nome: row.gerente_aprovador_nome,
      itens
    };
  }

  /**
   * Lista todas as vendas registradas
   */
  static async findAll(): Promise<IVendaCompleta[]> {
    const query = `
      SELECT v.id, v.usuario_id, v.cliente_id, v.gerente_aprovador_id,
             v.subtotal, v.desconto, v.valor_total, v.forma_pagamento,
             v.status, v.motivo_cancelamento, v.criado_em, v.atualizado_em,
             u.nome AS operador_nome,
             c.nome AS cliente_nome,
             c.cpf AS cliente_cpf,
             g.nome AS gerente_aprovador_nome
      FROM vendas v
      JOIN usuarios u ON u.id = v.usuario_id
      LEFT JOIN clientes c ON c.id = v.cliente_id
      LEFT JOIN usuarios g ON g.id = v.gerente_aprovador_id
      ORDER BY v.id DESC
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query);
    
    const vendas: IVendaCompleta[] = [];
    for (const row of rows) {
      const itens = await ItemVendaModel.findByVendaId(row.id);
      vendas.push({
        id: row.id,
        usuario_id: row.usuario_id,
        cliente_id: row.cliente_id,
        gerente_aprovador_id: row.gerente_aprovador_id,
        subtotal: Number(row.subtotal),
        desconto: Number(row.desconto),
        valor_total: Number(row.valor_total),
        forma_pagamento: row.forma_pagamento,
        status: row.status,
        motivo_cancelamento: row.motivo_cancelamento,
        criado_em: row.criado_em,
        atualizado_em: row.atualizado_em,
        operador_nome: row.operador_nome,
        cliente_nome: row.cliente_nome,
        cliente_cpf: row.cliente_cpf,
        gerente_aprovador_nome: row.gerente_aprovador_nome,
        itens
      });
    }
    return vendas;
  }

  /**
   * Efetua o cancelamento de uma venda com alçada gerencial (RN-03, RN-05)
   */
  static async cancel(id: number, gerenteAprovadorId: number, motivo: string): Promise<boolean> {
    const query = `
      UPDATE vendas
      SET status = 'CANCELADA',
          gerente_aprovador_id = ?,
          motivo_cancelamento = ?
      WHERE id = ? AND status = 'CONCLUIDA'
    `;
    const [result] = await db.execute<ResultSetHeader>(query, [
      gerenteAprovadorId,
      motivo,
      id
    ]);
    return result.affectedRows > 0;
  }
}
