import type { UserStats } from '../../../../shared/src/types';
import { formatScoreVsPar } from '../../lib/utils';

interface ProfileStatsProps {
  stats: UserStats;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const tiles = [
    {
      label: 'Total Rounds',
      value: stats.totalRounds,
    },
    {
      label: 'Total Throws',
      value: stats.totalThrows,
    },
    {
      label: 'Avg Score',
      value: stats.avgScoreVsPar !== null
        ? formatScoreVsPar(Math.round(stats.avgScoreVsPar))
        : '—',
      color: stats.avgScoreVsPar !== null
        ? stats.avgScoreVsPar < 0 ? 'text-forest-700' : stats.avgScoreVsPar > 0 ? 'text-red-600' : 'text-stone-600'
        : 'text-stone-400',
    },
    {
      label: 'Best Round',
      value: stats.bestRound ? formatScoreVsPar(stats.bestRound.scoreVsPar) : '—',
      sub: stats.bestRound?.courseName,
      color: stats.bestRound && stats.bestRound.scoreVsPar < 0 ? 'text-forest-700' : 'text-stone-600',
    },
    {
      label: 'Fav. Course',
      value: stats.favoriteCourse?.name ?? '—',
      sub: stats.favoriteCourse ? `${stats.favoriteCourse.roundCount} rounds` : undefined,
      small: true,
    },
    {
      label: 'Fav. Disc',
      value: stats.favoriteDisc ?? '—',
      small: true,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map(tile => (
        <div key={tile.label} className="bg-stone-50 rounded-xl p-3 text-center">
          <div className={`font-bold ${tile.small ? 'text-sm' : 'text-xl'} ${tile.color ?? 'text-stone-800'} truncate`}>
            {tile.value}
          </div>
          {tile.sub && <div className="text-xs text-stone-400 truncate">{tile.sub}</div>}
          <div className="text-xs text-stone-500 mt-0.5">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
