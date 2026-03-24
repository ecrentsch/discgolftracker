import client from './client';
import type { Disc, CreateDiscInput } from '../../../shared/src/types';

export const discsApi = {
  getAll: () =>
    client.get<Disc[]>('/discs').then(r => r.data),

  create: (data: CreateDiscInput) =>
    client.post<Disc>('/discs', data).then(r => r.data),

  update: (id: number, data: Partial<CreateDiscInput>) =>
    client.put<Disc>(`/discs/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/discs/${id}`).then(r => r.data),
};
