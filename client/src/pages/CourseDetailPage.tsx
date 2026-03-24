import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { StarRating } from '../components/ui/StarRating';
import { PageSpinner } from '../components/ui/Spinner';
import { Textarea } from '../components/ui/Input';
import { formatDate } from '../lib/utils';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [myStars, setMyStars] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [showRateForm, setShowRateForm] = useState(false);
  const [ratingInitialized, setRatingInitialized] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getDetail(Number(id)),
    enabled: !!id,
  });

  // Initialize rating fields once course data loads
  if (course?.myRating && !ratingInitialized) {
    setMyStars(course.myRating.stars);
    setMyReview(course.myRating.review || '');
    setRatingInitialized(true);
  }

  const rateMutation = useMutation({
    mutationFn: () => coursesApi.rate(Number(id), { stars: myStars, review: myReview || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      setShowRateForm(false);
    },
  });

  if (isLoading) return <PageWrapper><PageSpinner /></PageWrapper>;
  if (!course) return <PageWrapper><p className="text-stone-500">Course not found.</p></PageWrapper>;

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-stone-900">{course.name}</h1>
          <p className="text-stone-500 mt-1">{course.city}, {course.state}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-stone-600">
            <span className="bg-forest-50 text-forest-700 px-3 py-1 rounded-full font-medium">
              {course.holeCount} holes
            </span>
            <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-medium">
              Par {course.par}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <StarRating value={Math.round(course.avgRating ?? 0)} size="lg" />
            <div>
              <span className="text-lg font-bold text-stone-800">
                {course.avgRating ? course.avgRating.toFixed(1) : 'No ratings yet'}
              </span>
              {course.ratingCount > 0 && (
                <span className="text-sm text-stone-400 ml-1">({course.ratingCount} reviews)</span>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowRateForm(!showRateForm)}
            >
              {course.myRating ? 'Update My Rating' : 'Rate This Course'}
            </Button>
          )}

          {showRateForm && (
            <div className="mt-4 p-4 bg-stone-50 rounded-xl space-y-3">
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">Your rating</p>
                <StarRating value={myStars} onChange={setMyStars} interactive size="lg" />
              </div>
              <Textarea
                label="Review (optional)"
                placeholder="What do you think of this course?"
                value={myReview}
                onChange={e => setMyReview(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => rateMutation.mutate()}
                  disabled={myStars === 0}
                  loading={rateMutation.isPending}
                >
                  Submit Rating
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowRateForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Players */}
        {course.recentPlayers.length > 0 && (
          <Card className="p-5">
            <h2 className="font-semibold text-stone-900 mb-4">Recent Players</h2>
            <div className="flex flex-wrap gap-3">
              {course.recentPlayers.map((player: any) => (
                <Link key={player.id} to={`/profile/${player.username}`} className="flex flex-col items-center gap-1">
                  <Avatar profilePicture={player.profilePicture} username={player.username} size="md" />
                  <span className="text-xs text-stone-600">{player.username}</span>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Reviews */}
        <div>
          <h2 className="font-semibold text-stone-900 mb-4">Reviews</h2>
          {course.ratings.length === 0 ? (
            <Card className="p-8 text-center text-stone-400">
              No reviews yet. Be the first to rate this course!
            </Card>
          ) : (
            <div className="space-y-4">
              {course.ratings.map((rating: any) => (
                <Card key={rating.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Link to={`/profile/${rating.user.username}`}>
                      <Avatar profilePicture={rating.user.profilePicture} username={rating.user.username} size="sm" />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/profile/${rating.user.username}`} className="font-medium text-stone-900 hover:text-forest-700">
                          {rating.user.username}
                        </Link>
                        <StarRating value={rating.stars} size="sm" />
                        <span className="text-xs text-stone-400">{formatDate(rating.createdAt)}</span>
                      </div>
                      {rating.review && <p className="text-sm text-stone-600">{rating.review}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
