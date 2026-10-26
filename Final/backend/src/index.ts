import express, { Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './config/database';
import apiRoutes from './routes';
import { tratarErros } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middlewares Globais de Infraestrutura
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de Healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    projeto: 'Sistema de Gestão e PDV - OmniVarejo Enterprise',
    sprint: 'Release Pro 2.5: Backend',
    timestamp: new Date().toISOString()
  });
});

// Centralização de Rotas da API
app.use('/api', apiRoutes);

// Middleware Centralizado de Tratamento de Erros
app.use(tratarErros);

// Inicialização do Servidor
async function startServer() {
  console.log('----------------------------------------------------');
  console.log('🚀 Inicializando Servidor Backend da OmniVarejo Enterprise...');
  console.log('----------------------------------------------------');

  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.warn('⚠️  Aviso: Não foi possível conectar ao MySQL neste momento.');
    console.warn('    Verifique se o serviço MySQL está rodando na porta informada no `.env`.');
  }

  app.listen(PORT, () => {
    console.log(`✅ Servidor ouvindo na porta ${PORT}`);
    console.log(`📡 URL Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log('----------------------------------------------------');
  });
}

startServer();
