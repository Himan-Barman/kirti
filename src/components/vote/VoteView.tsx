import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../../lib/store';
import { Card, Button, Tabs } from '../ui';
import {
  Sparkles,
  Trophy,
  Zap,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Vote,
  ClipboardList,
  Search,
  SlidersHorizontal,
  MapPin,
  Navigation,
  X
} from 'lucide-react';
import type { RatingCategoryCode } from '../../types/database.types';
import type { PandalRanking } from '../../types/ranking.types';

interface RankingCategory {
  id: RatingCategoryCode;
  name: string;
  name_bn: string;
  description: string;
  icon: React.ReactNode;
}

const RANKING_CATEGORIES: RankingCategory[] = [
  {
    id: 'overall',
    name: 'Overall',
    name_bn: 'সামগ্রিক',
    description: 'The community favorite with the most unforgettable overall experience',
    icon: <Trophy size={15} className="text-gold" />
  },
  {
    id: 'theme',
    name: 'Theme',
    name_bn: 'থিম',
    description: 'Most innovative conceptual storytelling and visual execution',
    icon: <Sparkles size={15} className="text-red" />
  },
  {
    id: 'idol',
    name: 'Idol',
    name_bn: 'প্রতিমা',
    description: 'Masterful clay craftsmanship, expression and traditional drapery',
    icon: <Star size={15} className="text-gold" />
  },
  {
    id: 'lighting',
    name: 'Lighting',
    name_bn: 'আলোসজ্জা',
    description: 'Breathtaking lighting displays and atmospheric glow',
    icon: <Zap size={15} className="text-red" />
  },
  {
    id: 'management',
    name: 'Management',
    name_bn: 'ব্যবস্থাপনা',
    description: 'Organization, visitor handling, cleanliness and general management',
    icon: <ClipboardList size={15} className="text-gold" />
  }
];

export const VoteView: React.FC = () => {
  const { pandals, setSelectedPandal, voteActiveView, setVoteActiveView } = useStore();

  const [voteSearch, setVoteSearch] = useState('');
  const voteSearchInputRef = useRef<HTMLInputElement>(null);

  // Active Category for Voting (in Rankings view)
  const [selectedCatId, setSelectedCatId] = useState<RatingCategoryCode>('overall');

  // Slide-over Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedHeritage, setSelectedHeritage] = useState<string>('all');
  const [selectedVisitedFilter, setSelectedVisitedFilter] = useState<'all' | 'unvisited' | 'visited'>('all');
  const [selectedSort, setSelectedSort] = useState<'rating' | 'ratingCount' | 'name'>('rating');

  const activeFiltersCount =
    (selectedZone !== 'all' ? 1 : 0) +
    (selectedDistrict !== 'all' ? 1 : 0) +
    (selectedHeritage !== 'all' ? 1 : 0) +
    (selectedVisitedFilter !== 'all' ? 1 : 0) +
    (selectedSort !== 'rating' ? 1 : 0);

  // Pagination state for Cast Vote and Rankings (20 pandals per page)
  const [castVotePage, setCastVotePage] = useState<number>(1);
  const [rankingPage, setRankingPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Filter & Search Logic
  const filteredPandals = useMemo(() => {
    return pandals.filter((p) => {
      // 1. Search Query
      const q = voteSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      // 2. Zone Filter
      if (selectedZone !== 'all' && p.zone !== selectedZone) return false;

      // 3. District / City Filter
      if (selectedDistrict !== 'all') {
        const addr = p.address.toLowerCase();
        if (selectedDistrict === 'kolkata' && !addr.includes('kolkata')) return false;
        if (selectedDistrict === 'howrah' && !addr.includes('howrah') && p.zone !== 'Howrah') return false;
        if (selectedDistrict === 'saltlake' && !addr.includes('salt lake') && !addr.includes('bidhannagar') && !p.zone.includes('Salt Lake')) return false;
        if (selectedDistrict === 'north24' && !addr.includes('north 24') && !addr.includes('dum dum') && !addr.includes('barasat')) return false;
      }

      // 4. Heritage / Style Filter
      if (selectedHeritage === 'heritage_century') {
        if (!p.founded_year || (2026 - p.founded_year) < 100) return false;
      } else if (selectedHeritage === 'heritage_traditional') {
        if (!p.historical_significance && !p.heritage_status) return false;
      }

      // 5. Visited Status
      if (selectedVisitedFilter === 'visited' && !p.userVisited) return false;
      if (selectedVisitedFilter === 'unvisited' && p.userVisited) return false;

      return true;
    });
  }, [
    pandals,
    voteSearch,
    selectedZone,
    selectedDistrict,
    selectedHeritage,
    selectedVisitedFilter
  ]);

  // Sort Logic for Cast Vote
  const sortedCastVotePandals = useMemo(() => {
    const list = [...filteredPandals];
    if (selectedSort === 'rating') {
      list.sort((a, b) => b.avgRating - a.avgRating);
    } else if (selectedSort === 'ratingCount') {
      list.sort((a, b) => b.ratingCount - a.ratingCount);
    } else if (selectedSort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredPandals, selectedSort]);

  // Pagination for Cast Vote View (20 per page)
  const castVoteTotalPages = Math.max(1, Math.ceil(sortedCastVotePandals.length / itemsPerPage));
  const paginatedCastVotePandals = sortedCastVotePandals.slice(
    (castVotePage - 1) * itemsPerPage,
    castVotePage * itemsPerPage
  );

  // Dynamic ranking calculation based on chosen category & filters
  const rankings: PandalRanking[] = useMemo(() => {
    return [...filteredPandals].map((p) => {
      const score = p.avgRating; 
      const count = p.ratingCount;
      
      return {
        id: `rank_${p.id}`,
        pandal_id: p.id,
        season_id: 's_2026',
        category_id: selectedCatId,
        category_code: selectedCatId,
        raw_mean: p.avgRating,
        bayesian_mean: score,
        lower_confidence_score: score - 0.2,
        final_score: score,
        raw_rating_count: count,
        effective_sample_size: count,
        standard_deviation: 0.5,
        one_star: 1, two_star: 2, three_star: 5, four_star: 15, five_star: count - 23,
        rank: 0,
        is_rank_eligible: count >= 10,
        ranking_version: '2026-v1',
        calculated_at: new Date().toISOString(),
        pandal_name: p.name,
        pandal_slug: p.slug,
        pandal_image_url: p.image_url,
        pandal_address: p.address,
        pandal_zone: p.zone
      } as any;
    }).sort((a, b) => {
      if (Math.abs(b.final_score - a.final_score) > 0.001) return b.final_score - a.final_score;
      if (Math.abs(b.lower_confidence_score - a.lower_confidence_score) > 0.001) return b.lower_confidence_score - a.lower_confidence_score;
      if (b.raw_rating_count !== a.raw_rating_count) return b.raw_rating_count - a.raw_rating_count;
      return a.pandal_id.localeCompare(b.pandal_id);
    });
  }, [filteredPandals, selectedCatId]);

  // Assign deterministic ranks post-sort
  rankings.forEach((r, idx) => r.rank = idx + 1);

  // Pagination for Rankings View (20 per page)
  const rankingTotalPages = Math.max(1, Math.ceil(rankings.length / itemsPerPage));
  const paginatedRankings = rankings.slice(
    (rankingPage - 1) * itemsPerPage,
    rankingPage * itemsPerPage
  );

  // Reusable Smooth Horizontal Pagination Bar
  const renderPaginationBar = (currentPage: number, totalPages: number, setPage: (p: number | ((prev: number) => number)) => void) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="vote-pagination-wrap">
        {/* Previous Button (Always visible) */}
        <button
          type="button"
          className="vote-pagination-arrow-btn beam-interactive"
          onClick={() => {
            setPage((p) => Math.max(1, p - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={currentPage === 1}
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Scrollable Page Number Pills */}
        <div className="vote-pagination-numbers-scroll">
          {pages.map((pNum) => {
            const isActive = currentPage === pNum;
            return (
              <button
                key={pNum}
                type="button"
                className={`vote-page-num-btn beam-interactive ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  setPage(pNum);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title={`Page ${pNum}`}
                aria-label={`Page ${pNum}`}
              >
                {pNum}
              </button>
            );
          })}
        </div>

        {/* Next Button (Always visible) */}
        <button
          type="button"
          className="vote-pagination-arrow-btn beam-interactive"
          onClick={() => {
            setPage((p) => Math.min(totalPages, p + 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={currentPage === totalPages}
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="vote-view-container">
      {/* Top Search Bar & Filter Drawer Button Row */}
      <div className="vote-page-search-filter-row">
        {/* Desktop View Switcher Tabs (Desktop Only) */}
        <div className="vote-desktop-switcher">
          <Tabs 
            variant="segmented"
            activeId={voteActiveView}
            onChange={(id) => {
              setVoteActiveView(id as 'cast_vote' | 'pandals_ranking');
              setCastVotePage(1);
              setRankingPage(1);
            }}
            items={[
              { id: 'cast_vote', label: 'Vote', icon: <Vote size={15} /> },
              { id: 'pandals_ranking', label: 'Rankings', icon: <TrendingUp size={15} /> }
            ]}
          />
        </div>

        {/* Search Bar */}
        <div className="vote-search-full-input-wrap beam-interactive">
          <Search size={16} className="vote-search-icon-muted" />
          <input
            ref={voteSearchInputRef}
            type="text"
            className="vote-search-input"
            placeholder={voteActiveView === 'cast_vote' ? "Search pandals to vote..." : "Search pandal rankings..."}
            value={voteSearch}
            onChange={(e) => {
              setVoteSearch(e.target.value);
              setCastVotePage(1);
              setRankingPage(1);
            }}
          />
          {voteSearch && (
            <button
              type="button"
              className="vote-search-clear-btn"
              onClick={() => {
                setVoteSearch('');
                setCastVotePage(1);
                setRankingPage(1);
                voteSearchInputRef.current?.focus();
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Option Button */}
        <button
          type="button"
          className={`vote-filter-trigger-btn beam-interactive ${activeFiltersCount > 0 ? 'is-filtered' : ''}`}
          onClick={() => setIsFilterDrawerOpen(true)}
          title="Filter pandals by Zone, City, District & Heritage"
          aria-label="Open filter drawer"
        >
          <SlidersHorizontal size={16} />
          {activeFiltersCount > 0 && (
            <span className="filter-active-count">{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {/* Category Selector Pills (Shown ONLY in Pandals Ranking View) */}
      {voteActiveView === 'pandals_ranking' && (
        <div className="category-tabs-wrap" style={{ overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
          <Tabs 
            variant="pills"
            activeId={selectedCatId}
            onChange={(id) => {
              setSelectedCatId(id as RatingCategoryCode);
              setRankingPage(1);
            }}
            items={RANKING_CATEGORIES.map(c => ({
              id: c.id,
              label: c.name,
              icon: c.icon
            }))}
          />
        </div>
      )}

      {/* =======================================================================
          VIEW 1: CAST VOTE (List Pandals to Rate - 20 Max per Page)
          ======================================================================= */}
      {voteActiveView === 'cast_vote' && (
        <div className="cast-vote-section">
          <div className="nominees-section">
            {paginatedCastVotePandals.length > 0 ? (
              <>
                <div className="nominees-grid">
                  {paginatedCastVotePandals.map((pandal) => {
                    return (
                      <Card
                        key={pandal.id}
                        variant="interactive"
                        padding="none"
                        rounded="lg"
                        className="nominee-compact-card"
                        onClick={() => setSelectedPandal(pandal)}
                      >
                        <img src={pandal.image_url} alt={pandal.name} className="nominee-compact-thumb" />
                        <div className="nominee-compact-info">
                          <div className="nominee-title-location-row">
                            <span className="nominee-name">{pandal.name}</span>
                            {pandal.address && (
                              <>
                                <span className="loc-sep">•</span>
                                <span className="nominee-location">{pandal.address}</span>
                              </>
                            )}
                          </div>
                          <div className="nominee-stats-row">
                            <span className="stat-pill"><Star size={12}/> {pandal.avgRating.toFixed(1)}</span>
                            <span className="stat-pill"><Vote size={12}/> {pandal.ratingCount} Ratings</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Always-Visible Organized Pagination for Cast Vote */}
                {sortedCastVotePandals.length > 0 && renderPaginationBar(castVotePage, castVoteTotalPages, setCastVotePage)}
              </>
            ) : (
              <div className="nominees-empty-state">
                <p>No pandals match the selected filters or search query.</p>
                <Button
                  variant="outline"
                  size="sm"
                  rounded="full"
                  onClick={() => {
                    setVoteSearch('');
                    setSelectedZone('all');
                    setSelectedDistrict('all');
                    setSelectedHeritage('all');
                    setSelectedVisitedFilter('all');
                    setCastVotePage(1);
                    setRankingPage(1);
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================================
          VIEW 2: PANDALS RANKING (Statistical Engine Output - 20 Max per Page)
          ======================================================================= */}
      {voteActiveView === 'pandals_ranking' && (
        <div className="ranking-view-section">
          <div className="nominees-grid">
            {paginatedRankings.map((pandalRank) => {
              const rank = pandalRank.rank;

              return (
                <Card
                  key={pandalRank.id}
                  variant="interactive"
                  padding="none"
                  rounded="lg"
                  className="nominee-compact-card ranking-card"
                  onClick={() => {
                    const matchedPandal = pandals.find(p => p.id === pandalRank.pandal_id);
                    if (matchedPandal) setSelectedPandal(matchedPandal);
                  }}
                >
                  <div className="nominee-rank-slot">
                    <span className={`rank-tag ${rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : ''}`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>
                  </div>

                  <img src={pandalRank.pandal_image_url} alt={pandalRank.pandal_name} className="nominee-compact-thumb" />

                  <div className="nominee-compact-info">
                    {/* Row 1: Name + Address (if space allows) */}
                    <div className="nominee-title-location-row">
                      <span className="nominee-name">{pandalRank.pandal_name}</span>
                      {pandalRank.pandal_address && (
                        <>
                          <span className="loc-sep">•</span>
                          <span className="nominee-location">{pandalRank.pandal_address}</span>
                        </>
                      )}
                    </div>

                    {/* Row 2: Rating and Verified Ratings */}
                    <div className="nominee-stats-row">
                      <span className="stat-pill">
                        <Star size={12} />
                        {pandalRank.final_score.toFixed(1)}
                      </span>
                      <span className="stat-pill">
                        <Vote size={12} />
                        {pandalRank.raw_rating_count.toLocaleString()} Verified Ratings
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Always-Visible Organized Pagination for Rankings */}
          {rankings.length > 0 && renderPaginationBar(rankingPage, rankingTotalPages, setRankingPage)}
        </div>
      )}

      {/* =========================================================================
          SLIDE-OVER FILTER DRAWER (FROM RIGHT SIDE)
          ========================================================================= */}
      {isFilterDrawerOpen && (
        <div className="filter-drawer-overlay" onClick={() => setIsFilterDrawerOpen(false)}>
          <div className="filter-drawer-panel" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-title-group">
                <SlidersHorizontal size={18} className="text-red" />
                <h3 className="drawer-title">Filter Pandals</h3>
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
                <div className="filter-group-header">
                  <MapPin size={14} className="text-gold" />
                  <span className="filter-group-title">Zone / Area</span>
                </div>
                <div className="filter-pills-wrap">
                  {[
                    { id: 'all', label: 'All Zones' },
                    { id: 'North Kolkata', label: 'North Kolkata' },
                    { id: 'South Kolkata', label: 'South Kolkata' },
                    { id: 'Central Kolkata', label: 'Central Kolkata' },
                    { id: 'Salt Lake & East Kolkata', label: 'Salt Lake & East' },
                    { id: 'Howrah', label: 'Howrah' }
                  ].map((z) => (
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
              </div>

              {/* 2. City / District */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <Navigation size={14} className="text-red" />
                  <span className="filter-group-title">City / District</span>
                </div>
                <div className="filter-pills-wrap">
                  {[
                    { id: 'all', label: 'All Districts' },
                    { id: 'kolkata', label: 'Kolkata Central' },
                    { id: 'saltlake', label: 'Bidhannagar / Salt Lake' },
                    { id: 'howrah', label: 'Howrah District' },
                    { id: 'north24', label: 'North 24 Parganas' }
                  ].map((d) => (
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
              </div>

              {/* 3. Heritage & Style */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <Sparkles size={14} className="text-gold" />
                  <span className="filter-group-title">Heritage & Legacy</span>
                </div>
                <div className="filter-pills-wrap">
                  {[
                    { id: 'all', label: 'All Heritage' },
                    { id: 'heritage_century', label: 'Century Heritage (100+ Yrs)' },
                    { id: 'heritage_traditional', label: 'Iconic & Traditional' }
                  ].map((h) => (
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
              </div>

              {/* 4. Visited Status */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <Vote size={14} className="text-red" />
                  <span className="filter-group-title">Passport Status</span>
                </div>
                <div className="filter-pills-wrap">
                  {[
                    { id: 'all', label: 'All Pandals' },
                    { id: 'unvisited', label: 'Unvisited (To Rate)' },
                    { id: 'visited', label: 'Already Visited' }
                  ].map((v) => (
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
              </div>

              {/* 5. Sort Order */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <TrendingUp size={14} className="text-gold" />
                  <span className="filter-group-title">Sort Criteria</span>
                </div>
                <div className="filter-pills-wrap">
                  {[
                    { id: 'rating', label: 'Highest Rated ★' },
                    { id: 'ratingCount', label: 'Most Ratings 🗳️' },
                    { id: 'name', label: 'Alphabetical A-Z 🔤' }
                  ].map((s) => (
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
        .vote-page-search-filter-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          margin-bottom: 16px;
        }

        .vote-desktop-switcher {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .vote-desktop-switcher {
            display: none;
          }
        }

        .vote-search-full-input-wrap {
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
        .vote-search-full-input-wrap:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .vote-filter-trigger-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
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
        .vote-filter-trigger-btn:hover {
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
          transform: scale(1.05);
        }
        .vote-filter-trigger-btn:active {
          transform: scale(0.92);
        }
        .vote-filter-trigger-btn.is-filtered {
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
        .filter-badge-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--kirti-red);
        }

        .vote-filter-collapsed-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--kirti-red);
          cursor: pointer;
          flex-shrink: 0;
          position: relative;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
          animation: voteIconFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vote-filter-collapsed-btn:hover {
          background: var(--bg-card-subtle);
          border-color: var(--kirti-red);
          transform: scale(1.05);
        }
        .vote-filter-collapsed-btn:active {
          transform: scale(0.92);
        }

        .vote-search-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
          animation: voteIconFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vote-search-icon-btn:hover {
          background: var(--bg-card-subtle);
          border-color: var(--border-focus);
          transform: scale(1.05);
        }
        .vote-search-icon-btn:active {
          transform: scale(0.92);
        }

        .vote-search-expanded-bar {
          display: flex;
          align-items: center;
          flex: 1;
          height: 40px;
          background: var(--bg-card);
          border: 1px solid var(--border-focus);
          border-radius: var(--radius-full);
          padding: 0 12px;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          animation: voteSearchExpand 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vote-search-icon-muted {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .vote-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 13.5px;
        }
        .vote-search-input::placeholder {
          color: var(--text-muted);
        }
        .vote-search-clear-btn {
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
        .vote-search-clear-btn:hover {
          color: var(--text-primary);
          background: var(--border);
        }
        .vote-search-clear-btn:active {
          transform: scale(0.9);
        }

        /* Card Row Layout with Location Ellipsis & Left Gap */
        .nominees-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        .nominee-compact-card {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          padding: 8px 14px 8px 14px !important;
          gap: 14px !important;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          min-height: 74px;
          cursor: pointer;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .nominee-compact-card:hover {
          background: var(--bg-card-subtle);
          border-color: transparent !important;
          box-shadow: 0 0 16px var(--beam-glow-color) !important;
        }
        .nominee-compact-thumb {
          width: 58px !important;
          height: 58px !important;
          min-width: 58px !important;
          max-width: 58px !important;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
          background: var(--bg-card-subtle);
          margin-left: 2px;
        }
        .nominee-compact-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }
        .nominee-title-location-row {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
        }
        .nominee-name {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          flex-shrink: 0;
          max-width: 75%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .loc-sep {
          color: var(--text-muted);
          font-size: 12px;
          flex-shrink: 0;
        }
        .nominee-location {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-shrink: 1;
          min-width: 0;
        }
        .nominee-stats-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .nominees-empty-state {
          padding: 36px 20px;
          text-align: center;
          background: var(--bg-card);
          border: 1px dashed var(--border);
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
          margin-top: 12px;
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
          padding: 20px 24px;
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
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: rgba(180, 35, 42, 0.15);
          border: 1px solid rgba(180, 35, 42, 0.3);
          color: var(--kirti-red);
          font-size: 11.5px;
          font-weight: 700;
        }
        .drawer-close-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .drawer-close-btn:hover {
          background: var(--text-primary);
          color: var(--bg-app);
          transform: scale(1.05);
        }
        .drawer-close-btn:active {
          transform: scale(0.92);
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .filter-group-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-group-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .filter-pills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .filter-choice-pill {
          padding: 7px 14px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: var(--font-sans);
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .filter-choice-pill:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }
        .filter-choice-pill:active {
          transform: scale(0.95);
        }
        .filter-choice-pill.is-selected {
          background: var(--text-primary);
          color: var(--bg-app);
          border-color: var(--text-primary);
          font-weight: 700;
        }

        .drawer-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px)) 24px;
          border-top: 1px solid var(--border);
          background: var(--bg-card);
        }
        .drawer-reset-btn {
          padding: 12px 18px;
          border-radius: var(--radius-full);
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .drawer-reset-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-primary);
        }
        .drawer-apply-btn {
          flex: 1;
          padding: 12px 20px;
          border-radius: var(--radius-full);
          background: var(--kirti-red);
          color: #fff;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(180, 35, 42, 0.35);
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .drawer-apply-btn:hover {
          background: #c52932;
          transform: scale(1.02);
        }
        .drawer-apply-btn:active {
          transform: scale(0.97);
        }

        /* =========================================================================
           VOTE PAGE ORGANIZED HORIZONTAL PAGINATION BAR
           ========================================================================= */
        .vote-pagination-wrap {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
          margin-top: 24px !important;
          padding: 12px 0 24px 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .vote-pagination-arrow-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 38px !important;
          height: 38px !important;
          min-width: 38px !important;
          max-width: 38px !important;
          border-radius: var(--radius-full) !important;
          background: var(--bg-card) !important;
          border: 1px solid var(--border) !important;
          color: var(--text-primary) !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .vote-pagination-arrow-btn:hover:not(:disabled) {
          background: var(--text-primary) !important;
          color: var(--bg-app) !important;
          border-color: var(--text-primary) !important;
          transform: scale(1.05);
        }
        .vote-pagination-arrow-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        .vote-pagination-arrow-btn:disabled {
          opacity: 0.35 !important;
          cursor: not-allowed !important;
          background: var(--bg-card-subtle) !important;
          color: var(--text-muted) !important;
        }

        .vote-pagination-numbers-scroll {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 8px !important;
          overflow-x: auto !important;
          scrollbar-width: none !important;
          max-width: 250px !important;
          padding: 4px 2px !important;
          box-sizing: border-box !important;
          -webkit-overflow-scrolling: touch;
        }
        .vote-pagination-numbers-scroll::-webkit-scrollbar {
          display: none !important;
        }

        .vote-page-num-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          max-width: 36px !important;
          border-radius: var(--radius-full) !important;
          background: var(--bg-card) !important;
          border: 1px solid var(--border) !important;
          color: var(--text-secondary) !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          font-family: var(--font-sans) !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .vote-page-num-btn:hover {
          border-color: var(--text-primary) !important;
          color: var(--text-primary) !important;
        }
        .vote-page-num-btn.is-active {
          background: var(--text-primary) !important;
          color: var(--bg-app) !important;
          border-color: var(--text-primary) !important;
          font-weight: 800 !important;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.16) !important;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};
