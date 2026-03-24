import { Request, Response, NextFunction } from 'express';
import * as friendsService from '../services/friends.service';

export async function getFriends(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const friends = await friendsService.getFriends(req.user!.id);
    res.json(friends);
  } catch (err) {
    next(err);
  }
}

export async function getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requests = await friendsService.getPendingRequests(req.user!.id);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

export async function sendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const addresseeId = parseInt(req.params.userId);
    const friendship = await friendsService.sendRequest(req.user!.id, addresseeId);
    res.status(201).json(friendship);
  } catch (err) {
    next(err);
  }
}

export async function acceptRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requesterId = parseInt(req.params.requesterId);
    const friendship = await friendsService.respondToRequest(req.user!.id, requesterId, 'ACCEPTED');
    res.json(friendship);
  } catch (err) {
    next(err);
  }
}

export async function declineRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requesterId = parseInt(req.params.requesterId);
    const friendship = await friendsService.respondToRequest(req.user!.id, requesterId, 'DECLINED');
    res.json(friendship);
  } catch (err) {
    next(err);
  }
}

export async function removeFriend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const otherUserId = parseInt(req.params.userId);
    await friendsService.removeFriend(req.user!.id, otherUserId);
    res.json({ message: 'Friend removed' });
  } catch (err) {
    next(err);
  }
}
