import { Request, Response } from 'express';
import { CategoriaModel } from '../models/CategoriaModel';
import { AppError } from '../utils/app-error';

export class CategoriaController {
  static async listar(_req: Request, res: Response): Promise<void> {
    const categorias = await CategoriaModel.findAll();
    res.status(200).json(categorias);
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const cat = await CategoriaModel.findById(id);
    if (!cat) {
      throw new AppError('Categoria não encontrada', 404);
    }
    res.status(200).json(cat);
  }

  static async criar(req: Request, res: Response): Promise<void> {
    const { nome, descricao, icone, cor } = req.body;
    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      throw new AppError('Nome da categoria é obrigatório', 400);
    }
    const categoria = await CategoriaModel.create({ nome, descricao, icone, cor });
    res.status(201).json(categoria);
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const categoria = await CategoriaModel.update(id, req.body);
    res.status(200).json(categoria);
  }

  static async excluir(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const removido = await CategoriaModel.delete(id);
    if (!removido) {
      throw new AppError('Categoria não encontrada', 404);
    }
    res.status(200).json({ mensagem: 'Categoria excluída com sucesso' });
  }

  static async criarSubcategoria(req: Request, res: Response): Promise<void> {
    const { categoria_id, nome, descricao } = req.body;
    if (!categoria_id || !nome) {
      throw new AppError('Categoria ID e nome da subcategoria são obrigatórios', 400);
    }
    const sub = await CategoriaModel.createSubcategoria({ categoria_id, nome, descricao });
    res.status(201).json(sub);
  }

  static async excluirSubcategoria(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const removido = await CategoriaModel.deleteSubcategoria(id);
    if (!removido) {
      throw new AppError('Subcategoria não encontrada', 404);
    }
    res.status(200).json({ mensagem: 'Subcategoria excluída com sucesso' });
  }
}
