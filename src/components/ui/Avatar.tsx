import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  bordered?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User Avatar',
  size = 'md',
  bordered = false,
  className = '',
  onClick
}) => {
  return (
    <div
      className={`ui-avatar avatar-${size} ${bordered ? 'is-bordered' : ''} ${onClick ? 'is-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={alt} className="avatar-image" loading="lazy" />
      ) : (
        <div className="avatar-fallback">{alt.charAt(0).toUpperCase()}</div>
      )}

      <style>{`
        .ui-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          overflow: hidden;
          background: var(--bg-card-subtle);
          flex-shrink: 0;
          user-select: none;
          position: relative;
        }
        .ui-avatar.is-clickable {
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .ui-avatar.is-clickable:hover {
          transform: scale(1.08);
          z-index: 5;
        }
        .ui-avatar.is-bordered {
          border: 2px solid var(--border);
        }

        /* Sizes */
        .avatar-xs { width: 22px; height: 22px; font-size: 10px; }
        .avatar-sm { width: 32px; height: 32px; font-size: 12px; }
        .avatar-md { width: 42px; height: 42px; font-size: 15px; }
        .avatar-lg { width: 56px; height: 56px; font-size: 18px; }
        .avatar-xl { width: 74px; height: 74px; font-size: 22px; }
        .avatar-2xl { width: 92px; height: 92px; font-size: 28px; }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--bg-card-subtle);
        }
      `}</style>
    </div>
  );
};
