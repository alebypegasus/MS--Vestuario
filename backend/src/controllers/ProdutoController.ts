import { Request, Response } from 'express';
import { ProdutoService } from '../services/ProdutoService';

export class ProdutoController {
  static async criar(req: Request, res: Response): Promise<void> {
    const produto = await ProdutoService.criar(req.body);
    res.status(201).json(produto);
  }

  static async listar(req: Request, res: Response): Promise<void> {
    const rawAtivo = req.query.ativo ?? req.query.somenteAtivos;
    let modoFiltro: boolean | 'todos' = true;

    if (rawAtivo === 'todos' || rawAtivo === 'all' || (req.query.somenteAtivos === 'false' && req.query.ativo === undefined)) {
      modoFiltro = 'todos';
    } else if (rawAtivo === 'false') {
      modoFiltro = false; // somente pausados
    } else if (rawAtivo === 'true') {
      modoFiltro = true; // somente ativos
    } else {
      modoFiltro = true; // padrão: ativos para PDV
    }

    const produtos = await ProdutoService.listar(modoFiltro);
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

  static async alternarStatus(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const { ativo } = req.body || {};
    const produto = await ProdutoService.alternarStatus(
      id,
      typeof ativo === 'boolean' ? ativo : undefined
    );
    res.status(200).json({
      mensagem: produto.ativo
        ? 'Produto reativado com sucesso para venda no PDV.'
        : 'Produto pausado com sucesso (retirado temporariamente do PDV).',
      produto,
      ativo: produto.ativo
    });
  }

  static async inativar(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    await ProdutoService.inativar(id);
    const produto = await ProdutoService.buscarPorId(id);
    res.status(200).json({ mensagem: 'Produto inativado com sucesso (soft delete).', produto, ativo: false });
  }
}
