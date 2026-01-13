import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vendor, getAppMode, setAppMode as saveAppMode, getCurrentVendor, setCurrentVendor as saveCurrentVendor, initializeMockData } from '@/lib/mockData';

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
    initializeMockData();
    setModeState(getAppMode());
    setCurrentVendorState(getCurrentVendor());
  }, []);

  const setMode = (newMode: 'social' | 'pod') => {
    setModeState(newMode);
    saveAppMode(newMode);
  };

  const setCurrentVendor = (vendor: Vendor | null) => {
    setCurrentVendorState(vendor);
    saveCurrentVendor(vendor);
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
