// Vercel Serverless Function: Dynamic OpenGraph Image Generator for Aabesh (আবেশ)
import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: any, res: any) {
  try {
    const url = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`);
    const params = url.searchParams;

    const title = params.get('title') || 'aabesh — Durga Puja Discovery';
    const titleBn = params.get('title_bn') || 'আবেশ';
    const zone = params.get('zone') || 'Kolkata';
    const rating = params.get('rating') || '';
    const reviewCount = params.get('count') || '';
    const type = params.get('type') || 'pandal';
    const theme = params.get('theme') || '';
    const idol = params.get('idol') || '';
    const lighting = params.get('lighting') || '';
    const management = params.get('management') || '';
    const imageUrl = params.get('image') || '';

    let eyebrow = 'DURGA PUJA 2026';
    if (type === 'rating') eyebrow = 'VERIFIED 5-DIMENSION RATING';
    if (type === 'visit') eyebrow = 'PUJA PASSPORT CHECK-IN';
    if (type === 'ranking') eyebrow = 'KOLKATA OFFICIAL RANKINGS';

    // Build SVG Dynamic Composition (1200 × 630)
    const ratingBadge = rating && parseFloat(rating) > 0 ? `
      <g transform="translate(560, 360)">
        <rect width="130" height="42" rx="21" fill="rgba(201, 162, 39, 0.16)" stroke="rgba(201, 162, 39, 0.45)" stroke-width="1.5" />
        <text x="65" y="27" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#C9A227" text-anchor="middle">★ ${parseFloat(rating).toFixed(1)} / 5</text>
        ${reviewCount ? `<text x="148" y="27" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="500" fill="rgba(255,255,255,0.6)">(${reviewCount} reviews)</text>` : ''}
      </g>
    ` : `
      <g transform="translate(560, 360)">
        <rect width="140" height="36" rx="18" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
        <text x="70" y="23" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" fill="rgba(255,255,255,0.65)" text-anchor="middle">Curated Pandal</text>
      </g>
    `;

    const ratingMatrix = (type === 'rating' && theme) ? `
      <g transform="translate(560, 350)">
        <rect width="580" height="88" rx="16" fill="rgba(21, 21, 24, 0.9)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
        <text x="58" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#C9A227" text-anchor="middle">OVERALL</text>
        <text x="58" y="66" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">${rating || '5.0'}</text>
        
        <text x="174" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="rgba(255,255,255,0.5)" text-anchor="middle">THEME</text>
        <text x="174" y="66" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">${theme}</text>
        
        <text x="290" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="rgba(255,255,255,0.5)" text-anchor="middle">IDOL</text>
        <text x="290" y="66" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">${idol || '5'}</text>
        
        <text x="406" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="rgba(255,255,255,0.5)" text-anchor="middle">LIGHTING</text>
        <text x="406" y="66" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">${lighting || '5'}</text>
        
        <text x="522" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="rgba(255,255,255,0.5)" text-anchor="middle">MGMT</text>
        <text x="522" y="66" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">${management || '5'}</text>
      </g>
    ` : ratingBadge;

    const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="75%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#B4232A" stop-opacity="0.32" />
      <stop offset="50%" stop-color="#C9A227" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#0A0A0A" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="photoFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0.1)" />
      <stop offset="70%" stop-color="rgba(0,0,0,0.4)" />
      <stop offset="100%" stop-color="rgba(10,10,10,0.9)" />
    </linearGradient>
    <clipPath id="photoClip">
      <rect x="48" y="48" width="460" height="534" rx="24" />
    </clipPath>
  </defs>

  <!-- Base Dark Canvas -->
  <rect width="1200" height="630" fill="#0A0A0A" />
  <rect width="1200" height="630" fill="url(#bgGlow)" />

  <!-- Left Photo Box -->
  <g clip-path="url(#photoClip)">
    ${imageUrl ? `
      <image href="${imageUrl}" x="48" y="48" width="460" height="534" preserveAspectRatio="xMidYMid slice" />
      <rect x="48" y="48" width="460" height="534" fill="url(#photoFade)" />
    ` : `
      <rect x="48" y="48" width="460" height="534" fill="#151518" />
      <text x="278" y="325" font-family="'Tiro Bangla', serif" font-size="90" font-weight="700" fill="rgba(201, 162, 39, 0.25)" text-anchor="middle">আবেশ</text>
    `}
  </g>
  <rect x="48" y="48" width="460" height="534" rx="24" fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />

  <!-- Photo Zone Badge -->
  <g transform="translate(72, 520)">
    <rect width="${Math.max(120, zone.length * 9 + 32)}" height="34" rx="17" fill="rgba(10, 10, 10, 0.88)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
    <text x="16" y="22" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" fill="#F8F9FA">${zone}</text>
  </g>

  <!-- Right Typography Block -->
  <!-- Aabesh Brand Wordmark -->
  <text x="560" y="98" font-family="'Grand Hotel', cursive, sans-serif" font-size="44" font-weight="400" fill="#FFFFFF">aabesh</text>
  <text x="685" y="94" font-family="'Galada', 'Tiro Bangla', serif" font-size="20" font-weight="400" fill="#B4232A">আবেশ</text>

  <!-- Eyebrow Pill -->
  <text x="560" y="156" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" fill="#C9A227" letter-spacing="1.5">${eyebrow}</text>

  <!-- Main Title -->
  <text x="560" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-size="38" font-weight="800" fill="#FFFFFF">${escapeXml(title)}</text>
  ${titleBn ? `<text x="560" y="254" font-family="'Tiro Bangla', serif" font-size="22" font-weight="600" fill="rgba(255, 255, 255, 0.7)">${escapeXml(titleBn)}</text>` : ''}

  <!-- Craft Rating Details -->
  ${ratingMatrix}

  <!-- Footer Metadata -->
  <text x="560" y="565" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="500" fill="rgba(255, 255, 255, 0.45)">aabesh.vercel.app • Kolkata Durga Puja Discovery, 5-Star Ratings &amp; Live Trails</text>
</svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    return res.status(200).send(svg);
  } catch (error) {
    console.error('OG generation error:', error);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('Error generating OG image');
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
