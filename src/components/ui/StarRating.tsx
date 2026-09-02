import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  value?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
  showScore?: boolean;
  scoreCount?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  interactive = false,
  onChange,
  size = 14,
  showScore = false,
  scoreCount,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const activeValue = interactive ? (hoverRating || value) : value;
  const fullStars = Math.floor(activeValue);
  const hasHalf = !interactive && activeValue - fullStars >= 0.3;

  return (
    <div className={`ui-star-rating ${interactive ? 'is-interactive' : ''} ${className}`}>
      <div className="stars-wrapper">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            disabled={!interactive}
            className={`star-btn ${interactive ? 'clickable' : ''}`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onChange && onChange(star)}
            aria-label={`${star} star`}
          >
            <Star
              size={size}
              className={`star-svg ${
                star <= fullStars
                  ? 'filled'
                  : star === fullStars + 1 && hasHalf
                  ? 'half'
                  : 'empty'
              }`}
            />
          </button>
        ))}
      </div>

      {showScore && (
        <span className="rating-score-display">
          <strong className="score-val">{value.toFixed(1)}</strong>
          {scoreCount !== undefined && (
            <span className="score-total">({scoreCount.toLocaleString()})</span>
          )}
        </span>
      )}

      <style>{`
        .ui-star-rating {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          user-select: none;
        }
        .stars-wrapper {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .star-btn {
          background: transparent;
          border: none;
          padding: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: default;
          outline: none;
        }
        .star-btn.clickable {
          cursor: pointer;
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .star-btn.clickable:hover {
          transform: scale(1.25);
        }
        .star-svg.filled {
          color: var(--kirti-gold);
          fill: var(--kirti-gold);
        }
        .star-svg.half {
          color: var(--kirti-gold);
          fill: var(--kirti-gold-soft);
        }
        .star-svg.empty {
          color: var(--border);
        }
        .rating-score-display {
          display: inline-flex;
          align-items: baseline;
          gap: 4px;
          font-size: 13px;
        }
        .score-val {
          color: var(--text-primary);
          font-weight: 700;
        }
        .score-total {
          color: var(--text-muted);
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};
