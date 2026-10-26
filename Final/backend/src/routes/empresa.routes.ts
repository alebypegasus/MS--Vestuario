import { Router } from 'express';
import { EmpresaController } from '../controllers/EmpresaController';
import { autenticarJWT } from '../middlewares/auth.middleware';
import { autorizarCargos } from '../middlewares/rbac.middleware';

const router = Router();

// Exige autenticação
router.use(autenticarJWT);

// Consulta liberada para exibir na nota/cupom
router.get('/', EmpresaController.obter);

// Atualização estritamente restrita a ADMIN
router.put('/', autorizarCargos('ADMIN'), EmpresaController.atualizar);

export default router;
