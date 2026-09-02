import React from 'react';
import { useStore } from './lib/store';
import { Navbar } from './components/navigation/Navbar';
import { MobileNav } from './components/navigation/MobileNav';
import { Footer } from './components/navigation/Footer';
import { PandalFilters } from './components/pandal/PandalFilters';
import { PandalDetailModal } from './components/pandal/PandalDetailModal';
import { PandalMap } from './components/pandal/PandalMap';
import { FriendJourneyCompare } from './components/friends/FriendJourneyCompare';
import { FriendActivityFeed } from './components/friends/FriendActivityFeed';
import { FriendList } from './components/friends/FriendList';
import { FriendProfileModal } from './components/friends/FriendProfileModal';
import { ProfileView } from './components/profile/ProfileView';
import { LandingShowcase } from './components/pandal/LandingShowcase';
import { VoteView } from './components/vote/VoteView';
import { Check } from 'lucide-react';

export const AppContent: React.FC = () => {
  const {
    activeTab,
    toastMessage,
    selectedPandal,
    selectedFriendProfile,
    isLoading
  } = useStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--kirti-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ marginTop: 20, fontFamily: 'var(--font-bengali)', fontSize: 24, fontWeight: 'bold' }}>কীর্তি</h2>
        <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>Connecting to Supabase...</p>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Top Navigation Bar with Dark Mode Toggle & Search Popup */}
      <Navbar />

      {/* Main View Container */}
      <main className="main-content">
        {selectedPandal ? (
          <div className="pandal-detail-view-wrapper">
            <PandalDetailModal />
          </div>
        ) : (
          <>
            {/* DISCOVER / LANDING TAB */}
            {activeTab === 'discover' && <LandingShowcase />}

            {/* MAP TAB */}
            {activeTab === 'map' && (
              <div className="map-view-wrapper">
                <PandalFilters />
                <PandalMap />
              </div>
            )}

            {/* FRIENDS TAB */}
            {activeTab === 'friends' && (
              <div className="friends-view-wrapper">
                <FriendJourneyCompare showTop3Only={false} />
                <FriendList />
              </div>
            )}

            {/* VOTE TAB (Puja Awards 2026) */}
            {activeTab === 'vote' && (
              <div className="vote-view-wrapper">
                <VoteView />
              </div>
            )}

            {/* ACTIVITY TAB (Fallback/Alternate view) */}
            {activeTab === 'activity' && (
              <div className="activity-view-wrapper">
                <FriendActivityFeed />
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="profile-view-wrapper">
                <ProfileView />
              </div>
            )}
          </>
        )}
      </main>

      {/* Professional Footer */}
      <Footer />

      {/* Mobile Navigation Bottom Bar */}
      <MobileNav />

      {/* Global Modals */}
      {selectedFriendProfile && <FriendProfileModal />}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="kirti-toast">
          <Check size={16} strokeWidth={3} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
