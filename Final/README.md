# 🚀 OmniVarejo Enterprise — Plataforma Universal de Gestão & Frente de Caixa (PDV)

Plataforma corporativa White-Label de alta performance desenvolvida para atender múltiplos segmentos do varejo moderno:
- **Vestuário & Calçados** (Grade de tamanhos, cores, tecidos)
- **Informática & Eletrônicos** (Garantia, número de série, especificações técnicas)
- **Confeitaria, Padarias & Alimentação** (Lote, data de validade, balança/pesagem)
- **Cosméticos, Farmácias & Pet Shops** (Fracionamento, controle de lotes, marcas)
- **Varejo Geral & Lojas de Departamento** (Códigos EAN/GTIN, alçadas e controle de estoque)

---

## 💎 Principais Funcionalidades

1. **Frente de Caixa (PDV Ágil & Fluido)**:
   - Registro instantâneo por Leitor de Código de Barras (EAN-13/SKU) ou busca textual inteligente.
   - Venda ao Consumidor Final ou fidelização opcional com validação oficial de CPF (Receita Federal).
   - Suporte a múltiplos pagamentos: Dinheiro com cálculo automático de troco, Cartão de Crédito/Débito e PIX Dinâmico com QR Code em tempo real.
   - Emissão de Comprovante Fiscal / NFC-e com QR Code de autenticação.
   - Controle de Alçada Gerencial para descontos corporativos (> 10%) e cancelamentos auditados.

2. **Catálogo & Gestão de Produtos Multissegmento**:
   - Categorias e Subcategorias dinâmicas personalizáveis com CRUD completo.
   - Sugestor rápido de categorias por segmento comercial pré-configurado.
   - Suporte a atributos universais: Unidade de Medida (UN, KG, M, PAR, LT), Marca, Modelo, Garantia, Validade e Lote.
   - Gestão de custos, formação de preço e cálculo dinâmico de margem bruta comercial.
   - Galeria de imagens por URL com upload de logos e identidades visuais da empresa.

3. **Painel de Controle da Empresa & White-Label**:
   - Upload de Logotipo da Marca, Logo em Texto e Favicon.
   - Personalização de Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual, Regime Tributário e Mensagem de Rodapé do Cupom.
   - Facilitadores de preenchimento automático para testes e onboarding ágil.

4. **Motor de Banco de Dados Dual-Engine**:
   - **Modo Autônomo**: SQLite embarcado de altíssima velocidade, sem necessidade de servidores externos.
   - **Modo Corporativo**: Compatível nativamente com MySQL 8.x / MariaDB, com esquemas automatizados, chaves estrangeiras e integridade referencial.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Vite.
- **Backend**: Node.js / Bun, Fastify / REST API, TypeScript, JWT, CORS, Zod.
- **Banco de Dados**: SQLite (nativo de alta performance) + MySQL 8.x (drivers dual-mode resilientes).

---

## 🚀 Como Iniciar

```bash
# Backend (Porta 3002)
cd backend && bun install && bun run src/index.ts

# Frontend (Porta 5174)
cd frontend && bun install && bun run dev
```

Acesse o sistema no navegador: [http://localhost:5174](http://localhost:5174)

---

*OmniVarejo Enterprise • Solução White-Label Completa para Gestão Comercial Moderna.*
