import React from 'react';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { Avatar, Badge, Button } from '../ui';
import { Crown, Users, ArrowRight, MapPin, ChevronRight, UserPlus, LogIn, Sparkles } from 'lucide-react';

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
  const { user } = useAuth();

  const totalPandalsCount = pandals.length || 16;
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

  // Rankings list
  const displayedRankings = showTop3Only ? allRankings.slice(0, 3) : allRankings;

  return (
    <section className="friend-podium-section">
      {/* Centered Red/Gold Eyebrow Pill */}
      <div className="section-eyebrow-center-wrap">
        <div className="section-eyebrow eyebrow-red">
          <Crown size={12} className="eyebrow-icon-red" />
          <span>SOCIAL RADAR</span>
        </div>
      </div>

      {/* Left-aligned Heading & Right-aligned Status */}
      <div className="friend-section-header">
        <h2 className="section-main-title">Friend Circle Leaderboard</h2>

        <div className="friend-header-right">
          <div className="friend-live-pill">
            <span className="live-pulse-dot"></span>
            <span>Live Standings</span>
          </div>
        </div>
      </div>

      {/* Conditional: If NOT logged in / signed up, show ultra-premium Guest Sign Up Banner */}
      {!user ? (
        <div className="friend-guest-banner">
          <div className="guest-banner-glow" aria-hidden="true"></div>
          
          <div className="guest-banner-inner">
            <div className="guest-banner-left">
              <div className="guest-banner-icon-box">
                <Users size={24} className="guest-icon" />
              </div>

              <div className="guest-banner-text">
                <div className="guest-pill-tag">
                  <Sparkles size={12} className="sparkle-gold" />
                  <span>Connect with Friends</span>
                </div>
                <h3 className="guest-banner-headline">
                  Track Puja Journeys with Your Circle
                </h3>
                <p className="guest-banner-subtext">
                  Sign up to add friends, share visited pandal passports in real-time, and compare live exploration leaderboards.
                </p>
              </div>
            </div>

            <div className="guest-banner-actions">
              <Button
                variant="primary"
                size="md"
                rounded="full"
                icon={<UserPlus size={15} />}
                onClick={() => setActiveTab('signup')}
              >
                Sign Up to Connect
              </Button>
              <Button
                variant="outline"
                size="md"
                rounded="full"
                icon={<LogIn size={15} />}
                onClick={() => setActiveTab('login')}
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Logged-in view: Full-Width Friend Bars Stack */
        <>
          <div className="friend-bars-list">
            {displayedRankings.map((item, index) => {
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
              const rankLabel = index === 0 ? '1st Place' : index === 1 ? '2nd Place' : index === 2 ? '3rd Place' : `Rank #${index + 1}`;

              return (
                <div
                  key={item.user.id}
                  className={`friend-bar-row ${item.isMe ? 'is-me-bar' : ''}`}
                  onClick={() => {
                    if (!item.isMe) setSelectedFriendProfile(item.user);
                  }}
                >
                  {/* Left Details: Rank + Avatar + User Info + 'You' Badge */}
                  <div className="bar-left-group">
                    <div className={`bar-rank-badge rank-pos-${index}`}>
                      <span className="rank-medal-emoji">{medal}</span>
                      <span className="rank-label-text">{rankLabel}</span>
                    </div>

                    <div className="bar-user-cluster">
                      <Avatar
                        src={item.user.avatar_url}
                        alt={item.user.display_name}
                        size="md"
                        bordered={item.isMe}
                      />
                      <div className="bar-user-text">
                        <div className="bar-name-row">
                          <span className="bar-display-name">{item.user.display_name}</span>
                          {item.isMe && (
                            <Badge variant="red" size="sm" rounded="full">
                              You
                            </Badge>
                          )}
                        </div>
                        <span className="bar-user-handle">@{item.user.username}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Details: Visited Stats Pill & Action */}
                  <div className="bar-right-group">
                    <div className="bar-stat-chip">
                      <MapPin size={13} className="pin-icon-accent" />
                      <span className="stat-highlight">{item.visitedCount}</span>
                      <span className="stat-label">of {totalPandalsCount} pandals visited</span>
                    </div>

                    {!item.isMe && (
                      <span className="bar-view-profile-hint">
                        <span>View Profile</span>
                        <ChevronRight size={14} className="hint-arrow" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Centered Action Button */}
          {showTop3Only && (
            <div className="view-more-row">
              <Button
                variant="outline"
                size="md"
                rounded="full"
                icon={<Users size={15} />}
                iconRight={<ArrowRight size={14} />}
                onClick={() => setActiveTab('friends')}
              >
                View Full Friend Leaderboard & Activity
              </Button>
            </div>
          )}
        </>
      )}

      <style>{`
        .friend-podium-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .section-eyebrow-center-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .friend-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          width: 100%;
        }
        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          width: fit-content;
        }
        .eyebrow-red {
          color: var(--kirti-red);
        }
        .eyebrow-icon-red {
          color: var(--kirti-red);
        }
        .section-main-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          margin: 0;
        }
        @media (max-width: 768px) {
          .friend-section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .section-main-title {
            font-size: 20px;
          }
        }

        .friend-header-right {
          display: flex;
          align-items: center;
        }
        .friend-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 12px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .live-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--kirti-gold);
          box-shadow: 0 0 8px var(--kirti-gold);
        }

        /* Ultra-Premium Guest Sign-Up Banner */
        .friend-guest-banner {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-2xl);
          padding: 28px 32px;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .friend-guest-banner:hover {
          border-color: rgba(251, 191, 36, 0.4);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
        }
        .guest-banner-glow {
          position: absolute;
          top: -40px;
          right: 5%;
          width: 280px;
          height: 180px;
          background: radial-gradient(ellipse at center, rgba(225, 29, 72, 0.15) 0%, rgba(251, 191, 36, 0.08) 50%, transparent 80%);
          filter: blur(35px);
          pointer-events: none;
          z-index: 0;
        }
        .guest-banner-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
        }
        .guest-banner-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          min-width: 280px;
        }
        .guest-banner-icon-box {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-xl);
          background: rgba(180, 35, 42, 0.12);
          border: 1px solid rgba(180, 35, 42, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--kirti-red);
          flex-shrink: 0;
        }
        .guest-banner-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .guest-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: var(--kirti-gold);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .sparkle-gold {
          color: var(--kirti-gold);
        }
        .guest-banner-headline {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .guest-banner-subtext {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
          max-width: 520px;
        }
        .guest-banner-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .friend-guest-banner {
            padding: 20px;
          }
          .guest-banner-inner {
            flex-direction: column;
            align-items: flex-start;
          }
          .guest-banner-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .guest-banner-actions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }
          .guest-banner-actions > * {
            width: 100%;
            justify-content: center;
          }
        }

        /* Full-Width Friend Bars Stack */
        .friend-bars-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .friend-bar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 14px 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          cursor: pointer;
          box-sizing: border-box;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          gap: 16px;
        }
        .friend-bar-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
          border-color: rgba(251, 191, 36, 0.35);
        }
        .friend-bar-row:active {
          transform: scale(0.98);
        }

        .is-me-bar {
          border-color: rgba(180, 35, 42, 0.4);
          background: linear-gradient(90deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%);
        }
        .is-me-bar:hover {
          border-color: var(--kirti-red);
        }

        .bar-left-group {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }

        .bar-rank-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
          flex-shrink: 0;
        }
        .rank-pos-0 {
          border-color: rgba(251, 191, 36, 0.4);
          background: rgba(251, 191, 36, 0.08);
          color: var(--kirti-gold);
        }
        .rank-pos-1 {
          border-color: rgba(200, 200, 200, 0.3);
          background: rgba(255, 255, 255, 0.04);
        }
        .rank-pos-2 {
          border-color: rgba(205, 127, 50, 0.3);
          background: rgba(205, 127, 50, 0.06);
        }
        .rank-medal-emoji {
          font-size: 13px;
        }
        .rank-label-text {
          font-size: 11px;
          letter-spacing: 0.02em;
        }

        .bar-user-cluster {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .bar-user-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .bar-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bar-display-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bar-user-handle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .bar-right-group {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .bar-stat-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 12px;
          color: var(--text-secondary);
        }
        .pin-icon-accent {
          color: var(--kirti-red);
        }
        .stat-highlight {
          font-weight: 800;
          color: var(--text-primary);
          font-size: 13px;
        }
        .stat-label {
          color: var(--text-muted);
          font-size: 11px;
        }

        .bar-view-profile-hint {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }
        .hint-arrow {
          transform: translateX(-2px);
          transition: transform 0.2s ease;
        }
        .friend-bar-row:hover .bar-view-profile-hint {
          color: var(--text-primary);
        }
        .friend-bar-row:hover .hint-arrow {
          transform: translateX(2px);
          color: var(--kirti-red);
        }

        @media (max-width: 650px) {
          .friend-bar-row {
            flex-direction: column;
            align-items: flex-start;
            padding: 14px;
            gap: 12px;
          }
          .bar-left-group {
            width: 100%;
            justify-content: flex-start;
          }
          .bar-right-group {
            width: 100%;
            justify-content: space-between;
          }
          .bar-stat-chip {
            width: 100%;
            justify-content: center;
          }
        }

        .view-more-row {
          display: flex;
          justify-content: center;
          margin-top: 4px;
        }
      `}</style>
    </section>
  );
};



