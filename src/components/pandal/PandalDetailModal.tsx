import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Button, Badge, Avatar } from '../ui';
import { RatingForm, UserRating } from '../rating';
import { useAuth } from '../../lib/auth';
import { ArrowLeft, MapPin, Check, Lock } from 'lucide-react';

export const PandalDetailModal: React.FC = () => {
  const {
    selectedPandal,
    setSelectedPandal,
    toggleVisit,
    submitRating,
    setSelectedFriendProfile,
    setActiveTab
  } = useStore();
  const { user } = useAuth();

  const [isEditingRating, setIsEditingRating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedPandal) return null;


  const hasUserRated = Boolean(selectedPandal.userScores || selectedPandal.userRating);

  const handleRatingSubmit = async (values: {
    overall: 1 | 2 | 3 | 4 | 5;
    theme: 1 | 2 | 3 | 4 | 5;
    idol: 1 | 2 | 3 | 4 | 5;
    lighting: 1 | 2 | 3 | 4 | 5;
    management: 1 | 2 | 3 | 4 | 5;
    review?: string;
  }) => {
    setIsSubmitting(true);
    submitRating(selectedPandal.id, {
      overall: values.overall,
      theme: values.theme,
      idol: values.idol,
      lighting: values.lighting,
      management: values.management
    }, values.review);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditingRating(false);
    }, 300);
  };

  return (
    <div className="pandal-detail-page">
      {/* Top Back Navigation */}
      <div className="detail-top-nav" onClick={() => setSelectedPandal(null)}>
        <Button variant="subtle" size="sm" icon={<ArrowLeft size={16} />}>
          Back
        </Button>
      </div>

      {/* Hero Image */}
      <div className="modal-hero">
        <img src={selectedPandal.image_url} alt={selectedPandal.name} className="hero-img" />
        <div className="hero-gradient"></div>
        <div className="hero-badge-zone">
          <Badge variant="dark" size="sm" rounded="full">
            {selectedPandal.zone}
          </Badge>
        </div>
        {selectedPandal.theme_year && (
          <div className="hero-badge-theme">
            <Badge variant="outline" size="sm" rounded="full" className="theme-pill-blur">
              {selectedPandal.theme_year}
            </Badge>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="modal-inner">
        {/* Header Info */}
        <div className="pandal-main-info">
          <h1 className="pandal-name-large">{selectedPandal.name}</h1>
          <div className="location-row">
            <MapPin size={14} className="text-muted" />
            <span>{selectedPandal.address}, {selectedPandal.city}</span>
          </div>

          {/* Description */}
          <p className="pandal-desc-text">{selectedPandal.description}</p>
        </div>

        {/* Primary 1-Tap Action: Mark Visited */}
        <div className="primary-action-section">
          <Button
            variant={selectedPandal.userVisited ? 'visited' : 'primary'}
            size="lg"
            rounded="xl"
            fullWidth={true}
            icon={selectedPandal.userVisited ? <Check size={18} strokeWidth={3} /> : undefined}
            onClick={() => {
              if (user?.id === 'guest_user' || !user) {
                setSelectedPandal(null);
                setActiveTab('signup');
                return;
              }
              toggleVisit(selectedPandal.id);
            }}
          >
            {selectedPandal.userVisited ? '✓ Visited in your Puja Passport' : 'Mark as Visited'}
          </Button>
        </div>



        {/* 2. User's Own 5-Dimension Rating / Rating Form */}
        <div className="section-block">
          <div className="section-title-row">
            <h3 className="section-title">
              {hasUserRated && !isEditingRating ? 'Your Rating' : 'Rate this Pandal'}
            </h3>
          </div>

          {!user ? (
            <div className="auth-prompt-box">
              <Lock size={24} className="text-muted" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Sign up to rate</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Create a free account to rate pandals, track your visits, and see where your friends are going.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setSelectedPandal(null);
                    setActiveTab('signup');
                  }}
                >
                  Create Account
                </Button>
              </div>
            </div>
          ) : hasUserRated && !isEditingRating && selectedPandal.userScores ? (
            <UserRating
              scores={selectedPandal.userScores}
              review={selectedPandal.userReview}
              onEdit={() => setIsEditingRating(true)}
            />
          ) : (
            <RatingForm
              initialValues={{
                scores: selectedPandal.userScores,
                review: selectedPandal.userReview
              }}
              onSubmit={handleRatingSubmit}
              onCancel={hasUserRated ? () => setIsEditingRating(false) : undefined}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* 3. Friends Visited Section */}
        <div className="section-block">
          <div className="section-title-row">
            <h3 className="section-title">Friends who visited</h3>
            <Badge variant="gray" size="sm" rounded="full">
              {selectedPandal.friendsVisitedCount} friends
            </Badge>
          </div>

          {selectedPandal.friendsVisitedCount > 0 ? (
            <div className="friends-grid-mini">
              {selectedPandal.friendsWhoVisited.map((friend) => (
                <div
                  key={friend.id}
                  className="friend-chip"
                  onClick={() => {
                    setSelectedPandal(null);
                    setSelectedFriendProfile(friend);
                  }}
                >
                  <Avatar src={friend.avatar_url} alt={friend.display_name} size="sm" />
                  <div className="friend-chip-info">
                    <span className="friend-chip-name">{friend.display_name}</span>
                    <span className="friend-chip-user">@{friend.username}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-subtext">None of your friends have checked in here yet. Be the first!</p>
          )}
        </div>


      </div>

      <style>{`
        .modal-hero {
          position: relative;
          width: 100%;
          height: 240px;
          background: var(--bg-card-subtle);
          overflow: hidden;
        }
        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 60%);
        }
        .hero-badge-zone {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
        }
        .hero-badge-theme {
          position: absolute;
          bottom: 14px;
          left: 14px;
          z-index: 2;
        }
        .theme-pill-blur {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }
        .modal-inner {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        @media (max-width: 768px) {
          .modal-hero {
            height: 200px;
            border-radius: var(--radius-xl);
          }
          .modal-inner {
            padding: 16px 0;
            gap: 20px;
          }
          .pandal-name-large {
            font-size: 20px;
          }
          .friends-grid-mini {
            grid-template-columns: 1fr;
          }
        }
        .pandal-main-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pandal-name-large {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
          letter-spacing: -0.03em;
        }
        .location-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .pandal-desc-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-top: 4px;
        }
        .primary-action-section {
          width: 100%;
        }
        .section-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }
        .section-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .section-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .friends-grid-mini {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px;
        }
        .friend-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .friend-chip:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-focus);
        }
        .friend-chip-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .friend-chip-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .friend-chip-user {
          font-size: 10px;
          color: var(--text-muted);
        }
        .empty-subtext {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }
      `}</style>

      <style>{`
        .pandal-detail-page {
          display: flex;
          flex-direction: column;
          width: 100%;
          animation: fade-in 0.3s ease;
          padding-bottom: 3rem;
        }
        .detail-top-nav {
          padding: 1rem 0;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
