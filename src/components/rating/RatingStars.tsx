import React from 'react';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  value: number; // 0 - 5
  onChange?: (val: 1 | 2 | 3 | 4 | 5) => void;
  size?: number;
  readOnly?: boolean;
  name?: string;
  ariaLabelPrefix?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  size = 20,
  readOnly = false,
  name = 'rating',
  ariaLabelPrefix = 'Rate'
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const displayScore = hoverValue !== null ? hoverValue : value;

  return (
    <div className={`rating-stars-group ${readOnly ? 'is-readonly' : 'is-interactive'}`} role="group" aria-label={name}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayScore;

        if (readOnly) {
          return (
            <span
              key={star}
              className={`star-icon-slot ${isFilled ? 'star-filled' : 'star-empty'}`}
              aria-hidden="true"
            >
              <Star
                size={size}
                className={isFilled ? 'star-svg-filled' : 'star-svg-empty'}
                fill={isFilled ? 'var(--kirti-gold)' : 'none'}
              />
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            className={`star-tap-btn ${isFilled ? 'is-active' : ''}`}
            onClick={() => onChange?.(star as 1 | 2 | 3 | 4 | 5)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(null)}
            aria-label={`${ariaLabelPrefix} ${star} star${star > 1 ? 's' : ''}`}
            title={`${star} Star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={isFilled ? 'star-svg-filled' : 'star-svg-empty'}
              fill={isFilled ? 'var(--kirti-gold)' : 'none'}
            />
          </button>
        );
      })}

      <style>{`
        .rating-stars-group {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .star-tap-btn {
          background: transparent;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-xs);
          transition: transform 0.12s ease;
          touch-action: manipulation;
        }
        .star-tap-btn:focus-visible {
          outline: 2px solid var(--kirti-gold);
        }
        .star-tap-btn:active {
          transform: scale(0.88);
        }
        .star-icon-slot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .star-svg-filled {
          color: var(--kirti-gold);
        }
        .star-svg-empty {
          color: var(--gray-300);
        }
        [data-theme="dark"] .star-svg-empty {
          color: var(--gray-700);
        }
      `}</style>
    </div>
  );
};
