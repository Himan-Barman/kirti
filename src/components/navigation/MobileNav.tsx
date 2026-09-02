import React from 'react';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { Compass, MapPin, Users, Award, User, UserPlus } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, pendingIncomingRequests } = useStore();
  const { user } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <button
        className={`mobile-nav-btn ${activeTab === 'discover' ? 'active' : ''}`}
        onClick={() => setActiveTab('discover')}
      >
        <div className="nav-icon-wrap">
          <Compass size={19} />
        </div>
        <span>Discover</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'map' ? 'active' : ''}`}
        onClick={() => setActiveTab('map')}
      >
        <div className="nav-icon-wrap">
          <MapPin size={19} />
        </div>
        <span>Map</span>
      </button>

      {user && (
        <button
          className={`mobile-nav-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <div className="nav-icon-wrap">
            <Users size={19} />
            {pendingIncomingRequests.length > 0 && (
              <span className="mobile-badge">{pendingIncomingRequests.length}</span>
            )}
          </div>
          <span>Friends</span>
        </button>
      )}

      <button
        className={`mobile-nav-btn ${activeTab === 'vote' ? 'active' : ''}`}
        onClick={() => setActiveTab('vote')}
      >
        <div className="nav-icon-wrap">
          <Award size={19} />
        </div>
        <span>Vote</span>
      </button>

      {user ? (
        <button
          className={`mobile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <div className="nav-icon-wrap">
            <User size={19} />
          </div>
          <span>Profile</span>
        </button>
      ) : (
        <button
          className={`mobile-nav-btn ${activeTab === 'signup' ? 'active' : ''}`}
          onClick={() => setActiveTab('signup')}
        >
          <div className="nav-icon-wrap">
            <UserPlus size={19} />
          </div>
          <span>Sign Up</span>
        </button>
      )}

      <style>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(62px + env(safe-area-inset-bottom, 0px));
          background: var(--bg-header);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid var(--border);
          z-index: 1000;
          align-items: flex-start;
          justify-content: space-around;
          padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px)) 8px;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
          }
        }
        .mobile-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-size: 10.5px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          -webkit-tap-highlight-color: transparent;
        }
        .mobile-nav-btn:hover,
        .mobile-nav-btn.active {
          color: var(--text-primary);
        }
        .mobile-nav-btn.active .nav-icon-wrap {
          color: var(--kirti-red);
          transform: translateY(-1px);
        }
        .nav-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.18s ease;
        }
        .mobile-badge {
          position: absolute;
          top: -3px;
          right: -6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--kirti-red);
          border: 1.5px solid var(--bg-header);
        }
      `}</style>
    </nav>
  );
};
