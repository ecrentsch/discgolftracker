export type Weather = 'SUNNY' | 'CLOUDY' | 'WINDY' | 'RAINY' | 'COLD';
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: number;
  username: string;
  profilePicture: string | null;
}

export interface UserMe extends UserPublic {
  email: string;
  createdAt: string;
}

export interface UserStats {
  totalRounds: number;
  totalThrows: number;
  avgScoreVsPar: number | null;
  bestRound: {
    roundId: number;
    scoreVsPar: number;
    courseName: string;
    date: string;
  } | null;
  favoriteCourse: {
    courseId: number;
    name: string;
    roundCount: number;
  } | null;
  favoriteDisc: string | null;
}

export interface UserProfile extends UserPublic {
  stats: UserStats;
  rounds: RoundWithCourse[];
  bag: Disc[];
  friends: UserPublic[];
  friendshipStatus: FriendshipStatus | null;
}

// ─── Course ───────────────────────────────────────────────────────────────────

export interface Course {
  id: number;
  name: string;
  city: string;
  state: string;
  holeCount: number;
  par: number;
  createdAt: string;
}

export interface CourseSummary extends Course {
  avgRating: number | null;
  ratingCount: number;
}

export interface CourseRating {
  id: number;
  userId: number;
  courseId: number;
  stars: number;
  review: string | null;
  createdAt: string;
  updatedAt: string;
  user: UserPublic;
}

export interface CourseDetail extends CourseSummary {
  ratings: CourseRating[];
  recentPlayers: (UserPublic & { lastPlayed: string })[];
  myRating: { stars: number; review: string | null } | null;
}

// ─── Round ────────────────────────────────────────────────────────────────────

export interface Round {
  id: number;
  userId: number;
  courseId: number;
  date: string;
  score: number;
  scoreVsPar: number;
  weather: Weather;
  notes: string | null;
  createdAt: string;
}

export interface RoundWithCourse extends Round {
  course: Course;
}

export interface RoundFeedItem extends RoundWithCourse {
  user: UserPublic;
}

// ─── Disc ─────────────────────────────────────────────────────────────────────

export interface Disc {
  id: number;
  userId: number;
  name: string;
  brand: string;
  plasticType: string;
  weight: number;
  speed: number;
  glide: number;
  turn: number;
  fade: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Friendship ───────────────────────────────────────────────────────────────

export interface FriendshipWithUser {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: FriendshipStatus;
  createdAt: string;
  user: UserPublic;
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateRoundInput {
  courseId: number;
  date: string;
  score: number;
  weather: Weather;
  notes?: string;
}

export interface CreateCourseInput {
  name: string;
  city: string;
  state: string;
  holeCount: number;
  par: number;
}

export interface CreateDiscInput {
  name: string;
  brand: string;
  plasticType: string;
  weight: number;
  speed: number;
  glide: number;
  turn: number;
  fade: number;
}

export interface CreateRatingInput {
  stars: number;
  review?: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface AuthResponse {
  user: UserMe;
  accessToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
