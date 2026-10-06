import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error';
import { CargoUsuario } from '../types';

export interface UsuarioAutenticadoPayload {
  id: number;
  nome: string;
  email: string;
  cargo: CargoUsuario;
}

// Extensão da tipagem Request do Express para carregar o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticadoPayload;
    }
  }
}

export function autenticarJWT(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token de autenticação não fornecido', 401);
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError('Token malformatado', 401);
  }

  const secret = process.env.JWT_SECRET || 'ms2_vestuario_secret_token_chave_super_segura_2026';

  try {
    const decoded = jwt.verify(token, secret) as UsuarioAutenticadoPayload;
    req.usuario = decoded;
    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
}
