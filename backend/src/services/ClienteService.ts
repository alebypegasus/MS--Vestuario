import { ClienteModel } from '../models/ClienteModel';
import { ICliente, IClienteCriacaoDTO, IClienteAtualizacaoDTO } from '../types';
import { AppError } from '../utils/app-error';

export class ClienteService {
  /**
   * Cadastra um novo cliente com bloqueio rigoroso de CPF duplicado (RN-01)
   */
  static async criar(dados: IClienteCriacaoDTO): Promise<ICliente> {
    const clienteExistente = await ClienteModel.findByCpf(dados.cpf);
    if (clienteExistente) {
      throw new AppError(
        `O CPF '${dados.cpf}' já está cadastrado para o cliente '${clienteExistente.nome}'.`,
        409
      );
    }

    return await ClienteModel.create(dados);
  }

  static async buscarPorId(id: number): Promise<ICliente> {
    const cliente = await ClienteModel.findById(id);
    if (!cliente) {
      throw new AppError(`Cliente com ID ${id} não encontrado.`, 404);
    }
    return cliente;
  }

  static async buscarPorCpf(cpf: string): Promise<ICliente> {
    const cliente = await ClienteModel.findByCpf(cpf);
    if (!cliente) {
      throw new AppError(`Cliente com CPF '${cpf}' não encontrado.`, 404);
    }
    return cliente;
  }

  static async listar(termo?: string): Promise<ICliente[]> {
    return await ClienteModel.findAll(termo);
  }

  static async atualizar(id: number, dados: IClienteAtualizacaoDTO): Promise<ICliente> {
    await this.buscarPorId(id);
    const atualizado = await ClienteModel.update(id, dados);
    if (!atualizado) {
      throw new AppError('Falha ao atualizar cliente.', 500);
    }
    return atualizado;
  }
}
