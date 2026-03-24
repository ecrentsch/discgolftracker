import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  id: number;
  username: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
}
