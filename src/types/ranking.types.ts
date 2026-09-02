import type { RatingCategoryCode } from './database.types';

export interface PandalRanking {
  id: string;
  pandal_id: string;
  season_id: string;
  category_id: string;
  category_code?: RatingCategoryCode;
  
  raw_mean: number;
  bayesian_mean: number;
  lower_confidence_score: number;
  final_score: number;
  
  raw_rating_count: number;
  effective_sample_size: number;
  standard_deviation: number;
  
  one_star: number;
  two_star: number;
  three_star: number;
  four_star: number;
  five_star: number;
  
  rank: number;
  is_rank_eligible: boolean;
  eligibility_reason?: string;
  
  ranking_version: string;
  calculated_at: string;
  
  // Joined fields for UI
  pandal_name?: string;
  pandal_slug?: string;
  pandal_image_url?: string;
  pandal_address?: string;
  pandal_zone?: string;
}

export interface RankingRun {
  id: string;
  season_id: string;
  ranking_version: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  parameters: any;
  pandals_processed: number;
  ratings_processed: number;
  categories_processed: number;
  started_at: string;
  completed_at: string;
  error_message?: string;
  created_at: string;
}
