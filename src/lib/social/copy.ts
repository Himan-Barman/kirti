import type { ShareData, SocialPlatform, ShareCopyPayload } from './types';

export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
    return window.location.origin;
  }
  return 'https://aabesh.vercel.app';
};

/**
 * Builds clean, deterministic canonical URLs for sharing
 */
export const buildShareUrl = (data: ShareData): string => {
  const origin = getBaseUrl();
  switch (data.type) {
    case 'app':
      return data.url || 'https://aabesh.vercel.app';
    case 'pandal':
      return `${origin}/?pandal=${encodeURIComponent(data.pandal.slug || data.pandal.id)}`;
    case 'rating':
      return `${origin}/?pandal=${encodeURIComponent(data.pandal.slug || data.pandal.id)}&view=rating`;
    case 'visit':
      return `${origin}/?pandal=${encodeURIComponent(data.pandal.slug || data.pandal.id)}&view=visit`;
    case 'journey':
      return `${origin}/?tab=friends&user=${encodeURIComponent(data.user.username || data.user.id)}`;
    case 'ranking':
      return `${origin}/?tab=vote&category=${encodeURIComponent(data.categoryCode)}`;
    default:
      return origin;
  }
};

/**
 * Generates platform and context-tailored social copy
 */
export const generateShareCopy = (data: ShareData, platform?: SocialPlatform): ShareCopyPayload => {
  const url = buildShareUrl(data);

  switch (data.type) {
    case 'pandal': {
      const p = data.pandal;
      const location = `${p.address ? p.address.split(',')[0] + ', ' : ''}${p.city || 'Kolkata'}`;
      const ratingStr = p.avgRating && p.avgRating > 0 ? ` ★ ${p.avgRating.toFixed(1)}/5` : '';
      
      let title = `${p.name}${p.name_bn ? ` (${p.name_bn})` : ''} — aabesh`;
      let description = p.description
        ? p.description.slice(0, 160) + (p.description.length > 160 ? '...' : '')
        : `Discover ${p.name}, authentic 5-dimension craft ratings, and friend check-ins on aabesh.`;

      let shareText = '';
      if (platform === 'whatsapp_message') {
        shareText = `I just discovered ${p.name} on aabesh.${ratingStr ? ` Community rating: ${p.avgRating.toFixed(1)}/5.` : ''}\n\nSee pandal photography, craft scores and location:`;
      } else if (platform === 'twitter') {
        shareText = `Discovering ${p.name}${p.name_bn ? ` (${p.name_bn})` : ''} in ${p.zone || location} on @aabesh_app.${ratingStr}\n\nExplore craft ratings and friend trails:`;
      } else if (platform === 'linkedin') {
        shareText = `Exploring Kolkata's monumental Durga Puja craftsmanship: ${p.name}.${ratingStr ? ` Rated ${p.avgRating.toFixed(1)}/5 by the cultural community on aabesh.` : ''}`;
      } else {
        shareText = `I just discovered ${p.name} on aabesh. Discover pandal craft ratings, friend check-ins, and festive maps:`;
      }

      return {
        title,
        description,
        shareText,
        url,
        hashtags: ['DurgaPuja2026', 'Aabesh', 'KolkataPuja', 'BengalHeritage']
      };
    }

    case 'rating': {
      const p = data.pandal;
      const scoreStr = data.overallScore ? `${data.overallScore.toFixed(1)}/5` : '5/5';
      const reviewer = data.reviewerName ? `${data.reviewerName}'s` : 'My';

      let title = `${reviewer} Rating for ${p.name} (${scoreStr}) — aabesh`;
      let description = data.review
        ? `"${data.review.slice(0, 140)}..." — ${reviewer} 5-dimension rating breakdown on aabesh.`
        : `${reviewer} rating for ${p.name}: Overall ${scoreStr}, Theme ${data.scores.theme}/5, Idol ${data.scores.idol}/5, Lighting ${data.scores.lighting}/5.`;

      let shareText = '';
      if (platform === 'whatsapp_message') {
        shareText = `I rated ${p.name} on aabesh.\n\nMy overall score: ${scoreStr} ★${data.review ? `\n"${data.review}"` : ''}\n\nCheck out the full 5-dimension craft breakdown:`;
      } else if (platform === 'twitter') {
        shareText = `Just rated ${p.name} on @aabesh_app: ${scoreStr} ★ (Theme ${data.scores.theme}/5, Idol ${data.scores.idol}/5, Lighting ${data.scores.lighting}/5).`;
      } else {
        shareText = `My verified rating for ${p.name} on aabesh: ${scoreStr} ★. Discover community ratings and festive trails:`;
      }

      return {
        title,
        description,
        shareText,
        url,
        hashtags: ['AabeshRating', 'DurgaPuja2026', 'Kolkata']
      };
    }

    case 'visit': {
      const p = data.pandal;
      const season = data.seasonYear || 'Durga Puja 2026';
      const visitor = data.visitorName || 'I';

      let title = `Checked-in at ${p.name} • ${season} — aabesh`;
      let description = `${visitor} visited ${p.name} in ${p.zone || p.city || 'Kolkata'} during ${season}. Track your own Puja trail on aabesh.`;

      let shareText = '';
      if (platform === 'whatsapp_message') {
        shareText = `I visited ${p.name} this Puja!\n\nFind it on aabesh with location, reviews & friend visits:`;
      } else if (platform === 'twitter') {
        shareText = `Visited ${p.name} (${season})! Marked in my Puja Passport on @aabesh_app.`;
      } else {
        shareText = `Visited ${p.name} this Puja. Track your festive journey on aabesh:`;
      }

      return {
        title,
        description,
        shareText,
        url,
        hashtags: ['PujaPassport', 'Aabesh', 'DurgaPuja2026']
      };
    }

    case 'journey': {
      const count = data.totalVisitedCount || data.visitedPandals.length || 0;
      const name = data.user.display_name || data.user.username || 'My';
      const season = data.seasonYear || '2026';

      let title = `${name}'s Puja Trail • ${count} Pandals Visited (${season}) — aabesh`;
      let description = `Explore ${name}'s festive journey across ${count} pandals in Kolkata on aabesh.`;

      let shareText = '';
      if (platform === 'whatsapp_message') {
        shareText = `My Durga Puja trail on aabesh — ${count} pandal${count === 1 ? '' : 's'} explored so far!\n\nCheck out my Puja journey:`;
      } else if (platform === 'twitter') {
        shareText = `My #DurgaPuja${season} trail on @aabesh_app: ${count} pandals explored! Check it out:`;
      } else {
        shareText = `Explore ${name}'s Puja trail on aabesh (${count} pandals checked in):`;
      }

      return {
        title,
        description,
        shareText,
        url,
        hashtags: ['PujaTrail', 'Aabesh', 'DurgaPuja2026']
      };
    }

    case 'ranking': {
      const season = data.seasonYear || '2026';
      const catName = data.categoryName || 'Overall';
      const top3Names = data.topPandals.slice(0, 3).map((item, idx) => `${idx + 1}. ${item.pandal.name}`).join('\n');

      let title = `Kolkata's Most Loved Pandals (${catName}) • ${season} — aabesh`;
      let description = `Official community rankings for ${catName} across Kolkata Durga Puja ${season} on aabesh.`;

      let shareText = '';
      if (platform === 'whatsapp_message') {
        shareText = `These are among Kolkata's most loved pandals in ${catName} on aabesh:\n\n${top3Names}\n\nSee full rankings & cast your vote:`;
      } else if (platform === 'twitter') {
        shareText = `Kolkata's Top Pandals for ${catName} on @aabesh_app:\n${top3Names}\n\nExplore rankings:`;
      } else {
        shareText = `Kolkata's most loved pandals in ${catName} on aabesh (${season}):`;
      }

      return {
        title,
        description,
        shareText,
        url,
        hashtags: ['AabeshRankings', 'KolkataPuja2026', 'DurgaPujaAwards']
      };
    }

    case 'app': {
      const url = data.url || 'https://aabesh.vercel.app';
      const title = data.title || 'aabesh (আবেশ) — Kolkata Durga Puja Discovery, Ratings & Social Trails';
      const description = data.description || 'Discover Kolkata\'s Durga Puja pandals, explore live community ratings across 5 craft dimensions, track your visited pandals, and follow friends\' Puja trails.';

      let shareText = '';
      if (platform === 'whatsapp_message') {
        shareText = `Discover Kolkata's most magnificent Durga Puja pandals on aabesh!\n\nExplore 5-dimension craft ratings, interactive map & track your visited pandals with friends:`;
      } else if (platform === 'twitter') {
        shareText = `Experience Kolkata's Durga Puja like never before on @aabesh_app.\n\nDiscover pandals, rate craftsmanship, and explore friends' Puja trails:`;
      } else if (platform === 'linkedin') {
        shareText = `Aabesh (আবেশ) — The digital platform for Kolkata Durga Puja discovery, architectural & idol craftsmanship ratings, and social exploration.`;
      } else {
        shareText = `Discover Kolkata's Durga Puja pandals, community ratings and friend trails on aabesh:`;
      }

      return {
        title,
        description,
        shareText,
        url,
        hashtags: ['Aabesh', 'DurgaPuja2026', 'Kolkata', 'BengalHeritage']
      };
    }
  }
};

/**
 * Builds direct web intent sharing links for major social platforms
 */
export const buildPlatformIntentUrl = (platform: SocialPlatform, data: ShareData): string => {
  const { shareText, url, hashtags } = generateShareCopy(data, platform);
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);
  const hashTagStr = hashtags ? encodeURIComponent(hashtags.join(',')) : '';

  switch (platform) {
    case 'whatsapp_message':
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}${hashTagStr ? `&hashtags=${hashTagStr}` : ''}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    
    default:
      return url;
  }
};
