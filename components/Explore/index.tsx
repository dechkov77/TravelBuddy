import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useExploreLogic } from './logic';
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import PublicProfile from '../PublicProfile';
interface ExploreProps {
  onNavigate?: (screen: 'home' | 'explore' | 'trips' | 'buddies' | 'profile' | 'chat') => void;
}
export default function Explore({ onNavigate }: ExploreProps = {}) {
  const { theme } = useTheme();
  const { 
    profiles, 
    loading, 
    searching,
    searchTerm, 
    setSearchTerm, 
    sendingRequest, 
    sendBuddyRequest,
    removeBuddy,
    buddyStatuses,
  } = useExploreLogic();
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);
  const handleCloseProfile = async () => {
    setViewingProfile(null);
    if (profiles.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };
  const handleSendRequest = async (receiverId: string) => {
    try {
      const result = await sendBuddyRequest(receiverId);
      if (result.success) {
        Alert.alert('Success', 'Your buddy request has been sent');
      } else {
        Alert.alert('Error', result.error || 'Failed to send buddy request');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while sending the request');
    }
  };
  const handleRemoveBuddy = async (buddyId: string) => {
    try {
      const result = await removeBuddy(buddyId);
      if (result.success) {
        Alert.alert('Success', 'Buddy removed successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to remove buddy');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while removing the buddy');
    }
  };
  if (viewingProfile) {
    return <PublicProfile userId={viewingProfile} onClose={handleCloseProfile} onNavigate={onNavigate} />;
  }
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Explore Travelers</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Find your perfect travel companion</Text>
      </View>
      {}
      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.searchInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInputField, { color: theme.inputText }]}
            placeholder="Search by name, country, or interests..."
            placeholderTextColor={theme.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            editable={!loading}
          />
          {searching && (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginRight: 12 }} />
          )}
        </View>
      </View>
      {}
      <View style={styles.profilesGrid}>
        {profiles.length === 0 && !searching ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {searchTerm ? 'No travelers found matching your search' : 'No travelers found'}
          </Text>
        ) : (
          profiles.map((profile) => (
            <View key={profile.id} style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
            <TouchableOpacity
              style={styles.profileHeader}
              onPress={() => setViewingProfile(profile.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileName, { color: theme.text }]}>{profile.name}</Text>
                {profile.country && (
                  <View style={styles.profileLocation}>
                    <Ionicons name="location" size={16} color={theme.primary} />
                    <Text style={[styles.profileLocationText, { color: theme.textSecondary }]}>{profile.country}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            {profile.bio && (
              <Text style={[styles.profileBio, { color: theme.textSecondary }]} numberOfLines={2}>
                {profile.bio}
              </Text>
            )}
            {Array.isArray(profile.travel_interests) && profile.travel_interests.length > 0 && (
              <View style={styles.interestsContainer}>
                {profile.travel_interests.slice(0, 3).map((interest, idx) => (
                  <View key={idx} style={styles.interestBadge}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
                {profile.travel_interests.length > 3 && (
                  <View style={styles.moreBadge}>
                    <Text style={styles.moreText}>+{profile.travel_interests.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
            {buddyStatuses[profile.id] === 'buddy' ? (
              <TouchableOpacity
                style={[styles.requestButton, { backgroundColor: '#FF3333' }]}
                onPress={() => handleRemoveBuddy(profile.id)}
                disabled={sendingRequest === profile.id}
              >
                {sendingRequest === profile.id ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="person-remove" size={20} color="#FFFFFF" />
                    <Text style={styles.requestButtonText}>Remove as Buddy</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => handleSendRequest(profile.id)}
                disabled={sendingRequest === profile.id || buddyStatuses[profile.id] === 'pending'}
              >
                {sendingRequest === profile.id ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : buddyStatuses[profile.id] === 'pending' ? (
                  <>
                    <Ionicons name="time" size={20} color="#FFFFFF" />
                    <Text style={styles.requestButtonText}>Request Pending</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="#FFFFFF" />
                    <Text style={styles.requestButtonText}>Send Buddy Request</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ))
        )}
      </View>
    </ScrollView>
  );
}