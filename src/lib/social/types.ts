import type { PandalWithStats, RatingScores, Profile } from '../../types/database.types';
import type { RatingCategoryCode } from '../../types/database.types';

export type SocialPlatform =
  | 'whatsapp_message'
  | 'whatsapp_status'
  | 'instagram_story'
  | 'instagram_feed'
  | 'instagram_square'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'telegram'
  | 'native'
  | 'copy_link';

export type SocialAssetFormat =
  | 'og_1200x630'
  | 'story_1080x1920'
  | 'status_1080x1920'
  | 'feed_1080x1350'
  | 'square_1080x1080';

export interface FormatDimensions {
  width: number;
  height: number;
  label: string;
  aspectRatioLabel: string;
  recommendedFor: string;
}

export const FORMAT_DIMENSIONS: Record<SocialAssetFormat, FormatDimensions> = {
  og_1200x630: {
    width: 1200,
    height: 630,
    label: 'OpenGraph Link Preview',
    aspectRatioLabel: '1.91:1',
    recommendedFor: 'Facebook, X/Twitter, LinkedIn, Telegram & WhatsApp Chat Preview'
  },
  story_1080x1920: {
    width: 1080,
    height: 1920,
    label: 'Instagram Story',
    aspectRatioLabel: '9:16 Vertical',
    recommendedFor: 'Instagram Stories & Snap'
  },
  status_1080x1920: {
    width: 1080,
    height: 1920,
    label: 'WhatsApp Status',
    aspectRatioLabel: '9:16 Vertical',
    recommendedFor: 'WhatsApp Status & Mobile Wallpapers'
  },
  feed_1080x1350: {
    width: 1080,
    height: 1350,
    label: 'Instagram Feed Portrait',
    aspectRatioLabel: '4:5 Portrait',
    recommendedFor: 'Instagram Feed, Pinterest & Threads'
  },
  square_1080x1080: {
    width: 1080,
    height: 1080,
    label: 'Square Post',
    aspectRatioLabel: '1:1 Square',
    recommendedFor: 'Square Posts, Profile Cards & Grids'
  }
};


export interface PandalShareData {
  type: 'pandal';
  pandal: PandalWithStats;
  themeYear?: string;
  categoryName?: string;
}

export interface RatingShareData {
  type: 'rating';
  pandal: PandalWithStats;
  overallScore: number;
  scores: RatingScores;
  review?: string;
  reviewerName?: string;
  reviewerAvatar?: string;
  isPublic?: boolean;
}

export interface VisitShareData {
  type: 'visit';
  pandal: PandalWithStats;
  visitedAt?: string;
  visitorName?: string;
  seasonYear?: string;
}

export interface JourneyShareData {
  type: 'journey';
  user: Profile;
  visitedPandals: PandalWithStats[];
  totalVisitedCount: number;
  ratingsCount?: number;
  seasonYear?: string;
}

export interface RankingShareData {
  type: 'ranking';
  categoryCode: RatingCategoryCode;
  categoryName: string;
  categoryNameBn: string;
  seasonYear?: string;
  topPandals: Array<{
    rank: number;
    pandal: PandalWithStats;
    score: number;
  }>;
}

export type ShareType = 'pandal' | 'rating' | 'visit' | 'journey' | 'ranking' | 'app';

export interface AppShareData {
  type: 'app';
  url?: string;
  title?: string;
  titleBn?: string;
  tagline?: string;
  description?: string;
  heroImage?: string;
}

export type ShareData =
  | PandalShareData
  | RatingShareData
  | VisitShareData
  | JourneyShareData
  | RankingShareData
  | AppShareData;

export interface ShareCopyPayload {
  title: string;
  description: string;
  shareText: string;
  url: string;
  hashtags?: string[];
}

export interface SocialMetaTags {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  twitterCard: 'summary_large_image' | 'summary';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}
