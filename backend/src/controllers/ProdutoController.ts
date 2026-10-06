import { Request, Response } from 'express';
import { ProdutoService } from '../services/ProdutoService';

export class ProdutoController {
  static async criar(req: Request, res: Response): Promise<void> {
    const produto = await ProdutoService.criar(req.body);
    res.status(201).json(produto);
  }

  static async listar(req: Request, res: Response): Promise<void> {
    const somenteAtivos = req.query.somenteAtivos !== 'false';
    const produtos = await ProdutoService.listar(somenteAtivos);
    res.status(200).json(produtos);
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const produto = await ProdutoService.buscarPorId(id);
    res.status(200).json(produto);
  }

  static async buscarPorCodigo(req: Request, res: Response): Promise<void> {
    const codigo = Array.isArray(req.params.codigo) ? req.params.codigo[0] : req.params.codigo;
    const produto = await ProdutoService.buscarPorCodigo(codigo);
    res.status(200).json(produto);
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const produto = await ProdutoService.atualizar(id, req.body);
    res.status(200).json(produto);
  }

  static async inativar(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    await ProdutoService.inativar(id);
    res.status(200).json({ mensagem: 'Produto inativado com sucesso (soft delete).' });
  }
}
