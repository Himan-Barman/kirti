import React from 'react';
import { useStore } from '../../lib/store';
import { 
  Compass, 
  Heart, 
  MapPin, 
  Award, 
  Sparkles, 
  ArrowUp, 
  Sun, 
  Moon, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setSelectedZone, pandals, theme, toggleTheme } = useStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: any, zone?: string) => {
    if (zone) {
      setSelectedZone(zone);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="k-footer">
      <div className="footer-container">
        {/* Main Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & Identity */}
          <div className="footer-brand-col">
            <div className="footer-logo-row" onClick={() => handleNavigate('discover')}>
              <span className="footer-logo-text">KIRTI</span>
              <span className="footer-logo-dot"></span>
              <span className="footer-bengali-mark">কীর্তি</span>
            </div>

            <p className="footer-tagline">
              Minimalist discovery, statistical ranking, and friend check-in platform for Kolkata's Durga Puja.
            </p>

            <div className="footer-meta-chips">
              <span className="footer-chip">
                <MapPin size={12} className="chip-icon-red" />
                <span>Kolkata • 2026</span>
              </span>
              <span className="footer-chip">
                <ShieldCheck size={12} className="chip-icon-gold" />
                <span>Fair Scoring</span>
              </span>
            </div>
          </div>

          {/* Column 2: Explore Pandals */}
          <div className="footer-links-col">
            <div className="footer-col-header">
              <Compass size={15} className="col-icon" />
              <span>Explore</span>
            </div>
            <ul className="footer-link-list">
              <li>
                <button
                  className="footer-nav-btn"
                  onClick={() => handleNavigate('discover', 'all')}
                >
                  <ChevronRight size={13} className="btn-arrow" />
                  <span>All Pandals</span>
                  <span className="footer-count-badge">{pandals.length || 16}</span>
                </button>
              </li>
              <li>
                <button
                  className="footer-nav-btn"
                  onClick={() => handleNavigate('discover', 'South Kolkata')}
                >
                  <ChevronRight size={13} className="btn-arrow" />
                  <span>South Kolkata</span>
                </button>
              </li>
              <li>
                <button
                  className="footer-nav-btn"
                  onClick={() => handleNavigate('discover', 'North Kolkata')}
                >
                  <ChevronRight size={13} className="btn-arrow" />
                  <span>North Heritage</span>
                </button>
              </li>
              <li>
                <button
                  className="footer-nav-btn"
                  onClick={() => handleNavigate('discover', 'Salt Lake & East')}
                >
                  <ChevronRight size={13} className="btn-arrow" />
                  <span>East & Salt Lake</span>
                </button>
              </li>
              <li>
                <button
                  className="footer-nav-btn"
                  onClick={() => handleNavigate('map')}
                >
                  <ChevronRight size={13} className="btn-arrow" />
                  <span>Live Radar Map</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Community & Awards */}
          <div className="footer-links-col">
            <div className="footer-col-header">
              <Award size={15} className="col-icon" />
              <span>Community</span>
            </div>
            <ul className="footer-link-list">
              <li>
                <button
                  className="footer-nav-btn highlight-item"
                  onClick={() => handleNavigate('vote')}
                >
                  <ChevronRight size={13} className="btn-arrow" />
                  <span>Puja Awards</span>
                  <span className="footer-action-badge">VOTE</span>
                </button>
              </li>
              <li>
                <button
                  className="footer-nav-btn"
                  onClick={() => handleNavigate('friends')}
                >
                  <ChevronRight size={13} className="btn-arrow" />
                  <span>Leaderboard</span>
                </button>
              </li>
              <li>
                <button
                  className="footer-nav-btn"
                  onClick={() => handleNavigate('profile')}
                >
                  <ChevronRight size={13} className="btn-arrow" />
                  <span>Visit Passport</span>
                </button>
              </li>
              <li>
                <button
                  className="footer-nav-btn"
                  onClick={() => handleNavigate('activity')}
                >
                  <ChevronRight size={13} className="btn-arrow" />
                  <span>Live Activity</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Utilities & Actions */}
          <div className="footer-links-col footer-action-col">
            <div className="footer-col-header">
              <Sparkles size={15} className="col-icon" />
              <span>Preferences</span>
            </div>
            <div className="footer-utility-box">
              <button 
                className="footer-utility-btn" 
                onClick={toggleTheme}
                title="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={14} className="util-icon sun-icon" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="util-icon moon-icon" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <button 
                className="footer-utility-btn" 
                onClick={scrollToTop}
                title="Back to Top"
              >
                <ArrowUp size={14} className="util-icon" />
                <span>Back to Top</span>
              </button>
            </div>
          </div>
        </div>

        {/* Divider Bar with subtle gradient glow */}
        <div className="footer-divider-wrap">
          <div className="footer-divider-line"></div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            <span>© 2026 KIRTI (কীর্তি) • Durga Puja Discovery & Rating</span>
          </div>

          <div className="footer-crafted-by">
            <span>Crafted with</span>
            <Heart size={12} className="heart-icon" />
            <span>for Kolkata art & culture explorers</span>
          </div>
        </div>
      </div>

      <style>{`
        .k-footer {
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          padding: 48px 0 32px 0;
          margin-top: 110px;
          color: var(--text-primary);
          transition: background-color 0.25s ease, border-color 0.25s ease;
          position: relative;
        }
        @media (max-width: 768px) {
          .k-footer {
            padding: 32px 0 96px 0;
            margin-top: 60px;
            border-top: none;
          }
        }
        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          flex-direction: column;
          gap: 36px;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .footer-container {
            padding: 0 16px;
            gap: 28px;
          }
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 0.9fr;
          gap: 36px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-logo-row {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          cursor: pointer;
          user-select: none;
          width: fit-content;
        }
        .footer-logo-text {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text-primary);
        }
        .footer-logo-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: var(--kirti-red);
          border-radius: 50%;
          margin-bottom: 2px;
        }
        .footer-bengali-mark {
          font-family: 'Tiro Bangla', serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--kirti-red);
          opacity: 0.95;
        }
        .footer-tagline {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.55;
          max-width: 320px;
          margin: 0;
        }
        .footer-meta-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .footer-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .chip-icon-red {
          color: var(--kirti-red);
        }
        .chip-icon-gold {
          color: var(--kirti-gold);
        }

        .footer-links-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-col-header {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-primary);
        }
        .col-icon {
          color: var(--kirti-red);
        }
        .footer-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .footer-link-list li {
          display: flex;
        }
        .footer-nav-btn {
          background: transparent;
          border: none;
          padding: 6px 0;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text-secondary);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          width: 100%;
          border-radius: var(--radius-sm);
        }
        .btn-arrow {
          color: var(--text-muted);
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .footer-nav-btn:hover {
          color: var(--text-primary);
          transform: translateX(4px);
        }
        .footer-nav-btn:hover .btn-arrow {
          opacity: 1;
          transform: translateX(0);
          color: var(--kirti-red);
        }
        .footer-nav-btn:active {
          transform: scale(0.97);
        }

        .footer-count-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-muted);
          margin-left: auto;
        }

        .footer-action-badge {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          background: rgba(180, 35, 42, 0.15);
          border: 1px solid rgba(180, 35, 42, 0.35);
          color: var(--kirti-red);
          margin-left: auto;
          box-shadow: 0 0 8px rgba(180, 35, 42, 0.2);
        }

        .footer-utility-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .footer-utility-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--text-secondary);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }
        .footer-utility-btn:hover {
          background: var(--bg-card);
          border-color: var(--text-muted);
          color: var(--text-primary);
          transform: translateY(-1px);
        }
        .footer-utility-btn:active {
          transform: scale(0.97);
        }
        .util-icon {
          color: var(--text-muted);
        }
        .sun-icon {
          color: var(--kirti-gold);
        }
        .moon-icon {
          color: var(--kirti-red);
        }

        .footer-divider-wrap {
          width: 100%;
          height: 1px;
          background: var(--border);
          position: relative;
        }
        .footer-divider-line {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(180, 35, 42, 0.3) 30%, 
            rgba(251, 191, 36, 0.25) 50%, 
            rgba(180, 35, 42, 0.3) 70%, 
            transparent 100%
          );
        }

        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-crafted-by {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .heart-icon {
          color: var(--kirti-red);
          fill: var(--kirti-red);
        }
      `}</style>
    </footer>
  );
};

