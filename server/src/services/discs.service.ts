import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

function formatDisc(d: any) {
  return {
    id: d.id,
    userId: d.userId,
    name: d.name,
    brand: d.brand,
    plasticType: d.plasticType,
    weight: d.weight,
    speed: d.speed,
    glide: d.glide,
    turn: d.turn,
    fade: d.fade,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export async function getDiscs(userId: number) {
  const discs = await prisma.disc.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return discs.map(formatDisc);
}

export async function createDisc(userId: number, data: {
  name: string; brand: string; plasticType: string;
  weight: number; speed: number; glide: number; turn: number; fade: number;
}) {
  const disc = await prisma.disc.create({ data: { userId, ...data } });
  return formatDisc(disc);
}

export async function updateDisc(id: number, userId: number, data: Partial<{
  name: string; brand: string; plasticType: string;
  weight: number; speed: number; glide: number; turn: number; fade: number;
}>) {
  const existing = await prisma.disc.findUnique({ where: { id } });
  if (!existing) throw new AppError('Disc not found', 404);
  if (existing.userId !== userId) throw new AppError('Forbidden', 403);

  const disc = await prisma.disc.update({ where: { id }, data });
  return formatDisc(disc);
}

export async function deleteDisc(id: number, userId: number) {
  const existing = await prisma.disc.findUnique({ where: { id } });
  if (!existing) throw new AppError('Disc not found', 404);
  if (existing.userId !== userId) throw new AppError('Forbidden', 403);

  await prisma.disc.delete({ where: { id } });
}
