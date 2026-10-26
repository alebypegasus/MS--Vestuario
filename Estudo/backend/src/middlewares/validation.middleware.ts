import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validarBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errosFormatados = error.errors.map(err => ({
          campo: err.path.join('.'),
          mensagem: err.message
        }));

        res.status(400).json({
          erro: 'Falha na validação dos dados de entrada',
          detalhes: errosFormatados
        });
        return;
      }
      next(error);
    }
  };
}
