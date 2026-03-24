import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as roundsService from '../services/rounds.service';

const weatherEnum = z.enum(['SUNNY', 'CLOUDY', 'WINDY', 'RAINY', 'COLD']);

const createRoundSchema = z.object({
  courseId: z.number().int().positive(),
  date: z.string(),
  score: z.number().int().positive(),
  weather: weatherEnum,
  notes: z.string().max(500).optional(),
});

const updateRoundSchema = z.object({
  score: z.number().int().positive().optional(),
  weather: weatherEnum.optional(),
  notes: z.string().max(500).optional(),
  date: z.string().optional(),
});

export async function getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await roundsService.getFeed(req.user!.id, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMyRounds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await roundsService.getMyRounds(req.user!.id, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createRound(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createRoundSchema.parse(req.body);
    const round = await roundsService.createRound(req.user!.id, body);
    res.status(201).json(round);
  } catch (err) {
    next(err);
  }
}

export async function updateRound(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const body = updateRoundSchema.parse(req.body);
    const round = await roundsService.updateRound(id, req.user!.id, body);
    res.json(round);
  } catch (err) {
    next(err);
  }
}

export async function deleteRound(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    await roundsService.deleteRound(id, req.user!.id);
    res.json({ message: 'Round deleted' });
  } catch (err) {
    next(err);
  }
}
