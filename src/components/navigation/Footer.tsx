import React from 'react';
import { useStore } from '../../lib/store';
import { Compass, Users, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setSelectedZone, pandals } = useStore();

  return (
    <footer className="k-footer">
      <div className="footer-container">
        {/* Top Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & Tagline */}
          <div className="footer-brand-col">
            <div className="footer-logo-row" onClick={() => setActiveTab('discover')}>
              <span className="footer-logo-text">KIRTI</span>
              <span className="footer-logo-dot"></span>
              <span className="footer-bengali-mark">কীর্তি</span>
            </div>

            <p className="footer-tagline">
              The minimal, distraction-free social platform for discovering and rating Kolkata's Durga Puja pandals with friends.
            </p>

            <div className="footer-season-badge">
              <span className="season-live-dot"></span>
              <span>Kolkata Puja Season 2026 Live • {pandals.length} Masterpieces</span>
            </div>
          </div>

          {/* Column 2: Pandal Discovery Links */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">
              <Compass size={14} className="col-icon" />
              <span>Discovery</span>
            </h4>
            <ul className="footer-link-list">
              <li>
                <button
                  className="link-hover-underline"
                  onClick={() => { setActiveTab('discover'); setSelectedZone('all'); }}
                >
                  All 16 Masterpieces
                </button>
              </li>
              <li>
                <button
                  className="link-hover-underline"
                  onClick={() => { setActiveTab('discover'); setSelectedZone('South Kolkata'); }}
                >
                  South Kolkata Pandals
                </button>
              </li>
              <li>
                <button
                  className="link-hover-underline"
                  onClick={() => { setActiveTab('discover'); setSelectedZone('North Kolkata'); }}
                >
                  North Heritage Pandals
                </button>
              </li>
              <li>
                <button
                  className="link-hover-underline"
                  onClick={() => { setActiveTab('discover'); setSelectedZone('Salt Lake & East'); }}
                >
                  Salt Lake & East Kolkata
                </button>
              </li>
              <li>
                <button
                  className="link-hover-underline"
                  onClick={() => setActiveTab('map')}
                >
                  Interactive Pandal Map
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Social & Friends */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">
              <Users size={14} className="col-icon" />
              <span>Social Journey</span>
            </h4>
            <ul className="footer-link-list">
              <li>
                <button
                  className="link-hover-underline"
                  onClick={() => setActiveTab('friends')}
                >
                  Friend Leaderboard
                </button>
              </li>
              <li>
                <button
                  className="link-hover-underline"
                  onClick={() => setActiveTab('vote')}
                >
                  2026 Puja Awards & Voting
                </button>
              </li>
              <li>
                <button
                  className="link-hover-underline"
                  onClick={() => setActiveTab('profile')}
                >
                  My Visited Passport
                </button>
              </li>
              <li>
                <button
                  className="link-hover-underline"
                  onClick={() => setActiveTab('friends')}
                >
                  Find Puja Friends
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            <span>© 2026 KIRTI (কীর্তি). Built for Kolkata's Durga Puja.</span>
          </div>

          <div className="footer-crafted-by">
            <span>Crafted with</span>
            <Heart size={12} className="heart-icon" />
            <span>for art & culture explorers</span>
          </div>
        </div>
      </div>

      <style>{`
        .k-footer {
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          padding: 56px 20px 36px 20px;
          margin-top: 60px;
          color: var(--text-primary);
          transition: background-color 0.25s ease, border-color 0.25s ease;
        }
        @media (max-width: 768px) {
          .k-footer {
            padding: 40px 16px 110px 16px;
            margin-top: 40px;
          }
        }
        .footer-container {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }
        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .footer-logo-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .footer-logo-text {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text-primary);
        }
        .footer-logo-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          background-color: var(--kirti-red);
          border-radius: 50%;
          margin-bottom: 3px;
        }
        .footer-bengali-mark {
          font-size: 14px;
          font-weight: 700;
          color: var(--kirti-red);
          opacity: 0.9;
        }
        .footer-tagline {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 360px;
        }
        .footer-season-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
          width: fit-content;
        }
        .season-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--kirti-red);
          animation: pulse 1.5s infinite;
        }
        .footer-links-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-col-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
          gap: 12px;
        }
        .footer-link-list li {
          display: flex;
        }
        .link-hover-underline {
          position: relative;
          background: none;
          border: none;
          padding: 2px 0;
          font-size: 13px;
          font-family: var(--font-sans);
          color: var(--text-secondary);
          cursor: pointer;
          text-align: left;
          transition: color 0.2s ease;
          display: inline-block;
        }
        .link-hover-underline::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1.5px;
          background-color: var(--kirti-red);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .link-hover-underline:hover::after {
          transform: scaleX(1);
        }
        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 24px;
          border-top: 1px solid var(--border);
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
