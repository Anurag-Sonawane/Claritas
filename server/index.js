import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { env, corsOrigins } from './config/env.js';
import { initDatabase, db } from './db.js';
import { runSeed, ensureAdminAccount } from './seed.js';
import { securityHeaders, apiLimiter } from './middleware/security.js';
import { getStorageInfo } from './services/storageService.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import operationsRoutes from './routes/operationsRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import commonRoutes from './routes/commonRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Initialize Database Schema and Auto-seed if empty
async function bootstrapDatabase() {
  await initDatabase();
  try {
    const row = await db.get('SELECT COUNT(*) as count FROM users');
    const userCount = Number(row?.count || 0);
    if (userCount === 0) {
      console.log('🌱 Fresh deployment detected. Auto-seeding initial users and courses...');
      await runSeed(false);
    } else {
      // Guarantee an active administrator account is always available
      await ensureAdminAccount();
    }
  } catch (e) {
    console.warn('Auto-seed check notice:', e.message);
  }
}

bootstrapDatabase().catch(err => {
  console.error('Database bootstrap error:', err);
});

// ── Core Middlewares ──
app.use(securityHeaders);
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      corsOrigins.includes(origin) ||
      env.NODE_ENV === 'development' ||
      env.NODE_ENV === 'test' ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Static Assets (Local file storage uploads) ──
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

if (env.NODE_ENV !== 'test') {
  app.use('/api', apiLimiter);
}

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    db: db.provider === 'postgres' ? 'PostgreSQL (Cloud Pool Connected)' : 'SQLite WAL Mode Online with Indexes & Foreign Keys',
    provider: db.provider,
    storage: getStorageInfo()
  });
});

// ── API Route Modules ──
app.use('/api/auth', authRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin', assessmentRoutes);
app.use('/api/admin', operationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/tickets', (req, res, next) => {
  req.url = '/tickets' + (req.url === '/' ? '' : req.url);
  studentRoutes(req, res, next);
});
app.use('/api/ai', aiRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api', facultyRoutes);
app.use('/api/common', commonRoutes);
app.use('/api', commonRoutes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint '${req.method} ${req.originalUrl}' not found` });
});

// ── Global Error Handler ──
app.use((err, req, res, _next) => {
  console.error('Unhandled server exception:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  app.listen(env.PORT, () => {
    console.log(`🚀 Claritas Production API Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

export default app;
