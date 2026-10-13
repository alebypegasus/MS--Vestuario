# SPRINT 4: FRONTEND - SETUP, ESTADO, AUTENTICAÇÃO E INTERFACES VISUAIS

**Projeto:** Sistema de Gestão Comercial e Ponto de Venda (PDV) - MS² Vestuário  
**Instituição:** Firjan SENAI - Curso Técnico em Desenvolvimento de Sistemas  
**Stack Tecnológica:** React 18, Vite 6, TypeScript 5.7, Tailwind CSS 3.4, Aceternity UI, Framer Motion, Lucide React, React Router DOM 6  

---

## 1. Visão Geral da Sprint

A **Sprint 4** compreende a implementação completa da camada de apresentação (Frontend SPA), conectada diretamente à API RESTful desenvolvida nas Sprints 2 e 3. A interface foi concebida com foco em ergonomia de alta performance para operação de caixa (< 300ms por comando), rastreabilidade rigorosa de alçadas gerenciais e uma experiência visual premium de nível corporativo (*Design Aesthetics* com Aceternity UI, iluminação via Spotlight, animação orbital Moving Border, chuva de meteoros e micro-interações fluidas).

---

## 2. Arquitetura do Frontend e Identidade Visual

```
frontend/
├── public/
│   ├── logo.png                          # Logomarca oficial moderna MS² Vestuário
│   └── products/                         # Fotografia real de estúdio do catálogo (101 a 108)
│       ├── 101.jpg                       # Camiseta Básica Preta
│       ├── 102.jpg                       # Camiseta Básica Branca
│       ├── 103.jpg                       # Calça Jeans Slim
│       ├── 104.jpg                       # Jaqueta Jeans Trucker
│       ├── 105.jpg                       # Vestido Midi Floral
│       ├── 106.jpg                       # Boné Streetwear
│       ├── 107.jpg                       # Cinto de Couro
│       └── 108.jpg                       # Kit 3 Meias
├── src/
│   ├── components/
│   │   ├── ui/                           # Componentes Aceternity UI & Animações
│   │   │   ├── spotlight.tsx             # Feixe de luz volumétrico dinâmico
│   │   │   ├── meteors.tsx               # Efeito de chuva de meteoros cósmica
│   │   │   ├── flip-words.tsx            # Texto animado rotativo com spring motion
│   │   │   ├── moving-border.tsx         # Borda orbital com gradiente SVG dinâmico
│   │   │   ├── shimmer-button.tsx        # Botão com feixe luminoso reflexivo
│   │   │   └── card-hover-effect.tsx     # Cards com layoutId e hover expansivo
│   │   ├── Navbar.tsx                    # Barra de navegação com RBAC, Logo e Seletor de Tema
│   │   ├── ProtectedRoute.tsx            # Barreira de rotas protegidas por cargo
│   │   ├── ManagerApprovalModal.tsx      # Modal de Alçada Gerencial (RN-02 / RN-03)
│   │   ├── ReceiptModal.tsx              # Comprovante / E-Nota Dinâmica com dados da Empresa
│   │   └── CancelSaleModal.tsx           # Cancelamento com justificativa e alçada
│   ├── contexts/
│   │   ├── AuthContext.tsx               # Sessão JWT, perfil e controle de acesso
│   │   ├── ThemeContext.tsx              # Modo Claro/Escuro (Padrão: Automático/Sistema)
│   │   └── ToastContext.tsx              # Feedback não intrusivo com animações
│   ├── pages/
│   │   ├── LoginPage.tsx                 # Autenticação com Spotlight e atalhos demo
│   │   ├── PdvPage.tsx                   # Frente de Caixa com fotos e velocidade (<300ms)
│   │   ├── ProdutosPage.tsx              # Catálogo com fotos, RBAC estrito (Excluir/Pausar)
│   │   ├── ClientesPage.tsx              # Cadastro com validação Módulo 11 (RN-01)
│   │   ├── VendasPage.tsx                # Histórico e auditoria com estornos
│   │   ├── DashboardPage.tsx             # Dual Dashboard (Gerente vs Administrador)
│   │   ├── ConfiguracoesEmpresaPage.tsx  # Configuração Fiscal/Empresa (Exclusivo Admin)
│   │   └── UsuariosPage.tsx              # Gestão da equipe (Restrito ao ADMIN)
│   ├── services/
│   │   └── api.ts                        # Cliente HTTP Fetch com Bearer Token e empresaApi
│   ├── types/
│   │   └── index.ts                      # Interfaces com prefixo húngaro estrito 'I'
│   ├── utils/
│   │   ├── cn.ts                         # Combinador clsx + tailwind-merge
│   │   ├── cpf.validator.ts              # Algoritmo oficial de CPF (Módulo 11)
│   │   ├── formatters.ts                 # Moeda (BRL), data/hora e badges
│   │   └── productImages.ts              # Mapeamento dinâmico de fotos do catálogo
│   ├── App.tsx                           # Definição de rotas, ThemeProvider e providers
│   ├── main.tsx                          # Ponto de montagem React DOM
│   ├── index.css                         # Variáveis CSS :root e .dark para temas
│   └── vite-env.d.ts                     # Declaração das variáveis de ambiente
├── .env                                  # VITE_API_BASE_URL (Somente .env)
├── tailwind.config.js                    # Injeção de cores :root, keyframes e darkMode: 'class'
├── vite.config.ts                        # Configuração do Vite e aliases
└── package.json                          # Dependências de produção e scripts
```

---

## 3. Padrão de Nomenclatura Estrita de Tipagem (Notação Húngara `I`)

Todas as interfaces e contratos de transferência de dados utilizam estritamente o prefixo `I`:

* `IEmpresa`, `IEmpresaAtualizacaoDTO`
* `IUsuario`, `IUsuarioLoginDTO`, `IUsuarioRespostaLogin`, `IUsuarioCriacaoDTO`, `IUsuarioAtualizacaoDTO`
* `ICliente`, `IClienteCriacaoDTO`, `IClienteAtualizacaoDTO`
* `IProduto`, `IProdutoCriacaoDTO`, `IProdutoAtualizacaoDTO`
* `IItemVenda`, `IItemVendaCriacaoDTO`, `IItemVendaComProduto`
* `IVenda`, `IVendaCriacaoDTO`, `IVendaCompleta`
* `ICarrinhoItem`, `IGerenteValidacaoResposta`

---

## 4. Implementação e Validação das Regras de Negócio e Funcionalidades

### 4.1 Identidade Visual & Imagens de Produtos
* Criada a logomarca vetorial e visual moderno para a **MS² Vestuário**, posicionada na `Navbar`, no cabeçalho dos comprovantes térmicos e nas telas do sistema.
* Geradas fotografias reais de catálogo para todos os 8 produtos cadastrados (SKUs 101 a 108), integradas tanto no PDV (cards de busca rápida) quanto na tela de Catálogo (`ProdutosPage.tsx`) e nos rankings do Dashboard.

### 4.2 Página de Configuração da Empresa & Dados Fiscais (`/configuracoes`)
* **Acesso Restrito:** Exclusiva para o cargo `ADMIN`. Gerente e Caixa têm acesso sumariamente bloqueado tanto na interface (links ocultos) quanto no backend (`PUT /api/empresa` retorna HTTP 403 Forbidden).
* **Parâmetros Parametrizáveis:**
  - Razão Social e Nome Fantasia
  - CNPJ e Inscrição Estadual
  - Telefone e E-mail de Contato
  - Endereço completo (Logradouro, Número, Bairro, Cidade, Estado/UF, CEP)
  - Regime Tributário (Simples Nacional, Lucro Presumido, Lucro Real)
  - Mensagem de Rodapé Personalizada
* **Persistência em Banco:** Tabela `configuracao_empresa` no MySQL.
* **Saída Dinâmica nos Comprovantes / Notas Fiscais:** O componente `ReceiptModal.tsx` consome os dados atualizados via `empresaApi.obter()`, imprimindo a razão social, CNPJ, inscrição estadual, endereço e mensagem de rodapé parametrizada na nota fiscal simulada.

### 4.3 Controle de Acesso Restrito em Produtos (RBAC Estrito)
* **Administrador (`ADMIN`):**
  - Pode criar, editar, pausar/despausar e **deletar** produtos permanentemente (`DELETE /api/produtos/:id`).
* **Gerente (`GERENTE`):**
  - Pode criar, editar e **pausar/ativar** produtos (`PATCH /api/produtos/:id/status`). O botão de exclusão é omitido e a rota `DELETE` retorna HTTP 403.
* **Operador de Caixa (`CAIXA`):**
  - Tem permissão **somente de consulta** aos produtos ativos no catálogo e PDV. Não possui botões de criação, edição, pausa ou exclusão.

### 4.4 Dashboards Diferenciados por Cargo (`/dashboard`)
* **Visão do Gerente:**
  - Indicadores-chave operacionais: Total de Vendas Concluídas, Faturamento Bruto, Ticket Médio, Total de Descontos Concedidos.
  - Alçadas RN-02: Contador de vendas com desconto > 10% que exigiram autorização gerencial.
  - Alçadas RN-03: Contador e motivos de cancelamento/estorno de vendas auditadas.
  - Distribuição de Faturamento por Método de Pagamento (PIX, Dinheiro, Cartão de Crédito, Cartão de Débito).
  - Ranking Top 5 Produtos Mais Vendidos com foto de catálogo, quantidade e faturamento.
* **Visão Exclusiva do Administrador (A mais):**
  - Painel de Auditoria & Gestão Executiva.
  - Produtividade e faturamento detalhado por Operador de Caixa individual.
  - Taxa de identificação de clientes (Clientes Cadastrados com CPF vs. Consumidor Final).
  - Links de atalho direto para Gestão de Equipe e Configurações Fiscais da Empresa.

### 4.5 Modo Claro e Modo Escuro (Automático por Padrão)
* O sistema implementa o `ThemeContext.tsx` que inicia por padrão no modo **Automático** (`'system'`).
* Escuta ativamente a preferência do sistema operacional (`prefers-color-scheme`) via listeners de media query.
* O usuário pode alternar em tempo real na `Navbar` entre três modos:
  - ☀️ **Modo Claro:** Esquema iluminado e legível para ambientes de alta claridade.
  - 🌙 **Modo Escuro:** Esquema dark mode com estética Aceternity UI e redução de fadiga visual.
  - 💻 **Automático:** Sincronizado dinamicamente com o sistema operacional do operador.

---

## 5. Procedimento de Execução e Verificação

### Servidor Backend:
```powershell
cd "c:\Users\NIT0312117\OneDrive - Firjan\Documentos\MS² Vestuario\backend"
npm.cmd run dev
```
*Endereço:* `http://localhost:3001/api`

### Servidor Frontend:
```powershell
cd "c:\Users\NIT0312117\OneDrive - Firjan\Documentos\MS² Vestuario\frontend"
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```
*Endereço:* `http://127.0.0.1:5173/`

### Verificação do Build de Produção:
```powershell
cd "c:\Users\NIT0312117\OneDrive - Firjan\Documentos\MS² Vestuario\frontend"
npm.cmd run build
```
*Resultado:* Compilação bem-sucedida com Vite e TypeScript (`0 erros`, `✓ built in 43s`).
