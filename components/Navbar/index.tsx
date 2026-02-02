import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: 'home' | 'explore' | 'feed' | 'trips' | 'buddies' | 'profile' | 'chat') => void;
}
export default function Navbar({ currentScreen, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(280)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (menuOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 280,
          duration: 350,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [menuOpen]);
  if (!user) {
    return null;
  }
  const handleNavigate = (screen: 'home' | 'explore' | 'feed' | 'trips' | 'buddies' | 'profile' | 'chat') => {
    onNavigate(screen);
    setMenuOpen(false);
  };
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
    }
    setMenuOpen(false);
  };
  const menuItems = [
    { screen: 'home' as const, icon: 'home', label: 'Home' },
    { screen: 'feed' as const, icon: 'newspaper', label: 'Feed' },
    { screen: 'explore' as const, icon: 'people', label: 'Explore' },
    { screen: 'trips' as const, icon: 'airplane', label: 'Trips' },
    { screen: 'buddies' as const, icon: 'people-circle', label: 'Buddies' },
    { screen: 'chat' as const, icon: 'chatbubbles', label: 'Chat' },
    { screen: 'profile' as const, icon: 'person', label: 'Profile' },
  ];
  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.navBackground, borderBottomColor: theme.navBorder }]}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.logo}>
          <Ionicons name="globe" size={24} color={theme.primary} />
          <Text style={[styles.logoText, { color: theme.text }]}>TravelBuddy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            setMenuOpen(true);
          }}
          style={styles.hamburgerButton}
        >
          <Ionicons name="menu" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>
      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={() => {
          setMenuOpen(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <Animated.View style={[styles.modalOverlay, { backgroundColor: theme.overlay, opacity: fadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.menuDrawer, 
                  { 
                    backgroundColor: theme.surface,
                    transform: [{ translateX: slideAnim }]
                  }
                ]}
              >
                <View style={styles.menuHeader}>
                  <Text style={[styles.menuTitle, { color: theme.text }]}>Menu</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setMenuOpen(false);
                    }}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.menuItems}>
                  {menuItems.map((item) => (
                    <TouchableOpacity
                      key={item.screen}
                      onPress={() => handleNavigate(item.screen)}
                      style={[
                        styles.menuItem,
                        currentScreen === item.screen && [styles.menuItemActive, { backgroundColor: theme.inputBackground }],
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={24}
                        color={currentScreen === item.screen ? theme.primary : theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.menuItemText,
                          { color: theme.text },
                          currentScreen === item.screen && [styles.menuItemTextActive, { color: theme.primary }],
                        ]}
                      >
                        {item.label}
                      </Text>
                      {currentScreen === item.screen && (
                        <Ionicons name="checkmark" size={20} color={theme.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={handleSignOut}
                  style={[styles.signOutButton, { borderTopColor: theme.divider }]}
                >
                  <Ionicons name="log-out" size={24} color={theme.error} />
                  <Text style={[styles.signOutText, { color: theme.error }]}>Sign Out</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}