# 💎 Plataforma de Gestão Comercial & Frente de Caixa (PDV) Multissegmento

Repositório monorepo completo contendo a suíte de Gestão Comercial, Frente de Caixa (PDV) e Controle de Varejo, estruturado em duas edições sincronizadas:

1. **`Estudo/`**: Edição Acadêmica e Portfólio (MS² Vestuário), preservando o histórico de homologação fiscal, Sprints 1 a 6, Dossiê de Regras de Negócio (RN-01 a RN-08) e documentação de referência (Firjan SENAI).
2. **`Final/`**: Edição Comercial White-Label (**OmniVarejo Enterprise**), 100% limpa de menções acadêmicas, adaptada para qualquer segmento comercial (Vestuário, Calçados, Informática, Padarias, Confeitarias, Pet Shops, Mercados e Varejo em Geral).

---

## 🏗️ Estrutura do Monorepo

```text
├── Estudo/                      # Edição Acadêmica / Portfólio (MS² Vestuário)
│   ├── backend/                 # API REST (Fastify/Express, TypeScript, JWT, RBAC)
│   ├── frontend/                # SPA React 18, Tailwind CSS, Lucide Icons, Framer Motion
│   ├── database/                # Scripts DDL e sementes da versão de estudo
│   └── documentação/            # Dossiês técnicos, Sprints 1 a 6 e diagramas DER
├── Final/                       # Edição Comercial White-Label (OmniVarejo Enterprise)
│   ├── backend/                 # API REST porta 3002, 100% White-Label
│   ├── frontend/                # Frontend comercial porta 5174, temas e branding dinâmico
│   └── database/                # Scripts DDL limpos para bancos de produção
├── database/                    # Scripts SQL unificados para MySQL Workbench & Docker
│   ├── mysql_setup_both.sql     # Inicialização de ambos os bancos (ms2_vestuario e omnivarejo_db)
│   ├── mysql_setup_estudo.sql   # Inicialização exclusiva do banco de estudo
│   └── mysql_setup_final.sql    # Inicialização exclusiva do banco comercial
├── scripts/                     # Automação de sincronização e purificação White-Label
│   ├── sync-versions.mjs        # Sincroniza e purifica Estudo -> Final em tempo de build
│   └── watch-sync.mjs           # Daemon de sincronização contínua em tempo real
├── docker-compose.mysql.yml     # Orquestração do MySQL 8.0 para desenvolvimento local
├── package.json                 # Scripts unificados do workspace
└── README.md                    # Documentação geral do repositório
```

---

## 🌟 Principais Recursos & Inovações

### 1. Sistema Universal & Multissegmento
- **Gestão Dinâmica de Categorias & Subcategorias**: Modal interativo com CRUD completo, ícones dinâmicos e seletor rápido com templates prontos (Moda, Calçados, Informática, Confeitaria/Padaria, etc.).
- **Atributos Universais por Produto**: Grade de tamanhos, cores, unidade de medida (UN, KG, M, PAR, LT), código de barras (EAN-13), marca, modelo, garantia, lote e data de validade.
- **Formação de Preço Inteligente**: Preço de custo, preço de venda e cálculo dinâmico de margem bruta estimada.

### 2. Design System & Ergonomia Visual
- Interface limpa, responsiva e com suporte a Dark Mode.
- Transições táteis via **Framer Motion** e ícones animados via **Morphicons**.
- **Facilitador de Preenchimento**: Botão de autocompletar em formulários de clientes, funcionários, produtos e dados da empresa.
- **Upload e Gestão Visual da Empresa**: Upload de Logotipo da Marca, Logo em Texto e Favicon.

### 3. Frente de Caixa (PDV Ágil)
- Leitura instantânea por código de barras ou busca por nome/referência.
- Venda rápida com múltiplos pagamentos (Dinheiro com cálculo de troco, Cartão e PIX Dinâmico com QR Code).
- Emissão de Comprovante Fiscal / NFC-e com QR Code de autenticação.
- Controle de alçada gerencial para descontos corporativos (> 10%) e cancelamentos auditados.

### 4. Motor de Banco de Dados Dual-Engine
- **Modo Autônomo**: Na ausência de MySQL, o sistema ativa automaticamente o banco local SQLite de alta velocidade com tabelas e sementes iniciais.
- **Modo Corporativo**: Compatibilidade total com MySQL 8.x e MariaDB.

---

## 🚀 Como Executar

### Pré-requisitos
- [Bun](https://bun.sh) instalado (`bun --version` >= 1.2)
- (Opcional) Docker Desktop para rodar o banco MySQL local

### Comandos Rápidos na Raiz do Repositório:

```bash
# 1. Executar a versão de Estudo (Acadêmica)
bun run dev:estudo:backend    # Backend em http://localhost:3001
bun run dev:estudo:frontend   # Frontend em http://localhost:5173

# 2. Executar a versão Final (Comercial White-Label)
bun run dev:final:backend     # Backend Comercial em http://localhost:3002
bun run dev:final:frontend    # Frontend Comercial em http://localhost:5174

# 3. Rodar os testes automatizados da API (14/14 testes de regras de negócio)
bun run test:estudo           # Testes da versão Estudo
bun run test:final            # Testes da versão Final

# 4. Sincronização Inteligente (Estudo ➔ Final)
bun run sync                  # Sincroniza e aplica purificação White-Label
bun run sync:watch            # Inicia daemon de sincronização contínua

# 5. Build de Produção
bun run build:all             # Gera o build de ambas as edições
```

### Subindo o MySQL via Docker (Opcional):
```bash
docker compose -f docker-compose.mysql.yml up -d
```

---

## 🔄 Sincronização Inteligente (`Estudo` ➔ `Final`)

O script `scripts/sync-versions.mjs`:
1. Espelha automaticamente novas telas, componentes, rotas e regras de negócio de `Estudo/` para `Final/`.
2. Purifica todos os identificadores acadêmicos (nomes de orientadores, bancas, notas de aula, dísticos de TCC e marcas específicas) transformando-os em parâmetros corporativos configuráveis.
3. Garante isolamento estrito de portas, segredos JWT e banco de dados entre os dois ambientes.

---

## 🔒 Regras de Negócio Homologadas (RN-01 a RN-08)
- **RN-01**: Validação de CPF por Módulo 11 da Receita Federal e separação rígida entre Clientes e Usuários do sistema.
- **RN-02**: Alçada gerencial de desconto (> 10% requer credenciais de Gerente/Admin com log de auditoria).
- **RN-03**: Cancelamento de vendas restrito a Gerentes/Admin com estorno e recomposição de estoque.
- **RN-04**: Matriz de permissões RBAC estrita (Caixa, Gerente, Administrador).
- **RN-05**: Fechamento e Sangria de Caixa com auditoria de turno.
- **RN-06**: Venda ao Consumidor Final ou fidelização opcional de clientes cadastrados.
- **RN-07**: Exportação de relatórios em Excel (.xlsx), CSV e PDF (A4) em todas as telas gerenciais.
- **RN-08**: Emissão simulada de NFC-e com QR Code de autenticação fiscal.

---

*MS² Vestuário & OmniVarejo Enterprise • Desenvolvido com foco em alta performance, robustez e arquitetura limpa.*
