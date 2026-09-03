import React from 'react';
import { useStore } from '../../lib/store';
import { 
  Compass, 
  Heart, 
  Award, 
  Sparkles, 
  ArrowUp, 
  Sun, 
  Moon, 
  ChevronRight
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
              <span className="tagline-phrase">
                <span>Discover</span>
                <span className="footer-logo-dot tagline-brand-dot"></span>
                <span>Rate</span>
                <span className="footer-logo-dot tagline-brand-dot"></span>
                <span>Explore</span>
                <span className="footer-logo-dot tagline-brand-dot"></span>
                <span>Connect</span>
              </span>
              <br />
              <span className="tagline-sub">Your digital companion for the Puja journey.</span>
            </p>
          </div>

          {/* Column 2: Explore Pandals (Left Aligned on Mobile) */}
          <div className="footer-links-col footer-col-explore">
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

          {/* Column 3: Community & Awards (Right Aligned on Mobile) */}
          <div className="footer-links-col footer-col-community">
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
            <span>© 2026 KIRTI কীর্তি . Durga Puja Discovery & Community</span>
          </div>

          <div className="footer-crafted-by">
            <span>Made with <Heart size={12} className="heart-icon" /> for every Puja memory, every discovery, every journey.</span>
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
        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          flex-direction: column;
          gap: 36px;
          box-sizing: border-box;
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
        @media (max-width: 768px) {
          .k-footer {
            padding: 32px 0 96px 0;
            margin-top: 60px;
            border-top: 1px solid var(--border);
          }
          .footer-container {
            padding: 0 20px;
            gap: 28px;
            align-items: center;
          }
          .footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px 16px;
            width: 100%;
          }
          .footer-brand-col {
            grid-column: 1 / -1;
            align-items: center !important;
            text-align: center !important;
            margin-bottom: 6px;
          }
          .footer-logo-row {
            justify-content: center !important;
            margin: 0 auto !important;
          }
          .footer-tagline {
            text-align: center !important;
            margin: 0 auto !important;
            max-width: 340px !important;
          }
          .footer-col-explore {
            grid-column: 1;
            align-items: flex-start !important;
            text-align: left !important;
          }
          .footer-col-explore .footer-col-header {
            justify-content: flex-start !important;
          }
          .footer-col-explore .footer-link-list {
            align-items: flex-start !important;
            text-align: left !important;
            width: 100% !important;
          }
          .footer-col-explore .footer-link-list li {
            justify-content: flex-start !important;
            width: 100% !important;
          }
          .footer-col-explore .footer-nav-btn {
            justify-content: flex-start !important;
            text-align: left !important;
          }
          .footer-col-explore .footer-nav-btn .btn-arrow {
            display: none !important;
          }
          .footer-col-explore .footer-count-badge {
            margin-left: 6px !important;
          }

          .footer-col-community {
            grid-column: 2;
            align-items: flex-end !important;
            text-align: right !important;
          }
          .footer-col-community .footer-col-header {
            justify-content: flex-end !important;
          }
          .footer-col-community .footer-link-list {
            align-items: flex-end !important;
            text-align: right !important;
            width: 100% !important;
          }
          .footer-col-community .footer-link-list li {
            justify-content: flex-end !important;
            width: 100% !important;
          }
          .footer-col-community .footer-nav-btn {
            justify-content: flex-end !important;
            text-align: right !important;
          }
          .footer-col-community .footer-nav-btn .btn-arrow {
            display: none !important;
          }
          .footer-col-community .footer-action-badge {
            margin-left: 6px !important;
          }

          .footer-action-col {
            display: none !important;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            gap: 8px !important;
          }
          .footer-copyright {
            text-align: center !important;
          }
          .footer-crafted-by {
            justify-content: center !important;
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
          font-size: 20px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }
        @media (max-width: 768px) {
          .footer-logo-text {
            font-size: 18px;
          }
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
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 360px;
          margin: 0;
        }
        .tagline-phrase {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--text-primary);
        }
        .tagline-brand-dot {
          margin: 0 7px 0 7px !important;
          margin-bottom: 2px !important;
          vertical-align: middle;
        }
        .tagline-sub {
          display: inline-block;
          margin-top: 2px;
          color: var(--text-secondary);
          font-size: 13px;
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

