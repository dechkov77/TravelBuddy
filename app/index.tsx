import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
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
  useEffect(() => {
    if (isOnline && !syncService.isSyncInProgress()) {
      const syncPending = async () => {
        try {
          const queueSize = syncService.getQueueSize();
          if (queueSize > 0) {
            await syncService.syncAllPendingOperations();
          }
        } catch (error) {
        }
      };
      syncPending();
    }
  }, [isOnline]);
  const handleNavigate = (screen: 'home' | 'explore' | 'feed' | 'trips' | 'buddies' | 'profile' | 'chat') => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(screen);
      slideAnim.setValue(-1000);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };
  if (loading) {
    return null;
  }
  if (!user && currentScreen !== 'auth') {
    return <Auth />;
  }
  if (currentScreen === 'auth') {
    return <Auth />;
  }
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
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        {renderScreen()}
      </Animated.View>
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