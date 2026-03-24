import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roundsApi } from '../api/rounds';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CourseSearch } from '../components/courses/CourseSearch';
import { formatScoreVsPar, scoreBg } from '../lib/utils';
import type { CourseSummary } from '../../../shared/src/types';

const WEATHER_OPTIONS = [
  { value: 'SUNNY', label: 'Sunny', icon: '☀️' },
  { value: 'CLOUDY', label: 'Cloudy', icon: '☁️' },
  { value: 'WINDY', label: 'Windy', icon: '💨' },
  { value: 'RAINY', label: 'Rainy', icon: '🌧️' },
  { value: 'COLD', label: 'Cold', icon: '🥶' },
] as const;

const schema = z.object({
  score: z.coerce.number().int().positive('Score must be a positive number'),
  date: z.string().min(1, 'Date is required'),
  weather: z.enum(['SUNNY', 'CLOUDY', 'WINDY', 'RAINY', 'COLD']),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export function LogRoundPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);
  const [courseError, setCourseError] = useState('');

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weather: 'SUNNY',
    },
  });

  const scoreValue = watch('score');
  const scoreVsPar = selectedCourse && scoreValue
    ? Number(scoreValue) - selectedCourse.par
    : null;

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      roundsApi.create({
        courseId: selectedCourse!.id,
        date: data.date,
        score: Number(data.score),
        weather: data.weather,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['rounds'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigate('/dashboard');
    },
  });

  async function onSubmit(data: FormData) {
    if (!selectedCourse) {
      setCourseError('Please select a course');
      return;
    }
    setCourseError('');
    await mutation.mutateAsync(data);
  }

  return (
    <PageWrapper title="Log a Round">
      <div className="max-w-lg">
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Course */}
            <CourseSearch value={selectedCourse} onChange={setSelectedCourse} error={courseError} />

            {/* Par display */}
            {selectedCourse && (
              <div className="flex items-center gap-3 bg-stone-50 rounded-lg px-4 py-2.5 text-sm">
                <span className="text-stone-600">{selectedCourse.holeCount} holes</span>
                <span className="text-stone-300">·</span>
                <span className="font-medium text-stone-700">Par {selectedCourse.par}</span>
              </div>
            )}

            {/* Score + live vs-par */}
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">
                Total Score <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={999}
                  placeholder="e.g. 52"
                  className={`w-32 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500
                    ${errors.score ? 'border-red-400' : 'border-stone-300'} bg-white`}
                  {...register('score')}
                />
                {scoreVsPar !== null && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${scoreBg(scoreVsPar)}`}>
                    {formatScoreVsPar(scoreVsPar)}
                  </span>
                )}
              </div>
              {errors.score && <p className="text-xs text-red-600 mt-1">{errors.score.message}</p>}
            </div>

            {/* Date */}
            <Input
              label="Date"
              type="date"
              required
              error={errors.date?.message}
              {...register('date')}
            />

            {/* Weather */}
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">Weather</label>
              <Controller
                name="weather"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2 flex-wrap">
                    {WEATHER_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all
                          ${field.value === opt.value
                            ? 'bg-forest-600 text-white border-forest-600'
                            : 'bg-white text-stone-600 border-stone-300 hover:border-forest-400'}`}
                      >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Notes */}
            <Textarea
              label="Notes (optional)"
              placeholder="How did it go? Any memorable shots?"
              {...register('notes')}
            />

            {mutation.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {(mutation.error as any)?.response?.data?.error || 'Failed to log round'}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
              Log Round
            </Button>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}
