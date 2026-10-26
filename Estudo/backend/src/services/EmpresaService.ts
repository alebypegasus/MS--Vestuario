import { EmpresaModel } from '../models/EmpresaModel';
import { IEmpresa, IEmpresaAtualizacaoDTO } from '../types';

export class EmpresaService {
  static async obter(): Promise<IEmpresa> {
    return await EmpresaModel.obter();
  }

  static async atualizar(dados: IEmpresaAtualizacaoDTO): Promise<IEmpresa> {
    return await EmpresaModel.atualizar(dados);
  }
}
