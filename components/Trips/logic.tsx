import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import * as TripService from '../../database/trips';
import { Trip } from '../../database/types';
import { z } from 'zod';
const tripSchema = z
  .object({
    destination: z.string().min(2, 'Destination must be at least 2 characters').max(100),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    description: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  });
export const useTripsLogic = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'itinerary' | 'expenses' | 'recommendations' | 'journal'>('itinerary');
  const [newTrip, setNewTrip] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    fetchTrips();
  }, [user]);
  const fetchTrips = async () => {
    if (!user) return;
    try {
      const data = await TripService.getTripsByUserId(user.id);
      setTrips(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleCreateTrip = async () => {
    if (!user) return;
    setCreating(true);
    try {
      tripSchema.parse(newTrip);
      const tripId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await TripService.createTrip(
        tripId,
        user.id,
        newTrip.destination,
        newTrip.start_date,
        newTrip.end_date,
        newTrip.description
      );
      setNewTrip({ destination: '', start_date: '', end_date: '', description: '' });
      setDialogOpen(false);
      await fetchTrips();
      return { success: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message };
      }
      return { success: false, error: 'Failed to create trip' };
    } finally {
      setCreating(false);
    }
  };
  const handleDeleteTrip = async (tripId: string) => {
    if (!user) return { success: false, error: 'User not found' };
    try {
      const trip = await TripService.getTripById(tripId);
      if (!trip || trip.user_id !== user.id) {
        return { success: false, error: 'You can only delete your own trips' };
      }
      await TripService.deleteTrip(tripId);
      await fetchTrips();
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete trip' };
    }
  };
  return {
    trips,
    loading,
    creating,
    dialogOpen,
    setDialogOpen,
    selectedTrip,
    setSelectedTrip,
    detailTab,
    setDetailTab,
    newTrip,
    setNewTrip,
    handleCreateTrip,
    handleDeleteTrip,
  };
};