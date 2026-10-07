import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'ms2_vestuario_secret_token_chave_super_segura_2026';

// 1. Gerar tokens JWT válidos de 30 dias para testes contínuos
const tokenCaixa = jwt.sign(
  {
    id: 2,
    nome: 'Ana Silva (Caixa)',
    email: 'caixa@ms2.com.br',
    cargo: 'CAIXA'
  },
  JWT_SECRET,
  { expiresIn: '30d' }
);

const tokenGerente = jwt.sign(
  {
    id: 1,
    nome: 'Carlos Mendes (Gerente)',
    email: 'gerente@ms2.com.br',
    cargo: 'GERENTE'
  },
  JWT_SECRET,
  { expiresIn: '30d' }
);

function createHeader(key: string, value: string) {
  return {
    id: crypto.randomUUID(),
    key,
    value,
    enabled: true
  };
}

function createRequestItem(
  name: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  headers: { key: string; value: string }[],
  bodyObj?: unknown,
  queryParams: { key: string; value: string }[] = []
) {
  const reqId = crypto.randomUUID();
  const hasBody = bodyObj !== undefined;

  return {
    id: reqId,
    name,
    type: 'request',
    request: {
      id: reqId,
      name,
      method,
      url,
      headers: headers.map(h => createHeader(h.key, h.value)),
      queryParams: queryParams.map(q => createHeader(q.key, q.value)),
      bodyType: hasBody ? 'json' : 'none',
      body: hasBody ? JSON.stringify(bodyObj, null, 2) : undefined
    }
  };
}

// 2. Montar estrutura completa de pastas e requisições
const folderAuth = {
  id: crypto.randomUUID(),
  name: '01. Autenticação e Sessão',
  type: 'folder',
  children: [
    createRequestItem(
      'Login - Operador de Caixa (200 OK)',
      'POST',
      '{{base_url}}/auth/login',
      [{ key: 'Content-Type', value: 'application/json' }],
      {
        email: 'caixa@ms2.com.br',
        senha: 'caixa123'
      }
    ),
    createRequestItem(
      'Login - Gerente (200 OK)',
      'POST',
      '{{base_url}}/auth/login',
      [{ key: 'Content-Type', value: 'application/json' }],
      {
        email: 'gerente@ms2.com.br',
        senha: 'admin123'
      }
    ),
    createRequestItem(
      'Login - Senha Incorreta (Cenário Negativo 401)',
      'POST',
      '{{base_url}}/auth/login',
      [{ key: 'Content-Type', value: 'application/json' }],
      {
        email: 'caixa@ms2.com.br',
        senha: 'senha_errada'
      }
    ),
    createRequestItem(
      'Verificar Dados da Sessão (/auth/me)',
      'GET',
      '{{base_url}}/auth/me',
      [
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ]
    ),
    createRequestItem(
      'Healthcheck do Servidor',
      'GET',
      'http://localhost:3001/api/health',
      []
    )
  ]
};

const folderProdutos = {
  id: crypto.randomUUID(),
  name: '02. Catálogo de Produtos',
  type: 'folder',
  children: [
    createRequestItem(
      'Listar Todos os Produtos Ativos',
      'GET',
      '{{base_url}}/produtos',
      [{ key: 'Authorization', value: 'Bearer {{token_caixa}}' }]
    ),
    createRequestItem(
      'Buscar Produto por ID (Ex: 1)',
      'GET',
      '{{base_url}}/produtos/1',
      [{ key: 'Authorization', value: 'Bearer {{token_caixa}}' }]
    ),
    createRequestItem(
      'Buscar Produto por Código de Barras (Ex: 101)',
      'GET',
      '{{base_url}}/produtos/codigo/101',
      [{ key: 'Authorization', value: 'Bearer {{token_caixa}}' }]
    ),
    createRequestItem(
      'Cadastrar Novo Produto (Exclusivo Gerente - 201)',
      'POST',
      '{{base_url}}/produtos',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_gerente}}' }
      ],
      {
        codigo: '201',
        descricao: 'Moletom Streetwear com Capuz Preto G',
        categoria: 'Vestuário',
        preco: 199.90,
        ativo: true
      }
    ),
    createRequestItem(
      'Tentativa de Cadastro por Caixa (Cenário Negativo 403)',
      'POST',
      '{{base_url}}/produtos',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        codigo: '202',
        descricao: 'Tentativa Bloqueada',
        categoria: 'Vestuário',
        preco: 99.90
      }
    ),
    createRequestItem(
      'Atualizar Produto / Preço (Exclusivo Gerente - 200)',
      'PUT',
      '{{base_url}}/produtos/1',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_gerente}}' }
      ],
      {
        descricao: 'Camiseta Básica Algodão Premium Preta P',
        preco: 54.90
      }
    ),
    createRequestItem(
      'Inativar Produto (Soft Delete / Gerente - 200)',
      'PATCH',
      '{{base_url}}/produtos/8/status',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_gerente}}' }
      ],
      {
        ativo: false
      }
    )
  ]
};

const folderClientes = {
  id: crypto.randomUUID(),
  name: '03. Base de Clientes (RN-01)',
  type: 'folder',
  children: [
    createRequestItem(
      'Listar Todos os Clientes',
      'GET',
      '{{base_url}}/clientes',
      [{ key: 'Authorization', value: 'Bearer {{token_caixa}}' }]
    ),
    createRequestItem(
      'Filtrar Clientes por Nome ou CPF (?busca=Mariana)',
      'GET',
      '{{base_url}}/clientes',
      [{ key: 'Authorization', value: 'Bearer {{token_caixa}}' }],
      undefined,
      [{ key: 'busca', value: 'Mariana' }]
    ),
    createRequestItem(
      'Buscar Cliente por ID (Ex: 1)',
      'GET',
      '{{base_url}}/clientes/1',
      [{ key: 'Authorization', value: 'Bearer {{token_caixa}}' }]
    ),
    createRequestItem(
      'Buscar Cliente por CPF (529.982.247-25)',
      'GET',
      '{{base_url}}/clientes/cpf/529.982.247-25',
      [{ key: 'Authorization', value: 'Bearer {{token_caixa}}' }]
    ),
    createRequestItem(
      'Cadastrar Novo Cliente (RN-01 - Módulo 11 Válido - 201)',
      'POST',
      '{{base_url}}/clientes',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        nome: 'Beatriz Almeida',
        cpf: '064.514.702-87',
        telefone: '(21) 99999-8888',
        email: 'beatriz.almeida@email.com'
      }
    ),
    createRequestItem(
      'Bloqueio CPF Duplicado (RN-01 - Conflito 409)',
      'POST',
      '{{base_url}}/clientes',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        nome: 'Mariana Tentativa Duplicada',
        cpf: '529.982.247-25',
        telefone: '(21) 98888-0000'
      }
    ),
    createRequestItem(
      'Bloqueio CPF Inválido no Módulo 11 (Cenário Negativo 400)',
      'POST',
      '{{base_url}}/clientes',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        nome: 'Cliente CPF Inválido',
        cpf: '123.456.789-00',
        telefone: '(21) 97777-1111'
      }
    ),
    createRequestItem(
      'Atualizar Dados de Cliente (ID 1)',
      'PUT',
      '{{base_url}}/clientes/1',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        nome: 'Mariana Souza Santos',
        telefone: '(21) 98888-9999',
        email: 'mariana.santos@email.com'
      }
    )
  ]
};

const folderVendas = {
  id: crypto.randomUUID(),
  name: '04. Frente de Caixa e PDV (RN-02, RN-04)',
  type: 'folder',
  children: [
    createRequestItem(
      'Venda com Desconto Normal <= 10% (Permitido Caixa - 201)',
      'POST',
      '{{base_url}}/vendas',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        cliente_id: 1,
        forma_pagamento: 'PIX',
        desconto: 4.0,
        itens: [
          {
            produto_id: 1,
            quantidade: 1
          }
        ]
      }
    ),
    createRequestItem(
      'Bloqueio Desconto > 10% sem Gerente (RN-02 - Proibido 403)',
      'POST',
      '{{base_url}}/vendas',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        cliente_id: 1,
        forma_pagamento: 'DINHEIRO',
        desconto: 20.0,
        itens: [
          {
            produto_id: 1,
            quantidade: 1
          }
        ]
      }
    ),
    createRequestItem(
      'Venda com Desconto Alto COM Aprovação de Gerente (RN-02 - 201)',
      'POST',
      '{{base_url}}/vendas',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        cliente_id: 1,
        forma_pagamento: 'CARTAO_CREDITO',
        desconto: 20.0,
        itens: [
          {
            produto_id: 1,
            quantidade: 1
          }
        ],
        gerente_aprovador: {
          email: 'gerente@ms2.com.br',
          senha: 'admin123'
        }
      }
    ),
    createRequestItem(
      'Venda Consumidor Final (Sem identificação de cliente - RN-06)',
      'POST',
      '{{base_url}}/vendas',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        forma_pagamento: 'DINHEIRO',
        desconto: 0,
        itens: [
          {
            produto_id: 6,
            quantidade: 2
          }
        ]
      }
    ),
    createRequestItem(
      'Listar Histórico Geral de Vendas',
      'GET',
      '{{base_url}}/vendas',
      [{ key: 'Authorization', value: 'Bearer {{token_caixa}}' }]
    ),
    createRequestItem(
      'Consultar Venda com Itens e Snapshot de Preço (ID 1)',
      'GET',
      '{{base_url}}/vendas/1',
      [{ key: 'Authorization', value: 'Bearer {{token_caixa}}' }]
    )
  ]
};

const folderCancelamento = {
  id: crypto.randomUUID(),
  name: '05. Cancelamento e Auditoria (RN-03)',
  type: 'folder',
  children: [
    createRequestItem(
      'Bloqueio Cancelamento Caixa sem Gerente (RN-03 - Proibido 403)',
      'PATCH',
      '{{base_url}}/vendas/1/cancelar',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        motivo: 'Cliente desistiu da compra no balcão'
      }
    ),
    createRequestItem(
      'Cancelamento COM Aprovação Gerencial (RN-03 - Sucesso 200)',
      'PATCH',
      '{{base_url}}/vendas/1/cancelar',
      [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{token_caixa}}' }
      ],
      {
        motivo: 'Devolução de produto autorizada com estorno',
        gerente_aprovador: {
          email: 'gerente@ms2.com.br',
          senha: 'admin123'
        }
      }
    )
  ]
};

const ms2Collection = {
  id: 'c1000000-0000-4000-8000-000000000001',
  name: 'MS² Vestuário - API RESTful (PDV & Gestão)',
  items: [
    folderAuth,
    folderProdutos,
    folderClientes,
    folderVendas,
    folderCancelamento
  ]
};

// 3. Montar variáveis de ambiente do FiveDollars
const environmentLocal = {
  id: 'f4c1afa7-24b4-4668-ba7c-cc05d04c02aa',
  name: 'local',
  variables: {
    base_url: 'http://localhost:3001/api',
    token_caixa: tokenCaixa,
    token_gerente: tokenGerente,
    token: tokenCaixa
  },
  variableOrder: ['base_url', 'token_caixa', 'token_gerente', 'token'],
  color: '#2563eb'
};

async function main() {
  console.log('⚡ Configurando ambiente do FiveDollars para MS² Vestuário (Antigravity IDE & Desktop)...');

  const appDataRoaming = process.env.APPDATA || 'C:\\Users\\NIT0312117\\AppData\\Roaming';
  const targetPaths = [
    path.join(appDataRoaming, 'Antigravity IDE', 'User', 'globalStorage', 'leandrodettmer.fivedollars', 'data.json'),
    path.join(appDataRoaming, 'com.fivedollars.app', 'data.json')
  ];
  const projectDocDir = path.resolve(process.cwd(), '../documentação/s03');

  // Atualizar data.json nos alvos encontrados
  for (const fiveDollarsDataPath of targetPaths) {
    if (fs.existsSync(fiveDollarsDataPath)) {
      const rawData = fs.readFileSync(fiveDollarsDataPath, 'utf-8');
      fs.writeFileSync(fiveDollarsDataPath + '.bak_ms2', rawData, 'utf-8');

      try {
        const dataJson = JSON.parse(rawData);
        if (dataJson.workspaces && dataJson.workspaces.length > 0) {
          const ws = dataJson.workspaces[0];

          // Atualizar coleções da workspace
          ws.collections = [ms2Collection];
          ws.offlineCollections = [ms2Collection];

          // Atualizar ambiente local
          ws.environments = [environmentLocal];
          ws.offlineEnvironments = [environmentLocal];
          ws.currentEnvId = environmentLocal.id;

          fs.writeFileSync(fiveDollarsDataPath, JSON.stringify(dataJson, null, 2), 'utf-8');
          console.log(`✅ FiveDollars atualizado com sucesso em: ${fiveDollarsDataPath}`);
        }
      } catch (err) {
        console.error(`Erro ao atualizar data.json em ${fiveDollarsDataPath}:`, err);
      }
    } else {
      console.log(`ℹ️ Caminho não encontrado (ignorado): ${fiveDollarsDataPath}`);
    }
  }

  // 4. Salvar coleção exportável em documentação/s03/fivedollars-ms2vestuario.json
  const exportFivePath = path.join(projectDocDir, 'fivedollars-ms2vestuario.json');
  fs.writeFileSync(exportFivePath, JSON.stringify(ms2Collection, null, 2), 'utf-8');
  console.log(`✅ Arquivo de coleção FiveDollars gerado: ${exportFivePath}`);

  // 5. Salvar variáveis de ambiente em documentação/s03/fivedollars-environment.json
  const exportEnvPath = path.join(projectDocDir, 'fivedollars-environment.json');
  fs.writeFileSync(exportEnvPath, JSON.stringify(environmentLocal, null, 2), 'utf-8');
  console.log(`✅ Arquivo de ambiente FiveDollars gerado: ${exportEnvPath}`);

  // 6. Gerar formato Postman v2.1 (compatível com importação universal)
  const postmanCollection = {
    info: {
      _postman_id: 'c1000000-0000-4000-8000-000000000001',
      name: 'MS² Vestuário - API RESTful',
      description: 'Coleção completa de rotas da API com testes manuais para a Sprint 3',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: [
      folderAuth,
      folderProdutos,
      folderClientes,
      folderVendas,
      folderCancelamento
    ].map(folder => ({
      name: folder.name,
      item: folder.children.map(ch => ({
        name: ch.name,
        request: {
          method: ch.request.method,
          header: ch.request.headers.map(h => ({ key: h.key, value: h.value })),
          body: ch.request.body
            ? {
                mode: 'raw',
                raw: ch.request.body,
                options: { raw: { language: 'json' } }
              }
            : undefined,
          url: {
            raw: ch.request.url,
            host: [ch.request.url.replace(/https?:\/\//, '').split('/')[0]],
            path: ch.request.url.replace(/https?:\/\/[^\/]+/, '').split('/').filter(Boolean)
          }
        }
      }))
    }))
  };

  const exportPostmanPath = path.join(projectDocDir, 'postman-ms2vestuario-collection.json');
  fs.writeFileSync(exportPostmanPath, JSON.stringify(postmanCollection, null, 2), 'utf-8');
  console.log(`✅ Coleção Postman v2.1 gerada: ${exportPostmanPath}`);

  console.log('\n======================================================');
  console.log('🎉 28 ROTAS CONFIGURADAS COM SUCESSO NO FIVEDOLLARS!');
  console.log('======================================================\n');
}

main();
