import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email('E-mail informado é inválido'),
  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'A senha deve possuir no mínimo 6 caracteres')
});

export type LoginInput = z.infer<typeof loginSchema>;
