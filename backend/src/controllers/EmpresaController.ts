import { Request, Response } from 'express';
import { EmpresaService } from '../services/EmpresaService';

export class EmpresaController {
  static async obter(req: Request, res: Response): Promise<void> {
    const empresa = await EmpresaService.obter();
    res.status(200).json(empresa);
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    const empresa = await EmpresaService.atualizar(req.body);
    res.status(200).json(empresa);
  }
}
