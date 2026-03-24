import client from './client';
import type { CreateRoundInput, PaginatedResponse, RoundFeedItem, RoundWithCourse } from '../../../shared/src/types';

export const roundsApi = {
  getFeed: (page = 1, limit = 20) =>
    client.get<PaginatedResponse<RoundFeedItem>>('/rounds/feed', { params: { page, limit } }).then(r => r.data),

  getMyRounds: (page = 1, limit = 20) =>
    client.get<PaginatedResponse<RoundWithCourse>>('/rounds/my', { params: { page, limit } }).then(r => r.data),

  create: (data: CreateRoundInput) =>
    client.post<RoundWithCourse>('/rounds', data).then(r => r.data),

  update: (id: number, data: Partial<CreateRoundInput>) =>
    client.put<RoundWithCourse>(`/rounds/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/rounds/${id}`).then(r => r.data),
};
