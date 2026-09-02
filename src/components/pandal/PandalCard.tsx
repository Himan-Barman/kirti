import React from 'react';
import type { PandalWithStats } from '../../types/database.types';
import { useStore } from '../../lib/store';
import { Badge, Button, StarRating, Avatar } from '../ui';
import { MapPin, Check, Users } from 'lucide-react';

interface PandalCardProps {
  pandal: PandalWithStats;
}

export const PandalCard: React.FC<PandalCardProps> = ({ pandal }) => {
  const { setSelectedPandal, toggleVisit, setSelectedFriendProfile } = useStore();

  const handleVisitClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleVisit(pandal.id);
  };

  return (
    <div
      className="pandal-card beam-interactive"
      onClick={() => setSelectedPandal(pandal)}
    >
      {/* Top Image Container with matched rounded top corners */}
      <div className="pandal-img-wrap">
        <img
          src={pandal.image_url}
          alt={pandal.name}
          loading="lazy"
          className="pandal-img"
        />
        <div className="zone-tag-pos">
          <Badge variant="dark" size="sm" rounded="full">
            {pandal.zone}
          </Badge>
        </div>

        {pandal.userVisited && (
          <div className="visited-badge-pos">
            <Badge variant="red" size="sm" rounded="full" icon={<Check size={11} strokeWidth={3} />}>
              Visited
            </Badge>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="pandal-content">
        <div className="pandal-header">
          <h3 className="pandal-title">{pandal.name}</h3>
          <div className="pandal-location">
            <MapPin size={13} className="loc-icon" />
            <span>{pandal.address}</span>
          </div>
        </div>

        {/* Global StarRating component */}
        <div className="rating-display">
          <StarRating
            value={pandal.avgRating}
            size={14}
            showScore={true}
            scoreCount={pandal.ratingCount}
          />
        </div>

        {/* Friends Visited & Action Row */}
        <div className="pandal-footer">
          <div className="friends-indicator">
            {pandal.friendsVisitedCount > 0 ? (
              <div className="friend-avatars-group">
                <div className="avatar-stack">
                  {pandal.friendsWhoVisited.slice(0, 3).map((friend) => (
                    <Avatar
                      key={friend.id}
                      src={friend.avatar_url}
                      alt={friend.display_name}
                      size="xs"
                      bordered={true}
                      className="friend-mini-avatar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFriendProfile(friend);
                      }}
                    />
                  ))}
                </div>
                <span className="friends-count-text">
                  <strong>{pandal.friendsVisitedCount}</strong> {pandal.friendsVisitedCount === 1 ? 'friend' : 'friends'} visited
                </span>
              </div>
            ) : (
              <span className="no-friends-text">
                <Users size={12} /> Be first to visit
              </span>
            )}
          </div>

          <Button
            variant={pandal.userVisited ? 'visited' : 'outline'}
            size="sm"
            rounded="full"
            icon={pandal.userVisited ? <Check size={13} strokeWidth={2.5} /> : undefined}
            onClick={handleVisitClick}
          >
            {pandal.userVisited ? 'Visited' : 'Mark Visited'}
          </Button>
        </div>
      </div>

      <style>{`
        .pandal-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-card);
          border-radius: var(--radius-2xl);
          border: 1px solid var(--border);
          overflow: hidden;
          cursor: pointer;
          position: relative;
        }
        .pandal-img-wrap {
          position: relative;
          width: 100%;
          height: 200px;
          background-color: var(--bg-card-subtle);
          overflow: hidden;
          border-top-left-radius: calc(var(--radius-2xl) - 1px);
          border-top-right-radius: calc(var(--radius-2xl) - 1px);
        }
        .pandal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-top-left-radius: inherit;
          border-top-right-radius: inherit;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pandal-card:hover .pandal-img {
          transform: scale(1.05);
        }
        .zone-tag-pos {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
        }
        .visited-badge-pos {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 2;
        }
        .pandal-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 12px;
          position: relative;
          z-index: 2;
        }
        .pandal-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .pandal-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pandal-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .loc-icon {
          flex-shrink: 0;
        }
        .rating-display {
          display: flex;
          align-items: center;
        }
        .pandal-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--border);
          gap: 8px;
        }
        .friends-indicator {
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .friend-avatars-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .avatar-stack {
          display: flex;
          align-items: center;
        }
        .friend-mini-avatar {
          margin-left: -6px;
        }
        .friend-mini-avatar:first-child {
          margin-left: 0;
        }
        .friends-count-text {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .no-friends-text {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
