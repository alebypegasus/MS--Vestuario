import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export function tratarErros(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Erros operacionais conhecidos
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      erro: err.message,
      detalhes: err.details
    });
    return;
  }

  // Erros não tratados ou inesperados
  console.error('[UnhandledError]', err);

  res.status(500).json({
    erro: 'Erro interno no servidor',
    mensagem: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}
