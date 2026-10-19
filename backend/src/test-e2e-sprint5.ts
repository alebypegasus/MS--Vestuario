import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import http from 'http';
import apiRoutes from './routes';
import { db } from './config/database';
import { tratarErros } from './middlewares/error.middleware';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);
app.use(tratarErros);

const TEST_PORT = 3098;

async function request(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<{ status: number; data: any }> {
  const url = `http://localhost:${TEST_PORT}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function assertStatus(actual: number, expected: number, testName: string, data?: any) {
  if (actual !== expected) {
    throw new Error(`[FALHA] ${testName}: Esperado HTTP ${expected}, recebido HTTP ${actual} - Resposta: ${JSON.stringify(data)}`);
  }
}

function assertCondition(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    throw new Error(`[FALHA] ${testName}: ${detail || 'Condição de validação não atendida'}`);
  }
}

async function runE2ETests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));

  console.log(`\n========================================================================`);
  console.log(`🚀 SPRINT 5: SUITE DE TESTES DE INTEGRAÇÃO & HOMOLOGAÇÃO E2E (MS² VESTUÁRIO)`);
  console.log(`========================================================================\n`);

  try {
    // LIMPEZA PREVENTIVA PARA REPETIBILIDADE
    await db.execute("DELETE FROM clientes WHERE cpf IN ('06451470287', '064.514.702-87', '75618456073')");
    await db.execute("DELETE FROM produtos WHERE codigo = 'TEST-SPRINT5-999'");

    // -------------------------------------------------------------
    // BLOCO 1: AUTENTICAÇÃO E PERFIS DE ACESSO (RBAC)
    // -------------------------------------------------------------
    console.log('📌 BLOCO 1: AUTENTICAÇÃO E MATRIZ RBAC (CAIXA / GERENTE / ADMIN)');

    console.log(' [1/18] Autenticação do Operador de Caixa...');
    const loginCaixa = await request('POST', '/api/auth/login', {
      email: 'caixa@ms2.com.br',
      senha: 'caixa123',
    });
    assertStatus(loginCaixa.status, 200, 'Login Caixa', loginCaixa.data);
    const tokenCaixa = loginCaixa.data.token;
    assertCondition(loginCaixa.data.usuario.cargo === 'CAIXA', 'Cargo Caixa');
    console.log(`  -> OK: Caixa "${loginCaixa.data.usuario.nome}" autenticado com sucesso.`);

    console.log(' [2/18] Autenticação do Gerente de Loja...');
    const loginGerente = await request('POST', '/api/auth/login', {
      email: 'gerente@ms2.com.br',
      senha: 'admin123',
    });
    assertStatus(loginGerente.status, 200, 'Login Gerente', loginGerente.data);
    const tokenGerente = loginGerente.data.token;
    assertCondition(loginGerente.data.usuario.cargo === 'GERENTE', 'Cargo Gerente');
    console.log(`  -> OK: Gerente "${loginGerente.data.usuario.nome}" autenticado com sucesso.`);

    console.log(' [3/18] Autenticação do Administrador Geral...');
    const loginAdmin = await request('POST', '/api/auth/login', {
      email: 'admin@ms2.com.br',
      senha: 'admin123',
    });
    assertStatus(loginAdmin.status, 200, 'Login Admin', loginAdmin.data);
    const tokenAdmin = loginAdmin.data.token;
    assertCondition(loginAdmin.data.usuario.cargo === 'ADMIN', 'Cargo Admin');
    console.log(`  -> OK: Administrador "${loginAdmin.data.usuario.nome}" autenticado com sucesso.`);

    // -------------------------------------------------------------
    // BLOCO 2: GESTÃO DE CLIENTES E INTEGRIDADE DE CPF (RN-01)
    // -------------------------------------------------------------
    console.log('\n📌 BLOCO 2: CADASTRO DE CLIENTES & VALIDAÇÃO MÓDULO 11 (RN-01)');

    console.log(' [4/18] Cadastrar Cliente Real Válido no Balcão (RN-01)...');
    const cpfValido = '06451470287'; // CPF matemático válido oficial
    const clienteCriado = await request(
      'POST',
      '/api/clientes',
      {
        nome: 'Camila Fernandes (Cliente Homologação)',
        cpf: cpfValido,
        telefone: '(21) 98765-4321',
        email: 'camila.homolog@vestuario.com',
      },
      tokenCaixa
    );
    assertStatus(clienteCriado.status, 201, 'Cadastro Cliente', clienteCriado.data);
    const clienteId = clienteCriado.data.id;
    console.log(`  -> OK: Cliente cadastrado ID ${clienteId} com CPF ${clienteCriado.data.cpf}.`);

    console.log(' [5/18] Tentativa de Duplicidade de CPF (RN-01 - Conflito 409)...');
    const clienteDuplicado = await request(
      'POST',
      '/api/clientes',
      {
        nome: 'Camila Clone Teste',
        cpf: cpfValido,
        telefone: '(21) 90000-0000',
      },
      tokenCaixa
    );
    assertStatus(clienteDuplicado.status, 409, 'Bloqueio CPF Duplicado');
    console.log(`  -> OK: Bloqueio 409 Conflict acionado: "${clienteDuplicado.data.erro}".`);

    // -------------------------------------------------------------
    // BLOCO 3: CICLO DE VIDA DO CATÁLOGO DE PRODUTOS & RBAC
    // -------------------------------------------------------------
    console.log('\n📌 BLOCO 3: PRODUTOS, PAUSA GERENCIAL & EXCLUSÃO POR ADMIN');

    console.log(' [6/18] Criação de Novo Produto no Catálogo pelo Gerente...');
    const prodNovo = await request(
      'POST',
      '/api/produtos',
      {
        codigo: 'TEST-SPRINT5-999',
        descricao: 'Vestido Especial Teste Homologação',
        categoria: 'Vestidos',
        preco: 189.90,
      },
      tokenGerente
    );
    assertStatus(prodNovo.status, 201, 'Criar Produto Gerente');
    const prodId = prodNovo.data.id;
    console.log(`  -> OK: Produto criado ID ${prodId} (Cód: ${prodNovo.data.codigo}, R$ ${prodNovo.data.preco}).`);

    console.log(' [7/18] Gerente Pausa o Produto no Catálogo (ativo = 0)...');
    const pausaGerente = await request(
      'PATCH',
      `/api/produtos/${prodId}/status`,
      { ativo: false },
      tokenGerente
    );
    assertStatus(pausaGerente.status, 200, 'Pausar Produto Gerente');
    assertCondition(pausaGerente.data.ativo === false || pausaGerente.data.ativo === 0, 'Status Pausado');
    console.log('  -> OK: Produto pausado com sucesso pelo Gerente.');

    console.log(' [8/18] Caixa Tenta Excluir Produto (Bloqueio 403 Forbidden)...');
    const tentativaExcluirCaixa = await request(
      'DELETE',
      `/api/produtos/${prodId}`,
      undefined,
      tokenCaixa
    );
    assertStatus(tentativaExcluirCaixa.status, 403, 'Bloqueio Excluir Caixa');
    console.log('  -> OK: Caixa barrado com 403 Forbidden para exclusão de produto.');

    console.log(' [9/18] Gerente Tenta Excluir Produto (Bloqueio 403 - Somente Admin Exclui)...');
    const tentativaExcluirGerente = await request(
      'DELETE',
      `/api/produtos/${prodId}`,
      undefined,
      tokenGerente
    );
    assertStatus(tentativaExcluirGerente.status, 403, 'Bloqueio Excluir Gerente');
    console.log('  -> OK: Gerente barrado com 403 Forbidden para exclusão física de produto.');

    console.log(' [10/18] Admin Exclui Produto com Sucesso (DELETE /api/produtos/:id)...');
    const exclusaoAdmin = await request(
      'DELETE',
      `/api/produtos/${prodId}`,
      undefined,
      tokenAdmin
    );
    assertStatus(exclusaoAdmin.status, 200, 'Exclusão Produto Admin');
    console.log('  -> OK: Administrador excluiu o produto de teste permanentemente.');

    // -------------------------------------------------------------
    // BLOCO 4: FLUXO COMPLETO DE VENDA NO PDV (RN-02, RN-04, RN-06)
    // -------------------------------------------------------------
    console.log('\n📌 BLOCO 4: OPERAÇÃO DE CAIXA PDV, ALÇADAS RN-02 & SNAPSHOT RN-04');

    console.log(' [11/18] Venda Normal com Desconto <= 10% (Autonomia do Caixa)...');
    // Produto 101: R$ 49.90. Desconto R$ 4.00 (< 10%).
    const venda1 = await request(
      'POST',
      '/api/vendas',
      {
        cliente_id: clienteId,
        forma_pagamento: 'PIX',
        desconto: 4.00,
        itens: [{ produto_id: 1, quantidade: 2 }], // 2x 49.90 = 99.80 - 4 = 95.80
      },
      tokenCaixa
    );
    assertStatus(venda1.status, 201, 'Venda Desconto Normal', venda1.data);
    const subtotalNum = Number(venda1.data.subtotal);
    const totalEsperado = subtotalNum - 4.00;
    assertCondition(
      Math.abs(Number(venda1.data.valor_total) - totalEsperado) < 0.05,
      'Valor Líquido Venda 1 (RN-07)',
      `Esperado ${totalEsperado}, mas retornou ${venda1.data.valor_total} (subtotal: ${subtotalNum})`
    );
    console.log(`  -> OK: Venda nº ${venda1.data.id} finalizada. Subtotal: R$ ${venda1.data.subtotal} | Líquido: R$ ${venda1.data.valor_total}`);

    console.log(' [12/18] Tentativa de Venda com Desconto > 10% Sem Gerente (Bloqueio 403)...');
    // Subtotal 49.90, Desconto 20.00 (> 40%)
    const vendaBarrada = await request(
      'POST',
      '/api/vendas',
      {
        cliente_id: clienteId,
        forma_pagamento: 'DINHEIRO',
        desconto: 20.00,
        itens: [{ produto_id: 1, quantidade: 1 }],
      },
      tokenCaixa
    );
    assertStatus(vendaBarrada.status, 403, 'Bloqueio Desconto sem Gerente');
    console.log(`  -> OK: Bloqueio 403 acionado: "${vendaBarrada.data.erro}".`);

    console.log(' [13/18] Venda com Desconto > 10% Aprovada por Gerente (Modal Alçada RN-02)...');
    const vendaComAlcada = await request(
      'POST',
      '/api/vendas',
      {
        cliente_id: clienteId,
        forma_pagamento: 'CARTAO_CREDITO',
        desconto: 20.00,
        itens: [{ produto_id: 1, quantidade: 1 }],
        gerente_aprovador: {
          email: 'gerente@ms2.com.br',
          senha: 'admin123',
        },
      },
      tokenCaixa
    );
    assertStatus(vendaComAlcada.status, 201, 'Venda Desconto com Alçada');
    assertCondition(vendaComAlcada.data.gerente_aprovador_id !== null, 'Aprovador Gerente Registrado');
    console.log(`  -> OK: Venda nº ${vendaComAlcada.data.id} aprovada pelo Gerente ID ${vendaComAlcada.data.gerente_aprovador_id}. Total: R$ ${vendaComAlcada.data.valor_total}`);

    console.log(' [14/18] Venda Rápida Anônima como Consumidor Final (RN-06)...');
    const vendaAnonima = await request(
      'POST',
      '/api/vendas',
      {
        cliente_id: null,
        forma_pagamento: 'DINHEIRO',
        desconto: 0,
        itens: [{ produto_id: 2, quantidade: 1 }], // Camiseta Branca R$ 49.90
      },
      tokenCaixa
    );
    assertStatus(vendaAnonima.status, 201, 'Venda Consumidor Final');
    assertCondition(vendaAnonima.data.cliente_id === null, 'Cliente Consumidor Final');
    console.log(`  -> OK: Venda nº ${vendaAnonima.data.id} concluída sem identificação do cliente.`);

    // -------------------------------------------------------------
    // BLOCO 5: CANCELAMENTO & AUDITORIA DE ALÇADA (RN-03, RN-05)
    // -------------------------------------------------------------
    console.log('\n📌 BLOCO 5: CANCELAMENTO COM JUSTIFICATIVA & AUDITORIA (RN-03)');

    console.log(' [15/18] Caixa Tenta Cancelar Venda sem Gerente (Bloqueio 403)...');
    const cancelamentoSemAlcada = await request(
      'PATCH',
      `/api/vendas/${venda1.data.id}/cancelar`,
      { motivo: 'Cliente desistiu da compra' },
      tokenCaixa
    );
    assertStatus(cancelamentoSemAlcada.status, 403, 'Bloqueio Cancelamento Sem Alçada');
    console.log('  -> OK: Tentativa de cancelamento sem alçada gerencial bloqueada com 403.');

    console.log(' [16/18] Cancelamento Autorizado por Gerente com Justificativa...');
    const cancelamentoComAlcada = await request(
      'PATCH',
      `/api/vendas/${venda1.data.id}/cancelar`,
      {
        motivo: 'Troca autorizada por defeito na costura da peça',
        gerente_aprovador: {
          email: 'gerente@ms2.com.br',
          senha: 'admin123',
        },
      },
      tokenCaixa
    );
    assertStatus(cancelamentoComAlcada.status, 200, 'Cancelamento Aprovado');
    assertCondition(cancelamentoComAlcada.data.venda.status === 'CANCELADA', 'Status Cancelada');
    console.log(`  -> OK: Venda nº ${venda1.data.id} cancelada com sucesso. Status atual: ${cancelamentoComAlcada.data.venda.status}`);

    // -------------------------------------------------------------
    // BLOCO 6: CONFIGURAÇÃO FISCAL DA EMPRESA & COMPROVANTE DINÂMICO
    // -------------------------------------------------------------
    console.log('\n📌 BLOCO 6: CONFIGURAÇÃO FISCAL DA EMPRESA & E-NOTA (ADMIN EXCLUSIVO)');

    console.log(' [17/18] Gerente Tenta Alterar Configuração Fiscal (Bloqueio 403)...');
    const tentativaConfigGerente = await request(
      'PUT',
      '/api/empresa',
      { razao_social: 'Tentativa Fraude Fiscal LTDA' },
      tokenGerente
    );
    assertStatus(tentativaConfigGerente.status, 403, 'Bloqueio Configuração Gerente');
    console.log('  -> OK: Gerente proibido de alterar configurações da empresa (403 Forbidden).');

    console.log(' [18/18] Admin Atualiza e Homologa Dados Fiscais da Loja...');
    const configAdmin = await request(
      'PUT',
      '/api/empresa',
      {
        razao_social: 'MS² Vestuário & Moda Varejo LTDA',
        nome_fantasia: 'MS² Vestuário Oficial',
        cnpj: '12.345.678/0001-90',
        inscricao_estadual: '87.654.321',
        telefone: '(21) 3456-7890',
        email: 'contato@ms2vestuario.com.br',
        logradouro: 'Rua das Flores',
        numero: '150',
        bairro: 'Centro Comercial',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '20000-000',
        regime_tributario: 'Simples Nacional',
        mensagem_cupom: 'Obrigado por escolher a MS² Vestuário! Trocas em até 30 dias com esta nota.',
      },
      tokenAdmin
    );
    assertStatus(configAdmin.status, 200, 'Atualizar Configuração Admin');
    assertCondition(configAdmin.data.nome_fantasia === 'MS² Vestuário Oficial', 'Nome Fantasia Atualizado');
    console.log(`  -> OK: Dados fiscais homologados. CNPJ: ${configAdmin.data.cnpj} | Razão Social: "${configAdmin.data.razao_social}".`);

    console.log(`\n========================================================================`);
    console.log(`🎉 TODOS OS 18 TESTES DE INTEGRAÇÃO E2E DA SPRINT 5 FORAM APROVADOS!`);
    console.log(`✅ FLUXO COMPLETO HOMOLOGADO: CLIENTE -> PRODUTO -> PDV -> ALÇADA -> FISCAL`);
    console.log(`========================================================================\n`);
  } catch (err) {
    console.error('\n❌ FALHA NO TESTE DE INTEGRAÇÃO SPRINT 5:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await db.end();
    process.exit(process.exitCode || 0);
  }
}

runE2ETests();
