import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { db } from '../config/database';
import { ICategoria, ISubcategoria, ICategoriaCriacaoDTO, ISubcategoriaCriacaoDTO } from '../types';

export class CategoriaModel {
  private static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  static async findAll(): Promise<ICategoria[]> {
    const [catRows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM categorias WHERE ativo = 1 ORDER BY nome ASC'
    );
    const [subRows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM subcategorias WHERE ativo = 1 ORDER BY nome ASC'
    );
    const [countRows] = await db.execute<RowDataPacket[]>(
      'SELECT categoria, COUNT(*) as total FROM produtos WHERE ativo = 1 GROUP BY categoria'
    );

    const countMap: Record<string, number> = {};
    for (const c of countRows) {
      if (c.categoria) {
        countMap[c.categoria.toLowerCase()] = c.total;
      }
    }

    const subMap: Record<number, ISubcategoria[]> = {};
    for (const sub of subRows) {
      if (!subMap[sub.categoria_id]) {
        subMap[sub.categoria_id] = [];
      }
      subMap[sub.categoria_id].push({
        id: sub.id,
        categoria_id: sub.categoria_id,
        nome: sub.nome,
        slug: sub.slug,
        descricao: sub.descricao,
        ativo: Boolean(sub.ativo),
        criado_em: sub.criado_em,
        atualizado_em: sub.atualizado_em
      });
    }

    return catRows.map(cat => ({
      id: cat.id,
      nome: cat.nome,
      slug: cat.slug,
      descricao: cat.descricao,
      icone: cat.icone || 'Tag',
      cor: cat.cor || '#6366f1',
      ativo: Boolean(cat.ativo),
      total_produtos: countMap[cat.nome.toLowerCase()] || 0,
      subcategorias: subMap[cat.id] || [],
      criado_em: cat.criado_em,
      atualizado_em: cat.atualizado_em
    }));
  }

  static async findById(id: number): Promise<ICategoria | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    const cat = rows[0];

    const [subRows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM subcategorias WHERE categoria_id = ? AND ativo = 1',
      [id]
    );

    return {
      id: cat.id,
      nome: cat.nome,
      slug: cat.slug,
      descricao: cat.descricao,
      icone: cat.icone || 'Tag',
      cor: cat.cor || '#6366f1',
      ativo: Boolean(cat.ativo),
      subcategorias: subRows.map(s => ({
        id: s.id,
        categoria_id: s.categoria_id,
        nome: s.nome,
        slug: s.slug,
        descricao: s.descricao,
        ativo: Boolean(s.ativo)
      }))
    };
  }

  static async create(dados: ICategoriaCriacaoDTO): Promise<ICategoria> {
    const slug = this.slugify(dados.nome);
    const [res]: any = await db.execute(
      `INSERT INTO categorias (nome, slug, descricao, icone, cor, ativo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [dados.nome.trim(), slug, dados.descricao?.trim() || null, dados.icone || 'Tag', dados.cor || '#6366f1']
    );
    return (await this.findById(res.insertId))!;
  }

  static async update(id: number, dados: Partial<ICategoriaCriacaoDTO>): Promise<ICategoria> {
    const campos: string[] = [];
    const params: any[] = [];

    if (dados.nome) {
      campos.push('nome = ?', 'slug = ?');
      params.push(dados.nome.trim(), this.slugify(dados.nome));
    }
    if (dados.descricao !== undefined) {
      campos.push('descricao = ?');
      params.push(dados.descricao?.trim() || null);
    }
    if (dados.icone) {
      campos.push('icone = ?');
      params.push(dados.icone);
    }
    if (dados.cor) {
      campos.push('cor = ?');
      params.push(dados.cor);
    }

    if (campos.length > 0) {
      params.push(id);
      await db.execute(`UPDATE categorias SET ${campos.join(', ')} WHERE id = ?`, params);
    }

    return (await this.findById(id))!;
  }

  static async delete(id: number): Promise<boolean> {
    const [res]: any = await db.execute('DELETE FROM categorias WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }

  static async createSubcategoria(dados: ISubcategoriaCriacaoDTO): Promise<ISubcategoria> {
    const slug = this.slugify(dados.nome);
    const [res]: any = await db.execute(
      `INSERT INTO subcategorias (categoria_id, nome, slug, descricao, ativo)
       VALUES (?, ?, ?, ?, 1)`,
      [dados.categoria_id, dados.nome.trim(), slug, dados.descricao?.trim() || null]
    );

    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM subcategorias WHERE id = ?',
      [res.insertId]
    );
    const sub = rows[0];
    return {
      id: sub.id,
      categoria_id: sub.categoria_id,
      nome: sub.nome,
      slug: sub.slug,
      descricao: sub.descricao,
      ativo: Boolean(sub.ativo)
    };
  }

  static async deleteSubcategoria(id: number): Promise<boolean> {
    const [res]: any = await db.execute('DELETE FROM subcategorias WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
}
