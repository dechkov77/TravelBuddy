import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import * as ProfileService from '../../database/profiles';
import * as BuddyService from '../../database/buddies';
import { Profile } from '../../database/types';

export const useExploreLogic = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [buddyStatuses, setBuddyStatuses] = useState<Record<string, 'buddy' | 'pending' | 'none'>>({});
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    fetchProfiles();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Debounce search with 500ms delay
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        // Show loading only for search, not for clearing
        setSearching(true);
        searchProfiles();
      } else {
        // When search is cleared, show all profiles without reload
        setSearching(false);
        fetchProfiles();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user?.id]);

  const fetchProfiles = async () => {
    if (!user) return;
    try {
      const data = await ProfileService.getAllProfiles(user.id);
      setProfiles(data);
      // Check buddy status for each profile
      await checkBuddyStatuses(data.map(p => p.id));
    } catch (error) {
      console.error('[Explore] Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBuddyStatuses = async (profileIds: string[]) => {
    if (!user) return;
    try {
      const statuses: Record<string, 'buddy' | 'pending' | 'none'> = {};
      await Promise.all(
        profileIds.map(async (profileId) => {
          const existing = await BuddyService.checkBuddyRequestExists(user.id, profileId);
          if (existing) {
            if (existing.status === 'accepted') {
              statuses[profileId] = 'buddy';
            } else {
              statuses[profileId] = 'pending';
            }
          } else {
            statuses[profileId] = 'none';
          }
        })
      );
      setBuddyStatuses(statuses);
    } catch (error) {
      console.error('[Explore] Error checking buddy statuses:', error);
    }
  };

  const searchProfiles = async () => {
    if (!user || !searchTerm.trim()) {
      setSearching(false);
      return;
    }
    try {
      const trimmedSearch = searchTerm.trim();
      if (trimmedSearch.length === 0) {
        await fetchProfiles();
        setSearching(false);
        return;
      }
      const data = await ProfileService.searchProfiles(trimmedSearch, user.id);
      setProfiles(data);
      // Check buddy status for search results
      await checkBuddyStatuses(data.map(p => p.id));
    } catch (error) {
      console.error('[Explore] Error searching profiles:', error);
      setProfiles([]);
    } finally {
      setSearching(false);
    }
  };

  const sendBuddyRequest = async (receiverId: string) => {
    console.log('[Explore] sendBuddyRequest called with receiverId:', receiverId);
    if (!user) {
      console.error('[Explore] sendBuddyRequest: No user found');
      return { success: false, error: 'User not found' };
    }
    console.log('[Explore] Sending request from user:', user.id, 'to receiver:', receiverId);
    setSendingRequest(receiverId);

    try {
      // Check if request already exists
      console.log('[Explore] Checking if request already exists...');
      const existing = await BuddyService.checkBuddyRequestExists(user.id, receiverId);
      console.log('[Explore] Existing request check result:', existing);
      if (existing) {
        console.log('[Explore] Request already exists, returning error');
        return {
          success: false,
          error: 'You already have a buddy request with this user',
        };
      }

      const requestId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('[Explore] Creating new buddy request with ID:', requestId);
      await BuddyService.createBuddyRequest(requestId, user.id, receiverId);
      console.log('[Explore] Buddy request created successfully');
      // Update buddy status
      setBuddyStatuses(prev => ({ ...prev, [receiverId]: 'pending' }));
      return { success: true, error: null };
    } catch (error: any) {
      console.error('[Explore] Error sending buddy request:', error);
      console.error('[Explore] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      return { success: false, error: error.message || 'Failed to send buddy request' };
    } finally {
      setSendingRequest(null);
    }
  };

  const removeBuddy = async (buddyId: string) => {
    console.log('[Explore] removeBuddy called with buddyId:', buddyId);
    if (!user) {
      console.error('[Explore] removeBuddy: No user found');
      return { success: false, error: 'User not found' };
    }
    setSendingRequest(buddyId);

    try {
      // Find the buddy request
      const existing = await BuddyService.checkBuddyRequestExists(user.id, buddyId);
      if (existing && existing.status === 'accepted') {
        // Delete the buddy relationship
        await BuddyService.updateBuddyRequestStatus(existing.id, 'rejected');
        console.log('[Explore] Buddy removed successfully');
        // Update buddy status
        setBuddyStatuses(prev => ({ ...prev, [buddyId]: 'none' }));
        return { success: true, error: null };
      } else {
        return { success: false, error: 'Buddy relationship not found' };
      }
    } catch (error: any) {
      console.error('[Explore] Error removing buddy:', error);
      return { success: false, error: error.message || 'Failed to remove buddy' };
    } finally {
      setSendingRequest(null);
    }
  };

  return {
    profiles,
    loading,
    searching,
    searchTerm,
    setSearchTerm,
    sendingRequest,
    sendBuddyRequest,
    removeBuddy,
    buddyStatuses,
  };
};
