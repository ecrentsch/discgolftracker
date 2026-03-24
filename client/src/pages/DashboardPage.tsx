import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { roundsApi } from '../api/rounds';
import { useAuth } from '../context/AuthContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RoundCard } from '../components/rounds/RoundCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import type { RoundFeedItem } from '../../../shared/src/types';

export function DashboardPage() {
  const { user } = useAuth();

  const feedQuery = useQuery({
    queryKey: ['feed'],
    queryFn: () => roundsApi.getFeed(1, 20),
  });

  const myRoundsQuery = useQuery({
    queryKey: ['rounds', 'my'],
    queryFn: () => roundsApi.getMyRounds(1, 5),
  });

  const feed = feedQuery.data?.data ?? [];
  const myRecent = myRoundsQuery.data?.data ?? [];
  const myTotal = myRoundsQuery.data?.total ?? 0;

  const myBest = myRecent.length > 0
    ? myRecent.reduce((best, r) => r.scoreVsPar < best.scoreVsPar ? r : best)
    : null;

  return (
    <PageWrapper>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card className="p-4">
            <h2 className="font-semibold text-stone-900 mb-3">Welcome back, {user?.username}!</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-forest-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-forest-700">{myTotal}</div>
                <div className="text-xs text-stone-500 mt-0.5">Total Rounds</div>
              </div>
              <div className="bg-earth-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-earth-600">
                  {myBest ? (myBest.scoreVsPar > 0 ? `+${myBest.scoreVsPar}` : myBest.scoreVsPar === 0 ? 'E' : myBest.scoreVsPar) : '—'}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">Best Round</div>
              </div>
            </div>
            <Link to="/log-round">
              <Button className="w-full">Log a Round</Button>
            </Link>
          </Card>

          {myRecent.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium text-stone-700 mb-3 text-sm">Your Recent Rounds</h3>
              <div className="space-y-2">
                {myRecent.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <Link to={`/courses/${r.courseId}`} className="text-forest-700 hover:underline truncate mr-2">
                      {r.course.name}
                    </Link>
                    <span className={`text-xs font-semibold flex-shrink-0 ${r.scoreVsPar < 0 ? 'text-forest-700' : r.scoreVsPar > 0 ? 'text-red-600' : 'text-stone-500'}`}>
                      {r.scoreVsPar > 0 ? `+${r.scoreVsPar}` : r.scoreVsPar === 0 ? 'E' : r.scoreVsPar}
                    </span>
                  </div>
                ))}
              </div>
              <Link to={`/profile/${user?.username}`} className="text-xs text-forest-600 hover:underline mt-3 block">
                View all rounds →
              </Link>
            </Card>
          )}
        </div>

        {/* Feed */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Friends' Activity</h2>

          {feedQuery.isLoading && <PageSpinner />}

          {!feedQuery.isLoading && feed.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-medium text-stone-700 mb-1">No activity yet</h3>
              <p className="text-sm text-stone-500 mb-4">
                Add friends to see their rounds here!
              </p>
              <Link to="/courses">
                <Button variant="outline" size="sm">Browse Courses</Button>
              </Link>
            </Card>
          )}

          {feed.map((round: RoundFeedItem) => (
            <RoundCard key={round.id} round={round} showUser />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
