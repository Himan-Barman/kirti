import React from 'react';
import type { Rating } from '../../types/database.types';
import { RatingStars } from './RatingStars';
import { Avatar } from '../ui';

export interface ReviewCardProps {
  rating: Rating;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ rating }) => {
  const user = rating.user;
  const scores = rating.scores || {
    overall: rating.rating,
    theme: rating.rating,
    idol: rating.rating,
    lighting: rating.rating,
    management: rating.rating
  };

  return (
    <div className="review-card-item">
      <div className="review-header-row">
        <div className="review-user-info">
          <Avatar
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user?.display_name || 'User'}
            size="sm"
          />
          <div className="user-text-col">
            <span className="user-name-txt">{user?.display_name || 'Puja Explorer'}</span>
            <span className="review-time-txt">{rating.created_at ? new Date(rating.created_at).toLocaleDateString() : '2h ago'}</span>
          </div>
        </div>

        <div className="overall-score-capsule">
          <RatingStars value={scores.overall} readOnly={true} size={13} />
          <span className="overall-score-txt">{scores.overall}.0 ★</span>
        </div>
      </div>

      {/* 4 Dimension Score Pills */}
      <div className="review-subscores-strip">
        <span className="subscore-pill">Theme: {scores.theme}★</span>
        <span className="subscore-pill">Idol: {scores.idol}★</span>
        <span className="subscore-pill">Lighting: {scores.lighting}★</span>
        <span className="subscore-pill">Mgmt: {scores.management}★</span>
      </div>

      {/* Review Text */}
      {rating.review && (
        <p className="review-body-text">"{rating.review}"</p>
      )}

      <style>{`
        .review-card-item {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .review-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .review-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-text-col {
          display: flex;
          flex-direction: column;
        }
        .user-name-txt {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .review-time-txt {
          font-size: 11px;
          color: var(--text-muted);
        }
        .overall-score-capsule {
          display: flex;
          align-items: center;
          gap: 5px;
          background: var(--bg-card-subtle);
          padding: 3px 8px;
          border-radius: var(--radius-full);
        }
        .overall-score-txt {
          font-size: 11px;
          font-weight: 800;
          color: var(--kirti-gold);
        }
        .review-subscores-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .subscore-pill {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-card-subtle);
          padding: 2px 7px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-subtle);
        }
        .review-body-text {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
