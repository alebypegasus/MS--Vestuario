import { Request, Response } from 'express';
import { VendaService } from '../services/VendaService';
import { AppError } from '../utils/app-error';

export class VendaController {
  static async criar(req: Request, res: Response): Promise<void> {
    if (!req.usuario) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const venda = await VendaService.criar(
      req.body,
      req.usuario.id,
      req.usuario.cargo
    );

    res.status(201).json(venda);
  }

  static async listar(req: Request, res: Response): Promise<void> {
    const vendas = await VendaService.listarTodas();
    res.status(200).json(vendas);
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const venda = await VendaService.buscarPorId(id);
    res.status(200).json(venda);
  }

  static async cancelar(req: Request, res: Response): Promise<void> {
    if (!req.usuario) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const id = Number(req.params.id);
    const vendaCancelada = await VendaService.cancelar(
      id,
      req.body,
      req.usuario.id,
      req.usuario.cargo
    );

    res.status(200).json({
      mensagem: 'Venda cancelada com sucesso.',
      venda: vendaCancelada
    });
  }
}
