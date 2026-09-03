import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '../types/database.types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data?: any }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data?: any }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateUserPassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch application profile for the logged in user
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data as Profile);
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      if (!supabase) {
        console.error('Supabase client is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY.');
        setLoading(false);
        return;
      }
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    if (!supabase) return;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth event:', event);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (event === 'PASSWORD_RECOVERY') {
        // We handle the UI redirect in App.tsx by reading the URL hash, 
        // but we ensure the session is active here.
      }

      if (newSession?.user) {
        // Wait a small moment to ensure the database trigger creates the profile
        if (event === 'SIGNED_IN') {
           setTimeout(() => fetchProfile(newSession.user.id), 500);
        } else {
          fetchProfile(newSession.user.id);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase is not configured.') };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase is not configured.') };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateUserPassword = async (password: string) => {
    if (!supabase) return { error: new Error('Supabase is not configured.') };
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateUserPassword,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
