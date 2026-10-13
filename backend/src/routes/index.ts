import { Router } from 'express';
import authRoutes from './auth.routes';
import clienteRoutes from './cliente.routes';
import produtoRoutes from './produto.routes';
import vendaRoutes from './venda.routes';
import usuarioRoutes from './usuario.routes';
import empresaRoutes from './empresa.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/produtos', produtoRoutes);
router.use('/vendas', vendaRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/empresa', empresaRoutes);

export default router;
