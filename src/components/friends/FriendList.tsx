import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Card, SearchBar, Button, Avatar, Badge } from '../ui';
import { UserPlus, Check, X, Users, ArrowRight, UserMinus } from 'lucide-react';

export const FriendList: React.FC = () => {
  const {
    friends,
    pendingIncomingRequests,
    pendingOutgoingRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    setSelectedFriendProfile,
    getUserStats
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = searchUsers(searchQuery);

  return (
    <div className="friend-manager-container">
      {/* Search Bar for Users */}
      <Card variant="default" padding="md" rounded="xl" className="user-search-card">
        <h3 className="card-heading">Find Friends on Kirti</h3>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by username or name (e.g. @ananya_r, Priya, Sourav)..."
          rounded="full"
        />

        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="search-results-box">
            {searchResults.length > 0 ? (
              searchResults.map((user) => {
                const isFriend = friends.some(f => f.id === user.id);
                const isPendingIncoming = pendingIncomingRequests.some(u => u.id === user.id);
                const isPendingOutgoing = pendingOutgoingRequests.some(u => u.id === user.id);
                const stats = getUserStats(user.id);

                return (
                  <div key={user.id} className="search-user-item">
                    <Avatar src={user.avatar_url} alt={user.display_name} size="sm" />
                    <div className="user-text-col">
                      <span className="user-name-txt">{user.display_name}</span>
                      <span className="user-handle-txt">@{user.username} • {stats.visitedCount} pandals</span>
                    </div>

                    <div className="user-actions">
                      {isFriend ? (
                        <Badge variant="gray" size="sm" rounded="full">Friends ✓</Badge>
                      ) : isPendingOutgoing ? (
                        <Badge variant="dark" size="sm" rounded="full">Requested</Badge>
                      ) : isPendingIncoming ? (
                        <Button
                          variant="primary"
                          size="sm"
                          rounded="full"
                          onClick={() => acceptFriendRequest(user.id)}
                        >
                          Accept
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          rounded="full"
                          icon={<UserPlus size={13} />}
                          onClick={() => sendFriendRequest(user.id)}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-results-msg">No users found matching "{searchQuery}"</p>
            )}
          </div>
        )}
      </Card>

      {/* Incoming Requests Banner */}
      {pendingIncomingRequests.length > 0 && (
        <Card variant="default" padding="md" rounded="xl" className="incoming-requests-card">
          <h4 className="incoming-title">
            Friend Requests ({pendingIncomingRequests.length})
          </h4>
          <div className="requests-list">
            {pendingIncomingRequests.map((user) => (
              <div key={user.id} className="request-row">
                <Avatar src={user.avatar_url} alt={user.display_name} size="sm" />
                <div className="user-text-col">
                  <span className="user-name-txt">{user.display_name}</span>
                  <span className="user-handle-txt">@{user.username}</span>
                </div>
                <div className="req-btns">
                  <Button
                    variant="primary"
                    size="sm"
                    rounded="full"
                    icon={<Check size={12} />}
                    onClick={() => acceptFriendRequest(user.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    rounded="full"
                    icon={<X size={12} />}
                    onClick={() => declineFriendRequest(user.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Current Friends List */}
      <Card variant="default" padding="md" rounded="xl" className="friends-list-card">
        <div className="friends-list-header">
          <div className="friends-title-group">
            <Users size={18} />
            <h3 className="card-heading">My Friends ({friends.length})</h3>
          </div>
          <span className="friends-header-sub">Click any friend to explore their journey</span>
        </div>

        <div className="friends-grid">
          {friends.map((friend) => {
            const stats = getUserStats(friend.id);
            return (
              <Card
                key={friend.id}
                variant="interactive"
                padding="sm"
                rounded="lg"
                className="friend-card-box"
                onClick={() => setSelectedFriendProfile(friend)}
              >
                <div className="friend-card-top">
                  <Avatar src={friend.avatar_url} alt={friend.display_name} size="md" />
                  <div className="friend-card-names">
                    <h4 className="friend-card-name">{friend.display_name}</h4>
                    <span className="friend-card-username">@{friend.username}</span>
                  </div>
                </div>

                <div className="friend-stats-pills">
                  <div className="stat-pill">
                    <span className="stat-num">{stats.visitedCount}</span>
                    <span className="stat-lbl">Pandals</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-num">{stats.ratingsCount}</span>
                    <span className="stat-lbl">Ratings</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-num">{stats.friendsCount}</span>
                    <span className="stat-lbl">Friends</span>
                  </div>
                </div>

                <div className="friend-card-footer">
                  <span className="view-profile-link">
                    View Journey <ArrowRight size={12} />
                  </span>
                  <button
                    className="remove-btn"
                    title="Remove Friend"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove @${friend.username} from friends?`)) {
                        removeFriend(friend.id);
                      }
                    }}
                  >
                    <UserMinus size={13} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      <style>{`
        .friend-manager-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .card-heading {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }
        .search-results-box {
          margin-top: 14px;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-card-subtle);
          max-height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .search-user-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-card);
        }
        .search-user-item:last-child {
          border-bottom: none;
        }
        .user-text-col {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .user-name-txt {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .user-handle-txt {
          font-size: 12px;
          color: var(--text-muted);
        }
        .no-results-msg {
          padding: 16px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }
        .incoming-requests-card {
          border-left: 4px solid var(--kirti-red) !important;
        }
        .incoming-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
        }
        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .request-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--bg-card-subtle);
          border-radius: var(--radius-lg);
        }
        .req-btns {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .friends-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .friends-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .friends-title-group .card-heading {
          margin-bottom: 0;
        }
        .friends-header-sub {
          font-size: 12px;
          color: var(--text-muted);
        }
        .friends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }
        .friend-card-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .friend-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .friend-card-names {
          display: flex;
          flex-direction: column;
        }
        .friend-card-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .friend-card-username {
          font-size: 12px;
          color: var(--text-muted);
        }
        .friend-stats-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-card-subtle);
          padding: 8px;
          border-radius: var(--radius-md);
        }
        .stat-pill {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-num {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .stat-lbl {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
        }
        .friend-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }
        .view-profile-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: var(--kirti-red);
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
        }
        .remove-btn:hover {
          color: var(--error);
          background: var(--bg-card-subtle);
        }
      `}</style>
    </div>
  );
};
