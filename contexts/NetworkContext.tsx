import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

interface NetworkContextType {
  isOnline: boolean;
  isConnecting: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const appState = React.useRef(AppState.currentState);

  useEffect(() => {
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // For web, we can use the online/offline events
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        console.log('[Network] Device is online');
        setIsOnline(true);
        setIsConnecting(false);
      };

      const handleOffline = () => {
        console.log('[Network] Device is offline');
        setIsOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        subscription.remove();
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (state: AppStateStatus) => {
    appState.current = state;

    if (state === 'active') {
      console.log('[Network] App came to foreground, checking connection');
      // App has come to the foreground, mark as connecting then online
      setIsConnecting(true);
      // Simulate a brief connection check
      setTimeout(() => {
        setIsOnline(true);
        setIsConnecting(false);
      }, 500);
    } else if (state === 'background') {
      console.log('[Network] App went to background');
    }
  };

  return (
    <NetworkContext.Provider value={{ isOnline, isConnecting }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
