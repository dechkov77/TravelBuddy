import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTripsLogic } from './logic';
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import TripDetail from '../TripDetail';
import DatePicker from '../DatePicker';

export default function Trips() {
  const { theme } = useTheme();
  const {
    trips,
    loading,
    creating,
    dialogOpen,
    setDialogOpen,
    selectedTrip,
    setSelectedTrip,
    newTrip,
    setNewTrip,
    handleCreateTrip,
    handleDeleteTrip,
  } = useTripsLogic();

  const onSubmit = async () => {
    const result = await handleCreateTrip();
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to create trip');
    } else {
      Alert.alert('Success', 'Your trip has been created');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (selectedTrip) {
    return <TripDetail tripId={selectedTrip} onClose={() => setSelectedTrip(null)} />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>My Trips</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Plan and manage your adventures</Text>
        </View>
        <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.primary }]} onPress={() => setDialogOpen(true)}>
          <Ionicons name="add" size={20} color={theme.buttonText} />
          <Text style={[styles.createButtonText, { color: theme.buttonText }]}>Create Trip</Text>
        </TouchableOpacity>
      </View>

      {trips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="map" size={64} color="#CCC" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptyText}>Start planning your next adventure</Text>
        </View>
      ) : (
        <View style={styles.tripsGrid}>
          {trips.map((trip) => (
            <View key={trip.id} style={[styles.tripCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
              <TouchableOpacity onPress={() => setSelectedTrip(trip.id)} style={{ flex: 1 }}>
                <View style={styles.tripHeader}>
                  <Ionicons name="location" size={20} color={theme.primary} />
                  <Text style={[styles.tripDestination, { color: theme.text }]}>{trip.destination}</Text>
                </View>
                <View style={styles.tripDate}>
                  <Ionicons name="calendar" size={16} color={theme.textSecondary} />
                  <Text style={{ color: theme.textSecondary }}>
                    {' '}
                    {format(new Date(trip.start_date), 'MMM d')} -{' '}
                    {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  </Text>
                </View>
                {trip.description && (
                  <Text style={[styles.tripDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                    {trip.description}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  Alert.alert(
                    'Delete Trip',
                    'Are you sure you want to delete this trip? This will also delete all associated items (itinerary, expenses, recommendations, journal entries).',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          const result = await handleDeleteTrip(trip.id);
                          if (result.success) {
                            Alert.alert('Success', 'Trip deleted successfully');
                          } else {
                            Alert.alert('Error', result.error || 'Failed to delete trip');
                          }
                        },
                      },
                    ]
                  );
                }}
                style={{ padding: 8, alignSelf: 'flex-end' }}
              >
                <Ionicons name="trash" size={20} color="#FF3333" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Create Trip Modal */}
      <Modal visible={dialogOpen} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create New Trip</Text>
            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              Plan your next adventure by adding trip details
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Destination *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  placeholder="e.g., Paris, France"
                  placeholderTextColor={theme.textSecondary}
                  value={newTrip.destination}
                  onChangeText={(text) => setNewTrip({ ...newTrip, destination: text })}
                />
              </View>

              <View style={styles.dateRow}>
                <View style={[styles.inputGroup, styles.dateInput]}>
                  <DatePicker
                    label="Start Date *"
                    value={newTrip.start_date}
                    onChange={(date) => setNewTrip({ ...newTrip, start_date: date })}
                    placeholder="Select start date"
                    minimumDate={new Date()}
                  />
                </View>
                <View style={[styles.inputGroup, styles.dateInput]}>
                  <DatePicker
                    label="End Date *"
                    value={newTrip.end_date}
                    onChange={(date) => setNewTrip({ ...newTrip, end_date: date })}
                    placeholder="Select end date"
                    minimumDate={newTrip.start_date ? new Date(newTrip.start_date) : new Date()}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  placeholder="Tell your travel buddies about this trip..."
                  placeholderTextColor={theme.textSecondary}
                  value={newTrip.description}
                  onChangeText={(text) => setNewTrip({ ...newTrip, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.textSecondary, opacity: 0.3 }]}
                onPress={() => {
                  setDialogOpen(false);
                  setNewTrip({ destination: '', start_date: '', end_date: '', description: '' });
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.primary }, creating && { opacity: 0.6 }]}
                onPress={onSubmit}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={theme.buttonText} />
                ) : (
                  <>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Create Trip</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
