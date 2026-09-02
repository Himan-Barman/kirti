import React, { useEffect, useRef } from 'react';
import { useStore } from '../../lib/store';
import L from 'leaflet';
import { Card, Button } from '../ui';
import { Check, MapPin } from 'lucide-react';

export const PandalMap: React.FC = () => {
  const {
    pandals,
    selectedZone,
    setSelectedPandal,
    toggleVisit,
    selectedPandal,
    theme
  } = useStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const filteredPandals = pandals.filter(p =>
    selectedZone === 'all' || p.zone === selectedZone
  );

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

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for filtered pandals
    filteredPandals.forEach(pandal => {
      const isSelected = selectedPandal?.id === pandal.id;
      const isVisited = pandal.userVisited;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="map-marker-pin ${isSelected ? 'marker-active' : ''} ${isVisited ? 'marker-visited' : ''}" title="${pandal.name}">
            <span class="marker-star">★</span>
            <span class="marker-rating">${pandal.avgRating}</span>
          </div>
        `,
        iconSize: [46, 28],
        iconAnchor: [23, 14]
      });

      const marker = L.marker([pandal.latitude, pandal.longitude], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedPandal(pandal);
        });

      markersRef.current[pandal.id] = marker;
    });

    if (filteredPandals.length > 0) {
      const bounds = L.latLngBounds(filteredPandals.map(p => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [filteredPandals.length, selectedZone, selectedPandal?.id, theme]);

  return (
    <div className="pandal-map-wrapper">
      <div ref={mapContainerRef} className="leaflet-map-canvas" />

      {/* Floating Info Drawer */}
      <Card variant="default" padding="sm" rounded="2xl" className="map-bottom-drawer">
        <div className="map-drawer-header">
          <span className="drawer-title">
            <MapPin size={14} className="text-red" />
            <span>Pandals on Map ({filteredPandals.length})</span>
          </span>
          <span className="drawer-hint">Click pin to view theme & rate</span>
        </div>

        <div className="map-drawer-scroll">
          {filteredPandals.map(pandal => (
            <Card
              key={pandal.id}
              variant="interactive"
              padding="sm"
              rounded="lg"
              className={`map-card-item ${selectedPandal?.id === pandal.id ? 'active' : ''}`}
              onClick={() => setSelectedPandal(pandal)}
            >
              <img src={pandal.image_url} alt={pandal.name} className="map-card-thumb" />
              <div className="map-card-details">
                <h4 className="map-card-name">{pandal.name}</h4>
                <div className="map-card-meta">
                  <span className="map-card-rating">★ {pandal.avgRating}</span>
                  <span className="map-card-zone">{pandal.zone}</span>
                </div>
              </div>
              <Button
                variant={pandal.userVisited ? 'visited' : 'outline'}
                size="sm"
                rounded="full"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisit(pandal.id);
                }}
              >
                {pandal.userVisited ? <Check size={12} strokeWidth={3} /> : 'Visit'}
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      <style>{`
        .pandal-map-wrapper {
          position: relative;
          width: 100%;
          height: calc(100vh - 220px);
          min-height: 540px;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        @media (max-width: 768px) {
          .pandal-map-wrapper {
            height: calc(100vh - 180px);
            min-height: 440px;
          }
        }
        .leaflet-map-canvas {
          width: 100%;
          height: 100%;
          background: #e5e3df;
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
        .marker-star {
          color: var(--kirti-gold);
          font-size: 10px;
        }
        .map-bottom-drawer {
          position: absolute;
          bottom: 18px;
          left: 18px;
          right: 18px;
          z-index: 800;
          box-shadow: var(--shadow-float);
          display: flex;
          flex-direction: column;
          gap: 10px;
          backdrop-filter: blur(12px);
          background: var(--bg-header) !important;
        }
        .map-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
        }
        .drawer-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .text-red {
          color: var(--kirti-red);
        }
        .drawer-hint {
          font-size: 11px;
          color: var(--text-muted);
        }
        .map-drawer-scroll {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: thin;
          padding-bottom: 2px;
        }
        .map-card-item {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 270px;
          flex-shrink: 0;
        }
        .map-card-item.active {
          border-color: var(--border-focus);
        }
        .map-card-thumb {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          object-fit: cover;
        }
        .map-card-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        .map-card-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .map-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .map-card-rating {
          color: var(--kirti-gold);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
