import { Router } from 'express';
import { CaixaController } from '../controllers/CaixaController';
import { autenticarJWT } from '../middlewares/auth.middleware';
import { autorizarCargos } from '../middlewares/rbac.middleware';

const router = Router();

// Todas as rotas de caixa exigem usuário autenticado
router.use(autenticarJWT);

// 1. Resumo do turno atual do operador de caixa (Exclusivo para CAIXA)
router.get('/resumo', autorizarCargos('CAIXA'), CaixaController.obterResumoTurno);

// 2. Realizar fechamento de caixa do turno (Exclusivo para CAIXA)
router.post('/fechar', autorizarCargos('CAIXA'), CaixaController.fecharCaixa);

// 3. Listagem de fechamentos (Admin e Gerente acompanham todos; Caixa consulta os seus)
router.get('/fechamentos', CaixaController.listarFechamentos);

// 4. Detalhes de um fechamento específico
router.get('/fechamentos/:id', CaixaController.obterPorId);

// 5. Auditoria gerencial do fechamento (Exclusivo para ADMIN e GERENTE)
router.post(
  '/fechamentos/:id/auditar',
  autorizarCargos('ADMIN', 'GERENTE'),
  CaixaController.auditar
);

export default router;
