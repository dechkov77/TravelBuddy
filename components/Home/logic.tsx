import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as BuddyService from '../../database/buddies';
import * as TripService from '../../database/trips';
interface UseHomeLogicProps {
  onNavigate: (screen: 'home' | 'explore' | 'trips' | 'buddies' | 'profile') => void;
}
export const useHomeLogic = ({ onNavigate }: UseHomeLogicProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ travelers: 0, trips: 0 });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user) {
          setStats({ travelers: 0, trips: 0 });
          return;
        }
        const buddies = await BuddyService.getBuddyRequestWithProfiles(user.id, 'accepted');
        const buddyCount = buddies.length;
        const userTrips = await TripService.getTripsByUserId(user.id);
        const tripCount = userTrips.length;
        setStats({
          travelers: buddyCount,
          trips: tripCount,
        });
      } catch (error) {
        setStats({ travelers: 0, trips: 0 });
      }
    };
    fetchStats();
  }, [user]);
  const handleExplore = () => {
    onNavigate('explore');
  };
  const handleTrips = () => {
    onNavigate('trips');
  };
  const handleAuth = () => {
  };
  return {
    user,
    stats,
    handleExplore,
    handleTrips,
    handleAuth,
  };
};