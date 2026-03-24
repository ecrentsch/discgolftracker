import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.register(
      body.username, body.email, body.password
    );
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.login(body.email, body.password);
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(REFRESH_COOKIE);
  res.json({ message: 'Logged out' });
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }
    const { user, accessToken } = await authService.refresh(token);
    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
