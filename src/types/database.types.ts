export type VisibilitySetting = 'public' | 'friends' | 'private';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  created_at?: string;
}

export interface ProfileSettings {
  user_id: string;
  visit_visibility: VisibilitySetting;
  profile_visibility: VisibilitySetting;
  rating_visibility: VisibilitySetting;
  allow_friend_requests: boolean;
}

export interface Pandal {
  id: string;
  legacy_id?: string;
  name: string;
  name_bn?: string;
  slug: string;
  committee_name?: string;
  description: string;
  historical_significance?: string;
  founded_year?: number;
  heritage_status?: string;
  address: string;
  zone: 'South Kolkata' | 'North Kolkata' | 'Salt Lake & East' | 'Central Kolkata' | 'Howrah';
  city: string;
  latitude: number;
  longitude: number;
  image_url: string;
  theme_year?: string;
}

export type RatingCategoryCode = 'overall' | 'theme' | 'idol' | 'lighting' | 'management';

export interface RatingCategory {
  id: string;
  code: RatingCategoryCode;
  name: string;
  name_bn: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export interface RatingCategoryScore {
  id: string;
  rating_id: string;
  category_id: string;
  category_code?: RatingCategoryCode;
  score: 1 | 2 | 3 | 4 | 5;
}

export interface RatingScores {
  overall: number;
  theme: number;
  idol: number;
  lighting: number;
  management: number;
}

export interface Rating {
  id: string;
  user_id: string;
  pandal_id: string;
  season_id?: string;
  rating: number; // overall integer 1-5
  scores: RatingScores; // exact 5-dimension scores
  review?: string;
  is_visible: boolean;
  created_at: string;
  updated_at?: string;
  user?: Profile;
}

export interface RatingFormValues {
  overall: 1 | 2 | 3 | 4 | 5 | null;
  theme: 1 | 2 | 3 | 4 | 5 | null;
  idol: 1 | 2 | 3 | 4 | 5 | null;
  lighting: 1 | 2 | 3 | 4 | 5 | null;
  management: 1 | 2 | 3 | 4 | 5 | null;
  review?: string;
}

export interface PandalRatingSummary {
  pandal_id: string;
  season_id?: string;
  overall_rating: number;
  theme_rating: number;
  idol_rating: number;
  lighting_rating: number;
  management_rating: number;
  overall_count: number;
  theme_count: number;
  idol_count: number;
  lighting_count: number;
  management_count: number;
  total_ratings: number;
}

export interface Visit {
  id: string;
  user_id: string;
  pandal_id: string;
  season_id?: string;
  visited_at: string;
  user?: Profile;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  accepted_at?: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface FriendActivity {
  id: string;
  type: 'visit' | 'rating' | 'milestone';
  user: Profile;
  pandalName?: string;
  pandalId?: string;
  rating?: number;
  scores?: RatingScores;
  review?: string;
  timestamp: string;
  count?: number;
  detail?: string;
}

export interface PandalWithStats extends Pandal {
  avgRating: number;
  ratingCount: number;
  ratingSummary?: PandalRatingSummary;
  visitCount: number;
  userVisited: boolean;
  userRating?: number;
  userScores?: RatingScores;
  userReview?: string;
  friendsVisitedCount: number;
  friendsWhoVisited: Profile[];
}
