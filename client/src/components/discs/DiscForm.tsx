import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Disc, CreateDiscInput } from '../../../../shared/src/types';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  brand: z.string().min(1, 'Required'),
  plasticType: z.string().min(1, 'Required'),
  weight: z.coerce.number().min(100, 'Min 100g').max(200, 'Max 200g'),
  speed: z.coerce.number().int().min(1).max(15),
  glide: z.coerce.number().int().min(1).max(7),
  turn: z.coerce.number().int().min(-5).max(2),
  fade: z.coerce.number().int().min(0).max(6),
});

type FormData = z.infer<typeof schema>;

interface DiscFormProps {
  defaultValues?: Partial<Disc>;
  onSubmit: (data: CreateDiscInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DiscForm({ defaultValues, onSubmit, onCancel, isLoading }: DiscFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ? {
      name: defaultValues.name,
      brand: defaultValues.brand,
      plasticType: defaultValues.plasticType,
      weight: defaultValues.weight,
      speed: defaultValues.speed,
      glide: defaultValues.glide,
      turn: defaultValues.turn,
      fade: defaultValues.fade,
    } : { weight: 175, speed: 7, glide: 4, turn: 0, fade: 2 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Disc Name" placeholder="Destroyer" error={errors.name?.message} {...register('name')} />
        <Input label="Brand" placeholder="Innova" error={errors.brand?.message} {...register('brand')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Plastic Type" placeholder="Star, Z-Line, etc." error={errors.plasticType?.message} {...register('plasticType')} />
        <Input label="Weight (g)" type="number" min={100} max={200} error={errors.weight?.message} {...register('weight')} />
      </div>

      <div className="bg-stone-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Flight Numbers</p>
        <div className="grid grid-cols-4 gap-2">
          <Input label="Speed" type="number" min={1} max={15} error={errors.speed?.message} {...register('speed')} />
          <Input label="Glide" type="number" min={1} max={7} error={errors.glide?.message} {...register('glide')} />
          <Input label="Turn" type="number" min={-5} max={2} error={errors.turn?.message} {...register('turn')} />
          <Input label="Fade" type="number" min={0} max={6} error={errors.fade?.message} {...register('fade')} />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading}>
          {defaultValues ? 'Update Disc' : 'Add Disc'}
        </Button>
      </div>
    </form>
  );
}
