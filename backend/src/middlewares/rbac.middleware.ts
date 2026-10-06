import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { CargoUsuario } from '../types';

/**
 * Middleware para controle de acesso baseado em papel (RBAC)
 */
export function autorizarCargos(...cargosPermitidos: CargoUsuario[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      throw new AppError('Usuário não autenticado', 401);
    }

    if (!cargosPermitidos.includes(req.usuario.cargo)) {
      throw new AppError(
        `Acesso negado. Ação restrita aos cargos: ${cargosPermitidos.join(', ')}`,
        403
      );
    }

    next();
  };
}
