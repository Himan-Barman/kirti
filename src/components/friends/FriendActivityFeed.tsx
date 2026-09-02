import React from 'react';
import { useStore } from '../../lib/store';
import { Card, Avatar, StarRating } from '../ui';
import { MapPin, Sparkles, Clock } from 'lucide-react';

export const FriendActivityFeed: React.FC = () => {
  const {
    activities,
    setSelectedFriendProfile,
    setSelectedPandal,
    pandals
  } = useStore();

  const handlePandalClick = (pandalId?: string) => {
    if (!pandalId) return;
    const found = pandals.find(p => p.id === pandalId);
    if (found) setSelectedPandal(found);
  };

  return (
    <div className="activity-feed-container">
      <div className="feed-header">
        <div>
          <h2 className="feed-title">Friend Activity</h2>
          <p className="feed-subtitle">Where your friends are going & what they're rating this Puja</p>
        </div>
      </div>

      <div className="activity-stream">
        {activities.map((activity) => (
          <Card key={activity.id} variant="default" padding="md" rounded="xl" className="activity-card">
            <div className="activity-user-row">
              <Avatar
                src={activity.user.avatar_url}
                alt={activity.user.display_name}
                size="md"
                onClick={() => setSelectedFriendProfile(activity.user)}
              />

              <div className="activity-meta">
                <div className="user-action-line">
                  <span
                    className="user-name-link"
                    onClick={() => setSelectedFriendProfile(activity.user)}
                  >
                    {activity.user.display_name}
                  </span>
                  <span className="action-verb">
                    {activity.type === 'visit' && 'visited'}
                    {activity.type === 'rating' && 'rated'}
                    {activity.type === 'milestone' && 'reached a milestone'}
                  </span>
                </div>

                <div className="timestamp-row">
                  <Clock size={11} className="time-icon text-muted" />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Content Payload */}
            {activity.type === 'visit' && activity.pandalName && (
              <div
                className="pandal-target-pill"
                onClick={() => handlePandalClick(activity.pandalId)}
              >
                <div className="target-icon-wrap">
                  <MapPin size={15} />
                </div>
                <div className="target-info">
                  <span className="target-name">{activity.pandalName}</span>
                  <span className="target-action-hint">View Pandal Details →</span>
                </div>
              </div>
            )}

            {activity.type === 'rating' && (
              <div
                className="rating-target-box"
                onClick={() => handlePandalClick(activity.pandalId)}
              >
                <div className="rating-target-header">
                  <span className="target-name">{activity.pandalName}</span>
                  <StarRating value={activity.rating || 5} size={13} />
                </div>
                {activity.review && (
                  <p className="activity-review-quote">"{activity.review}"</p>
                )}
              </div>
            )}

            {activity.type === 'milestone' && (
              <div className="milestone-box">
                <Sparkles size={16} className="milestone-icon" />
                <span className="milestone-text">{activity.detail || 'Visited multiple pandals today!'}</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <style>{`
        .activity-feed-container {
          display: flex;
          flex-direction: column;
          gap: 18px;
          max-width: 680px;
          margin: 0 auto;
        }
        .feed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .feed-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .feed-subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }
        .activity-stream {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .activity-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .activity-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .activity-meta {
          display: flex;
          flex-direction: column;
        }
        .user-action-line {
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-size: 14px;
        }
        .user-name-link {
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
        }
        .user-name-link:hover {
          text-decoration: underline;
        }
        .action-verb {
          color: var(--text-secondary);
        }
        .timestamp-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .pandal-target-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .pandal-target-pill:hover {
          background: var(--bg-card);
          border-color: var(--border-focus);
        }
        .target-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          background: var(--kirti-red-soft);
          color: var(--kirti-red);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .target-info {
          display: flex;
          flex-direction: column;
        }
        .target-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .target-action-hint {
          font-size: 11px;
          color: var(--kirti-red);
          font-weight: 600;
        }
        .rating-target-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px 14px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .rating-target-box:hover {
          background: var(--bg-card);
          border-color: var(--border-focus);
        }
        .rating-target-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .activity-review-quote {
          font-size: 13px;
          color: var(--text-secondary);
          font-style: italic;
          line-height: 1.4;
        }
        .milestone-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--kirti-gold-soft);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: var(--radius-lg);
          color: var(--text-primary);
        }
        .milestone-icon {
          color: var(--kirti-gold);
        }
        .milestone-text {
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
