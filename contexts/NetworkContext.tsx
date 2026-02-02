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
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        setIsOnline(true);
        setIsConnecting(false);
      };
      const handleOffline = () => {
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
      setIsConnecting(true);
      setTimeout(() => {
        setIsOnline(true);
        setIsConnecting(false);
      }, 500);
    } else if (state === 'background') {
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