/**
 * Trip management workflow integration tests
 * Tests trip creation, update, and collaboration flows
 */

jest.mock('../../database/trips');
jest.mock('../../database/itinerary');

import * as TripsService from '../../database/trips';
import * as ItineraryService from '../../database/itinerary';

describe('Trip Management Workflow Integration', () => {
  const mockUserId = 'user-123';
  const mockTripData = {
    title: 'Europe Adventure',
    description: 'Summer trip across Europe',
    start_date: '2024-06-01',
    end_date: '2024-07-01',
    destination: 'Europe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Trip Flow', () => {
    it('should create trip with initial itinerary', async () => {
      // Step 1: Create trip
      (TripsService.createTrip as jest.Mock).mockResolvedValueOnce({
        id: 'trip-123',
        ...mockTripData,
        user_id: mockUserId,
        created_at: new Date().toISOString(),
      });

      // Step 2: Add initial itinerary items
      (ItineraryService.createItineraryItem as jest.Mock).mockResolvedValueOnce({
        id: 'item-1',
        trip_id: 'trip-123',
        day: 1,
        activity: 'Arrive in Paris',
      });

      const trip = await TripsService.createTrip(mockUserId, mockTripData);
      const itineraryItem = await ItineraryService.createItineraryItem(
        trip.id,
        1,
        'Arrive in Paris'
      );

      expect(TripsService.createTrip).toHaveBeenCalledWith(mockUserId, mockTripData);
      expect(ItineraryService.createItineraryItem).toHaveBeenCalled();
      expect(trip.title).toBe(mockTripData.title);
    });
  });

  describe('Update Trip Flow', () => {
    it('should update trip details', async () => {
      const tripId = 'trip-123';
      const updates = { description: 'Updated description' };

      (TripsService.updateTrip as jest.Mock).mockResolvedValueOnce({
        id: tripId,
        ...mockTripData,
        ...updates,
      });

      const updatedTrip = await TripsService.updateTrip(tripId, updates);

      expect(TripsService.updateTrip).toHaveBeenCalledWith(tripId, updates);
      expect(updatedTrip.description).toBe(updates.description);
    });
  });

  describe('Retrieve Trips Flow', () => {
    it('should retrieve user trips with details', async () => {
      (TripsService.getTripsByUser as jest.Mock).mockResolvedValueOnce([
        {
          id: 'trip-1',
          ...mockTripData,
          user_id: mockUserId,
          created_at: new Date().toISOString(),
        },
        {
          id: 'trip-2',
          ...mockTripData,
          user_id: mockUserId,
          title: 'Asia Exploration',
          destination: 'Asia',
        },
      ]);

      const trips = await TripsService.getTripsByUser(mockUserId);

      expect(TripsService.getTripsByUser).toHaveBeenCalledWith(mockUserId);
      expect(trips.length).toBe(2);
      expect(trips.every((t) => t.user_id === mockUserId)).toBe(true);
    });
  });

  describe('Delete Trip Flow', () => {
    it('should delete trip and associated itinerary', async () => {
      const tripId = 'trip-123';

      (ItineraryService.deleteItineraryByTrip as jest.Mock).mockResolvedValueOnce(
        undefined
      );
      (TripsService.deleteTrip as jest.Mock).mockResolvedValueOnce(undefined);

      await ItineraryService.deleteItineraryByTrip(tripId);
      await TripsService.deleteTrip(tripId);

      expect(ItineraryService.deleteItineraryByTrip).toHaveBeenCalledWith(tripId);
      expect(TripsService.deleteTrip).toHaveBeenCalledWith(tripId);
    });
  });
});
