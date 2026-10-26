import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database';

export interface IAgendaItem {
  id: number;
  titulo: string;
  tipo: 'meta' | 'evento' | 'estoque' | 'auditoria';
  data_evento: string; // YYYY-MM-DD
  horario?: string | null;
  valor_meta?: number | null;
  descricao?: string | null;
  concluido: boolean;
  criado_em?: string;
}

export class AgendaModel {
  static async findAll(): Promise<IAgendaItem[]> {
    const query = `
      SELECT id, titulo, tipo, data_evento, horario, valor_meta, descricao, concluido, criado_em
      FROM agenda_dashboard
      ORDER BY data_evento ASC, horario ASC
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query);
    return rows.map((r: any) => ({
      id: r.id,
      titulo: r.titulo,
      tipo: r.tipo,
      data_evento: r.data_evento,
      horario: r.horario,
      valor_meta: r.valor_meta !== null ? Number(r.valor_meta) : null,
      descricao: r.descricao,
      concluido: Boolean(r.concluido),
      criado_em: r.criado_em
    }));
  }

  static async findByData(dataEvento: string): Promise<IAgendaItem[]> {
    const query = `
      SELECT id, titulo, tipo, data_evento, horario, valor_meta, descricao, concluido, criado_em
      FROM agenda_dashboard
      WHERE data_evento = ?
      ORDER BY horario ASC
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [dataEvento]);
    return rows.map((r: any) => ({
      id: r.id,
      titulo: r.titulo,
      tipo: r.tipo,
      data_evento: r.data_evento,
      horario: r.horario,
      valor_meta: r.valor_meta !== null ? Number(r.valor_meta) : null,
      descricao: r.descricao,
      concluido: Boolean(r.concluido),
      criado_em: r.criado_em
    }));
  }

  static async create(dados: Partial<IAgendaItem>): Promise<IAgendaItem> {
    const query = `
      INSERT INTO agenda_dashboard (titulo, tipo, data_evento, horario, valor_meta, descricao, concluido)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [res] = await db.execute<ResultSetHeader>(query, [
      dados.titulo,
      dados.tipo || 'evento',
      dados.data_evento,
      dados.horario || null,
      dados.valor_meta !== undefined ? dados.valor_meta : null,
      dados.descricao || null,
      dados.concluido ? 1 : 0
    ]);

    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM agenda_dashboard WHERE id = ?', [res.insertId]);
    const r = rows[0];
    return {
      id: r.id,
      titulo: r.titulo,
      tipo: r.tipo,
      data_evento: r.data_evento,
      horario: r.horario,
      valor_meta: r.valor_meta !== null ? Number(r.valor_meta) : null,
      descricao: r.descricao,
      concluido: Boolean(r.concluido),
      criado_em: r.criado_em
    };
  }

  static async toggle(id: number): Promise<boolean> {
    const query = `UPDATE agenda_dashboard SET concluido = CASE WHEN concluido = 1 THEN 0 ELSE 1 END WHERE id = ?`;
    const [res] = await db.execute<ResultSetHeader>(query, [id]);
    return res.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM agenda_dashboard WHERE id = ?`;
    const [res] = await db.execute<ResultSetHeader>(query, [id]);
    return res.affectedRows > 0;
  }
}
