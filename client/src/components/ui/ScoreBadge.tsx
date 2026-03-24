import { formatScoreVsPar, scoreBg } from '../../lib/utils';

interface ScoreBadgeProps {
  scoreVsPar: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-0.5',
  lg: 'text-base px-3 py-1',
};

export function ScoreBadge({ scoreVsPar, size = 'md', className = '' }: ScoreBadgeProps) {
  return (
    <span className={`inline-block rounded-full font-semibold ${scoreBg(scoreVsPar)} ${sizeClass[size]} ${className}`}>
      {formatScoreVsPar(scoreVsPar)}
    </span>
  );
}
