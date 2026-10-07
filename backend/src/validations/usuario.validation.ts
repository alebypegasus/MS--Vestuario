import { z } from 'zod';

export const usuarioCriacaoSchema = z.object({
  nome: z
    .string({ required_error: 'Nome do usuário é obrigatório' })
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .email('E-mail inválido'),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  cargo: z.enum(['ADMIN', 'GERENTE', 'CAIXA'], {
    errorMap: () => ({ message: 'Cargo deve ser ADMIN, GERENTE ou CAIXA' })
  })
});

export const usuarioAtualizacaoSchema = z.object({
  nome: z.string().trim().min(3).optional(),
  email: z.string().trim().email('E-mail inválido').optional(),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  cargo: z.enum(['ADMIN', 'GERENTE', 'CAIXA']).optional()
});

export const usuarioStatusSchema = z.object({
  ativo: z.boolean({ required_error: 'Status ativo é obrigatório' })
});

export type UsuarioCriacaoInput = z.infer<typeof usuarioCriacaoSchema>;
export type UsuarioAtualizacaoInput = z.infer<typeof usuarioAtualizacaoSchema>;
