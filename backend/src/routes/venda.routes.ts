import { Router } from 'express';
import { VendaController } from '../controllers/VendaController';
import { autenticarJWT } from '../middlewares/auth.middleware';
import { validarBody } from '../middlewares/validation.middleware';
import { vendaCriacaoSchema, vendaCancelamentoSchema } from '../validations/venda.validation';

const router = Router();

// Todas as rotas de venda exigem autenticação
router.use(autenticarJWT);

// Registro de venda no PDV (Caixas e Gerentes)
router.post('/', validarBody(vendaCriacaoSchema), VendaController.criar);

// Consultas de vendas
router.get('/', VendaController.listar);
router.get('/:id', VendaController.buscarPorId);

// Cancelamento de venda com validação de alçada (RN-03)
router.put('/:id/cancelar', validarBody(vendaCancelamentoSchema), VendaController.cancelar);
router.patch('/:id/cancelar', validarBody(vendaCancelamentoSchema), VendaController.cancelar);

export default router;
