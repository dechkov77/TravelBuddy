import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import * as ProfileService from '../../database/profiles';
import * as TripService from '../../database/trips';
import * as BuddyService from '../../database/buddies';
import { Profile, Trip } from '../../database/types';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import TripDetail from '../TripDetail';
interface PublicProfileProps {
  userId: string;
  onClose: () => void;
  onNavigate?: (screen: 'home' | 'explore' | 'trips' | 'buddies' | 'profile' | 'chat') => void;
}
export default function PublicProfile({ userId, onClose, onNavigate }: PublicProfileProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [isBuddy, setIsBuddy] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  useEffect(() => {
    fetchProfile();
  }, [userId]);
  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [profileData, tripsData] = await Promise.all([
        ProfileService.getProfile(userId),
        TripService.getTripsByUserId(userId),
      ]);
      setProfile(profileData);
      setTrips(tripsData || []);
      const existing = await BuddyService.checkBuddyRequestExists(user.id, userId);
      setIsBuddy(existing?.status === 'accepted' || false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleSendMessage = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('openChatWithUserId', userId);
    } catch (error) {
    }
    onClose();
    if (onNavigate) {
      onNavigate('chat');
    }
  };
  const handleRemoveBuddy = async () => {
    if (!user) return;
    Alert.alert(
      'Remove Buddy',
      'Are you sure you want to remove this buddy?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              setIsRemoving(true);
              await BuddyService.removeBuddy(user.id, userId);
              Alert.alert('Success', 'Buddy removed successfully');
              setIsBuddy(false);
              onClose();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove buddy');
            } finally {
              setIsRemoving(false);
            }
          },
        },
      ]
    );
  };
  if (selectedTrip) {
    return <TripDetail tripId={selectedTrip} onClose={() => setSelectedTrip(null)} />;
  }
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Profile not found</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: theme.primary }}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        {}
        <View style={styles.profilePictureContainer}>
          {profile.profile_picture ? (
            <Image
              source={{ uri: profile.profile_picture }}
              style={styles.profilePicture}
            />
          ) : (
            <View style={[styles.profilePicturePlaceholder, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="person" size={60} color={theme.textSecondary} />
            </View>
          )}
        </View>
        {}
        <Text style={[styles.name, { color: theme.text }]}>{profile.name}</Text>
        {}
        {profile.country && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={theme.primary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>{profile.country}</Text>
          </View>
        )}
        {}
        {profile.bio && (
          <View style={styles.bioContainer}>
            <Text style={[styles.bio, { color: theme.textSecondary }]}>{profile.bio}</Text>
          </View>
        )}
        {}
        {isBuddy && user && user.id !== userId && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.messageButton, { backgroundColor: theme.primary, flex: 1, marginRight: 8 }]}
              onPress={handleSendMessage}
            >
              <Ionicons name="chatbubble" size={20} color={theme.buttonText} />
              <Text style={[styles.messageButtonText, { color: theme.buttonText }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageButton, { backgroundColor: '#FF3333', flex: 1 }]}
              onPress={handleRemoveBuddy}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <ActivityIndicator color={theme.buttonText} />
              ) : (
                <>
                  <Ionicons name="person-remove" size={20} color={theme.buttonText} />
                  <Text style={[styles.messageButtonText, { color: theme.buttonText }]}>Remove</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        {}
        {Array.isArray(profile.travel_interests) && profile.travel_interests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Interests</Text>
            <View style={styles.interestsContainer}>
              {profile.travel_interests.map((interest, idx) => (
                <View key={idx} style={[styles.interestBadge, { backgroundColor: theme.secondary, borderColor: theme.primary }]}>
                  <Text style={[styles.interestText, { color: theme.text }]}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Planned Trips ({trips.length})</Text>
          {trips.length === 0 ? (
            <Text style={[styles.bio, { color: theme.textSecondary }]}>No trips planned yet</Text>
          ) : (
            <View style={styles.tripsContainer}>
              {trips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={[styles.tripCard, { backgroundColor: theme.background, borderColor: theme.divider }]}
                  onPress={() => {
                    setSelectedTrip(trip.id);
                  }}
                >
                  <View style={styles.tripHeader}>
                    <Ionicons name="location" size={18} color={theme.primary} />
                    <Text style={[styles.tripDestination, { color: theme.text }]}>{trip.destination}</Text>
                  </View>
                  <View style={styles.tripDate}>
                    <Ionicons name="calendar" size={14} color={theme.textSecondary} />
                    <Text style={[styles.tripDateText, { color: theme.textSecondary }]}>
                      {format(new Date(trip.start_date), 'MMM d')} -{' '}
                      {format(new Date(trip.end_date), 'MMM d, yyyy')}
                    </Text>
                  </View>
                  {trip.description && (
                    <Text style={[styles.tripDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                      {trip.description}
                    </Text>
                  )}
                  <View style={styles.viewTripHint}>
                    <Text style={[styles.viewTripText, { color: theme.primary }]}>Tap to view details</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}