import React, { useState } from 'react';
import type { Rating } from '../../types/database.types';
import { ReviewCard } from './ReviewCard';
import { Button } from '../ui';
import { MessageSquare, ChevronDown } from 'lucide-react';

export interface ReviewListProps {
  ratings: Rating[];
}

export const ReviewList: React.FC<ReviewListProps> = ({ ratings }) => {
  const [displayCount, setDisplayCount] = useState<number>(3);

  const reviewsWithText = ratings.filter(r => Boolean(r.review && r.review.trim().length > 0));
  const visibleReviews = reviewsWithText.slice(0, displayCount);

  if (reviewsWithText.length === 0) {
    return null;
  }

  return (
    <div className="reviews-list-container">
      <div className="reviews-list-header">
        <div className="header-title-slot">
          <MessageSquare size={14} className="header-icon-red" />
          <h4 className="reviews-head-title">Community Reviews</h4>
        </div>
        <span className="reviews-counter">{reviewsWithText.length} Written {reviewsWithText.length === 1 ? 'Review' : 'Reviews'}</span>
      </div>

      <div className="reviews-vertical-stack">
        {visibleReviews.map((r) => (
          <ReviewCard key={r.id} rating={r} />
        ))}
      </div>

      {displayCount < reviewsWithText.length && (
        <div className="load-more-reviews-row">
          <Button
            variant="outline"
            size="sm"
            rounded="full"
            iconRight={<ChevronDown size={13} />}
            onClick={() => setDisplayCount(prev => prev + 5)}
          >
            Load More Reviews ({reviewsWithText.length - displayCount} remaining)
          </Button>
        </div>
      )}

      <style>{`
        .reviews-list-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .reviews-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-title-slot {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .header-icon-red {
          color: var(--kirti-red);
        }
        .reviews-head-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .reviews-counter {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .reviews-vertical-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .load-more-reviews-row {
          display: flex;
          justify-content: center;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};
