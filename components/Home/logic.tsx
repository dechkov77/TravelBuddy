import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as ProfileService from '../../database/profiles';
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
        const [travelersCount, tripsCount] = await Promise.all([
          ProfileService.getProfileCount(),
          TripService.getTripCount(),
        ]);

        setStats({
          travelers: travelersCount,
          trips: tripsCount,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleExplore = () => {
    onNavigate('explore');
  };

  const handleTrips = () => {
    onNavigate('trips');
  };

  const handleAuth = () => {
    // This will be handled by the parent navigator
  };

  return {
    user,
    stats,
    handleExplore,
    handleTrips,
    handleAuth,
  };
};
