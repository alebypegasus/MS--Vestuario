import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { db } from '../config/database';
import { IFechamentoCaixa, IFechamentoCriacaoDTO, IResumoTurno, IFiltrosFechamento } from '../types/caixa.types';

export class CaixaModel {
  private static tabelaCriada = false;

  /**
   * Garante a existência da tabela fechamentos_caixa (Idempotente)
   */
  static async garantirTabela(): Promise<void> {
    if (this.tabelaCriada) return;
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS fechamentos_caixa (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
          usuario_nome TEXT NOT NULL,
          data_abertura TEXT NOT NULL,
          data_fechamento TEXT NOT NULL,
          fundo_inicial REAL NOT NULL DEFAULT 0.00,
          total_vendas_dinheiro REAL NOT NULL DEFAULT 0.00,
          total_vendas_pix REAL NOT NULL DEFAULT 0.00,
          total_vendas_cartao_credito REAL NOT NULL DEFAULT 0.00,
          total_vendas_cartao_debito REAL NOT NULL DEFAULT 0.00,
          total_vendas_geral REAL NOT NULL DEFAULT 0.00,
          quantidade_vendas INTEGER NOT NULL DEFAULT 0,
          dinheiro_informado REAL NOT NULL DEFAULT 0.00,
          saldo_esperado_dinheiro REAL NOT NULL DEFAULT 0.00,
          diferenca REAL NOT NULL DEFAULT 0.00,
          status_diferenca TEXT NOT NULL DEFAULT 'CORRETO',
          observacoes TEXT,
          gerente_auditor_id INTEGER,
          gerente_auditor_nome TEXT,
          gerente_parecer TEXT,
          data_auditoria TEXT,
          criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );
      `);
      this.tabelaCriada = true;
    } catch {
      // Pode falhar caso seja MySQL com sintaxe AUTO_INCREMENT em vez de AUTOINCREMENT
      try {
        await db.execute(`
          CREATE TABLE IF NOT EXISTS fechamentos_caixa (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            usuario_nome VARCHAR(255) NOT NULL,
            data_abertura DATETIME NOT NULL,
            data_fechamento DATETIME NOT NULL,
            fundo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            total_vendas_dinheiro DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            total_vendas_pix DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            total_vendas_cartao_credito DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            total_vendas_cartao_debito DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            total_vendas_geral DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            quantidade_vendas INT NOT NULL DEFAULT 0,
            dinheiro_informado DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            saldo_esperado_dinheiro DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            diferenca DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            status_diferenca VARCHAR(20) NOT NULL DEFAULT 'CORRETO',
            observacoes TEXT NULL,
            gerente_auditor_id INT NULL,
            gerente_auditor_nome VARCHAR(255) NULL,
            gerente_parecer TEXT NULL,
            data_auditoria DATETIME NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        this.tabelaCriada = true;
      } catch (e: any) {
        console.warn('Aviso ao garantir tabela fechamentos_caixa:', e.message);
      }
    }
  }

  /**
   * Obtém o resumo de vendas do turno atual do vendedor
   */
  static async obterResumoTurno(usuarioId: number, usuarioNome: string): Promise<IResumoTurno> {
    await this.garantirTabela();

    // Busca o último fechamento deste vendedor para limitar o intervalo do turno
    let ultimoFechamentoData: string | null = null;
    try {
      const [rowsUltimo]: any = await db.execute(
        `SELECT data_fechamento FROM fechamentos_caixa WHERE usuario_id = ? ORDER BY id DESC LIMIT 1`,
        [usuarioId]
      );
      if (Array.isArray(rowsUltimo) && rowsUltimo.length > 0) {
        ultimoFechamentoData = rowsUltimo[0].data_fechamento;
      }
    } catch {
      // Ignora erro se tabela vazia
    }

    // Consulta de vendas ativas (status = 'CONCLUIDA') do operador desde o último fechamento ou do dia de hoje
    let queryVendas = `
      SELECT forma_pagamento, valor_total, criado_em
      FROM vendas
      WHERE usuario_id = ? AND status = 'CONCLUIDA'
    `;
    const params: any[] = [usuarioId];

    if (ultimoFechamentoData) {
      queryVendas += ` AND criado_em > ?`;
      params.push(ultimoFechamentoData);
    } else {
      // Se nunca fechou, pega as do dia corrente
      const hoje = new Date();
      const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
      queryVendas += ` AND DATE(criado_em) = ?`;
      params.push(hojeStr);
    }

    const [vendas]: any = await db.execute(queryVendas, params);
    const lista = Array.isArray(vendas) ? vendas : [];

    let totalDinheiro = 0;
    let totalPix = 0;
    let totalCartaoCredito = 0;
    let totalCartaoDebito = 0;

    for (const v of lista) {
      const valor = Number(v.valor_total) || 0;
      const forma = String(v.forma_pagamento).toUpperCase();
      if (forma === 'DINHEIRO') totalDinheiro += valor;
      else if (forma === 'PIX') totalPix += valor;
      else if (forma === 'CARTAO_CREDITO') totalCartaoCredito += valor;
      else if (forma === 'CARTAO_DEBITO') totalCartaoDebito += valor;
      else totalDinheiro += valor;
    }

    const totalGeral = totalDinheiro + totalPix + totalCartaoCredito + totalCartaoDebito;
    const fundoPadrao = 100.00; // Fundo de troco inicial sugerido padrão de mercado

    const now = new Date();
    const dataAberturaSugerida = ultimoFechamentoData || `${now.toISOString().split('T')[0]} 08:00:00`;

    return {
      usuario_id: usuarioId,
      usuario_nome: usuarioNome,
      data_abertura_sugerida: dataAberturaSugerida,
      fundo_inicial_padrao: fundoPadrao,
      quantidade_vendas: lista.length,
      total_vendas_dinheiro: Number(totalDinheiro.toFixed(2)),
      total_vendas_pix: Number(totalPix.toFixed(2)),
      total_vendas_cartao_credito: Number(totalCartaoCredito.toFixed(2)),
      total_vendas_cartao_debito: Number(totalCartaoDebito.toFixed(2)),
      total_vendas_geral: Number(totalGeral.toFixed(2)),
      saldo_esperado_dinheiro: Number((fundoPadrao + totalDinheiro).toFixed(2))
    };
  }

  /**
   * Grava o fechamento de caixa do vendedor com cálculo de sobra ou falta
   */
  static async fecharCaixa(
    usuarioId: number,
    usuarioNome: string,
    dados: IFechamentoCriacaoDTO
  ): Promise<IFechamentoCaixa> {
    await this.garantirTabela();

    const resumo = await this.obterResumoTurno(usuarioId, usuarioNome);

    const fundoInicial = Number(dados.fundo_inicial) >= 0 ? Number(dados.fundo_inicial) : 100.00;
    const dinheiroInformado = Number(dados.dinheiro_informado) >= 0 ? Number(dados.dinheiro_informado) : 0.00;

    const saldoEsperadoDinheiro = Number((fundoInicial + resumo.total_vendas_dinheiro).toFixed(2));
    const diferenca = Number((dinheiroInformado - saldoEsperadoDinheiro).toFixed(2));

    let statusDiferenca: 'CORRETO' | 'FALTA' | 'SOBRA' = 'CORRETO';
    if (diferenca < -0.01) {
      statusDiferenca = 'FALTA';
    } else if (diferenca > 0.01) {
      statusDiferenca = 'SOBRA';
    }

    const agora = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const sql = `
      INSERT INTO fechamentos_caixa (
        usuario_id, usuario_nome, data_abertura, data_fechamento,
        fundo_inicial, total_vendas_dinheiro, total_vendas_pix,
        total_vendas_cartao_credito, total_vendas_cartao_debito,
        total_vendas_geral, quantidade_vendas, dinheiro_informado,
        saldo_esperado_dinheiro, diferenca, status_diferenca, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [res]: any = await db.execute(sql, [
      usuarioId,
      usuarioNome,
      resumo.data_abertura_sugerida,
      agora,
      fundoInicial,
      resumo.total_vendas_dinheiro,
      resumo.total_vendas_pix,
      resumo.total_vendas_cartao_credito,
      resumo.total_vendas_cartao_debito,
      resumo.total_vendas_geral,
      resumo.quantidade_vendas,
      dinheiroInformado,
      saldoEsperadoDinheiro,
      diferenca,
      statusDiferenca,
      dados.observacoes || null
    ]);

    const id = res?.insertId || res?.lastID;
    const fechamento = await this.obterPorId(id);
    if (!fechamento) {
      throw new Error('Falha ao recuperar o fechamento gravado');
    }

    return fechamento;
  }

  /**
   * Busca um fechamento específico pelo ID
   */
  static async obterPorId(id: number): Promise<IFechamentoCaixa | null> {
    await this.garantirTabela();
    const [rows]: any = await db.execute(
      `SELECT * FROM fechamentos_caixa WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;
    const r = rows[0];

    return {
      id: r.id,
      usuario_id: r.usuario_id,
      usuario_nome: r.usuario_nome,
      data_abertura: r.data_abertura,
      data_fechamento: r.data_fechamento,
      fundo_inicial: Number(r.fundo_inicial),
      total_vendas_dinheiro: Number(r.total_vendas_dinheiro),
      total_vendas_pix: Number(r.total_vendas_pix),
      total_vendas_cartao_credito: Number(r.total_vendas_cartao_credito),
      total_vendas_cartao_debito: Number(r.total_vendas_cartao_debito),
      total_vendas_geral: Number(r.total_vendas_geral),
      quantidade_vendas: Number(r.quantidade_vendas),
      dinheiro_informado: Number(r.dinheiro_informado),
      saldo_esperado_dinheiro: Number(r.saldo_esperado_dinheiro),
      diferenca: Number(r.diferenca),
      status_diferenca: r.status_diferenca,
      observacoes: r.observacoes,
      gerente_auditor_id: r.gerente_auditor_id,
      gerente_auditor_nome: r.gerente_auditor_nome,
      gerente_parecer: r.gerente_parecer,
      data_auditoria: r.data_auditoria,
      criado_em: r.criado_em
    };
  }

  /**
   * Lista fechamentos para painel de auditoria (Admin e Gerente)
   */
  static async listarFechamentos(filtros: IFiltrosFechamento = {}): Promise<{
    itens: IFechamentoCaixa[];
    estatisticas: {
      total_fechamentos: number;
      total_faltas: number;
      valor_total_faltas: number;
      total_sobras: number;
      valor_total_sobras: number;
      total_corretos: number;
      total_geral_movimentado: number;
    };
  }> {
    await this.garantirTabela();

    let sql = `SELECT * FROM fechamentos_caixa WHERE 1=1`;
    const params: any[] = [];

    if (filtros.usuario_id) {
      sql += ` AND usuario_id = ?`;
      params.push(filtros.usuario_id);
    }
    if (filtros.status_diferenca) {
      sql += ` AND status_diferenca = ?`;
      params.push(filtros.status_diferenca);
    }
    if (filtros.data_inicio) {
      sql += ` AND data_fechamento >= ?`;
      params.push(`${filtros.data_inicio} 00:00:00`);
    }
    if (filtros.data_fim) {
      sql += ` AND data_fechamento <= ?`;
      params.push(`${filtros.data_fim} 23:59:59`);
    }

    sql += ` ORDER BY id DESC`;

    const [rows]: any = await db.execute(sql, params);
    const lista = Array.isArray(rows) ? rows : [];

    const itens: IFechamentoCaixa[] = lista.map((r: any) => ({
      id: r.id,
      usuario_id: r.usuario_id,
      usuario_nome: r.usuario_nome,
      data_abertura: r.data_abertura,
      data_fechamento: r.data_fechamento,
      fundo_inicial: Number(r.fundo_inicial),
      total_vendas_dinheiro: Number(r.total_vendas_dinheiro),
      total_vendas_pix: Number(r.total_vendas_pix),
      total_vendas_cartao_credito: Number(r.total_vendas_cartao_credito),
      total_vendas_cartao_debito: Number(r.total_vendas_cartao_debito),
      total_vendas_geral: Number(r.total_vendas_geral),
      quantidade_vendas: Number(r.quantidade_vendas),
      dinheiro_informado: Number(r.dinheiro_informado),
      saldo_esperado_dinheiro: Number(r.saldo_esperado_dinheiro),
      diferenca: Number(r.diferenca),
      status_diferenca: r.status_diferenca,
      observacoes: r.observacoes,
      gerente_auditor_id: r.gerente_auditor_id,
      gerente_auditor_nome: r.gerente_auditor_nome,
      gerente_parecer: r.gerente_parecer,
      data_auditoria: r.data_auditoria,
      criado_em: r.criado_em
    }));

    let totalFaltas = 0;
    let valorTotalFaltas = 0;
    let totalSobras = 0;
    let valorTotalSobras = 0;
    let totalCorretos = 0;
    let totalGeralMovimentado = 0;

    for (const item of itens) {
      totalGeralMovimentado += item.total_vendas_geral;
      if (item.status_diferenca === 'FALTA') {
        totalFaltas++;
        valorTotalFaltas += Math.abs(item.diferenca);
      } else if (item.status_diferenca === 'SOBRA') {
        totalSobras++;
        valorTotalSobras += item.diferenca;
      } else {
        totalCorretos++;
      }
    }

    return {
      itens,
      estatisticas: {
        total_fechamentos: itens.length,
        total_faltas: totalFaltas,
        valor_total_faltas: Number(valorTotalFaltas.toFixed(2)),
        total_sobras: totalSobras,
        valor_total_sobras: Number(valorTotalSobras.toFixed(2)),
        total_corretos: totalCorretos,
        total_geral_movimentado: Number(totalGeralMovimentado.toFixed(2))
      }
    };
  }

  /**
   * Auditoria de fechamento realizada por Gerente ou Admin
   */
  static async auditarFechamento(
    id: number,
    gerenteId: number,
    gerenteNome: string,
    parecer: string
  ): Promise<IFechamentoCaixa> {
    await this.garantirTabela();
    const agora = new Date().toISOString().replace('T', ' ').substring(0, 19);

    await db.execute(
      `UPDATE fechamentos_caixa
       SET gerente_auditor_id = ?,
           gerente_auditor_nome = ?,
           gerente_parecer = ?,
           data_auditoria = ?
       WHERE id = ?`,
      [gerenteId, gerenteNome, parecer, agora, id]
    );

    const atualizado = await this.obterPorId(id);
    if (!atualizado) {
      throw new Error(`Fechamento #${id} não encontrado.`);
    }

    return atualizado;
  }
}
