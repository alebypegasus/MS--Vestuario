import { Router } from 'express';
import authRoutes from './auth.routes';
import clienteRoutes from './cliente.routes';
import produtoRoutes from './produto.routes';
import vendaRoutes from './venda.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/produtos', produtoRoutes);
router.use('/vendas', vendaRoutes);

export default router;
