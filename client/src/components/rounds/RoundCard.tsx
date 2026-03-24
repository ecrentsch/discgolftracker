import { Link } from 'react-router-dom';
import type { RoundFeedItem, RoundWithCourse } from '../../../../shared/src/types';
import { Avatar } from '../ui/Avatar';
import { ScoreBadge } from '../ui/ScoreBadge';
import { Card } from '../ui/Card';
import { formatDate, weatherLabel } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roundsApi } from '../../api/rounds';

type Props = {
  round: RoundFeedItem | RoundWithCourse;
  showUser?: boolean;
};

export function RoundCard({ round, showUser = false }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const feedRound = round as RoundFeedItem;
  const weather = weatherLabel(round.weather);

  const deleteMutation = useMutation({
    mutationFn: () => roundsApi.delete(round.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const isOwn = user?.id === round.userId;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {showUser && feedRound.user && (
          <Link to={`/profile/${feedRound.user.username}`} className="flex-shrink-0">
            <Avatar profilePicture={feedRound.user.profilePicture} username={feedRound.user.username} size="md" />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              {showUser && feedRound.user && (
                <Link to={`/profile/${feedRound.user.username}`} className="font-semibold text-stone-900 hover:text-forest-700">
                  {feedRound.user.username}
                </Link>
              )}
              <Link to={`/courses/${round.courseId}`} className="block text-forest-700 font-medium hover:underline">
                {round.course.name}
              </Link>
              <p className="text-xs text-stone-400">{round.course.city}, {round.course.state}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <ScoreBadge scoreVsPar={round.scoreVsPar} size="md" />
              <span className="text-xs text-stone-400">{round.score} strokes</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
            <span>{formatDate(round.date)}</span>
            <span>{weather.icon} {weather.label}</span>
            <span className="text-stone-300">Par {round.course.par}</span>
          </div>

          {round.notes && (
            <p className="mt-2 text-sm text-stone-600 bg-stone-50 rounded-lg px-3 py-1.5 line-clamp-2">
              {round.notes}
            </p>
          )}

          {isOwn && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => { if (confirm('Delete this round?')) deleteMutation.mutate(); }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
