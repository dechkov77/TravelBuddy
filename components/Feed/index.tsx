import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useFeedLogic } from './logic';
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import TripDetail from '../TripDetail';
interface FeedProps {
  onNavigate?: (screen: 'home' | 'explore' | 'trips' | 'buddies' | 'profile' | 'chat') => void;
}
export default function Feed({ onNavigate }: FeedProps = {}) {
  const { theme } = useTheme();
  const {
    trips,
    loading,
    searching,
    searchTerm,
    setSearchTerm,
    buddyIds,
  } = useFeedLogic();
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
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
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Trip Feed</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Discover trips from buddies and around the world</Text>
      </View>
      {}
      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.searchInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInputField, { color: theme.inputText }]}
            placeholder="Search by city or country..."
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
      <View style={styles.tripsList}>
        {trips.length === 0 && !searching ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="airplane" size={64} color={theme.textLight} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No trips yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {searchTerm ? 'No trips found matching your search' : 'Start connecting with buddies to see their trips'}
            </Text>
          </View>
        ) : trips.length === 0 && searching ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No trips found</Text>
            <Text style={styles.emptyText}>Try searching for a different destination</Text>
          </View>
        ) : (
          trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[
                styles.tripCard,
                trip.isBuddyTrip && styles.buddyTripCard,
              ]}
              onPress={() => setSelectedTrip(trip.id)}
            >
              {trip.isBuddyTrip && (
                <View style={styles.buddyBadge}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.buddyBadgeText}>Buddy Trip</Text>
                </View>
              )}
              <View style={styles.tripHeader}>
                <View style={styles.destinationContainer}>
                  <Ionicons name="location" size={24} color="#0066CC" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.tripDestination}>{trip.destination}</Text>
                    <Text style={styles.tripOwner}>By {trip.ownerName}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.tripDetails}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.tripDate}>
                    {format(new Date(trip.start_date), 'MMM d')} -{' '}
                    {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  </Text>
                </View>
                {trip.description && (
                  <Text style={styles.tripDescription} numberOfLines={2}>
                    {trip.description}
                  </Text>
                )}
              </View>
              <View style={styles.tripFooter}>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Trip</Text>
                  <Ionicons name="arrow-forward" size={16} color="#0066CC" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}