import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useStore } from '../../lib/store';
import L from 'leaflet';
import {
  Search,
  SlidersHorizontal,
  X,
  Navigation,
  Sparkles,
  Vote,
  TrendingUp,
  ChevronDown,
  Building2,
  Map,
  Compass
} from 'lucide-react';
import {
  DEFAULT_KOLKATA_CENTER,
  calculateDistanceKm,
  formatDistance,
  estimateWalkingTime
} from '../../lib/geo';
import {
  WEST_BENGAL_DISTRICTS,
  WEST_BENGAL_CITIES,
  KOLKATA_ZONES,
  HERITAGE_OPTIONS,
  PASSPORT_STATUS_OPTIONS,
  SORT_OPTIONS
} from '../../data/filterOptions';

export const PandalMap: React.FC = () => {
  const {
    pandals,
    setSelectedPandal,
    selectedPandal,
    userLocation,
    mapHighlightPandalId,
    setMapHighlightPandalId,
    showRouteOnMap,
    setShowRouteOnMap,
    mapRadiusKm,
    setMapRadiusKm,
    theme
  } = useStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [mapSearch, setMapSearch] = useState('');
  const mapSearchInputRef = useRef<HTMLInputElement>(null);

  // Dedicated Slide-Over Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedHeritage, setSelectedHeritage] = useState<string>('all');
  const [selectedVisitedFilter, setSelectedVisitedFilter] = useState<'all' | 'unvisited' | 'visited'>('all');
  const [selectedSort, setSelectedSort] = useState<'rating' | 'ratingCount' | 'name'>('rating');

  // Expand / Minimize Accordion State for each filter group
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    zone: true,
    district: true,
    city: true,
    heritage: true,
    passport: true,
    sort: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeCoord = userLocation || DEFAULT_KOLKATA_CENTER;

  const activeFiltersCount =
    (selectedZone !== 'all' ? 1 : 0) +
    (selectedDistrict !== 'all' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0) +
    (selectedHeritage !== 'all' ? 1 : 0) +
    (selectedVisitedFilter !== 'all' ? 1 : 0) +
    (selectedSort !== 'rating' ? 1 : 0) +
    (mapRadiusKm ? 1 : 0);

  // Target highlighted pandal for route
  const highlightedRoutePandal = useMemo(() => {
    if (!mapHighlightPandalId) return null;
    return pandals.find((p) => p.id === mapHighlightPandalId) || null;
  }, [pandals, mapHighlightPandalId]);

  // Filter & Search Logic
  const filteredPandals = useMemo(() => {
    return pandals.filter((p) => {
      // 0. Distance Radius Filter (if coming from Nearby page)
      if (mapRadiusKm) {
        const dist = calculateDistanceKm(
          activeCoord.latitude,
          activeCoord.longitude,
          p.latitude,
          p.longitude
        );
        if (dist > mapRadiusKm && p.id !== mapHighlightPandalId) return false;
      }

      // 1. Search Query
      const q = mapSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      // 2. Zone Filter
      if (selectedZone !== 'all' && p.zone !== selectedZone) return false;

      // 3. District Filter (All West Bengal Districts)
      if (selectedDistrict !== 'all') {
        const addr = (p.address + ' ' + p.zone + ' ' + (p.city || '') + ' ' + p.name).toLowerCase();
        const d = selectedDistrict.toLowerCase();
        if (d === 'kolkata') {
          if (!addr.includes('kolkata')) return false;
        } else if (d === 'north_24_parganas') {
          if (
            !addr.includes('north 24') &&
            !addr.includes('salt lake') &&
            !addr.includes('bidhannagar') &&
            !addr.includes('dum dum') &&
            !addr.includes('barasat') &&
            !addr.includes('barrackpore') &&
            !addr.includes('new town') &&
            !p.zone.includes('Salt Lake')
          )
            return false;
        } else if (d === 'south_24_parganas') {
          if (
            !addr.includes('south 24') &&
            !addr.includes('behala') &&
            !addr.includes('jadavpur') &&
            !addr.includes('garia') &&
            !addr.includes('narendrapur')
          )
            return false;
        } else if (d === 'howrah') {
          if (!addr.includes('howrah') && p.zone !== 'Howrah') return false;
        } else if (d === 'hooghly') {
          if (
            !addr.includes('hooghly') &&
            !addr.includes('chinsurah') &&
            !addr.includes('serampore') &&
            !addr.includes('chandannagar') &&
            !addr.includes('uttarpara')
          )
            return false;
        } else {
          const rawName = selectedDistrict.replace(/_/g, ' ').toLowerCase();
          if (!addr.includes(rawName)) return false;
        }
      }

      // 4. City Filter (Curated 23 West Bengal Cities)
      if (selectedCity !== 'all') {
        const addr = (p.address + ' ' + p.zone + ' ' + (p.city || '') + ' ' + p.name).toLowerCase();
        const c = selectedCity.toLowerCase();
        if (c === 'kolkata') {
          if (!addr.includes('kolkata')) return false;
        } else if (c === 'howrah') {
          if (!addr.includes('howrah') && p.zone !== 'Howrah') return false;
        } else if (c === 'berhampore') {
          if (!addr.includes('berhampore') && !addr.includes('baharampur')) return false;
        } else if (c === 'midnapore') {
          if (!addr.includes('midnapore') && !addr.includes('medinipur')) return false;
        } else if (c === 'cooch_behar') {
          if (!addr.includes('cooch behar') && !addr.includes('coochbehar')) return false;
        } else {
          const rawCity = selectedCity.replace(/_/g, ' ').toLowerCase();
          if (!addr.includes(rawCity)) return false;
        }
      }

      // 5. Heritage Filter
      if (selectedHeritage === 'heritage_century') {
        if (!p.founded_year || (2026 - p.founded_year) < 100) return false;
      } else if (selectedHeritage === 'heritage_traditional') {
        if (!p.historical_significance && !p.heritage_status) return false;
      }

      // 6. Visited Filter
      if (selectedVisitedFilter === 'visited' && !p.userVisited) return false;
      if (selectedVisitedFilter === 'unvisited' && p.userVisited) return false;

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'rating') return b.avgRating - a.avgRating;
      if (selectedSort === 'ratingCount') return b.ratingCount - a.ratingCount;
      if (selectedSort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [
    pandals,
    mapSearch,
    selectedZone,
    selectedDistrict,
    selectedCity,
    selectedHeritage,
    selectedVisitedFilter,
    selectedSort,
    mapRadiusKm,
    mapHighlightPandalId,
    activeCoord
  ]);

  // Initialize Map and Render Custom Markers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.5450, 88.3650],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing pandal markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Clear previous user marker & route line
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    // Add Live User Location Beacon Marker
    const userBeaconIcon = L.divIcon({
      className: 'user-beacon-wrapper',
      html: `
        <div class="user-beacon-pin" title="Your Location">
          <div class="user-beacon-dot"></div>
          <div class="user-beacon-wave"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const userMarker = L.marker([activeCoord.latitude, activeCoord.longitude], {
      icon: userBeaconIcon,
      zIndexOffset: 1000
    }).addTo(map);
    userMarkerRef.current = userMarker;

    // Add markers for filtered pandals
    filteredPandals.forEach(pandal => {
      const isSelected = selectedPandal?.id === pandal.id;
      const isVisited = pandal.userVisited;
      const isHighlightedTarget = mapHighlightPandalId === pandal.id;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="map-marker-pin ${isSelected ? 'marker-active' : ''} ${isVisited ? 'marker-visited' : ''} ${isHighlightedTarget ? 'marker-highlight-route' : ''}" title="${pandal.name}">
            <span class="marker-star">${isHighlightedTarget ? '🎯' : '★'}</span>
            <span class="marker-rating">${pandal.avgRating.toFixed(1)}</span>
            ${isHighlightedTarget ? '<span class="target-pulse-ring"></span>' : ''}
          </div>
        `,
        iconSize: isHighlightedTarget ? [56, 32] : [46, 28],
        iconAnchor: isHighlightedTarget ? [28, 16] : [23, 14]
      });

      const marker = L.marker([pandal.latitude, pandal.longitude], {
        icon: customIcon,
        zIndexOffset: isHighlightedTarget ? 2000 : 0
      })
        .addTo(map)
        .on('click', () => {
          setSelectedPandal(pandal);
        });

      markersRef.current[pandal.id] = marker;
    });

    // Draw route line if user came from a specific pandal with showRouteOnMap
    if (showRouteOnMap && highlightedRoutePandal) {
      const routeLine = L.polyline(
        [
          [activeCoord.latitude, activeCoord.longitude],
          [highlightedRoutePandal.latitude, highlightedRoutePandal.longitude]
        ],
        {
          color: '#b4232a',
          weight: 4,
          opacity: 0.95,
          dashArray: '8, 8',
          lineCap: 'round',
          className: 'leaflet-route-animated-line'
        }
      ).addTo(map);
      routePolylineRef.current = routeLine;

      // Fit bounds to show route nicely with padding
      const routeBounds = L.latLngBounds([
        [activeCoord.latitude, activeCoord.longitude],
        [highlightedRoutePandal.latitude, highlightedRoutePandal.longitude]
      ]);
      map.fitBounds(routeBounds, { padding: [60, 60], maxZoom: 15 });
    } else if (filteredPandals.length > 0) {
      const bounds = L.latLngBounds(filteredPandals.map(p => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [
    filteredPandals,
    selectedPandal?.id,
    mapHighlightPandalId,
    showRouteOnMap,
    highlightedRoutePandal,
    activeCoord,
    theme
  ]);

  const targetDistanceKm = highlightedRoutePandal
    ? calculateDistanceKm(
        activeCoord.latitude,
        activeCoord.longitude,
        highlightedRoutePandal.latitude,
        highlightedRoutePandal.longitude
      )
    : 0;

  return (
    <div className="pandal-map-page">
      {/* Top Search Bar & Filter Drawer Button Row */}
      <div className="map-search-filter-row">
        {/* Search Bar */}
        <div className="map-search-full-input-wrap beam-interactive">
          <Search size={16} className="map-search-icon-muted" />
          <input
            ref={mapSearchInputRef}
            type="text"
            className="map-search-input"
            placeholder="Search pandals on map..."
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
          />
          {mapSearch && (
            <button
              type="button"
              className="map-search-clear-btn"
              onClick={() => {
                setMapSearch('');
                mapSearchInputRef.current?.focus();
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Drawer Trigger Button */}
        <button
          type="button"
          className={`map-filter-trigger-btn beam-interactive ${activeFiltersCount > 0 ? 'is-filtered' : ''}`}
          onClick={() => setIsFilterDrawerOpen(true)}
          title="Filter pandals by Zone, District & Heritage"
          aria-label="Open filter drawer"
        >
          <SlidersHorizontal size={16} />
          {activeFiltersCount > 0 && (
            <span className="filter-active-count">{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {/* Map Canvas Wrapper */}
      <div className="pandal-map-wrapper">
        <div ref={mapContainerRef} className="leaflet-map-canvas" />

        {/* Dynamic Match Count Indicator Pill (Hidden when Route Banner is active) */}
        {!showRouteOnMap && (
          <div className="map-floating-counter-badge">
            <span className="counter-dot"></span>
            <span>
              {filteredPandals.length} Pandals on Map
              {mapRadiusKm ? ` (Within ${mapRadiusKm} km)` : ''}
            </span>
          </div>
        )}

        {/* Floating Route Information Banner (When routed to a specific pandal) */}
        {showRouteOnMap && highlightedRoutePandal && (
          <div className="map-route-floating-banner beam-interactive">
            <div className="route-banner-left">
              <div className="route-icon-box">
                <Navigation size={16} className="text-red" />
              </div>
              <div className="route-banner-details">
                <span className="route-banner-title">{highlightedRoutePandal.name}</span>
                <span className="route-banner-subtitle">
                  {formatDistance(targetDistanceKm)}
                  {estimateWalkingTime(targetDistanceKm) ? ` • ${estimateWalkingTime(targetDistanceKm)}` : ''}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="route-banner-close-btn"
              onClick={() => {
                setShowRouteOnMap(false);
                setMapHighlightPandalId(null);
                setMapRadiusKm(null);
              }}
              title="Dismiss Route View"
              aria-label="Dismiss Route View"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* =======================================================================
          SLIDE-OVER FILTER DRAWER / FILTER PAGE (Matching Vote Filter Page)
          ======================================================================= */}
      {isFilterDrawerOpen && (
        <div className="filter-drawer-overlay" onClick={() => setIsFilterDrawerOpen(false)}>
          <div className="filter-drawer-panel" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-title-group">
                <SlidersHorizontal size={18} className="text-red" />
                <h3 className="drawer-title">Filter Map Pandals</h3>
                {activeFiltersCount > 0 && (
                  <span className="drawer-active-pill">{activeFiltersCount} Active</span>
                )}
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsFilterDrawerOpen(false)}
                title="Close filters"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body - Category Wise Filter Groups */}
            <div className="drawer-body">
              {/* 1. Zone / Area */}
              <div className="filter-group">
                <div
                  className="filter-group-header"
                  onClick={() => toggleSection('zone')}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedSections.zone}
                >
                  <div className="filter-header-left">
                    <Compass size={15} className="text-gold" />
                    <span className="filter-group-title">Zone / Region</span>
                    {selectedZone !== 'all' && (
                      <span className="filter-badge-active">Selected</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`filter-chevron-icon ${expandedSections.zone ? 'is-open' : ''}`}
                  />
                </div>
                {expandedSections.zone && (
                  <div className="filter-pills-wrap">
                    {KOLKATA_ZONES.map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        className={`filter-choice-pill ${selectedZone === z.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedZone(z.id)}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. District Filter (All 23 Districts of West Bengal) */}
              <div className="filter-group">
                <div
                  className="filter-group-header"
                  onClick={() => toggleSection('district')}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedSections.district}
                >
                  <div className="filter-header-left">
                    <Map size={15} className="text-red" />
                    <span className="filter-group-title">District (West Bengal)</span>
                    {selectedDistrict !== 'all' && (
                      <span className="filter-badge-active">Selected</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`filter-chevron-icon ${expandedSections.district ? 'is-open' : ''}`}
                  />
                </div>
                {expandedSections.district && (
                  <div className="filter-pills-wrap">
                    {WEST_BENGAL_DISTRICTS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className={`filter-choice-pill ${selectedDistrict === d.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedDistrict(d.id)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. City / Town Filter (All Major Cities & Towns in West Bengal) */}
              <div className="filter-group">
                <div
                  className="filter-group-header"
                  onClick={() => toggleSection('city')}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedSections.city}
                >
                  <div className="filter-header-left">
                    <Building2 size={15} className="text-gold" />
                    <span className="filter-group-title">City / Town (West Bengal)</span>
                    {selectedCity !== 'all' && (
                      <span className="filter-badge-active">Selected</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`filter-chevron-icon ${expandedSections.city ? 'is-open' : ''}`}
                  />
                </div>
                {expandedSections.city && (
                  <div className="filter-pills-wrap">
                    {WEST_BENGAL_CITIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`filter-choice-pill ${selectedCity === c.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedCity(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Heritage & Legacy */}
              <div className="filter-group">
                <div
                  className="filter-group-header"
                  onClick={() => toggleSection('heritage')}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedSections.heritage}
                >
                  <div className="filter-header-left">
                    <Sparkles size={15} className="text-red" />
                    <span className="filter-group-title">Heritage & Legacy</span>
                    {selectedHeritage !== 'all' && (
                      <span className="filter-badge-active">Selected</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`filter-chevron-icon ${expandedSections.heritage ? 'is-open' : ''}`}
                  />
                </div>
                {expandedSections.heritage && (
                  <div className="filter-pills-wrap">
                    {HERITAGE_OPTIONS.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        className={`filter-choice-pill ${selectedHeritage === h.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedHeritage(h.id)}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Passport Status */}
              <div className="filter-group">
                <div
                  className="filter-group-header"
                  onClick={() => toggleSection('passport')}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedSections.passport}
                >
                  <div className="filter-header-left">
                    <Vote size={15} className="text-gold" />
                    <span className="filter-group-title">Passport Status</span>
                    {selectedVisitedFilter !== 'all' && (
                      <span className="filter-badge-active">Selected</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`filter-chevron-icon ${expandedSections.passport ? 'is-open' : ''}`}
                  />
                </div>
                {expandedSections.passport && (
                  <div className="filter-pills-wrap">
                    {PASSPORT_STATUS_OPTIONS.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className={`filter-choice-pill ${selectedVisitedFilter === v.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedVisitedFilter(v.id as any)}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Sort Criteria */}
              <div className="filter-group">
                <div
                  className="filter-group-header"
                  onClick={() => toggleSection('sort')}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedSections.sort}
                >
                  <div className="filter-header-left">
                    <TrendingUp size={15} className="text-red" />
                    <span className="filter-group-title">Sort Criteria</span>
                    {selectedSort !== 'rating' && (
                      <span className="filter-badge-active">Selected</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`filter-chevron-icon ${expandedSections.sort ? 'is-open' : ''}`}
                  />
                </div>
                {expandedSections.sort && (
                  <div className="filter-pills-wrap">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`filter-choice-pill ${selectedSort === s.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedSort(s.id as any)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="drawer-footer">
              <button
                type="button"
                className="drawer-reset-btn"
                onClick={() => {
                  setSelectedZone('all');
                  setSelectedDistrict('all');
                  setSelectedCity('all');
                  setSelectedHeritage('all');
                  setSelectedVisitedFilter('all');
                  setSelectedSort('rating');
                }}
              >
                Reset All
              </button>

              <button
                type="button"
                className="drawer-apply-btn"
                onClick={() => setIsFilterDrawerOpen(false)}
              >
                Apply Filters ({filteredPandals.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pandal-map-page {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        /* Search & Filter Row */
        .map-search-filter-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .map-search-full-input-wrap {
          display: flex;
          align-items: center;
          flex: 1;
          height: 42px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 0 14px;
          gap: 8px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .map-search-full-input-wrap:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .map-search-icon-muted {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .map-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 13.5px;
          font-weight: 500;
          min-width: 0;
        }
        .map-search-input::placeholder {
          color: var(--text-muted);
        }

        .map-search-clear-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: var(--radius-full);
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .map-search-clear-btn:hover {
          color: var(--text-primary);
          background: var(--border);
        }
        .map-search-clear-btn:active {
          transform: scale(0.9);
        }

        .map-filter-trigger-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          cursor: pointer;
          position: relative;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .map-filter-trigger-btn:hover {
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
          transform: scale(1.05);
        }
        .map-filter-trigger-btn:active {
          transform: scale(0.92);
        }
        .map-filter-trigger-btn.is-filtered {
          border-color: var(--kirti-red);
          color: var(--kirti-red);
        }

        .filter-active-count {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: var(--kirti-red);
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Map Canvas */
        .pandal-map-wrapper {
          position: relative;
          width: 100%;
          height: calc(100vh - 200px);
          min-height: 520px;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        @media (max-width: 768px) {
          .pandal-map-wrapper {
            height: calc(100vh - 175px);
            min-height: 420px;
          }
        }
        .leaflet-map-canvas {
          width: 100%;
          height: 100%;
          background: #e5e3df;
        }

        .map-floating-counter-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 800;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--bg-header);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          pointer-events: none;
        }
        .counter-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--kirti-red);
          animation: mapDotPulse 2s infinite ease-in-out;
        }
        @keyframes mapDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .map-marker-pin {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          background: var(--kirti-red);
          color: #ffffff;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          border: 2px solid #ffffff;
          font-weight: 700;
          font-size: 11px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.18s ease;
          white-space: nowrap;
        }
        .map-marker-pin:hover {
          transform: scale(1.15);
        }
        .map-marker-pin.marker-active {
          background: var(--text-primary);
          color: var(--bg-app);
          border-color: var(--kirti-gold);
          transform: scale(1.22);
          box-shadow: 0 6px 16px rgba(0,0,0,0.5);
        }
        .map-marker-pin.marker-visited {
          border-color: var(--text-primary);
        }
        .map-marker-pin.marker-highlight-route {
          background: #b4232a;
          color: #ffffff;
          border-color: var(--kirti-gold);
          transform: scale(1.35);
          box-shadow: 0 0 20px rgba(180, 35, 42, 0.7);
          animation: targetBounce 1.8s infinite ease-in-out;
          font-weight: 800;
          z-index: 2000 !important;
        }
        @keyframes targetBounce {
          0%, 100% { transform: scale(1.35) translateY(0); }
          50% { transform: scale(1.42) translateY(-4px); }
        }
        .target-pulse-ring {
          position: absolute;
          inset: -6px;
          border-radius: var(--radius-full);
          border: 2px solid var(--kirti-gold);
          animation: ringPulse 1.6s infinite cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: none;
        }
        @keyframes ringPulse {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        .marker-star {
          color: var(--kirti-gold);
          font-size: 10px;
        }

        /* User GPS Beacon Marker */
        .user-beacon-pin {
          position: relative;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-beacon-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #2563eb;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.6);
          z-index: 2;
        }
        .user-beacon-wave {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #3b82f6;
          opacity: 0;
          animation: userBeaconWave 2s infinite ease-out;
        }
        @keyframes userBeaconWave {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* Animated Route Line */
        .leaflet-route-animated-line {
          animation: dashMove 1.2s linear infinite;
        }
        @keyframes dashMove {
          to {
            stroke-dashoffset: -16;
          }
        }

        /* Floating Route Info Banner */
        .map-route-floating-banner {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 850;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 8px 14px 8px 12px;
          background: var(--bg-header);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          width: calc(100% - 32px);
          max-width: 440px;
          animation: bannerSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes bannerSlideDown {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .route-banner-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }
        .route-icon-box {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: rgba(180, 35, 42, 0.12);
          border: 1px solid rgba(180, 35, 42, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .route-banner-details {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .route-banner-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .route-banner-subtitle {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--kirti-red);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .route-banner-close-btn {
          width: 26px;
          height: 26px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .route-banner-close-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-focus);
        }

        /* Slide-Over Filter Drawer */
        .filter-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1100;
          display: flex;
          justify-content: flex-end;
          animation: drawerFadeIn 0.24s ease;
        }
        .filter-drawer-panel {
          width: 100%;
          max-width: 420px;
          height: 100%;
          background: var(--bg-card);
          border-left: 1px solid var(--border);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          animation: drawerSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 22px;
          border-bottom: 1px solid var(--border);
        }
        .drawer-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .drawer-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .drawer-active-pill {
          font-size: 11px;
          font-weight: 700;
          background: rgba(180, 35, 42, 0.12);
          color: var(--kirti-red);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(180, 35, 42, 0.2);
        }
        .drawer-close-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .drawer-close-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-focus);
        }
        .drawer-close-btn:active {
          transform: scale(0.92);
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }
        .filter-group:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .filter-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          cursor: pointer;
          user-select: none;
          padding: 4px 2px;
          border-radius: var(--radius-sm);
          transition: opacity 0.15s ease;
        }
        .filter-group-header:hover {
          opacity: 0.85;
        }
        .filter-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-group-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .filter-badge-active {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          background: rgba(180, 35, 42, 0.15);
          color: var(--kirti-red);
          border: 1px solid rgba(180, 35, 42, 0.3);
          letter-spacing: 0.02em;
        }
        .filter-chevron-icon {
          color: var(--text-muted);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease;
        }
        .filter-chevron-icon.is-open {
          transform: rotate(180deg);
        }
        .filter-group-header:hover .filter-chevron-icon {
          color: var(--text-primary);
        }

        .filter-pills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 4px;
          animation: accordionExpand 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes accordionExpand {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .filter-pills-wrap::-webkit-scrollbar {
          width: 4px;
        }
        .filter-pills-wrap::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: var(--radius-full);
        }
        .filter-choice-pill {
          padding: 7px 13px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .filter-choice-pill:hover {
          border-color: var(--border-focus);
          color: var(--text-primary);
        }
        .filter-choice-pill.is-selected {
          background: var(--text-primary);
          color: var(--bg-card);
          border-color: var(--text-primary);
          font-weight: 700;
        }

        .drawer-footer {
          padding: 16px 22px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
        }
        .drawer-reset-btn {
          flex: 1;
          height: 44px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .drawer-reset-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-focus);
        }
        .drawer-reset-btn:active {
          transform: scale(0.97);
        }

        .drawer-apply-btn {
          flex: 2;
          height: 44px;
          border-radius: var(--radius-full);
          background: var(--kirti-red);
          border: none;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(180, 35, 42, 0.4);
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .drawer-apply-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .drawer-apply-btn:active {
          transform: translateY(0) scale(0.97);
        }
      `}</style>
    </div>
  );
};
