import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validarBody } from '../middlewares/validation.middleware';
import { loginSchema } from '../validations/auth.validation';
import { autenticarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint público de Login
router.post('/login', validarBody(loginSchema), AuthController.login);

// Endpoint autenticado para validação pontual de gerente (Modal PDV)
router.post('/validar-gerente', autenticarJWT, AuthController.validarGerente);

export default router;
