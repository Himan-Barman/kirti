import type {
  ShareData,
  SocialAssetFormat,
  JourneyShareData,
  RankingShareData
} from './types';
import { FORMAT_DIMENSIONS } from './types';

// Image loading cache to avoid re-fetching images
const imageCache = new Map<string, HTMLImageElement>();

const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
};

/**
 * Draws rounded rectangle path
 */
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/**
 * Wraps text into multiple lines given a max width
 */
const getWrappedLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
};

/**
 * Main social asset rendering dispatcher
 */
export const renderSocialAsset = async (
  data: ShareData,
  format: SocialAssetFormat = 'og_1200x630'
): Promise<HTMLCanvasElement> => {
  // Wait for Google Fonts to be ready for sharp rendering
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const { width, height } = FORMAT_DIMENSIONS[format];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas 2D context');

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Base background fill (Rich Dark Charcoal: #0A0A0A)
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, width, height);

  switch (format) {
    case 'story_1080x1920':
      await renderInstagramStory(ctx, data, width, height);
      break;
    case 'status_1080x1920':
      await renderWhatsAppStatus(ctx, data, width, height);
      break;
    case 'feed_1080x1350':
      await renderInstagramFeed(ctx, data, width, height);
      break;
    case 'square_1080x1080':
      await renderSquarePost(ctx, data, width, height);
      break;
    case 'og_1200x630':
    default:
      await renderOpenGraphCard(ctx, data, width, height);
      break;
  }

  return canvas;
};

/* =========================================================================
   1. OPENGRAPH CARD (1200 × 630) — Facebook, X, LinkedIn, Telegram, WhatsApp Preview
   ========================================================================= */
const renderOpenGraphCard = async (
  ctx: CanvasRenderingContext2D,
  data: ShareData,
  w: number,
  h: number
) => {
  // Atmospheric ambient glow in background
  const glow = ctx.createRadialGradient(w * 0.75, h * 0.3, 50, w * 0.75, h * 0.3, 500);
  glow.addColorStop(0, 'rgba(180, 35, 42, 0.28)'); // Aabesh Red
  glow.addColorStop(0.5, 'rgba(201, 162, 39, 0.12)'); // Aabesh Gold
  glow.addColorStop(1, 'rgba(10, 10, 10, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  if (data.type === 'pandal' || data.type === 'visit' || data.type === 'rating') {
    const pandal = data.pandal;
    const img = await loadImage(pandal.image_url);

    // Left Column: 520px Photo Box with elegant curved corners & inner border
    const imgX = 48;
    const imgY = 48;
    const imgW = 460;
    const imgH = h - 96;
    const imgR = 24;

    ctx.save();
    roundRect(ctx, imgX, imgY, imgW, imgH, imgR);
    ctx.clip();

    if (img) {
      // Smart crop preserving center/top
      const scale = Math.max(imgW / img.width, imgH / img.height);
      const sw = imgW / scale;
      const sh = imgH / scale;
      const sx = (img.width - sw) / 2;
      const sy = Math.max(0, (img.height - sh) * 0.25);
      ctx.drawImage(img, sx, sy, sw, sh, imgX, imgY, imgW, imgH);

      // Dark vignette overlay on image
      const imgVignette = ctx.createLinearGradient(imgX, imgY, imgX, imgY + imgH);
      imgVignette.addColorStop(0, 'rgba(0,0,0,0.1)');
      imgVignette.addColorStop(0.7, 'rgba(0,0,0,0.3)');
      imgVignette.addColorStop(1, 'rgba(10,10,10,0.85)');
      ctx.fillStyle = imgVignette;
      ctx.fillRect(imgX, imgY, imgW, imgH);
    } else {
      // Geometric artistic fallback
      ctx.fillStyle = '#151518';
      ctx.fillRect(imgX, imgY, imgW, imgH);

      const artGrad = ctx.createRadialGradient(imgX + imgW/2, imgY + imgH/2, 20, imgX + imgW/2, imgY + imgH/2, 200);
      artGrad.addColorStop(0, 'rgba(180, 35, 42, 0.35)');
      artGrad.addColorStop(1, 'rgba(18, 18, 20, 0.9)');
      ctx.fillStyle = artGrad;
      ctx.fillRect(imgX, imgY, imgW, imgH);

      ctx.fillStyle = 'rgba(201, 162, 39, 0.3)';
      ctx.font = '700 80px "Tiro Bangla", serif';
      ctx.textAlign = 'center';
      ctx.fillText('আবেশ', imgX + imgW/2, imgY + imgH/2 + 25);
    }

    // Photo Box Border
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, imgX, imgY, imgW, imgH, imgR);
    ctx.stroke();

    // Zone Badge on Photo bottom
    if (pandal.zone) {
      const badgeX = imgX + 24;
      const badgeY = imgY + imgH - 52;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
      roundRect(ctx, badgeX, badgeY, ctx.measureText(pandal.zone).width + 36, 32, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      ctx.fillStyle = '#F8F9FA';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(pandal.zone, badgeX + 18, badgeY + 20);
    }

    // Right Column: Typography & Craft Scores
    const contentX = 548;
    let currY = 72;

    // Header: Aabesh Cursive Script Logo
    ctx.font = '400 42px "Grand Hotel", cursive';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('aabesh', contentX, currY);

    // Bengali Subtitle
    ctx.font = '400 18px "Galada", "Tiro Bangla", serif';
    ctx.fillStyle = '#B4232A';
    ctx.fillText('আবেশ', contentX + 120, currY - 6);

    currY += 50;

    // Eyebrow Tag
    let eyebrow = 'DURGA PUJA DISCOVERY';
    if (data.type === 'rating') eyebrow = 'VERIFIED COMMUNITY RATING';
    if (data.type === 'visit') eyebrow = 'PUJA PASSPORT CHECK-IN';

    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#C9A227';
    ctx.fillText(eyebrow, contentX, currY);

    currY += 34;

    // Pandal Name
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const lines = getWrappedLines(ctx, pandal.name, w - contentX - 48);
    for (let i = 0; i < Math.min(lines.length, 2); i++) {
      ctx.fillText(lines[i], contentX, currY);
      currY += 42;
    }

    // Bengali Name if present
    if (pandal.name_bn) {
      ctx.font = '600 19px "Tiro Bangla", serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillText(pandal.name_bn, contentX, currY);
      currY += 32;
    } else {
      currY += 8;
    }

    // Context-specific details
    if (data.type === 'rating') {
      // 5-Dimension Score Row
      const scoreBoxY = currY + 6;
      const scoreBoxW = w - contentX - 48;
      const scoreBoxH = 92;

      ctx.fillStyle = 'rgba(21, 21, 24, 0.9)';
      roundRect(ctx, contentX, scoreBoxY, scoreBoxW, scoreBoxH, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();

      const dims = [
        { label: 'Overall', val: data.overallScore },
        { label: 'Theme', val: data.scores.theme },
        { label: 'Idol', val: data.scores.idol },
        { label: 'Lighting', val: data.scores.lighting },
        { label: 'Management', val: data.scores.management }
      ];

      const colW = scoreBoxW / dims.length;
      dims.forEach((d, idx) => {
        const dx = contentX + (idx * colW) + (colW / 2);
        ctx.textAlign = 'center';

        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = idx === 0 ? '#C9A227' : 'rgba(255,255,255,0.5)';
        ctx.fillText(d.label.toUpperCase(), dx, scoreBoxY + 30);

        ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = idx === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.9)';
        ctx.fillText(`${d.val}`, dx, scoreBoxY + 66);
      });

      currY = scoreBoxY + scoreBoxH + 40;
    } else {
      // Rating & Location row
      const hasRating = pandal.avgRating && pandal.avgRating > 0;
      if (hasRating) {
        // Rating Star Pill
        ctx.fillStyle = 'rgba(201, 162, 39, 0.15)';
        roundRect(ctx, contentX, currY, 110, 36, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(201, 162, 39, 0.35)';
        ctx.stroke();

        ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#C9A227';
        ctx.textAlign = 'center';
        ctx.fillText(`★ ${pandal.avgRating.toFixed(1)} / 5`, contentX + 55, currY + 23);

        if (pandal.ratingCount) {
          ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.textAlign = 'left';
          ctx.fillText(`(${pandal.ratingCount} reviews)`, contentX + 124, currY + 23);
        }
      } else {
        // No rating state
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        roundRect(ctx, contentX, currY, 130, 32, 16);
        ctx.fill();

        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('No ratings yet', contentX + 65, currY + 21);
      }

      currY += 54;
    }

    // Bottom metadata footer bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('aabesh.in • Durga Puja Discovery, 5-Star Ratings & Live Trails', contentX, h - 52);
  } else if (data.type === 'ranking') {
    // Ranking OpenGraph Card
    renderRankingLayout(ctx, data, w, h);
  } else if (data.type === 'journey') {
    // Journey / Trail OpenGraph Card
    renderJourneyLayout(ctx, data, w, h);
  }
};

/* =========================================================================
   2. INSTAGRAM STORY (1080 × 1920) — 9:16 Vertical Immersive Composition
   ========================================================================= */
const renderInstagramStory = async (
  ctx: CanvasRenderingContext2D,
  data: ShareData,
  w: number,
  h: number
) => {
  let img: HTMLImageElement | null = null;
  if ('pandal' in data && data.pandal) {
    img = await loadImage(data.pandal.image_url);
  }

  // Full-bleed photograph background
  if (img) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (img.width - sw) / 2;
    const sy = Math.max(0, (img.height - sh) * 0.2);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

    // Multi-stop cinematic dark gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(10, 10, 10, 0.82)');
    gradient.addColorStop(0.25, 'rgba(10, 10, 10, 0.35)');
    gradient.addColorStop(0.55, 'rgba(10, 10, 10, 0.55)');
    gradient.addColorStop(0.85, 'rgba(10, 10, 10, 0.95)');
    gradient.addColorStop(1, 'rgba(10, 10, 10, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Atmospheric dark fallback
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#151518');
    bgGrad.addColorStop(1, '#0A0A0A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Safe Zone Margins: Top starts at 220px, Bottom ends at 1680px
  // Top Header Brand Lockup
  ctx.textAlign = 'center';
  ctx.font = '400 64px "Grand Hotel", cursive';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('aabesh', w / 2, 260);

  ctx.font = '400 24px "Galada", "Tiro Bangla", serif';
  ctx.fillStyle = '#B4232A';
  ctx.fillText('আবেশ', w / 2, 305);

  if ('pandal' in data && data.pandal) {
    const pandal = data.pandal;

    // Center/Bottom Content Block
    const centerY = h - 680;

    // Eyebrow Badge
    let eyebrow = 'I DISCOVERED';
    if (data.type === 'rating') eyebrow = 'MY VERIFIED RATING';
    if (data.type === 'visit') eyebrow = 'I VISITED THIS PUJA';

    ctx.fillStyle = 'rgba(201, 162, 39, 0.2)';
    roundRect(ctx, w / 2 - 120, centerY - 60, 240, 40, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.4)';
    ctx.stroke();

    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#C9A227';
    ctx.fillText(eyebrow, w / 2, centerY - 34);

    // Large Pandal Name
    ctx.font = '800 56px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const lines = getWrappedLines(ctx, pandal.name, w - 160);
    let titleY = centerY + 30;
    lines.forEach((line) => {
      ctx.fillText(line, w / 2, titleY);
      titleY += 68;
    });

    // Bengali Name
    if (pandal.name_bn) {
      ctx.font = '600 28px "Tiro Bangla", serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillText(pandal.name_bn, w / 2, titleY);
      titleY += 48;
    }

    // Location
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`${pandal.zone || 'Kolkata'} • Durga Puja 2026`, w / 2, titleY);

    titleY += 45;

    // Rating Capsule
    if (pandal.avgRating && pandal.avgRating > 0) {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.75)';
      roundRect(ctx, w / 2 - 110, titleY, 220, 52, 26);
      ctx.fill();
      ctx.strokeStyle = 'rgba(201, 162, 39, 0.5)';
      ctx.stroke();

      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#C9A227';
      ctx.fillText(`★  ${pandal.avgRating.toFixed(1)} / 5`, w / 2, titleY + 34);
    }

    // Bottom Interactive Discovery Pill
    const ctaY = h - 280;
    ctx.fillStyle = 'rgba(180, 35, 42, 0.9)';
    roundRect(ctx, w / 2 - 180, ctaY, 360, 60, 30);
    ctx.fill();

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Explore on aabesh.in →', w / 2, ctaY + 36);
  }
};

/* =========================================================================
   3. WHATSAPP STATUS (1080 × 1920) — 9:16 Visual Diary Entry
   ========================================================================= */
const renderWhatsAppStatus = async (
  ctx: CanvasRenderingContext2D,
  data: ShareData,
  w: number,
  h: number
) => {
  // Dark luxury framing
  ctx.fillStyle = '#0E0E11';
  ctx.fillRect(0, 0, w, h);

  // Background subtle glow
  const glow = ctx.createRadialGradient(w/2, h*0.4, 100, w/2, h*0.4, 600);
  glow.addColorStop(0, 'rgba(180, 35, 42, 0.22)');
  glow.addColorStop(1, 'rgba(14, 14, 17, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Header
  ctx.textAlign = 'center';
  ctx.font = '400 58px "Grand Hotel", cursive';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('aabesh', w / 2, 240);

  ctx.font = '400 22px "Galada", "Tiro Bangla", serif';
  ctx.fillStyle = '#B4232A';
  ctx.fillText('আবেশ', w / 2, 280);

  if ('pandal' in data && data.pandal) {
    const pandal = data.pandal;
    const img = await loadImage(pandal.image_url);

    // Centered Framed Photo Card: 920 × 960
    const frameX = 80;
    const frameY = 340;
    const frameW = w - 160;
    const frameH = 920;
    const frameR = 32;

    ctx.save();
    roundRect(ctx, frameX, frameY, frameW, frameH, frameR);
    ctx.clip();

    if (img) {
      const scale = Math.max(frameW / img.width, frameH / img.height);
      const sw = frameW / scale;
      const sh = frameH / scale;
      const sx = (img.width - sw) / 2;
      const sy = Math.max(0, (img.height - sh) * 0.25);
      ctx.drawImage(img, sx, sy, sw, sh, frameX, frameY, frameW, frameH);

      // Gradient overlay
      const grad = ctx.createLinearGradient(frameX, frameY + frameH * 0.5, frameX, frameY + frameH);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(frameX, frameY, frameW, frameH);
    } else {
      ctx.fillStyle = '#1A1A1E';
      ctx.fillRect(frameX, frameY, frameW, frameH);
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2;
    roundRect(ctx, frameX, frameY, frameW, frameH, frameR);
    ctx.stroke();

    // Bottom Card Details
    const bottomY = 1340;

    // Eyebrow
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#C9A227';
    ctx.fillText('DISCOVER • EXPERIENCE • REMEMBER', w / 2, bottomY);

    // Title
    ctx.font = '800 46px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const lines = getWrappedLines(ctx, pandal.name, w - 160);
    let ty = bottomY + 56;
    lines.forEach((l) => {
      ctx.fillText(l, w / 2, ty);
      ty += 56;
    });

    if (pandal.name_bn) {
      ctx.font = '600 24px "Tiro Bangla", serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(pandal.name_bn, w / 2, ty);
      ty += 42;
    }

    // Rating
    if (pandal.avgRating && pandal.avgRating > 0) {
      ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#C9A227';
      ctx.fillText(`★ ${pandal.avgRating.toFixed(1)} / 5`, w / 2, ty + 10);
    }

    // Footer
    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('aabesh.in', w / 2, h - 140);
  }
};

/* =========================================================================
   4. INSTAGRAM FEED (1080 × 1350) — 4:5 Portrait Editorial Poster
   ========================================================================= */
const renderInstagramFeed = async (
  ctx: CanvasRenderingContext2D,
  data: ShareData,
  w: number,
  h: number
) => {
  ctx.fillStyle = '#0C0C0E';
  ctx.fillRect(0, 0, w, h);

  if ('pandal' in data && data.pandal) {
    const pandal = data.pandal;
    const img = await loadImage(pandal.image_url);

    // Top Photo Area (720px height) with full-width bleed
    const imgH = 760;
    if (img) {
      const scale = Math.max(w / img.width, imgH / img.height);
      const sw = w / scale;
      const sh = imgH / scale;
      const sx = (img.width - sw) / 2;
      const sy = Math.max(0, (img.height - sh) * 0.25);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, imgH);

      const fade = ctx.createLinearGradient(0, imgH - 180, 0, imgH);
      fade.addColorStop(0, 'rgba(12, 12, 14, 0)');
      fade.addColorStop(1, 'rgba(12, 12, 14, 1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, imgH - 180, w, 180);
    }

    // Header Floating Pill over Photo
    ctx.fillStyle = 'rgba(10, 10, 10, 0.75)';
    roundRect(ctx, 60, 60, 180, 48, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.font = '400 32px "Grand Hotel", cursive';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('aabesh', 150, 94);

    // Lower Editorial Card (760px down to bottom)
    const cardY = imgH + 20;
    ctx.textAlign = 'left';

    // Zone & Category Eyebrow
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#C9A227';
    ctx.fillText((pandal.zone || 'Kolkata').toUpperCase() + ' • DURGA PUJA 2026', 64, cardY + 20);

    // Pandal Name
    ctx.font = '800 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const lines = getWrappedLines(ctx, pandal.name, w - 128);
    let ty = cardY + 70;
    lines.forEach((l) => {
      ctx.fillText(l, 64, ty);
      ty += 52;
    });

    // Bengali Name
    if (pandal.name_bn) {
      ctx.font = '600 24px "Tiro Bangla", serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillText(pandal.name_bn, 64, ty);
      ty += 40;
    }

    // Description snippet
    if (pandal.description) {
      ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const descLines = getWrappedLines(ctx, pandal.description, w - 128).slice(0, 2);
      descLines.forEach((dl) => {
        ctx.fillText(dl, 64, ty);
        ty += 24;
      });
    }

    // Bottom Stats Bar
    const footerY = h - 100;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(64, footerY - 20);
    ctx.lineTo(w - 64, footerY - 20);
    ctx.stroke();

    if (pandal.avgRating && pandal.avgRating > 0) {
      ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#C9A227';
      ctx.fillText(`★  ${pandal.avgRating.toFixed(1)} / 5`, 64, footerY + 20);
    }

    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'right';
    ctx.fillText('Discover this Puja on aabesh.in', w - 64, footerY + 20);
  }
};

/* =========================================================================
   5. INSTAGRAM SQUARE (1080 × 1080) — 1:1 Square Post
   ========================================================================= */
const renderSquarePost = async (
  ctx: CanvasRenderingContext2D,
  data: ShareData,
  w: number,
  h: number
) => {
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, w, h);

  if ('pandal' in data && data.pandal) {
    const pandal = data.pandal;
    const img = await loadImage(pandal.image_url);

    // Left half: Photo (520w)
    const imgW = 540;
    if (img) {
      const scale = Math.max(imgW / img.width, h / img.height);
      const sw = imgW / scale;
      const sh = h / scale;
      const sx = (img.width - sw) / 2;
      const sy = Math.max(0, (img.height - sh) * 0.25);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, imgW, h);

      // Right gradient fade
      const fade = ctx.createLinearGradient(imgW - 120, 0, imgW, 0);
      fade.addColorStop(0, 'rgba(10, 10, 10, 0)');
      fade.addColorStop(1, 'rgba(10, 10, 10, 1)');
      ctx.fillStyle = fade;
      ctx.fillRect(imgW - 120, 0, 120, h);
    }

    // Right half: Editorial Typography
    const rx = 580;
    ctx.textAlign = 'left';

    ctx.font = '400 48px "Grand Hotel", cursive';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('aabesh', rx, 140);

    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#C9A227';
    ctx.fillText('DURGA PUJA 2026', rx, 210);

    ctx.font = '800 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const lines = getWrappedLines(ctx, pandal.name, w - rx - 60);
    let ty = 280;
    lines.forEach((l) => {
      ctx.fillText(l, rx, ty);
      ty += 52;
    });

    if (pandal.name_bn) {
      ctx.font = '600 24px "Tiro Bangla", serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(pandal.name_bn, rx, ty);
      ty += 44;
    }

    if (pandal.avgRating && pandal.avgRating > 0) {
      ctx.fillStyle = 'rgba(201, 162, 39, 0.15)';
      roundRect(ctx, rx, ty + 10, 130, 44, 22);
      ctx.fill();

      ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#C9A227';
      ctx.fillText(`★  ${pandal.avgRating.toFixed(1)} / 5`, rx + 24, ty + 38);
    }

    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('aabesh.in', rx, h - 80);
  }
};

/* =========================================================================
   RANKING & JOURNEY LAYOUT HELPERS
   ========================================================================= */
const renderRankingLayout = (
  ctx: CanvasRenderingContext2D,
  data: RankingShareData,
  w: number,
  h: number
) => {
  ctx.textAlign = 'center';
  ctx.font = '400 48px "Grand Hotel", cursive';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('aabesh', w / 2, 80);

  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#C9A227';
  ctx.fillText(`KOLKATA'S MOST LOVED PANDALS • ${data.categoryName.toUpperCase()}`, w / 2, 130);

  // 3 Podium Ranking Cards
  const cardW = 320;
  const cardH = 360;
  const gap = 28;
  const startX = (w - (3 * cardW + 2 * gap)) / 2;

  data.topPandals.slice(0, 3).forEach((item, idx) => {
    const cx = startX + idx * (cardW + gap);
    const cy = 180;

    ctx.fillStyle = 'rgba(21, 21, 24, 0.9)';
    roundRect(ctx, cx, cy, cardW, cardH, 20);
    ctx.fill();
    ctx.strokeStyle = idx === 0 ? 'rgba(201, 162, 39, 0.4)' : 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Rank Number
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = idx === 0 ? '#C9A227' : '#FFFFFF';
    ctx.fillText(`0${idx + 1}`, cx + cardW / 2, cy + 60);

    // Pandal Name
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    const lines = getWrappedLines(ctx, item.pandal.name, cardW - 40);
    let ly = cy + 120;
    lines.slice(0, 2).forEach((l) => {
      ctx.fillText(l, cx + cardW / 2, ly);
      ly += 28;
    });

    // Score
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#C9A227';
    ctx.fillText(`★ ${item.score.toFixed(1)} / 5`, cx + cardW / 2, cy + cardH - 50);
  });

  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('aabesh.in • Official Community Ratings & Rankings', w / 2, h - 36);
};

const renderJourneyLayout = (
  ctx: CanvasRenderingContext2D,
  data: JourneyShareData,
  w: number,
  h: number
) => {
  ctx.textAlign = 'center';
  ctx.font = '400 48px "Grand Hotel", cursive';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('aabesh', w / 2, 80);

  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#C9A227';
  ctx.fillText('MY PUJA TRAIL • DURGA PUJA 2026', w / 2, 130);

  // Big Metric Counter Box
  const boxW = 400;
  const boxH = 180;
  const boxX = (w - boxW) / 2;
  const boxY = 170;

  ctx.fillStyle = 'rgba(21, 21, 24, 0.9)';
  roundRect(ctx, boxX, boxY, boxW, boxH, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(180, 35, 42, 0.35)';
  ctx.stroke();

  ctx.font = '800 72px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${data.totalVisitedCount}`, w / 2, boxY + 95);

  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('PANDALS VISITED', w / 2, boxY + 140);

  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${data.user.display_name || data.user.username}'s Verified Puja Passport`, w / 2, 400);

  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('Track your own festive journey on aabesh.in', w / 2, h - 40);
};

/* =========================================================================
   PUBLIC EXPORT UTILITIES
   ========================================================================= */

export const renderSocialAssetToBlob = async (
  data: ShareData,
  format: SocialAssetFormat = 'og_1200x630'
): Promise<Blob> => {
  const canvas = await renderSocialAsset(data, format);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
};

export const renderSocialAssetToDataURL = async (
  data: ShareData,
  format: SocialAssetFormat = 'og_1200x630'
): Promise<string> => {
  const canvas = await renderSocialAsset(data, format);
  return canvas.toDataURL('image/png');
};

export const downloadSocialAsset = async (
  data: ShareData,
  format: SocialAssetFormat,
  filename?: string
): Promise<void> => {
  const blob = await renderSocialAssetToBlob(data, format);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const defaultName = `aabesh-${data.type}-${format.split('_')[0]}-${Date.now()}.png`;
  a.download = filename || defaultName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const shareSocialAssetWithWebShare = async (
  data: ShareData,
  format: SocialAssetFormat,
  sharePayload: { title: string; text: string; url: string }
): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    const blob = await renderSocialAssetToBlob(data, format);
    const file = new File([blob], `aabesh-${format}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: sharePayload.title,
        text: sharePayload.text,
        url: sharePayload.url,
        files: [file]
      });
      return true;
    } else {
      await navigator.share({
        title: sharePayload.title,
        text: sharePayload.text,
        url: sharePayload.url
      });
      return true;
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return true; // User cancelled share
    console.error('Web Share failed', err);
    return false;
  }
};
