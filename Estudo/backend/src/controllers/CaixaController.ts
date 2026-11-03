import { Request, Response } from 'express';
import { CaixaModel } from '../models/CaixaModel';
import { AppError } from '../utils/app-error';

export class CaixaController {
  /**
   * Retorna o resumo do turno do vendedor logado
   * Exclusivo para CAIXA (Vendedores)
   */
  static async obterResumoTurno(req: Request, res: Response): Promise<void> {
    if (!req.usuario) {
      throw new AppError('Usuário não autenticado', 401);
    }

    if (req.usuario.cargo !== 'CAIXA') {
      throw new AppError(
        'O resumo de caixa do turno é exclusivo para vendedores/operadores de caixa. Administradores e Gerentes acompanham no painel de auditoria.',
        403
      );
    }

    const resumo = await CaixaModel.obterResumoTurno(req.usuario.id, req.usuario.nome);
    res.status(200).json(resumo);
  }

  /**
   * Realiza o fechamento de caixa do vendedor
   * Exclusivo para CAIXA (Vendedores)
   */
  static async fecharCaixa(req: Request, res: Response): Promise<void> {
    if (!req.usuario) {
      throw new AppError('Usuário não autenticado', 401);
    }

    if (req.usuario.cargo !== 'CAIXA') {
      throw new AppError(
        'O fechamento de caixa é restrito aos Vendedores (Operadores de Caixa). Administradores e Gerentes acompanham e auditam os fechamentos no painel.',
        403
      );
    }

    const { fundo_inicial, dinheiro_informado, observacoes } = req.body;

    if (dinheiro_informado === undefined || dinheiro_informado === null || isNaN(Number(dinheiro_informado))) {
      throw new AppError('O valor de dinheiro em gaveta informado é obrigatório.', 400);
    }

    const fechamento = await CaixaModel.fecharCaixa(
      req.usuario.id,
      req.usuario.nome,
      {
        fundo_inicial: Number(fundo_inicial) || 100.0,
        dinheiro_informado: Number(dinheiro_informado),
        observacoes
      }
    );

    res.status(201).json({
      mensagem: 'Fechamento de caixa registrado com sucesso!',
      fechamento
    });
  }

  /**
   * Lista fechamentos para acompanhamento e auditoria
   * Gerente e Admin veem todos; Caixa vê somente os seus
   */
  static async listarFechamentos(req: Request, res: Response): Promise<void> {
    if (!req.usuario) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const filtros: any = {
      status_diferenca: req.query.status as any,
      data_inicio: req.query.data_inicio as string,
      data_fim: req.query.data_fim as string
    };

    if (req.usuario.cargo === 'CAIXA') {
      filtros.usuario_id = req.usuario.id;
    } else if (req.query.usuario_id) {
      filtros.usuario_id = Number(req.query.usuario_id);
    }

    const resultado = await CaixaModel.listarFechamentos(filtros);
    res.status(200).json(resultado);
  }

  /**
   * Obtém detalhes de um fechamento por ID
   */
  static async obterPorId(req: Request, res: Response): Promise<void> {
    if (!req.usuario) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const id = Number(req.params.id);
    const fechamento = await CaixaModel.obterPorId(id);

    if (!fechamento) {
      throw new AppError('Fechamento de caixa não encontrado.', 404);
    }

    // Se for CAIXA, não pode ver fechamento de outro operador
    if (req.usuario.cargo === 'CAIXA' && fechamento.usuario_id !== req.usuario.id) {
      throw new AppError('Acesso não autorizado a fechamentos de outros caixas.', 403);
    }

    res.status(200).json(fechamento);
  }

  /**
   * Auditoria e parecer gerencial sobre o fechamento de caixa
   * Exclusivo para GERENTE e ADMIN
   */
  static async auditar(req: Request, res: Response): Promise<void> {
    if (!req.usuario) {
      throw new AppError('Usuário não autenticado', 401);
    }

    if (!['ADMIN', 'GERENTE'].includes(req.usuario.cargo)) {
      throw new AppError('Apenas Gerentes e Administradores podem auditar fechamentos de caixa.', 403);
    }

    const id = Number(req.params.id);
    const { gerente_parecer } = req.body;

    if (!gerente_parecer || String(gerente_parecer).trim().length < 3) {
      throw new AppError('O parecer ou observação da auditoria gerencial é obrigatório.', 400);
    }

    const atualizado = await CaixaModel.auditarFechamento(
      id,
      req.usuario.id,
      req.usuario.nome,
      String(gerente_parecer).trim()
    );

    res.status(200).json({
      mensagem: 'Auditoria de fechamento concluída com sucesso!',
      fechamento: atualizado
    });
  }
}
