# Documento de Engenharia de Requisitos e Regras de Negócio
**Projeto:** Sistema de Gestão e PDV — MS² Vestuário  
**Sprint:** 01 — Engenharia de Requisitos e Modelagem de Dados  
**Versão:** 1.0.0  
**Data:** 05/10/2026  

---

## 1. Visão Geral do Sistema e Problema de Negócio

A **MS² Vestuário** é uma loja de vestuário e acessórios em expansão que opera atualmente de maneira manual (controle em cadernos, comandas em papel, cálculo em calculadoras de mesa e fechamento de caixa manual). Essa operação analógica acarreta:
1. **Filas e Lentidão no Balcão:** Vendedores precisam folhear catálogos impressos para encontrar preços e códigos de barras.
2. **Inconsistência Financeira:** O fechamento de caixa no final do expediente é lento e sujeito a erros de soma e anotação.
3. **Ausência de Fidelização:** Falta de histórico de compras por cliente e impossibilidade de identificar o público fiel.
4. **Falta de Segurança Operacional:** Qualquer operador pode conceder descontos ou rasgar comandas sem rastreabilidade ou alçada gerencial.

O **Sistema PDV MS² Vestuário** tem a missão de digitalizar e centralizar o fluxo operacional através de três pilares centrais:
- **Catálogo de Produtos:** Localização imediata por código, descrição e preço.
- **Base de Clientes:** Cadastro rápido no balcão, garantia de integridade com CPF único e histórico de compras.
- **Frente de Caixa (PDV):** Registro ágil de vendas com alçadas de acesso bem delimitadas (Caixa vs. Gerente).

---

## 2. Atores do Sistema

| Ator | Descrição | Permissões / Responsabilidades |
| :--- | :--- | :--- |
| **Operador de Caixa** | Funcionário de atendimento na frente de loja. | Autenticar-se; consultar produtos; cadastrar clientes; abrir checkout de venda; adicionar itens à venda; aplicar descontos dentro do limite autorizado (até 10%); finalizar vendas em diferentes formas de pagamento. |
| **Gerente** | Responsável pela supervisão da loja e segurança financeira. | Todas as permissões de Operador de Caixa; aprovar cancelamento de vendas; autorizar descontos superiores a 10% (via credencial no PDV); cadastrar e inativar produtos; consultar relatórios operacionais. |
| **Sistema / Automação** | Processos automatizados do backend. | Garantir a consistência das transações bancárias; calcular subtotais e totais; impedir duplicidade de CPF; armazenar snapshots de preço no fechamento da venda. |

---

## 3. Requisitos Funcionais (RF)

### 3.1. Módulo de Autenticação e Controle de Acesso
- **[RF-01] Login de Usuários:** O sistema deve permitir que operadores de caixa e gerentes façam login utilizando e-mail e senha com hash seguro.
- **[RF-02] Controle de Alçadas (RBAC):** O sistema deve distinguir os papéis de `CAIXA` e `GERENTE`, bloqueando o acesso de caixas a funções restritas.
- **[RF-03] Autorização Pontual no PDV (Modal Gerencial):** O sistema deve permitir que uma operação sensível (desconto > 10% ou cancelamento de venda) seja autorizada no PDV mediante o fornecimento momentâneo de credenciais (e-mail e senha) de um usuário com perfil `GERENTE`, sem deslogar o operador de caixa.

### 3.2. Módulo de Catálogo de Produtos
- **[RF-04] Cadastro de Produtos:** O sistema deve permitir o cadastro de produtos contendo código identificador/código de barras, descrição/nome, categoria e preço de venda.
- **[RF-05] Consulta Rápida de Produtos:** O sistema deve permitir a busca ágil de produtos por código ou descrição, retornando preço atualizado em tempo real.
- **[RF-06] Atualização e Inativação de Produtos:** O sistema deve permitir alteração de dados e inativação lógica de produtos (para preservar o histórico de vendas passadas).

### 3.3. Módulo de Gestão de Clientes
- **[RF-07] Cadastro Rápido de Clientes:** O sistema deve permitir cadastrar clientes no balcão informando Nome Completo, CPF (obrigatório e único), Telefone/WhatsApp e E-mail (opcional).
- **[RF-08] Consulta de Clientes por CPF/Nome:** O sistema deve permitir localizar rapidamente um cliente antes ou durante a abertura de uma venda.
- **[RF-09] Bloqueio de CPF Duplicado:** O sistema deve validar o CPF e impedir o cadastro de mais de um cliente com o mesmo número de documento.

### 3.4. Módulo Frente de Caixa (PDV)
- **[RF-10] Abertura e Gestão da Venda:** O sistema deve permitir iniciar uma nova venda, associando-a opcionalmente a um cliente cadastrado ou registrando-a como "Consumidor Final" (não identificado).
- **[RF-11] Inclusão e Remoção de Itens:** O sistema deve permitir adicionar produtos à venda informando código e quantidade, calculando o subtotal da linha e atualizando o total da compra dinamicamente.
- **[RF-12] Aplicação de Desconto:** O sistema deve permitir aplicar desconto monetário ou percentual sobre a venda, respeitando as regras de alçada.
- **[RF-13] Fechamento e Formas de Pagamento:** O sistema deve permitir finalizar a venda selecionando uma das seguintes formas de pagamento: Dinheiro, Cartão de Débito, Cartão de Crédito ou PIX.
- **[RF-14] Snapshot de Preço:** O sistema deve gravar o preço unitário praticado no momento exato da venda na tabela de itens, garantindo que reajustes futuros no catálogo não alterem o histórico financeiro.
- **[RF-15] Cancelamento de Venda:** O sistema deve permitir o cancelamento de uma venda mediante justificativa e autorização gerencial obrigatória.

---

## 4. Requisitos Não Funcionais (RNF)

- **[RNF-01] Desempenho e Agilidade no Checkout:** A consulta de produtos e a inserção de itens no carrinho da venda devem responder em menos de 300ms no ambiente local para evitar filas no caixa.
- **[RNF-02] Usabilidade e Simplicidade:** A interface do PDV deve ser limpa, com navegação intuitiva e suporte a atalhos de teclado, voltada a operadores sem formação técnica em informática.
- **[RNF-03] Disponibilidade e Execução 100% Local (Regra de Ouro da Banca):** O sistema deve rodar completamente de forma local (Frontend, Backend e Banco de Dados PostgreSQL), sem depender de internet ou serviços de terceiros para seu funcionamento essencial.
- **[RNF-04] Segurança das Senhas:** Nenhuma senha pode ser armazenada em texto plano. As senhas devem ser criptografadas com `bcrypt` (fator de custo mínimo 10).
- **[RNF-05] Integridade Transacional (ACID):** O fechamento da venda e a gravação de seus itens devem ocorrer dentro de uma transação de banco de dados (`BEGIN ... COMMIT`), garantindo que não ocorra gravação de venda sem itens ou itens órfãos.
- **[RNF-06] Arquitetura e Manutenibilidade:** O backend deve seguir uma arquitetura em camadas bem definida (Controllers, Services, Repositories/Models, Routes), com separação de responsabilidades e tipagem estrita com TypeScript.
- **[RNF-07] Compatibilidade Web:** O frontend deve rodar em navegadores modernos padrão (Chrome, Edge, Firefox) através de React + Vite.

---

## 5. Regras de Negócio (RN)

| Identificador | Nome da Regra | Descrição e Critério de Aceite |
| :--- | :--- | :--- |
| **RN-01** | **Unicidade e Validação de CPF** | O CPF do cliente é um identificador único no sistema. O backend deve rejeitar qualquer tentativa de inserção ou edição com CPF já existente, retornando erro HTTP 409 (Conflict). |
| **RN-02** | **Alçada de Desconto no PDV** | Um Operador de Caixa pode conceder no máximo **10% de desconto** sobre o valor subtotal da venda. Para qualquer desconto estipulado acima de 10%, o sistema deve exigir obrigatoriamente a validação das credenciais de um `GERENTE`. |
| **RN-03** | **Alçada para Cancelamento de Venda** | Apenas usuários com perfil `GERENTE` podem efetuar o cancelamento de uma venda registrada. Se um Operador de Caixa solicitar o cancelamento, o modal de autorização gerencial é exigido. |
| **RN-04** | **Snapshot Histórico de Preços** | O valor unitário do produto gravado no item da venda deve ser imutável após a finalização da transação. Alterações posteriores no preço do produto no catálogo não podem afetar vendas pretéritas. |
| **RN-05** | **Imutabilidade de Venda Finalizada** | Uma venda com status `CONCLUIDA` não pode ter seus itens, cliente ou valores alterados. Caso haja desacordo, a operação permitida é o cancelamento (`CANCELADA`) com justificativa. |
| **RN-06** | **Venda com Consumidor Final** | O vínculo a um cliente cadastrado é opcional no momento da venda para não interromper a agilidade do balcão caso o cliente não queira fornecer documento. Neste caso, a venda é vinculada a um registro nulo (`NULL`) ou cliente padrão "Consumidor Final". |
| **RN-07** | **Consistência de Valores da Venda** | O valor total da venda deve obedecer à fórmula matemática: `Total = Subtotal dos Itens - Desconto`. O desconto não pode exceder o subtotal dos itens da venda. |
| **RN-08** | **Preservação de Integridade de Produtos (Soft Delete)** | Um produto que já possui histórico de vendas registradas não pode sofrer deleção física (`DELETE CASCADE`) do banco de dados para evitar corrupção do histórico contábil. O produto deve ser inativado (`ativo = false`). |

---

## 6. Mapeamento de Casos de Uso e Fluxos Operacionais

### Fluxo Principal 1: Realização de Venda no PDV (Cenário Feliz)
1. Operador loga no sistema com credenciais de Caixa.
2. Abre a tela do PDV (Frente de Caixa).
3. Opcionalmente identifica o cliente digitando o CPF (busca instantânea); se não encontrado, cadastra o cliente rapidamente ou prossegue como consumidor final.
4. Digita o código do produto (ou lê via leitor de código de barras); o sistema adiciona o produto ao carrinho, exibe a descrição, preço e atualiza o total.
5. Operador insere desconto de até 10% (se aplicável); o sistema recalcula o valor total.
6. Operador seleciona a forma de pagamento (Dinheiro, PIX, Cartão Débito ou Crédito).
7. Operador clica em "Finalizar Venda"; o sistema registra a venda e os itens de forma transacional no banco e emite feedback visual de sucesso com resumo da venda.

### Fluxo Alternativo 2: Concessão de Grande Desconto (> 10%)
1. No carrinho de compras, o operador informa um desconto superior a 10% (ex: 15%).
2. O sistema bloqueia a aplicação automática e exibe o modal: *"Autorização Gerencial Necessária"*.
3. O gerente da loja digita seu e-mail e senha no modal.
4. O backend valida a credencial do gerente e retorna o token/aprovação.
5. O sistema aplica o desconto de 15% e registra o `id` do gerente autorizador na transação da venda.
6. A venda é finalizada normalmente pelo operador.

### Fluxo Alternativo 3: Cancelamento de Venda
1. O operador localiza uma venda recém-concluída e clica em "Cancelar Venda".
2. O sistema verifica que o usuário atual é `CAIXA` e solicita a senha do `GERENTE` e o motivo do cancelamento.
3. Com a validação das credenciais do gerente, o status da venda é alterado para `CANCELADA` e o motivo fica registrado para fins de auditoria.
