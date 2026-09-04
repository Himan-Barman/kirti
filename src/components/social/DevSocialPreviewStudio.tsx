import React, { useState, useEffect } from 'react';
import type { ShareData, SocialAssetFormat } from '../../lib/social/types';
import { FORMAT_DIMENSIONS } from '../../lib/social/types';
import { renderSocialAssetToDataURL, downloadSocialAsset } from '../../lib/social/canvasRenderer';
import { generateShareCopy } from '../../lib/social/copy';
import { useStore } from '../../lib/store';
import { X, Download, RefreshCw, Code2 } from 'lucide-react';
import './DevSocialPreviewStudio.css';

interface DevSocialPreviewStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevSocialPreviewStudio: React.FC<DevSocialPreviewStudioProps> = ({ isOpen, onClose }) => {
  const { pandals, currentUser } = useStore();

  const [activeFormat, setActiveFormat] = useState<SocialAssetFormat>('og_1200x630');
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('bagbazar');
  const [currentShareData, setCurrentShareData] = useState<ShareData | null>(null);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Setup Test Preset Scenarios (Requirement 29)
  useEffect(() => {
    if (!isOpen) return;

    const bagbazar = pandals.find((p) => p.slug?.includes('bagbazar') || p.name.includes('Bagbazar')) || pandals[0];
    const deshapriya = pandals.find((p) => p.slug?.includes('deshapriya') || p.name.includes('Deshapriya')) || pandals[1] || pandals[0];
    const ekdalia = pandals.find((p) => p.slug?.includes('ekdalia') || p.name.includes('Ekdalia')) || pandals[2] || pandals[0];

    // Synthetic unrated pandal test
    const unratedPandal = {
      ...bagbazar,
      name: 'Kumartuli Park Sarbojanin',
      name_bn: 'কুমারটুলি পার্ক সার্বজনীন',
      avgRating: 0,
      ratingCount: 0
    };

    // Synthetic missing image test
    const missingImgPandal = {
      ...deshapriya,
      name: 'Mohammad Ali Park (Heritage)',
      name_bn: 'মহম্মদ আলী পার্ক',
      image_url: '',
      avgRating: 4.85,
      ratingCount: 310
    };

    let data: ShareData;

    switch (selectedPresetKey) {
      case 'bagbazar':
        data = { type: 'pandal', pandal: bagbazar };
        break;
      case 'deshapriya':
        data = { type: 'pandal', pandal: deshapriya };
        break;
      case 'ekdalia':
        data = { type: 'pandal', pandal: ekdalia };
        break;
      case 'unrated':
        data = { type: 'pandal', pandal: unratedPandal };
        break;
      case 'no_image':
        data = { type: 'pandal', pandal: missingImgPandal };
        break;
      case 'user_rating':
        data = {
          type: 'rating',
          pandal: bagbazar,
          overallScore: 4.8,
          scores: { overall: 5, theme: 5, idol: 5, lighting: 4, management: 5 },
          review: 'Breathtaking pure traditional Ekchala craftsmanship! The serene eyes of Maa Durga left us in pure reverence.',
          reviewerName: currentUser.display_name || 'Himan Barman'
        };
        break;
      case 'visited':
        data = {
          type: 'visit',
          pandal: bagbazar,
          visitorName: currentUser.display_name || 'Himan Barman',
          seasonYear: 'Durga Puja 2026'
        };
        break;
      case 'journey':
        data = {
          type: 'journey',
          user: currentUser,
          visitedPandals: pandals.slice(0, 7),
          totalVisitedCount: 7,
          seasonYear: '2026'
        };
        break;
      case 'ranking':
        data = {
          type: 'ranking',
          categoryCode: 'overall',
          categoryName: 'Overall Craftsmanship',
          categoryNameBn: 'সামগ্রিক শিল্পকলা',
          seasonYear: '2026',
          topPandals: [
            { rank: 1, pandal: bagbazar, score: 4.95 },
            { rank: 2, pandal: deshapriya, score: 4.91 },
            { rank: 3, pandal: ekdalia, score: 4.88 }
          ]
        };
        break;
      default:
        data = { type: 'pandal', pandal: bagbazar };
        break;
    }

    setCurrentShareData(data);
  }, [isOpen, selectedPresetKey, pandals, currentUser]);

  // Render on canvas
  useEffect(() => {
    if (!isOpen || !currentShareData) return;

    let isMounted = true;
    setIsLoading(true);

    renderSocialAssetToDataURL(currentShareData, activeFormat)
      .then((url) => {
        if (isMounted) {
          setRenderedImageUrl(url);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Studio render error:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentShareData, activeFormat]);

  if (!isOpen || !currentShareData) return null;

  const copyPayload = generateShareCopy(currentShareData);
  const dims = FORMAT_DIMENSIONS[activeFormat];

  return (
    <div className="dev-preview-studio-overlay">
      {/* Studio Top Navigation */}
      <div className="dev-studio-header">
        <div className="dev-studio-brand">
          <span className="dev-badge">INTERNAL DEV TOOL</span>
          <span className="dev-studio-title">Aabesh Social Preview Studio</span>
        </div>
        <button className="dev-studio-close-btn" onClick={onClose} aria-label="Close Studio">
          <X size={18} />
        </button>
      </div>

      {/* Main Studio Area */}
      <div className="dev-studio-main">
        {/* Left Controls Sidebar */}
        <div className="dev-studio-sidebar">
          <div className="dev-control-group">
            <label className="dev-control-label">Test Data Preset (Req. 29)</label>
            <div className="dev-quick-test-presets">
              <button
                className={`dev-preset-btn ${selectedPresetKey === 'bagbazar' ? 'active' : ''}`}
                onClick={() => setSelectedPresetKey('bagbazar')}
              >
                1. Bagbazar Sarbojanin (Rated)
              </button>
              <button
                className={`dev-preset-btn ${selectedPresetKey === 'deshapriya' ? 'active' : ''}`}
                onClick={() => setSelectedPresetKey('deshapriya')}
              >
                2. Deshapriya Park (South Zone)
              </button>
              <button
                className={`dev-preset-btn ${selectedPresetKey === 'ekdalia' ? 'active' : ''}`}
                onClick={() => setSelectedPresetKey('ekdalia')}
              >
                3. Ekdalia Evergreen (Sabeki)
              </button>
              <button
                className={`dev-preset-btn ${selectedPresetKey === 'unrated' ? 'active' : ''}`}
                onClick={() => setSelectedPresetKey('unrated')}
              >
                4. Unrated Pandal (No Ratings yet)
              </button>
              <button
                className={`dev-preset-btn ${selectedPresetKey === 'no_image' ? 'active' : ''}`}
                onClick={() => setSelectedPresetKey('no_image')}
              >
                5. Missing Image (Art Fallback)
              </button>
              <button
                className={`dev-preset-btn ${selectedPresetKey === 'user_rating' ? 'active' : ''}`}
                onClick={() => setSelectedPresetKey('user_rating')}
              >
                6. 5-Dimension Rating Share
              </button>
              <button
                className={`dev-preset-btn ${selectedPresetKey === 'visited' ? 'active' : ''}`}
                onClick={() => setSelectedPresetKey('visited')}
              >
                7. Visited Check-in Card
              </button>
              <button
                className={`dev-preset-btn ${selectedPresetKey === 'journey' ? 'active' : ''}`}
                onClick={() => setSelectedPresetKey('journey')}
              >
                8. User Puja Trail (7 Pandals)
              </button>
              <button
                className={`dev-preset-btn ${selectedPresetKey === 'ranking' ? 'active' : ''}`}
                onClick={() => setSelectedPresetKey('ranking')}
              >
                9. Kolkata Top 3 Ranking Card
              </button>
            </div>
          </div>

          <div className="dev-control-group">
            <label className="dev-control-label">Export Actions</label>
            <button
              className="dev-preset-btn"
              style={{ background: 'var(--kirti-red)', color: '#FFFFFF', textAlign: 'center' }}
              onClick={() => downloadSocialAsset(currentShareData, activeFormat)}
            >
              <Download size={14} style={{ display: 'inline', marginRight: 6 }} />
              Download {dims.label} PNG
            </button>
          </div>
        </div>

        {/* Center Main Stage */}
        <div className="dev-studio-stage">
          {/* Format Switcher Tabs */}
          <div className="dev-format-tabs-bar">
            <button
              className={`dev-format-tab-btn ${activeFormat === 'og_1200x630' ? 'active' : ''}`}
              onClick={() => setActiveFormat('og_1200x630')}
            >
              OG 1200×630 (1.91:1)
            </button>
            <button
              className={`dev-format-tab-btn ${activeFormat === 'story_1080x1920' ? 'active' : ''}`}
              onClick={() => setActiveFormat('story_1080x1920')}
            >
              Instagram Story
            </button>
            <button
              className={`dev-format-tab-btn ${activeFormat === 'status_1080x1920' ? 'active' : ''}`}
              onClick={() => setActiveFormat('status_1080x1920')}
            >
              WhatsApp Status
            </button>
            <button
              className={`dev-format-tab-btn ${activeFormat === 'feed_1080x1350' ? 'active' : ''}`}
              onClick={() => setActiveFormat('feed_1080x1350')}
            >
              Instagram Feed (4:5)
            </button>
            <button
              className={`dev-format-tab-btn ${activeFormat === 'square_1080x1080' ? 'active' : ''}`}
              onClick={() => setActiveFormat('square_1080x1080')}
            >
              Square (1:1)
            </button>
          </div>

          {/* Rendered Preview Card Viewport */}
          <div className="dev-canvas-viewport">
            {isLoading ? (
              <div style={{ color: 'var(--text-muted)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <RefreshCw size={20} className="spin-anim" />
                <span>Generating high-resolution canvas render...</span>
              </div>
            ) : renderedImageUrl ? (
              <img src={renderedImageUrl} alt="Rendered Preview" className="dev-rendered-image" />
            ) : null}
          </div>

          {/* Meta Tags & Copy Inspector */}
          <div className="dev-meta-inspector-card">
            <div className="dev-meta-inspector-title">
              <Code2 size={14} style={{ display: 'inline', marginRight: 6 }} />
              Live Server-Rendered Metadata & Copy Inspector
            </div>
            <div className="dev-meta-code-block">
{`<!-- OpenGraph Tags (Facebook, WhatsApp, LinkedIn, Telegram) -->
<meta property="og:title" content="${copyPayload.title}" />
<meta property="og:description" content="${copyPayload.description}" />
<meta property="og:url" content="${copyPayload.url}" />
<meta property="og:image" content="https://aabesh.in/api/og?title=${encodeURIComponent(copyPayload.title)}&format=og" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${copyPayload.title}" />
<meta name="twitter:description" content="${copyPayload.description}" />

<!-- Contextual Share Copy -->
${copyPayload.shareText}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
