import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function searchCourses(query?: string, state?: string) {
  return prisma.course.findMany({
    where: {
      ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
      ...(state ? { state: { equals: state, mode: 'insensitive' } } : {}),
    },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { ratings: true } },
      ratings: { select: { stars: true } },
    },
  }).then(courses =>
    courses.map(c => ({
      id: c.id,
      name: c.name,
      city: c.city,
      state: c.state,
      holeCount: c.holeCount,
      par: c.par,
      createdAt: c.createdAt.toISOString(),
      ratingCount: c._count.ratings,
      avgRating: c.ratings.length > 0
        ? Math.round((c.ratings.reduce((sum, r) => sum + r.stars, 0) / c.ratings.length) * 10) / 10
        : null,
    }))
  );
}

export async function getCourseDetail(id: number, userId?: number) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      ratings: {
        include: { user: { select: { id: true, username: true, profilePicture: true } } },
        orderBy: { createdAt: 'desc' },
      },
      rounds: {
        include: { user: { select: { id: true, username: true, profilePicture: true } } },
        orderBy: { date: 'desc' },
      },
    },
  });
  if (!course) throw new AppError('Course not found', 404);

  const avgRating = course.ratings.length > 0
    ? Math.round((course.ratings.reduce((sum, r) => sum + r.stars, 0) / course.ratings.length) * 10) / 10
    : null;

  // Recent unique players
  const seenUsers = new Set<number>();
  const recentPlayers: { id: number; username: string; profilePicture: string | null; lastPlayed: string }[] = [];
  for (const round of course.rounds) {
    if (!seenUsers.has(round.userId)) {
      seenUsers.add(round.userId);
      recentPlayers.push({
        ...round.user,
        lastPlayed: round.date.toISOString(),
      });
    }
    if (recentPlayers.length >= 20) break;
  }

  const myRating = userId
    ? course.ratings.find(r => r.userId === userId) ?? null
    : null;

  return {
    id: course.id,
    name: course.name,
    city: course.city,
    state: course.state,
    holeCount: course.holeCount,
    par: course.par,
    createdAt: course.createdAt.toISOString(),
    avgRating,
    ratingCount: course.ratings.length,
    ratings: course.ratings.map(r => ({
      id: r.id,
      userId: r.userId,
      courseId: r.courseId,
      stars: r.stars,
      review: r.review,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      user: r.user,
    })),
    recentPlayers,
    myRating: myRating ? { stars: myRating.stars, review: myRating.review } : null,
  };
}

export async function createCourse(data: {
  name: string; city: string; state: string; holeCount: number; par: number;
}) {
  const course = await prisma.course.create({ data });
  return { ...course, createdAt: course.createdAt.toISOString() };
}

export async function rateCourse(userId: number, courseId: number, stars: number, review?: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError('Course not found', 404);

  const rating = await prisma.courseRating.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { stars, review: review ?? null },
    create: { userId, courseId, stars, review: review ?? null },
    include: { user: { select: { id: true, username: true, profilePicture: true } } },
  });

  return {
    ...rating,
    createdAt: rating.createdAt.toISOString(),
    updatedAt: rating.updatedAt.toISOString(),
  };
}
