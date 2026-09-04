import React from 'react';
import { Share2 } from 'lucide-react';
import type { ShareData } from '../../lib/social/types';
import { useStore } from '../../lib/store';

interface ShareButtonProps {
  data: ShareData;
  onShare?: (data: ShareData) => void;
  variant?: 'icon' | 'pill' | 'button' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  data,
  onShare,
  variant = 'icon',
  size = 'md',
  label = 'Share',
  className = ''
}) => {
  const { openShareModal } = useStore();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onShare) {
      onShare(data);
    } else {
      openShareModal(data);
    }
  };

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={`aabesh-share-icon-btn ${className}`}
        onClick={handleClick}
        title="Share with friends"
        aria-label="Share"
      >
        <Share2 size={iconSize} />
        <style>{`
          .aabesh-share-icon-btn {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-full);
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-primary);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.18s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          .aabesh-share-icon-btn:hover {
            background: var(--bg-card-hover);
            border-color: var(--border-focus);
            transform: scale(1.06);
            color: var(--kirti-red);
          }
          .aabesh-share-icon-btn:active {
            transform: scale(0.95);
          }
        `}</style>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        className={`aabesh-share-pill-btn ${className}`}
        onClick={handleClick}
        title="Share"
        aria-label="Share"
      >
        <Share2 size={iconSize} />
        <span>{label}</span>
        <style>{`
          .aabesh-share-pill-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: var(--radius-full);
            background: var(--bg-card-subtle);
            border: 1px solid var(--border);
            color: var(--text-secondary);
            font-family: var(--font-sans);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.18s ease;
          }
          .aabesh-share-pill-btn:hover {
            background: var(--bg-card);
            border-color: var(--border-focus);
            color: var(--text-primary);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          .aabesh-share-pill-btn:active {
            transform: scale(0.96);
          }
        `}</style>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`aabesh-share-btn-full ${className}`}
      onClick={handleClick}
    >
      <Share2 size={iconSize} />
      <span>{label}</span>
      <style>{`
        .aabesh-share-btn-full {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          padding: 0 20px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .aabesh-share-btn-full:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-focus);
        }
        .aabesh-share-btn-full:active {
          transform: scale(0.97);
        }
      `}</style>
    </button>
  );
};
