import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './config/database';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Rota de Healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    projeto: 'Sistema de Gestão e PDV - MS² Vestuário',
    sprint: 'Sprint 2: Setup e Camada de Dados (Backend)',
    timestamp: new Date().toISOString()
  });
});

// Inicialização do Servidor HTTP
async function startServer() {
  console.log('----------------------------------------------------');
  console.log('🚀 Inicializando Servidor Backend da MS² Vestuário...');
  console.log('----------------------------------------------------');

  // Testar conectividade com o MySQL
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.warn('⚠️  Aviso: Não foi possível conectar ao MySQL neste momento.');
    console.warn('    Verifique se o serviço MySQL está rodando e se a base `ms2vest.db` foi criada.');
  }

  app.listen(PORT, () => {
    console.log('----------------------------------------------------');
    console.log(`✅ Servidor ouvindo na porta ${PORT}`);
    console.log(`📡 URL Healthcheck: http://localhost:${PORT}/api/health`);
    console.log('----------------------------------------------------');
  });
}

startServer();
