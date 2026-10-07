import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { autenticarJWT } from '../middlewares/auth.middleware';
import { autorizarCargos } from '../middlewares/rbac.middleware';
import { validarBody } from '../middlewares/validation.middleware';
import {
  usuarioCriacaoSchema,
  usuarioAtualizacaoSchema,
  usuarioStatusSchema
} from '../validations/usuario.validation';

const router = Router();

// Todas as rotas de usuários exigem autenticação
router.use(autenticarJWT);

// Listar e buscar usuários (Permitido para ADMIN e GERENTE)
router.get('/', autorizarCargos('ADMIN', 'GERENTE'), UsuarioController.listar);
router.get('/:id', autorizarCargos('ADMIN', 'GERENTE'), UsuarioController.buscarPorId);

// Criar, atualizar e ativar/desativar funcionários (Exclusivo ADMIN)
router.post(
  '/',
  autorizarCargos('ADMIN'),
  validarBody(usuarioCriacaoSchema),
  UsuarioController.criar
);

router.put(
  '/:id',
  autorizarCargos('ADMIN'),
  validarBody(usuarioAtualizacaoSchema),
  UsuarioController.atualizar
);

router.patch(
  '/:id/status',
  autorizarCargos('ADMIN'),
  validarBody(usuarioStatusSchema),
  UsuarioController.alterarStatus
);

export default router;
