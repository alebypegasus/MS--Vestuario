import { z } from 'zod';
import { validarCPF, limparCPF } from '../utils/cpf-validator';

export const clienteCriacaoSchema = z.object({
  nome: z
    .string({ required_error: 'Nome do cliente é obrigatório' })
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres'),
  cpf: z
    .string({ required_error: 'CPF é obrigatório' })
    .trim()
    .refine(cpf => validarCPF(cpf), {
      message: 'CPF informado é inválido de acordo com as regras oficiais'
    })
    .transform(cpf => limparCPF(cpf)),
  telefone: z
    .string()
    .trim()
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .email('E-mail informado é inválido')
    .optional()
    .nullable()
    .or(z.literal(''))
});

export const clienteAtualizacaoSchema = z.object({
  nome: z.string().trim().min(2).optional(),
  telefone: z.string().trim().optional().nullable(),
  email: z.string().trim().email('E-mail inválido').optional().nullable().or(z.literal(''))
});

export type ClienteCriacaoInput = z.infer<typeof clienteCriacaoSchema>;
export type ClienteAtualizacaoInput = z.infer<typeof clienteAtualizacaoSchema>;
