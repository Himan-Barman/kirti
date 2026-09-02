import React from 'react';
import { RatingStars } from './RatingStars';

export interface RatingRowProps {
  code: string;
  label: string;
  labelBn: string;
  value: 1 | 2 | 3 | 4 | 5 | null;
  onChange?: (val: 1 | 2 | 3 | 4 | 5) => void;
  readOnly?: boolean;
  required?: boolean;
  hasError?: boolean;
}

export const RatingRow: React.FC<RatingRowProps> = ({
  code,
  label,
  labelBn,
  value,
  onChange,
  readOnly = false,
  required = false,
  hasError = false
}) => {
  return (
    <div className={`rating-dimension-row ${hasError ? 'has-error' : ''}`}>
      <div className="dimension-label-block">
        <div className="label-main-wrap">
          <span className="dimension-name">{label}</span>
          <span className="dimension-name-bn">{labelBn}</span>
          {required && !readOnly && <span className="req-dot">*</span>}
        </div>
        {value !== null && (
          <span className="dimension-score-val">{value}.0 ★</span>
        )}
      </div>

      <div className="dimension-stars-wrap">
        <RatingStars
          name={code}
          value={value || 0}
          onChange={onChange}
          readOnly={readOnly}
          size={22}
          ariaLabelPrefix={`Rate ${label}`}
        />
      </div>

      <style>{`
        .rating-dimension-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          gap: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .rating-dimension-row:last-child {
          border-bottom: none;
        }
        .rating-dimension-row.has-error {
          background: rgba(180, 35, 42, 0.05);
          border-radius: var(--radius-sm);
          padding: 8px;
        }
        .dimension-label-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .label-main-wrap {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .dimension-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .dimension-name-bn {
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-bengali);
        }
        .req-dot {
          color: var(--kirti-red);
          font-weight: 800;
          font-size: 14px;
        }
        .dimension-score-val {
          font-size: 12px;
          font-weight: 800;
          color: var(--kirti-gold);
        }
        .dimension-stars-wrap {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};
