import React from 'react';
import { useStore } from './lib/store';
import { useAuth } from './lib/auth';
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
import { initLenis, scrollToPosition } from './lib/lenis';

export const AppContent: React.FC = () => {
  const {
    activeTab,
    selectedPandal,
    selectedFriendProfile,
    isLoading,
    setActiveTab,
    setSelectedPandal,
    setSelectedFriendProfile,
    showToast
  } = useStore();

  const { session, loading: authLoading } = useAuth();

  // Scroll Position Memory per tab and for modal transitions
  const scrollPosMapRef = React.useRef<{ [tab: string]: number }>({});
  const savedPandalScrollRef = React.useRef<number>(0);
  const prevPandalRef = React.useRef<any>(null);
  const prevTabRef = React.useRef<string>(activeTab);
  const isInitialLoadDoneRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    // Initialize Lenis smooth scroll
    initLenis();

    // Basic URL routing for reset-password
    if (window.location.pathname === '/reset-password' || window.location.hash.includes('type=recovery')) {
      setActiveTab('reset-password');
    }
  }, [setActiveTab]);

  // Continuously record scroll position for the current active tab
  React.useEffect(() => {
    const handleScroll = () => {
      if (!selectedPandal && !isLoading) {
        const y = window.scrollY;
        scrollPosMapRef.current[activeTab] = y;
        try {
          sessionStorage.setItem(`aabesh_scroll_${activeTab}`, String(y));
        } catch {}
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, selectedPandal, isLoading]);

  // Restore scroll position on initial load
  React.useEffect(() => {
    if (!isLoading && !isInitialLoadDoneRef.current) {
      isInitialLoadDoneRef.current = true;
      try {
        const saved = sessionStorage.getItem(`aabesh_scroll_${activeTab}`);
        if (saved !== null) {
          const y = parseInt(saved, 10);
          if (!isNaN(y) && y > 0) {
            scrollPosMapRef.current[activeTab] = y;
            setTimeout(() => {
              scrollToPosition(y, true);
            }, 60);
          }
        }
      } catch {}
    }
  }, [isLoading, activeTab]);

  // Protected Route Logic
  React.useEffect(() => {
    const protectedTabs = ['friends', 'activity', 'profile', 'vote'];
    if (!authLoading && !session && protectedTabs.includes(activeTab)) {
      setActiveTab('login' as any);
      showToast('Please sign in to access this feature', 'warning');
    }
  }, [activeTab, session, authLoading, setActiveTab, showToast]);

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

  // Pandal Modal Open / Close Scroll Restoration
  React.useEffect(() => {
    if (selectedPandal && !prevPandalRef.current) {
      // Modal OPENED: save previous scroll position, then scroll to top for detail view
      savedPandalScrollRef.current = window.scrollY;
      scrollToPosition(0, true);
    } else if (!selectedPandal && prevPandalRef.current) {
      // Modal CLOSED: restore previous scroll position
      const restoreY = savedPandalScrollRef.current || scrollPosMapRef.current[activeTab] || 0;
      setTimeout(() => {
        scrollToPosition(restoreY, true);
      }, 40);
    }
    prevPandalRef.current = selectedPandal;
  }, [selectedPandal, activeTab]);

  // Tab change scroll restoration
  React.useEffect(() => {
    if (activeTab !== prevTabRef.current) {
      const targetY = scrollPosMapRef.current[activeTab] ?? 0;
      setTimeout(() => {
        scrollToPosition(targetY, true);
      }, 40);
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--kirti-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 20 }}>
          <span style={{ fontFamily: 'var(--font-brand)', fontSize: 34, fontWeight: 400, letterSpacing: '0.02em', color: 'var(--text-primary)' }}>aabesh</span>
        </div>
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
