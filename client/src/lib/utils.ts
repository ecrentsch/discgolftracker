const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function formatScoreVsPar(scoreVsPar: number): string {
  if (scoreVsPar === 0) return 'E';
  if (scoreVsPar > 0) return `+${scoreVsPar}`;
  return `${scoreVsPar}`;
}

export function scoreColor(scoreVsPar: number): string {
  if (scoreVsPar < 0) return 'text-forest-700';
  if (scoreVsPar > 0) return 'text-red-600';
  return 'text-stone-500';
}

export function scoreBg(scoreVsPar: number): string {
  if (scoreVsPar < 0) return 'bg-forest-100 text-forest-800';
  if (scoreVsPar > 0) return 'bg-red-100 text-red-800';
  return 'bg-stone-100 text-stone-700';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateInput(iso: string): string {
  return new Date(iso).toISOString().split('T')[0];
}

export function avatarUrl(profilePicture: string | null | undefined): string {
  if (!profilePicture) return '';
  if (profilePicture.startsWith('http')) return profilePicture;
  return `${SERVER_URL}${profilePicture}`;
}

export function weatherLabel(w: string): { label: string; icon: string } {
  const map: Record<string, { label: string; icon: string }> = {
    SUNNY: { label: 'Sunny', icon: '☀️' },
    CLOUDY: { label: 'Cloudy', icon: '☁️' },
    WINDY: { label: 'Windy', icon: '💨' },
    RAINY: { label: 'Rainy', icon: '🌧️' },
    COLD: { label: 'Cold', icon: '🥶' },
  };
  return map[w] || { label: w, icon: '🌤️' };
}

export function discType(speed: number): { label: string; color: string } {
  if (speed <= 3) return { label: 'Putter', color: 'bg-blue-100 text-blue-800' };
  if (speed <= 6) return { label: 'Mid-range', color: 'bg-purple-100 text-purple-800' };
  if (speed <= 9) return { label: 'Fairway', color: 'bg-amber-100 text-amber-800' };
  return { label: 'Distance', color: 'bg-red-100 text-red-800' };
}

export { API_URL, SERVER_URL };
