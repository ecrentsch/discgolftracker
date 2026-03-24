import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { CourseCard } from '../components/courses/CourseCard';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateCourseInput } from '../../../shared/src/types';

const courseSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  holeCount: z.coerce.number().int().min(1).max(100),
  par: z.coerce.number().int().min(1).max(300),
});

type CourseForm = z.infer<typeof courseSchema>;

export function CoursesPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', search],
    queryFn: () => coursesApi.search(search || undefined),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCourseInput) => coursesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowAddModal(false);
      reset();
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
  });

  return (
    <PageWrapper
      title="Courses"
      action={isAuthenticated && (
        <Button onClick={() => setShowAddModal(true)}>+ Add Course</Button>
      )}
    >
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search courses by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <div className="text-4xl mb-3">🗺️</div>
          <p>No courses found. Be the first to add one!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Course">
        <form onSubmit={handleSubmit(data => createMutation.mutateAsync(data as CreateCourseInput))} className="space-y-4">
          <Input label="Course Name" error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" error={errors.city?.message} {...register('city')} />
            <Input label="State" placeholder="MI" error={errors.state?.message} {...register('state')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Holes" type="number" defaultValue={18} error={errors.holeCount?.message} {...register('holeCount')} />
            <Input label="Par" type="number" defaultValue={54} error={errors.par?.message} {...register('par')} />
          </div>
          {createMutation.error && (
            <p className="text-sm text-red-600">{(createMutation.error as any)?.response?.data?.error || 'Failed to create course'}</p>
          )}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Add Course</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
