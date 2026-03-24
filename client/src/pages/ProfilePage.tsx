import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { ProfileStats } from '../components/users/ProfileStats';
import { FriendButton } from '../components/users/FriendButton';
import { RoundCard } from '../components/rounds/RoundCard';
import { DiscCard } from '../components/discs/DiscCard';
import type { RoundWithCourse } from '../../../shared/src/types';

type Tab = 'rounds' | 'bag' | 'friends';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('rounds');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.getProfile(username!),
    enabled: !!username,
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(username!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      refreshUser();
    },
  });

  const isOwnProfile = currentUser?.username === username;

  if (isLoading) return <PageWrapper><PageSpinner /></PageWrapper>;
  if (!profile) return <PageWrapper><p className="text-stone-500">User not found.</p></PageWrapper>;

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-start gap-5">
            <div className="relative group">
              <Avatar profilePicture={profile.profilePicture} username={profile.username} size="xl" />
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    Change
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) avatarMutation.mutate(f); }}
                  />
                </>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-stone-900">{profile.username}</h1>
                {!isOwnProfile && (
                  <FriendButton
                    targetUserId={profile.id}
                    targetUsername={profile.username}
                    friendshipStatus={profile.friendshipStatus}
                    friendshipRequesterId={(profile as any).friendshipRequesterId}
                  />
                )}
              </div>
              <p className="text-sm text-stone-500 mt-1">
                {profile.stats.totalRounds} rounds logged
              </p>
              {isOwnProfile && (
                <Link to="/my-bag">
                  <Button variant="outline" size="sm" className="mt-3">Manage Bag</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-5">
            <ProfileStats stats={profile.stats} />
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex border-b border-stone-200">
          {(['rounds', 'bag', 'friends'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                ${activeTab === tab ? 'border-forest-600 text-forest-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
            >
              {tab}
              {tab === 'rounds' && ` (${profile.rounds.length})`}
              {tab === 'bag' && ` (${profile.bag.length})`}
              {tab === 'friends' && ` (${profile.friends.length})`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'rounds' && (
          <div className="space-y-4">
            {profile.rounds.length === 0 ? (
              <Card className="p-8 text-center text-stone-400">No rounds logged yet.</Card>
            ) : (
              profile.rounds.map((round: RoundWithCourse) => (
                <RoundCard key={round.id} round={round} showUser={false} />
              ))
            )}
          </div>
        )}

        {activeTab === 'bag' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.bag.length === 0 ? (
              <Card className="p-8 text-center text-stone-400 col-span-2">Bag is empty.</Card>
            ) : (
              profile.bag.map(disc => <DiscCard key={disc.id} disc={disc} readOnly />)
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {profile.friends.length === 0 ? (
              <Card className="p-8 text-center text-stone-400 col-span-full">No friends yet.</Card>
            ) : (
              profile.friends.map(friend => (
                <Link key={friend.id} to={`/profile/${friend.username}`}>
                  <Card className="p-4 text-center hover:shadow-md transition-shadow">
                    <Avatar profilePicture={friend.profilePicture} username={friend.username} size="lg" className="mx-auto mb-2" />
                    <p className="text-sm font-medium text-stone-800 truncate">{friend.username}</p>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
