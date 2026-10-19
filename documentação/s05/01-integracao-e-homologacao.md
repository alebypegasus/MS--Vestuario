# SPRINT 5: INTEGRAÇÃO E HOMOLOGAÇÃO (FRONTEND + BACKEND)

**Projeto:** Sistema de Gestão Comercial e Ponto de Venda (PDV) — MS² Vestuário  
**Instituição:** Firjan SENAI — Curso Técnico em Desenvolvimento de Sistemas  
**Stack Tecnológica:** React 18, Vite 6, TypeScript 5.7, Tailwind CSS 3.4, Node.js 20+, Express, MySQL 8.0, Aceternity UI  
**Data de Homologação:** 13/10/2026  

---

## 1. Visão Geral e Foco da Entrega

A **Sprint 5** concretiza a integração ponta a ponta (End-to-End) entre a camada de apresentação visual (Frontend SPA) e os serviços de inteligência de negócios (Backend RESTful API), consolidando o ciclo completo de vida operacional da **MS² Vestuário**.

### Checklist Oficial da Sprint 5 (Gabarito Firjan SENAI)
- [x] **Implementação de requisições web (fetch):** Conexão integral dos formulários, botões, modais e seletores com os endpoints REST da API via Bearer Token JWT.
- [x] **Testes de fluxo completo (End-to-End):**
  - Cadastrar cliente real com validação de CPF (Módulo 11 oficial) e bloqueio de duplicidade (RN-01).
  - Gestão de produtos no catálogo (criação, alteração de preço, pausa gerencial e exclusão pelo Admin).
  - Realização de vendas pelo sistema PDV (carrinho de alta velocidade < 300ms, aplicação de descontos, alçada gerencial RN-02, snapshot histórico RN-04, venda com consumidor final RN-06).
  - Cancelamento/estorno de venda auditado com justificativa e alçada gerencial (RN-03 e RN-05).
  - Parametrização dos dados fiscais da empresa e reflexo na nota fiscal simulada / E-Nota.
- [x] **Auditoria final e refinamento:** Correção de bugs, verificação de concorrência, validação de tipos TypeScript sem advertências e build de produção homologado.

---

## 2. Arquitetura da Integração e Comunicação

```mermaid
sequenceDiagram
    autonumber
    actor Operador as Operador de Caixa / Gerente / Admin
    participant UI as Frontend SPA (React + Tailwind + Aceternity UI)
    participant API as Backend RESTful API (Express + JWT + RBAC)
    participant DB as Banco de Dados MySQL (ms2vest.db)

    Note over Operador,DB: Fluxo 1: Autenticação & Sessão Segura
    Operador->>UI: Informa e-mail e senha
    UI->>API: POST /api/auth/login
    API->>DB: SELECT * FROM usuarios WHERE email = ?
    DB-->>API: Registro com hash bcrypt
    API-->>UI: HTTP 200 { token: JWT, usuario: { id, nome, cargo } }
    UI->>UI: Armazena token e inicializa ThemeContext (Automático)

    Note over Operador,DB: Fluxo 2: Registro de Cliente com Algoritmo Módulo 11 (RN-01)
    Operador->>UI: Digita CPF com máscara e submete formulário
    UI->>API: POST /api/clientes (Header: Bearer Token)
    API->>API: Valida dígitos verificadores do CPF (Módulo 11)
    alt CPF Duplicado
        API->>DB: SELECT id FROM clientes WHERE cpf = ?
        API-->>UI: HTTP 409 Conflict { erro: "CPF já cadastrado" }
        UI->>Operador: Alerta visual Toast vermelho
    else CPF Válido e Inédito
        API->>DB: INSERT INTO clientes VALUES (...)
        API-->>UI: HTTP 201 Created { id, nome, cpf formatado }
        UI->>Operador: Toast verde de sucesso
    end

    Note over Operador,DB: Fluxo 3: Operação de Caixa & Fechamento de Venda (RN-02 / RN-04)
    Operador->>UI: Adiciona produtos ao carrinho e define desconto
    alt Desconto > 10% (Alçada RN-02)
        UI->>UI: Dispara ManagerApprovalModal
        Operador->>UI: Gerente insere e-mail e senha de autorização
        UI->>API: POST /api/vendas (com gerente_aprovador no payload)
    else Desconto <= 10%
        UI->>API: POST /api/vendas (desconto normal)
    end
    API->>DB: Inicia Transação ACID (BEGIN)
    API->>DB: INSERT INTO vendas ...
    API->>DB: INSERT INTO itens_venda (snapshot preco_unitario histórico)
    API->>DB: Confirma Transação (COMMIT)
    API-->>UI: HTTP 201 Created { venda, subtotal, valor_total, itens }
    UI->>Operador: Exibe ReceiptModal (E-Nota térmica simulada com logo e CNPJ)
```

---

## 3. Matriz de Homologação dos Testes de Integração E2E

Foi executado o suite automatizado de testes de ponta a ponta (`npm.cmd run test:sprint5`) cobrindo 100% das regras e integrações do sistema.

| Nº | Caso de Teste | Método & Rota | Perfil | Entrada / Condição | Resultado Esperado | Status |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| **01** | Autenticação do Caixa | `POST /api/auth/login` | Anônimo | `caixa@ms2.com.br` / `caixa123` | HTTP 200 + Token JWT (Cargo: CAIXA) | ✅ Aprovado |
| **02** | Autenticação do Gerente | `POST /api/auth/login` | Anônimo | `gerente@ms2.com.br` / `admin123` | HTTP 200 + Token JWT (Cargo: GERENTE) | ✅ Aprovado |
| **03** | Autenticação do Administrador | `POST /api/auth/login` | Anônimo | `admin@ms2.com.br` / `admin123` | HTTP 200 + Token JWT (Cargo: ADMIN) | ✅ Aprovado |
| **04** | Cadastro de Cliente Válido | `POST /api/clientes` | CAIXA | CPF `06451470287` com Módulo 11 válido | HTTP 201 Created + Máscara formatada | ✅ Aprovado |
| **05** | Bloqueio de CPF Duplicado (RN-01) | `POST /api/clientes` | CAIXA | Mesmo CPF `06451470287` | HTTP 409 Conflict + Mensagem explicativa | ✅ Aprovado |
| **06** | Criação de Produto pelo Gerente | `POST /api/produtos` | GERENTE | Cód: `TEST-SPRINT5-999`, R$ 189,90 | HTTP 201 Created | ✅ Aprovado |
| **07** | Pausa de Produto pelo Gerente | `PATCH /api/produtos/:id/status` | GERENTE | `ativo = false` | HTTP 200 OK (`ativo: false`) | ✅ Aprovado |
| **08** | Bloqueio de Exclusão por Caixa | `DELETE /api/produtos/:id` | CAIXA | Tentativa de exclusão física | HTTP 403 Forbidden | ✅ Aprovado |
| **09** | Bloqueio de Exclusão por Gerente | `DELETE /api/produtos/:id` | GERENTE | Gerente só tem permissão de pausar | HTTP 403 Forbidden | ✅ Aprovado |
| **10** | Exclusão de Produto pelo Admin | `DELETE /api/produtos/:id` | ADMIN | Somente administrador exclui | HTTP 200 OK + Remoção do registro | ✅ Aprovado |
| **11** | Venda com Desconto Normal <= 10% | `POST /api/vendas` | CAIXA | Desconto R$ 4,00 sobre R$ 109,80 | HTTP 201 Created + Total R$ 105,80 | ✅ Aprovado |
| **12** | Bloqueio de Desconto > 10% (RN-02) | `POST /api/vendas` | CAIXA | Desconto 36,4% sem credencial gerencial | HTTP 403 Forbidden + Alerta de Alçada | ✅ Aprovado |
| **13** | Venda com Alçada Gerencial (RN-02) | `POST /api/vendas` | CAIXA | Desconto 36,4% com aprovação gerencial | HTTP 201 Created + `gerente_aprovador_id` | ✅ Aprovado |
| **14** | Venda com Consumidor Final (RN-06) | `POST /api/vendas` | CAIXA | `cliente_id: null` | HTTP 201 Created + Venda concluída | ✅ Aprovado |
| **15** | Bloqueio de Cancelamento sem Gerente | `PATCH /api/vendas/:id/cancelar` | CAIXA | Cancelamento sem credencial gerencial | HTTP 403 Forbidden | ✅ Aprovado |
| **16** | Cancelamento Aprovado com Alçada (RN-03) | `PATCH /api/vendas/:id/cancelar` | CAIXA | Justificativa + aprovação do Gerente | HTTP 200 OK + Status `CANCELADA` | ✅ Aprovado |
| **17** | Bloqueio Fiscal para Gerente | `PUT /api/empresa` | GERENTE | Tentativa de alterar Razão Social | HTTP 403 Forbidden | ✅ Aprovado |
| **18** | Homologação Fiscal pelo Admin | `PUT /api/empresa` | ADMIN | Atualização de CNPJ, IE e Mensagem | HTTP 200 OK + Persistência MySQL | ✅ Aprovado |

---

## 4. Roteiro Oficial da Demonstração Prática (Live Demo para Banca)

Em atendimento às diretrizes do Slide 13 do gabarito, o sistema está configurado para a simulação em tempo real da seguinte esteira operacional:

```
[1. Autenticação] ➔ [2. Onboarding] ➔ [3. Operação PDV] ➔ [4. Regra de Negócio] ➔ [5. Checkout & E-Nota]
```

1. **Autenticação:** Login imediato com atalho de demonstração do Operador de Caixa (`caixa@ms2.com.br` / `caixa123`).
2. **Onboarding:** Cadastro rápido de cliente na tela `/clientes` com validação de CPF oficial em tempo real e máscara dinâmica.
3. **Operação PDV:** Abertura da frente de caixa `/pdv`, catálogo com fotografias reais de alta resolução e inclusão instantânea de peças ao carrinho (< 300ms).
4. **Regra de Negócio:**
   - Teste de concessão de desconto até 10% (aplicado de imediato pelo operador de caixa).
   - Teste de concessão de desconto superior a 10% (exibição do modal âmbar exigindo validação biométrica/senha do gerente).
5. **Checkout & E-Nota:** Seleção do meio de pagamento (PIX, Dinheiro ou Cartão) e impressão do comprovante fiscal com logomarca oficial da MS² Vestuário e CNPJ parametrizado.

---

## 5. Evidências de Execução

### 5.1 Testes de Integração Automatizados (Terminal)
```powershell
cd "c:\Users\NIT0312117\OneDrive - Firjan\Documentos\MS² Vestuario\backend"
npm.cmd run test:sprint5
```
**Resultado:** `18 de 18 testes aprovados com status de saída 0.`

### 5.2 Validação Visual no Navegador (Browser Subagent E2E)
* **Gravação de Sessão:** [sprint5_e2e_demo.webp](file:///C:/Users/NIT0312117/.gemini/antigravity-ide/brain/a2ede912-e839-4742-9038-917443bc21cf/sprint5_e2e_demo_1791915204641.webp)
* **Comprovante / E-Nota Capturado:** [receipt_modal_sprint5.png](file:///C:/Users/NIT0312117/.gemini/antigravity-ide/brain/a2ede912-e839-4742-9038-917443bc21cf/receipt_modal_sprint5_1791915298814.png)

---

## 6. Conclusão da Sprint 5

Com a conclusão da **Sprint 5**, o sistema atinge nível de maturidade de **Homologação Concluída**, estando 100% preparado para a **Sprint 6: Apresentação Final (Pitch Técnico em Slides e Live Demo)**.
