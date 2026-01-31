import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useTripDetailLogic } from './logic';
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import DatePicker from '../DatePicker';

// Conditionally import ImagePicker only on native platforms
let ImagePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    ImagePicker = require('expo-image-picker');
  } catch (e) {
    console.warn('expo-image-picker not available');
  }
}

interface TripDetailProps {
  tripId: string;
  onClose: () => void;
}

export default function TripDetail({ tripId, onClose }: TripDetailProps) {
  const { theme } = useTheme();
  const {
    trip,
    loading,
    isOwner,
    activeTab,
    setActiveTab,
    itineraryItems,
    itineraryDialogOpen,
    setItineraryDialogOpen,
    newItineraryItem,
    setNewItineraryItem,
    handleCreateItineraryItem,
    expenses,
    expenseDialogOpen,
    setExpenseDialogOpen,
    newExpense,
    setNewExpense,
    handleCreateExpense,
    recommendations,
    recommendationDialogOpen,
    setRecommendationDialogOpen,
    newRecommendation,
    setNewRecommendation,
    handleCreateRecommendation,
    journalEntries,
    journalDialogOpen,
    setJournalDialogOpen,
    newJournalEntry,
    setNewJournalEntry,
    photos,
    setPhotos,
    handleCreateJournalEntry,
    handleDeleteItineraryItem,
    handleDeleteExpense,
    handleDeleteRecommendation,
    handleDeleteJournalEntry,
  } = useTripDetailLogic({ tripId });

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      const url = prompt('Enter image URL:');
      if (url) {
        setPhotos([...photos, url]);
      }
      return;
    }

    if (!ImagePicker) {
      Alert.alert('Error', 'Image picker is not available on this platform');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((asset) => asset.uri);
        setPhotos([...photos, ...uris]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Trip not found</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: theme.primary }}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.tripTitle, { color: theme.text }]}>{trip.destination}</Text>
            <Text style={[styles.tripDates, { color: theme.textSecondary }]}>
              {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'itinerary' && [styles.tabActive, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab('itinerary')}
        >
          <Text style={[styles.tabText, activeTab === 'itinerary' && [styles.tabTextActive, { color: theme.primary }], activeTab !== 'itinerary' && { color: theme.textSecondary }]}>Itinerary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && [styles.tabActive, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[styles.tabText, activeTab === 'expenses' && [styles.tabTextActive, { color: theme.primary }], activeTab !== 'expenses' && { color: theme.textSecondary }]}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recommendations' && [styles.tabActive, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab('recommendations')}
        >
          <Text style={[styles.tabText, activeTab === 'recommendations' && [styles.tabTextActive, { color: theme.primary }], activeTab !== 'recommendations' && { color: theme.textSecondary }]}>Recommendations</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'journal' && [styles.tabActive, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab('journal')}
        >
          <Text style={[styles.tabText, activeTab === 'journal' && [styles.tabTextActive, { color: theme.primary }], activeTab !== 'journal' && { color: theme.textSecondary }]}>Journal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: theme.background }]}>
        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <>
            {isOwner && (
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setItineraryDialogOpen(true)}>
                <Ionicons name="add" size={20} color={theme.buttonText} />
                <Text style={[styles.addButtonText, { color: theme.buttonText }]}>Add Itinerary Item</Text>
              </TouchableOpacity>
            )}
            {itineraryItems.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No itinerary items yet</Text>
            ) : (
              itineraryItems.map((item) => (
                <View key={item.id} style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>Day {item.day}: {item.title}</Text>
                      {item.time && <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>Time: {item.time}</Text>}
                      {item.location && <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>Location: {item.location}</Text>}
                      {item.description && <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>{item.description}</Text>}
                    </View>
                    {isOwner && (
                      <TouchableOpacity
                        onPress={async () => {
                          Alert.alert(
                            'Delete Item',
                            'Are you sure you want to delete this itinerary item?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await handleDeleteItineraryItem(item.id);
                                  } catch (error) {
                                    Alert.alert('Error', 'Failed to delete item');
                                  }
                                }
                              },
                            ]
                          );
                        }}
                        style={{ padding: 8 }}
                      >
                        <Ionicons name="trash" size={20} color="#FF3333" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <>
            {isOwner && (
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setExpenseDialogOpen(true)}>
                <Ionicons name="add" size={20} color={theme.buttonText} />
                <Text style={[styles.addButtonText, { color: theme.buttonText }]}>Add Expense</Text>
              </TouchableOpacity>
            )}
            {expenses.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No expenses yet</Text>
            ) : (
              expenses.map((expense) => (
                <View key={expense.id} style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{expense.title}</Text>
                      <Text style={[styles.expenseAmount, { color: theme.primary }]}>${expense.amount.toFixed(2)}</Text>
                    </View>
                    {isOwner && (
                      <TouchableOpacity
                        onPress={async () => {
                          Alert.alert(
                            'Delete Expense',
                            'Are you sure you want to delete this expense?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await handleDeleteExpense(expense.id);
                                  } catch (error) {
                                    Alert.alert('Error', 'Failed to delete expense');
                                  }
                                }
                              },
                            ]
                          );
                        }}
                        style={{ padding: 8 }}
                      >
                        <Ionicons name="trash" size={20} color={theme.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {expense.category && <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>Category: {expense.category}</Text>}
                  {expense.description && <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>{expense.description}</Text>}
                </View>
              ))
            )}
          </>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <>
            {isOwner && (
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setRecommendationDialogOpen(true)}>
                <Ionicons name="add" size={20} color={theme.buttonText} />
                <Text style={[styles.addButtonText, { color: theme.buttonText }]}>Add Recommendation</Text>
              </TouchableOpacity>
            )}
            {recommendations.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No recommendations yet</Text>
            ) : (
              recommendations.map((rec) => (
                <View key={rec.id} style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{rec.title}</Text>
                      {rec.location && <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>Location: {rec.location}</Text>}
                      {rec.category && <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>Category: {rec.category}</Text>}
                      {rec.rating && (
                        <View style={styles.ratingStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= rec.rating! ? 'star' : 'star-outline'}
                              size={16}
                              color={theme.primary}
                            />
                          ))}
                        </View>
                      )}
                      {rec.description && <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>{rec.description}</Text>}
                    </View>
                    {isOwner && (
                      <TouchableOpacity
                        onPress={async () => {
                          Alert.alert(
                            'Delete Recommendation',
                            'Are you sure you want to delete this recommendation?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await handleDeleteRecommendation(rec.id);
                                  } catch (error) {
                                    Alert.alert('Error', 'Failed to delete recommendation');
                                  }
                                }
                              },
                            ]
                          );
                        }}
                        style={{ padding: 8 }}
                      >
                        <Ionicons name="trash" size={20} color={theme.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <>
            {isOwner && (
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setJournalDialogOpen(true)}>
                <Ionicons name="add" size={20} color={theme.buttonText} />
                <Text style={[styles.addButtonText, { color: theme.buttonText }]}>Add Journal Entry</Text>
              </TouchableOpacity>
            )}
            {journalEntries.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No journal entries yet</Text>
            ) : (
              journalEntries.map((entry) => (
                <View key={entry.id} style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{entry.title}</Text>
                      <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>{format(new Date(entry.date), 'MMM d, yyyy')}</Text>
                      {entry.location && <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>Location: {entry.location}</Text>}
                      <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>{entry.content}</Text>
                      {entry.photos && Array.isArray(entry.photos) && entry.photos.length > 0 && (
                        <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>{entry.photos.length} photo(s)</Text>
                      )}
                    </View>
                    {isOwner && (
                      <TouchableOpacity
                        onPress={async () => {
                          Alert.alert(
                            'Delete Journal Entry',
                            'Are you sure you want to delete this journal entry?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await handleDeleteJournalEntry(entry.id);
                                  } catch (error) {
                                    Alert.alert('Error', 'Failed to delete journal entry');
                                  }
                                }
                              },
                            ]
                          );
                        }}
                        style={{ padding: 8 }}
                      >
                        <Ionicons name="trash" size={20} color={theme.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Itinerary Modal */}
      <Modal visible={itineraryDialogOpen} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Itinerary Item</Text>
            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Day</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  keyboardType="numeric"
                  value={newItineraryItem.day.toString()}
                  onChangeText={(text) => setNewItineraryItem({ ...newItineraryItem, day: parseInt(text) || 1 })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Title</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  value={newItineraryItem.title}
                  onChangeText={(text) => setNewItineraryItem({ ...newItineraryItem, title: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Time</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  placeholder="e.g., 10:00 AM"
                  value={newItineraryItem.time}
                  onChangeText={(text) => setNewItineraryItem({ ...newItineraryItem, time: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Location</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  value={newItineraryItem.location}
                  onChangeText={(text) => setNewItineraryItem({ ...newItineraryItem, location: text })}
                  placeholderTextColor={theme.textSecondary}
                />
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
                  multiline
                  value={newItineraryItem.description}
                  onChangeText={(text) => setNewItineraryItem({ ...newItineraryItem, description: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.textSecondary, opacity: 0.3 }]} onPress={() => setItineraryDialogOpen(false)}>
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleCreateItineraryItem}>
                <Text style={[styles.submitButtonText, { color: theme.buttonText }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Expense Modal */}
      <Modal visible={expenseDialogOpen} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Expense</Text>
            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Title</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  value={newExpense.title}
                  onChangeText={(text) => setNewExpense({ ...newExpense, title: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Amount</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  keyboardType="decimal-pad"
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  placeholder="e.g., Food, Transportation"
                  value={newExpense.category}
                  onChangeText={(text) => setNewExpense({ ...newExpense, category: text })}
                  placeholderTextColor={theme.textSecondary}
                />
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
                  multiline
                  value={newExpense.description}
                  onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.textSecondary, opacity: 0.3 }]} onPress={() => setExpenseDialogOpen(false)}>
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleCreateExpense}>
                <Text style={[styles.submitButtonText, { color: theme.buttonText }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recommendation Modal */}
      <Modal visible={recommendationDialogOpen} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Recommendation</Text>
            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Title</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  value={newRecommendation.title}
                  onChangeText={(text) => setNewRecommendation({ ...newRecommendation, title: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Location</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  value={newRecommendation.location}
                  onChangeText={(text) => setNewRecommendation({ ...newRecommendation, location: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  placeholder="e.g., Restaurant, Attraction"
                  value={newRecommendation.category}
                  onChangeText={(text) => setNewRecommendation({ ...newRecommendation, category: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Rating (1-5)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  keyboardType="numeric"
                  value={newRecommendation.rating}
                  onChangeText={(text) => setNewRecommendation({ ...newRecommendation, rating: text })}
                  placeholderTextColor={theme.textSecondary}
                />
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
                  multiline
                  value={newRecommendation.description}
                  onChangeText={(text) => setNewRecommendation({ ...newRecommendation, description: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.textSecondary, opacity: 0.3 }]} onPress={() => setRecommendationDialogOpen(false)}>
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleCreateRecommendation}>
                <Text style={[styles.submitButtonText, { color: theme.buttonText }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Journal Modal */}
      <Modal visible={journalDialogOpen} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Journal Entry</Text>
            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Title</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  value={newJournalEntry.title}
                  onChangeText={(text) => setNewJournalEntry({ ...newJournalEntry, title: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <DatePicker
                  label="Date"
                  value={newJournalEntry.date}
                  onChange={(date) => setNewJournalEntry({ ...newJournalEntry, date })}
                  placeholder="Select date"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Location</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    }
                  ]}
                  value={newJournalEntry.location}
                  onChangeText={(text) => setNewJournalEntry({ ...newJournalEntry, location: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Content</Text>
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
                  multiline
                  value={newJournalEntry.content}
                  onChangeText={(text) => setNewJournalEntry({ ...newJournalEntry, content: text })}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={pickImage}>
                <Ionicons name="camera" size={20} color={theme.buttonText} />
                <Text style={[styles.addButtonText, { color: theme.buttonText }]}>Add Photo{Platform.OS === 'web' ? ' (URL)' : ''}</Text>
              </TouchableOpacity>
              {photos.length > 0 && (
                <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>{photos.length} photo(s) added</Text>
              )}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.textSecondary, opacity: 0.3 }]} onPress={() => setJournalDialogOpen(false)}>
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleCreateJournalEntry}>
                <Text style={[styles.submitButtonText, { color: theme.buttonText }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
