import { Router } from 'express';
import { CategoriaController } from '../controllers/CategoriaController';
import { autenticarJWT } from '../middlewares/auth.middleware';
import { autorizarCargos } from '../middlewares/rbac.middleware';

const router = Router();

// Consulta de categorias liberada para usuários autenticados
router.use(autenticarJWT);

router.get('/', CategoriaController.listar);
router.get('/:id', CategoriaController.buscarPorId);

// Criação, alteração e exclusão permitida para GERENTE e ADMIN
router.post('/', autorizarCargos('GERENTE', 'ADMIN'), CategoriaController.criar);
router.put('/:id', autorizarCargos('GERENTE', 'ADMIN'), CategoriaController.atualizar);
router.delete('/:id', autorizarCargos('GERENTE', 'ADMIN'), CategoriaController.excluir);

// Subcategorias
router.post('/subcategorias', autorizarCargos('GERENTE', 'ADMIN'), CategoriaController.criarSubcategoria);
router.delete('/subcategorias/:id', autorizarCargos('GERENTE', 'ADMIN'), CategoriaController.excluirSubcategoria);

export default router;
