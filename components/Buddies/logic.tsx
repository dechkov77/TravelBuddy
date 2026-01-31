import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import * as BuddyService from '../../database/buddies';
import { Profile } from '../../database/types';

export interface BuddyRequest {
  id: string;
  status: string;
  created_at: string;
  sender: Profile | null;
  receiver: Profile | null;
}

export const useBuddiesLogic = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'buddies'>('received');
  const [received, setReceived] = useState<BuddyRequest[]>([]);
  const [sent, setSent] = useState<BuddyRequest[]>([]);
  const [accepted, setAccepted] = useState<BuddyRequest[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    fetchBuddyRequests();
  }, [user]);

  const fetchBuddyRequests = async () => {
    if (!user) return;
    try {
      const [receivedData, sentData, acceptedData] = await Promise.all([
        BuddyService.getBuddyRequestWithProfiles(user.id, 'received'),
        BuddyService.getBuddyRequestWithProfiles(user.id, 'sent'),
        BuddyService.getBuddyRequestWithProfiles(user.id, 'accepted'),
      ]);

      setReceived(receivedData);
      setSent(sentData);
      setAccepted(acceptedData);
    } catch (error) {
      console.error('Error fetching buddy requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user) return { success: false, error: 'User not found' };
    setProcessing(requestId);
    try {
      await BuddyService.updateBuddyRequestStatus(requestId, status);
      // Refresh the buddy requests list
      await fetchBuddyRequests();
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update request' };
    } finally {
      setProcessing(null);
    }
  };

  return {
    loading,
    activeTab,
    setActiveTab,
    received,
    sent,
    accepted,
    processing,
    handleRequest,
  };
};
