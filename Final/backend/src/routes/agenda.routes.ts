import { Router } from 'express';
import { AgendaController } from '../controllers/AgendaController';
import { autenticarJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(autenticarJWT);

router.get('/', AgendaController.listar);
router.post('/', AgendaController.criar);
router.patch('/:id/toggle', AgendaController.alternar);
router.delete('/:id', AgendaController.excluir);

export default router;
