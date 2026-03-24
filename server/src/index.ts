import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import roundRoutes from './routes/rounds.routes';
import courseRoutes from './routes/courses.routes';
import discRoutes from './routes/discs.routes';
import friendRoutes from './routes/friends.routes';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/discs', discRoutes);
app.use('/api/friends', friendRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🏌️  dihgolf server running on http://localhost:${config.port}`);
});

export default app;
