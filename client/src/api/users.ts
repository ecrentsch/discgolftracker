import client from './client';
import type { UserPublic, UserProfile } from '../../../shared/src/types';

export const usersApi = {
  search: (q: string) =>
    client.get<UserPublic[]>('/users/search', { params: { q } }).then(r => r.data),

  getProfile: (username: string) =>
    client.get<UserProfile>(`/users/${username}`).then(r => r.data),

  uploadAvatar: (username: string, file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return client.post<{ profilePicture: string }>(`/users/${username}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};
