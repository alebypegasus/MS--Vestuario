import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const resultado = await AuthService.login(req.body);
    res.status(200).json(resultado);
  }

  static async validarGerente(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body;
    const gerente = await AuthService.validarCredenciaisGerente(email, senha);
    res.status(200).json({
      valido: true,
      gerente_id: gerente.id,
      gerente_nome: gerente.nome
    });
  }
}
