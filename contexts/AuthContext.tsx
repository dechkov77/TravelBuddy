import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as UserService from '../database/users';
import * as ProfileService from '../database/profiles';
import { hashPassword, verifyPassword } from '../database/users';
import { Profile } from '../database/types';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@travelbuddy:user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        await loadProfile(userData.id);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await ProfileService.getProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check if user already exists
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return { error: { message: 'User already exists' } };
      }

      // Create user ID
      const userId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const passwordHash = hashPassword(password);

      // Create user
      await UserService.createUser(userId, email, name, passwordHash);

      // Create profile
      await ProfileService.createProfile(userId, name);

      const newUser = { id: userId, email, name };
      setUser(newUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      
      await loadProfile(userId);

      router.replace('/');
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign up failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userData = await UserService.getUserByEmail(email);
      if (!userData || !verifyPassword(password, userData.password_hash)) {
        return { error: { message: 'Invalid email or password' } };
      }

      const newUser = { id: userData.id, email: userData.email, name: userData.name };
      setUser(newUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      
      await loadProfile(userData.id);

      router.replace('/');
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign in failed' } };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      setProfile(null);
      // Don't redirect - let the app naturally show auth screen when user is null
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
