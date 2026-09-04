import React, { useState, useEffect, useRef } from 'react';
import type { ShareData, SocialAssetFormat } from '../../lib/social/types';
import { generateShareCopy, buildPlatformIntentUrl } from '../../lib/social/copy';
import { sanitizeShareDataForPrivacy, isShareAllowedByPrivacy } from '../../lib/social/privacy';
import {
  renderSocialAssetToDataURL,
  downloadSocialAsset,
  shareSocialAssetWithWebShare,
  dataURLToBlob,
  downloadBlob
} from '../../lib/social/canvasRenderer';
import { useStore } from '../../lib/store';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Send,
  Smartphone,
  Layers,
  Compass,
  MessageCircle
} from 'lucide-react';
import './ShareModal.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareData | null;
}

type ModalTab = 'quick' | 'story' | 'status' | 'feed' | 'square' | 'og';

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, data }) => {
  const { showToast, settings } = useStore();
  const [activeTab, setActiveTab] = useState<ModalTab>('quick');
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sanitize data according to user privacy settings
  const cleanData = data ? sanitizeShareDataForPrivacy(data, settings) : null;
  const privacyCheck = data ? isShareAllowedByPrivacy(data, settings) : { allowed: true };

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setActiveTab('quick');
      setPreviewDataUrl(null);
    }
  }, [isOpen]);

  // Render canvas whenever visual asset tab changes
  useEffect(() => {
    if (!isOpen || !cleanData || activeTab === 'quick') return;

    let isMounted = true;
    setIsRendering(true);

    const formatMap: Record<ModalTab, SocialAssetFormat | null> = {
      quick: null,
      story: 'story_1080x1920',
      status: 'status_1080x1920',
      feed: 'feed_1080x1350',
      square: 'square_1080x1080',
      og: 'og_1200x630'
    };

    const targetFormat = formatMap[activeTab];
    if (!targetFormat) return;

    renderSocialAssetToDataURL(cleanData, targetFormat)
      .then((url) => {
        if (isMounted) {
          setPreviewDataUrl(url);
          setIsRendering(false);
        }
      })
      .catch((err) => {
        console.error('Canvas render error', err);
        if (isMounted) setIsRendering(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, cleanData, activeTab]);

  if (!isOpen || !cleanData) return null;

  const copyPayload = generateShareCopy(cleanData);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(copyPayload.url);
    setCopied(true);
    showToast('Share link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePlatformClick = (platformUrl: string) => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadAsset = async (format: SocialAssetFormat) => {
    try {
      if (previewDataUrl) {
        const blob = dataURLToBlob(previewDataUrl);
        downloadBlob(blob, `aabesh-${cleanData.type}-${format.split('_')[0]}.png`);
        showToast('Downloaded visual asset', 'success');
        return;
      }
      await downloadSocialAsset(cleanData, format);
      showToast('Downloaded visual asset', 'success');
    } catch (err) {
      console.error('Download error', err);
      showToast('Failed to download asset', 'error');
    }
  };

  const handleWebShareFile = async (format: SocialAssetFormat) => {
    try {
      const existingBlob = previewDataUrl ? dataURLToBlob(previewDataUrl) : undefined;
      const result = await shareSocialAssetWithWebShare(
        cleanData,
        format,
        {
          title: copyPayload.title,
          text: copyPayload.shareText,
          url: copyPayload.url
        },
        existingBlob
      );

      if (result === 'shared_file' || result === 'shared_text') {
        showToast('Shared successfully', 'success');
      } else if (result === 'downloaded') {
        showToast('Image saved & link copied!', 'success');
      }
    } catch (err) {
      console.error('Share action error:', err);
      if (previewDataUrl) {
        const blob = dataURLToBlob(previewDataUrl);
        downloadBlob(blob, `aabesh-${cleanData.type}-${format.split('_')[0]}.png`);
        showToast('Image saved to device', 'success');
      } else {
        handleCopyLink();
      }
    }
  };

  return (
    <div className="aabesh-share-overlay" onClick={onClose}>
      <div
        className="aabesh-share-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        {/* Header */}
        <div className="share-modal-header">
          <div className="share-modal-title-group">
            <div className="share-modal-icon-badge">
              <Share2 size={18} />
            </div>
            <div>
              <h2 className="share-modal-title" id="share-modal-title">
                Share with Friends
              </h2>
              <p className="share-modal-subtitle">
                {cleanData.type === 'pandal' && `Discover ${cleanData.pandal.name}`}
                {cleanData.type === 'rating' && `5-Dimension Rating for ${cleanData.pandal.name}`}
                {cleanData.type === 'visit' && `Checked in at ${cleanData.pandal.name}`}
                {cleanData.type === 'journey' && 'My Durga Puja Trail'}
                {cleanData.type === 'ranking' && `Most Loved Pandals (${cleanData.categoryName})`}
                {cleanData.type === 'app' && 'Discover Pandals, Ratings & Live Trails'}
              </p>
            </div>
          </div>
          <button
            className="share-modal-close-btn"
            onClick={onClose}
            aria-label="Close share dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="share-tabs-nav">
          <button
            className={`share-tab-pill ${activeTab === 'quick' ? 'active' : ''}`}
            onClick={() => setActiveTab('quick')}
          >
            <Send size={14} />
            <span>Quick Share</span>
          </button>

          <button
            className={`share-tab-pill ${activeTab === 'story' ? 'active' : ''}`}
            onClick={() => setActiveTab('story')}
          >
            <Smartphone size={14} />
            <span>Instagram Story</span>
          </button>

          <button
            className={`share-tab-pill ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <MessageCircle size={14} />
            <span>WhatsApp Status</span>
          </button>

          <button
            className={`share-tab-pill ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Layers size={14} />
            <span>Instagram Feed (4:5)</span>
          </button>

          <button
            className={`share-tab-pill ${activeTab === 'og' ? 'active' : ''}`}
            onClick={() => setActiveTab('og')}
          >
            <Compass size={14} />
            <span>Link Preview</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="share-modal-body">
          {/* Privacy Note if applicable */}
          {privacyCheck.reason && (
            <div style={{
              background: 'rgba(201, 162, 39, 0.1)',
              border: '1px solid rgba(201, 162, 39, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px 14px',
              fontSize: '12.5px',
              color: 'var(--kirti-gold)',
              marginBottom: '16px'
            }}>
              🔒 {privacyCheck.reason}
            </div>
          )}

          {/* TAB 1: QUICK SHARE */}
          {activeTab === 'quick' && (
            <div>
              <div className="quick-share-grid">
                {/* WhatsApp Message */}
                <button
                  className="quick-share-btn"
                  onClick={() => handlePlatformClick(buildPlatformIntentUrl('whatsapp_message', cleanData))}
                >
                  <div className="platform-icon-circle whatsapp">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.3-.778.978-.954 1.179-.176.2-.351.226-.652.075-.3-.15-1.268-.468-2.416-1.492-.894-.797-1.498-1.782-1.674-2.083-.176-.3-.019-.463.132-.613.136-.134.301-.351.452-.527.15-.176.2-.301.301-.502.101-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.238-.245-.589-.494-.509-.678-.518l-.578-.01c-.2 0-.526.075-.802.376-.276.3-1.054 1.03-1.054 2.511 0 1.482 1.079 2.912 1.23 3.113.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.23 1.378.197 1.897.12.578-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352z"/>
                      <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.93.55 3.73 1.5 5.25L2 22l4.89-1.44c1.47.88 3.19 1.44 5.11 1.44 5.52 0 10.004-4.48 10.004-10.004C22.004 6.48 17.52 2 12.004 2zm0 18.25c-1.67 0-3.23-.49-4.55-1.33l-.33-.21-3.37.99.9-3.28-.23-.37c-.93-1.36-1.47-2.99-1.47-4.75 0-4.55 3.7-8.25 8.25-8.25s8.25 3.7 8.25 8.25-3.7 8.25-8.25 8.25z"/>
                    </svg>
                  </div>
                  <span className="platform-btn-label">WhatsApp</span>
                </button>

                {/* Instagram Story Handoff */}
                <button
                  className="quick-share-btn"
                  onClick={() => setActiveTab('story')}
                >
                  <div className="platform-icon-circle instagram">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="platform-btn-label">Instagram</span>
                </button>

                {/* Facebook */}
                <button
                  className="quick-share-btn"
                  onClick={() => handlePlatformClick(buildPlatformIntentUrl('facebook', cleanData))}
                >
                  <div className="platform-icon-circle facebook">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="platform-btn-label">Facebook</span>
                </button>

                {/* X / Twitter */}
                <button
                  className="quick-share-btn"
                  onClick={() => handlePlatformClick(buildPlatformIntentUrl('twitter', cleanData))}
                >
                  <div className="platform-icon-circle twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="platform-btn-label">X (Twitter)</span>
                </button>

                {/* LinkedIn */}
                <button
                  className="quick-share-btn"
                  onClick={() => handlePlatformClick(buildPlatformIntentUrl('linkedin', cleanData))}
                >
                  <div className="platform-icon-circle linkedin">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                  <span className="platform-btn-label">LinkedIn</span>
                </button>

                {/* Telegram */}
                <button
                  className="quick-share-btn"
                  onClick={() => handlePlatformClick(buildPlatformIntentUrl('telegram', cleanData))}
                >
                  <div className="platform-icon-circle telegram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.942z"/>
                    </svg>
                  </div>
                  <span className="platform-btn-label">Telegram</span>
                </button>

                {/* Direct Share (Device Share Sheet) */}
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                  <button
                    className="quick-share-btn"
                    onClick={async () => {
                      try {
                        await navigator.share({
                          title: copyPayload.title,
                          text: `${copyPayload.shareText}\n${copyPayload.url}`
                        });
                        showToast('Shared successfully', 'success');
                      } catch (err: any) {
                        if (err.name !== 'AbortError') {
                          handleCopyLink();
                        }
                      }
                    }}
                  >
                    <div className="platform-icon-circle" style={{ background: 'linear-gradient(135deg, #B4232A 0%, #D43840 100%)', color: '#FFF' }}>
                      <Share2 size={20} />
                    </div>
                    <span className="platform-btn-label">Direct Share</span>
                  </button>
                )}
              </div>

              {/* Copy Link Bar Box */}
              <div className="copy-link-bar-box">
                <input
                  type="text"
                  readOnly
                  value={copyPayload.url}
                  className="copy-url-input"
                  aria-label="Direct Share Link"
                />
                <button
                  className={`copy-action-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopyLink}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2, 3, 4, 5: VISUAL ASSET RENDERERS (Story, Status, Feed, OG) */}
          {activeTab !== 'quick' && (
            <div className="visual-asset-preview-layout">
              {/* Live Canvas Image Viewport */}
              <div className="preview-canvas-holder">
                {isRendering ? (
                  <div className="canvas-loading-spinner">
                    <div className="spinner-circle"></div>
                    <span>Rendering editorial asset...</span>
                  </div>
                ) : previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Social Preview Asset"
                    className="preview-img-display"
                  />
                ) : (
                  <div className="canvas-loading-spinner">
                    <span>Preview unavailable</span>
                  </div>
                )}
              </div>

              {/* Download & Direct Share Actions */}
              <div className="preview-controls-col">
                <div className="asset-action-buttons">
                  {/* Primary Download Button */}
                  <button
                    className="primary-download-btn"
                    onClick={() => {
                      const fmt = activeTab === 'story' ? 'story_1080x1920'
                        : activeTab === 'status' ? 'status_1080x1920'
                        : activeTab === 'feed' ? 'feed_1080x1350'
                        : activeTab === 'square' ? 'square_1080x1080'
                        : 'og_1200x630';
                      handleDownloadAsset(fmt);
                    }}
                    disabled={isRendering}
                  >
                    <Download size={16} />
                    <span>Download High-Res PNG</span>
                  </button>

                  {/* Mobile Direct Web Share Button */}
                  <button
                    className="secondary-share-btn"
                    onClick={() => {
                      const fmt = activeTab === 'story' ? 'story_1080x1920'
                        : activeTab === 'status' ? 'status_1080x1920'
                        : activeTab === 'feed' ? 'feed_1080x1350'
                        : activeTab === 'square' ? 'square_1080x1080'
                        : 'og_1200x630';
                      handleWebShareFile(fmt);
                    }}
                    disabled={isRendering}
                  >
                    <Share2 size={15} />
                    <span>Share Directly / Save to Photos</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
