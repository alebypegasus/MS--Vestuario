/**
 * Utilitários e Facilitadores de Preenchimento Rápido de Dados
 * Permite preencher formulários de cadastro com 1 clique (Empresa, Produtos, Clientes e Usuários).
 */

import { formatarCPF } from './cpf.validator';

/**
 * Gera um CPF matematicamente válido de acordo com o algoritmo oficial da Receita Federal (Módulo 11)
 */
export function gerarCPFValido(): string {
  const aleatorios = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  // Primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += aleatorios[i] * (10 - i);
  }
  let d1 = 11 - (soma % 11);
  if (d1 >= 10) d1 = 0;
  aleatorios.push(d1);

  // Segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += aleatorios[i] * (11 - i);
  }
  let d2 = 11 - (soma % 11);
  if (d2 >= 10) d2 = 0;
  aleatorios.push(d2);

  return formatarCPF(aleatorios.join(''));
}

/**
 * Exemplos de clientes realistas para preenchimento rápido
 */
export function obterExemploCliente() {
  const nomes = [
    'Camila Vasconcelos',
    'Rodrigo Albuquerque',
    'Beatriz Mendonça',
    'Guilherme Antunes',
    'Larissa Fagundes',
    'Eduardo Castilho',
    'Fernanda Siqueira',
    'Thiago Medeiros',
  ];
  const ddds = ['11', '21', '31', '41', '51', '61', '71', '81'];
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const ddd = ddds[Math.floor(Math.random() * ddds.length)];
  const numTelefone = Math.floor(900000000 + Math.random() * 99999999);
  const primeiroNome = nome.toLowerCase().split(' ')[0];
  const sobrenome = nome.toLowerCase().split(' ')[1] || 'cliente';

  return {
    nome,
    cpf: gerarCPFValido(),
    telefone: `(${ddd}) 9${String(numTelefone).slice(1, 5)}-${String(numTelefone).slice(5, 9)}`,
    email: `${primeiroNome}.${sobrenome}@email.com`,
  };
}

/**
 * Exemplos de produtos completos para múltiplos ramos (Vestuário, Informática, Calçados, Confeitaria, Cosméticos)
 */
export function obterExemploProduto(segmentoEspecifico?: string) {
  const catalogoMultiRamo: Record<string, any[]> = {
    VESTUARIO: [
      {
        descricao: 'Vestido Midi Evasê Floral Seda Pura',
        categoria: 'Vestuário & Moda',
        subcategoria: 'Vestidos & Saias',
        tipo: 'Vestido Midi Fluido',
        unidade_medida: 'UN',
        marca: 'Vogue Concept',
        modelo: 'Primavera 2026',
        cores: 'Floral Jardim, Terracota, Verde Oliva',
        tamanhos: 'PP, P, M, G, GG',
        detalhes: '100% Seda Pura toque acetinado. Forro respirável de algodão, zíper invisível traseiro e corte evasê moderno.',
        precoCusto: '65.00',
        preco: '189.90',
        estoque: 35,
        estoqueMinimo: 8,
      },
      {
        descricao: 'Calça Alfaiataria Pantalona Linho Italiano',
        categoria: 'Vestuário & Moda',
        subcategoria: 'Calças & Jeans',
        tipo: 'Calça Alfaiataria Wide Leg',
        unidade_medida: 'UN',
        marca: 'Ateliê Nobre',
        modelo: 'Milano Fit',
        cores: 'Areia Natural, Preto Clássico, Off-White',
        tamanhos: '36, 38, 40, 42, 44',
        detalhes: '70% Linho Italiano, 30% Algodão Nobre. Cós alto estruturado e bolsos faca funcionais.',
        precoCusto: '75.00',
        preco: '229.00',
        estoque: 28,
        estoqueMinimo: 6,
      },
      {
        descricao: 'Camisa Manga Longa Algodão Pima Peruano',
        categoria: 'Vestuário & Moda',
        subcategoria: 'Camisas & Camisetas',
        tipo: 'Camisa Social Casual Slim',
        unidade_medida: 'UN',
        marca: 'Pima King',
        modelo: 'Slim Premium',
        cores: 'Azul Céu, Branco Neve, Chumbo Fosco',
        tamanhos: 'P, M, G, GG, XG',
        detalhes: '100% Algodão Pima Peruano fio 60/1. Gola francesa estruturada e botões em madrepérola.',
        precoCusto: '48.00',
        preco: '149.90',
        estoque: 50,
        estoqueMinimo: 10,
      }
    ],
    INFORMATICA: [
      {
        descricao: 'Notebook Gamer Core i7 16GB SSD 512GB RTX 3050 144Hz',
        categoria: 'Informática & Tecnologia',
        subcategoria: 'Notebooks & Computadores',
        tipo: 'Notebook Gamer 15.6"',
        unidade_medida: 'UN',
        marca: 'Dell',
        modelo: 'G15 Special Edition',
        garantia: '12 Meses Garantia On-site',
        cores: 'Dark Shadow Gray, Eclipse Black',
        tamanhos: '15.6 Polegadas',
        detalhes: 'Processador Intel Core i7 13ª Geração, 16GB DDR5 4800MHz, Placa NVIDIA RTX 3050 6GB GDDR6, Teclado retroiluminado RGB 4 zonas e Wi-Fi 6.',
        precoCusto: '3400.00',
        preco: '4899.00',
        estoque: 12,
        estoqueMinimo: 3,
      },
      {
        descricao: 'SSD NVMe M.2 1TB PCIe 4.0 7000MB/s Leitura',
        categoria: 'Informática & Tecnologia',
        subcategoria: 'Hardware & Peças',
        tipo: 'Armazenamento de Alta Performance',
        unidade_medida: 'UN',
        marca: 'Kingston / Samsung',
        modelo: 'Fury Renegade Gen4',
        garantia: '5 Anos de Garantia',
        cores: 'Preto com Dissipador',
        tamanhos: 'M.2 2280',
        detalhes: 'Controlador Phison E18 de alta eficiência com dissipador térmico em grafeno. Compatível com PCs gamers e PlayStation 5.',
        precoCusto: '280.00',
        preco: '459.90',
        estoque: 25,
        estoqueMinimo: 5,
      },
      {
        descricao: 'Teclado Mecânico Gamer RGB Switch Red Hot-Swap',
        categoria: 'Informática & Tecnologia',
        subcategoria: 'Periféricos & Áudio',
        tipo: 'Teclado Mecânico ABNT2',
        unidade_medida: 'UN',
        marca: 'Redragon',
        modelo: 'Kumara K552 RGB',
        garantia: '12 Meses',
        cores: 'Preto Fosco, Branco Puro',
        tamanhos: 'Compacto TKL 80%',
        detalhes: 'Switches mecânicos lineares silenciosos com durabilidade de 50 milhões de cliques, keycaps em double-shot injection e cabo trançado reforçado.',
        precoCusto: '120.00',
        preco: '249.90',
        estoque: 30,
        estoqueMinimo: 6,
      }
    ],
    SAPATOS: [
      {
        descricao: 'Tênis Esportivo Running Pro Carbon Fly',
        categoria: 'Calçados & Sapatos',
        subcategoria: 'Tênis Esportivos & Casuais',
        tipo: 'Tênis de Corrida com Placa Propulsora',
        unidade_medida: 'PAR',
        marca: 'Nike / Olympikus',
        modelo: 'Carbon Pro Elite',
        cores: 'Preto com Neon, Branco Gelo, Laranja Solar',
        tamanhos: '37, 38, 39, 40, 41, 42, 43, 44',
        detalhes: 'Cabedal respirável sem costura em malha knit. Entressola com amortecimento duplo e placa interna de fibra de carbono para retorno de energia.',
        precoCusto: '190.00',
        preco: '399.90',
        estoque: 40,
        estoqueMinimo: 8,
      },
      {
        descricao: 'Sapato Social Oxford Couro Legítimo Solado Blaqueado',
        categoria: 'Calçados & Sapatos',
        subcategoria: 'Sapatos Sociais',
        tipo: 'Sapato Masculino Oxford Clássico',
        unidade_medida: 'PAR',
        marca: 'Ferracini / Democrata',
        modelo: 'Milano Classic',
        cores: 'Café Whisky, Preto Ônix',
        tamanhos: '38, 39, 40, 41, 42, 43',
        detalhes: '100% Couro nobre vegetal com brilho acetinado natural. Palmilha anatômica em gel forrada em couro e solado blaqueado (costurado).',
        precoCusto: '130.00',
        preco: '289.90',
        estoque: 20,
        estoqueMinimo: 4,
      }
    ],
    CONFEITARIA_PADARIA: [
      {
        descricao: 'Bolo Artesanal Red Velvet com Frutas Vermelhas e Cream Cheese',
        categoria: 'Confeitaria & Panificação',
        subcategoria: 'Bolos & Tortas',
        tipo: 'Bolo Festivo Confeitado',
        unidade_medida: 'KG',
        marca: 'Confeitaria Artesanal',
        modelo: 'Receita Especial da Casa',
        data_validade: '3 dias sob refrigeração (2°C a 6°C)',
        lote: 'LOTE-DOCE-09',
        cores: 'Vermelho Veludo com Branco',
        tamanhos: '1.5kg, 2.5kg, 3.5kg',
        detalhes: 'Massa fofa e úmida com toque de cacau puro. Recheio cremoso à base de cream cheese Philadelphia e redução de amoras, morangos e mirtilos frescos.',
        precoCusto: '35.00',
        preco: '89.90',
        estoque: 15,
        estoqueMinimo: 3,
      },
      {
        descricao: 'Pão Rústico de Fermentação Natural Sourdough 500g',
        categoria: 'Confeitaria & Panificação',
        subcategoria: 'Pães & Fatias',
        tipo: 'Pão Artesanal Fermentação Lenta 36h',
        unidade_medida: 'UN',
        marca: 'Padaria Artesanal',
        modelo: 'Sourdough Rústico',
        data_validade: '5 dias em local seco',
        lote: 'LOTE-PAO-34',
        cores: 'Dourado Crocante',
        tamanhos: '500g',
        detalhes: 'Farinha francesa orgânica tipo T65, água mineral e sal marinho de Guérande. Fermentação biológica natural de 36 horas em cesto baneton.',
        precoCusto: '6.50',
        preco: '18.50',
        estoque: 45,
        estoqueMinimo: 10,
      }
    ],
    COSMETICOS: [
      {
        descricao: 'Perfume Eau de Parfum Amadeirado Imperial 100ml',
        categoria: 'Cosméticos & Beleza',
        subcategoria: 'Perfumes & Colônias',
        tipo: 'Eau de Parfum Concentrado',
        unidade_medida: 'UN',
        marca: 'Maison Parfums',
        modelo: 'Imperial Wood 100ml',
        garantia: '36 Meses de Validade',
        data_validade: '36 meses após fabricação',
        lote: 'LOTE-PARF-99',
        cores: 'Frasco Âmbar Luxo',
        tamanhos: '100ml',
        detalhes: 'Pirâmide olfativa nobre: topo com Cardamomo da Guatemala e Pimenta Rosa, corpo de Cedro do Atlas e fundo de Âmbar Cinzento com Vetiver Bourbon.',
        precoCusto: '85.00',
        preco: '249.90',
        estoque: 35,
        estoqueMinimo: 6,
      },
      {
        descricao: 'Sérum Facial Anti-Idade Ácido Hialurônico + Vitamina C 30ml',
        categoria: 'Cosméticos & Beleza',
        subcategoria: 'Cuidados com a Pele (Skincare)',
        tipo: 'Sérum Facial Rejuvenescedor',
        unidade_medida: 'UN',
        marca: 'DermoLab Cosmeceuticals',
        modelo: 'Hydra Glow C',
        data_validade: '24 meses',
        lote: 'LOTE-SERUM-12',
        cores: 'Transparente com Gotas Douradas',
        tamanhos: '30ml',
        detalhes: 'Fórmula dermatologicamente testada com 15% Vitamina C estabilizada, Ácido Hialurônico de baixo peso molecular e Ácido Ferúlico com ação antioxidante.',
        precoCusto: '28.00',
        preco: '89.90',
        estoque: 50,
        estoqueMinimo: 10,
      }
    ]
  };

  const chaves = Object.keys(catalogoMultiRamo);
  const segmento = segmentoEspecifico && catalogoMultiRamo[segmentoEspecifico]
    ? segmentoEspecifico
    : chaves[Math.floor(Math.random() * chaves.length)];

  const lista = catalogoMultiRamo[segmento];
  const sorteado = lista[Math.floor(Math.random() * lista.length)];
  const novoSku = String(Math.floor(100 + Math.random() * 900));

  return {
    ...sorteado,
    codigo: novoSku,
    codigo_barras: `789${String(Math.floor(1000000000 + Math.random() * 9000000000))}`,
  };
}

/**
 * Exemplo completo de dados cadastrais da empresa
 */
export function obterExemploEmpresa() {
  return {
    razao_social: 'Vogue & Style Comércio de Moda e Confecções LTDA',
    nome_fantasia: 'Vogue & Style Concept Store',
    logo_texto: 'VOGUE & STYLE • ALTA MODA',
    cnpj: '34.891.205/0001-44',
    inscricao_estadual: '92.381.042',
    telefone: '(11) 3289-4050',
    email: 'contato@vogueandstyle.com.br',
    logradouro: 'Alameda das Américas',
    numero: '1450',
    complemento: 'Loja 12 - Piso Jardins',
    bairro: 'Jardins',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01410-000',
    regime_tributario: 'Simples Nacional',
    mensagem_cupom: 'Obrigado por comprar conosco! Trocas permitidas em até 30 dias com apresentação deste cupom fiscal. Siga nosso Instagram: @vogueandstyle',
    favicon_url: 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png',
  };
}

/**
 * Exemplo de funcionário para preenchimento de formulário
 */
export function obterExemploUsuario() {
  const cargos: ('CAIXA' | 'GERENTE')[] = ['CAIXA', 'GERENTE'];
  const cargo = cargos[Math.floor(Math.random() * cargos.length)];
  const nomes = [
    'Mariana Ribeiro',
    'Lucas Ferreira',
    'Camila Rocha',
    'Matheus Nascimento',
    'Juliana Mendes',
  ];
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const primeiroNome = nome.toLowerCase().split(' ')[0];

  return {
    nome,
    email: `${primeiroNome}.${cargo.toLowerCase()}@empresa.com.br`,
    cargo,
    senha: 'senha123',
  };
}
