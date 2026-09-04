// Vercel Serverless Function: Social Crawler Pre-renderer for OpenGraph & Twitter Cards
export default function handler(req: any, res: any) {
  try {
    const url = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`);
    const host = req.headers?.['x-forwarded-host'] || req.headers?.host || 'aabesh.vercel.app';
    const proto = req.headers?.['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${host}`;

    const params = url.searchParams;
    const type = params.get('type') || 'pandal';
    const title = params.get('title') || 'aabesh — Durga Puja Pandal Discovery & Rating';
    const titleBn = params.get('title_bn') || 'আবেশ';
    const description = params.get('desc') || 'Aabesh is a minimal social platform for Durga Puja pandal discovery, 5-star craft ratings, and friend visit tracking.';
    const zone = params.get('zone') || 'Kolkata';
    const rating = params.get('rating') || '';
    const imageUrl = params.get('image') || '';
    const theme = params.get('theme') || '';
    const idol = params.get('idol') || '';
    const lighting = params.get('lighting') || '';
    const management = params.get('management') || '';

    // Build dynamic OG image query URL
    const ogParams = new URLSearchParams({
      title,
      title_bn: titleBn,
      zone,
      rating,
      type,
      image: imageUrl,
      theme,
      idol,
      lighting,
      management
    });

    const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;
    const canonicalUrl = `${baseUrl}${req.url}`;

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <!-- OpenGraph Metadata (Facebook, LinkedIn, WhatsApp, Telegram) -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="aabesh" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />

    <!-- Twitter Card Metadata -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@aabesh_app" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />

    <!-- Redirection for human users if visited directly -->
    <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}" />
  </head>
  <body style="background:#0A0A0A;color:#FFFFFF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
    <p>Loading Aabesh...</p>
    <script>window.location.href = "${escapeHtml(canonicalUrl)}";</script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Share pre-renderer error:', error);
    return res.status(500).send('Error rendering preview metadata');
  }
}

function escapeHtml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&#39;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
