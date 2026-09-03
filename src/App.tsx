import React from 'react';
import { useStore } from './lib/store';
import { Navbar } from './components/navigation/Navbar';
import { MobileNav } from './components/navigation/MobileNav';
import { Footer } from './components/navigation/Footer';
import { PandalDetailModal } from './components/pandal/PandalDetailModal';
import { PandalMap } from './components/pandal/PandalMap';
import { FriendJourneyCompare } from './components/friends/FriendJourneyCompare';
import { FriendActivityFeed } from './components/friends/FriendActivityFeed';
import { FriendList } from './components/friends/FriendList';
import { FriendProfileModal } from './components/friends/FriendProfileModal';
import { ProfileView } from './components/profile/ProfileView';
import { LandingShowcase } from './components/pandal/LandingShowcase';
import { NearbyView } from './components/pandal/NearbyView';
import { VoteView } from './components/vote/VoteView';
import { LoginView } from './components/auth/LoginView';
import { SignupView } from './components/auth/SignupView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { ResetPasswordView } from './components/auth/ResetPasswordView';
import { ToastContainer } from './components/ui/Toast';
import { X } from 'lucide-react';
import { initLenis, scrollToTop } from './lib/lenis';

export const AppContent: React.FC = () => {
  const {
    activeTab,
    selectedPandal,
    selectedFriendProfile,
    isLoading,
    setActiveTab,
    setSelectedPandal,
    setSelectedFriendProfile
  } = useStore();

  React.useEffect(() => {
    // Initialize Lenis smooth scroll
    initLenis();

    // Basic URL routing for reset-password
    if (window.location.pathname === '/reset-password' || window.location.hash.includes('type=recovery')) {
      setActiveTab('reset-password');
    }
  }, [setActiveTab]);

  // Browser History & Mobile Back Navigation Controller
  React.useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ type: 'tab', tab: activeTab }, '', window.location.href);
    }

    const handlePopState = (e: PopStateEvent) => {
      // 1. If a friend profile modal is open, close it
      if (selectedFriendProfile) {
        setSelectedFriendProfile(null);
        return;
      }

      // 2. If a pandal detail modal is open, close it
      if (selectedPandal) {
        setSelectedPandal(null);
        return;
      }

      // 3. If history state has a tab, navigate to it
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else if (activeTab !== 'discover') {
        setActiveTab('discover');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedFriendProfile, selectedPandal, activeTab, setSelectedFriendProfile, setSelectedPandal, setActiveTab]);

  // Push history state when user opens a pandal detail
  const lastPandalIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (selectedPandal && selectedPandal.id !== lastPandalIdRef.current) {
      lastPandalIdRef.current = selectedPandal.id;
      window.history.pushState({ type: 'pandal', id: selectedPandal.id, tab: activeTab }, '', window.location.href);
    } else if (!selectedPandal) {
      lastPandalIdRef.current = null;
    }
  }, [selectedPandal, activeTab]);

  // Push history state when user opens a friend profile
  const lastFriendIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (selectedFriendProfile && selectedFriendProfile.id !== lastFriendIdRef.current) {
      lastFriendIdRef.current = selectedFriendProfile.id;
      window.history.pushState({ type: 'friend', id: selectedFriendProfile.id, tab: activeTab }, '', window.location.href);
    } else if (!selectedFriendProfile) {
      lastFriendIdRef.current = null;
    }
  }, [selectedFriendProfile, activeTab]);

  // Push history state when user changes active tab
  const lastTabRef = React.useRef<string>(activeTab);
  React.useEffect(() => {
    if (activeTab !== lastTabRef.current) {
      lastTabRef.current = activeTab;
      window.history.pushState({ type: 'tab', tab: activeTab }, '', window.location.href);
    }
  }, [activeTab]);

  // Scroll to top immediately on tab change or pandal select
  React.useEffect(() => {
    scrollToTop(true);
  }, [activeTab, selectedPandal]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--kirti-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ marginTop: 20, fontFamily: 'var(--font-bengali)', fontSize: 24, fontWeight: 'bold' }}>কীর্তি</h2>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const isAuthTab = ['login', 'signup', 'forgot-password', 'reset-password'].includes(activeTab);

  return (
    <div className={`app-layout ${isAuthTab ? 'auth-mode' : ''}`}>
      {/* Auth Skip Button */}
      {isAuthTab && (
        <button 
          className="auth-skip-btn" 
          onClick={() => setActiveTab('discover')}
          title="Skip and view as guest"
        >
          <X size={24} />
        </button>
      )}

      {/* Top Navigation Bar with Dark Mode Toggle & Search Popup */}
      {!isAuthTab && <Navbar />}

      {/* Main View Container */}
      <main className={`main-content ${isAuthTab ? 'auth-main' : ''}`}>
        {selectedPandal ? (
          <div className="pandal-detail-view-wrapper">
            <PandalDetailModal />
          </div>
        ) : (
          <>
            {/* DISCOVER / LANDING TAB */}
            {activeTab === 'discover' && <LandingShowcase />}

            {/* NEARBY PROXIMITY RADAR TAB */}
            {activeTab === 'nearby' && (
              <div className="nearby-view-wrapper">
                <NearbyView />
              </div>
            )}

            {/* MAP TAB */}
            {activeTab === 'map' && (
              <div className="map-view-wrapper">
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

            {/* AUTH TABS */}
            {activeTab === 'login' && <LoginView />}
            {activeTab === 'signup' && <SignupView />}
            {activeTab === 'forgot-password' && <ForgotPasswordView />}
            {activeTab === 'reset-password' && <ResetPasswordView />}
          </>
        )}
      </main>

      {/* Professional Footer (Shown ONLY in Discover tab) */}
      {!isAuthTab && activeTab === 'discover' && !selectedPandal && (
        <Footer />
      )}

      {/* Mobile Navigation Bottom Bar */}
      {!isAuthTab && <MobileNav />}

      {/* Global Modals */}
      {selectedFriendProfile && <FriendProfileModal />}

      {/* Global Premium Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
