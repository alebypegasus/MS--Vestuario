import { Router } from 'express';
import authRoutes from './auth.routes';
import clienteRoutes from './cliente.routes';
import produtoRoutes from './produto.routes';
import vendaRoutes from './venda.routes';
import usuarioRoutes from './usuario.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/produtos', produtoRoutes);
router.use('/vendas', vendaRoutes);
router.use('/usuarios', usuarioRoutes);

export default router;
