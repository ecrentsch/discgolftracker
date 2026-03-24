import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

export async function searchUsers(query: string) {
  return prisma.user.findMany({
    where: {
      username: { contains: query, mode: 'insensitive' },
    },
    select: { id: true, username: true, profilePicture: true },
    take: 20,
    orderBy: { username: 'asc' },
  });
}

export async function getPublicProfile(username: string, requestingUserId?: number) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      profilePicture: true,
      rounds: {
        include: { course: true },
        orderBy: { date: 'desc' },
      },
      discs: { orderBy: { createdAt: 'asc' } },
      courseRatings: true,
    },
  });

  if (!user) throw new AppError('User not found', 404);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const rounds = user.rounds;
  const totalRounds = rounds.length;
  const totalThrows = rounds.reduce((sum, r) => sum + r.score, 0);

  const scoreDiffs = rounds.map(r => r.score - r.course.par);
  const avgScoreVsPar = totalRounds > 0
    ? Math.round((scoreDiffs.reduce((a, b) => a + b, 0) / totalRounds) * 10) / 10
    : null;

  let bestRound: { roundId: number; scoreVsPar: number; courseName: string; date: string } | null = null;
  if (rounds.length > 0) {
    const best = rounds.reduce((prev, curr) =>
      (curr.score - curr.course.par) < (prev.score - prev.course.par) ? curr : prev
    );
    bestRound = {
      roundId: best.id,
      scoreVsPar: best.score - best.course.par,
      courseName: best.course.name,
      date: best.date.toISOString(),
    };
  }

  // Favorite course (most frequent)
  let favoriteCourse: { courseId: number; name: string; roundCount: number } | null = null;
  if (rounds.length > 0) {
    const counts: Record<number, { name: string; count: number }> = {};
    for (const r of rounds) {
      if (!counts[r.courseId]) counts[r.courseId] = { name: r.course.name, count: 0 };
      counts[r.courseId].count++;
    }
    const topEntry = Object.entries(counts).sort((a, b) => b[1].count - a[1].count)[0];
    favoriteCourse = {
      courseId: parseInt(topEntry[0]),
      name: topEntry[1].name,
      roundCount: topEntry[1].count,
    };
  }

  // Favorite disc (most common brand in bag, or name of first disc)
  let favoriteDisc: string | null = null;
  if (user.discs.length > 0) {
    const brandCounts: Record<string, number> = {};
    for (const d of user.discs) {
      brandCounts[d.brand] = (brandCounts[d.brand] || 0) + 1;
    }
    const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0];
    const topDisc = user.discs.find(d => d.brand === topBrand[0]);
    favoriteDisc = topDisc ? `${topDisc.brand} ${topDisc.name}` : null;
  }

  // ── Friendship status ──────────────────────────────────────────────────────
  let friendshipStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | null = null;
  let friendshipRequesterId: number | null = null;
  if (requestingUserId && requestingUserId !== user.id) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: requestingUserId, addresseeId: user.id },
          { requesterId: user.id, addresseeId: requestingUserId },
        ],
      },
    });
    if (friendship) {
      friendshipStatus = friendship.status;
      friendshipRequesterId = friendship.requesterId;
    }
  }

  // ── Friends list ───────────────────────────────────────────────────────────
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
      status: 'ACCEPTED',
    },
    include: {
      requester: { select: { id: true, username: true, profilePicture: true } },
      addressee: { select: { id: true, username: true, profilePicture: true } },
    },
  });

  const friends = friendships.map(f =>
    f.requesterId === user.id ? f.addressee : f.requester
  );

  return {
    id: user.id,
    username: user.username,
    profilePicture: user.profilePicture,
    stats: { totalRounds, totalThrows, avgScoreVsPar, bestRound, favoriteCourse, favoriteDisc },
    friendshipRequesterId,
    rounds: rounds.map(r => ({
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
    })),
    bag: user.discs.map(d => ({
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
    })),
    friends,
    friendshipStatus,
  };
}

export async function updateAvatar(userId: number, filename: string) {
  // Delete old avatar file if exists
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { profilePicture: true },
  });
  if (existing?.profilePicture) {
    const oldPath = path.join(process.cwd(), existing.profilePicture.replace(/^\//, ''));
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const profilePicture = `/uploads/avatars/${filename}`;
  await prisma.user.update({ where: { id: userId }, data: { profilePicture } });
  return { profilePicture };
}
