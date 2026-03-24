import client from './client';
import type { CourseSummary, CourseDetail, CreateCourseInput, CreateRatingInput } from '../../../shared/src/types';

export const coursesApi = {
  search: (q?: string, state?: string) =>
    client.get<CourseSummary[]>('/courses', { params: { q, state } }).then(r => r.data),

  getDetail: (id: number) =>
    client.get<CourseDetail>(`/courses/${id}`).then(r => r.data),

  create: (data: CreateCourseInput) =>
    client.post<CourseSummary>('/courses', data).then(r => r.data),

  rate: (id: number, data: CreateRatingInput) =>
    client.post(`/courses/${id}/ratings`, data).then(r => r.data),
};
