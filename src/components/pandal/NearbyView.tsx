import React, { useState, useMemo } from 'react';
import { useStore } from '../../lib/store';
import { Button } from '../ui';
import {
  Navigation,
  MapPin,
  Compass,
  AlertCircle,
  Footprints,
  SlidersHorizontal,
  Star,
  Check,
  X,
  ChevronRight
} from 'lucide-react';
import {
  DEFAULT_KOLKATA_CENTER,
  calculateDistanceKm,
  formatDistance,
  estimateWalkingTime
} from '../../lib/geo';
import type { PandalWithStats } from '../../types/database.types';

export const NearbyView: React.FC = () => {
  const {
    pandals,
    userLocation,
    setSelectedPandal,
    setActiveTab,
    setMapHighlightPandalId,
    setShowRouteOnMap,
    setMapRadiusKm,
    showToast
  } = useStore();

  const [radiusFilter, setRadiusFilter] = useState<string>('5');
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(7);
  const [tempCustomInput, setTempCustomInput] = useState<string>('7');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

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

  // Current active radius limit
  const activeRadiusLimit = useMemo(() => {
    if (radiusFilter === 'all') return Infinity;
    if (radiusFilter.startsWith('custom_')) {
      const customVal = parseFloat(radiusFilter.replace('custom_', ''));
      return isNaN(customVal) ? 7 : customVal;
    }
    const parsed = parseFloat(radiusFilter);
    return isNaN(parsed) ? 5 : parsed;
  }, [radiusFilter]);

  // Filter based on selected radius
  const filteredPandals = useMemo(() => {
    return pandalsWithDistance.filter((p) => p.distanceKm <= activeRadiusLimit);
  }, [pandalsWithDistance, activeRadiusLimit]);

  // Preview count for custom modal
  const previewCustomCount = useMemo(() => {
    const dist = parseFloat(tempCustomInput);
    if (isNaN(dist) || dist <= 0) return 0;
    return pandalsWithDistance.filter((p) => p.distanceKm <= dist).length;
  }, [pandalsWithDistance, tempCustomInput]);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'custom') {
      setTempCustomInput(customDistanceKm.toString());
      setIsCustomModalOpen(true);
      return;
    }
    setRadiusFilter(tabId);
  };

  const applyCustomDistance = () => {
    const val = parseFloat(tempCustomInput);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid positive distance in km', 'error');
      return;
    }
    setCustomDistanceKm(val);
    setRadiusFilter(`custom_${val}`);
    setIsCustomModalOpen(false);
    showToast(`Distance filter set to within ${val} km`, 'success');
  };

  const handleShowOnMap = (pandal: PandalWithStats) => {
    setMapHighlightPandalId(pandal.id);
    setShowRouteOnMap(true);
    setMapRadiusKm(activeRadiusLimit === Infinity ? null : activeRadiusLimit);
    setSelectedPandal(pandal);
    setActiveTab('map');
  };

  const isCustomActive = radiusFilter.startsWith('custom_');

  const RADIUS_TABS = [
    { id: '2', label: 'Within 2 km', icon: <Footprints size={14} /> },
    { id: '5', label: 'Within 5 km', icon: <Navigation size={14} /> },
    { id: '10', label: 'Within 10 km', icon: <Compass size={14} /> },
    {
      id: 'custom',
      label: isCustomActive ? `Custom (${customDistanceKm} km)` : 'Custom...',
      icon: <SlidersHorizontal size={14} />
    }
  ];

  return (
    <div className="nearby-view-container">
      {/* Distance Radius Filter Tabs Bar */}
      <div className="nearby-filter-header-row">
        <div className="nearby-filter-pills-scroll">
          {RADIUS_TABS.map((tab) => {
            const isActive = tab.id === radiusFilter || (tab.id === 'custom' && isCustomActive);
            return (
              <button
                key={tab.id}
                type="button"
                className={`nearby-pill-btn beam-interactive ${isActive ? 'is-active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <span className="nearby-count-pill">
          {filteredPandals.length} Pandals Found
        </span>
      </div>

      {/* List of Nearby Pandals in Horizontal Compact Bar Layout */}
      {filteredPandals.length > 0 ? (
        <div className="nearby-pandal-bars-list">
          {filteredPandals.map((pandal) => {
            const distFormatted = formatDistance(pandal.distanceKm);
            const walkEst = estimateWalkingTime(pandal.distanceKm);

            return (
              <div
                key={pandal.id}
                className="nearby-pandal-bar beam-interactive"
                onClick={() => setSelectedPandal(pandal)}
              >
                {/* Pandal Thumbnail Image with left spacing */}
                <img
                  src={pandal.image_url}
                  alt={pandal.name}
                  className="nearby-bar-thumb"
                  loading="lazy"
                />

                {/* Middle Info Column */}
                <div className="nearby-bar-info">
                  {/* Row 1: Name */}
                  <h3 className="nearby-bar-name" title={pandal.name}>
                    {pandal.name}
                  </h3>

                  {/* Row 2: Distance & Walking Time Badges */}
                  <div className="nearby-bar-meta-row">
                    <span className="nearby-dist-badge">
                      <Navigation size={11} className="dist-icon" />
                      {distFormatted}
                    </span>
                    {walkEst && (
                      <span className="nearby-walk-badge">
                        <Footprints size={11} />
                        {walkEst}
                      </span>
                    )}
                    <span className="nearby-rating-badge">
                      <Star size={11} className="text-gold" />
                      {pandal.avgRating.toFixed(1)}
                    </span>
                  </div>

                  {/* Row 3: Address / Location */}
                  {pandal.address && (
                    <p className="nearby-bar-address" title={pandal.address}>
                      {pandal.address}
                    </p>
                  )}
                </div>

                {/* Right Side: Show on Map Route Button */}
                <button
                  type="button"
                  className="nearby-show-map-btn beam-interactive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowOnMap(pandal);
                  }}
                  title={`View route to ${pandal.name} on Interactive Map`}
                  aria-label="Show on Map"
                >
                  <MapPin size={14} className="text-red" />
                  <span>Show Map</span>
                  <ChevronRight size={13} className="chevron-arrow" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="nearby-empty-card">
          <AlertCircle size={36} className="text-muted" />
          <h3 className="empty-title">
            No Pandals Found Within {isCustomActive ? `${customDistanceKm} km` : `${radiusFilter} km`}
          </h3>
          <p className="empty-sub">
            Try expanding your custom radius to a higher distance or select 10 km to see more pandals.
          </p>
          <Button
            variant="primary"
            size="md"
            rounded="full"
            onClick={() => {
              setTempCustomInput('25');
              setCustomDistanceKm(25);
              setRadiusFilter('custom_25');
            }}
          >
            Expand to 25 km
          </Button>
        </div>
      )}

      {/* =======================================================================
          CUSTOM DISTANCE POPUP MODAL
          ======================================================================= */}
      {isCustomModalOpen && (
        <div className="custom-dist-modal-overlay" onClick={() => setIsCustomModalOpen(false)}>
          <div className="custom-dist-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-wrap">
                <SlidersHorizontal size={18} className="text-red" />
                <h3 className="modal-title">Custom Distance Filter</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setIsCustomModalOpen(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <p className="modal-desc-text">
              Enter any distance in kilometers from your current location to discover pandals.
            </p>

            {/* Numeric Distance Input */}
            <div className="custom-input-group">
              <label className="input-field-label">Distance (in Kilometers)</label>
              <div className="custom-km-input-wrap">
                <input
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  className="custom-km-input"
                  value={tempCustomInput}
                  onChange={(e) => setTempCustomInput(e.target.value)}
                  placeholder="e.g. 7.5"
                  autoFocus
                />
                <span className="km-unit-badge">KM</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="quick-presets-group">
              <span className="presets-label">Quick Distance Presets:</span>
              <div className="preset-buttons-row">
                {['1', '3', '7', '12', '18', '25', '40'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`preset-pill-btn ${tempCustomInput === preset ? 'active' : ''}`}
                    onClick={() => setTempCustomInput(preset)}
                  >
                    {preset} km
                  </button>
                ))}
              </div>
            </div>

            {/* Realtime Match Preview */}
            <div className="match-preview-pill">
              <MapPin size={13} className="text-red" />
              <span>
                <strong>{previewCustomCount} pandals</strong> found within{' '}
                {tempCustomInput || 0} km of your position
              </span>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions-row">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setIsCustomModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-proceed-btn beam-interactive"
                onClick={applyCustomDistance}
              >
                <Check size={16} />
                <span>Apply Distance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nearby-view-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 8px 16px 80px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: nearbyFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 768px) {
          .nearby-view-container {
            padding: 8px 12px 90px 12px;
            gap: 14px;
          }
        }

        /* Filter Header Row */
        .nearby-filter-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .nearby-filter-pills-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
          flex: 1;
        }
        .nearby-filter-pills-scroll::-webkit-scrollbar {
          display: none;
        }

        .nearby-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .nearby-pill-btn:hover {
          color: var(--text-primary);
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
        }
        .nearby-pill-btn.is-active {
          background: var(--text-primary);
          color: var(--bg-card);
          border-color: var(--text-primary);
          font-weight: 700;
        }

        .nearby-count-pill {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          white-space: nowrap;
        }

        /* Horizontal Pandal Bar Layout */
        .nearby-pandal-bars-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .nearby-pandal-bar {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          gap: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          min-height: 78px;
          cursor: pointer;
          box-sizing: border-box;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .nearby-pandal-bar:hover {
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
          transform: translateY(-1px);
        }
        .nearby-pandal-bar:active {
          transform: scale(0.99);
        }

        .nearby-bar-thumb {
          width: 60px;
          height: 60px;
          min-width: 60px;
          max-width: 60px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
          background: var(--bg-card-subtle);
          margin-left: 2px;
        }

        .nearby-bar-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .nearby-bar-name {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nearby-bar-meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .nearby-dist-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          background: rgba(180, 35, 42, 0.12);
          border: 1px solid rgba(180, 35, 42, 0.25);
          color: var(--kirti-red);
          font-size: 11px;
          font-weight: 700;
        }
        .dist-icon {
          color: var(--kirti-red);
        }

        .nearby-walk-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 600;
        }

        .nearby-rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .nearby-bar-address {
          font-size: 11.5px;
          color: var(--text-muted);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nearby-show-map-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 13px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .nearby-show-map-btn:hover {
          background: var(--text-primary);
          color: var(--bg-app);
          border-color: var(--text-primary);
          transform: translateY(-1px);
        }
        .nearby-show-map-btn:active {
          transform: scale(0.95);
        }
        .chevron-arrow {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }
        .nearby-show-map-btn:hover .chevron-arrow {
          color: var(--bg-app);
          transform: translateX(2px);
        }

        @media (max-width: 600px) {
          .nearby-pandal-bar {
            padding: 8px 10px;
            gap: 10px;
            min-height: 72px;
          }
          .nearby-bar-thumb {
            width: 54px;
            height: 54px;
            min-width: 54px;
            max-width: 54px;
          }
          .nearby-show-map-btn {
            padding: 6px 10px;
            font-size: 11.5px;
          }
          .nearby-show-map-btn span {
            display: none;
          }
          .nearby-show-map-btn::after {
            content: "Map";
          }
        }

        .nearby-empty-card {
          padding: 44px 24px;
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
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .empty-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        /* Custom Distance Modal */
        .custom-dist-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: modalFadeIn 0.2s ease;
        }
        .custom-dist-modal-content {
          width: 100%;
          max-width: 440px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-2xl);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          animation: modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .modal-title {
          font-size: 17px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .modal-close-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .modal-close-icon-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-focus);
        }

        .modal-desc-text {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.45;
        }

        .custom-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-field-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .custom-km-input-wrap {
          display: flex;
          align-items: center;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 4px 14px;
          transition: border-color 0.2s ease;
        }
        .custom-km-input-wrap:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(180, 35, 42, 0.15);
        }
        .custom-km-input {
          flex: 1;
          height: 44px;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 700;
        }
        .km-unit-badge {
          font-size: 13px;
          font-weight: 800;
          color: var(--kirti-red);
          background: rgba(180, 35, 42, 0.1);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }

        .quick-presets-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .presets-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .preset-buttons-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .preset-pill-btn {
          padding: 5px 12px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .preset-pill-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-focus);
        }
        .preset-pill-btn.active {
          background: var(--kirti-red);
          color: #fff;
          border-color: var(--kirti-red);
          font-weight: 700;
        }

        .match-preview-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(180, 35, 42, 0.08);
          border: 1px solid rgba(180, 35, 42, 0.2);
          border-radius: var(--radius-lg);
          font-size: 12.5px;
          color: var(--text-primary);
        }

        .modal-actions-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }
        .modal-cancel-btn {
          flex: 1;
          height: 42px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .modal-cancel-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-focus);
        }
        .modal-proceed-btn {
          flex: 2;
          height: 42px;
          border-radius: var(--radius-full);
          background: var(--kirti-red);
          border: none;
          color: #fff;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(180, 35, 42, 0.4);
          transition: all 0.15s ease;
        }
        .modal-proceed-btn:hover {
          filter: brightness(1.1);
        }

        @keyframes nearbyFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
