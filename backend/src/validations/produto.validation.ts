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
  preco: z
    .number({ required_error: 'Preço é obrigatório' })
    .min(0, 'O preço não pode ser negativo')
});

export const produtoAtualizacaoSchema = z.object({
  codigo: z.string().trim().min(1).optional(),
  descricao: z.string().trim().min(2).optional(),
  categoria: z.string().trim().optional().nullable(),
  preco: z.number().min(0).optional(),
  ativo: z.boolean().optional()
});

export type ProdutoCriacaoInput = z.infer<typeof produtoCriacaoSchema>;
export type ProdutoAtualizacaoInput = z.infer<typeof produtoAtualizacaoSchema>;
