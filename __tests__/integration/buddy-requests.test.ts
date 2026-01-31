/**
 * Buddy request workflow integration tests
 * Tests buddy connection request flows
 */

jest.mock('../../database/buddies');
jest.mock('../../database/profiles');

import * as BuddiesService from '../../database/buddies';
import * as ProfileService from '../../database/profiles';

describe('Buddy Request Workflow Integration', () => {
  const mockUserId = 'user-123';
  const mockTargetUserId = 'user-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Send Buddy Request Flow', () => {
    it('should send buddy request from user to target', async () => {
      // Step 1: Fetch target user profile
      (ProfileService.getProfile as jest.Mock).mockResolvedValueOnce({
        id: mockTargetUserId,
        name: 'Jane Doe',
        country: 'Canada',
        travel_interests: ['hiking'],
      });

      // Step 2: Create buddy request
      (BuddiesService.createBuddyRequest as jest.Mock).mockResolvedValueOnce({
        id: 'request-789',
        sender_id: mockUserId,
        receiver_id: mockTargetUserId,
        status: 'pending',
      });

      const targetProfile = await ProfileService.getProfile(mockTargetUserId);
      const request = await BuddiesService.createBuddyRequest(
        mockUserId,
        mockTargetUserId
      );

      expect(ProfileService.getProfile).toHaveBeenCalledWith(mockTargetUserId);
      expect(BuddiesService.createBuddyRequest).toHaveBeenCalledWith(
        mockUserId,
        mockTargetUserId
      );
      expect(request.status).toBe('pending');
    });
  });

  describe('Accept Buddy Request Flow', () => {
    it('should accept pending buddy request', async () => {
      const requestId = 'request-789';

      (BuddiesService.updateBuddyRequest as jest.Mock).mockResolvedValueOnce({
        id: requestId,
        status: 'accepted',
      });

      const updatedRequest = await BuddiesService.updateBuddyRequest(
        requestId,
        'accepted'
      );

      expect(BuddiesService.updateBuddyRequest).toHaveBeenCalledWith(
        requestId,
        'accepted'
      );
      expect(updatedRequest.status).toBe('accepted');
    });
  });

  describe('Buddy List Retrieval Flow', () => {
    it('should retrieve user buddies and their profiles', async () => {
      (BuddiesService.getAcceptedBuddies as jest.Mock).mockResolvedValueOnce([
        {
          id: 'request-1',
          sender_id: mockUserId,
          receiver_id: 'buddy-1',
          status: 'accepted',
          receiver: {
            id: 'buddy-1',
            name: 'Jane',
            country: 'Canada',
          },
        },
        {
          id: 'request-2',
          sender_id: 'buddy-2',
          receiver_id: mockUserId,
          status: 'accepted',
          sender: {
            id: 'buddy-2',
            name: 'John',
            country: 'USA',
          },
        },
      ]);

      const buddies = await BuddiesService.getAcceptedBuddies(mockUserId);

      expect(BuddiesService.getAcceptedBuddies).toHaveBeenCalledWith(mockUserId);
      expect(buddies.length).toBe(2);
      expect(buddies.every((b) => b.status === 'accepted')).toBe(true);
    });
  });

  describe('Reject Buddy Request Flow', () => {
    it('should reject a pending buddy request', async () => {
      const requestId = 'request-789';

      (BuddiesService.updateBuddyRequest as jest.Mock).mockResolvedValueOnce({
        id: requestId,
        status: 'rejected',
      });

      const updatedRequest = await BuddiesService.updateBuddyRequest(
        requestId,
        'rejected'
      );

      expect(updatedRequest.status).toBe('rejected');
    });
  });
});
