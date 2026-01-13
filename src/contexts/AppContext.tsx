import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor, getCurrentVendorLocal, setCurrentVendorLocal } from '@/lib/types';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  mode: 'social' | 'pod';
  setMode: (mode: 'social' | 'pod') => void;
  // Vendor auth (separate system)
  currentVendor: Vendor | null;
  setCurrentVendor: (vendor: Vendor | null) => void;
  isVendorLoggedIn: boolean;
  // User auth (Supabase auth)
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isUserLoggedIn: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<'social' | 'pod'>('pod');
  const [currentVendor, setCurrentVendorState] = useState<Vendor | null>(null);
  
  // User auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      setProfile(data as Profile | null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(() => fetchProfile(newSession.user.id), 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    // Load saved mode and vendor
    const savedMode = localStorage.getItem('ruxstar_mode') as 'social' | 'pod';
    if (savedMode) setModeState(savedMode);
    
    const savedVendor = getCurrentVendorLocal();
    if (savedVendor) setCurrentVendorState(savedVendor);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setMode = (newMode: 'social' | 'pod') => {
    setModeState(newMode);
    localStorage.setItem('ruxstar_mode', newMode);
  };

  const setCurrentVendor = (vendor: Vendor | null) => {
    setCurrentVendorState(vendor);
    setCurrentVendorLocal(vendor);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AppContext.Provider value={{
      mode,
      setMode,
      currentVendor,
      setCurrentVendor,
      isVendorLoggedIn: !!currentVendor,
      user,
      session,
      profile,
      isUserLoggedIn: !!user,
      isLoading,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}