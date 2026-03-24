import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { AppError } from '../middleware/errorHandler';

export async function register(username: string, email: string, password: string) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    throw new AppError(
      existing.email === email ? 'Email already in use' : 'Username already taken',
      409
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
    select: { id: true, username: true, email: true, profilePicture: true, createdAt: true },
  });

  const accessToken = signAccessToken({ id: user.id, username: user.username });
  const refreshToken = signRefreshToken({ id: user.id, username: user.username });

  return { user, accessToken, refreshToken };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const { passwordHash: _, ...safeUser } = user;

  const accessToken = signAccessToken({ id: user.id, username: user.username });
  const refreshToken = signRefreshToken({ id: user.id, username: user.username });

  return { user: safeUser, accessToken, refreshToken };
}

export async function refresh(refreshToken: string) {
  let payload: { id: number; username: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, username: true, email: true, profilePicture: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 401);

  const accessToken = signAccessToken({ id: user.id, username: user.username });
  return { user, accessToken };
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, profilePicture: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}
