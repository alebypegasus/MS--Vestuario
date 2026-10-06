# Documento de Setup e Camada de Dados (Backend)
**Projeto:** Sistema de Gestão e PDV — MS² Vestuário  
**Sprint:** 02 — Setup e Camada de Dados (Backend)  
**Versão:** 1.0.0  
**Data:** 06/10/2026  

---

## 1. Visão Geral da Entrega

Na **Sprint 2**, iniciamos a construção da infraestrutura do servidor Node.js com TypeScript, preparando a camada de acesso a dados (Models e Repositories) e a comunicação gerenciada com o banco de dados **MySQL 8.0+** na base `` `ms2vest.db` ``.

O foco desta sprint é estabelecer a base sólida sobre a qual as regras de negócio (Controllers e Services da Sprint 3) serão orquestradas.

---

## 2. Checklist de Entregáveis da Sprint 2

| Item do Checklist Oficial | Status | Implementação |
| :--- | :---: | :--- |
| **Repositório e dependências instaladas** | ✅ Concluído | `backend/package.json` configurado com Express, TypeScript, mysql2, cors, dotenv, zod, bcryptjs e ts-node-dev. |
| **Criação do `.env` e conexão com o banco** | ✅ Concluído | `.env.example`, `.env` e módulo singleton `backend/src/config/database.ts` utilizando Pool de conexões MySQL com `mysql2/promise`. |
| **Criação das Interfaces/Types** | ✅ Concluído | Diretório `backend/src/types/` com tipagens estritas para `Usuario`, `Cliente`, `Produto`, `Venda` e `ItemVenda`. |
| **Desenvolvimento dos Models** | ✅ Concluído | Diretório `backend/src/models/` com métodos de acesso a dados (`create`, `findById`, `findByEmail`, `findByCpf`, `findByCodigo`, `findAll`, `update`, `inactivate`, `cancel`). |

---

## 3. Variáveis de Ambiente (`.env`)

As credenciais do sistema não ficam hardcoded no código-fonte, seguindo as boas práticas da **OWASP**:

```env
# Servidor HTTP
PORT=3001
NODE_ENV=development

# Conexão MySQL
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=alunolab
DB_NAME=ms2vest.db

# Segurança e Sessão
JWT_SECRET=ms2_vestuario_secret_token_chave_super_segura_2026
JWT_EXPIRES_IN=8h
```

---

## 4. Arquitetura da Camada de Conexão (Pool de Conexões)

Implementada em `backend/src/config/database.ts`:
* **Pool de Conexões (`mysql2/promise`):** Mantém até 10 conexões ativas reutilizáveis, evitando o overhead de abrir e fechar conexões TCP a cada requisição de checkout;
* **Conversão Numérica (`decimalNumbers: true`):** Converte nativamente colunas `DECIMAL` do MySQL em números JavaScript com ponto flutuante de precisão;
* **Fuso Horário:** Padronizado para `-03:00` (Horário de Brasília) para manter a fidelidade contábil das vendas.

---

## 5. Mapeamento dos Models e Operações Implementadas

### 5.1. `UsuarioModel`
* `create(dados: UsuarioCriacaoDTO): Promise<Usuario>`: Insere usuário com senha criptografada (`bcrypt`).
* `findById(id: number): Promise<Usuario | null>`: Recupera usuário por identificador primário.
* `findByEmail(email: string): Promise<Usuario | null>`: Utilizado no login e nas alçadas gerenciais.
* `findAll(): Promise<UsuarioRespostaDTO[]>`: Lista usuários com omissão de hash de senha.

### 5.2. `ClienteModel`
* `create(dados: ClienteCriacaoDTO): Promise<Cliente>`: Cadastra cliente no balcão.
* `findById(id: number): Promise<Cliente | null>`: Busca por ID.
* `findByCpf(cpf: string): Promise<Cliente | null>`: Suporta a validação de CPF único (**RN-01**).
* `findAll(termo?: string): Promise<Cliente[]>`: Lista clientes com busca incremental por nome ou CPF.
* `update(id: number, dados: ClienteAtualizacaoDTO): Promise<Cliente | null>`: Atualização cadastral.

### 5.3. `ProdutoModel`
* `create(dados: ProdutoCriacaoDTO): Promise<Produto>`: Adiciona peça ao catálogo.
* `findById(id: number): Promise<Produto | null>`: Busca por ID.
* `findByCodigo(codigo: string): Promise<Produto | null>`: Busca instantânea por código de barras/SKU no checkout.
* `findAll(somenteAtivos?: boolean): Promise<Produto[]>`: Consulta do catálogo do PDV.
* `update(id: number, dados: ProdutoAtualizacaoDTO): Promise<Produto | null>`: Atualização de preço e descrição.
* `inactivate(id: number): Promise<boolean>`: Inativação lógica (**RN-08** - Soft Delete).

### 5.4. `ItemVendaModel`
* `create(vendaId, produtoId, qtd, precoUnitario, conn)`: Grava o item congelando o preço no ato (**RN-04** - Snapshot Financeiro).
* `findByVendaId(vendaId: number)`: Lista as linhas do cupom fiscal trazendo os dados da peça associada.

### 5.5. `VendaModel`
* `create(dados: VendaCriacaoDTO): Promise<VendaCompleta>`: 
  * Executa a gravação da venda e de todos os seus itens sob **Transação Atômica ACID** (`conn.beginTransaction()`, `conn.commit()`, `conn.rollback()`).
  * Garante que nenhuma venda fique sem itens e que nenhum item fique sem cupom.
* `findById(id: number): Promise<VendaCompleta | null>`: Consulta completa com dados de cliente, operador, gerente e itens.
* `findAll(): Promise<VendaCompleta[]>`: Histórico geral de vendas para relatórios e fechamento de caixa.
* `cancel(id: number, gerenteAprovadorId: number, motivo: string): Promise<boolean>`: Cancelamento oficial da transação (**RN-03** e **RN-05**).

---

## 6. Como Executar e Validar o Setup da Sprint 2

```bash
# 1. Acessar a pasta do backend
cd backend

# 2. Compilar TypeScript
npm run build

# 3. Executar o servidor em modo de desenvolvimento
npm run dev
```
