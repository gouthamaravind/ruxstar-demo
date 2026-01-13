import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vendor, getCurrentVendorLocal, setCurrentVendorLocal } from '@/lib/types';

interface AppContextType {
  mode: 'social' | 'pod';
  setMode: (mode: 'social' | 'pod') => void;
  currentVendor: Vendor | null;
  setCurrentVendor: (vendor: Vendor | null) => void;
  isVendorLoggedIn: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<'social' | 'pod'>('pod');
  const [currentVendor, setCurrentVendorState] = useState<Vendor | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('ruxstar_mode') as 'social' | 'pod';
    if (savedMode) setModeState(savedMode);
    
    const savedVendor = getCurrentVendorLocal();
    if (savedVendor) setCurrentVendorState(savedVendor);
  }, []);

  const setMode = (newMode: 'social' | 'pod') => {
    setModeState(newMode);
    localStorage.setItem('ruxstar_mode', newMode);
  };

  const setCurrentVendor = (vendor: Vendor | null) => {
    setCurrentVendorState(vendor);
    setCurrentVendorLocal(vendor);
  };

  return (
    <AppContext.Provider value={{
      mode,
      setMode,
      currentVendor,
      setCurrentVendor,
      isVendorLoggedIn: !!currentVendor,
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
