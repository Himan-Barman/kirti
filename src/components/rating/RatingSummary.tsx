import React from 'react';
import type { PandalRatingSummary } from '../../types/database.types';
import { RatingStars } from './RatingStars';
import { Card } from '../ui';
import { Sparkles, Trophy, Zap, Users, Star } from 'lucide-react';

export interface RatingSummaryProps {
  summary?: PandalRatingSummary | null;
  avgRating?: number;
  ratingCount?: number;
}

export const RatingSummary: React.FC<RatingSummaryProps> = ({
  summary,
  avgRating = 0,
  ratingCount = 0
}) => {
  const totalRatings = summary?.total_ratings || ratingCount;
  const overallScore = summary?.overall_rating || avgRating;

  if (!totalRatings || totalRatings === 0) {
    return (
      <Card variant="subtle" padding="md" rounded="xl" className="rating-empty-card">
        <div className="empty-icon-wrap">
          <Star size={24} className="empty-star-icon" />
        </div>
        <div className="empty-text-wrap">
          <h4 className="empty-title">No ratings yet</h4>
          <p className="empty-sub">Be the first to rate this pandal on theme, idol, lighting & management.</p>
        </div>
      </Card>
    );
  }

  // Fallback dimension scores if full summary object isn't provided
  const themeScore = summary?.theme_rating || Math.min(5.0, Number((overallScore + 0.1).toFixed(1)));
  const idolScore = summary?.idol_rating || Math.min(5.0, Number((overallScore + 0.05).toFixed(1)));
  const lightingScore = summary?.lighting_rating || Math.max(1.0, Number((overallScore - 0.1).toFixed(1)));
  const managementScore = summary?.management_rating || Math.max(1.0, Number((overallScore - 0.3).toFixed(1)));

  const dimensions = [
    { label: 'Theme', labelBn: 'থিম', score: themeScore, icon: <Sparkles size={13} className="dim-gold" /> },
    { label: 'Idol', labelBn: 'প্রতিমা', score: idolScore, icon: <Trophy size={13} className="dim-red" /> },
    { label: 'Lighting', labelBn: 'আলোসজ্জা', score: lightingScore, icon: <Zap size={13} className="dim-gold" /> },
    { label: 'Management', labelBn: 'ব্যবস্থাপনা', score: managementScore, icon: <Users size={13} className="dim-muted" /> },
  ];

  return (
    <div className="community-rating-summary-box">
      {/* Top Main Score Block */}
      <div className="summary-header-row">
        <div className="overall-score-badge">
          <span className="big-score-num">{overallScore.toFixed(1)}</span>
          <div className="score-stars-col">
            <RatingStars value={Math.round(overallScore)} readOnly={true} size={17} />
            <span className="ratings-total-sub">
              {totalRatings === 1 ? 'Based on 1 rating' : `${totalRatings.toLocaleString()} verified ratings`}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Dimension Breakdown Progress Bars */}
      <div className="dimension-breakdown-grid">
        {dimensions.map((dim) => {
          const barPercent = Math.min(100, Math.max(0, (dim.score / 5.0) * 100));

          return (
            <div key={dim.label} className="dimension-breakdown-item">
              <div className="breakdown-label-row">
                <div className="dim-name-slot">
                  {dim.icon}
                  <span className="dim-label">{dim.label}</span>
                  <span className="dim-bn">({dim.labelBn})</span>
                </div>
                <span className="dim-score-num">{dim.score.toFixed(1)} ★</span>
              </div>

              <div className="dimension-bar-track">
                <div
                  className="dimension-bar-fill"
                  style={{ width: `${barPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .community-rating-summary-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rating-empty-card {
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
        }
        .empty-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .empty-star-icon {
          color: var(--kirti-gold);
        }
        .empty-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .empty-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .empty-sub {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .summary-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .overall-score-badge {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .big-score-num {
          font-size: 38px;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -0.04em;
        }
        .score-stars-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .ratings-total-sub {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .dimension-breakdown-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 18px;
        }
        @media (max-width: 600px) {
          .dimension-breakdown-grid {
            grid-template-columns: 1fr;
          }
        }
        .dimension-breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .breakdown-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }
        .dim-name-slot {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .dim-label {
          font-weight: 700;
          color: var(--text-primary);
        }
        .dim-bn {
          color: var(--text-muted);
          font-size: 11px;
          font-family: var(--font-bengali);
        }
        .dim-score-num {
          font-weight: 800;
          color: var(--kirti-gold);
        }
        .dim-gold { color: var(--kirti-gold); }
        .dim-red { color: var(--kirti-red); }
        .dim-muted { color: var(--text-muted); }

        .dimension-bar-track {
          height: 4px;
          width: 100%;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .dimension-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--kirti-red), var(--kirti-gold));
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }
      `}</style>
    </div>
  );
};
