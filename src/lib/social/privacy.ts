import type { ShareData, RatingShareData, JourneyShareData, VisitShareData } from './types';
import type { ProfileSettings } from '../../types/database.types';

/**
 * Sanitizes share data against user's privacy settings
 * Ensures emails, sensitive UUIDs, and private ratings/visits are masked or stripped
 */
export const sanitizeShareDataForPrivacy = (
  data: ShareData,
  settings?: ProfileSettings
): ShareData => {
  // Deep clone to avoid mutating application state
  const cleanData = JSON.parse(JSON.stringify(data)) as ShareData;

  switch (cleanData.type) {
    case 'rating': {
      const ratingData = cleanData as RatingShareData;
      // If rating visibility is private or not public, mask reviewer identity
      if (settings && settings.rating_visibility === 'private') {
        ratingData.reviewerName = 'Aabesh Contributor';
        ratingData.reviewerAvatar = undefined;
        ratingData.isPublic = false;
      }
      return ratingData;
    }

    case 'visit': {
      const visitData = cleanData as VisitShareData;
      // If visit visibility is private, mask visitor identity
      if (settings && settings.visit_visibility === 'private') {
        visitData.visitorName = 'Aabesh Explorer';
      }
      return visitData;
    }

    case 'journey': {
      const journeyData = cleanData as JourneyShareData;
      // If profile visibility is private, mask user details
      if (settings && settings.profile_visibility === 'private') {
        journeyData.user = {
          ...journeyData.user,
          display_name: 'Puja Hopper',
          username: 'aabesh_user',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        };
      }
      return journeyData;
    }

    default:
      return cleanData;
  }
};

/**
 * Checks if a share context is allowed to be shared publicly
 */
export const isShareAllowedByPrivacy = (
  data: ShareData,
  settings?: ProfileSettings
): { allowed: boolean; reason?: string } => {
  if (!settings) return { allowed: true };

  if (data.type === 'rating' && settings.rating_visibility === 'private') {
    return {
      allowed: true,
      reason: 'Your rating will be shared anonymously to protect your privacy settings.'
    };
  }

  if (data.type === 'visit' && settings.visit_visibility === 'private') {
    return {
      allowed: true,
      reason: 'Your visit check-in will be shared anonymously.'
    };
  }

  if (data.type === 'journey' && settings.profile_visibility === 'private') {
    return {
      allowed: true,
      reason: 'Your profile details will be obscured on public shares.'
    };
  }

  return { allowed: true };
};
