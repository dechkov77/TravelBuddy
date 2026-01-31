import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as TripService from '../../database/trips';
import * as ItineraryService from '../../database/itinerary';
import * as ExpenseService from '../../database/expenses';
import * as RecommendationService from '../../database/recommendations';
import * as JournalService from '../../database/journal';
import { Trip, ItineraryItem, Expense, Recommendation, JournalEntry } from '../../database/types';

interface TripDetailLogicProps {
  tripId: string;
}

export const useTripDetailLogic = ({ tripId }: TripDetailLogicProps) => {
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'expenses' | 'recommendations' | 'journal'>('itinerary');
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  
  // Itinerary
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [itineraryDialogOpen, setItineraryDialogOpen] = useState(false);
  const [newItineraryItem, setNewItineraryItem] = useState({
    day: 1,
    title: '',
    description: '',
    time: '',
    location: '',
  });

  // Expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
  });

  // Recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationDialogOpen, setRecommendationDialogOpen] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    rating: '5',
  });

  // Journal
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [newJournalEntry, setNewJournalEntry] = useState({
    title: '',
    content: '',
    date: '',
    location: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      const [tripData, participantList] = await Promise.all([
        TripService.getTripById(tripId),
        TripService.getTripParticipants(tripId),
      ]);
      setTrip(tripData);
      setParticipants(participantList);
      setIsOwner(tripData?.user_id === user?.id);
      
      // Fetch tab-specific data
      if (activeTab === 'itinerary') await fetchItinerary();
      else if (activeTab === 'expenses') await fetchExpenses();
      else if (activeTab === 'recommendations') await fetchRecommendations();
      else if (activeTab === 'journal') await fetchJournal();
    } catch (error) {
      console.error('Error fetching trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItinerary = async () => {
    const items = await ItineraryService.getItineraryItemsByTripId(tripId);
    setItineraryItems(items);
  };

  const fetchExpenses = async () => {
    const items = await ExpenseService.getExpensesByTripId(tripId);
    setExpenses(items);
  };

  const fetchRecommendations = async () => {
    const items = await RecommendationService.getRecommendationsByTripId(tripId);
    setRecommendations(items);
  };

  const fetchJournal = async () => {
    const items = await JournalService.getJournalEntriesByTripId(tripId);
    setJournalEntries(items);
  };

  useEffect(() => {
    if (trip) {
      if (activeTab === 'itinerary') {
        fetchItinerary().catch(console.error);
      } else if (activeTab === 'expenses') {
        fetchExpenses().catch(console.error);
      } else if (activeTab === 'recommendations') {
        fetchRecommendations().catch(console.error);
      } else if (activeTab === 'journal') {
        fetchJournal().catch(console.error);
      }
    }
  }, [activeTab, trip]);

  const handleCreateItineraryItem = async () => {
    if (!user || !isOwner) return;
    const id = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await ItineraryService.createItineraryItem(
      id,
      tripId,
      newItineraryItem.day,
      newItineraryItem.title,
      newItineraryItem.description,
      newItineraryItem.time,
      newItineraryItem.location
    );
    setNewItineraryItem({ day: 1, title: '', description: '', time: '', location: '' });
    setItineraryDialogOpen(false);
    await fetchItinerary();
  };

  const handleCreateExpense = async () => {
    if (!user || !isOwner) return;
    const id = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await ExpenseService.createExpense(
      id,
      tripId,
      user.id,
      newExpense.title,
      parseFloat(newExpense.amount),
      newExpense.category,
      newExpense.description,
      participants
    );
    setNewExpense({ title: '', amount: '', category: '', description: '' });
    setExpenseDialogOpen(false);
    await fetchExpenses();
  };

  const handleCreateRecommendation = async () => {
    if (!user || !isOwner) return;
    const id = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await RecommendationService.createRecommendation(
      id,
      tripId,
      user.id,
      newRecommendation.title,
      newRecommendation.description,
      newRecommendation.category,
      newRecommendation.location,
      parseFloat(newRecommendation.rating)
    );
    setNewRecommendation({ title: '', description: '', category: '', location: '', rating: '5' });
    setRecommendationDialogOpen(false);
    await fetchRecommendations();
  };

  const handleCreateJournalEntry = async () => {
    if (!user || !isOwner) {
      console.error('[TripDetail] handleCreateJournalEntry: No user or not owner');
      return;
    }
    try {
      console.log('[TripDetail] Creating journal entry:', {
        tripId,
        title: newJournalEntry.title,
        date: newJournalEntry.date,
      });
      const id = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await JournalService.createJournalEntry(
        id,
        tripId,
        user.id,
        newJournalEntry.title,
        newJournalEntry.content,
        newJournalEntry.date || new Date().toISOString().split('T')[0],
        photos.length > 0 ? photos : undefined,
        newJournalEntry.location
      );
      console.log('[TripDetail] Journal entry created successfully');
      setNewJournalEntry({ title: '', content: '', date: '', location: '' });
      setPhotos([]);
      setJournalDialogOpen(false);
      await fetchJournal();
    } catch (error) {
      console.error('[TripDetail] Error creating journal entry:', error);
      throw error;
    }
  };

  const handleDeleteItineraryItem = async (itemId: string) => {
    if (!isOwner) return;
    try {
      console.log('[TripDetail] Deleting itinerary item:', itemId);
      await ItineraryService.deleteItineraryItem(itemId);
      await fetchItinerary();
    } catch (error) {
      console.error('[TripDetail] Error deleting itinerary item:', error);
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!isOwner) return;
    try {
      console.log('[TripDetail] Deleting expense:', expenseId);
      await ExpenseService.deleteExpense(expenseId);
      await fetchExpenses();
    } catch (error) {
      console.error('[TripDetail] Error deleting expense:', error);
      throw error;
    }
  };

  const handleDeleteRecommendation = async (recommendationId: string) => {
    if (!isOwner) return;
    try {
      console.log('[TripDetail] Deleting recommendation:', recommendationId);
      await RecommendationService.deleteRecommendation(recommendationId);
      await fetchRecommendations();
    } catch (error) {
      console.error('[TripDetail] Error deleting recommendation:', error);
      throw error;
    }
  };

  const handleDeleteJournalEntry = async (entryId: string) => {
    if (!isOwner) return;
    try {
      console.log('[TripDetail] Deleting journal entry:', entryId);
      await JournalService.deleteJournalEntry(entryId);
      await fetchJournal();
    } catch (error) {
      console.error('[TripDetail] Error deleting journal entry:', error);
      throw error;
    }
  };

  return {
    trip,
    loading,
    isOwner,
    activeTab,
    setActiveTab,
    participants,
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
  };
};
