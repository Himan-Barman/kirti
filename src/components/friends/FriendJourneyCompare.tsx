import React from 'react';
import { useStore } from '../../lib/store';
import { Card, Avatar, Badge, Button } from '../ui';
import { Crown, Users, ArrowRight } from 'lucide-react';

interface FriendJourneyCompareProps {
  showTop3Only?: boolean;
}

export const FriendJourneyCompare: React.FC<FriendJourneyCompareProps> = ({ showTop3Only = true }) => {
  const {
    currentUser,
    friends,
    getUserStats,
    setSelectedFriendProfile,
    setActiveTab,
    pandals
  } = useStore();

  const myVisitedCount = pandals.filter(p => p.userVisited).length;

  // Build full sorted rankings
  const allRankings = [
    {
      user: currentUser,
      isMe: true,
      visitedCount: myVisitedCount,
    },
    ...friends.map(friend => {
      const stats = getUserStats(friend.id);
      return {
        user: friend,
        isMe: false,
        visitedCount: stats.visitedCount,
      };
    })
  ].sort((a, b) => b.visitedCount - a.visitedCount);

  // Determine user's rank
  const myRankIndex = allRankings.findIndex(r => r.isMe);
  const myRank = myRankIndex + 1;
  const leader = allRankings[0];
  const maxVisited = Math.max(...allRankings.map(u => u.visitedCount), 1);

  // Top 3 Friends list
  const displayedRankings = showTop3Only ? allRankings.slice(0, 3) : allRankings;

  return (
    <div className="friend-podium-section">
      {/* Section Header */}
      <div className="section-head-block">
        <div className="section-eyebrow">
          <Crown size={13} className="eyebrow-icon-gold" />
          <span>SOCIAL RADAR</span>
        </div>
        <div className="section-title-wrap">
          <h2 className="section-main-title">Friend Circle Leaderboard</h2>
          <p className="section-main-subtitle">Real-time check-in standings & your Puja journey progress</p>
        </div>
      </div>

      <Card variant="default" padding="lg" rounded="2xl" className="journey-compare-box">
        {/* Top Header with My Smart Rank Pill */}
        <div className="compare-header">
          <div className="compare-title-group">
            <div className="crown-icon-wrap">
              <Crown size={18} />
            </div>
            <div>
              <h3 className="compare-heading">Season Exploration Podium</h3>
              <p className="compare-sub">Top 3 explorers in your friend circle</p>
            </div>
          </div>

          {/* My Smart Ranking Capsule */}
          <div className="my-smart-rank-capsule">
            <div className="rank-badge-pill">
              <span className="rank-hash">Rank</span>
              <span className="rank-num">#{myRank}</span>
              <span className="rank-total">/ {allRankings.length}</span>
            </div>

            <div className="rank-message-wrap">
              {myRank === 1 ? (
                <span className="rank-status-lead">👑 You're in 1st place with {myVisitedCount} pandals!</span>
              ) : (
                <span className="rank-status-chase">
                  You visited <strong>{myVisitedCount}</strong> ({leader.visitedCount - myVisitedCount} behind @{leader.user.username.split('_')[0]})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top 3 Podium Cards with Rotating Border */}
        <div className="podium-grid">
          {displayedRankings.map((item, index) => {
            const percentage = Math.round((item.visitedCount / maxVisited) * 100);
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
            const medalLabel = index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place';

            return (
              <Card
                key={item.user.id}
                variant="interactive"
                padding="sm"
                rounded="xl"
                className={`podium-card ${item.isMe ? 'is-me-card' : ''}`}
                onClick={() => {
                  if (!item.isMe) setSelectedFriendProfile(item.user);
                }}
              >
                <div className="podium-top">
                  <div className="podium-medal-badge">
                    <span className="medal-emoji">{medal}</span>
                    <span className="medal-text">{medalLabel}</span>
                  </div>

                  {item.isMe && (
                    <Badge variant="red" size="sm" rounded="full">
                      You
                    </Badge>
                  )}
                </div>

                <div className="podium-user-row">
                  <Avatar
                    src={item.user.avatar_url}
                    alt={item.user.display_name}
                    size="md"
                    bordered={item.isMe}
                  />
                  <div className="podium-user-info">
                    <span className="podium-user-name">{item.user.display_name}</span>
                    <span className="podium-user-handle">@{item.user.username}</span>
                  </div>
                </div>

                {/* Progress bar and counter */}
                <div className="podium-score-row">
                  <div className="score-number-col">
                    <span className="score-count">{item.visitedCount}</span>
                    <span className="score-label">Pandals Visited</span>
                  </div>
                  <div className="mini-progress-bar">
                    <div
                      className={`mini-progress-fill ${item.isMe ? 'fill-red' : 'fill-dark'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer link to all friends */}
        {showTop3Only && (
          <div className="compare-footer-action">
            <Button
              variant="ghost"
              size="sm"
              rounded="full"
              icon={<Users size={14} />}
              iconRight={<ArrowRight size={13} />}
              onClick={() => setActiveTab('friends')}
            >
              View All {friends.length} Friends & Full Rankings
            </Button>
          </div>
        )}
      </Card>

      <style>{`
        .friend-podium-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .section-head-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--kirti-gold);
          text-transform: uppercase;
        }
        .eyebrow-icon-gold {
          color: var(--kirti-gold);
        }
        .section-main-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }
        .section-main-subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }
        .journey-compare-box {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .compare-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }
        .compare-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .crown-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--kirti-gold-soft);
          color: var(--kirti-gold);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .compare-heading {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .compare-sub {
          font-size: 12px;
          color: var(--text-muted);
        }
        .my-smart-rank-capsule {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px 6px 6px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
        }
        @media (max-width: 600px) {
          .compare-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .my-smart-rank-capsule {
            width: 100%;
            border-radius: var(--radius-lg);
            box-sizing: border-box;
            flex-wrap: wrap;
          }
        }
        .rank-badge-pill {
          display: inline-flex;
          align-items: baseline;
          gap: 3px;
          padding: 3px 10px;
          background: var(--text-primary);
          color: var(--bg-app);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 800;
        }
        .rank-hash {
          opacity: 0.7;
          font-size: 10px;
          text-transform: uppercase;
        }
        .rank-num {
          color: var(--kirti-gold);
          font-size: 13px;
        }
        .rank-total {
          opacity: 0.6;
          font-size: 10px;
        }
        .rank-message-wrap {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .rank-status-lead {
          font-weight: 700;
          color: var(--text-primary);
        }
        .podium-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 800px) {
          .podium-grid {
            grid-template-columns: 1fr;
          }
        }
        .podium-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .is-me-card {
          border-color: var(--kirti-red) !important;
          background: var(--bg-card-subtle) !important;
        }
        .podium-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .podium-medal-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .medal-emoji {
          font-size: 15px;
        }
        .medal-text {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .podium-user-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .podium-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .podium-user-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .podium-user-handle {
          font-size: 11px;
          color: var(--text-muted);
        }
        .podium-score-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: var(--bg-card);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .score-number-col {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }
        .score-count {
          font-size: 17px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .score-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
        }
        .mini-progress-bar {
          height: 4px;
          background: var(--border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .mini-progress-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }
        .fill-red {
          background: var(--kirti-red);
        }
        .fill-dark {
          background: var(--text-primary);
        }
        .compare-footer-action {
          display: flex;
          justify-content: center;
          padding-top: 4px;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
};
