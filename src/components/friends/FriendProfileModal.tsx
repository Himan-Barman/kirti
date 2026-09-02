import React from 'react';
import { useStore } from '../../lib/store';
import { Modal, Avatar, Badge, StarRating, Card } from '../ui';
import { Check } from 'lucide-react';

export const FriendProfileModal: React.FC = () => {
  const {
    selectedFriendProfile,
    setSelectedFriendProfile,
    getUserStats,
    pandals,
    setSelectedPandal
  } = useStore();

  if (!selectedFriendProfile) return null;

  const stats = getUserStats(selectedFriendProfile.id);
  const myVisitedCount = pandals.filter(p => p.userVisited).length;
  const friendVisitedCount = stats.visitedCount;

  return (
    <Modal
      isOpen={Boolean(selectedFriendProfile)}
      onClose={() => setSelectedFriendProfile(null)}
      maxWidth="560px"
    >
      <div className="friend-profile-dialog">
        {/* Profile Header */}
        <div className="friend-profile-header">
          <Avatar
            src={selectedFriendProfile.avatar_url}
            alt={selectedFriendProfile.display_name}
            size="xl"
            bordered={true}
          />

          <div className="friend-id-group">
            <h2 className="friend-name-big">{selectedFriendProfile.display_name}</h2>
            <span className="friend-username-tag">@{selectedFriendProfile.username}</span>
            {selectedFriendProfile.bio && (
              <p className="friend-bio-text">{selectedFriendProfile.bio}</p>
            )}
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="stats-metric-strip">
          <div className="metric-box">
            <span className="metric-number">{stats.visitedCount}</span>
            <span className="metric-title">Pandals Visited</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">{stats.ratingsCount}</span>
            <span className="metric-title">Ratings Given</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">{stats.friendsCount}</span>
            <span className="metric-title">Friends</span>
          </div>
        </div>

        {/* Journey Comparison Pill */}
        <div className="journey-comparison-pill">
          <div className="compare-col">
            <span className="compare-who">You</span>
            <span className="compare-score">{myVisitedCount}</span>
          </div>
          <div className="compare-divider">VS</div>
          <div className="compare-col">
            <span className="compare-who">{selectedFriendProfile.display_name.split(' ')[0]}</span>
            <span className="compare-score score-highlight">{friendVisitedCount}</span>
          </div>
          <div className="compare-verdict">
            {myVisitedCount >= friendVisitedCount
              ? `You are ${myVisitedCount - friendVisitedCount} pandal${myVisitedCount - friendVisitedCount === 1 ? '' : 's'} ahead!`
              : `${selectedFriendProfile.display_name.split(' ')[0]} is ${friendVisitedCount - myVisitedCount} pandal${friendVisitedCount - myVisitedCount === 1 ? '' : 's'} ahead!`}
          </div>
        </div>

        {/* Visited Pandals List */}
        <div className="friend-section-block">
          <div className="block-header">
            <h3 className="block-title">Visited Pandals ({stats.visitedPandals.length})</h3>
          </div>

          {stats.visitedPandals.length > 0 ? (
            <div className="friend-visited-scroll">
              {stats.visitedPandals.map((pandal) => {
                const isAlsoVisitedByMe = pandals.find(p => p.id === pandal.id)?.userVisited;
                return (
                  <Card
                    key={pandal.id}
                    variant="interactive"
                    padding="sm"
                    rounded="lg"
                    className="friend-pandal-card"
                    onClick={() => {
                      const fullPandal = pandals.find(p => p.id === pandal.id);
                      if (fullPandal) {
                        setSelectedFriendProfile(null);
                        setSelectedPandal(fullPandal);
                      }
                    }}
                  >
                    <img src={pandal.image_url} alt={pandal.name} className="pandal-mini-thumb" />
                    <div className="pandal-mini-info">
                      <h4 className="pandal-mini-title">{pandal.name}</h4>
                      <span className="pandal-mini-zone">{pandal.zone}</span>
                    </div>
                    {isAlsoVisitedByMe && (
                      <Badge variant="dark" size="sm" rounded="full" icon={<Check size={11} strokeWidth={3} />}>
                        Both Visited
                      </Badge>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="empty-text">No pandals marked as visited yet.</p>
          )}
        </div>

        {/* Recent Ratings List */}
        {stats.recentRatings.length > 0 && (
          <div className="friend-section-block">
            <h3 className="block-title">Recent Ratings</h3>
            <div className="friend-ratings-list">
              {stats.recentRatings.map((rating) => {
                const targetPandal = pandals.find(p => p.id === rating.pandal_id);
                return (
                  <Card key={rating.id} variant="default" padding="sm" rounded="lg" className="friend-rating-item">
                    <div className="rating-item-top">
                      <span className="pandal-target-bold">{targetPandal?.name || 'Pandal'}</span>
                      <StarRating value={rating.rating} size={12} />
                    </div>
                    {rating.review && (
                      <p className="rating-comment">"{rating.review}"</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .friend-profile-dialog {
          padding: 24px;
        }
        .friend-profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .friend-id-group {
          display: flex;
          flex-direction: column;
        }
        .friend-name-big {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .friend-username-tag {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .friend-bio-text {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .stats-metric-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          background: var(--bg-card-subtle);
          padding: 14px;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .metric-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .metric-number {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .metric-title {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .journey-comparison-pill {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 12px 18px;
          background: var(--text-primary);
          color: var(--bg-app);
          border-radius: var(--radius-xl);
          margin-bottom: 20px;
          position: relative;
        }
        .compare-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .compare-who {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }
        .compare-score {
          font-size: 20px;
          font-weight: 800;
        }
        .score-highlight {
          color: var(--kirti-gold);
        }
        .compare-divider {
          font-size: 12px;
          font-weight: 800;
          opacity: 0.5;
        }
        .compare-verdict {
          font-size: 12px;
          color: var(--bg-card);
          font-weight: 600;
          border-left: 1px solid var(--border);
          padding-left: 14px;
          max-width: 150px;
        }
        @media (max-width: 480px) {
          .journey-comparison-pill {
            flex-direction: column;
            gap: 10px;
            padding: 12px;
          }
          .compare-verdict {
            border-left: none;
            border-top: 1px solid rgba(255,255,255,0.15);
            padding-left: 0;
            padding-top: 8px;
            max-width: none;
            text-align: center;
          }
        }
        .friend-section-block {
          border-top: 1px solid var(--border);
          padding-top: 16px;
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .block-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .friend-visited-scroll {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 220px;
          overflow-y: auto;
        }
        .friend-pandal-card {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pandal-mini-thumb {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          object-fit: cover;
        }
        .pandal-mini-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .pandal-mini-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .pandal-mini-zone {
          font-size: 11px;
          color: var(--text-muted);
        }
        .friend-ratings-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .friend-rating-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rating-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pandal-target-bold {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .rating-comment {
          font-size: 12px;
          color: var(--text-secondary);
          font-style: italic;
        }
        .empty-text {
          font-size: 13px;
          color: var(--text-muted);
        }
      `}</style>
    </Modal>
  );
};
