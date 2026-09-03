import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Profile,
  ProfileSettings,
  Pandal,
  Rating,
  Friendship,
  FriendActivity,
  PandalWithStats
} from '../types/database.types';
import type { ToastData } from '../components/ui/Toast';
import { supabase } from './supabase';
import { useAuth } from './auth';
import { DEFAULT_KOLKATA_CENTER } from './geo';
import type { GeoCoordinates } from './geo';

interface FriendStats {
  visitedCount: number;
  ratingsCount: number;
  friendsCount: number;
  visitedPandals: Pandal[];
  recentRatings: Rating[];
}

interface StoreContextType {
  isLoading: boolean;
  currentUser: Profile;
  settings: ProfileSettings;
  pandals: PandalWithStats[];
  ratings: Rating[];
  friends: Profile[];
  friendships: Friendship[];
  pendingIncomingRequests: Profile[];
  pendingOutgoingRequests: Profile[];
  activities: FriendActivity[];
  activeTab: 'discover' | 'map' | 'nearby' | 'friends' | 'vote' | 'activity' | 'profile' | 'login' | 'signup' | 'forgot-password' | 'reset-password';
  voteActiveView: 'cast_vote' | 'pandals_ranking';
  selectedPandal: PandalWithStats | null;
  selectedFriendProfile: Profile | null;
  searchQuery: string;
  selectedZone: string;
  sortBy: 'rating' | 'visits' | 'friends' | 'name';
  toasts: ToastData[];
  toastMessage: string | null; // Keeping for backward compatibility temporarily if needed
  theme: 'light' | 'dark';

  userLocation: GeoCoordinates | null;
  locationStatus: 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';
  isLocationRefreshing: boolean;

  mapHighlightPandalId: string | null;
  showRouteOnMap: boolean;
  mapRadiusKm: number | null;

  setActiveTab: (tab: 'discover' | 'map' | 'nearby' | 'friends' | 'vote' | 'activity' | 'profile' | 'login' | 'signup' | 'forgot-password' | 'reset-password') => void;
  setVoteActiveView: (view: 'cast_vote' | 'pandals_ranking') => void;
  setSelectedPandal: (pandal: PandalWithStats | null) => void;
  setSelectedFriendProfile: (friend: Profile | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedZone: (zone: string) => void;
  setSortBy: (sort: 'rating' | 'visits' | 'friends' | 'name') => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  toggleTheme: () => void;
  refreshUserLocation: () => void;
  setMapHighlightPandalId: (id: string | null) => void;
  setShowRouteOnMap: (show: boolean) => void;
  setMapRadiusKm: (radius: number | null) => void;

  toggleVisit: (pandalId: string) => void;
  submitRating: (
    pandalId: string,
    scoresOrRating: number | { overall: number; theme: number; idol: number; lighting: number; management: number },
    review?: string
  ) => void;
  sendFriendRequest: (userId: string) => void;
  acceptFriendRequest: (userId: string) => void;
  declineFriendRequest: (userId: string) => void;
  removeFriend: (userId: string) => void;
  searchUsers: (query: string) => Profile[];
  getUserStats: (userId: string) => FriendStats;
  updateSettings: (newSettings: Partial<ProfileSettings>) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'kirti_user',
  SETTINGS: 'kirti_settings',
  THEME: 'kirti_theme',
  TAB: 'kirti_active_tab'
};

const GUEST_USER: Profile = {
  id: 'guest_user',
  username: 'guest',
  display_name: 'Guest User',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const { profile, session } = useAuth();

  const currentUser = profile || GUEST_USER;

  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<ProfileSettings>({ 
    user_id: 'guest_user', 
    visit_visibility: 'friends', 
    profile_visibility: 'public',
    rating_visibility: 'public',
    allow_friend_requests: true
  });
  
  const [dbPandals, setDbPandals] = useState<Pandal[]>([]);
  const [visits] = useState<{ userId: string; pandalId: string; visitedAt: string }[]>([]);
  const [ratings] = useState<Rating[]>([]);
  const [friendships] = useState<Friendship[]>([]);
  const [activities] = useState<FriendActivity[]>([]);

  const [activeTab, setActiveTabState] = useState<'discover' | 'map' | 'nearby' | 'friends' | 'vote' | 'activity' | 'profile' | 'login' | 'signup' | 'forgot-password' | 'reset-password'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAB);
    if (saved === 'menu') return 'discover';
    return (saved as any) || 'discover';
  });

  const setActiveTab = (tab: typeof activeTab) => {
    setActiveTabState(tab);
    localStorage.setItem(STORAGE_KEYS.TAB, tab);
  };
  const [voteActiveView, setVoteActiveView] = useState<'cast_vote' | 'pandals_ranking'>('cast_vote');
  const [selectedPandalId, setSelectedPandalId] = useState<string | null>(null);
  const [selectedFriendProfile, setSelectedFriendProfile] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'visits' | 'friends' | 'name'>('rating');
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [toastMessage] = useState<string | null>(null);

  // Live GPS & Location State
  const [userLocation, setUserLocation] = useState<GeoCoordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'>('idle');
  const [isLocationRefreshing, setIsLocationRefreshing] = useState(false);

  // Map Route & Highlighting State
  const [mapHighlightPandalId, setMapHighlightPandalId] = useState<string | null>(null);
  const [showRouteOnMap, setShowRouteOnMap] = useState(false);
  const [mapRadiusKm, setMapRadiusKm] = useState<number | null>(null);

  const refreshUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      setUserLocation(DEFAULT_KOLKATA_CENTER);
      showToast('Geolocation is not supported by your browser', 'warning');
      return;
    }

    setLocationStatus('requesting');
    setIsLocationRefreshing(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLocationStatus('granted');
        setIsLocationRefreshing(false);
        showToast('Live GPS location updated', 'success');
      },
      (err) => {
        console.warn('Geolocation denied or error:', err.message);
        setLocationStatus('denied');
        setUserLocation(DEFAULT_KOLKATA_CENTER);
        setIsLocationRefreshing(false);
        showToast('Location permission denied. Using Kolkata Central.', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    refreshUserLocation();
  }, []);

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchSupabaseData = async () => {
      setIsLoading(true);
      try {
        if (!supabase) throw new Error("Supabase client not configured");

        // Fetch Pandals with Locations and Zones
        const { data: pandalData, error: pandalError } = await supabase
          .from('pandals')
          .select(`
            id, legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status,
            pandal_locations ( address, city, latitude, longitude, zones ( name ) ),
            pandal_images ( public_url, is_primary )
          `);

        if (pandalError) {
          console.error("Error fetching pandals:", pandalError);
        } else if (pandalData) {
          const DEFAULT_IMAGES = [
            '/durga-traditional.jpg',
            '/durga-portrait.jpg',
            '/durga-pandal.jpg'
          ];

          const mappedPandals: Pandal[] = pandalData.map((p: any, index: number) => {
            const loc = Array.isArray(p.pandal_locations) ? p.pandal_locations[0] : p.pandal_locations;
            const zoneName = loc?.zones?.name || 'Unknown Zone';
            const img = Array.isArray(p.pandal_images) 
              ? (p.pandal_images.find((i: any) => i.is_primary) || p.pandal_images[0])
              : p.pandal_images;
            
            let finalImageUrl = img?.public_url;
            if (!finalImageUrl || finalImageUrl.includes('unsplash.com')) {
              finalImageUrl = DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
            }

            return {
              id: p.id,
              legacy_id: p.legacy_id,
              name: p.name,
              name_bn: p.name_bn,
              slug: p.slug,
              committee_name: p.committee_name,
              description: p.description || '',
              historical_significance: p.historical_significance,
              founded_year: p.founded_year,
              heritage_status: p.heritage_status,
              address: loc?.address || '',
              zone: zoneName,
              city: loc?.city || 'Kolkata',
              latitude: loc?.latitude || 0,
              longitude: loc?.longitude || 0,
              image_url: finalImageUrl
            };
          });
          setDbPandals(mappedPandals);
        }

      } catch (err) {
        console.error("Supabase fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupabaseData();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToasts(prev => {
      // Deduplicate: Don't show the exact same message if it's already visible
      if (prev.some(t => t.message === msg)) return prev;
      
      const id = Math.random().toString(36).substring(2, 9);
      return [...prev, { id, message: msg, type }];
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const friends: Profile[] = [];
  const pendingIncomingRequests: Profile[] = [];
  const pendingOutgoingRequests: Profile[] = [];

  const pandals: PandalWithStats[] = dbPandals.map(p => {
    const pandalRatings = ratings.filter(r => r.pandal_id === p.id);
    const avgRating = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.overall || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : 0;
    const ratingCount = pandalRatings.length;

    const themeAvg = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.theme || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : 0;
    const idolAvg = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.idol || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : 0;
    const lightingAvg = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.lighting || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : 0;
    const managementAvg = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.management || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : 0;

    const ratingSummary = {
      pandal_id: p.id,
      overall_rating: avgRating,
      theme_rating: themeAvg,
      idol_rating: idolAvg,
      lighting_rating: lightingAvg,
      management_rating: managementAvg,
      overall_count: ratingCount,
      theme_count: ratingCount,
      idol_count: ratingCount,
      lighting_count: ratingCount,
      management_count: ratingCount,
      total_ratings: ratingCount
    };

    const pandalVisits = visits.filter(v => v.pandalId === p.id);
    const userVisited = pandalVisits.some(v => v.userId === currentUser.id);
    const userRatingObj = pandalRatings.find(r => r.user_id === currentUser.id);

    return {
      ...p,
      avgRating,
      ratingCount,
      ratingSummary,
      visitCount: pandalVisits.length,
      userVisited,
      userRating: userRatingObj?.scores?.overall || userRatingObj?.rating,
      userScores: userRatingObj?.scores,
      userReview: userRatingObj?.review,
      friendsVisitedCount: 0,
      friendsWhoVisited: []
    };
  });

  const selectedPandal = selectedPandalId
    ? pandals.find(p => p.id === selectedPandalId) || null
    : null;

  const toggleVisit = async (_pandalId: string) => {
    if (!session) {
      showToast("Login required", "warning");
      return;
    }
    // Optimistic UI Visit Tracking
    showToast("Visit logged", "success");
  };

  const submitRating = async (
    _pandalId: string,
    _scoresOrRating: number | { overall: number; theme: number; idol: number; lighting: number; management: number },
    _reviewText?: string
  ) => {
    if (!session) {
      showToast("Login required", "warning");
      return;
    }
    // Optimistic Mock Submission
    showToast("Rating submitted", "success");
  };

  const sendFriendRequest = async (_targetUserId: string) => {
    if (!session) {
      showToast("Login required", "warning");
      return;
    }
    showToast("Friend request sent", "success");
  };

  const acceptFriendRequest = (_requesterId: string) => {};
  const declineFriendRequest = (_requesterId: string) => {};
  const removeFriend = (_friendId: string) => {};
  
  const searchUsers = (_query: string): Profile[] => {
    return [];
  };

  const getUserStats = (_userId: string): FriendStats => {
    return {
      visitedCount: 0,
      ratingsCount: 0,
      friendsCount: 0,
      visitedPandals: [],
      recentRatings: []
    };
  };

  const updateSettings = (newSettings: Partial<ProfileSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast(`Settings updated`, "success");
  };

  const updateProfile = async (_updates: Partial<Profile>) => {
    showToast(`Coming soon`, "info");
  };

  return (
    <StoreContext.Provider
      value={{
        isLoading,
        currentUser,
        settings,
        pandals,
        ratings,
        friends,
        friendships,
        pendingIncomingRequests,
        pendingOutgoingRequests,
        activities,
        activeTab,
        voteActiveView,
        selectedPandal,
        selectedFriendProfile,
        searchQuery,
        selectedZone,
        sortBy,
        toasts,
        toastMessage,
        theme,

        userLocation,
        locationStatus,
        isLocationRefreshing,

        mapHighlightPandalId,
        showRouteOnMap,
        mapRadiusKm,

        setActiveTab,
        setVoteActiveView,
        setSelectedPandal: (pandal) => setSelectedPandalId(pandal?.id || null),
        setSelectedFriendProfile,
        setSearchQuery,
        setSelectedZone,
        setSortBy,
        showToast,
        removeToast,
        toggleTheme,
        refreshUserLocation,
        setMapHighlightPandalId,
        setShowRouteOnMap,
        setMapRadiusKm,

        toggleVisit,
        submitRating,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
        searchUsers,
        getUserStats,
        updateSettings,
        updateProfile
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
