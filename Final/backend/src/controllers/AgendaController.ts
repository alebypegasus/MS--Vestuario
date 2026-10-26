import { Request, Response } from 'express';
import { AgendaModel } from '../models/AgendaModel';

export class AgendaController {
  static async listar(req: Request, res: Response) {
    const { data } = req.query;
    if (data && typeof data === 'string') {
      const itens = await AgendaModel.findByData(data);
      return res.json(itens);
    }
    const itens = await AgendaModel.findAll();
    return res.json(itens);
  }

  static async criar(req: Request, res: Response) {
    const { titulo, tipo, data_evento, horario, valor_meta, descricao } = req.body;
    if (!titulo || !data_evento) {
      return res.status(400).json({ error: 'Título e data do evento são obrigatórios.' });
    }
    const novo = await AgendaModel.create({
      titulo,
      tipo,
      data_evento,
      horario,
      valor_meta,
      descricao
    });
    return res.status(201).json(novo);
  }

  static async alternar(req: Request, res: Response) {
    const id = Number(req.params.id);
    const alterado = await AgendaModel.toggle(id);
    if (!alterado) {
      return res.status(404).json({ error: 'Item de agenda não encontrado.' });
    }
    return res.json({ sucesso: true });
  }

  static async excluir(req: Request, res: Response) {
    const id = Number(req.params.id);
    const excluido = await AgendaModel.delete(id);
    if (!excluido) {
      return res.status(404).json({ error: 'Item de agenda não encontrado.' });
    }
    return res.json({ sucesso: true });
  }
}
