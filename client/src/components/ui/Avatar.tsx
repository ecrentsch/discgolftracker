import { avatarUrl } from '../../lib/utils';

interface AvatarProps {
  profilePicture?: string | null;
  username: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

export function Avatar({ profilePicture, username, size = 'md', className = '' }: AvatarProps) {
  const url = avatarUrl(profilePicture);
  const initials = username.slice(0, 2).toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={username}
        className={`${sizeMap[size]} rounded-full object-cover bg-stone-200 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-forest-600 text-white flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
