import { Router } from 'express';
import authRoutes from './auth.routes';
import clienteRoutes from './cliente.routes';
import produtoRoutes from './produto.routes';
import vendaRoutes from './venda.routes';
import usuarioRoutes from './usuario.routes';
import empresaRoutes from './empresa.routes';
import agendaRoutes from './agenda.routes';
import categoriaRoutes from './categoria.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/produtos', produtoRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/vendas', vendaRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/empresa', empresaRoutes);
router.use('/agenda', agendaRoutes);

export default router;
