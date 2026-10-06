import { ProdutoModel } from '../models/ProdutoModel';
import { IProduto, IProdutoCriacaoDTO, IProdutoAtualizacaoDTO } from '../types';
import { AppError } from '../utils/app-error';

export class ProdutoService {
  /**
   * Cadastra um novo produto no catálogo garantindo unicidade de código/SKU
   */
  static async criar(dados: IProdutoCriacaoDTO): Promise<IProduto> {
    const produtoExistente = await ProdutoModel.findByCodigo(dados.codigo);
    if (produtoExistente) {
      throw new AppError(
        `Já existe um produto com o código '${dados.codigo}' (${produtoExistente.descricao}).`,
        409
      );
    }

    return await ProdutoModel.create(dados);
  }

  static async buscarPorId(id: number): Promise<IProduto> {
    const produto = await ProdutoModel.findById(id);
    if (!produto) {
      throw new AppError(`Produto com ID ${id} não encontrado.`, 404);
    }
    return produto;
  }

  static async buscarPorCodigo(codigo: string): Promise<IProduto> {
    const produto = await ProdutoModel.findByCodigo(codigo);
    if (!produto) {
      throw new AppError(`Produto com código '${codigo}' não encontrado.`, 404);
    }
    return produto;
  }

  static async listar(somenteAtivos: boolean = true): Promise<IProduto[]> {
    return await ProdutoModel.findAll(somenteAtivos);
  }

  static async atualizar(id: number, dados: IProdutoAtualizacaoDTO): Promise<IProduto> {
    await this.buscarPorId(id);

    if (dados.codigo) {
      const comMesmoCodigo = await ProdutoModel.findByCodigo(dados.codigo);
      if (comMesmoCodigo && comMesmoCodigo.id !== id) {
        throw new AppError(`O código '${dados.codigo}' já pertence a outro produto.`, 409);
      }
    }

    const atualizado = await ProdutoModel.update(id, dados);
    if (!atualizado) {
      throw new AppError('Falha ao atualizar produto.', 500);
    }
    return atualizado;
  }

  /**
   * Inativação lógica (RN-08: Soft Delete para preservar histórico de vendas)
   */
  static async inativar(id: number): Promise<boolean> {
    await this.buscarPorId(id);
    return await ProdutoModel.inactivate(id);
  }
}
