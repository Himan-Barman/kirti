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
import {
  INITIAL_USER,
  MOCK_FRIENDS,
  OTHER_USERS,
  MOCK_PANDALS,
  INITIAL_RATINGS,
  INITIAL_VISITS,
  INITIAL_ACTIVITIES
} from './mockData';

interface FriendStats {
  visitedCount: number;
  ratingsCount: number;
  friendsCount: number;
  visitedPandals: Pandal[];
  recentRatings: Rating[];
}

interface StoreContextType {
  currentUser: Profile;
  settings: ProfileSettings;
  pandals: PandalWithStats[];
  ratings: Rating[];
  friends: Profile[];
  friendships: Friendship[];
  pendingIncomingRequests: Profile[];
  pendingOutgoingRequests: Profile[];
  activities: FriendActivity[];
  activeTab: 'discover' | 'map' | 'friends' | 'vote' | 'activity' | 'profile';
  selectedPandal: PandalWithStats | null;
  selectedFriendProfile: Profile | null;
  searchQuery: string;
  selectedZone: string;
  sortBy: 'rating' | 'visits' | 'friends' | 'name';
  toastMessage: string | null;
  theme: 'light' | 'dark';

  setActiveTab: (tab: 'discover' | 'map' | 'friends' | 'vote' | 'activity' | 'profile') => void;
  setSelectedPandal: (pandal: PandalWithStats | null) => void;
  setSelectedFriendProfile: (friend: Profile | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedZone: (zone: string) => void;
  setSortBy: (sort: 'rating' | 'visits' | 'friends' | 'name') => void;
  showToast: (msg: string) => void;
  toggleTheme: () => void;

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
  VISITS: 'kirti_visits',
  RATINGS: 'kirti_ratings',
  FRIENDSHIPS: 'kirti_friendships',
  ACTIVITIES: 'kirti_activities',
  THEME: 'kirti_theme'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: default to 'light' or system preference / saved
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

  const [currentUser, setCurrentUser] = useState<Profile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [settings, setSettings] = useState<ProfileSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : { user_id: 'user_me', visit_visibility: 'friends', profile_visibility: 'public' };
  });

  const [visits, setVisits] = useState<{ userId: string; pandalId: string; visitedAt: string }[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VISITS);
    return saved ? JSON.parse(saved) : INITIAL_VISITS;
  });

  const [ratings, setRatings] = useState<Rating[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RATINGS);
    return saved ? JSON.parse(saved) : INITIAL_RATINGS;
  });

  const [friendships, setFriendships] = useState<Friendship[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS);
    if (saved) return JSON.parse(saved);
    return MOCK_FRIENDS.map(f => ({
      id: `f_${f.id}`,
      requester_id: 'user_me',
      addressee_id: f.id,
      status: 'accepted' as const,
      created_at: '2026-08-20T10:00:00Z',
      addressee: f
    }));
  });

  const [activities, setActivities] = useState<FriendActivity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [activeTab, setActiveTab] = useState<'discover' | 'map' | 'friends' | 'vote' | 'activity' | 'profile'>('discover');
  const [selectedPandalId, setSelectedPandalId] = useState<string | null>(null);
  const [selectedFriendProfile, setSelectedFriendProfile] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'visits' | 'friends' | 'name'>('rating');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(friendships));
  }, [friendships]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  const friends: Profile[] = friendships
    .filter(f => f.status === 'accepted')
    .map(f => {
      if (f.requester_id === currentUser.id) {
        return MOCK_FRIENDS.find(m => m.id === f.addressee_id) || OTHER_USERS.find(o => o.id === f.addressee_id) || {
          id: f.addressee_id,
          username: 'friend',
          display_name: 'Puja Friend',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        };
      } else {
        return MOCK_FRIENDS.find(m => m.id === f.requester_id) || OTHER_USERS.find(o => o.id === f.requester_id) || {
          id: f.requester_id,
          username: 'friend',
          display_name: 'Puja Friend',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        };
      }
    });

  const pendingIncomingRequests: Profile[] = friendships
    .filter(f => f.status === 'pending' && f.addressee_id === currentUser.id)
    .map(f => OTHER_USERS.find(o => o.id === f.requester_id) || MOCK_FRIENDS.find(m => m.id === f.requester_id)!)
    .filter(Boolean);

  const pendingOutgoingRequests: Profile[] = friendships
    .filter(f => f.status === 'pending' && f.requester_id === currentUser.id)
    .map(f => OTHER_USERS.find(o => o.id === f.addressee_id) || MOCK_FRIENDS.find(m => m.id === f.addressee_id)!)
    .filter(Boolean);

  const pandals: PandalWithStats[] = MOCK_PANDALS.map(p => {
    const pandalRatings = ratings.filter(r => r.pandal_id === p.id);
    const avgRating = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.overall || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : 4.6;
    const ratingCount = pandalRatings.length > 0 ? pandalRatings.length + 115 : 124;

    const themeAvg = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.theme || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : Math.min(5.0, Number((avgRating + 0.1).toFixed(1)));
    const idolAvg = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.idol || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : Math.min(5.0, Number((avgRating + 0.05).toFixed(1)));
    const lightingAvg = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.lighting || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : Math.max(1.0, Number((avgRating - 0.1).toFixed(1)));
    const managementAvg = pandalRatings.length > 0
      ? Number((pandalRatings.reduce((acc, curr) => acc + (curr.scores?.management || curr.rating), 0) / pandalRatings.length).toFixed(1))
      : Math.max(1.0, Number((avgRating - 0.3).toFixed(1)));

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

    const friendsWhoVisited = friends.filter(friend =>
      pandalVisits.some(v => v.userId === friend.id)
    );

    return {
      ...p,
      avgRating,
      ratingCount,
      ratingSummary,
      visitCount: pandalVisits.length + 32,
      userVisited,
      userRating: userRatingObj?.scores?.overall || userRatingObj?.rating,
      userScores: userRatingObj?.scores,
      userReview: userRatingObj?.review,
      friendsVisitedCount: friendsWhoVisited.length,
      friendsWhoVisited
    };
  });

  const selectedPandal = selectedPandalId
    ? pandals.find(p => p.id === selectedPandalId) || null
    : null;

  const toggleVisit = (pandalId: string) => {
    const pandal = MOCK_PANDALS.find(p => p.id === pandalId);
    if (!pandal) return;

    const alreadyVisited = visits.some(v => v.userId === currentUser.id && v.pandalId === pandalId);

    if (alreadyVisited) {
      setVisits(prev => prev.filter(v => !(v.userId === currentUser.id && v.pandalId === pandalId)));
      showToast(`Removed from visited`);
    } else {
      const newVisit = {
        userId: currentUser.id,
        pandalId,
        visitedAt: new Date().toISOString()
      };
      setVisits(prev => [newVisit, ...prev]);

      const currentCount = visits.filter(v => v.userId === currentUser.id).length + 1;
      showToast(`Pandal visited ✓ (${currentCount} total)`);

      const newActivity: FriendActivity = {
        id: `act_${Date.now()}`,
        type: 'visit',
        user: currentUser,
        pandalName: pandal.name,
        pandalId: pandal.id,
        timestamp: 'Just now'
      };
      setActivities(prev => [newActivity, ...prev]);
    }
  };

  const submitRating = (
    pandalId: string,
    scoresOrRating: number | { overall: number; theme: number; idol: number; lighting: number; management: number },
    reviewText?: string
  ) => {
    const pandal = MOCK_PANDALS.find(p => p.id === pandalId);
    if (!pandal) return;

    const scores = typeof scoresOrRating === 'number'
      ? { overall: scoresOrRating, theme: scoresOrRating, idol: scoresOrRating, lighting: scoresOrRating, management: scoresOrRating }
      : scoresOrRating;

    const overallRating = scores.overall;

    const existingIndex = ratings.findIndex(r => r.user_id === currentUser.id && r.pandal_id === pandalId);
    const updatedRating: Rating = {
      id: existingIndex >= 0 ? ratings[existingIndex].id : `r_${Date.now()}`,
      user_id: currentUser.id,
      pandal_id: pandalId,
      rating: overallRating,
      scores: scores,
      is_visible: true,
      review: reviewText?.trim() || undefined,
      created_at: new Date().toISOString(),
      user: currentUser
    };

    if (existingIndex >= 0) {
      setRatings(prev => {
        const copy = [...prev];
        copy[existingIndex] = updatedRating;
        return copy;
      });
    } else {
      setRatings(prev => [updatedRating, ...prev]);
    }

    if (!visits.some(v => v.userId === currentUser.id && v.pandalId === pandalId)) {
      setVisits(prev => [{ userId: currentUser.id, pandalId, visitedAt: new Date().toISOString() }, ...prev]);
    }

    showToast(`Rating submitted for ${pandal.name} (${overallRating}★) ✓`);

    const newActivity: FriendActivity = {
      id: `act_${Date.now()}`,
      type: 'rating',
      user: currentUser,
      pandalName: pandal.name,
      pandalId: pandal.id,
      rating: overallRating,
      scores: scores,
      review: reviewText,
      timestamp: 'Just now'
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const sendFriendRequest = (targetUserId: string) => {
    const target = OTHER_USERS.find(u => u.id === targetUserId) || MOCK_FRIENDS.find(u => u.id === targetUserId);
    if (!target) return;

    const newFriendship: Friendship = {
      id: `req_${Date.now()}`,
      requester_id: currentUser.id,
      addressee_id: targetUserId,
      status: 'pending',
      created_at: new Date().toISOString(),
      addressee: target
    };
    setFriendships(prev => [...prev, newFriendship]);
    showToast(`Friend request sent to @${target.username}`);
  };

  const acceptFriendRequest = (requesterId: string) => {
    setFriendships(prev =>
      prev.map(f => {
        if (f.requester_id === requesterId && f.addressee_id === currentUser.id) {
          return { ...f, status: 'accepted' as const };
        }
        return f;
      })
    );
    const friendObj = OTHER_USERS.find(u => u.id === requesterId) || MOCK_FRIENDS.find(u => u.id === requesterId);
    showToast(`You are now friends with @${friendObj?.username || 'user'}`);
  };

  const declineFriendRequest = (requesterId: string) => {
    setFriendships(prev => prev.filter(f => !(f.requester_id === requesterId && f.addressee_id === currentUser.id)));
    showToast(`Request declined`);
  };

  const removeFriend = (friendId: string) => {
    setFriendships(prev =>
      prev.filter(f => !((f.requester_id === friendId && f.addressee_id === currentUser.id) ||
                          (f.requester_id === currentUser.id && f.addressee_id === friendId)))
    );
    showToast(`Friend removed`);
  };

  const searchUsers = (query: string): Profile[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const allKnown = [...MOCK_FRIENDS, ...OTHER_USERS];
    return allKnown.filter(u =>
      u.username.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q)
    );
  };

  const getUserStats = (userId: string): FriendStats => {
    const userVisits = visits.filter(v => v.userId === userId);
    const userRatingsList = ratings.filter(r => r.user_id === userId);
    const visitedPandals = MOCK_PANDALS.filter(p => userVisits.some(v => v.pandalId === p.id));

    const friendCount = friendships.filter(f =>
      f.status === 'accepted' && (f.requester_id === userId || f.addressee_id === userId)
    ).length;

    return {
      visitedCount: userVisits.length,
      ratingsCount: userRatingsList.length,
      friendsCount: friendCount || 6,
      visitedPandals,
      recentRatings: userRatingsList
    };
  };

  const updateSettings = (newSettings: Partial<ProfileSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast(`Privacy settings updated ✓`);
  };

  const updateProfile = (updates: Partial<Profile>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
    showToast(`Profile updated ✓`);
  };

  return (
    <StoreContext.Provider
      value={{
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
        selectedPandal,
        selectedFriendProfile,
        searchQuery,
        selectedZone,
        sortBy,
        toastMessage,
        theme,

        setActiveTab,
        setSelectedPandal: (pandal) => setSelectedPandalId(pandal?.id || null),
        setSelectedFriendProfile,
        setSearchQuery,
        setSelectedZone,
        setSortBy,
        showToast,
        toggleTheme,

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
