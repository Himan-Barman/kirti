import React, { useState, useMemo } from 'react';
import { useStore } from '../../lib/store';
import { PandalCard } from './PandalCard';
import { Tabs, Button } from '../ui';
import {
  Navigation,
  LocateFixed,
  MapPin,
  Compass,
  AlertCircle,
  Footprints,
  RotateCw,
  Layers
} from 'lucide-react';
import {
  DEFAULT_KOLKATA_CENTER,
  calculateDistanceKm,
  formatDistance,
  estimateWalkingTime
} from '../../lib/geo';

export const NearbyView: React.FC = () => {
  const {
    pandals,
    userLocation,
    locationStatus,
    isLocationRefreshing,
    refreshUserLocation
  } = useStore();

  const [radiusFilter, setRadiusFilter] = useState<string>('5');

  // Compute distances for all pandals relative to userLocation or DEFAULT_KOLKATA_CENTER
  const activeCoord = userLocation || DEFAULT_KOLKATA_CENTER;

  const pandalsWithDistance = useMemo(() => {
    return pandals.map((p) => {
      const distance = calculateDistanceKm(
        activeCoord.latitude,
        activeCoord.longitude,
        p.latitude,
        p.longitude
      );
      return {
        ...p,
        distanceKm: distance
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [pandals, activeCoord]);

  // Filter based on selected radius
  const filteredPandals = useMemo(() => {
    if (radiusFilter === 'all') return pandalsWithDistance;
    const maxRadius = parseFloat(radiusFilter);
    return pandalsWithDistance.filter((p) => p.distanceKm <= maxRadius);
  }, [pandalsWithDistance, radiusFilter]);

  const RADIUS_TABS = [
    { id: '2', label: 'Within 2 km', icon: <Footprints size={14} /> },
    { id: '5', label: 'Within 5 km', icon: <Navigation size={14} /> },
    { id: '10', label: 'Within 10 km', icon: <Compass size={14} /> },
    { id: 'all', label: 'All Kolkata', icon: <Layers size={14} /> }
  ];

  return (
    <div className="nearby-view-container">
      {/* Live GPS Radar Card (Page heading removed as requested) */}
      <div className="gps-radar-card beam-interactive">
        <div className="radar-left">
          <div className="radar-pulse-box">
            <LocateFixed size={20} className="radar-icon" />
            <span className="radar-wave wave-1"></span>
            <span className="radar-wave wave-2"></span>
          </div>

          <div className="radar-text-group">
            <div className="radar-status-title">
              {locationStatus === 'granted' ? (
                <span className="status-granted">
                  Live GPS Active • Sorting by Proximity
                </span>
              ) : locationStatus === 'requesting' ? (
                <span className="status-requesting">
                  Calibrating Satellite Proximity...
                </span>
              ) : locationStatus === 'denied' ? (
                <span className="status-fallback">
                  Location Access Denied • Centered on Central Kolkata
                </span>
              ) : (
                <span className="status-default">
                  Kolkata Heritage Proximity Radar
                </span>
              )}
            </div>

            <p className="radar-subtext">
              {locationStatus === 'granted'
                ? `Accurate to your device coordinates (${activeCoord.latitude.toFixed(3)}°N, ${activeCoord.longitude.toFixed(3)}°E)`
                : 'Showing nearest pandals calculated from Kolkata Central (Esplanade / Park Street).'}
            </p>
          </div>
        </div>

        <button
          className="gps-refresh-btn beam-interactive"
          onClick={refreshUserLocation}
          disabled={isLocationRefreshing}
          title="Refresh GPS Coordinates"
        >
          <RotateCw size={15} className={isLocationRefreshing ? 'spin-anim' : ''} />
          <span>{locationStatus === 'granted' ? 'Refresh GPS' : 'Enable Location'}</span>
        </button>
      </div>

      {/* Distance Radius Filter Tabs */}
      <div className="nearby-filter-row">
        <Tabs
          variant="pills"
          activeId={radiusFilter}
          onChange={setRadiusFilter}
          items={RADIUS_TABS}
        />
        <span className="nearby-count-pill">
          {filteredPandals.length} Pandals Found
        </span>
      </div>

      {/* Grid of Nearby Pandals */}
      {filteredPandals.length > 0 ? (
        <div className="nearby-grid">
          {filteredPandals.map((pandal) => {
            const distFormatted = formatDistance(pandal.distanceKm);
            const walkEst = estimateWalkingTime(pandal.distanceKm);

            return (
              <div key={pandal.id} className="nearby-card-wrapper">
                {/* Distance Overlay Ribbon */}
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
      ) : (
        <div className="nearby-empty-card">
          <AlertCircle size={36} className="text-muted" />
          <h3 className="empty-title">No Pandals Found Within {radiusFilter} km</h3>
          <p className="empty-sub">
            Try expanding your distance radius to 10 km or All Kolkata to see more iconic masterpieces.
          </p>
          <Button
            variant="primary"
            size="md"
            rounded="full"
            onClick={() => setRadiusFilter('all')}
          >
            Show All Kolkata Pandals
          </Button>
        </div>
      )}

      <style>{`
        .nearby-view-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 20px 80px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: nearbyFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 768px) {
          .nearby-view-container {
            padding: 16px 14px 90px 14px;
            gap: 18px;
          }
        }

        .nearby-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nearby-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(180, 35, 42, 0.12);
          border: 1px solid rgba(180, 35, 42, 0.3);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          color: var(--kirti-red);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          width: fit-content;
        }
        .live-radar-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--kirti-red);
          animation: radarPulseDot 1.5s infinite;
        }
        @keyframes radarPulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.4; }
        }

        .nearby-title-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          flex-wrap: wrap;
        }
        .nearby-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }
        @media (max-width: 768px) {
          .nearby-title {
            font-size: 22px;
          }
        }
        .nearby-bengali {
          font-family: var(--font-bengali);
          font-size: 20px;
          font-weight: 700;
          color: var(--kirti-gold);
        }

        /* GPS Radar Card */
        .gps-radar-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-2xl);
          gap: 16px;
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .gps-radar-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        .radar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .radar-pulse-box {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background: rgba(180, 35, 42, 0.12);
          border: 1px solid rgba(180, 35, 42, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--kirti-red);
        }
        .radar-wave {
          position: absolute;
          inset: -4px;
          border-radius: var(--radius-full);
          border: 1px solid var(--kirti-red);
          opacity: 0;
          animation: radarWaveExpand 2s infinite cubic-bezier(0.25, 1, 0.5, 1);
        }
        .wave-2 {
          animation-delay: 1s;
        }
        @keyframes radarWaveExpand {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .radar-text-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .radar-status-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .status-granted { color: #10b981; }
        .status-requesting { color: var(--kirti-gold); }
        .status-fallback { color: var(--text-secondary); }

        .radar-subtext {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
        }

        .gps-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .gps-refresh-btn:hover {
          background: var(--text-primary);
          color: var(--bg-app);
          transform: scale(1.03);
        }
        .gps-refresh-btn:active {
          transform: scale(0.95);
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }

        /* Filter Row */
        .nearby-filter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .nearby-count-pill {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-muted);
        }

        /* Grid */
        .nearby-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        @media (max-width: 640px) {
          .nearby-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }

        .nearby-card-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
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
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
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
          background: rgba(180, 35, 42, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
        }

        .nearby-empty-card {
          padding: 48px 24px;
          text-align: center;
          background: var(--bg-card);
          border: 1px dashed var(--border);
          border-radius: var(--radius-2xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          max-width: 500px;
          margin: 32px auto;
        }
        .empty-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .empty-sub {
          font-size: 13.5px;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        @keyframes nearbyFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
