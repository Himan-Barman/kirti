import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Search, X, Star, Users } from 'lucide-react';
import { Badge } from './Badge';

export interface SearchPopupProps {
  className?: string;
  placeholder?: string;
}

export const SearchPopup: React.FC<SearchPopupProps> = ({
  className = '',
  placeholder = 'Search pandals, locations, themes...'
}) => {
  const {
    searchQuery,
    setSearchQuery,
    pandals,
    friends,
    setSelectedPandal,
    setSelectedFriendProfile,
    setActiveTab
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = searchQuery.toLowerCase().trim();

  const matchingPandals = q
    ? pandals.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q) ||
        (p.theme_year && p.theme_year.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  const matchingFriends = q
    ? friends.filter(f =>
        f.display_name.toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const totalResults = matchingPandals.length + matchingFriends.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectPandal = (pandal: any) => {
    setSelectedPandal(pandal);
    setIsOpen(false);
  };

  const handleSelectFriend = (friend: any) => {
    setSelectedFriendProfile(friend);
    setIsOpen(false);
  };

  return (
    <div className={`ui-search-popup-container ${className}`} ref={containerRef}>
      {/* Search Input Bar */}
      <div className={`search-bar-wrap ${isOpen && q ? 'has-popup' : ''}`}>
        <Search size={15} className="search-icon" />
        <input
          type="text"
          className="search-field-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Animated Dropdown Popup Results */}
      {isOpen && q.length > 0 && (
        <div className="search-dropdown-menu">
          <div className="dropdown-header">
            <span className="results-label">
              Search Results ({totalResults})
            </span>
            <button
              className="view-all-link"
              onClick={() => {
                setActiveTab('discover');
                setIsOpen(false);
              }}
            >
              Filter Discover Grid →
            </button>
          </div>

          <div className="dropdown-body">
            {totalResults > 0 ? (
              <>
                {/* Pandals Group */}
                {matchingPandals.length > 0 && (
                  <div className="result-group">
                    <div className="group-title">
                      <span>Pandals ({matchingPandals.length})</span>
                    </div>
                    {matchingPandals.map((pandal) => (
                      <div
                        key={pandal.id}
                        className="pandal-search-row"
                        onClick={() => handleSelectPandal(pandal)}
                      >
                        <img src={pandal.image_url} alt={pandal.name} className="pandal-row-thumb" />
                        <div className="pandal-row-info">
                          <h5 className="pandal-row-name">{pandal.name}</h5>
                          <div className="pandal-row-sub">
                            <span className="pandal-row-zone">{pandal.zone}</span>
                            <span className="pandal-row-dot">•</span>
                            <span className="pandal-row-rating">
                              <Star size={11} className="gold-star" /> {pandal.avgRating}
                            </span>
                          </div>
                        </div>
                        {pandal.userVisited && (
                          <Badge variant="red" size="sm" rounded="full">
                            Visited
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Friends Group */}
                {matchingFriends.length > 0 && (
                  <div className="result-group">
                    <div className="group-title">
                      <Users size={12} />
                      <span>Friends ({matchingFriends.length})</span>
                    </div>
                    {matchingFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="friend-search-row"
                        onClick={() => handleSelectFriend(friend)}
                      >
                        <img src={friend.avatar_url} alt={friend.display_name} className="friend-row-avatar" />
                        <div className="friend-row-info">
                          <span className="friend-row-name">{friend.display_name}</span>
                          <span className="friend-row-handle">@{friend.username}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="no-search-results">
                <p>No pandals or friends matching "<strong>{searchQuery}</strong>"</p>
                <span className="no-subtext">Try searching "North", "Ballygunge", "Salt Lake" or a theme</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .ui-search-popup-container {
          position: relative;
          width: 100%;
          font-family: var(--font-sans);
        }
        .search-bar-wrap {
          display: flex;
          align-items: center;
          position: relative;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
        }
        .search-bar-wrap:focus-within, .search-bar-wrap.has-popup {
          background: var(--bg-card);
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(180, 35, 42, 0.14);
        }
        .search-icon {
          margin-left: 14px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .search-field-input {
          flex: 1;
          padding: 9px 12px;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text-primary);
        }
        .search-field-input::placeholder {
          color: var(--text-muted);
        }
        .search-clear-btn {
          margin-right: 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: var(--radius-full);
          transition: all 0.15s ease;
        }
        .search-clear-btn:hover {
          color: var(--text-primary);
          background: var(--border);
        }
        .search-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          min-width: 360px;
          background: var(--bg-dropdown);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-float);
          backdrop-filter: blur(16px);
          z-index: 1050;
          overflow: hidden;
          animation: searchPopupEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 600px) {
          .search-dropdown-menu {
            min-width: 300px;
            left: -20px;
            right: -20px;
          }
        }
        .dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: var(--bg-card-subtle);
          border-bottom: 1px solid var(--border);
        }
        .results-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .view-all-link {
          background: none;
          border: none;
          font-size: 11px;
          font-weight: 700;
          color: var(--kirti-red);
          cursor: pointer;
        }
        .view-all-link:hover {
          text-decoration: underline;
        }
        .dropdown-body {
          max-height: 380px;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .result-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .group-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          padding: 4px 8px;
          text-transform: uppercase;
        }
        .pandal-search-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pandal-search-row:hover {
          background: var(--bg-card-hover);
        }
        .pandal-row-thumb {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          object-fit: cover;
          flex-shrink: 0;
        }
        .pandal-row-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        .pandal-row-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pandal-row-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .pandal-row-dot {
          opacity: 0.5;
        }
        .pandal-row-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          font-weight: 700;
          color: var(--kirti-gold);
        }
        .gold-star {
          fill: var(--kirti-gold);
        }
        .friend-search-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 10px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .friend-search-row:hover {
          background: var(--bg-card-hover);
        }
        .friend-row-avatar {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-full);
          object-fit: cover;
        }
        .friend-row-info {
          display: flex;
          flex-direction: column;
        }
        .friend-row-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .friend-row-handle {
          font-size: 11px;
          color: var(--text-muted);
        }
        .no-search-results {
          padding: 24px 16px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .no-subtext {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          color: var(--text-muted);
        }
        @keyframes searchPopupEnter {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
