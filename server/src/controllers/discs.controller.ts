import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as discsService from '../services/discs.service';

const discSchema = z.object({
  name: z.string().min(1).max(100),
  brand: z.string().min(1).max(100),
  plasticType: z.string().min(1).max(100),
  weight: z.number().min(100).max(200),
  speed: z.number().int().min(1).max(15),
  glide: z.number().int().min(1).max(7),
  turn: z.number().int().min(-5).max(2),
  fade: z.number().int().min(0).max(6),
});

export async function getDiscs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const discs = await discsService.getDiscs(req.user!.id);
    res.json(discs);
  } catch (err) {
    next(err);
  }
}

export async function createDisc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = discSchema.parse(req.body);
    const disc = await discsService.createDisc(req.user!.id, body);
    res.status(201).json(disc);
  } catch (err) {
    next(err);
  }
}

export async function updateDisc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const body = discSchema.partial().parse(req.body);
    const disc = await discsService.updateDisc(id, req.user!.id, body);
    res.json(disc);
  } catch (err) {
    next(err);
  }
}

export async function deleteDisc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    await discsService.deleteDisc(id, req.user!.id);
    res.json({ message: 'Disc removed' });
  } catch (err) {
    next(err);
  }
}
