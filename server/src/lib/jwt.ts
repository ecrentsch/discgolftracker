import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  id: number;
  username: string;
}

export function signAccessToken(payload: JwtPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload as any, config.jwtAccessSecret, { expiresIn: '15m' } as any);
}

export function signRefreshToken(payload: JwtPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload as any, config.jwtRefreshSecret, { expiresIn: '7d' } as any);
}

export function verifyAccessToken(token: string): JwtPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.verify(token, config.jwtAccessSecret as any) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.verify(token, config.jwtRefreshSecret as any) as JwtPayload;
}
