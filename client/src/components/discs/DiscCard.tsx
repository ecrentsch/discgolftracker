import type { Disc } from '../../../../shared/src/types';
import { Card } from '../ui/Card';
import { discType } from '../../lib/utils';

interface DiscCardProps {
  disc: Disc;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export function DiscCard({ disc, onEdit, onDelete, readOnly = false }: DiscCardProps) {
  const type = discType(disc.speed);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900">{disc.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type.color}`}>{type.label}</span>
          </div>
          <p className="text-sm text-stone-500">{disc.brand} · {disc.plasticType} · {disc.weight}g</p>
        </div>
        {!readOnly && (
          <div className="flex gap-2 flex-shrink-0">
            {onEdit && (
              <button onClick={onEdit} className="text-xs text-stone-500 hover:text-forest-700 font-medium">
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 font-medium">
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1">
        {[
          { label: 'Speed', value: disc.speed },
          { label: 'Glide', value: disc.glide },
          { label: 'Turn', value: disc.turn },
          { label: 'Fade', value: disc.fade },
        ].map(({ label, value }) => (
          <div key={label} className="bg-stone-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-stone-800">{value}</div>
            <div className="text-xs text-stone-400">{label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
