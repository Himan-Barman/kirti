import React, { useState, useRef } from 'react';
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
  const { pandals, setSelectedPandal } = useStore();

  const [voteSearch, setVoteSearch] = useState('');
  const [isVoteSearchExpanded, setIsVoteSearchExpanded] = useState(false);
  const voteSearchInputRef = useRef<HTMLInputElement>(null);

  // View Switcher: 'cast_vote' vs 'pandals_ranking'
  const [activeView, setActiveView] = useState<'cast_vote' | 'pandals_ranking'>('cast_vote');

  // Active Category for Voting
  const [selectedCatId, setSelectedCatId] = useState<RatingCategoryCode>('overall');

  // Pagination state for Rankings (20 pandals per page)
  const [rankingPage, setRankingPage] = useState<number>(1);
  const itemsPerPage = 20;

  // For the actual statistical engine, we'll mock the PandalRanking array here.
  // In production, this would come from `useStore().rankings` loaded via `get_current_rankings()` RPC.
  const filteredPandals = pandals.filter(p => p.name.toLowerCase().includes(voteSearch.toLowerCase()) || p.address.toLowerCase().includes(voteSearch.toLowerCase()));

  const rankings: PandalRanking[] = [...filteredPandals].map((p) => {
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
    // Tie-breaker: final_score > lower_conf > count > id
    if (Math.abs(b.final_score - a.final_score) > 0.001) return b.final_score - a.final_score;
    if (Math.abs(b.lower_confidence_score - a.lower_confidence_score) > 0.001) return b.lower_confidence_score - a.lower_confidence_score;
    if (b.raw_rating_count !== a.raw_rating_count) return b.raw_rating_count - a.raw_rating_count;
    return a.pandal_id.localeCompare(b.pandal_id);
  });

  // Assign deterministic ranks post-sort
  rankings.forEach((r, idx) => r.rank = idx + 1);

  // Pagination logic
  const totalPages = Math.ceil(rankings.length / itemsPerPage);
  const paginatedRankings = rankings.slice((rankingPage - 1) * itemsPerPage, rankingPage * itemsPerPage);

  const handleNextPage = () => {
    if (rankingPage < totalPages) setRankingPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (rankingPage > 1) setRankingPage(p => p - 1);
  };

  return (
    <div className="vote-view-container">
      {/* Top Header */}
      <div className="vote-header-block">
        <div className="title-text-group">
          <h1 className="vote-main-title">
            {activeView === 'cast_vote' ? "Rate Kolkata's Pandals" : 'Official Fair Pandal Rankings'}
          </h1>
        </div>
      </div>

      {/* Responsive Filter Switcher & Morphing Search Controls Row */}
      <div className="vote-controls-row">
        {isVoteSearchExpanded ? (
          <>
            {/* Left: Collapsed Filter Icon Button */}
            <button
              type="button"
              className="vote-filter-collapsed-btn"
              onClick={() => {
                setIsVoteSearchExpanded(false);
                setVoteSearch('');
              }}
              title="Show filter tabs"
              aria-label="Show filter tabs"
            >
              <SlidersHorizontal size={17} />
            </button>

            {/* Right: Expanded Smooth Search Bar */}
            <div className="vote-search-expanded-bar">
              <Search size={15} className="vote-search-icon-muted" />
              <input
                ref={voteSearchInputRef}
                type="text"
                className="vote-search-input"
                placeholder="Search pandals to rate..."
                value={voteSearch}
                onChange={(e) => {
                  setVoteSearch(e.target.value);
                  setRankingPage(1);
                }}
              />
              <button
                type="button"
                className="vote-search-clear-btn"
                onClick={() => {
                  if (voteSearch) {
                    setVoteSearch('');
                    voteSearchInputRef.current?.focus();
                  } else {
                    setIsVoteSearchExpanded(false);
                  }
                }}
                title={voteSearch ? "Clear search" : "Close search"}
                aria-label={voteSearch ? "Clear search" : "Close search"}
              >
                <X size={15} />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Left: Compact Filter Tabs Switcher */}
            <div className="vote-filter-holder">
              <Tabs 
                variant="segmented"
                activeId={activeView}
                onChange={(id) => {
                  setActiveView(id as 'cast_vote' | 'pandals_ranking');
                  if (id === 'pandals_ranking') setRankingPage(1);
                }}
                items={[
                  { id: 'cast_vote', label: 'Cast Vote', icon: <Vote size={15} /> },
                  { id: 'pandals_ranking', label: 'Pandals Ranking', icon: <TrendingUp size={15} /> }
                ]}
              />
            </div>

            {/* Right: Search Icon Trigger */}
            <button
              type="button"
              className="vote-search-icon-btn"
              onClick={() => {
                setIsVoteSearchExpanded(true);
                setTimeout(() => voteSearchInputRef.current?.focus(), 50);
              }}
              title="Search pandals"
              aria-label="Search pandals"
            >
              <Search size={17} />
            </button>
          </>
        )}
      </div>

      {/* Category Selector Pills (Shared by both views) */}
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

      {/* =======================================================================
          VIEW 1: CAST VOTE (List Pandals to Rate)
          ======================================================================= */}
      {activeView === 'cast_vote' && (
        <div className="cast-vote-section">
          <div className="nominees-section">

            <div className="nominees-grid">
              {filteredPandals.slice(0, 40).map((pandal) => {
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
                        <span className="loc-sep">•</span>
                        <span className="nominee-location">{pandal.address}</span>
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
          </div>
        </div>
      )}

      {/* =======================================================================
          VIEW 2: PANDALS RANKING (Statistical Engine Output)
          ======================================================================= */}
      {activeView === 'pandals_ranking' && (
        <div className="ranking-view-section">


          <div className="nominees-grid">
            {paginatedRankings.map((pandalRank) => {
              const rank = pandalRank.rank;
              const isEligible = pandalRank.is_rank_eligible;

              return (
                <Card
                  key={pandalRank.id}
                  variant="interactive"
                  padding="none"
                  rounded="lg"
                  className={`nominee-compact-card ranking-card ${!isEligible ? 'is-ineligible' : ''}`}
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

                  <div className="nominee-compact-info ranking-info-flex">
                    <div className="ranking-title-row">
                      <div className="nominee-title-location-row">
                        <span className="nominee-name">{pandalRank.pandal_name}</span>
                        <span className="loc-sep">|</span>
                        <span className="nominee-location">{pandalRank.pandal_address}</span>
                      </div>
                      
                      <div className="ranking-score-display">
                        <span className="big-score">{pandalRank.final_score.toFixed(2)}</span>
                        <span className="score-star">★</span>
                      </div>
                    </div>

                    <div className="ranking-meta-row">
                      <span className="rating-count-pill">{pandalRank.raw_rating_count.toLocaleString()} verified ratings</span>
                      {!isEligible && (
                        <span className="eligibility-warning text-yellow-500 text-xs">Insufficient evidence</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <Button 
                variant="outline" 
                size="sm" 
                className="pagination-icon-btn"
                onClick={handlePrevPage} 
                disabled={rankingPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              
              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current
                  let pNum = rankingPage - 2 + i;
                  if (rankingPage <= 3) pNum = i + 1;
                  if (rankingPage >= totalPages - 2) pNum = totalPages - 4 + i;
                  if (pNum < 1 || pNum > totalPages) return null;
                  
                  return (
                    <button 
                      key={pNum}
                      className={`page-num-btn ${rankingPage === pNum ? 'is-active' : ''}`}
                      onClick={() => setRankingPage(pNum)}
                    >
                      {pNum}
                    </button>
                  );
                })}
                {totalPages > 5 && rankingPage < totalPages - 2 && <span className="page-ellipsis">...</span>}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="pagination-icon-btn"
                onClick={handleNextPage}
                disabled={rankingPage === totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .vote-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          margin-bottom: 14px;
        }

        .vote-filter-holder {
          display: flex;
          align-items: center;
          max-width: calc(100% - 50px);
          animation: voteFilterFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
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

        @keyframes voteSearchExpand {
          from {
            opacity: 0;
            transform: scale(0.96) translateX(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }
        @keyframes voteFilterFadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes voteIconFadeIn {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
