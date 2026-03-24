import { useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsApi } from '../../api/friends';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import type { FriendshipStatus } from '../../../../shared/src/types';

interface FriendButtonProps {
  targetUserId: number;
  targetUsername: string;
  friendshipStatus: FriendshipStatus | null;
  friendshipRequesterId?: number | null;
}

export function FriendButton({ targetUserId, targetUsername, friendshipStatus, friendshipRequesterId }: FriendButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', targetUsername] });
    queryClient.invalidateQueries({ queryKey: ['friends'] });
  };

  const sendMutation = useMutation({
    mutationFn: () => friendsApi.sendRequest(targetUserId),
    onSuccess: invalidate,
  });

  const acceptMutation = useMutation({
    mutationFn: () => friendsApi.accept(targetUserId),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: () => friendsApi.remove(targetUserId),
    onSuccess: invalidate,
  });

  if (!user || user.id === targetUserId) return null;

  if (friendshipStatus === 'ACCEPTED') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => { if (confirm('Remove friend?')) removeMutation.mutate(); }}
        loading={removeMutation.isPending}
      >
        ✓ Friends
      </Button>
    );
  }

  if (friendshipStatus === 'PENDING') {
    // The profile owner sent the request to current user → show Accept
    if (friendshipRequesterId === targetUserId) {
      return (
        <Button
          size="sm"
          onClick={() => acceptMutation.mutate()}
          loading={acceptMutation.isPending}
        >
          Accept Request
        </Button>
      );
    }
    // Current user sent the request
    return (
      <Button variant="ghost" size="sm" disabled>
        Request Sent
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => sendMutation.mutate()}
      loading={sendMutation.isPending}
    >
      + Add Friend
    </Button>
  );
}
