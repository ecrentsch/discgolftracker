import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getFriends(userId: number) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
      status: 'ACCEPTED',
    },
    include: {
      requester: { select: { id: true, username: true, profilePicture: true } },
      addressee: { select: { id: true, username: true, profilePicture: true } },
    },
  });

  return friendships.map(f => ({
    id: f.id,
    status: f.status,
    createdAt: f.createdAt.toISOString(),
    user: f.requesterId === userId ? f.addressee : f.requester,
  }));
}

export async function getPendingRequests(userId: number) {
  const [sent, received] = await Promise.all([
    prisma.friendship.findMany({
      where: { requesterId: userId, status: 'PENDING' },
      include: { addressee: { select: { id: true, username: true, profilePicture: true } } },
    }),
    prisma.friendship.findMany({
      where: { addresseeId: userId, status: 'PENDING' },
      include: { requester: { select: { id: true, username: true, profilePicture: true } } },
    }),
  ]);

  return {
    sent: sent.map(f => ({ id: f.id, user: f.addressee, createdAt: f.createdAt.toISOString() })),
    received: received.map(f => ({ id: f.id, user: f.requester, createdAt: f.createdAt.toISOString() })),
  };
}

export async function sendRequest(requesterId: number, addresseeId: number) {
  if (requesterId === addresseeId) throw new AppError('Cannot friend yourself', 400);

  const targetUser = await prisma.user.findUnique({ where: { id: addresseeId } });
  if (!targetUser) throw new AppError('User not found', 404);

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    },
  });

  if (existing) {
    if (existing.status === 'ACCEPTED') throw new AppError('Already friends', 409);
    if (existing.status === 'PENDING') throw new AppError('Friend request already sent', 409);
    // If declined, allow re-sending
    const updated = await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: 'PENDING', requesterId, addresseeId },
    });
    return updated;
  }

  return prisma.friendship.create({
    data: { requesterId, addresseeId, status: 'PENDING' },
  });
}

export async function respondToRequest(
  addresseeId: number,
  requesterId: number,
  action: 'ACCEPTED' | 'DECLINED'
) {
  const friendship = await prisma.friendship.findFirst({
    where: { requesterId, addresseeId, status: 'PENDING' },
  });
  if (!friendship) throw new AppError('Friend request not found', 404);

  return prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: action },
  });
}

export async function removeFriend(userId: number, otherUserId: number) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: otherUserId },
        { requesterId: otherUserId, addresseeId: userId },
      ],
      status: 'ACCEPTED',
    },
  });
  if (!friendship) throw new AppError('Friendship not found', 404);

  await prisma.friendship.delete({ where: { id: friendship.id } });
}
