import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';
import { AppError } from '../middleware/errorHandler';

export async function searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = (req.query.q as string) || '';
    if (!q.trim()) {
      res.json([]);
      return;
    }
    const users = await usersService.searchUsers(q.trim());
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await usersService.getPublicProfile(req.params.username, req.user?.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const result = await usersService.updateAvatar(req.user!.id, req.file.filename);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
