import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { testConnection } from './db/connection';
import { generalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/accounts.routes';
import categoryRoutes from './routes/categories.routes';
import transactionRoutes from './routes/transactions.routes';
import goalRoutes from './routes/goals.routes';
import debtRoutes from './routes/debts.routes';
import budgetRoutes from './routes/budgets.routes';
import subscriptionRoutes from './routes/subscriptions.routes';
import investmentRoutes from './routes/investments.routes';
import userRoutes from './routes/user.routes';
import cardRoutes from './routes/cards.routes';
import dashboardRoutes from './routes/dashboard.routes';
import passwordRoutes from './routes/password.routes';
import reportRoutes from './routes/reports.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// ─── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const corsWhitelist = [
  'http://localhost:5173',
  'http://192.168.80.29:5173',
  'http://127.0.0.1:5173',
];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. mobile apps, curl) or whitelisted origins
    if (!origin || corsWhitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // necesario para cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Rate limiting global ─────────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    app: process.env.APP_NAME || 'Finlytech API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Serve frontend in production ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  // backend/dist/server.js → go up two levels to project root → dist/
  const distPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(distPath));
  // SPA fallback
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada.' });
});

// Error handler global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor.' });
});

// ─── Arranque ─────────────────────────────────────────────────────────────────
async function startServer(port: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`\n🚀 Finlytech API corriendo en http://localhost:${port}`);
      console.log(`📋 Health check: http://localhost:${port}/api/health`);
      console.log(`🌍 Frontend:     ${process.env.FRONTEND_URL}`);
      console.log(`🔑 Ambiente:     ${process.env.NODE_ENV}\n`);
      resolve();
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} está en uso, intentando ${port + 1}...`);
        startServer(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

async function start(): Promise<void> {
  await testConnection();
  await startServer(PORT);
}

start().catch(console.error);
