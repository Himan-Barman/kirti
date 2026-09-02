import React from 'react';
import { useStore } from '../../lib/store';
import { Tabs, Select } from '../ui';
import type { TabItem, SelectOption } from '../ui';
import { SlidersHorizontal, MapPin, Grid } from 'lucide-react';

const ZONE_TABS: TabItem[] = [
  { id: 'all', label: 'All Kolkata' },
  { id: 'South Kolkata', label: 'South Kolkata' },
  { id: 'North Kolkata', label: 'North Kolkata' },
  { id: 'Central Kolkata', label: 'Central Kolkata' },
  { id: 'Salt Lake & East', label: 'Salt Lake & East' },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: 'rating', label: 'Highest Rated ★' },
  { value: 'friends', label: 'Most Friends Visited' },
  { value: 'visits', label: 'Most Popular Visits' },
  { value: 'name', label: 'Alphabetical (A–Z)' },
];

export const PandalFilters: React.FC = () => {
  const {
    selectedZone,
    setSelectedZone,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    pandals
  } = useStore();

  const totalPandalsCount = pandals.length;

  return (
    <div className="filters-container">
      {/* Zone selection tabs */}
      <div className="zone-tabs-wrap">
        <Tabs
          items={ZONE_TABS}
          activeId={selectedZone}
          onChange={setSelectedZone}
          variant="pills"
        />
      </div>

      {/* Secondary control bar: Count, Custom Luxury Sort Dropdown, and View toggle */}
      <div className="controls-row">
        <span className="results-counter">
          Showing <strong>{pandals.filter(p => selectedZone === 'all' || p.zone === selectedZone).length}</strong> of {totalPandalsCount} pandals
        </span>

        <div className="controls-right">
          {/* Custom Animated Luxury Select Dropdown */}
          <Select
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            icon={<SlidersHorizontal size={13} />}
            rounded="full"
          />

          {/* Grid / Map toggle on desktop */}
          <div className="view-toggle">
            <button
              className={`view-btn ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => setActiveTab('discover')}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              className={`view-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
              title="Map View"
            >
              <MapPin size={15} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .filters-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        .zone-tabs-wrap {
          overflow-x: auto;
          scrollbar-width: none;
        }
        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .results-counter {
          font-size: 13px;
          color: var(--text-muted);
        }
        .controls-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .view-toggle {
          display: flex;
          background: var(--bg-card-subtle);
          padding: 3px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
        }
        .view-btn {
          background: transparent;
          border: none;
          padding: 6px 10px;
          border-radius: var(--radius-full);
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .view-btn.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};
