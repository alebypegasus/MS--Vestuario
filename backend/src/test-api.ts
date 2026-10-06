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

const TEST_PORT = 3099;

async function request(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<{ status: number; data: any }> {
  const url = `http://localhost:${TEST_PORT}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function assertStatus(actual: number, expected: number, testName: string) {
  if (actual !== expected) {
    throw new Error(`Falha no teste [${testName}]: Esperado HTTP ${expected}, mas recebeu HTTP ${actual}`);
  }
}

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`\n======================================================`);
  console.log(`🧪 INICIANDO TESTES AUTOMATIZADOS DA API (SPRINT 3)`);
  console.log(`======================================================\n`);

  try {
    // 0. LIMPEZA PREVENTIVA PARA IDEMPOTÊNCIA DO TESTE DE CLIENTE
    await db.execute("DELETE FROM clientes WHERE cpf IN ('06451470287', '064.514.702-87')");

    // 1. TESTE DE LOGIN DO CAIXA
    console.log('[1/10] Testando Login do Operador de Caixa...');
    const loginCaixa = await request('POST', '/api/auth/login', {
      email: 'caixa@ms2.com.br',
      senha: 'caixa123'
    });
    assertStatus(loginCaixa.status, 200, 'Login Caixa');
    const tokenCaixa = loginCaixa.data.token;
    console.log(` -> Sucesso! Token de Caixa emitido: [${tokenCaixa ? 'OK' : 'FALHA'}] (Usuário: ${loginCaixa.data.usuario.nome})`);

    // 2. TESTE DE LOGIN DO GERENTE
    console.log('\n[2/10] Testando Login do Gerente...');
    const loginGerente = await request('POST', '/api/auth/login', {
      email: 'gerente@ms2.com.br',
      senha: 'admin123'
    });
    assertStatus(loginGerente.status, 200, 'Login Gerente');
    const tokenGerente = loginGerente.data.token;
    console.log(` -> Sucesso! Token de Gerente emitido: [${tokenGerente ? 'OK' : 'FALHA'}] (Usuário: ${loginGerente.data.usuario.nome})`);

    // 3. CONSULTA DE CATÁLOGO DE PRODUTOS
    console.log('\n[3/10] Testando Consulta de Produtos...');
    const produtos = await request('GET', '/api/produtos', undefined, tokenCaixa);
    assertStatus(produtos.status, 200, 'Consulta Produtos');
    console.log(` -> Sucesso! ${produtos.data.length} produtos retornados.`);

    // 4. CADASTRO DE CLIENTE COM CPF NOVO (RN-01)
    console.log('\n[4/10] Testando Cadastro de Novo Cliente (RN-01 - Módulo 11 Válido)...');
    const cpfValidoNovo = '06451470287';
    const novoCliente = await request(
      'POST',
      '/api/clientes',
      {
        nome: 'Beatriz Almeida',
        cpf: cpfValidoNovo,
        telefone: '(21) 99999-8888',
        email: 'beatriz.almeida@email.com'
      },
      tokenCaixa
    );
    assertStatus(novoCliente.status, 201, 'Cadastro Novo Cliente');
    console.log(` -> Sucesso! Cliente cadastrado com ID ${novoCliente.data.id} e CPF ${novoCliente.data.cpf}.`);

    // 5. BLOQUEIO DE CPF DUPLICADO (CENÁRIO NEGATIVO - RN-01)
    console.log('\n[5/10] Testando Bloqueio de CPF Duplicado (RN-01 - Conflito 409)...');
    const clienteDuplicado = await request(
      'POST',
      '/api/clientes',
      {
        nome: 'Mariana Tentativa Duplicada',
        cpf: '529.982.247-25', // CPF existente de Mariana Souza
        telefone: '(21) 98888-0000'
      },
      tokenCaixa
    );
    assertStatus(clienteDuplicado.status, 409, 'Bloqueio CPF Duplicado');
    console.log(' -> Sucesso! Bloqueio 409 Conflict acionado corretamente:', clienteDuplicado.data.erro);

    // 6. VENDA COM DESCONTO NORMAL (<= 10% - PERMITIDO PARA CAIXA)
    console.log('\n[6/10] Testando Venda com Desconto Normal <= 10% (RN-02)...');
    // Produto 1: R$ 49.90. Desconto: R$ 4.00 (< 10%).
    const vendaNormal = await request(
      'POST',
      '/api/vendas',
      {
        cliente_id: 1,
        forma_pagamento: 'PIX',
        desconto: 4.0,
        itens: [{ produto_id: 1, quantidade: 1 }]
      },
      tokenCaixa
    );
    assertStatus(vendaNormal.status, 201, 'Venda Desconto Normal');
    console.log(` -> Sucesso! Venda nº ${vendaNormal.data.id} criada. Subtotal: R$ ${vendaNormal.data.subtotal} | Total Líquido: R$ ${vendaNormal.data.valor_total}`);

    // 7. BLOQUEIO DE DESCONTO > 10% SEM GERENTE (CENÁRIO NEGATIVO - RN-02)
    console.log('\n[7/10] Testando Bloqueio de Desconto > 10% sem Gerente (RN-02 - Proibido 403)...');
    // Produto 1: R$ 49.90. Desconto: R$ 15.00 (> 30%).
    const vendaDescontoBarrada = await request(
      'POST',
      '/api/vendas',
      {
        cliente_id: 1,
        forma_pagamento: 'DINHEIRO',
        desconto: 15.0,
        itens: [{ produto_id: 1, quantidade: 1 }]
      },
      tokenCaixa
    );
    assertStatus(vendaDescontoBarrada.status, 403, 'Bloqueio Desconto sem Gerente');
    console.log(' -> Sucesso! Bloqueio 403 Forbidden acionado corretamente:', vendaDescontoBarrada.data.erro);

    // 8. VENDA COM GRANDE DESCONTO COM AUTORIZAÇÃO GERENCIAL (CENÁRIO POSITIVO - RN-02)
    console.log('\n[8/10] Testando Venda com Grande Desconto COM Aprovação Gerencial (RN-02)...');
    const vendaComGerente = await request(
      'POST',
      '/api/vendas',
      {
        cliente_id: 1,
        forma_pagamento: 'CARTAO_CREDITO',
        desconto: 15.0,
        itens: [{ produto_id: 1, quantidade: 1 }],
        gerente_aprovador: {
          email: 'gerente@ms2.com.br',
          senha: 'admin123'
        }
      },
      tokenCaixa
    );
    assertStatus(vendaComGerente.status, 201, 'Venda Desconto com Gerente');
    console.log(` -> Sucesso! Venda nº ${vendaComGerente.data.id} aprovada pelo Gerente ID ${vendaComGerente.data.gerente_aprovador_id}. Total: R$ ${vendaComGerente.data.valor_total}`);

    // 9. BLOQUEIO DE CANCELAMENTO POR CAIXA SEM GERENTE (CENÁRIO NEGATIVO - RN-03)
    console.log('\n[9/10] Testando Bloqueio de Cancelamento por Caixa sem Gerente (RN-03 - Proibido 403)...');
    const cancelamentoBarrado = await request(
      'PATCH',
      `/api/vendas/${vendaNormal.data.id}/cancelar`,
      {
        motivo: 'Cliente desistiu da compra'
      },
      tokenCaixa
    );
    assertStatus(cancelamentoBarrado.status, 403, 'Bloqueio Cancelamento Caixa sem Gerente');
    console.log(' -> Sucesso! Bloqueio 403 Forbidden acionado corretamente:', cancelamentoBarrado.data.erro);

    // 10. CANCELAMENTO COM APROVAÇÃO GERENCIAL (CENÁRIO POSITIVO - RN-03)
    console.log('\n[10/10] Testando Cancelamento COM Aprovação Gerencial (RN-03)...');
    const cancelamentoAprovado = await request(
      'PATCH',
      `/api/vendas/${vendaNormal.data.id}/cancelar`,
      {
        motivo: 'Devolução autorizada pelo gerente',
        gerente_aprovador: {
          email: 'gerente@ms2.com.br',
          senha: 'admin123'
        }
      },
      tokenCaixa
    );
    assertStatus(cancelamentoAprovado.status, 200, 'Cancelamento Aprovado com Gerente');
    console.log(` -> Sucesso! Venda nº ${vendaNormal.data.id} cancelada com sucesso. Status atual: ${cancelamentoAprovado.data.venda.status}`);

    console.log(`\n======================================================`);
    console.log(`🎉 TODOS OS 10 TESTES DA SPRINT 3 PASSARAM COM SUCESSO!`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('❌ Erro durante a execução dos testes:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await db.end();
    process.exit(process.exitCode || 0);
  }
}

runTests();
