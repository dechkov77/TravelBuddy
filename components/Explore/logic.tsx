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
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        setSearching(true);
        searchProfiles();
      } else {
        setSearching(false);
        fetchProfiles();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, user?.id]);
  const fetchProfiles = async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    try {
      let data = await ProfileService.getAllProfiles(user.id);
      data = data.filter(profile => profile.id !== user.id);
      setProfiles(data);
      await checkBuddyStatuses(data.map(p => p.id));
    } catch (error) {
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
          try {
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
          } catch (err) {
            statuses[profileId] = 'none';
          }
        })
      );
      setBuddyStatuses(statuses);
    } catch (error) {
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
      let data = await ProfileService.searchProfiles(trimmedSearch, user.id);
      data = data.filter(profile => profile.id !== user.id);
      setProfiles(data);
      await checkBuddyStatuses(data.map(p => p.id));
    } catch (error) {
      setProfiles([]);
    } finally {
      setSearching(false);
    }
  };
  const sendBuddyRequest = async (receiverId: string) => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    setSendingRequest(receiverId);
    try {
      const existing = await BuddyService.checkBuddyRequestExists(user.id, receiverId);
      if (existing) {
        const errorMsg = existing.status === 'accepted' 
          ? 'You are already buddies with this user' 
          : 'You already have a pending buddy request with this user';
        setBuddyStatuses(prev => ({ 
          ...prev, 
          [receiverId]: existing.status === 'accepted' ? 'buddy' : 'pending'
        }));
        return {
          success: false,
          error: errorMsg,
        };
      }
      const requestId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await BuddyService.createBuddyRequest(requestId, user.id, receiverId);
      setBuddyStatuses(prev => ({ ...prev, [receiverId]: 'pending' }));
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send buddy request' };
    } finally {
      setSendingRequest(null);
    }
  };
  const removeBuddy = async (buddyId: string) => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    setSendingRequest(buddyId);
    try {
      await BuddyService.removeBuddy(user.id, buddyId);
      setBuddyStatuses(prev => ({ ...prev, [buddyId]: 'none' }));
      await checkBuddyStatuses(profiles.map(p => p.id));
      return { success: true, error: null };
    } catch (error: any) {
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