import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { SearchPopup, Avatar } from '../ui';
import {
  Compass,
  Navigation,
  Users,
  Award,
  MapPin,
  Sun,
  Moon,
  Search,
  Vote,
  TrendingUp,
  ChevronDown,
  Check,
  RotateCw
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    voteActiveView,
    setVoteActiveView,
    currentUser,
    pandals,
    pendingIncomingRequests,
    theme,
    toggleTheme,
    isLocationRefreshing,
    refreshUserLocation
  } = useStore();
  const { user } = useAuth();

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isVoteDropdownOpen, setIsVoteDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsVoteDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute total visited count
  const visitedCount = pandals.filter(p => p.userVisited).length;

  return (
    <header className="k-header">
      <div className="header-container">
        {isMobileSearchOpen ? (
          <div className="mobile-search-full-bar">
            <SearchPopup
              placeholder="Search pandals, locations, themes..."
              autoFocus={true}
              showCloseAlways={true}
              onClose={() => setIsMobileSearchOpen(false)}
            />
          </div>
        ) : (
          <div className="header-inner-row">
            {/* Brand Logo */}
            <div className="brand-group" onClick={() => setActiveTab('discover')}>
              <span className="logo-text">aabesh</span>
            </div>

            {/* Global SearchBar with Instant Dropdown Popup (Desktop) */}
            <div className="header-search">
              <SearchPopup placeholder="Search pandals, artists, locations, themes..." />
            </div>

            {/* Right Nav Actions */}
            <div className="header-right-actions">
              {/* Mobile Vote View Dropdown (Shown on mobile when on Vote tab) */}
              {activeTab === 'vote' && (
                <div className="mobile-vote-view-dropdown-container" ref={dropdownRef}>
                  <button
                    type="button"
                    className="mobile-vote-view-trigger-btn beam-interactive"
                    onClick={() => setIsVoteDropdownOpen(!isVoteDropdownOpen)}
                    aria-label="Switch Vote View"
                  >
                    {voteActiveView === 'cast_vote' ? (
                      <>
                        <Vote size={14} className="text-red" />
                        <span>Vote</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp size={14} className="text-gold" />
                        <span>Rankings</span>
                      </>
                    )}
                    <ChevronDown size={14} className={`dropdown-arrow ${isVoteDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {/* Dropdown Popup */}
                  {isVoteDropdownOpen && (
                    <div className="vote-view-dropdown-popup">
                      <button
                        type="button"
                        className={`vote-dropdown-item ${voteActiveView === 'cast_vote' ? 'active' : ''}`}
                        onClick={() => {
                          setVoteActiveView('cast_vote');
                          setIsVoteDropdownOpen(false);
                        }}
                      >
                        <div className="item-left-content">
                          <Vote size={15} className="text-red" />
                          <span>Vote</span>
                        </div>
                        {voteActiveView === 'cast_vote' && <Check size={14} className="dropdown-check" />}
                      </button>

                      <button
                        type="button"
                        className={`vote-dropdown-item ${voteActiveView === 'pandals_ranking' ? 'active' : ''}`}
                        onClick={() => {
                          setVoteActiveView('pandals_ranking');
                          setIsVoteDropdownOpen(false);
                        }}
                      >
                        <div className="item-left-content">
                          <TrendingUp size={15} className="text-gold" />
                          <span>Rankings</span>
                        </div>
                        {voteActiveView === 'pandals_ranking' && <Check size={14} className="dropdown-check" />}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Nearby Refresh Button (Shown on mobile when on Nearby tab) */}
              {activeTab === 'nearby' && (
                <button
                  type="button"
                  className="mobile-nearby-refresh-btn beam-interactive"
                  onClick={refreshUserLocation}
                  disabled={isLocationRefreshing}
                  title="Refresh GPS Coordinates"
                  aria-label="Refresh GPS Location"
                >
                  <RotateCw size={14} className={`text-red ${isLocationRefreshing ? 'spin-anim' : ''}`} />
                  <span>Refresh</span>
                </button>
              )}

              {/* Mobile Search Toggle Button (Hidden on mobile when on Vote, Map or Nearby tab) */}
              <button
                className={`mobile-search-toggle ${activeTab === 'vote' || activeTab === 'map' || activeTab === 'nearby' ? 'mobile-hide-on-vote' : ''}`}
                onClick={() => setIsMobileSearchOpen(true)}
                title="Search"
                aria-label="Open search bar"
              >
                <Search size={16} />
              </button>

              {/* Navigation Tabs (Desktop) */}
              <nav className="desktop-nav">
                <button
                  className={`nav-link ${activeTab === 'discover' ? 'active' : ''}`}
                  onClick={() => setActiveTab('discover')}
                >
                  <Compass size={16} />
                  <span>Discover</span>
                </button>

                <button
                  className={`nav-link ${activeTab === 'nearby' ? 'active' : ''}`}
                  onClick={() => setActiveTab('nearby')}
                >
                  <Navigation size={16} />
                  <span>Nearby</span>
                </button>

                <button
                  className={`nav-link ${activeTab === 'map' ? 'active' : ''}`}
                  onClick={() => setActiveTab('map')}
                >
                  <MapPin size={16} />
                  <span>Map</span>
                </button>

                {user && (
                  <button
                    className={`nav-link ${activeTab === 'friends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('friends')}
                  >
                    <Users size={16} />
                    <span>Friends</span>
                    {pendingIncomingRequests.length > 0 && (
                      <span className="badge-count">{pendingIncomingRequests.length}</span>
                    )}
                  </button>
                )}

                <button
                  className={`nav-link ${activeTab === 'vote' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vote')}
                >
                  <Award size={16} />
                  <span>Vote</span>
                </button>
              </nav>

              {/* Theme Toggle Button */}
              <button
                className={`theme-toggle-btn ${activeTab === 'vote' || activeTab === 'map' || activeTab === 'nearby' ? 'mobile-hide-on-vote' : ''}`}
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={17} className="theme-sun-icon" />
                ) : (
                  <Moon size={17} className="theme-moon-icon" />
                )}
              </button>

              {/* User Profile / Login */}
              {user ? (
                <button
                  className={`profile-pill ${activeTab === 'profile' ? 'active' : ''} ${activeTab === 'vote' || activeTab === 'map' || activeTab === 'nearby' ? 'mobile-hide-on-vote' : ''}`}
                  onClick={() => setActiveTab('profile')}
                  title="My Puja Passport"
                >
                  <Avatar src={currentUser.avatar_url} alt={currentUser.display_name} size="xs" />
                  <span className="nav-journey-badge">
                    <span className="journey-dot"></span>
                    {visitedCount} Visited
                  </span>
                </button>
              ) : (
                <button
                  className={`auth-submit-btn ${activeTab === 'vote' || activeTab === 'map' || activeTab === 'nearby' ? 'mobile-hide-on-vote' : ''}`}
                  style={{ padding: '6px 14px', margin: 0, height: '36px', width: 'auto', fontSize: '14px', borderRadius: '20px' }}
                  onClick={() => setActiveTab('signup')}
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .k-header {
          position: sticky;
          top: 0;
          z-index: 900;
          background: var(--bg-header);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          width: 100%;
          transition: background-color 0.25s ease, border-color 0.25s ease;
        }
        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .header-container {
            height: 56px;
            padding: 0 14px;
            gap: 10px;
          }
        }
        .header-inner-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 20px;
          animation: navbarRowFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 768px) {
          .header-inner-row {
            gap: 10px;
          }
        }
        .mobile-search-full-bar {
          width: 100%;
          display: flex;
          align-items: center;
          animation: mobileSearchExpand 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mobile-search-full-bar .ui-search-popup-container {
          width: 100%;
          max-width: 100%;
        }
        .mobile-search-full-bar .search-bar-wrap {
          width: 100%;
          height: 42px;
          background: var(--bg-card);
          border: 1px solid var(--border-focus);
          border-radius: var(--radius-full);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        @keyframes mobileSearchExpand {
          from {
            opacity: 0;
            transform: scale(0.96) translateX(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }
        @keyframes navbarRowFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .mobile-search-toggle {
          display: none;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .mobile-search-toggle:active {
          transform: scale(0.92);
        }
        .mobile-search-toggle:hover {
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
        }
        @media (max-width: 900px) {
          .mobile-search-toggle {
            display: flex;
          }
        }
        .brand-group {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
          flex-shrink: 0;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
        }
        .brand-group:hover {
          opacity: 0.92;
          transform: translateY(-0.5px);
        }
        .logo-text {
          font-family: var(--font-brand);
          font-size: 32px;
          line-height: 1;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: var(--text-primary);
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          margin-top: -2px;
        }
        @media (max-width: 768px) {
          .logo-text {
            font-size: 27px;
          }
        }
        .logo-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          background: linear-gradient(135deg, #DC2626, var(--kirti-red));
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(180, 35, 42, 0.45);
          margin-top: 4px;
        }
        .logo-bengali-mark {
          font-family: var(--font-brand-bengali);
          font-size: 20px;
          font-weight: 400;
          color: var(--kirti-red);
          letter-spacing: 0.01em;
          opacity: 0.95;
          margin-top: -1px;
        }
        .header-search {
          flex: 1;
          max-width: 380px;
        }
        @media (max-width: 900px) {
          .header-search {
            display: none;
          }
        }
        .header-right-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
        }
        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
        }
        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-card-subtle);
          border-color: var(--border);
        }
        .nav-link.active {
          color: var(--text-primary);
          background: var(--bg-card-subtle);
          border-color: var(--border);
          font-weight: 700;
        }
        .badge-count {
          background: var(--kirti-red);
          color: white;
          font-size: 10px;
          font-weight: 700;
          border-radius: var(--radius-full);
          padding: 1px 6px;
          margin-left: 2px;
        }
        .theme-toggle-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .theme-toggle-btn:hover {
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
        }
        .theme-toggle-btn:active {
          transform: scale(0.92);
        }
        .theme-sun-icon {
          color: var(--kirti-gold);
        }
        .theme-moon-icon {
          color: var(--text-primary);
        }
        .profile-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px 4px 5px;
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          background: var(--bg-card);
          cursor: pointer;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .profile-pill:hover {
          border-color: var(--border-focus);
        }
        .profile-pill:active {
          transform: scale(0.95);
        }
        .profile-pill.active {
          border-color: var(--kirti-red);
        }
        .nav-journey-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .journey-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--kirti-red);
        }

        /* Mobile Nearby Refresh Button (Mobile-only: hidden on desktop/laptop) */
        .mobile-nearby-refresh-btn {
          position: relative;
          display: none;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .mobile-nearby-refresh-btn:hover {
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
        }
        .mobile-nearby-refresh-btn:active {
          transform: scale(0.96);
        }
        @media (max-width: 768px) {
          .mobile-nearby-refresh-btn {
            display: inline-flex;
          }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Mobile Vote View Dropdown (Mobile-only: hidden on desktop/laptop) */
        .mobile-vote-view-dropdown-container {
          position: relative;
          display: none;
          align-items: center;
        }
        @media (max-width: 768px) {
          .mobile-vote-view-dropdown-container {
            display: flex;
          }
        }
        .mobile-vote-view-trigger-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .mobile-vote-view-trigger-btn:hover {
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
        }
        .mobile-vote-view-trigger-btn:active {
          transform: scale(0.96);
        }
        .dropdown-arrow {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }
        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .vote-view-dropdown-popup {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 175px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 6px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 1050;
          animation: votePopupFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes votePopupFadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .vote-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 12px;
          border-radius: var(--radius-lg);
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          width: 100%;
          text-align: left;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .vote-dropdown-item:hover {
          background: var(--bg-card-subtle);
        }
        .vote-dropdown-item.active {
          background: rgba(180, 35, 42, 0.1);
          color: var(--kirti-red);
          font-weight: 700;
        }
        .item-left-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dropdown-check {
          color: var(--kirti-red);
        }

        @media (max-width: 768px) {
          .mobile-hide-on-vote {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
