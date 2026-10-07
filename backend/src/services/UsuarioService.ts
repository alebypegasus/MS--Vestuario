import bcrypt from 'bcryptjs';
import { UsuarioModel } from '../models/UsuarioModel';
import { IUsuarioRespostaDTO } from '../types';
import { AppError } from '../utils/app-error';
import { UsuarioCriacaoInput, UsuarioAtualizacaoInput } from '../validations/usuario.validation';

export class UsuarioService {
  /**
   * Cadastra um novo usuário/funcionário com hash de senha seguro
   */
  static async criar(dados: UsuarioCriacaoInput): Promise<IUsuarioRespostaDTO> {
    const usuarioExistente = await UsuarioModel.findByEmail(dados.email);
    if (usuarioExistente) {
      throw new AppError(`O e-mail '${dados.email}' já está em uso por outro usuário.`, 409);
    }

    const senha_hash = await bcrypt.hash(dados.senha, 10);
    const novoUsuario = await UsuarioModel.create({
      nome: dados.nome,
      email: dados.email,
      senha_hash,
      cargo: dados.cargo
    });

    const { senha_hash: _, ...usuarioSemSenha } = novoUsuario;
    return usuarioSemSenha;
  }

  /**
   * Lista todos os usuários cadastrados
   */
  static async listarTodos(): Promise<IUsuarioRespostaDTO[]> {
    return await UsuarioModel.findAll();
  }

  /**
   * Busca usuário por ID
   */
  static async buscarPorId(id: number): Promise<IUsuarioRespostaDTO> {
    const usuario = await UsuarioModel.findById(id);
    if (!usuario) {
      throw new AppError(`Usuário com ID ${id} não encontrado.`, 404);
    }

    const { senha_hash, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }

  /**
   * Atualiza dados de um usuário
   */
  static async atualizar(id: number, dados: UsuarioAtualizacaoInput): Promise<IUsuarioRespostaDTO> {
    await this.buscarPorId(id);

    if (dados.email) {
      const emailEmUso = await UsuarioModel.findByEmail(dados.email);
      if (emailEmUso && emailEmUso.id !== id) {
        throw new AppError(`O e-mail '${dados.email}' já está em uso.`, 409);
      }
    }

    const camposParaAtualizar: any = { ...dados };
    if (dados.senha) {
      camposParaAtualizar.senha_hash = await bcrypt.hash(dados.senha, 10);
      delete camposParaAtualizar.senha;
    }

    const atualizado = await UsuarioModel.update(id, camposParaAtualizar);
    if (!atualizado) {
      throw new AppError('Falha ao atualizar usuário.', 500);
    }

    return atualizado;
  }

  /**
   * Ativa ou desativa um usuário
   */
  static async alterarStatus(id: number, ativo: boolean): Promise<{ mensagem: string }> {
    await this.buscarPorId(id);
    const alterado = await UsuarioModel.updateStatus(id, ativo);
    if (!alterado) {
      throw new AppError('Falha ao alterar status do usuário.', 500);
    }

    return {
      mensagem: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso.`
    };
  }
}
