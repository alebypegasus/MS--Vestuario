import { z } from 'zod';

export const produtoCriacaoSchema = z.object({
  codigo: z
    .string({ required_error: 'Código/Código de barras do produto é obrigatório' })
    .trim()
    .min(1, 'Código não pode ser vazio'),
  descricao: z
    .string({ required_error: 'Descrição do produto é obrigatória' })
    .trim()
    .min(2, 'A descrição deve ter no mínimo 2 caracteres'),
  categoria: z
    .string()
    .trim()
    .optional()
    .nullable(),
  subcategoria: z.string().trim().optional().nullable(),
  tipo: z.string().trim().optional().nullable(),
  cores: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  tamanhos: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  detalhes: z.string().trim().optional().nullable(),
  imagens: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  unidade_medida: z.string().trim().optional().nullable().default('UN'),
  codigo_barras: z.string().trim().optional().nullable(),
  marca: z.string().trim().optional().nullable(),
  modelo: z.string().trim().optional().nullable(),
  variacoes: z.any().optional().nullable(),
  garantia: z.string().trim().optional().nullable(),
  data_validade: z.string().trim().optional().nullable(),
  lote: z.string().trim().optional().nullable(),
  estoque: z.number().int().min(0).optional().default(50),
  estoque_minimo: z.number().int().min(0).optional().default(10),
  preco_custo: z.number().min(0).optional().default(0),
  preco: z
    .number({ required_error: 'Preço é obrigatório' })
    .min(0, 'O preço não pode ser negativo')
});

export const produtoAtualizacaoSchema = z.object({
  codigo: z.string().trim().min(1).optional(),
  descricao: z.string().trim().min(2).optional(),
  categoria: z.string().trim().optional().nullable(),
  subcategoria: z.string().trim().optional().nullable(),
  tipo: z.string().trim().optional().nullable(),
  cores: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  tamanhos: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  detalhes: z.string().trim().optional().nullable(),
  imagens: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  unidade_medida: z.string().trim().optional().nullable(),
  codigo_barras: z.string().trim().optional().nullable(),
  marca: z.string().trim().optional().nullable(),
  modelo: z.string().trim().optional().nullable(),
  variacoes: z.any().optional().nullable(),
  garantia: z.string().trim().optional().nullable(),
  data_validade: z.string().trim().optional().nullable(),
  lote: z.string().trim().optional().nullable(),
  estoque: z.number().int().min(0).optional(),
  estoque_minimo: z.number().int().min(0).optional(),
  preco_custo: z.number().min(0).optional(),
  preco: z.number().min(0).optional(),
  ativo: z.boolean().optional()
});

export type ProdutoCriacaoInput = z.infer<typeof produtoCriacaoSchema>;
export type ProdutoAtualizacaoInput = z.infer<typeof produtoAtualizacaoSchema>;
