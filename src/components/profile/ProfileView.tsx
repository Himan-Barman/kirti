import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Card, Input, Button, Avatar, StarRating } from '../ui';
import { Shield, Check, Database, Edit3 } from 'lucide-react';
import { SupabaseConfigModal } from './SupabaseConfigModal';
import type { VisibilitySetting } from '../../types/database.types';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    settings,
    updateSettings,
    updateProfile,
    pandals,
    friends,
    toggleVisit,
    setSelectedPandal
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.display_name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const visitedPandals = pandals.filter(p => p.userVisited);
  const ratedPandals = pandals.filter(p => p.userRating && p.userRating > 0);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      display_name: displayName.trim() || currentUser.display_name,
      bio: bio.trim() || undefined
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-view-container">
      {/* Profile Header Card */}
      <Card variant="default" padding="lg" rounded="2xl" className="profile-header-card">
        <div className="profile-top-row">
          <Avatar
            src={currentUser.avatar_url}
            alt={currentUser.display_name}
            size="xl"
            bordered={true}
          />
          <div className="profile-identity">
            <h1 className="profile-name">{currentUser.display_name}</h1>
            <span className="profile-handle">@{currentUser.username}</span>
            {currentUser.bio && <p className="profile-bio">{currentUser.bio}</p>}
          </div>

          <Button
            variant="outline"
            size="sm"
            rounded="full"
            icon={<Edit3 size={13} />}
            onClick={() => setIsEditing(!isEditing)}
            className="edit-btn"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {/* In-place Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleProfileSave} className="profile-edit-box">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              rounded="md"
            />
            <Input
              label="Bio / Tagline"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your Puja hopping style..."
              rounded="md"
            />
            <div className="edit-actions">
              <Button type="submit" variant="dark" size="sm" rounded="full">
                Save Changes
              </Button>
            </div>
          </form>
        )}

        {/* Metric Counters */}
        <div className="profile-stats-grid">
          <div className="stat-card">
            <span className="stat-highlight-num">{visitedPandals.length}</span>
            <span className="stat-highlight-label">Pandals Visited</span>
          </div>
          <div className="stat-card">
            <span className="stat-highlight-num">{ratedPandals.length}</span>
            <span className="stat-highlight-label">Ratings Given</span>
          </div>
          <div className="stat-card">
            <span className="stat-highlight-num">{friends.length}</span>
            <span className="stat-highlight-label">Puja Friends</span>
          </div>
        </div>
      </Card>

      {/* Visited Pandals Grid */}
      <Card variant="default" padding="lg" rounded="2xl" className="profile-section-card">
        <div className="section-header-row">
          <div>
            <h3 className="section-heading">My Visited Pandals ({visitedPandals.length})</h3>
            <p className="section-subheading">Your personal Puja itinerary and exploration passport</p>
          </div>
        </div>

        {visitedPandals.length > 0 ? (
          <div className="visited-grid">
            {visitedPandals.map((pandal) => (
              <Card
                key={pandal.id}
                variant="interactive"
                padding="sm"
                rounded="lg"
                className="visited-item-card"
                onClick={() => setSelectedPandal(pandal)}
              >
                <img src={pandal.image_url} alt={pandal.name} className="visited-thumb" />
                <div className="visited-details">
                  <h4 className="visited-name">{pandal.name}</h4>
                  <span className="visited-zone">{pandal.zone}</span>
                  {pandal.userRating && (
                    <div className="user-rating-pill">
                      <StarRating value={pandal.userRating} size={11} />
                      <span className="rating-tag">You rated {pandal.userRating}★</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="visited"
                  size="sm"
                  rounded="full"
                  icon={<Check size={13} strokeWidth={3} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisit(pandal.id);
                  }}
                  title="Remove from visits"
                />
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-passport">
            <p>You haven't marked any pandals as visited yet.</p>
            <p className="empty-sub">Explore pandals on Discover or Map and tap <strong>Mark as Visited</strong>!</p>
          </div>
        )}
      </Card>

      {/* Social Privacy Controls */}
      <Card variant="default" padding="lg" rounded="2xl" className="profile-section-card">
        <div className="section-header-row">
          <div className="privacy-title-group">
            <Shield size={18} className="shield-icon" />
            <div>
              <h3 className="section-heading">Social Privacy Settings</h3>
              <p className="section-subheading">Control who can discover your visits and activity</p>
            </div>
          </div>
        </div>

        <div className="privacy-options-list">
          {/* Visit Visibility */}
          <div className="privacy-item">
            <div className="privacy-label-col">
              <span className="privacy-label">Who can see my visited pandals?</span>
              <span className="privacy-desc">Controls visibility of your checked-in pandals to other users</span>
            </div>

            <div className="radio-group">
              {(['friends', 'public', 'private'] as VisibilitySetting[]).map((val) => (
                <label key={val} className={`radio-label ${settings.visit_visibility === val ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="visit_visibility"
                    value={val}
                    checked={settings.visit_visibility === val}
                    onChange={() => updateSettings({ visit_visibility: val })}
                  />
                  <span>
                    {val === 'friends' && 'Friends Only (Default)'}
                    {val === 'public' && 'Everyone (Public)'}
                    {val === 'private' && 'Only Me (Private)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Profile Visibility */}
          <div className="privacy-item">
            <div className="privacy-label-col">
              <span className="privacy-label">Profile Visibility</span>
              <span className="privacy-desc">Who can view your profile metrics and ratings</span>
            </div>

            <div className="radio-group">
              {(['public', 'friends', 'private'] as VisibilitySetting[]).map((val) => (
                <label key={val} className={`radio-label ${settings.profile_visibility === val ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="profile_visibility"
                    value={val}
                    checked={settings.profile_visibility === val}
                    onChange={() => updateSettings({ profile_visibility: val })}
                  />
                  <span>
                    {val === 'public' && 'Public (Everyone)'}
                    {val === 'friends' && 'Friends Only'}
                    {val === 'private' && 'Private'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Supabase Developer & Backend Modal trigger */}
      <Card variant="subtle" padding="md" rounded="xl" className="dev-card">
        <div className="dev-header">
          <div className="db-pill">
            <Database size={16} />
            <span>Supabase Cloud Integration</span>
          </div>
          <Button variant="dark" size="sm" rounded="full" onClick={() => setIsConfigOpen(true)}>
            Configure Database
          </Button>
        </div>
      </Card>

      {/* Supabase Config Modal */}
      <SupabaseConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      <style>{`
        .profile-view-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 860px;
          margin: 0 auto;
        }
        .profile-top-row {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          position: relative;
        }
        .profile-identity {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .profile-name {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .profile-handle {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        .profile-bio {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .edit-btn {
          margin-left: auto;
        }
        .profile-edit-box {
          margin-top: 18px;
          padding: 18px;
          background: var(--bg-card-subtle);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .edit-actions {
          display: flex;
          justify-content: flex-end;
        }
        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 24px;
        }
        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 18px;
          background: var(--bg-card-subtle);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
        }
        .stat-highlight-num {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .stat-highlight-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 600;
        }
        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .section-heading {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .section-subheading {
          font-size: 13px;
          color: var(--text-muted);
        }
        .visited-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
        }
        .visited-item-card {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .visited-thumb {
          width: 54px;
          height: 54px;
          border-radius: var(--radius-md);
          object-fit: cover;
        }
        .visited-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        .visited-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .visited-zone {
          font-size: 11px;
          color: var(--text-muted);
        }
        .user-rating-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        .rating-tag {
          font-size: 11px;
          font-weight: 600;
          color: var(--kirti-gold);
        }
        .empty-passport {
          padding: 28px;
          text-align: center;
          background: var(--bg-card-subtle);
          border-radius: var(--radius-xl);
          color: var(--text-secondary);
        }
        .empty-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .privacy-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .shield-icon {
          color: var(--kirti-red);
        }
        .privacy-options-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .privacy-item {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .privacy-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .privacy-label-col {
          display: flex;
          flex-direction: column;
        }
        .privacy-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .privacy-desc {
          font-size: 12px;
          color: var(--text-muted);
        }
        .radio-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .radio-label.selected {
          background: var(--bg-card);
          border-color: var(--border-focus);
          font-weight: 700;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .dev-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .db-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};
