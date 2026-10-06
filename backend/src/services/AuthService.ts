import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/UsuarioModel';
import { AppError } from '../utils/app-error';
import { IUsuario, IUsuarioRespostaDTO } from '../types';
import { LoginInput } from '../validations/auth.validation';

export class AuthService {
  /**
   * Realiza login no sistema e emite token JWT
   */
  static async login(dados: LoginInput): Promise<{ usuario: IUsuarioRespostaDTO; token: string }> {
    const usuario = await UsuarioModel.findByEmail(dados.email);

    if (!usuario) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    if (!usuario.ativo) {
      throw new AppError('Usuário desativado. Entre em contato com a gerência.', 403);
    }

    const senhaCorreta = await bcrypt.compare(dados.senha, usuario.senha_hash);
    if (!senhaCorreta) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const secret = process.env.JWT_SECRET || 'ms2_vestuario_secret_token_chave_super_segura_2026';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      },
      secret,
      { expiresIn }
    );

    const { senha_hash, ...usuarioSemSenha } = usuario;

    return {
      usuario: usuarioSemSenha,
      token
    };
  }

  /**
   * Valida credenciais pontuais de um GERENTE (usado no modal de aprovação do PDV - RN-02 e RN-03)
   */
  static async validarCredenciaisGerente(email: string, senha: string): Promise<IUsuario> {
    const gerente = await UsuarioModel.findByEmail(email);

    if (!gerente) {
      throw new AppError('Credenciais gerenciais inválidas', 401);
    }

    if (!gerente.ativo) {
      throw new AppError('Gerente inativo no sistema', 403);
    }

    if (gerente.cargo !== 'GERENTE') {
      throw new AppError('O usuário informado não possui alçada de GERENTE', 403);
    }

    const senhaCorreta = await bcrypt.compare(senha, gerente.senha_hash);
    if (!senhaCorreta) {
      throw new AppError('Senha gerencial incorreta', 401);
    }

    return gerente;
  }
}
