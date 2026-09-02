import React from 'react';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { SearchPopup, Avatar } from '../ui';
import { Compass, Users, Award, MapPin, Sun, Moon, Search, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    pandals,
    pendingIncomingRequests,
    theme,
    toggleTheme
  } = useStore();
  const { user } = useAuth();

  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const visitedCount = pandals.filter(p => p.userVisited).length;

  return (
    <header className="k-header">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="brand-group" onClick={() => setActiveTab('discover')}>
          <div className="logo-badge">
            <span className="logo-text">KIRTI</span>
            <span className="logo-dot"></span>
          </div>
          <span className="logo-bengali-mark">কীর্তি</span>
        </div>

        {/* Global SearchBar with Instant Dropdown Popup (Desktop) */}
        <div className="header-search">
          <SearchPopup placeholder="Search pandals, artists, locations, themes..." />
        </div>

        {/* Right Nav Actions */}
        <div className="header-right-actions">
          {/* Mobile Search Toggle Button */}
          <button
            className="mobile-search-toggle"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            title="Search"
            aria-label="Search"
          >
            {isMobileSearchOpen ? <X size={16} /> : <Search size={16} />}
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
            className="theme-toggle-btn"
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
              className={`profile-pill ${activeTab === 'profile' ? 'active' : ''}`}
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
              className="auth-submit-btn"
              style={{ padding: '6px 14px', margin: 0, height: '36px', width: 'auto', fontSize: '14px', borderRadius: '20px' }}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Drawer */}
      {isMobileSearchOpen && (
        <div className="mobile-search-bar-drawer">
          <SearchPopup placeholder="Search pandals, artists, locations..." />
        </div>
      )}

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
        .mobile-search-bar-drawer {
          padding: 8px 14px 12px 14px;
          background: var(--bg-header);
          border-top: 1px solid var(--border-subtle);
          animation: searchDrawerSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes searchDrawerSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .brand-group {
          display: flex;
          align-items: baseline;
          gap: 8px;
          cursor: pointer;
          user-select: none;
          flex-shrink: 0;
        }
        .logo-badge {
          display: flex;
          align-items: center;
          position: relative;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text-primary);
        }
        @media (max-width: 768px) {
          .logo-text {
            font-size: 20px;
          }
        }
        .logo-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          background-color: var(--kirti-red);
          border-radius: 50%;
          margin-left: 2px;
          margin-bottom: 3px;
        }
        .logo-bengali-mark {
          font-size: 14px;
          font-weight: 700;
          color: var(--kirti-red);
          opacity: 0.9;
          letter-spacing: 0.05em;
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
        }
        .theme-toggle-btn:hover {
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
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
        }
        .profile-pill:hover {
          border-color: var(--border-focus);
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
      `}</style>
    </header>
  );
};
