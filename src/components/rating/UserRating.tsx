import React from 'react';
import type { RatingScores } from '../../types/database.types';
import { RatingStars } from './RatingStars';
import { Card, Button } from '../ui';
import { Check, Edit3 } from 'lucide-react';

export interface UserRatingProps {
  scores: RatingScores;
  review?: string;
  onEdit: () => void;
}

export const UserRating: React.FC<UserRatingProps> = ({
  scores,
  onEdit
}) => {
  const dimensions = [
    { label: 'Overall', labelBn: 'সামগ্রিক', score: scores.overall },
    { label: 'Theme', labelBn: 'থিম', score: scores.theme },
    { label: 'Idol', labelBn: 'প্রতিমা', score: scores.idol },
    { label: 'Lighting', labelBn: 'আলোসজ্জা', score: scores.lighting },
    { label: 'Management', labelBn: 'ব্যবস্থাপনা', score: scores.management },
  ];

  return (
    <Card variant="subtle" padding="md" rounded="xl" className="user-rating-box">
      <div className="user-rating-header">
        <div className="user-rating-title-block">
          <div className="badge-voted-pill">
            <Check size={12} strokeWidth={3} />
            <span>Your Verified Rating</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          rounded="full"
          icon={<Edit3 size={13} />}
          onClick={onEdit}
        >
          Edit Rating
        </Button>
      </div>

      {/* 5-Dimension Mini Grid */}
      <div className="user-dimensions-grid">
        {dimensions.map((dim) => (
          <div key={dim.label} className="user-dim-card">
            <div className="dim-head">
              <span className="dim-title">{dim.label}</span>
              <span className="dim-sub">{dim.labelBn}</span>
            </div>
            <div className="dim-stars-score">
              <RatingStars value={dim.score} readOnly={true} size={13} />
              <span className="dim-num">{dim.score}.0</span>
            </div>
          </div>
        ))}
      </div>



      <style>{`
        .user-rating-box {
          display: flex;
          flex-direction: column;
          gap: 14px;
          border: 1px solid var(--border);
          background: var(--bg-card);
        }
        .user-rating-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .badge-voted-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 700;
          color: var(--kirti-red);
          background: rgba(180, 35, 42, 0.08);
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }
        .user-dimensions-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }
        @media (max-width: 680px) {
          .user-dimensions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .user-dim-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--bg-card-subtle);
          padding: 8px 10px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .dim-head {
          display: flex;
          flex-direction: column;
        }
        .dim-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .dim-sub {
          font-size: 9px;
          color: var(--text-muted);
          font-family: var(--font-bengali);
        }
        .dim-stars-score {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 2px;
        }
        .dim-num {
          font-size: 11px;
          font-weight: 800;
          color: var(--kirti-gold);
        }
        .user-review-snippet {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg-card-subtle);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--kirti-red);
        }
        .review-icon {
          color: var(--kirti-red);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .review-text-content {
          font-size: 13px;
          color: var(--text-secondary);
          font-style: italic;
          margin: 0;
        }
      `}</style>
    </Card>
  );
};
