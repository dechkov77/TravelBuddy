import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useNetwork } from '../contexts/NetworkContext';
import { useTheme } from '../contexts/ThemeContext';
import Home from '../components/Home';
import Auth from '../components/Auth';
import Explore from '../components/Explore';
import Feed from '../components/Feed';
import Trips from '../components/Trips';
import Buddies from '../components/Buddies';
import Profile from '../components/Profile';
import Chat from '../components/Chat';
import Navbar from '../components/Navbar';
import OfflineIndicator from '../components/OfflineIndicator';
import syncService from '../services/syncService';

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { isOnline } = useNetwork();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const [currentScreen, setCurrentScreen] = useState<'home' | 'auth' | 'explore' | 'feed' | 'trips' | 'buddies' | 'profile' | 'chat'>('home');

  useEffect(() => {
    // Handle navigation based on auth state
    if (!loading) {
      if (!user) {
        setCurrentScreen('auth');
      } else if (segments.length > 0) {
        const screen = segments[0] as typeof currentScreen;
        if (['home', 'auth', 'explore', 'feed', 'trips', 'buddies', 'profile', 'chat'].includes(screen)) {
          setCurrentScreen(screen);
        }
      } else {
        setCurrentScreen('home');
      }
    }
  }, [user, loading, segments]);

  // Sync pending operations when coming back online
  useEffect(() => {
    if (isOnline && !syncService.isSyncInProgress()) {
      const syncPending = async () => {
        try {
          const queueSize = syncService.getQueueSize();
          if (queueSize > 0) {
            console.log(`Syncing ${queueSize} pending operations...`);
            await syncService.syncAllPendingOperations();
          }
        } catch (error) {
          console.error('Error syncing pending operations:', error);
        }
      };

      syncPending();
    }
  }, [isOnline]);

  const handleNavigate = (screen: 'home' | 'explore' | 'feed' | 'trips' | 'buddies' | 'profile' | 'chat') => {
    setCurrentScreen(screen);
  };

  // Show loading state
  if (loading) {
    return null; // Or a loading component
  }

  // Show auth screen if not logged in
  if (!user && currentScreen !== 'auth') {
    return <Auth />;
  }

  // Show auth screen when explicitly navigating to auth
  if (currentScreen === 'auth') {
    return <Auth />;
  }

  // Render the appropriate screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'explore':
        return <Explore onNavigate={handleNavigate} />;
      case 'feed':
        return <Feed onNavigate={handleNavigate} />;
      case 'trips':
        return <Trips />;
      case 'buddies':
        return <Buddies onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile />;
      case 'chat':
        return <Chat onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfflineIndicator />
      {user && <Navbar currentScreen={currentScreen} onNavigate={handleNavigate} />}
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
});
