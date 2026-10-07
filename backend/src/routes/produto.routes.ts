import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController';
import { autenticarJWT } from '../middlewares/auth.middleware';
import { autorizarCargos } from '../middlewares/rbac.middleware';
import { validarBody } from '../middlewares/validation.middleware';
import { produtoCriacaoSchema, produtoAtualizacaoSchema } from '../validations/produto.validation';

const router = Router();

// Todas as rotas de produtos exigem autenticação
router.use(autenticarJWT);

// Consultas liberadas para Caixas e Gerentes
router.get('/', ProdutoController.listar);
router.get('/codigo/:codigo', ProdutoController.buscarPorCodigo);
router.get('/:id', ProdutoController.buscarPorId);

// Operações restritas a ADMIN e GERENTE (alçadas administrativas)
router.post(
  '/',
  autorizarCargos('ADMIN', 'GERENTE'),
  validarBody(produtoCriacaoSchema),
  ProdutoController.criar
);

router.put(
  '/:id',
  autorizarCargos('ADMIN', 'GERENTE'),
  validarBody(produtoAtualizacaoSchema),
  ProdutoController.atualizar
);

router.patch(
  '/:id/status',
  autorizarCargos('ADMIN', 'GERENTE'),
  ProdutoController.inativar
);

router.delete(
  '/:id',
  autorizarCargos('ADMIN', 'GERENTE'),
  ProdutoController.inativar
);

export default router;
