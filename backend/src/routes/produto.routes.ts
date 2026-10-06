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

// Operações restritas a GERENTE (alçadas administrativas)
router.post(
  '/',
  autorizarCargos('GERENTE'),
  validarBody(produtoCriacaoSchema),
  ProdutoController.criar
);

router.put(
  '/:id',
  autorizarCargos('GERENTE'),
  validarBody(produtoAtualizacaoSchema),
  ProdutoController.atualizar
);

router.delete(
  '/:id',
  autorizarCargos('GERENTE'),
  ProdutoController.inativar
);

export default router;
