import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';

export class UsuarioController {
  static async criar(req: Request, res: Response): Promise<void> {
    const usuario = await UsuarioService.criar(req.body);
    res.status(201).json(usuario);
  }

  static async listar(req: Request, res: Response): Promise<void> {
    const usuarios = await UsuarioService.listarTodos();
    res.status(200).json(usuarios);
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const usuario = await UsuarioService.buscarPorId(id);
    res.status(200).json(usuario);
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const usuario = await UsuarioService.atualizar(id, req.body);
    res.status(200).json(usuario);
  }

  static async alterarStatus(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const resultado = await UsuarioService.alterarStatus(id, req.body.ativo);
    res.status(200).json(resultado);
  }
}
