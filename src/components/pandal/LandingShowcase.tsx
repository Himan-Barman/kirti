import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../lib/store';
import { PandalCard } from './PandalCard';
import { FriendJourneyCompare } from '../friends/FriendJourneyCompare';
import { Card, Badge, Button, Tabs } from '../ui';
import {
  Compass,
  Star,
  Users,
  MapPin,
  ArrowRight,
  Flame,
  Award,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import {
  DEFAULT_KOLKATA_CENTER,
  calculateDistanceKm,
  formatDistance,
  estimateWalkingTime
} from '../../lib/geo';
import type { GeoCoordinates } from '../../lib/geo';

const CURATED_TABS = [
  { id: 'trending', label: 'Trending Now', icon: <Flame size={14} /> },
  { id: 'top_rated', label: 'Top Rated', icon: <Award size={14} /> },
  { id: 'friends_popular', label: 'Friends Going', icon: <Users size={14} /> },
  { id: 'all', label: 'All Pandals', icon: <Compass size={14} /> },
];

export const LandingShowcase: React.FC = () => {
  const {
    pandals,
    setActiveTab,
    selectedZone,
    sortBy,
    searchQuery
  } = useStore();

  const [activeCuratedTab, setActiveCuratedTab] = useState<string>('trending');

  // User Geolocation for nearby landing section
  const [userLoc, setUserLoc] = useState<GeoCoordinates | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        () => {
          setUserLoc(DEFAULT_KOLKATA_CENTER);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      setUserLoc(DEFAULT_KOLKATA_CENTER);
    }
  }, []);

  const activeCoord = userLoc || DEFAULT_KOLKATA_CENTER;

  const nearbyLandingList = useMemo(() => {
    return [...pandals]
      .map((p) => ({
        ...p,
        distanceKm: calculateDistanceKm(
          activeCoord.latitude,
          activeCoord.longitude,
          p.latitude,
          p.longitude
        )
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [pandals, activeCoord]);

  const filteredPandals = pandals.filter(p => {
    const matchesZone = selectedZone === 'all' || p.zone === selectedZone;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.zone.toLowerCase().includes(q) ||
      (p.theme_year && p.theme_year.toLowerCase().includes(q));
    return matchesZone && matchesQuery;
  });

  // Limit curated showcase to exactly 3 focused cards
  const getCuratedPandals = () => {
    if (activeCuratedTab === 'trending') {
      return [...filteredPandals].sort((a, b) => b.visitCount - a.visitCount).slice(0, 3);
    }
    if (activeCuratedTab === 'top_rated') {
      return [...filteredPandals].sort((a, b) => b.avgRating - a.avgRating).slice(0, 3);
    }
    if (activeCuratedTab === 'friends_popular') {
      return [...filteredPandals].sort((a, b) => b.friendsVisitedCount - a.friendsVisitedCount).slice(0, 3);
    }
    // 'all' tab also shows top 3 with clear View All / Map options
    return [...filteredPandals].sort((a, b) => {
      if (sortBy === 'rating') return b.avgRating - a.avgRating;
      if (sortBy === 'friends') return b.friendsVisitedCount - a.friendsVisitedCount;
      if (sortBy === 'visits') return b.visitCount - a.visitCount;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    }).slice(0, 3);
  };

  const curatedList = getCuratedPandals();

  return (
    <div className="landing-container">
      {/* =========================================================================
          1. HERO SECTION: ULTRA-PREMIUM EDITORIAL
          ========================================================================= */}
      <section className="hero-section">
        {/* Luxury Hero Pavilion Stage with Divine Red & Gold Radiance */}
        <div className="hero-stage-pavilion">
          {/* Multi-layer atmospheric red & gold ambient illumination */}
          <div className="hero-ambient-glow" aria-hidden="true"></div>

          {/* Micro Starlight Festive Lattice Shimmer */}
          <div className="hero-starlight-grid" aria-hidden="true"></div>

          <div className="hero-content">
            {/* Centered Upper Red Badge */}
            <div className="hero-badge-wrap">
              <Badge variant="outline" size="md" rounded="full" className="hero-tag-badge">
                <span className="hero-dot"></span>
                <span>The Durga Puja Social Network</span>
              </Badge>
            </div>

            {/* Same Row: 3-line Headline & Bengali Kirti Typography */}
            <div className="hero-headline-row">
              <h1 className="hero-headline">
                Discover pandals.<br />
                <span className="hero-gold-shimmer">Rate authentic craft.</span><br />
                Track where friends go.
              </h1>

              <div className="hero-bengali-side-block" aria-hidden="true">
                <span className="hero-bengali-side-text">আবেশ</span>
              </div>
            </div>

            {/* Centered Explore Pandals & Interactive Map Buttons */}
            <div className="hero-actions">
              <Button
                variant="primary"
                size="lg"
                rounded="full"
                icon={<Compass size={17} />}
                onClick={() => {
                  const el = document.getElementById('curated-showcase');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Pandals
              </Button>

              <Button
                variant="outline"
                size="lg"
                rounded="full"
                icon={<MapPin size={17} />}
                onClick={() => setActiveTab('map')}
              >
                Interactive Map
              </Button>
            </div>
          </div>
        </div>

        {/* 3 Core Value Pillars with Rotating Animated Border */}
        <div className="pillars-grid">
          <Card variant="interactive" padding="md" rounded="xl" className="pillar-item">
            <div className="pillar-icon-box">
              <Star size={18} className="pillar-gold" />
            </div>
            <div className="pillar-text">
              <h4 className="pillar-title">5-Star Pandal Ratings</h4>
              <p className="pillar-sub">Community reviews on theme, clay work & lighting</p>
            </div>
          </Card>

          <Card variant="interactive" padding="md" rounded="xl" className="pillar-item">
            <div className="pillar-icon-box">
              <CheckCircle2 size={18} className="pillar-red" />
            </div>
            <div className="pillar-text">
              <h4 className="pillar-title">1-Tap Visit Passport</h4>
              <p className="pillar-sub">Instant check-ins to build your Puja journey history</p>
            </div>
          </Card>

          <Card variant="interactive" padding="md" rounded="xl" className="pillar-item">
            <div className="pillar-icon-box">
              <Users size={18} className="pillar-dark" />
            </div>
            <div className="pillar-text">
              <h4 className="pillar-title">Friend Circle Radar</h4>
              <p className="pillar-sub">Track which pandals your friends visited in real time</p>
            </div>
          </Card>
        </div>
      </section>

      {/* =========================================================================
          2. FRIEND PODIUM SECTION (TOP 3 & SMART RANKING ONLY)
          ========================================================================= */}
      <FriendJourneyCompare showTop3Only={true} />

      {/* =========================================================================
          3. CURATED PANDAL DISCOVERY SHOWCASE SECTION (SHOW ONLY 3 CARDS)
          ========================================================================= */}
      <section id="curated-showcase" className="showcase-section">
        {/* Centered Red Eyebrow Pill */}
        <div className="section-eyebrow-center-wrap">
          <div className="section-eyebrow">
            <Compass size={13} className="eyebrow-icon-red" />
            <span>CURATED DIRECTORY</span>
          </div>
        </div>

        {/* Left Heading & Right Filters in Same Row */}
        <div className="showcase-section-header">
          <h2 className="section-main-title">Iconic Kolkata Pandals</h2>

          {/* Curated Category Switcher Tabs */}
          <div className="curated-tabs-holder">
            <Tabs
              items={CURATED_TABS}
              activeId={activeCuratedTab}
              onChange={setActiveCuratedTab}
              variant="segmented"
              rounded="lg"
            />
          </div>
        </div>

        {/* 3 Pandals Grid */}
        {curatedList.length > 0 ? (
          <div className="showcase-grid">
            {curatedList.map(pandal => (
              <PandalCard key={pandal.id} pandal={pandal} />
            ))}
          </div>
        ) : (
          <Card variant="default" padding="lg" rounded="xl" className="empty-showcase">
            <p>No pandals match your current filter.</p>
          </Card>
        )}

        {/* View All & Map Button */}
        <div className="view-more-row">
          <Button
            variant="outline"
            size="md"
            rounded="full"
            icon={<MapPin size={15} />}
            iconRight={<ArrowRight size={14} />}
            onClick={() => setActiveTab('map')}
          >
            Explore All {pandals.length} Pandals
          </Button>
        </div>
      </section>

      {/* =========================================================================
          4. LOCAL AREA RADAR SECTION (TOP 3 NEAREST PANDALS)
          ========================================================================= */}
      <section className="showcase-section nearby-landing-section">
        {/* Centered Red Eyebrow Pill */}
        <div className="section-eyebrow-center-wrap">
          <div className="section-eyebrow">
            <Navigation size={13} className="eyebrow-icon-red" />
            <span>LOCAL AREA RADAR</span>
          </div>
        </div>

        {/* Left Heading */}
        <div className="showcase-section-header">
          <h2 className="section-main-title">Near You Now</h2>
        </div>

        {/* 3 Nearest Pandals Grid */}
        <div className="showcase-grid">
          {nearbyLandingList.map(pandal => {
            const distFormatted = formatDistance(pandal.distanceKm);
            const walkEst = estimateWalkingTime(pandal.distanceKm);

            return (
              <div key={pandal.id} className="nearby-card-container">
                <div className="distance-badge-overlay">
                  <div className="distance-pill">
                    <MapPin size={12} className="dist-icon" />
                    <span>{distFormatted}</span>
                  </div>
                  {walkEst && <span className="walk-pill">{walkEst}</span>}
                </div>
                <PandalCard pandal={pandal} />
              </div>
            );
          })}
        </div>

        {/* Full Radar View Button (Below the cards) */}
        <div className="view-more-row">
          <Button
            variant="outline"
            size="md"
            rounded="full"
            icon={<Navigation size={15} />}
            iconRight={<ArrowRight size={14} />}
            onClick={() => setActiveTab('nearby')}
          >
            Full Radar View
          </Button>
        </div>
      </section>

      <style>{`
        .nearby-card-container {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .distance-badge-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 15;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .distance-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #fff;
          font-size: 11.5px;
          font-weight: 700;
        }
        .dist-icon {
          color: var(--kirti-gold);
        }
        .walk-pill {
          padding: 4px 8px;
          border-radius: var(--radius-full);
          background: rgba(180, 35, 42, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
        }
        .landing-container {
          display: flex;
          flex-direction: column;
          gap: 140px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .landing-container {
            gap: 80px;
          }
        }
        .hero-section {
          position: relative;
          padding: 12px 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .hero-stage-pavilion {
          position: relative;
          padding: 32px 0 24px 0;
        }
        @media (max-width: 768px) {
          .hero-stage-pavilion {
            padding: 24px 0 16px 0;
          }
        }

        .hero-ambient-glow {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 100%;
          background: 
            /* Top Central Divine Golden Spotlight */
            radial-gradient(ellipse 70% 50% at 65% 0%, var(--hero-glow-gold) 0%, transparent 65%),
            /* Royal Vermilion Crimson on Left & Center */
            radial-gradient(ellipse 65% 55% at 20% 0%, var(--hero-glow-red) 0%, transparent 65%),
            /* Warm Amber Core */
            radial-gradient(circle 480px at 50% 15%, var(--hero-glow-amber) 0%, transparent 65%),
            /* Bottom Deep Festive Floor Mist */
            radial-gradient(ellipse 80% 45% at 50% 90%, var(--hero-glow-deep) 0%, transparent 80%);
          pointer-events: none;
          z-index: 0;
          filter: blur(35px);
          opacity: 0.95;
          animation: festiveAuraBreathe 10s ease-in-out infinite alternate;
        }
        @keyframes festiveAuraBreathe {
          0% { opacity: 0.88; transform: translateX(-50%) scale(0.98); }
          100% { opacity: 1; transform: translateX(-50%) scale(1.02); }
        }
        .hero-starlight-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(251, 191, 36, 0.16) 1.2px, transparent 1.2px);
          background-size: 30px 30px;
          mask-image: radial-gradient(ellipse 75% 65% at 50% 15%, black 25%, transparent 85%);
          -webkit-mask-image: radial-gradient(ellipse 75% 65% at 50% 15%, black 25%, transparent 85%);
          pointer-events: none;
          z-index: 0;
          opacity: 0.65;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .hero-badge-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .hero-tag-badge {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
          box-shadow: 0 0 16px rgba(225, 29, 72, 0.15);
        }
        .hero-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--kirti-red);
          margin-right: 4px;
          box-shadow: 0 0 8px var(--kirti-red);
        }

        .hero-headline-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          width: 100%;
          margin: 4px 0;
        }
        .hero-headline {
          font-size: 52px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.08;
          letter-spacing: -0.04em;
          text-align: left;
          margin: 0;
          flex: 1;
        }
        .hero-gold-shimmer {
          background: linear-gradient(135deg, #FFF9EB 15%, #FBBF24 55%, #F87171 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          text-shadow: 0 0 35px rgba(251, 191, 36, 0.28);
        }
        [data-theme="light"] .hero-gold-shimmer {
          background: linear-gradient(135deg, #B91C1C 0%, #D97706 60%, #991B1B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: none;
        }

        .hero-bengali-side-block {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          user-select: none;
          pointer-events: none;
          overflow: visible;
        }
        .hero-bengali-side-text {
          font-family: 'Tiro Bangla', serif;
          font-size: 135px;
          font-weight: 400;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.32) 0%, rgba(225, 29, 72, 0.24) 65%, transparent 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 35px rgba(245, 158, 11, 0.18));
          line-height: 1.45;
          display: inline-block;
          letter-spacing: 0.02em;
          padding: 30px 14px 14px 14px;
          margin-top: -20px;
          overflow: visible;
        }

        [data-theme="light"] .hero-ambient-glow {
          background: 
            radial-gradient(ellipse 70% 50% at 70% -5%, rgba(245, 158, 11, 0.08) 0%, transparent 65%),
            radial-gradient(ellipse 65% 55% at 20% -5%, rgba(220, 38, 38, 0.10) 0%, transparent 65%),
            radial-gradient(circle 420px at 50% 15%, rgba(251, 191, 36, 0.06) 0%, transparent 65%);
          filter: blur(35px);
        }
        [data-theme="dark"] .hero-ambient-glow {
          background: 
            radial-gradient(ellipse 75% 55% at 70% -10%, rgba(245, 158, 11, 0.20) 0%, transparent 65%),
            radial-gradient(ellipse 70% 60% at 18% -10%, rgba(225, 29, 72, 0.25) 0%, transparent 65%),
            radial-gradient(circle 500px at 50% 15%, rgba(251, 191, 36, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 90% 50% at 50% 90%, rgba(159, 18, 57, 0.12) 0%, transparent 80%);
          filter: blur(40px);
        }

        @media (max-width: 900px) {
          .hero-headline-row {
            gap: 16px;
          }
          .hero-headline {
            font-size: 38px;
            line-height: 1.12;
          }
          .hero-bengali-side-text {
            font-size: 90px;
            padding-top: 20px;
          }
        }
        @media (max-width: 650px) {
          .hero-headline-row {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 6px;
          }
          .hero-headline {
            font-size: 28px;
            text-align: center;
          }
          .hero-bengali-side-text {
            font-size: 64px;
            padding-top: 15px;
          }
        }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 14px;
          flex-wrap: wrap;
          width: 100%;
        }
        @media (max-width: 480px) {
          .hero-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .hero-actions > * {
            width: 100%;
            justify-content: center;
          }
        }
        .meta-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 5px 12px;
          border-radius: var(--radius-full);
          backdrop-filter: blur(8px);
        }
        .meta-gold { color: var(--kirti-gold); }
        .meta-red { color: var(--kirti-red); }
        .meta-muted { color: var(--text-muted); }

        .pillars-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 4px;
        }
        @media (max-width: 768px) {
          .pillars-grid {
            display: none !important;
          }
        }
        .pillar-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pillar-item:active {
          transform: scale(0.98);
        }
        .pillar-icon-box {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pillar-gold { color: var(--kirti-gold); }
        .pillar-red { color: var(--kirti-red); }
        .pillar-dark { color: var(--text-primary); }
        .pillar-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .pillar-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .pillar-sub {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.45;
        }

        .showcase-section {
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
        .showcase-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          width: 100%;
        }
        .section-head-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 6px;
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
          color: var(--kirti-red);
          width: fit-content;
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
        .curated-tabs-holder {
          display: flex;
          align-items: center;
          max-width: 100%;
          overflow-x: auto;
        }
        @media (max-width: 768px) {
          .showcase-section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .curated-tabs-holder {
            width: 100%;
            scrollbar-width: none;
          }
          .curated-tabs-holder::-webkit-scrollbar {
            display: none;
          }
          .section-main-title {
            font-size: 20px;
          }
        }
        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          width: 100%;
        }
        @media (max-width: 900px) {
          .showcase-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }
        }
        @media (max-width: 650px) {
          .showcase-grid {
            grid-template-columns: minmax(0, 1fr);
            max-width: 360px;
            margin: 0 auto;
            gap: 18px;
          }
        }
        .empty-showcase {
          text-align: center;
          color: var(--text-muted);
        }
        .view-more-row {
          display: flex;
          justify-content: center;
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
};
