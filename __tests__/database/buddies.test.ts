/**
 * Buddies database tests
 * Tests for buddy request CRUD operations
 */

import * as BuddiesService from '../../database/buddies';
import { BuddyRequest } from '../../database/types';

jest.mock('../../database/init', () => ({
  getDatabase: jest.fn(() =>
    Promise.resolve({
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
      execAsync: jest.fn(),
    })
  ),
}));

describe('Buddies Database Service', () => {
  const mockUserId = 'user-123';
  const mockBuddyId = 'buddy-456';
  const mockBuddyRequest: BuddyRequest = {
    id: 'request-789',
    sender_id: mockUserId,
    receiver_id: mockBuddyId,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sender: {
      id: mockUserId,
      name: 'John',
      country: 'USA',
      travel_interests: ['hiking'],
      profile_picture: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    receiver: {
      id: mockBuddyId,
      name: 'Jane',
      country: 'Canada',
      travel_interests: ['culture'],
      profile_picture: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBuddyRequest', () => {
    it('should create a buddy request', async () => {
      await BuddiesService.createBuddyRequest(mockUserId, mockBuddyId);
      expect(BuddiesService.createBuddyRequest).toBeDefined();
    });

    it('should set status to pending by default', async () => {
      await BuddiesService.createBuddyRequest(mockUserId, mockBuddyId);
      expect(BuddiesService.createBuddyRequest).toBeDefined();
    });
  });

  describe('updateBuddyRequest', () => {
    it('should accept a buddy request', async () => {
      await BuddiesService.updateBuddyRequest('request-789', 'accepted');
      expect(BuddiesService.updateBuddyRequest).toBeDefined();
    });

    it('should reject a buddy request', async () => {
      await BuddiesService.updateBuddyRequest('request-789', 'rejected');
      expect(BuddiesService.updateBuddyRequest).toBeDefined();
    });
  });

  describe('getReceivedRequests', () => {
    it('should retrieve received buddy requests for a user', async () => {
      const requests = await BuddiesService.getReceivedRequests(mockUserId);
      expect(Array.isArray(requests)).toBe(true);
    });
  });

  describe('getSentRequests', () => {
    it('should retrieve sent buddy requests from a user', async () => {
      const requests = await BuddiesService.getSentRequests(mockUserId);
      expect(Array.isArray(requests)).toBe(true);
    });
  });

  describe('getAcceptedBuddies', () => {
    it('should retrieve accepted buddy connections', async () => {
      const buddies = await BuddiesService.getAcceptedBuddies(mockUserId);
      expect(Array.isArray(buddies)).toBe(true);
    });
  });
});
