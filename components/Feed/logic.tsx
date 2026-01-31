import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as TripService from '../../database/trips';
import * as ProfileService from '../../database/profiles';
import * as BuddyService from '../../database/buddies';
import { Trip } from '../../database/types';

interface TripWithOwner extends Trip {
  ownerName: string;
  isBuddyTrip: boolean;
}

export const useFeedLogic = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [buddyIds, setBuddyIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchFeedTrips();
  }, [user]);

  // Debounce search with 500ms delay
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        setSearching(true);
        searchTrips();
      } else {
        setSearching(false);
        fetchFeedTrips();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user?.id]);

  const fetchBuddies = async (): Promise<string[]> => {
    try {
      if (!user) return [];
      const buddies = await BuddyService.getAcceptedBuddies(user.id);
      const buddyIdList = buddies.map(b => 
        b.sender_id === user.id ? b.receiver_id : b.sender_id
      );
      setBuddyIds(buddyIdList);
      return buddyIdList;
    } catch (error) {
      console.error('[Feed] Error fetching buddies:', error);
      return [];
    }
  };

  const getOwnerName = async (userId: string): Promise<string> => {
    try {
      const profile = await ProfileService.getProfile(userId);
      return profile?.name || userId;
    } catch (error) {
      console.error('[Feed] Error fetching profile name:', error);
      return userId;
    }
  };

  const fetchFeedTrips = async () => {
    try {
      if (!user) return;
      setSearching(false);

      // Get all trips
      const allTrips = await TripService.getAllTrips();
      
      // Filter out user's own trips
      const otherTrips = allTrips.filter(trip => trip.user_id !== user.id);
      
      // Get buddy IDs
      const buddies = await fetchBuddies();

      // Categorize trips and add owner info
      const tripsWithOwner: TripWithOwner[] = await Promise.all(
        otherTrips.map(async (trip) => {
          const isBuddyTrip = buddies.includes(trip.user_id);
          const ownerName = await getOwnerName(trip.user_id);
          return {
            ...trip,
            ownerName,
            isBuddyTrip,
          };
        })
      );

      // Sort: buddy trips first, then by start_date descending
      const sortedTrips = tripsWithOwner.sort((a, b) => {
        if (a.isBuddyTrip !== b.isBuddyTrip) {
          return a.isBuddyTrip ? -1 : 1;
        }
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });

      setTrips(sortedTrips);
    } catch (error) {
      console.error('[Feed] Error fetching feed trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const searchTrips = async () => {
    if (!user || !searchTerm.trim()) {
      setSearching(false);
      return;
    }

    try {
      const trimmedSearch = searchTerm.trim().toLowerCase();
      if (trimmedSearch.length === 0) {
        await fetchFeedTrips();
        setSearching(false);
        return;
      }

      // Get all trips
      const allTrips = await TripService.getAllTrips();

      // Filter out user's own trips
      const otherTrips = allTrips.filter(trip => trip.user_id !== user.id);

      // Get buddy IDs
      const buddies = await fetchBuddies();

      // Filter trips by destination (city or country match)
      const filteredTrips: TripWithOwner[] = await Promise.all(
        otherTrips
          .filter(trip =>
            trip.destination.toLowerCase().includes(trimmedSearch)
          )
          .map(async (trip) => {
            const isBuddyTrip = buddies.includes(trip.user_id);
            const ownerName = await getOwnerName(trip.user_id);
            return {
              ...trip,
              ownerName,
              isBuddyTrip,
            };
          })
      );

      // Sort: buddy trips first, then by start_date descending
      const sortedTrips = filteredTrips.sort((a, b) => {
        if (a.isBuddyTrip !== b.isBuddyTrip) {
          return a.isBuddyTrip ? -1 : 1;
        }
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });

      setTrips(sortedTrips);
    } catch (error) {
      console.error('[Feed] Error searching trips:', error);
      setTrips([]);
    } finally {
      setSearching(false);
    }
  };

  return {
    trips,
    loading,
    searching,
    searchTerm,
    setSearchTerm,
    buddyIds,
  };
};
