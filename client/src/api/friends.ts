import client from './client';
import type { FriendshipWithUser } from '../../../shared/src/types';

export const friendsApi = {
  getAll: () =>
    client.get<FriendshipWithUser[]>('/friends').then(r => r.data),

  getRequests: () =>
    client.get<{ sent: any[]; received: any[] }>('/friends/requests').then(r => r.data),

  sendRequest: (userId: number) =>
    client.post(`/friends/request/${userId}`).then(r => r.data),

  accept: (requesterId: number) =>
    client.post(`/friends/accept/${requesterId}`).then(r => r.data),

  decline: (requesterId: number) =>
    client.post(`/friends/decline/${requesterId}`).then(r => r.data),

  remove: (userId: number) =>
    client.delete(`/friends/${userId}`).then(r => r.data),
};
