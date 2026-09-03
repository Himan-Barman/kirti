import React, { useState, useMemo } from 'react';
import { useStore } from '../../lib/store';
import { Button, Tabs } from '../ui';
import {
  Navigation,
  MapPin,
  Compass,
  AlertCircle,
  Footprints,
  SlidersHorizontal,
  Star,
  Check,
  X
} from 'lucide-react';
import {
  DEFAULT_KOLKATA_CENTER,
  calculateDistanceKm,
  formatDistanceShort,
  estimateWalkingTimeShort
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
  const [customInputVal, setCustomInputVal] = useState<string>('7');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

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

  const activeRadiusLimit = useMemo(() => {
    if (radiusFilter === 'all') return Infinity;
    if (radiusFilter.startsWith('custom_')) {
      const customVal = parseFloat(radiusFilter.replace('custom_', ''));
      return isNaN(customVal) ? 7 : customVal;
    }
    const parsed = parseFloat(radiusFilter);
    return isNaN(parsed) ? 5 : parsed;
  }, [radiusFilter]);

  const filteredPandals = useMemo(() => {
    return pandalsWithDistance.filter((p) => p.distanceKm <= activeRadiusLimit);
  }, [pandalsWithDistance, activeRadiusLimit]);

  const customMatchedCount = useMemo(() => {
    const val = parseFloat(customInputVal);
    if (isNaN(val) || val <= 0) return 0;
    return pandalsWithDistance.filter((p) => p.distanceKm <= val).length;
  }, [pandalsWithDistance, customInputVal]);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'custom') {
      setCustomInputVal(customDistanceKm.toString());
      setIsCustomModalOpen(true);
      return;
    }
    setRadiusFilter(tabId);
  };

  const handleApplyCustom = () => {
    const val = parseFloat(customInputVal);
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
    setSelectedPandal(null);
    setMapHighlightPandalId(pandal.id);
    setShowRouteOnMap(true);
    setMapRadiusKm(activeRadiusLimit === Infinity ? null : activeRadiusLimit);
    setActiveTab('map');
  };

  const isCustomActive = radiusFilter.startsWith('custom_');
  const activeTabId = isCustomActive ? 'custom' : radiusFilter;

  const RADIUS_TABS = [
    { 
      id: '2', 
      label: 'Within 2 km', 
      icon: <Footprints size={14} />,
      count: radiusFilter === '2' ? filteredPandals.length : undefined 
    },
    { 
      id: '5', 
      label: 'Within 5 km', 
      icon: <Navigation size={14} />,
      count: radiusFilter === '5' ? filteredPandals.length : undefined 
    },
    { 
      id: '10', 
      label: 'Within 10 km', 
      icon: <Compass size={14} />,
      count: radiusFilter === '10' ? filteredPandals.length : undefined 
    },
    {
      id: 'custom',
      label: isCustomActive ? `Custom (${customDistanceKm} km)` : 'Custom...',
      icon: <SlidersHorizontal size={14} />,
      count: isCustomActive ? filteredPandals.length : undefined
    }
  ];

  return (
    <div className="nearby-view-container">
      <div className="category-tabs-wrap" style={{ overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        <Tabs
          variant="pills"
          activeId={activeTabId}
          onChange={(id) => handleTabChange(id)}
          items={RADIUS_TABS}
        />
      </div>

      {filteredPandals.length > 0 ? (
        <div className="nearby-pandal-bars-list">
          {filteredPandals.map((pandal) => {
            const distFormatted = formatDistanceShort(pandal.distanceKm);
            const walkEst = estimateWalkingTimeShort(pandal.distanceKm);

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

                {/* Middle Info Column: Exactly 3 Rows */}
                <div className="nearby-bar-info">
                  {/* Row 1: Pandal Name */}
                  <h3 className="nearby-bar-name" title={pandal.name}>
                    {pandal.name}
                  </h3>

                  {/* Row 2: Distance & Walk Time (Without 'away' and 'walk') */}
                  <div className="nearby-bar-row2">
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
                  </div>

                  {/* Row 3: Rating & Address */}
                  <div className="nearby-bar-row3">
                    <span className="nearby-rating-badge">
                      <Star size={11} className="text-gold fill-gold" />
                      {pandal.avgRating.toFixed(1)}
                    </span>
                    {pandal.address && (
                      <>
                        <span className="nearby-dot-sep">•</span>
                        <span className="nearby-bar-address" title={pandal.address}>
                          {pandal.address}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Side: Location (Map Page) Button */}
                <button
                  type="button"
                  className="nearby-location-btn beam-interactive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowOnMap(pandal);
                  }}
                  title={`View ${pandal.name} on Map`}
                  aria-label="View on Map"
                >
                  <MapPin size={14} className="location-pin-icon" />
                  <span>Location</span>
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
              setCustomInputVal('25');
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
                  value={customInputVal}
                  onChange={(e) => setCustomInputVal(e.target.value)}
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
                    className={`preset-pill-btn ${customInputVal === preset ? 'active' : ''}`}
                    onClick={() => setCustomInputVal(preset)}
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
                <strong>{customMatchedCount} pandals</strong> found within{' '}
                {customInputVal || 0} km of your position
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
                onClick={handleApplyCustom}
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
            padding: 8px 16px 90px 16px;
            gap: 14px;
          }
        }

        /* Filter Header Row */
        .nearby-filter-header-row {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
          width: 100%;
        }
        .nearby-filter-header-row::-webkit-scrollbar {
          display: none;
        }

        .nearby-filter-pills-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          flex: 1;
        }
        .nearby-filter-pills-scroll::-webkit-scrollbar {
          display: none;
        }

        .nearby-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.18s ease;
          font-family: var(--font-sans);
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .nearby-pill-btn:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }
        .nearby-pill-btn.is-active {
          background: var(--text-primary);
          color: var(--bg-app);
          border-color: var(--text-primary);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          font-weight: 700;
        }

        .nearby-pill-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: var(--radius-full);
          background: var(--kirti-red);
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          line-height: 1;
          margin-left: 4px;
          box-shadow: 0 2px 6px rgba(180, 35, 42, 0.4);
          animation: badgePopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes badgePopIn {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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
        }
        .nearby-pandal-bar:hover {
          background: var(--bg-card-subtle);
          border-color: transparent !important;
          box-shadow: 0 0 16px var(--beam-glow-color) !important;
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
          gap: 3px;
          flex: 1;
          min-width: 0;
        }

        /* Row 1: Name */
        .nearby-bar-name {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.25;
        }

        /* Row 2: Distance & Walk Time */
        .nearby-bar-row2 {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap;
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
          white-space: nowrap;
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
          white-space: nowrap;
        }

        /* Row 3: Rating & Address */
        .nearby-bar-row3 {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--text-muted);
          min-width: 0;
          overflow: hidden;
        }

        .nearby-rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .nearby-dot-sep {
          color: var(--text-muted);
          opacity: 0.6;
          font-size: 10px;
          flex-shrink: 0;
        }

        .nearby-bar-address {
          font-size: 11.5px;
          color: var(--text-muted);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
          flex: 1;
        }

        /* Right Side: Location Button */
        .nearby-location-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .nearby-location-btn:hover {
          background: var(--text-primary);
          color: var(--bg-app);
          border-color: var(--text-primary);
          transform: translateY(-1px);
        }
        .nearby-location-btn:active {
          transform: scale(0.95);
        }
        .location-pin-icon {
          color: var(--kirti-red);
          transition: color 0.15s ease;
        }
        .nearby-location-btn:hover .location-pin-icon {
          color: var(--bg-app);
        }

        @media (max-width: 600px) {
          .nearby-pandal-bar {
            padding: 9px 10px;
            gap: 10px;
            min-height: 74px;
          }
          .nearby-bar-thumb {
            width: 56px;
            height: 56px;
            min-width: 56px;
            max-width: 56px;
          }
          .nearby-location-btn {
            padding: 6px 10px;
            font-size: 11.5px;
            gap: 4px;
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
