import { Request, Response } from 'express';
import { ClienteService } from '../services/ClienteService';

export class ClienteController {
  static async criar(req: Request, res: Response): Promise<void> {
    const cliente = await ClienteService.criar(req.body);
    res.status(201).json(cliente);
  }

  static async listar(req: Request, res: Response): Promise<void> {
    const termo = req.query.busca as string | undefined;
    const clientes = await ClienteService.listar(termo);
    res.status(200).json(clientes);
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const cliente = await ClienteService.buscarPorId(id);
    res.status(200).json(cliente);
  }

  static async buscarPorCpf(req: Request, res: Response): Promise<void> {
    const cpf = Array.isArray(req.params.cpf) ? req.params.cpf[0] : req.params.cpf;
    const cliente = await ClienteService.buscarPorCpf(cpf);
    res.status(200).json(cliente);
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const cliente = await ClienteService.atualizar(id, req.body);
    res.status(200).json(cliente);
  }
}
