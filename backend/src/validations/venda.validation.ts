import { z } from 'zod';

export const itemVendaInputSchema = z.object({
  produto_id: z
    .number({ required_error: 'ID do produto é obrigatório' })
    .int()
    .positive('ID do produto inválido'),
  quantidade: z
    .number({ required_error: 'Quantidade é obrigatória' })
    .int('Quantidade deve ser inteira')
    .positive('Quantidade deve ser maior que zero')
});

export const vendaCriacaoSchema = z.object({
  cliente_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  desconto: z
    .number()
    .min(0, 'Desconto não pode ser negativo')
    .optional()
    .default(0),
  forma_pagamento: z.enum(['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX'], {
    required_error: 'Forma de pagamento é obrigatória'
  }),
  itens: z
    .array(itemVendaInputSchema)
    .min(1, 'A venda deve conter ao menos 1 item'),
  // Credenciais opcionais do gerente para autorização pontual no modal (RN-02)
  gerente_aprovador: z
    .object({
      email: z.string().email('E-mail do gerente inválido'),
      senha: z.string().min(1, 'Senha do gerente é obrigatória')
    })
    .optional()
    .nullable()
});

export const vendaCancelamentoSchema = z.object({
  motivo: z
    .string({ required_error: 'Motivo do cancelamento é obrigatório' })
    .trim()
    .min(5, 'Informe uma justificativa com no mínimo 5 caracteres'),
  // Se o usuário logado for Caixa, deve fornecer as credenciais do gerente no modal (RN-03)
  gerente_aprovador: z
    .object({
      email: z.string().email('E-mail do gerente inválido'),
      senha: z.string().min(1, 'Senha do gerente é obrigatória')
    })
    .optional()
    .nullable()
});

export type VendaCriacaoInput = z.infer<typeof vendaCriacaoSchema>;
export type VendaCancelamentoInput = z.infer<typeof vendaCancelamentoSchema>;
