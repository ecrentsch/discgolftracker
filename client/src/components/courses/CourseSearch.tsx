import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../../api/courses';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { CourseSummary, CreateCourseInput } from '../../../../shared/src/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface CourseSearchProps {
  value: CourseSummary | null;
  onChange: (course: CourseSummary | null) => void;
  error?: string;
}

const addCourseSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  holeCount: z.coerce.number().int().min(1).max(100),
  par: z.coerce.number().int().min(1).max(300),
});

type AddCourseForm = z.infer<typeof addCourseSchema>;

export function CourseSearch({ value, onChange, error }: CourseSearchProps) {
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState<CourseSummary[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (value) { setQuery(value.name); return; }
    const t = setTimeout(async () => {
      if (query.trim().length >= 1) {
        setIsLoading(true);
        const res = await coursesApi.search(query.trim()).catch(() => []);
        setResults(res);
        setShowDropdown(true);
        setIsLoading(false);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AddCourseForm>({
    resolver: zodResolver(addCourseSchema),
  });

  const addCourseMutation = useMutation({
    mutationFn: (data: CreateCourseInput) => coursesApi.create(data),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onChange(course as CourseSummary);
      setShowAddModal(false);
      reset();
    },
  });

  function selectCourse(course: CourseSummary) {
    onChange(course);
    setQuery(course.name);
    setShowDropdown(false);
  }

  function clearSelection() {
    onChange(null);
    setQuery('');
    setShowDropdown(false);
  }

  async function onAddCourse(data: AddCourseForm) {
    await addCourseMutation.mutateAsync(data as CreateCourseInput);
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-stone-700">Course <span className="text-red-500">*</span></label>
      <div ref={dropdownRef} className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a course..."
            value={query}
            onChange={e => { setQuery(e.target.value); if (value) onChange(null); }}
            onFocus={() => { if (!value && results.length > 0) setShowDropdown(true); }}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500
              ${error ? 'border-red-400' : 'border-stone-300'}
              ${value ? 'bg-forest-50 text-forest-800 font-medium' : 'bg-white text-stone-900'}`}
          />
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          )}
          {isLoading && !value && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {showDropdown && !value && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-stone-100 z-30 max-h-60 overflow-y-auto">
            {results.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCourse(c)}
                className="w-full flex items-start justify-between px-4 py-2.5 hover:bg-stone-50 text-left"
              >
                <div>
                  <div className="text-sm font-medium text-stone-900">{c.name}</div>
                  <div className="text-xs text-stone-400">{c.city}, {c.state} · {c.holeCount} holes · Par {c.par}</div>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setShowDropdown(false); setShowAddModal(true); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-forest-50 text-forest-700 text-sm font-medium border-t border-stone-100"
            >
              <span>+</span> Add "{query}" as a new course
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Add Course Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Course">
        <form onSubmit={handleSubmit(onAddCourse)} className="space-y-4">
          <Input label="Course Name" defaultValue={query} error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" error={errors.city?.message} {...register('city')} />
            <Input label="State" placeholder="MI" error={errors.state?.message} {...register('state')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Holes" type="number" min={1} max={100} defaultValue={18} error={errors.holeCount?.message} {...register('holeCount')} />
            <Input label="Par" type="number" min={1} max={300} defaultValue={54} error={errors.par?.message} {...register('par')} />
          </div>
          {addCourseMutation.error && (
            <p className="text-sm text-red-600">{(addCourseMutation.error as any)?.response?.data?.error || 'Failed to add course'}</p>
          )}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Add Course</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
