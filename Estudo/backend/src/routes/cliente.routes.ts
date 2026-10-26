import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { autenticarJWT } from '../middlewares/auth.middleware';
import { validarBody } from '../middlewares/validation.middleware';
import { clienteCriacaoSchema, clienteAtualizacaoSchema } from '../validations/cliente.validation';

const router = Router();

// Todas as rotas de clientes exigem autenticação do operador/gerente
router.use(autenticarJWT);

// Cadastro de cliente com validação e bloqueio de CPF duplicado (RN-01)
router.post('/', validarBody(clienteCriacaoSchema), ClienteController.criar);

// Listagem geral ou busca por termo (?busca=...)
router.get('/', ClienteController.listar);

// Busca rápida por CPF para o balcão do PDV
router.get('/cpf/:cpf', ClienteController.buscarPorCpf);

// Busca por ID
router.get('/:id', ClienteController.buscarPorId);

// Atualização cadastral
router.put('/:id', validarBody(clienteAtualizacaoSchema), ClienteController.atualizar);

export default router;
