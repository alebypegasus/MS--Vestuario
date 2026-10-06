import { VendaModel } from '../models/VendaModel';
import { ProdutoModel } from '../models/ProdutoModel';
import { ClienteModel } from '../models/ClienteModel';
import { IVendaCompleta, CargoUsuario } from '../types';
import { VendaCriacaoInput, VendaCancelamentoInput } from '../validations/venda.validation';
import { AuthService } from './AuthService';
import { AppError } from '../utils/app-error';

export class VendaService {
  // Limite padrão de desconto autônomo para Operadores de Caixa (RN-02)
  private static readonly LIMITE_DESCONTO_CAIXA_PERCENTUAL = 10.0;

  /**
   * Registra a venda aplicando alçadas de desconto (RN-02) e snapshot de preço (RN-04)
   */
  static async criar(
    dados: VendaCriacaoInput,
    operadorId: number,
    operadorCargo: CargoUsuario
  ): Promise<IVendaCompleta> {
    // 1. Validar cliente (se informado - RN-06: se null, Consumidor Final)
    if (dados.cliente_id) {
      const cliente = await ClienteModel.findById(dados.cliente_id);
      if (!cliente) {
        throw new AppError(`Cliente com ID ${dados.cliente_id} não encontrado.`, 404);
      }
    }

    // 2. Pré-calcular subtotal para checagem da alçada de desconto
    let subtotalCalculado = 0;
    for (const item of dados.itens) {
      const produto = await ProdutoModel.findById(item.produto_id);
      if (!produto) {
        throw new AppError(`Produto ID ${item.produto_id} não encontrado.`, 404);
      }
      if (!produto.ativo) {
        throw new AppError(`Produto '${produto.descricao}' está inativo no catálogo.`, 400);
      }
      subtotalCalculado += produto.preco * item.quantidade;
    }
    subtotalCalculado = Number(subtotalCalculado.toFixed(2));

    const desconto = Number((dados.desconto || 0).toFixed(2));
    if (desconto > subtotalCalculado) {
      throw new AppError(
        `O desconto (R$ ${desconto.toFixed(2)}) não pode ser superior ao subtotal (R$ ${subtotalCalculado.toFixed(2)}).`,
        400
      );
    }

    let gerenteAprovadorId: number | null = null;

    // 3. Validação da Regra de Negócio de Desconto (RN-02)
    if (subtotalCalculado > 0 && desconto > 0) {
      const percentualDesconto = (desconto / subtotalCalculado) * 100;

      // Se o desconto ultrapassar os 10%
      if (percentualDesconto > this.LIMITE_DESCONTO_CAIXA_PERCENTUAL) {
        if (operadorCargo === 'GERENTE') {
          // O próprio operador já é Gerente, auto-aprova a alçada
          gerenteAprovadorId = operadorId;
        } else {
          // Operador é Caixa: Exige autorização gerencial no modal
          if (!dados.gerente_aprovador) {
            throw new AppError(
              `Desconto de ${percentualDesconto.toFixed(1)}% ultrapassa o limite permitido para operadores (${this.LIMITE_DESCONTO_CAIXA_PERCENTUAL}%). É necessária autorização gerencial via credenciais do gerente.`,
              403
            );
          }

          const gerente = await AuthService.validarCredenciaisGerente(
            dados.gerente_aprovador.email,
            dados.gerente_aprovador.senha
          );
          gerenteAprovadorId = gerente.id;
        }
      }
    }

    // 4. Delegar ao Model para persistência transacional (ACID)
    return await VendaModel.create({
      usuario_id: operadorId,
      cliente_id: dados.cliente_id || null,
      gerente_aprovador_id: gerenteAprovadorId,
      desconto,
      forma_pagamento: dados.forma_pagamento,
      itens: dados.itens
    });
  }

  /**
   * Cancela uma venda com validação de alçada (RN-03) e imutabilidade (RN-05)
   */
  static async cancelar(
    vendaId: number,
    dados: VendaCancelamentoInput,
    usuarioLogadoId: number,
    usuarioLogadoCargo: CargoUsuario
  ): Promise<IVendaCompleta> {
    const venda = await VendaModel.findById(vendaId);
    if (!venda) {
      throw new AppError(`Venda ID ${vendaId} não encontrada.`, 404);
    }

    if (venda.status === 'CANCELADA') {
      throw new AppError('Esta venda já se encontra cancelada.', 400);
    }

    let gerenteId: number;

    // Se o usuário logado for Gerente, ele próprio aprova o cancelamento
    if (usuarioLogadoCargo === 'GERENTE') {
      gerenteId = usuarioLogadoId;
    } else {
      // Se for Caixa, deve fornecer credenciais do Gerente no modal de autorização (RN-03)
      if (!dados.gerente_aprovador) {
        throw new AppError(
          'Cancelamento de vendas exige alçada gerencial. Forneça e-mail e senha de um Gerente.',
          403
        );
      }

      const gerente = await AuthService.validarCredenciaisGerente(
        dados.gerente_aprovador.email,
        dados.gerente_aprovador.senha
      );
      gerenteId = gerente.id;
    }

    const cancelado = await VendaModel.cancel(vendaId, gerenteId, dados.motivo);
    if (!cancelado) {
      throw new AppError('Falha ao processar o cancelamento da venda.', 500);
    }

    return (await VendaModel.findById(vendaId))!;
  }

  static async buscarPorId(id: number): Promise<IVendaCompleta> {
    const venda = await VendaModel.findById(id);
    if (!venda) {
      throw new AppError(`Venda ID ${id} não encontrada.`, 404);
    }
    return venda;
  }

  static async listarTodas(): Promise<IVendaCompleta[]> {
    return await VendaModel.findAll();
  }
}
