import { RowDataPacket } from 'mysql2';
import { db } from '../config/database';
import { IEmpresa, IEmpresaAtualizacaoDTO } from '../types';

export class EmpresaModel {
  static async obter(): Promise<IEmpresa> {
    const query = `
      SELECT id, razao_social, nome_fantasia, cnpj, inscricao_estadual, telefone, email,
             logradouro, numero, complemento, bairro, cidade, uf, cep,
             regime_tributario, mensagem_cupom, atualizado_em
      FROM configuracao_empresa
      WHERE id = 1
      LIMIT 1
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query);
    if (rows.length === 0) {
      throw new Error('Configuração de empresa não encontrada');
    }
    const row = rows[0];
    return {
      id: row.id,
      razao_social: row.razao_social,
      nome_fantasia: row.nome_fantasia,
      cnpj: row.cnpj,
      inscricao_estadual: row.inscricao_estadual,
      telefone: row.telefone,
      email: row.email,
      logradouro: row.logradouro,
      numero: row.numero,
      complemento: row.complemento,
      bairro: row.bairro,
      cidade: row.cidade,
      uf: row.uf,
      cep: row.cep,
      regime_tributario: row.regime_tributario,
      mensagem_cupom: row.mensagem_cupom,
      atualizado_em: row.atualizado_em,
    };
  }

  static async atualizar(dados: IEmpresaAtualizacaoDTO): Promise<IEmpresa> {
    const campos: string[] = [];
    const params: (string | null)[] = [];

    const keys: (keyof IEmpresaAtualizacaoDTO)[] = [
      'razao_social', 'nome_fantasia', 'cnpj', 'inscricao_estadual',
      'telefone', 'email', 'logradouro', 'numero', 'complemento',
      'bairro', 'cidade', 'uf', 'cep', 'regime_tributario', 'mensagem_cupom'
    ];

    for (const key of keys) {
      if (dados[key] !== undefined) {
        campos.push(`${key} = ?`);
        params.push(dados[key] ?? null);
      }
    }

    if (campos.length > 0) {
      const query = `UPDATE configuracao_empresa SET ${campos.join(', ')} WHERE id = 1`;
      await db.execute(query, params);
    }

    return this.obter();
  }
}
