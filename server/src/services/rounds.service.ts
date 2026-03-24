import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { Weather } from '@prisma/client';

function formatRound(r: any) {
  return {
    id: r.id,
    userId: r.userId,
    courseId: r.courseId,
    date: r.date.toISOString(),
    score: r.score,
    scoreVsPar: r.score - r.course.par,
    weather: r.weather,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    course: {
      id: r.course.id,
      name: r.course.name,
      city: r.course.city,
      state: r.course.state,
      holeCount: r.course.holeCount,
      par: r.course.par,
      createdAt: r.course.createdAt.toISOString(),
    },
  };
}

export async function getFeed(userId: number, page: number, limit: number) {
  // Get all accepted friends
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
      status: 'ACCEPTED',
    },
  });
  const friendIds = friendships.map(f =>
    f.requesterId === userId ? f.addresseeId : f.requesterId
  );

  const skip = (page - 1) * limit;
  const rounds = await prisma.round.findMany({
    where: { userId: { in: friendIds } },
    include: {
      course: true,
      user: { select: { id: true, username: true, profilePicture: true } },
    },
    orderBy: { date: 'desc' },
    skip,
    take: limit,
  });

  const total = await prisma.round.count({ where: { userId: { in: friendIds } } });

  return {
    data: rounds.map(r => ({ ...formatRound(r), user: r.user })),
    page,
    limit,
    total,
  };
}

export async function getMyRounds(userId: number, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [rounds, total] = await Promise.all([
    prisma.round.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.round.count({ where: { userId } }),
  ]);

  return { data: rounds.map(formatRound), page, limit, total };
}

export async function createRound(userId: number, data: {
  courseId: number;
  date: string;
  score: number;
  weather: Weather;
  notes?: string;
}) {
  const course = await prisma.course.findUnique({ where: { id: data.courseId } });
  if (!course) throw new AppError('Course not found', 404);

  const round = await prisma.round.create({
    data: {
      userId,
      courseId: data.courseId,
      date: new Date(data.date),
      score: data.score,
      weather: data.weather,
      notes: data.notes,
    },
    include: { course: true },
  });

  return formatRound(round);
}

export async function updateRound(id: number, userId: number, data: Partial<{
  score: number; weather: Weather; notes: string; date: string;
}>) {
  const existing = await prisma.round.findUnique({ where: { id } });
  if (!existing) throw new AppError('Round not found', 404);
  if (existing.userId !== userId) throw new AppError('Forbidden', 403);

  const round = await prisma.round.update({
    where: { id },
    data: {
      ...(data.score !== undefined && { score: data.score }),
      ...(data.weather !== undefined && { weather: data.weather }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
    },
    include: { course: true },
  });

  return formatRound(round);
}

export async function deleteRound(id: number, userId: number) {
  const existing = await prisma.round.findUnique({ where: { id } });
  if (!existing) throw new AppError('Round not found', 404);
  if (existing.userId !== userId) throw new AppError('Forbidden', 403);

  await prisma.round.delete({ where: { id } });
}
